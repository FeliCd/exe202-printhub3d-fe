# Flow 02 — Sửa tồn kho, checkout/confirm lặp và hủy đơn từ BE đến FE

Ngày: 26/10/2026. Đây là đặc tả sửa lỗi, chưa thay đổi code tính năng hoặc chạy test cho bản sửa.

Phạm vi: checkout tự CONFIRMED bỏ qua kiểm tra/trừ tồn; gọi confirm nhiều lần trừ nhiều lần; hủy đơn không hoàn tồn; các race giữa hai khách mua, cancel, expire và webhook thanh toán.

## 1. Tài liệu liên quan và ranh giới

- [Kế hoạch tách giỏ](./PLAN_SPLIT_MARKETPLACE_CUSTOM_CART_ORDER.md): marketplace/custom tạo đơn độc lập, trang hai tab dùng chung dữ liệu/lưu/đồng bộ với popup. Nút mở trang trên menu, nút header mở popup và nội dung popup giữ nguyên.
- [01 — Giá và payment](./FLOW_FIX_01_CUSTOM_PRICING_PAYMENT.md): Payment aggregate, PaymentAttempt, verify/webhook, receipt/đối soát và gateway ngoài transaction.
- [03 — Trạng thái admin](./FLOW_FIX_03_ADMIN_ORDER_STATUS.md): guard tiến trình, COD/PAYOS, audit và thưởng điểm.
- [05 — Giá bulk/custom](./FLOW_FIX_05_BULK_QUOTE_PRICING.md): custom luôn báo giá, không phải marketplace stock.

Đơn mới đi checkout marketplace riêng, không tạo mixed CheckoutOrder. Đường confirm cha chỉ còn phục vụ legacy với guard chặt. Các bảng/API bổ sung là đề xuất cần triển khai, không coi là hiện đã tồn tại.

## 2. Bằng chứng và nguyên nhân hiện tại

Đường BE tương đối với `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE tương đối với `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí | Hành vi hiện tại | Lỗi phát sinh |
| --- | --- | --- |
| `service/impl/CheckoutOrderServiceImpl.createCheckoutOrder` | Tự đặt CONFIRMED cho marketplace-only/custom có giá và có thể tạo link ngay | Không qua kiểm tra/trừ tồn trong confirm |
| `CheckoutOrderServiceImpl.confirmCheckoutOrder` | Chỉ chặn CANCELLED, summaryVersion có thể bỏ; mỗi lần lại trừ stock | Retry/confirm sau xử lý vẫn có thể trừ thêm |
| `service/impl/OrderServiceImpl.createOrders` | Đọc Product bằng findById, tổng hợp quantity rồi trừ stock | Logic tổng hợp có nhưng không khóa product giữa hai khách |
| `OrderServiceImpl.updateOrderStatus`, nhánh CANCELLED | Đổi trạng thái/payment, không trả stock | Đơn hủy vẫn làm số lượng bán được bị giảm |
| `repository/ProductRepository.findLockedById` | Đã có PESSIMISTIC_WRITE | Những đường tạo/confirm đang không dùng thống nhất |
| `entity/Product.java` | Stock mutable, chưa có @Version | Read-modify-write đồng thời có thể mất cập nhật/bán vượt |
| `OrderRepository.findLockedById`, `CheckoutOrderRepository.findLockedById` | Có khóa root | Khóa hai checkout khác nhau không bảo vệ cùng Product |
| FE `pages/PaymentResultPage.tsx` | Có đường restore toàn giỏ từ backup và hủy theo query cancel | Không thể thay thế transaction hủy/hoàn tồn an toàn phía server |

Không thể sửa đủ bằng cách thêm một `stock += quantity` vào mọi nhánh hủy: có đơn hiện chưa từng trừ tồn, đơn có thể đã confirm nhiều lần hoặc tiền đang về. Cần biết chính xác đã giữ số lượng nào và đã release chưa.

## 3. Chốt ý nghĩa stock và reservation

### 3.1. Một cách hạch toán cho luồng mới

Chọn `Product.stock` là **số lượng còn bán được** (available stock). Không đổi qua lại giữa available và tổng hàng vật lý trong cùng hệ thống.

