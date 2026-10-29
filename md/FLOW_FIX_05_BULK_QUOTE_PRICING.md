# Flow 05 — Sửa bulk order và hợp đồng báo giá custom từ BE đến FE

Ngày: 26/10/2026. Trạng thái: tài liệu flow sửa, chưa triển khai tính năng hoặc chạy test cho bản sửa.

Phạm vi chính: cùng một `quotedPrice` đang được hiểu lúc là giá cả lô, lúc là đơn giá nhân quantity; khắc phục xuyên suốt admin báo giá, khách duyệt, PAYOS/COD và dữ liệu cũ. Đồng thời làm rõ upload nhiều file, quantity từng file và cách bulk đi vào giỏ Custom.

## 1. Ràng buộc kế thừa và tài liệu liên quan

- [Kế hoạch tách giỏ](./PLAN_SPLIT_MARKETPLACE_CUSTOM_CART_ORDER.md): marketplace/custom đặt riêng; custom luôn đợi báo giá; trang hai tab dùng chung store và persistence với popup; mục Giỏ hàng trên menu, popup/header trigger giữ nguyên.
- [01 — Giá và thanh toán](./FLOW_FIX_01_CUSTOM_PRICING_PAYMENT.md): nguồn tiền được phép thu, accept snapshot, Payment/PaymentAttempt, webhook.
- [02 — Tồn kho](./FLOW_FIX_02_INVENTORY_CHECKOUT_CANCEL.md): marketplace reservation; gửi bulk custom không tự trừ stock hàng marketplace.
- [03 — Trạng thái admin](./FLOW_FIX_03_ADMIN_ORDER_STATUS.md): quote/accept/production guard; không sản xuất PAYOS chưa SUCCESS.

Tài liệu này sở hữu hợp đồng giá chung cho mọi custom mới: thiết kế studio, upload một file hoặc bulk nhiều file. Không thêm một hệ thống quote/payment riêng cho bulk. Các trường/API mới bên dưới là đề xuất cho bản sửa; không phải mô tả backend hiện đã hỗ trợ.

## 2. Đối chiếu hiện trạng và ví dụ lỗi

Đường BE tương đối với `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE tương đối với `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí | Hiện trạng |
| --- | --- |
| FE `pages/BulkOrderPage.tsx` | Dùng `CustomRequestForm bulk`, hiển thị banner chiết khấu 15%/25%/35% |
| FE `features/custom/CustomRequests.tsx`, CustomRequestForm | Một quantity chung, vòng lặp upload rồi POST `/custom-orders` từng file |
| FE CustomRequests form admin và phần khách xem | Nhãn “Nhập giá trọn gói (VND)” / “Báo giá trọn gói”, hiển thị quotedPrice cho quantity sản phẩm |
| BE `dto/custom_prints/CustomOrderQuoteRequestDTO.java` | Chỉ có field price, chưa khai báo là đơn giá hay tổng |
| BE `CustomOrderServiceImpl.quoteCustomOrder` | Lưu request.price vào CustomOrder.quotedPrice |
| BE `PaymentServiceImpl.createPaymentLink` nhánh CUSTOM_ORDER | total = custom.getQuotedPrice() |
| BE `CustomOrderServiceImpl.updateCustomOrderStatus`, hoàn COD | p.setAmount(order.getQuotedPrice()) |
| BE `CheckoutOrderServiceImpl.confirmCheckoutOrder` | quotedPrice × quantity khi cộng customTotal |
| BE `dto/order/BulkOrderRequestDTO.java` | Có cấu trúc DTO riêng nhưng không được coi là chứng cứ đã có aggregate bulk đang hoạt động; cần đối chiếu controller/service trước dùng |

Ví dụ suy ra từ code: quantity=10, admin nhập price=100.000đ. Luồng custom độc lập thu 100.000đ, trong khi custom thuộc checkout sau confirm đóng góp 1.000.000đ. Không kết luận giá bulk hiện “thu thiếu” khi nhãn đang là trọn gói; lỗi chắc chắn là hợp đồng không thống nhất.

