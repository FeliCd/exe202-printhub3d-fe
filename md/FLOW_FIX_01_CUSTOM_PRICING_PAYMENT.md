# Flow 01 — Sửa giá custom và thanh toán từ backend đến frontend

Ngày: 26/10/2026. Đây là đặc tả sửa lỗi dựa trên mã nguồn hiện tại, chưa phải thay đổi đã triển khai hay kết quả kiểm thử runtime.

Phạm vi: khách tự gửi giá custom được coi là báo giá; checkout cha PENDING_QUOTE vẫn thanh toán được; payment cha tự đánh dấu mọi con đã trả tiền. Bao gồm retry, link cũ, webhook và các giao diện tạo custom để không còn đường bỏ qua báo giá.

## 1. Các tài liệu phải đọc cùng

- [Phương án tách giỏ và order](./PLAN_SPLIT_MARKETPLACE_CUSTOM_CART_ORDER.md).
- [02 — Tồn kho, checkout, hủy](./FLOW_FIX_02_INVENTORY_CHECKOUT_CANCEL.md): chủ sở hữu logic reservation và hoàn tồn.
- [03 — Trạng thái admin](./FLOW_FIX_03_ADMIN_ORDER_STATUS.md): chủ sở hữu bảng chuyển tiến trình/allowedActions.
- [05 — Hợp đồng giá bulk/custom](./FLOW_FIX_05_BULK_QUOTE_PRICING.md): chủ sở hữu ý nghĩa các trường giá và công thức tính.

Không tạo lại luồng checkout trộn cho đơn mới. Trang giỏ có hai tab từ cùng nguồn state/persistence với popup; nút vào trang trên menu, các nút mở popup/nội dung popup hiện tại giữ nguyên. Các model/endpoint mới bên dưới là đề xuất, không phải API đã tồn tại.

## 2. Lỗi hiện tại và chuỗi gây lỗi

Các đường BE tương đối với `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE tương đối với `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí | Hành vi hiện tại | Vì sao chưa an toàn |
| --- | --- | --- |
| BE `service/impl/CartServiceImpl.updateCart`, `updateCartItem` | Lưu customPrice do khách gửi | Dữ liệu không có nguồn báo giá admin |
| BE `CheckoutOrderServiceImpl.createCheckoutOrder` | Dùng customPrice tính tổng, gán QUOTED và có thể CONFIRMED | Giá client biến thành giá được thanh toán |
| BE `PaymentServiceImpl.createPaymentLink`, nhánh CHECKOUT_ORDER | Chấp nhận CONFIRMED hoặc PENDING_QUOTE | Custom chưa có giá bị tính 0 vẫn có đường trả tiền |
| BE `PaymentServiceImpl.settle` | Payment cha đặt mọi con PAID | Không kiểm tra con bị hủy, thiếu quote hoặc đã trả riêng |
| BE `Payment.java`, `PaymentRepository` | Một Payment/đơn, transactionId/link có thể bị ghi đè khi tạo lại | Callback link cũ khó đối soát; không có lịch sử attempts |
| FE `features/cart/hooks/cartPayload.ts` | Gửi product.price thành customPrice | FE đang gửi dữ liệu có thể ảnh hưởng tiền |
| FE `pages/CustomOrderCheckoutPage.tsx` | Có estimate, discount/ship tính FE và thử payOrder sau tạo request | Luồng tạo yêu cầu bị trình bày như có thể trả tiền ngay |
| FE `pages/PaymentResultPage.tsx` | Query cancel phục hồi giỏ, verify thiếu dữ liệu vẫn có fallback | Browser có thể hiển thị kết quả không khớp tiền/đơn thật |

Chuỗi tái hiện suy ra từ code: thêm customPrice=1 → checkout coi custom đã có báo giá → tạo link theo tổng sai; hoặc tạo mixed checkout có custom chưa quote → gọi create-link cho cha → thanh toán marketplace+ship → tất cả custom con PAID. Chưa thực hiện giao dịch thật để tái hiện.

## 3. Bất biến sau sửa