```text
Tạo reservation ACTIVE:
  Product.stock -= reservedQuantity       đúng một lần

ACTIVE -> CONFIRMED:
  Product.stock không đổi                 đã bị trừ khi giữ

ACTIVE -> RELEASED:
  Product.stock += reservedQuantity       đúng một lần

CONFIRMED -> hoàn/nhập lại hàng:
  không xử lý bằng cancel trước sản xuất
  cần quy trình hoàn/nhập hàng riêng có bằng chứng
```

Không trừ stock lần thứ hai ở webhook, confirm, PREPARING, SHIPPING hoặc COMPLETED. Không cộng stock chỉ vì browser quay về trang cancel.

### 3.2. Thời điểm chuyển trạng thái reservation

| Trường hợp | Reservation |
| --- | --- |
| Tạo Order PAYOS thành công, chờ tiền | ACTIVE, có expiresAt theo deadline order |
| Payment PAYOS SUCCESS hợp lệ | ACTIVE → CONFIRMED, không trừ thêm |
| Tạo Order COD đã được khách xác nhận | ACTIVE, chưa có hạn 15 phút của PAYOS |
| Admin bắt đầu PREPARING COD | ACTIVE → CONFIRMED, không trừ thêm |
| Hủy hợp lệ khi chưa trả/chưa xử lý | ACTIVE → RELEASED, cộng lại đúng một lần |
| Hết hạn PAYOS, gateway xác nhận chưa thu và đóng attempt an toàn | ACTIVE → RELEASED |
| Đơn đã trả tiền/đã xử lý/đã giao | Không tự release bằng flow hủy đơn giản |
| Custom REQUESTED/QUOTED/ACCEPTED | Không tạo reservation Product marketplace |

Sự xác nhận COD của khách khác với trạng thái reservation CONFIRMED. COD PENDING chưa PREPARING vẫn giữ ACTIVE để hủy trước xử lý có thể release an toàn. Mặc định đề xuất order PAYOS chờ tiền giữ tồn 15 phút; đây là cấu hình backend, UI đọc deadline server. Link tạo lại không gia hạn giữ tồn vô hạn.

### 3.3. Bảng đề xuất

```text
InventoryReservation
  id, version
  orderId, productId
  quantity
  state=ACTIVE|CONFIRMED|RELEASED
  reservedAt, confirmedAt, releasedAt, expiresAt
  source=CHECKOUT|LEGACY_VERIFIED
  releaseReason, operationId
  UNIQUE(orderId, productId)

InventoryMovement
  id, reservationId, operationType=RESERVE|RELEASE
  delta, availableAfter, actor/operationId, createdAt
  UNIQUE(reservationId, operationType)
```

Một reservation tổng hợp số lượng cùng product trong một order, kể cả có nhiều dòng biến thể. Nếu sau này quản lý stock theo SKU thì thay key bằng inventoryItemId/SKU có mô hình riêng; không giả định màu đã có stock riêng khi hiện chỉ có Product.stock.

Thêm CHECK quantity>0, Product.stock>=0 và version/ràng buộc phù hợp database mục tiêu. Reservation/ledger và stock phải cùng transaction; unique chỉ là lớp bảo vệ, service vẫn phải khóa và kiểm tra state. Không tạo ledger RESERVE từ dữ liệu cũ chỉ để làm đẹp lịch sử nếu không có chứng cứ đã trừ tồn.

## 4. Backend bước 1 — Inventory service dùng chung và thứ tự khóa

### 4.1. Service đề xuất

```text
reserveForNewOrders(orderItems, operationId)
confirmReservation(orderId, paymentOrCodEvidence)
releaseActiveReservations(orderId, reason, operationId)
getReservationProjection(orderId)
```

Mọi đường tạo đơn, confirm legacy, cancel, webhook, admin PREPARING và expire job gọi cùng service. Không còn các phép `setStock(...)` rải rác với quy tắc khác nhau.

Phương án chính: khóa PESSIMISTIC_WRITE qua ProductRepository trước đọc/ghi; khóa products theo UUID tăng dần để nhiều order giữ cùng thứ tự. Giữ mọi thao tác trong transaction ngắn. Nếu đổi sang conditional SQL decrement thì phải kiểm tra số row affected, chống cache entity stale và không chạy song song cả hai kiểu làm hai lần trừ.