## 3. Quyết định nghiệp vụ cho luồng mới

1. Mỗi dòng custom có một file/thiết kế, quantity riêng và một CustomOrder riêng sau khi gửi.
2. Bulk là thao tác tạo nhiều draft custom; có thể gắn submissionGroupId cho cùng lần gửi, không có payment cha hay tổng phải trả chung.
3. Đơn giá có tên chuẩn `unitPrice`; số lượng `quantity`; thành tiền sản phẩm `lineSubtotal`; tổng phải trả `grandTotal`.
4. Admin nhập đơn giá và phí/điều chỉnh rõ ràng; backend tính giá, frontend chỉ preview và render breakdown server.
5. `quotedPrice` legacy không được sử dụng trong phép tính mới nếu chưa biết nghĩa. Không vừa giữ nhãn tổng vừa nhân quantity.
6. Custom luôn REQUESTED trước quote; quantity lớn/estimate>0 không làm nó tự QUOTED.
7. Khách chọn COD/PAYOS khi accept một snapshot quote cụ thể; chỉ sau accept thành công mới được tạo link PAYOS. PAYOS và COD lấy cùng grandTotal.
8. Đổi quantity/design/material/address ảnh hưởng tiền làm mất hiệu lực quote chưa accept, phải báo lại. Quote đã accept không sửa trực tiếp.
9. Phí ship theo từng yêu cầu phải hiện trước accept. Bản này chưa hứa gom phí ship nhiều custom hoặc toàn lô.

Nếu tương lai cần một lô nhiều file có một báo giá/QR/phí ship chung, cần thiết kế aggregate **custom-only** riêng. Không ngầm biến submissionGroupId thành payment cha trong bản sửa này.

## 4. Hợp đồng giá chuẩn

### 4.1. Fields và công thức

```text
CustomQuoteSnapshot
  quoteId, customOrderId
  quoteVersion, requestVersion, currency=VND
  designOrFileSnapshotId, quantity, addressSnapshotId
  unitPrice
  lineSubtotal = unitPrice × quantity
  adjustmentAmount, adjustmentReason
  discountAmount, discountReason / appliedPolicySnapshot
  productionTotal = lineSubtotal + adjustmentAmount - discountAmount
  shippingFee
  grandTotal = productionTotal + shippingFee
  validUntil, quotedBy, quotedAt
  acceptedAt (hoặc acceptance tham chiếu snapshot), immutableSnapshotHash
```

- Trong DB/API mới dùng `unitPrice`. Nếu tên cũ `quotedUnitPrice` còn tồn tại trong một bản triển khai, mapper về cùng nghĩa `unitPrice`; không đồng thời công khai hai field làm hai nguồn giá.
- quantity nguyên dương; mặc định giới hạn đề xuất 1–10.000 cho bulk, số dòng tối đa và tổng payload cấu hình server. Các màn khác phải dùng giới hạn thống nhất theo loại custom chứ không chỉ HTML max.
- unitPrice > 0, shippingFee ≥ 0, discountAmount ≥ 0. adjustmentAmount có thể âm/dương nhưng phải có reason và productionTotal ≥ 0.
- discount không lớn hơn cơ sở tính hợp lệ đã điều chỉnh. grandTotal phải > 0 cho luồng thanh toán hiện tại; đơn miễn phí cần nghiệp vụ riêng, không fake một giao dịch gateway.
- Sử dụng BigDecimal và cấu hình tiền VND nguyên: reject scale không hợp lệ hoặc áp chính sách làm tròn duy nhất trước lưu snapshot. Không để FE làm tròn một kiểu, payment service một kiểu khác.
- Có mức tiền tối đa theo schema và khả năng gateway; reject overflow, NaN, Infinity, số âm, null bắt buộc hoặc chuỗi không parse được.
- Công thức không chứa commission seller, thuế hay phần trăm khác nếu chưa có chính sách tương ứng. Không tự bổ sung các khoản đó để “khớp tổng”.