1. Dữ liệu khách gửi không thể tạo/sửa giá chốt, QUOTED, ACCEPTED hay SUCCESS.
2. Custom mới luôn REQUESTED với quote chưa có; estimate không phải quote.
3. Chỉ ADMIN có thể phát hành quote hợp lệ, gắn đúng snapshot thiết kế, quantity, địa chỉ và version.
4. Chỉ chủ đơn được accept quote còn hạn, đúng version; nhận giá từ snapshot server, chọn COD/PAYOS.
5. Chỉ custom ACCEPTED + PAYOS + snapshot đã khóa mới được tạo link. REQUESTED/QUOTED không được tạo link.
6. Marketplace mới chỉ thanh toán snapshot Order của chính nó; không dùng một cha trộn hai loại.
7. Thông tin return/cancel từ browser không xác nhận tiền và không tự sửa fulfillment.
8. Webhook được xác minh ghi nhận tiền chính xác một lần; không kéo đơn về PAID, không hồi sinh đơn hủy.
9. Một đơn gắn một Payment aggregate và có nhiều PaymentAttempt có lịch sử. Không có hai nguồn thanh toán cha/con cùng thu cho một nghĩa vụ tiền.
10. Gateway HTTP không nằm trong transaction database giữ khóa.

## 4. Backend bước 1 — Chặn ngay các đường sai trước khi đổi UI

1. Sửa cart DTO/service: bỏ customPrice khỏi DTO ghi mới hoặc chỉ map vào estimate không có thẩm quyền. Không lấy estimate để gán quotedPrice/status khi tạo custom.
2. Sửa mọi điểm tạo custom: `createCustomOrder`, `createRequest`, tạo từ giỏ và legacy adapter cùng gọi validation chung; luôn REQUESTED, paymentMethod chưa chốt, chưa tạo Payment cần thu.
3. Cấm createPaymentLink cho CHECKOUT_ORDER ở PENDING_QUOTE. Chỉ sửa điều kiện status là chưa đủ: CONFIRMED cũ cũng có thể được tạo bằng customPrice; phải có chứng cứ quote/accept/snapshot hợp lệ trước khi mở thanh toán legacy.
4. Chặn endpoint tạo mới mixed checkout bằng feature flag/cutover. Client cũ nhận lỗi có hướng dẫn tải phiên bản mới, không âm thầm tạo hai đơn với giá chưa được xác nhận.
5. Chặn create-link ORDER/CUSTOM_ORDER có checkoutOrderId nếu nghĩa vụ tiền còn thuộc cha legacy. Không cho khách trả lại một phần bằng API con.
6. Thay nhánh settle cha vô điều kiện bằng đường kiểm tra allocation legacy tại mục 10. Không set PAID trên từng con theo vòng lặp không guard.
7. Cập nhật DTO/OpenAPI `paymentOption`: hiện service chỉ hỗ trợ FULL thì hợp đồng cũng chỉ FULL; không còn quảng bá DEPOSIT khi chưa có triển khai đặt cọc.

Phải giữ webhook/verify phục vụ link cũ trong giai đoạn này, không tắt nhận thông báo vì đã chặn tạo link mới.

## 5. Backend bước 2 — Snapshot giá và mô hình thanh toán

### 5.1. Nguồn số tiền duy nhất

CustomQuoteSnapshot theo file 05: quoteId, quoteVersion, requestVersion, quantity, unitPrice, lineSubtotal, adjustmentAmount/reason, discountAmount, shippingFee, grandTotal, currency, validUntil, quotedBy, acceptedAt và hash dữ liệu ảnh hưởng tiền.

Khi accept, CustomOrder tham chiếu acceptedQuoteId và bản giá không sửa được. Payment.amount/expectedAmount bằng **grandTotal**, không phải unitPrice và không nhân thêm quantity.

Marketplace có pricing snapshot riêng từ preview/checkout server: items, quantity, unitPrice, phí giao, ưu đãi và grandTotal. FE không quyết định tổng bằng tham số customAmount.