### 4.2. Thứ tự chung với payment/admin

```text
Existing order:
  Order/CustomOrder root
  hoặc legacy CheckoutOrder -> children theo ID ổn định
  -> Payment aggregate -> PaymentAttempt
  -> InventoryReservation theo ID ổn định
  -> Product theo UUID tăng dần

New checkout:
  claim idempotency -> khóa cart marketplace
  -> tạo các order mới chưa commit
  -> Payment/Reservation nếu cần -> Product theo UUID tăng dần
```

Chỉ lấy khóa thật sự cần dùng, nhưng không đảo thứ tự giữa các đường. Discovery read để tìm root/ID được phép; phải đọc lại trạng thái sau khóa. Existing-order không quay lại lấy khóa cart sau khi đã khóa order; lịch sử giỏ chỉ cập nhật lúc checkout mới.

Không chờ gateway dưới khóa. Hiện PaymentServiceImpl có @Transactional cấp class: phải dùng orchestration không có outer transaction, collaborator qua Spring proxy hoặc TransactionTemplate cho các đoạn DB. Tự gọi method cùng class/private method có annotation không đủ để tách transaction; rà cả caller đang có transaction bao ngoài.

## 5. Backend bước 2 — Checkout marketplace đúng một lần

### 5.1. Preview trước xác nhận

1. Khách chọn marketplace lines và địa chỉ, backend trả preview giá/phí/tồn và phiên bản giỏ.
2. Preview không phải reservation. Khi khách bấm đặt phải kiểm tra lại dưới khóa; không hứa hàng chắc chắn chỉ vì vừa xem preview.
3. Nếu giá/tồn thay đổi, trả PRICE_CHANGED/OUT_OF_STOCK để khách xem lại. Không giữ tồn khi chỉ mở popup/trang giỏ.

### 5.2. Transaction tạo đơn

1. Xác thực user, lookup/claim idempotency theo user+scope+key trước kiểm tra cartVersion/selected lines.
2. Đã hoàn tất cùng requestHash: trả lại orderIds/result cũ; không reserve hoặc xóa giỏ thêm. Cùng key khác payload: conflict. Request cùng key đang chạy: serialize/processing, không tạo bản sao.
3. Khóa cart MARKETPLACE, kiểm tra version, ownership, danh sách không rỗng và mọi dòng tồn tại/đúng loại/revision.
4. Validate quantity nguyên dương/min/max; tổng hợp số lượng theo Product trên **tất cả** dòng đã chọn trước kiểm tra.
5. Khóa products theo ID ổn định, kiểm tra ACTIVE, seller active, giá/variant và stock đủ cho tổng cần mua.
6. Tạo Order theo seller, item snapshots, ShippingInfo đầy đủ và Payment theo phương thức/tổng server. Mỗi order có tổng và phí riêng.
7. Tạo reservation ACTIVE, trừ available stock một lần và ghi movement RESERVE. Nếu một product không đủ hoặc insert lỗi thì rollback toàn tập order/stock/reservation, không tạo một phần theo seller.
8. Xóa đúng selectedLineIds từ cart marketplace, tăng version và lưu response idempotency trong cùng transaction. Custom cart giữ nguyên.
9. Commit; tạo link PAYOS ngoài transaction theo flow 01. COD trả kết quả đã tạo đơn.

Lỗi business/SQL không được bị catch rồi trả success khiến transaction commit phần trước. Kiểm tra rollback semantics của exception thực tế, không giả định mọi checked exception tự rollback. Link lỗi sau commit không rollback stock/order; trả order cần thanh toán lại và deadline, tránh FE tạo order mới.

### 5.3. Pseudocode bất biến stock

```text
reserve:
  nếu operation/result đã tồn tại -> replay
  với mỗi product theo thứ tự ổn định:
    assert available >= aggregatedRequestedQuantity
    available -= quantity
    insert ACTIVE reservation và RESERVE movement
  commit cùng order/cart/idempotency result

confirm:
  khóa root/reservation
  ACTIVE -> CONFIRMED; không đổi available
  CONFIRMED -> cùng kết quả, không side effect thêm
  RELEASED -> không phục hồi; đối soát nếu có tiền

release:
  khóa root/reservation/product
  nếu ACTIVE và cancel/expiry guard hợp lệ:
    ACTIVE -> RELEASED
    available += quantity; insert RELEASE movement
  nếu RELEASED -> replay, không cộng thêm
  nếu CONFIRMED -> chặn flow hủy đơn giản/đi quy trình riêng
```