### 4.2. Ví dụ phải khớp trên mọi màn

| Trường | Giá trị |
| --- | ---: |
| quantity | 10 |
| unitPrice | 20.000đ |
| lineSubtotal | 200.000đ |
| adjustmentAmount | +10.000đ, phí xử lý thiết kế |
| discountAmount | 20.000đ, ưu đãi được admin xác nhận |
| productionTotal | 190.000đ |
| shippingFee | 30.000đ |
| grandTotal | **220.000đ** |

Admin preview, quote đã lưu, màn khách accept, link PAYOS, biên nhận và COD đều dùng 220.000đ. Payment không lấy 20.000đ, không lấy 200.000đ và không nhân 220.000đ thêm 10 lần.

## 5. Backend bước 1 — Schema và contract

1. Tạo model snapshot quote có version và các thành phần tại mục 4. Ưu tiên bảng quote có lịch sử, unique `(custom_order_id, quote_version)`; CustomOrder có currentQuoteId, acceptedQuoteId, requestVersion và orderVersion.
2. Snapshot thiết kế/file/quantity/address không thay đổi sau accept. Dữ liệu preview thumbnail là phần hiển thị, không thay thế file/thiết kế nguồn để xưởng thực hiện.
3. Các cột quoteVersion/acceptedQuoteId do backend cấp; khách không được tự đặt qua create request hoặc update draft.
4. Cart custom chỉ có draft/estimate. Không sao chép customPrice sang bảng quote hoặc currentQuoteId.
5. Sửa CustomOrderQuoteRequestDTO thành DTO quote có nghĩa rõ. Sửa response detail/list gồm pricing breakdown và quantity thật; không chỉ trả một quotedPrice.
6. Tạo `CustomQuoteCalculator`/service tính giá dùng chung cho preview và lưu. Tổng server tính lại, không nhận lineSubtotal/grandTotal của FE làm giá có thẩm quyền.
7. Payment chỉ tham chiếu snapshot theo flow 01; COD hoàn thành đọc acceptedQuote.grandTotal qua service chung, không dùng customOrder.quotedPrice.
8. Migration additive, giữ nguyên cột quoted_price và giá đã thu cho legacy. Không drop field ngay làm client/đơn cũ mất dữ liệu.

## 6. Backend bước 2 — Upload và gửi bulk yêu cầu

### 6.1. Upload/staging độc lập

1. Người dùng chọn nhiều file; server upload API kiểm tra authentication, loại file được hỗ trợ, dung lượng và giới hạn tổng. Điều kiện UI phải lấy từ cấu hình server; không hứa “20MB” nếu server thực tế chỉ cho mức khác.
2. Lưu fileAssetId/staging asset thuộc user, trạng thái READY khi upload xong và metadata cần mở file; không tin URL do client khai là bằng chứng quyền sở hữu.
3. Nếu một file lỗi, giữ draft các file thành công, hiện lỗi cho file đó; chưa tạo CustomOrder vì upload phần trước đã xong.
4. File đã upload nhưng draft bị bỏ cần cleanup theo tuổi/tham chiếu; không xóa tài nguyên đang được order dùng.
5. Admin/buyer đọc file qua authorization của order hoặc URL có kiểm soát; người ngoài không có quyền dù biết ID.

### 6.2. Tạo draft ở giỏ Custom

1. Mỗi file tạo một draft với clientLineId, source FILE, assetId, quantity, material/options và notes; studio tạo source DESIGN.
2. Gọi cùng cart actions ở App; popup và `/cart?tab=custom` nhìn cùng dòng, quantity và preview.
3. “Áp dụng số lượng cho tất cả” nếu có chỉ là thao tác điền nhiều dòng; UI vẫn cho thấy số lượng mỗi file trước gửi.
4. Không merge hai file/thiết kế khác nhau chỉ vì cùng tên. Retry thêm cùng dòng dùng clientLineId/idempotency chống tạo bản sao.