Tiền VND: dùng BigDecimal/số nguyên có kiểm tra scale/range, thống nhất làm tròn tại bước tính server; không làm tròn khác nhau lần nữa khi tạo gateway link. Không hỗ trợ tổng 0 trong luồng PAYOS hiện tại; nếu cần đơn miễn phí phải có quy trình riêng, không fake payment SUCCESS.

### 5.2. Payment aggregate và PaymentAttempt

Khi triển khai [mua subscription bằng tiền theo flow 08](./FLOW_FIX_08_SUBSCRIPTION_CASH_PURCHASE.md), mở rộng nhóm đích XOR bên dưới thêm subscriptionPurchaseId và loại SUBSCRIPTION_PURCHASE. Đây là cùng Payment aggregate/attempt, không phải một payment engine thứ hai. Constraint và dispatcher phải được migrate đồng bộ để giữ các đích order/legacy đang có.

```text
Payment                         một aggregate cho một nghĩa vụ thanh toán
  id, version
  orderId XOR customOrderId XOR legacyCheckoutOrderId
  snapshotId, expectedAmount, currency=VND
  method=PAYOS|COD
  status=NONE|PENDING|SUCCESS|FAILED|CANCELLED|EXPIRED|REFUND_PENDING|REFUNDED
  reconciliationStatus=NONE|REQUIRED|RESOLVED
  receivedAmount, appliedAmount, paidAt

PaymentAttempt                  một lần làm việc với gateway
  id, paymentId, version
  provider, unique gatewayOrderCode
  idempotencyKey, requestHash
  snapshotId, expectedAmount, currency
  state=CREATING|PENDING|SUCCESS|FAILED|CANCELLED|EXPIRED|UNKNOWN
  checkoutUrl, expiresAt, gatewayTransactionRef, verifiedAt

PaymentEvent / receipt evidence
  provider + providerEventKey/transactionRef có unique phù hợp
  attemptId, verifiedAmount, currency, verifiedAt
  source=WEBHOOK|VERIFY, result, reconciliationReason
```

- Dùng CHECK constraint bảo đảm đúng một đối tượng thanh toán; unique theo nghĩa vụ tiền. Giữ Payment hiện có làm aggregate nếu phù hợp, thêm bảng attempts; không tạo hai model aggregate trùng ý nghĩa.
- Một active attempt cho một Payment bằng partial unique index nếu DB hỗ trợ hoặc claim dưới khóa Payment. Không chỉ dựa vào kiểm tra exists trước insert.
- Gateway code/transaction reference có unique index phù hợp. Đừng coi mọi event của một attempt là một event duy nhất nếu gateway gửi nhiều loại sự kiện; khóa chống ghi nhận cùng một khoản tiền phải dựa vào transaction/receipt ổn định.
- raw payload/log phải loại dữ liệu bí mật, không log token/API key. Migration không đổi thông tin giao dịch đã nhận.
- SUCCESS là tiền được xác minh đủ cho nghĩa vụ tiền. Các khoản nhận sai số tiền/tiền dư lưu receipt và reconciliation, không ép số tiền vào expectedAmount cho khớp.

## 6. Backend bước 3 — Luồng quote → accept → tạo link

### 6.1. Quote và accept

1. ADMIN quote REQUESTED/QUOTED dưới khóa CustomOrder và version, tính snapshot theo file 05.
2. Khách mở chi tiết; server trả quoteVersion, requestVersion, hạn và tổng.
3. Accept tra idempotency key trước kiểm tra version/trạng thái. Cùng key/hash đã hoàn tất trả kết quả cũ; key khác payload trả conflict.
4. Với thao tác mới, kiểm tra owner, QUOTED, version/hạn, hash design/quantity/address; lưu acceptedQuoteId, ACCEPTED, paymentMethod và Payment PENDING trong một transaction.
5. Thông báo sau commit. Tạo link là bước riêng có thể retry; lỗi gateway không làm mất việc accept hoặc tạo lại yêu cầu custom.

### 6.2. Create-link hai pha