## 6. Backend bước 3 — Confirm legacy không trừ lặp

1. Chặn tạo mới mixed checkout; giữ API confirm cho các đơn cũ đã được xác minh đủ giá/nguồn quote theo flow 01.
2. Bắt buộc summaryVersion và idempotency key cho command mới. Lookup key trước version/trạng thái vì lần đầu có thể đã tăng version.
3. Khóa cha rồi con đúng thứ tự; chỉ confirm ở trạng thái hợp lệ trước xác nhận. Không chỉ kiểm tra `status != CANCELLED`.
4. Nếu đã confirm/đã có reservation đúng cho cùng thao tác: trả snapshot đã confirm, không trừ thêm. Key mới yêu cầu confirm trên đơn đã xử lý: trả conflict thay vì chạy lại side effects.
5. Kiểm tra các con bị hủy, quote/accept đúng phiên bản, price snapshot, seller/product ACTIVE và trạng thái reservation trước tạo/hoàn thiện reservation.
6. Legacy tự CONFIRMED nhưng chưa có chứng cứ đã reserve **không được xem là đã trừ tồn**. Chỉ có thể reserve một lần sau đối chiếu và trước phát hành link nếu còn đủ stock; nếu đã thu/đã sản xuất thì xử lý đối soát, không trừ mù làm tồn âm.
7. Không đặt mọi custom khác PAID về ACCEPTED và không kéo PRINTING/COMPLETED/CANCELLED lùi tiến trình.
8. Confirm chỉ giữ/xác nhận reservation theo nguồn đã rõ; webhook không trừ lại stock. Tham chiếu snapshot/confirmedAt/reservation thay vì suy từ tên status.

## 7. Backend bước 4 — Hủy, hết hạn và race với thanh toán

### 7.1. Cancel ba pha

1. **Claim dưới khóa:** lookup idempotency, khóa root/payment/attempt/reservation theo thứ tự; kiểm tra chủ/role, chưa PREPARING, chưa nhận tiền và reservation ACTIVE. Ghi cancellationClaim để chặn tạo attempt mới hoặc bắt đầu xử lý. Commit.
2. **Gateway ngoài transaction:** xác minh/đóng các attempt còn có thể nhận tiền. COD chưa thu không cần gateway. Timeout hoặc trạng thái chưa rõ thì giữ claim/reconciliation pending, không release stock ngay.
3. **Finalize dưới khóa:** đọc lại receipt/payment/claim/reservation. Nếu chưa thu và attempts đã được giải quyết an toàn, đổi order CANCELLED, release ACTIVE đúng một lần, ghi audit/idempotency result và outbox cùng transaction.
4. Nếu tiền đã về giữa pha 2 và 3: không finalize hủy/release mù; chuyển đối soát hoặc trả trạng thái không thể hủy đơn giản, giữ bằng chứng tiền.
5. Nếu order đã bị hủy và release xong trước khi receipt muộn đến: giữ order CANCELLED, receipt/reconciliation được ghi; không hồi sinh và không lấy hàng đã bán cho người khác.

Claim là dữ liệu bền có operationId/trạng thái/lease để worker khôi phục sau crash. Lease hết không tự kết luận gateway chưa thu; worker resume verify rồi finalize. Request retry cùng key trả processing/kết quả cũ.

### 7.2. Expire job

1. Tìm candidate order PAYOS quá deadline có reservation ACTIVE; không lấy list candidate làm trạng thái cuối vì có thể vừa nhận tiền.
2. Claim expire dưới root lock, dùng cùng điều kiện payment/attempt và quy trình verify ngoài transaction như cancel.
3. Chỉ finalize EXPIRED + RELEASED khi đủ chứng cứ an toàn. Nếu gateway không xác định được, giữ cần đối soát và retry có backoff.
4. Payment SUCCESS hợp lệ đã confirm reservation thì expire không release. Không chạy expire giữ tồn 15 phút cho COD đang xử lý.
5. Tạo link mới không tạo reservation mới; deadline hiển thị FE là thời hạn order server, không chỉ expiry của QR.