### 6.3. Submit các dòng đã chọn

1. FE tạo submit idempotency key, snapshot danh sách ID/revision và addressId; disable thao tác gửi lặp trong lúc pending.
2. BE lookup/claim idempotency trước đọc version/validate dòng. Retry sau thành công trả các order cũ dù dòng giỏ đã bị xóa.
3. Khóa giỏ CUSTOM, kiểm tra user, version, tất cả selectedLineIds và từng fileAsset/quantity/options; một dòng sai thì không tạo bất kỳ order nào.
4. Trong một transaction database: tạo N CustomOrder REQUESTED, snapshot thông số/quantity/address, ghi submissionGroupId nếu dùng, consume chính xác N dòng và lưu response idempotent.
5. Không tạo Payment, không quote từ estimate, không trừ tồn marketplace.
6. Sau commit FE apply consumedLineIds vào shared store hoặc refetch cùng giỏ; popup và trang đều cập nhật. Thông báo “Đã gửi N yêu cầu báo giá” với link từng order.

Atomic ở đây chỉ áp dụng database submit; upload cloud/file staging không nằm trong cùng transaction. Nếu database rollback, draft/file vẫn còn để retry và không tự báo gửi thành công một phần.

## 7. Backend bước 3 — Admin quote và khách accept

### 7.1. Quote

1. ADMIN mở chi tiết với requestVersion/orderVersion; xem đúng file, quantity, options, địa chỉ.
2. Submit unitPrice, adjustmentAmount/reason, discountAmount/reason, shippingFee và validUntil.
3. BE kiểm tra role, khóa CustomOrder, REQUESTED/QUOTED chưa accept và version đúng.
4. Calculator tính breakdown, validate giới hạn, lưu quoteVersion mới; đánh dấu quote cũ superseded, chuyển QUOTED, tăng orderVersion.
5. Response trả snapshot đã lưu, không chỉ `Void` để FE hiển thị lại dữ liệu đã được backend chấp nhận.
6. Notification sau commit, link đến chi tiết yêu cầu; không báo thành công nếu quote transaction lỗi.
7. Nếu hai admin cùng quote, chỉ một version thắng; người còn lại nhận conflict và xem giá đang có.

### 7.2. Accept / request revision

1. Chủ đơn đọc breakdown, chọn COD/PAYOS, accept quoteVersion/requestVersion đang xem với idempotency key.
2. BE replay idempotent response trước version check; với thao tác mới khóa root, kiểm tra QUOTED, chưa hết hạn, hash request khớp.
3. Lưu acceptedQuoteId/acceptedAt và ACCEPTED; Payment tạo theo grandTotal trong flow 01. Không tính lại bằng giá hiện tại khác snapshot khách đã xem.
4. Nếu admin đã quote bản mới, accept cũ trả QUOTE_VERSION_CONFLICT. FE không tự retry accept version mới mà chưa để khách xem.
5. Khách request revision trước accept: yêu cầu trở lại REQUESTED, requestVersion tăng, quote cũ không còn khả năng accept.
6. Đổi quantity/address/design sau accept không mutate giá đã chốt; vào quy trình thay đổi/hủy có kiểm soát hoặc tạo yêu cầu mới.

### 7.3. PAYOS / COD

- PAYOS create-link đọc acceptedQuote.grandTotal, lưu snapshotId trong attempt và verify đúng số tiền; không nhân quantity trong PaymentServiceImpl.
- COD màn xác nhận thu tiền hiển thị cùng grandTotal. Service hoàn thành ghi amount từ snapshot, không nhận số tiền FE tùy ý.
- Không set payment SUCCESS chỉ vì admin vừa gửi quote hoặc khách vừa accept PAYOS.
- Requote không được cập nhật amount của attempt đang sống hoặc giao dịch đã SUCCESS. Báo giá khác cần đóng/đối soát nghĩa vụ cũ trước theo flow 01.