Ranh giới Spring bắt buộc: `PaymentServiceImpl` hiện có `@Transactional` ở cấp class. Phải tách orchestration không có transaction bao ngoài ra một service, và đặt các pha database vào collaborator được gọi qua Spring proxy hoặc `TransactionTemplate` rõ ràng. Chỉ chia cùng class thành các hàm A/B/C rồi tự gọi (`this.method`) hoặc thêm annotation private method không tạo ranh giới transaction mong muốn; gateway vẫn có thể nằm dưới transaction ngoài. Rà tương tự ở verify/cancel/expire và các caller đang có transaction để bảo đảm pha HTTP thực sự chạy khi không giữ khóa DB.

```text
A. Transaction ngắn:
   lookup/claim idempotency(user, CREATE_PAYMENT_LINK, key, requestHash)
   discover target -> lock business root -> lock Payment -> attempts
   validate owner, PAYOS, immutable snapshot, payable status, deadline
   reuse pending attempt còn hiệu lực nếu đã xác nhận có thể dùng
   hoặc tạo attempt CREATING + gatewayOrderCode ổn định; commit

B. Không giữ transaction:
   gọi gateway tạo/tra link bằng cùng gatewayOrderCode

C. Transaction ngắn:
   khóa lại theo cùng thứ tự
   nếu vẫn hợp lệ -> finalize PENDING/url/expiry, lưu response idempotent
   nếu bị hủy/đã nhận tiền -> không phát hành link như có thể thanh toán
   ghi yêu cầu đóng link/đối soát để worker xử lý ngoài transaction
```

- Timeout khi tạo link là kết quả chưa rõ, không đồng nghĩa gateway chưa tạo. Retry dùng cùng attempt/code, tra gateway để resolve; không tạo mã mới ngay.
- Gateway lỗi tra link cũ không cho phép bỏ qua rồi tạo attempt mới mất dấu link cũ.
- Hết hạn link khác hết hạn đơn: trước tạo link tiếp phải còn payable deadline/reservation theo file 02 và snapshot còn được phép thu.
- Custom đã accept có tổng khóa, hạn thanh toán mặc định đề xuất 24h; link 15 phút không được tự gia hạn deadline đơn.
- Chỉ cấu hình return/cancel URL ở server hoặc whitelist origin; browser không tự chỉ định miền bất kỳ để chuyển khách.

### 6.3. Thứ tự khóa chung với các flow khác

Order/CustomOrder root; với legacy là CheckoutOrder rồi các con theo ID ổn định → Payment → PaymentAttempt → InventoryReservation theo ID → Product theo UUID. Tra cứu không ghi để biết root được phép, sau đó phải đọc lại dưới khóa. Checkout mới claim idempotency rồi cart và các order mới chưa commit; không có đường existing-order giữ khóa rồi quay lại khóa cart.

## 7. Backend bước 4 — Webhook/verify và tiền đến trễ

1. Xác minh chữ ký/nguồn bằng SDK gateway cấu hình server. Event giả bị từ chối, không thay payment/order.
2. Tìm attempt bằng gatewayOrderCode; code chưa map do race với create cần lưu/đối soát và retry có kiểm soát, không gán tùy tiện theo ID browser.
3. Với verify do khách gọi: kiểm tra ownership và lấy gateway status ngoài transaction; kết quả browser truyền không phải receipt.
4. Trong transaction ngắn theo thứ tự khóa chung, deduplicate receipt/event; đối chiếu amount, currency nếu gateway cung cấp, merchant/attempt, snapshot và payment.
5. Ghi receipt xác thực; nếu đúng amount và fulfillment còn hợp lệ, cập nhật Payment SUCCESS, attempt SUCCESS, xác nhận reservation marketplace đúng một lần qua inventory service.
6. Không thay orderStatus thành PAID. Tiến trình vẫn PENDING/ACCEPTED/PREPARING...; allowedActions sẽ cho admin bắt đầu khi đủ điều kiện.
7. Nếu root CANCELLED/EXPIRED hoặc reservation đã RELEASED: vẫn ghi nhận tiền thực đã nhận, bật reconciliation, giữ nguyên fulfillment. Không tự lấy lại tồn và không phục hồi đơn.
8. Nếu receipt sai amount, quoteSnapshot không khớp hoặc đã có attempt khác thành công: lưu tiền thực và reason; không cộng lại appliedAmount/khởi động sản xuất. Trả trạng thái cần đối soát.
9. Commit rồi gửi thông báo qua outbox; webhook retry không gửi lại thông báo/thưởng vô hạn.