### 7.3. Hủy/hoàn sau khi đã trả hoặc xử lý

Không cộng tồn tự động trong nhánh refund. Thanh toán được hoàn không chứng minh sản phẩm đã quay về kho. Khi cần nhập lại hàng, dùng nghiệp vụ restock có bằng chứng/ledger riêng, không tái dùng release ACTIVE để cộng hai lần.

## 8. API và DTO đề xuất

| Endpoint | Mục đích |
| --- | --- |
| `POST /api/carts/marketplace/preview` | Trả pricing/availability preview, không reserve |
| `POST /api/carts/marketplace/checkout` | Tạo order+reservation+consume selected lines atomic |
| `POST /api/orders/{id}/cancel` | Cancel command có version/idempotency, có thể trả processing |
| `GET /api/orders/{id}` | Đơn, payment, reservation projection và capabilities hiện tại |
| `GET /api/operations/{operationId}` | Theo dõi command chưa rõ kết quả, scope quyền theo chủ/actor |

Các endpoint cũ `/orders` hoặc `/orders/{id}/status` nếu còn giữ phải gọi chung service, không có một nhánh bỏ qua reservation/guard. Đường custom không gọi checkout marketplace.

```json
{
  "idempotencyKey": "uuid-checkout",
  "cartVersion": 12,
  "previewVersion": "snapshot-server",
  "selectedLines": [
    { "clientLineId": "uuid-line", "revision": 3 }
  ],
  "addressId": "uuid-address",
  "paymentMethod": "PAYOS"
}
```

Response đề xuất cho checkout trả createdOrders, consumedLineIds và cartVersion. Mỗi order có orderStatus, paymentStatus, grandTotal và inventory projection:

```json
{
  "orderId": "uuid-order",
  "orderStatus": "PENDING",
  "paymentMethod": "PAYOS",
  "paymentStatus": "PENDING",
  "reservationState": "ACTIVE",
  "paymentDueAt": "2026-10-26T05:15:00Z",
  "canCancel": true,
  "version": 1
}
```

Cancel gửi idempotencyKey, orderVersion và reason; HTTP 202 nếu đang verify/claim, 200 khi hoàn tất/replay, 409 nếu paid/processing/version conflict, 401/403 theo quyền. DTO phải nói rõ `cancelPending`, operationId, reasonCode khi chưa hoàn tất; FE không tự đổi thành CANCELLED khi mới nhận 202.

| Lỗi đề xuất | UI xử lý |
| --- | --- |
| OUT_OF_STOCK | Hiện dòng lỗi và số lượng còn bán được, giữ giỏ để sửa |
| PRICE_CHANGED | Hiện preview mới, chờ khách xác nhận lại |
| CART_VERSION_CONFLICT / LINE_NOT_FOUND | Refetch shared cart; không âm thầm bỏ dòng và tạo đơn còn lại |
| RESERVATION_ALREADY_RELEASED | Không pay/confirm phục hồi tự động, mở chi tiết/đối soát |
| PAYMENT_ALREADY_RECEIVED / ORDER_ALREADY_PROCESSING | Không hủy đơn giản, giữ trạng thái server |
| PAYMENT_STATE_UNKNOWN / CANCELLATION_IN_PROGRESS | Hiện đang đối chiếu, theo dõi cùng operation |
| LEGACY_INVENTORY_REVIEW_REQUIRED | Chặn auto trừ/hoàn, hiển thị cần kiểm tra đơn cũ |

## 9. Frontend sửa theo thứ tự