## 8. API đề xuất và ví dụ

Các endpoint bắt đầu `/api` khi gọi backend; FE api wrapper hiện đã dùng baseURL có `/api`.

### 8.1. Submit custom từ giỏ

```json
POST /api/carts/custom/submit
{
  "idempotencyKey": "uuid-submit",
  "cartVersion": 6,
  "addressId": "uuid-address",
  "selectedLines": [
    { "clientLineId": "uuid-file-a", "revision": 2 },
    { "clientLineId": "uuid-file-b", "revision": 1 }
  ]
}
```

Quantity và file lấy từ draft tương ứng. Response có createdRequests, consumedLineIds, cartVersion mới và submissionGroupId nếu dùng, không có paymentLinkUrl.

### 8.2. Admin quote

```json
PUT /api/admin/custom-orders/{id}/quote
{
  "orderVersion": 3,
  "requestVersion": 2,
  "unitPrice": 20000,
  "adjustmentAmount": 10000,
  "adjustmentReason": "Xu ly thiet ke",
  "discountAmount": 20000,
  "discountReason": "Uu dai so luong",
  "shippingFee": 30000,
  "validUntil": "2026-11-02T05:00:00Z"
}
```

Không nhận quantity như cách thay đổi yêu cầu khách; lấy quantity server đã snapshot. Giá trị q=10 cho response minh họa:

```json
{
  "code": 200,
  "result": {
    "orderId": "uuid-custom",
    "orderStatus": "QUOTED",
    "orderVersion": 4,
    "quote": {
      "quoteId": "uuid-quote",
      "quoteVersion": 1,
      "requestVersion": 2,
      "currency": "VND",
      "quantity": 10,
      "unitPrice": 20000,
      "lineSubtotal": 200000,
      "adjustmentAmount": 10000,
      "discountAmount": 20000,
      "productionTotal": 190000,
      "shippingFee": 30000,
      "grandTotal": 220000,
      "validUntil": "2026-11-02T05:00:00Z"
    },
    "canAccept": false,
    "canPay": false,
    "allowedActions": ["REVISE_QUOTE"]
  }
}
```

Response thực tế cần giữ cả adjustmentReason/discountReason và metadata hiển thị; ví dụ trên lược bớt để tập trung phép tính. canAccept/canPay phải tính theo **người gọi**: response sau ADMIN gửi quote không cấp quyền accept thay khách. GET chi tiết của chủ đơn ở QUOTED có thể trả canAccept=true và hành động ACCEPT_QUOTE nếu quote còn hạn; đây là capability của chủ đơn, không của admin chỉ vì họ vừa báo giá.

### 8.3. Lỗi giữa BE và FE

| Mã đề xuất | Kỳ vọng |
| --- | --- |
| INVALID_QUANTITY / INVALID_MONEY / TOTAL_OUT_OF_RANGE | Hiện lỗi đúng trường, chưa lưu quote/payment |
| FILE_NOT_READY / FORBIDDEN_FILE_ACCESS | Giữ draft, chỉ file lỗi, không submit nửa lô |
| CART_VERSION_CONFLICT / REQUEST_VERSION_CONFLICT | Reload dữ liệu, khách/admin kiểm tra lại |
| QUOTE_VERSION_CONFLICT / QUOTE_EXPIRED | Không accept/pay bản cũ |
| QUOTE_LOCKED_AFTER_ACCEPTANCE | Không sửa giá của đơn đã được khách chốt |
| LEGACY_PRICE_SCOPE_UNKNOWN | Không đoán nghĩa quotedPrice, đưa đối soát |

## 9. Frontend sửa theo thứ tự

### 9.1. Model/service dùng chung