Một receipt hợp lệ đến cho đơn hủy không được làm throw rồi rollback mất dấu tiền. HTTP acknowledgment theo hợp đồng gateway và khả năng lưu bền: chỉ ACK đã xử lý khi event/receipt đã persist; lỗi hạ tầng chưa persist để gateway retry. Không giả định trường currency có sẵn nếu SDK response không trả; khi đó kiểm tra cấu hình merchant/currency và dữ liệu có thể xác minh.

## 8. Hợp đồng API giữa BE và FE

Các URL có prefix `/api`; API wrapper FE hiện tự thêm prefix. Payload là đề xuất cho luồng mới.

```json
POST /payments/create-link
{
  "orderType": "CUSTOM_ORDER",
  "orderId": "uuid-custom",
  "acceptedQuoteId": "uuid-snapshot",
  "idempotencyKey": "uuid-thao-tac"
}
```

Không có giá cuối do khách định nghĩa. Nếu còn customAmount trong API tương thích thì chỉ kiểm tra bằng snapshot hoặc từ chối field đó, tuyệt đối không override tổng server.

```json
{
  "code": 200,
  "result": {
    "paymentId": "uuid-payment",
    "attemptId": "uuid-attempt",
    "orderType": "CUSTOM_ORDER",
    "orderId": "uuid-custom",
    "snapshotId": "uuid-snapshot",
    "amount": 220000,
    "currency": "VND",
    "paymentStatus": "PENDING",
    "attemptState": "PENDING",
    "paymentLinkUrl": "https://gateway.example/checkout/code",
    "expiresAt": "2026-10-26T05:15:00Z"
  }
}
```

URL minh họa không phải URL gateway thật. Chỉ mở URL https/domain gateway được cấu hình. Verify trả cùng bộ định danh và thêm orderStatus, canRetry, reconciliationStatus, serverTime; không trả chỉ một status mơ hồ dùng chung cho payment và order.

| Lỗi đề xuất | HTTP | Hành vi FE |
| --- | --- | --- |
| QUOTE_REQUIRED / QUOTE_NOT_ACCEPTED | 409 | Mở chi tiết báo giá; không mở QR |
| QUOTE_VERSION_CONFLICT | 409 | Tải bản mới và chờ khách xác nhận |
| PAYMENT_NOT_ALLOWED / ORDER_CANCELLED | 409 | Dừng tạo link, tải đơn hiện tại |
| LEGACY_CHECKOUT_REVIEW_REQUIRED | 409 | Hiển thị cần kiểm tra đơn cũ, không trả riêng con |
| IDEMPOTENCY_CONFLICT | 409 | Không retry bằng key cũ với payload khác |
| PAYMENT_CREATION_IN_PROGRESS | 202 | Poll theo request/attemptId, không tạo order/attempt mới |
| GATEWAY_STATUS_UNKNOWN | 202/503 theo trạng thái đã lưu | Hiện đang đối chiếu, retry cùng operation |
| FORBIDDEN / UNAUTHENTICATED | 403/401 | Không hiển thị thông tin payment người khác |

## 9. Frontend sửa tuần tự

### 9.1. Giỏ và các màn tạo custom

1. `cartPayload.ts`: không serialize giá để backend dùng làm quote. Model FE phân biệt estimate và quote thay vì một product.price mơ hồ.
2. Shared `useCart` ở App giữ cùng items/revision/saving/error cho popup và trang. Không viết một giỏ trang riêng hoặc restore snapshot toàn bộ hai loại khi payment cancel.
3. `CartPage`: Marketplace gọi checkout riêng; Custom chỉ gửi báo giá. Không gọi `/checkout-orders` cho đơn mới; không chọn PAYOS ở bước custom draft.
4. `CustomOrderCheckoutPage`: chuyển CTA thành gửi yêu cầu, bỏ payOrder ngay sau tạo request và các câu hứa thanh toán estimate để in ngay. Giữ estimate nếu có với nhãn rõ.
5. Studio, upload, bulk cùng đi Custom REQUESTED; không giữ một đường tắt từ configurator/quantity>0 sang thanh toán.