1. `CartPage` chỉ gọi checkout marketplace cho các dòng tab đó. Custom gửi báo giá riêng, không tạo một request trộn.
2. Dùng cùng `useCart` instance tại App với popup; quantity/revision/saving/error dùng chung. Không thêm storage/page-cart riêng.
3. Đợi các mutation của giỏ marketplace lưu xong, lấy preview, rồi checkout với versions/key ổn định. Double-click khóa nút nhưng backend idempotency vẫn bắt buộc.
4. OUT_OF_STOCK/PRICE_CHANGED giữ draft, chỉ ra dòng cần sửa và chờ khách xác nhận lại; không tự giảm số lượng rồi đặt.
5. Tạo đơn thành công mới apply consumedLineIds vào shared store. Một loại gửi thành công không xóa giỏ còn lại; popup/badge cùng cập nhật.
6. Timeout checkout có thể đã commit: tra operation/replay cùng key trước khi tạo thao tác mới; không mặc định order chưa có chỉ vì giỏ local còn hàng.
7. Link PayOS lỗi nhưng order đã có thì hiển thị chờ thanh toán, ID đơn và retry payment. Không gọi lại checkout để lấy link.
8. Countdown dựa paymentDueAt/serverTime; hết giờ ở FE chỉ reload trạng thái, không tự cộng stock/xóa đơn.
9. Nút hủy ở order screen dùng server capabilities; với 202 hiển thị đang xử lý. Chỉ hiện đã hủy khi server finalize.
10. `PaymentResultPage`: bỏ tự restore toàn cart và cancel theo query. Browser cancel không chứng minh payment chưa thành công hoặc reservation đã release.
11. Sau hủy có nút “Thêm lại vào giỏ Marketplace” nếu cần: merge qua shared cart actions, kiểm tra sản phẩm/giá/tồn mới, không PUT backup ghi đè hai giỏ.
12. Admin PREPARING dùng policy/file 03; COD confirm reservation qua BE, PAYOS đã confirm không trừ lại. Màn admin không cho nhập quantity để tự sửa stock order.

## 10. Migration và dữ liệu cũ

### 10.1. Kiểm kê trước backfill

- Các Order thường đã trừ stock khi tạo nhưng chưa có ledger.
- Checkout tự CONFIRMED có thể chưa trừ stock.
- Checkout đã confirm một hoặc nhiều lần, có thể trừ vượt số lượng một đơn.
- Đơn CANCELLED nhưng stock chưa hoàn, đơn PAID không có receipt đáng tin hoặc hàng đã giao.
- Product tồn âm/không khớp số lượng thực tế và các admin điều chỉnh stock trực tiếp.

Không thể biết đường lịch sử chỉ từ status hiện tại hoặc stock đang có. Cần kết hợp log, audit, payment, item snapshot và kiểm kê; thiếu chứng cứ thì giữ needsReview, không chạy phép cộng/trừ tự động.

### 10.2. Backfill có chứng cứ

1. Thêm schema reservation/movement/version trước, chưa thay số lượng thực.
2. Với đơn biết chắc đã trừ và còn giữ hàng, backfill reservation `source=LEGACY_VERIFIED` ở trạng thái phù hợp; **không trừ lại stock** khi tạo record backfill.
3. Với đơn biết chắc chưa trừ và chưa thu/chưa xử lý, có thể reserve đúng một lần trong transaction khi còn đủ hàng; nếu thiếu trả lỗi/đối soát.
4. Với hủy chưa hoàn tồn và biết chắc quantity đã bị trừ, tạo/hoàn reservation theo operation migration duy nhất, có audit; chạy lại migration không cộng tiếp.
5. Với confirm trừ nhiều lần, không dùng quantity một order để tự suy số lần cần hoàn; đối chiếu số lần thực và điều chỉnh có ledger/actor.
6. Đơn đã nhận tiền nhưng không có hàng/reservation rõ: bảo toàn tiền, ngăn xử lý sai và chuyển đối soát, không auto stock âm để ép hệ thống khớp.

Mọi migration/điều chỉnh kho cần báo cáo trước/sau theo product và operationId. Admin cập nhật tồn cũng phải dùng cùng khóa/ledger, không `setStock` từ một màn sửa sản phẩm bằng số đếm cũ làm mất reservation mới.

## 11. Trình tự rollout

1. Hotfix guard confirm đúng trạng thái/idempotency, payment và ngừng trừ/hoàn mù. Chưa có dữ liệu reservation thì chặn những legacy không chứng minh được, không giả định đã an toàn.
2. Add schema/migration và InventoryService chung, test khóa/atomicity trên database mục tiêu.
3. Chuyển createOrders/checkout mới, confirm legacy, cancel, webhook/verify và expire sang cùng service; loại bỏ direct stock writes cũ trong cùng đợt chuyển.
4. Triển khai DTO/capabilities/operation status, FE shared cart và order cancellation; giữ popup/menu theo plan gốc.
5. Migrate/đối soát legacy có bằng chứng, bật feature flag cho đường mới; theo dõi stock âm, reserve/release mismatch và cancellation pending quá lâu.
6. Rollback chỉ tắt command mới và giữ service đọc/đối soát an toàn; không xóa reservation rồi phục hồi phép setStock không kiểm soát.