1. `services/quotationService.ts`: thêm QuoteBreakdown/QuoteSnapshot, quantity thật, versions và capabilities; tách legacy quotedPrice khỏi typed quote mới.
2. `types`/formatter: phân biệt unitPrice, grandTotal và estimate; dùng chung formatter tiền VND. Không lấy `quotedPrice || 0` rồi trình bày 0 như quote hợp lệ.
3. Quote service nhận response snapshot thật sau lưu; admin form render lại breakdown server. Nếu preview FE khác response, server là nguồn xác nhận và phải cho admin xem lại.
4. `paymentService.ts` chỉ gửi orderId/acceptedQuoteId và idempotency key, không gửi tổng do form tự tính để backend tin.

### 9.2. BulkOrderPage / CustomRequestForm

1. Thay một quantity toàn form bằng danh sách draft từng file, có quantity/material/notes riêng và thao tác áp dụng chung tùy chọn.
2. Xử lý upload từng file với READY/UPLOADING/ERROR, retry chỉ file lỗi. Không vòng lặp POST tạo CustomOrder mỗi file ngay sau upload.
3. Thêm vào giỏ Custom qua shared actions; CTA xem giỏ mở đúng tab. Popup giữ nguyên nội dung và nhận cùng items.
4. Chỉ submit khi mọi dòng được chọn hợp lệ/đồng bộ. Báo lỗi không xóa bản nháp/file đã upload.
5. Kết quả hiển thị N yêu cầu độc lập, quantity từng file, phí/quote sẽ được duyệt riêng. Không hứa một payment/giao chung toàn lô.

### 9.3. Admin báo giá

1. Đổi nhãn “Nhập giá trọn gói” thành **Đơn giá / sản phẩm (VND)**.
2. Hiện quantity server ở dạng không sửa tại quote; thành tiền sản phẩm cập nhật preview khi nhập đơn giá.
3. Thêm adjustment/reason, discount/reason, ship và hạn. Nếu backend chưa hỗ trợ khoản nào thì không render form giả có thể nhập nhưng không được lưu.
4. Preview đầy đủ và grandTotal nổi bật; xác nhận **Gửi báo giá tổng … cho … sản phẩm**.
5. Submit kèm versions, khóa nút đang lưu. Thành công dựa vào response thật; 409 giữ input admin để so sánh và tải phiên bản mới.
6. Sau accept hiển thị quote read-only, không cho sửa giá qua một màn admin khác còn dùng form cũ.

### 9.4. Khách xem quote và theo dõi order

1. Thay nhãn mơ hồ “Báo giá trọn gói” bằng breakdown **Đơn giá × số lượng**, điều chỉnh, giảm giá, ship và **Tổng báo giá**.
2. Nút accept nêu tổng, phương thức và version; stale version buộc xem báo giá mới trước khi accept tiếp.
3. Các màn CustomRequests, OrderList, chi tiết custom và biên nhận dùng cùng grandTotal, không một nơi hiển thị unitPrice làm tổng.
4. Gỡ nội dung hứa “quét QR xong máy in tự kích hoạt” nếu thực tế vẫn phải qua bước admin PREPARING/PRINTING.
5. `CustomOrderCheckoutPage` không thu estimate trước quote; điều hướng đúng REQUESTED/QUOTED/ACCEPTED.

### 9.5. Banner giảm giá bulk

Hiện trang bulk hiển thị 15%/25%/35% và miễn ship. Không coi các banner đó là chính sách đã được backend thực thi. Trong bản sửa:

- Nếu chưa có chính sách giá được cấu hình/xác nhận ở server, thay lời khẳng định bằng nội dung ưu đãi được xưởng báo trong quote; không tự áp phần trăm ở FE.
- Nếu chính sách được triển khai, server trả rule/version/cơ sở áp dụng và snapshot phần giảm vào quote; chỉ áp dụng một lần, không vừa giảm unitPrice vừa trừ discountAmount lần nữa.
- Không cộng quantity của các file khác nhau để đạt bậc giảm theo toàn lô trừ khi chính sách rõ ràng cho phép; phương án mặc định ở đây là quote từng yêu cầu.
- Quyền lợi subscription nếu có phải do server kiểm tra, không suy từ role ADMIN hoặc chuỗi benefits.