### 9.2. Báo giá và thanh toán

1. `quotationService.ts`, CustomRequests và DTO thêm quoteVersion, acceptedQuoteId, pricing breakdown và canAccept/canPay từ server.
2. Khách accept một quote cụ thể, chọn method; disable nút khi pending, giữ idempotency key qua timeout.
3. Chỉ hiện “Thanh toán” khi canPay. FE guard hỗ trợ trải nghiệm, backend guard vẫn quyết định.
4. `paymentService.ts` chỉ FULL, nhận typed response/202; không gửi estimate/customAmount như yêu cầu thu tiền.
5. Tạo link lỗi hiển thị “Đã xác nhận báo giá, chưa tạo được liên kết”; giữ ID order và nút retry. Không gọi lại createCustomOrder.
6. Trang chi tiết là nơi tiếp tục thanh toán sau refresh, không chỉ giữ link trong state modal giỏ.

### 9.3. Kết quả payment

1. Query `status`, `cancel`, `orderCode` chỉ để định tuyến đối chiếu. Gọi verify bằng code và session hợp lệ.
2. Render rõ PENDING/SUCCESS/FAILED/CANCELLED/EXPIRED/RECONCILIATION_REQUIRED từ dữ liệu server; polling có giới hạn/backoff và nút kiểm tra lại.
3. Thiếu code/không có dữ liệu thì không hiện biên nhận mẫu, tiền 8.000đ, tên/mã giả hoặc điểm thưởng ước đoán.
4. Không tự PUT `/cart` từ backup hoặc hủy order dựa vào query cancel. Hủy là thao tác rõ ràng qua API riêng có guard.
5. Link “Xem đơn” đúng loại; “Thanh toán lại” chỉ khi canRetry, cùng order. Không thu lại phần đã SUCCESS.

## 10. Dữ liệu cũ và rollout

### 10.1. Phân loại trước khi migration

| Nhóm legacy | Xử lý |
| --- | --- |
| REQUESTED/PENDING_QUOTE chưa từng có payment | Khóa thanh toán; yêu cầu admin quote thật và khách accept hoặc chuyển draft an toàn |
| CONFIRMED/QUOTED được tạo từ cart customPrice | Không mặc định tin là admin đã quote; đánh dấu unverified, kiểm chứng nguồn |
| Có Payment/attempt đang pending | Backfill attempt từ transactionId/link/amount cũ; giữ mapping callback, verify trước khi đóng link |
| Đã nhận tiền và có chứng cứ snapshot đầy đủ | Giữ nguyên tiền/quote/đơn; không tính lại theo công thức mới rồi thu chênh |
| Có con hủy, thiếu quote, đã trả riêng hoặc tổng mâu thuẫn | Khóa thu tiếp và sản xuất chưa bắt đầu, chuyển đối soát có lý do |

### 10.2. Payment cha legacy

- Chỉ cho thu nếu có pricing snapshot/accept được xác minh, allocation từng con cố định, không con hủy và không payment con đã thu riêng. Tất cả phải được kiểm tra dưới root lock trước phát hành link.
- Khách hủy một con làm allocation cũ không còn đúng: không tự lấy phần tiền đó chia lại hoặc đặt mọi con SUCCESS. Khóa pending link/đối soát; lập tổng mới chỉ khi có quy trình được khách duyệt và không có giao dịch đang chưa rõ.
- Webhook tiền cha đến sau khi con hủy: persist receipt cha, reconciliation REQUIRED; không hồi sinh con và không phát hành khoản thu mới cho cùng phần tiền.
- Nếu snapshot/allocation không chứng minh được, chặn thu mới. Giữ đường xem/verify/đối soát của đơn cũ cho đến khi giải quyết.
- Các con hiển thị payment theo allocation/root legacy, không mặc định PENDING chỉ vì thiếu Payment riêng, và không tạo Payment con SUCCESS giả làm tăng tổng thu.