## 12. Kiểm thử cụ thể cần triển khai

| Tình huống | Bất biến phải kiểm tra |
| --- | --- |
| Checkout marketplace-only tự có giá | Stock giảm đúng q, có ACTIVE reservation; không cần một confirm riêng để trừ |
| Hai khách cùng mua stock=1 | Chỉ một transaction giữ tồn thành công; stock không âm, người thua không có order nửa chừng |
| Cùng product nhiều dòng/biến thể | Tổng q được kiểm tra/trừ một lần theo product, không mỗi dòng vượt tồn riêng |
| Nhiều seller, một product thiếu | Toàn checkout rollback, không xóa cart một phần |
| Double-click/retry sau success | Một tập order/reservation/movement, replay trước version/line validation |
| Retry confirm legacy cùng/new key | Không trừ thêm; key khác sau xử lý trả conflict phù hợp |
| Cancel hai request/job đồng thời | ACTIVE → RELEASED một lần, chỉ một cộng stock |
| COD cancel trước PREPARING | Release ACTIVE, order hủy; không cần gateway |
| COD PREPARING | Reservation CONFIRMED, không trừ thêm; cancel đơn giản bị chặn |
| PAYOS success rồi webhook/verify lặp | CONFIRMED một lần, không trừ stock lần hai |
| Webhook đồng thời cancel/expire | Một kết quả hợp lệ theo root lock; receipt không mất và không release mù khi đã trả |
| Tiền muộn sau release | Order terminal giữ nguyên, receipt/đối soát; stock không bị lấy lại tự động |
| Gateway timeout/crash giữa ba pha | Claim bền, worker resume, chưa rõ thì chưa release |
| Lỗi SQL sau trừ product trước xóa cart | Rollback product/reservation/order/cart; retry không mất/trừ đôi |
| Link tạo thất bại sau commit | Order/reservation vẫn truy ra, retry payment cùng order |
| Legacy không rõ đã trừ hay chưa | REVIEW_REQUIRED, migration không tự cộng/trừ |
| UI refresh/cancel query/đổi tài khoản | Không tự hoàn tồn hoặc ghi đè cả hai giỏ, không lộ dữ liệu |

Unit tests service/guard là cần nhưng chưa đủ. Integration phải dùng database mục tiêu với ít nhất hai transaction thật để kiểm tra row locks/unique/rollback; mock repository không chứng minh được chống bán vượt. Dùng mock/sandbox gateway cho race, không gọi giao dịch thật để nghiệm thu.

## 13. Tiêu chí hoàn thành và file phải rà

BE: `OrderServiceImpl`, `CheckoutOrderServiceImpl`, `PaymentServiceImpl`, `Product/Order/CheckoutOrder` repositories; CartService và DTO checkout; inventory schema/service/job mới; payment/admin policy và đường admin sửa stock. FE: CartPage, useCart/cartPayload, orderService, OrderList và PaymentResultPage; adapter shared popup không sửa nội dung popup.

- [ ] Mọi Order marketplace mới có reservation nhất quán với quantity snapshot.
- [ ] Reserve trừ một lần; confirm không trừ; release ACTIVE cộng một lần.
- [ ] Checkout/confirm/cancel retry không tạo side effect lặp.
- [ ] Hủy/hết hạn có guard payment và không giữ transaction qua gateway.
- [ ] Custom gửi báo giá không trừ hoặc hoàn Product.stock marketplace.
- [ ] Browser return/cancel không điều khiển tồn kho hoặc kết luận đơn đã hủy.
- [ ] Legacy được backfill bằng chứng, không đoán theo status hoặc làm mất giao dịch đã nhận.
- [ ] Kiểm thử concurrency/rollback đạt và dữ liệu popup/trang hai tab cùng nguồn.

Các bước/test trên là công việc khi triển khai; yêu cầu hiện tại chỉ tạo tài liệu flow.