## 10. Migration giá cũ và link đang hoạt động

### 10.1. Không nhân/chia tự động

`quotedPrice` hiện không có scope đáng tin cậy. Quantity=10 và giá=100.000đ không đủ chứng minh đó là đơn giá 10.000đ hoặc đơn giá 100.000đ. Dùng lịch sử nguồn tạo, nội dung báo giá, người báo, payment amount và xác nhận nghiệp vụ để phân loại.

| Dữ liệu cũ | Xử lý migration |
| --- | --- |
| Chưa quote | Giữ REQUESTED, quote snapshot null |
| QUOTED nhưng nghĩa giá chưa rõ, chưa trả tiền | Khóa accept/pay bản cũ; admin tạo quote mới đơn giá rõ, khách duyệt lại |
| Trọn lô đã được xác nhận/accept nhưng chưa trả | Giữ tổng đã chấp nhận theo legacy snapshot nếu có chứng cứ; không tự tăng tiền vì schema mới |
| Đã SUCCESS hoặc COD đã thu | Giữ nguyên tiền nhận và chứng từ; không nhân quantity rồi thu bổ sung |
| Có pending gateway link | Giữ attempt mapping, verify/cancel an toàn trước requote; không đổi amount của link đang sống |
| Không đủ chứng cứ hoặc tiền/quote lệch | Mark reconciliation/LEGACY_PRICE_SCOPE_UNKNOWN; xử lý thủ công |

Nếu giá trọn lô cũ chia quantity không ra số nguyên VND, không làm tròn unitPrice rồi làm sai tổng. Legacy có thể giữ `pricingMode=LEGACY_TOTAL` và confirmedTotal trong adapter read-only; đây không phải lựa chọn nhập giá cho đơn mới. Nếu muốn đổi sang quote mới thì khách phải duyệt rõ tổng mới và nghĩa vụ cũ đã được giải quyết.

### 10.2. Checkout cha cũ

- Dừng tạo cha mới theo kế hoạch split-cart.
- Không tiếp tục lấy quotedPrice × quantity khi chưa xác minh scope. Chỉ dùng snapshot legacy đã được kiểm chứng và allocations theo flow 01.
- Tổng cha đã trả không tự chia thành các custom mới cần thanh toán lại.
- Có con hủy/đã trả riêng/tổng khác thì khóa thu tiếp, đối soát; không sửa price để ép khớp một cách không có lịch sử.

## 11. Trình tự triển khai BE → FE và rollback

1. Hotfix không nhân quotedPrice chưa rõ scope và không cho custom bỏ qua quote; chặn thanh toán legacy không đủ chứng cứ theo flow 01.
2. Add schema snapshots/versions, tạo calculator và test tiền độc lập.
3. API quote/accept/detail mới trả breakdown; cập nhật mọi đường Payment PAYOS/COD sang acceptedQuote.grandTotal.
4. Upload staging và custom submit atomic/idempotent, giữ service tạo trực tiếp nếu còn nhưng cùng guard.
5. FE typed models → form admin → màn khách → bulk drafts/cart → payment receipt/timeline; không deploy admin form đơn giá trong khi BE vẫn hiểu price là tổng.
6. Migration bản sao DB, phân loại legacy, feature flag bật giao thức mới theo phiên bản. Client cũ không được âm thầm POST `{price}` vào quote mới.
7. Theo dõi amount mismatch/invalid quantity/quote conflicts/unknown price scope; xử lý danh sách legacy trước cleanup.