### 10.3. Trình tự phát hành

1. Hotfix guard BE chống giá client, PENDING_QUOTE và settle vô điều kiện.
2. Migration additive snapshot/attempt/event/version, unique constraints; kiểm tra database mục tiêu trước viết migration.
3. Deploy service quote/accept/pay/verify mới và contract file 02/03/05.
4. Deploy FE cùng typed contract, bỏ đường pay custom ngay; bật split-cart theo feature flag.
5. Theo dõi failed/unknown attempts, amount mismatch, late receipts và legacy cần đối soát; reconcile idempotent.
6. Chỉ dọn DTO/cột/endpoint legacy khi hết đơn/link đang hoạt động. Không rollback schema bằng cách xóa các attempt đã nhận tiền.

## 11. Kiểm thử cần viết và chạy khi triển khai

| Ca | Kỳ vọng |
| --- | --- |
| customPrice=1 hoặc quotedPrice/status giả từ khách | Custom vẫn REQUESTED, không quote/link/payment SUCCESS |
| PENDING_QUOTE cha / QUOTED chưa accept gọi create-link | Bị từ chối, không gọi gateway |
| CONFIRMED cũ nhưng không có chứng cứ giá admin | REVIEW_REQUIRED, không thu giá client |
| Accept stale/hết hạn/design đã đổi | 409, không tạo Payment payable |
| q=10, unitPrice=20.000, ship=20.000 | Link/receipt kỳ vọng 220.000, không nhân tổng thêm lần nữa |
| Hai create-link cùng key, hai key cùng Payment | Một active attempt hợp lệ; không tạo hai nghĩa vụ tiền |
| Gateway create timeout rồi retry | Resolve cùng attempt/code; không mất callback cũ |
| Webhook lặp + verify đồng thời | Một receipt áp dụng, một xác nhận reservation; không đổi fulfillment lùi |
| Canceled/expired nhận tiền muộn | Có receipt/đối soát, order vẫn terminal |
| Sai amount / attempt khác cũng nhận tiền | Không áp dụng sai snapshot; ghi tiền và đối soát |
| Cha có con canceled/đã thanh toán riêng | Không hồi sinh con/thu lại; giữ mapping tiền cũ |
| Browser sửa query success/cancel | Không xác nhận tiền/hủy order/ghi đè giỏ |
| Đổi tài khoản, code của người khác | 401/403, không lộ chi tiết |
| Popup/trang shared store | Cùng data; popup không đổi nội dung/nút mở |

Mock gateway để test guard/idempotency; integration với database mục tiêu kiểm tra unique/lock/race. Chỉ dùng sandbox gateway cho end-to-end, không gọi giao dịch thật để nghiệm thu.

## 12. Điều kiện hoàn thành

- [ ] Không API khách nào có thể quyết định quote, trạng thái trả tiền hoặc tổng cần thu.
- [ ] Custom mới luôn qua admin quote và khách accept version chính xác.
- [ ] Payment amount = snapshot grandTotal cho cả PAYOS/COD.
- [ ] Retry/timeout/link cũ/webhook lặp đều truy ra đúng attempt và không ghi nhận hai lần.
- [ ] PENDING_QUOTE không trả tiền được; legacy không đủ chứng cứ bị chặn/đối soát.
- [ ] Không có code webhook set mọi đơn con PAID hoặc kéo fulfillment đang xử lý về PAID.
- [ ] FE có đường tiếp tục thanh toán sau reload và không dựng biên nhận giả.
- [ ] Migration giữ được giao dịch cũ, popup và dữ liệu hai giỏ theo đúng tài liệu gốc.

Trường API tiến trình chuẩn của các flow mới là `orderStatus`, tách khỏi `paymentStatus`; nếu model nội bộ gọi fulfillmentStatus thì mapper phải xuất đúng hợp đồng chung. Các field `status` legacy giữ trong adapter tường minh, không để FE tự chọn giữa hai nguồn mâu thuẫn.

Chỉ viết tài liệu trong yêu cầu hiện tại; các test trên là kế hoạch nghiệm thu, chưa được chạy cho bản sửa.