Rollback chỉ tắt tạo quote mới bằng feature flag và giữ khả năng đọc/verify snapshot/attempt đã phát hành. Không rollback dữ liệu thành một quotedPrice mơ hồ hoặc xóa giao dịch đã nhận.

## 12. Kiểm thử phép tính, API và end-to-end

| Ca kiểm thử | Kết quả bắt buộc |
| --- | --- |
| q=1, unit=20.000, ship=30.000 | Tổng 50.000 ở quote/PAYOS/COD |
| q=10 và các khoản mục ví dụ mục 4 | Tổng 220.000 ở mọi màn và attempt |
| q lớn trong giới hạn, tổng vượt hạn tiền | Reject trước quote/link, không overflow |
| q=0/âm/lẻ/null hoặc vượt max | 400/validation có field, không tạo request nửa lô |
| unit/ship/discount âm, scale sai, NaN/Infinity | Reject hoặc chuẩn hóa đúng chính sách server, không tự sửa thành 0 |
| adjustment âm hợp lệ / discount vượt cơ sở | Tổng hợp lệ hoặc reject rõ, không tổng âm |
| FE gửi grandTotal giả / estimate=1 | Backend tự tính theo quote admin, draft vẫn chưa có giá chốt |
| Hai admin quote cùng orderVersion | Một snapshot thắng, người còn lại conflict |
| Accept v1 trong khi v2 vừa được quote | Không trả tiền quote cũ; yêu cầu xem v2 |
| Design/quantity/address đổi sau quote | Quote invalidated, không pay snapshot không khớp |
| PAYOS retry/link mới, COD hoàn thành retry | Cùng grandTotal, không nhân quantity lại, không thu hai lần |
| A.stl q20, B.stl q30 | Hai yêu cầu 20/30, tổng 50 sản phẩm, không q50 cho mỗi file |
| Upload B lỗi / submit DB lỗi sau tạo A | Chưa submit B; DB rollback không để A thành order một phần; draft còn để retry |
| Double submit / refresh giữa gửi | Một tập N yêu cầu, consumed đúng dòng, không cộng quantity lại |
| Legacy tổng không chia hết quantity | Giữ tổng cũ/đối soát; không làm tròn rồi tăng tiền |
| Banner ưu đãi chưa có rule server | Không tự giảm/bảo đảm quyền lợi chưa tồn tại |
| Shared popup/page | Data/revision/preview khớp; popup giữ giao diện và triggers |

Test calculator bằng unit tests; integration transaction/version/idempotency với DB triển khai; mock gateway so sánh expectedAmount; UI test form label/breakdown/stale quote/upload error. Không cần giao dịch thật để chứng minh phép tính.

## 13. Tiêu chí nghiệm thu

- [ ] Mỗi field giá có đúng một ý nghĩa và mọi endpoint/frontend cùng nghĩa đó.
- [ ] Không còn đường mới hiểu quotedPrice lúc là đơn giá lúc là tổng.
- [ ] Tất cả custom/bulk đều REQUESTED trước admin quote và khách accept.
- [ ] PAYOS và COD cùng đọc acceptedQuote.grandTotal; không nhân tổng thêm lần nữa.
- [ ] Bulk nói rõ số lượng từng file, N yêu cầu độc lập và phí/quote riêng.
- [ ] Upload lỗi/submit lỗi/retry không mất draft, không tạo nửa lô hoặc trùng yêu cầu.
- [ ] Snapshot/quote version ngăn sửa giá âm thầm sau khi khách accept.
- [ ] Gói ưu đãi/banner không hứa giảm giá khác dữ liệu server.
- [ ] Giá/tiền legacy được bảo toàn và có danh sách cần đối soát, không suy đoán để nhân/chia tự động.
- [ ] File 01/02/03 và hợp đồng cart gốc dùng thống nhất; không sửa nội dung popup để triển khai flow này.

Các test/checklist là công việc khi triển khai; yêu cầu hiện tại chỉ tạo tài liệu.
