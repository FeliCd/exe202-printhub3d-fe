# Kế hoạch sửa Subscription, Order, Payment và bốn luồng đặt hàng

Cập nhật: 18/10/2026. Trạng thái: kế hoạch triển khai, chưa thực hiện thay đổi nghiệp vụ.

## 1. Mục tiêu và phạm vi

Áp dụng đồng thời cho:

- FE: `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe`.
- BE: `D:/semester 7/EXE/PrintHub_3D`.

Mục tiêu: giá do BE xác nhận; không thu thiếu/thu trùng; không bán vượt tồn; giao chung/giao riêng hoạt động thực tế; tích điểm và quyền lợi hội viên thống nhất; hỗ trợ đơn lớp, custom, hàng sẵn và đơn hỗn hợp.

### Giới hạn phạm vi đã sửa: KHÔNG triển khai hoàn tiền

Hệ thống hiện chưa có chức năng hoàn tiền; người dùng chưa yêu cầu xây dựng chức năng này. Việc bản plan trước đưa refund thành yêu cầu triển khai là mở rộng phạm vi và được loại khỏi đợt này.

- **Không tạo RefundService, bảng Refund/RefundAllocation, API/UI hoàn tiền, luồng duyệt hoàn, tích hợp refund PayOS hoặc phân hệ thu hồi điểm sau hoàn tiền.** Không thêm các thành phần đó vào SQL bàn giao.
- Checklist, schema, API và test bên dưới chỉ bao gồm phạm vi hiện tại; không triển khai refund hoặc nghĩa vụ thu hồi điểm.
- Điểm mua hàng đợt này chỉ cấp khi hàng đã hoàn tất và xác nhận thu tiền; balance không âm, cộng/redeem chống lặp. Không tạo bảng nghĩa vụ, không chặn redeem vì một khoản refund chưa tồn tại.
- Hủy trước thanh toán và release/khôi phục kho đúng điều kiện vẫn thuộc phạm vi. Đơn đã thanh toán không được tự hủy như chưa thu tiền; API hủy thông thường phải từ chối và hướng dẫn liên hệ admin, không tự ghi tiền đã hoàn hoặc tự mở lại hàng đã bán.
- Tiền đến muộn, tiền vào đơn đã hủy hoặc hết hàng: lưu attempt/sự kiện và số tiền thực nhận, gắn `RECONCILIATION_REQUIRED` hoặc trạng thái tương đương, hiển thị admin để xử lý ngoài hệ thống. Không bỏ webhook, không đánh dấu đã giao, không hiển thị “đã hoàn tiền”.
- Admin đối soát chỉ ghi nhận tình trạng, ghi chú và bằng chứng xử lý bên ngoài nếu cần; không được biến thành chức năng refund tự động hoặc tự xác nhận đã chuyển tiền.
- Báo cáo doanh thu phân biệt tiền thực nhận với doanh thu đơn đủ điều kiện và khoản cần đối soát; không thêm phép tính hoàn tiền giả khi chưa có nguồn dữ liệu xác thực.
- Nếu sau này người dùng yêu cầu hoàn tiền, lập kế hoạch riêng và chốt chính sách, quyền, provider, dữ liệu, điểm thưởng và kiểm thử trước khi triển khai.

Tài liệu này là kế hoạch tổng hợp cho phạm vi trên. Khi khác với `PLAN_CUSTOM_CART.md`, dùng quyết định trong tài liệu này cho phần subscription/order/payment; không thay đổi các yêu cầu thiết kế và xuất file ngoài phạm vi. Source hiện tại vẫn là căn cứ xác nhận tính năng đã triển khai.

Không cần tách microservice. Giữ kiến trúc Spring Boot hiện có, tách trách nhiệm bằng service/module và transaction rõ ràng.

### Phân công thao tác database — yêu cầu của người dùng

- Database đích của đợt sửa này là **Supabase PostgreSQL**.
- Agent triển khai (Codex, Antigravity hoặc công cụ khác) chỉ viết SQL script, query kiểm tra trước/sau, hướng dẫn thứ tự chạy và phương án phục hồi; người dùng tự chạy trên Supabase.
- Không tự kết nối, chạy migration/backfill/DDL/DML, deploy schema hoặc thay đổi dữ liệu trên Supabase. Không tự bật cơ chế chạy migration khi ứng dụng khởi động hoặc qua CI/CD.
- Kiểm thử script chỉ thực hiện trên DB local/test cô lập khi có môi trường phù hợp; kết quả phải phân biệt rõ với việc script đã được người dùng chạy trên Supabase.
- Không cần viết bộ SQL Server cho phạm vi này. Chỉ bổ sung khi người dùng yêu cầu riêng.
- Các bước “chạy migration”, “backfill”, “siết ràng buộc” và “rollback” bên dưới là nội dung chuẩn bị và checklist bàn giao cho người dùng thực hiện trên Supabase; không phải quyền cho bất kỳ agent triển khai nào thực thi trên DB đó.

## 2. Các vấn đề phải đóng

| ID | Vấn đề hiện tại | Ưu tiên | Giai đoạn |
|---|---|---|---|
| PRICE-01 | Nhận `customPrice` từ client rồi dùng làm giá báo/giá thanh toán | P1 | 1, 2 |
| PRICE-02 | Công thức VIP, ship và giá nằm rải rác ở FE; khác BE | P1 | 2, 5 |
| PRICE-03 | `quotedPrice` không thống nhất đơn giá hay thành tiền giữa checkout cha và custom riêng | P1 | 2 |
| PAY-01 | Cho tạo thanh toán khi đơn còn `PENDING_QUOTE` | P1 | 1 |
| PAY-02 | Thanh toán cha đánh dấu toàn bộ con đã trả tiền dù phạm vi chưa hợp lệ | P1 | 1, 4 |
| PAY-03 | Đường thanh toán cha/con có thể cùng tác động một phần hàng | P1 | 1, 4 |
| PAY-04 | COD, hủy trước thanh toán và đối soát cha/con chưa thống nhất | P1 | 4 |
| STOCK-01 | Checkout có nhánh thanh toán không qua trừ/giữ kho | P1 | 1, 3 |
| STOCK-02 | Confirm lặp có thể trừ kho lại; kiểm tra kho chưa khóa sản phẩm | P1 | 1, 3 |
| ORDER-01 | FE thiếu bước đọc lại/duyệt đơn cha sau báo giá | P1 | 4, 6 |
| ORDER-02 | Phiên bản báo giá/tổng tiền chưa được kiểm soát xuyên suốt; idempotency chưa được thực thi | P1 | 1, 2, 4 |
| ORDER-03 | Trạng thái thanh toán, sản xuất, giao hàng bị trộn; cha/con thiếu đồng bộ | P1 | 2, 4 |
| SHIP-01 | `COMMON`/`SEPARATE` chưa tạo khác biệt xử lý thực tế | P1 | 3, 6 |
| SHIP-02 | FE thiếu seller trong product mapping; một seller chưa bảo đảm cùng điểm xuất | P2 | 2, 3 |
| SHIP-03 | Một mức ship 30.000; thiếu shipment, tracking và snapshot người nhận | P2 | 3 |
| SUB-01 | Chỉ marketplace có tích điểm hoàn tất; custom thiếu | P1 | 5 |
| SUB-02 | Cộng/trừ điểm đồng thời thiếu cơ chế khóa chung và khóa chống lặp | P1 | 5 |
| SUB-03 | Đổi gói khác cùng type có thể gia hạn gói cũ | P1 | 5 |
| SUB-04 | Danh sách gói bỏ sót `CUSTOMER_VIP`; role hiển thị và redeem lệch nhau | P2 | 5 |
| SUB-05 | Review cộng ví nhưng thiếu ledger và chống thưởng lặp | P2 | 5 |
| SUB-06 | Quyền lợi là mô tả; chưa có engine áp dụng và quy tắc cộng dồn | P1 | 2, 5 |
| BULK-01 | Bulk là nhiều custom request rời; DTO bulk chưa nối vào luồng thật | P2 | 6 |
| BULK-02 | Banner giảm theo số lượng chưa nối BE; thiếu danh sách cá nhân hóa/duyệt mẫu | P2 | 6 |
| UX-01 | Giá ước tính, lỗi PayOS, trạng thái chờ giá có thể bị trình bày như đã chốt | P2 | 4, 6 |
| DATA-01 | Hai đường tạo đơn khác nhau về commission, shipping, payment và stock | P1 | 2, 4 |

P1: sửa trước khi mở lại các nhánh giao dịch liên quan trên production. P2: hoàn thiện trước khi công bố hỗ trợ đầy đủ bốn luồng.

## 3. Quyết định thiết kế và chính sách mặc định

Các lựa chọn dưới đây là mặc định triển khai được đề xuất, chưa phải chính sách kinh doanh đã được chủ sản phẩm phê duyệt. Tập trung trong cấu hình để có thể điều chỉnh trước phát hành.

1. Một `CheckoutOrder` là đơn khách nhìn thấy. `Order` và `CustomOrder` giữ vai trò phần hàng/nghiệp vụ; không được tự tạo nghĩa vụ thanh toán trùng với cha.
2. BE là nguồn giá cuối cùng. FE không quyết định giảm giá, phí ship, tiền phải thu hoặc số điểm được cấp.
3. Thước chuẩn có thể được BE tính giá tự động nếu có công thức và điều kiện hợp lệ. Các mẫu phức tạp bắt buộc thẩm định. Giá client gửi chỉ là tham khảo, không được nâng thành báo giá.
4. Tất cả số tiền VND dùng số nguyên trong hợp đồng API, BE lưu kiểu decimal phù hợp; quy tắc làm tròn và phân bổ giảm giá dùng chung.
5. Có hai chế độ nhận hàng: `WAIT_ALL` (chờ đủ) và `AS_READY` (nhận từng phần). Trong giai đoạn tương thích ánh xạ từ `COMMON`/`SEPARATE`.
6. Chỉ hứa một kiện khi cùng điểm xuất hoặc đã có quy trình gom hàng. Cùng seller chỉ là dữ liệu tham khảo, không phải bằng chứng có thể gom.
7. Mặc định thanh toán toàn bộ phần giá đã chốt. Đặt cọc không thuộc đợt triển khai này; không hiển thị tùy chọn đặt cọc khi BE chưa hỗ trợ.
8. Điểm mua hàng: 10.000 đồng tiền hàng sau giảm giá, đã thu và hoàn tất = 1 điểm; không tính ship.
9. Điểm đơn lớp mặc định cấp cho tài khoản đại diện mua hàng. Không cấp thêm cho thành viên nếu không có chính sách phân bổ riêng.
10. Không cộng dồn giảm bulk và giảm hội viên trên cùng dòng hàng; mặc định chọn mức hợp lệ có lợi hơn. Miễn ship áp dụng riêng trong hạn mức. Chốt quy tắc này trước khi bật ưu đãi thật.
11. Thời hạn hội viên lấy từ `durationDays` của gói, mặc định 30 ngày. Đổi lại cùng gói thì gia hạn; đổi gói khác trong cùng nhóm thì thay thế từ thời điểm đổi, cảnh báo rõ phần thời hạn bị thay thế trước khi xác nhận.
12. Các giao dịch thanh toán không xác định hoặc trả tiền muộn phải có trạng thái đối soát; balance ví không âm. Chi tiết quyết định mới nhất tại mục 16.

## 4. Mô hình dữ liệu mục tiêu

| Thành phần | Trường/trách nhiệm chính |
|---|---|
| CheckoutOrder | Buyer, loại đơn, trạng thái tổng hợp, currency, phiên bản, tổng tiền, snapshot địa chỉ và chính sách |
| Order / CustomOrder | Snapshot dòng hàng, quantity, unitPrice, lineTotal, discount allocation, design/file revision; liên kết cha |
| QuoteRevision | Phiên bản bất biến, người báo giá, đơn giá, số lượng, hạn hiệu lực, cấu hình thiết kế, tổng tiền, điều kiện giao |
| FulfillmentGroup | Điểm xuất, phần hàng, readiness, ngày dự kiến; không suy ra chỉ từ seller |
| Shipment / ShipmentItem | Nhóm hàng được giao, số lượng, người nhận, phí, hãng giao, tracking, trạng thái |
| InventoryReservation | Product, quantity, chủ sở hữu, hạn giữ, trạng thái RESERVED/COMMITTED/RELEASED/EXPIRED |
| PaymentIntent / PaymentAttempt | Phạm vi thu, số tiền bất biến, quote/summary version, mã provider, trạng thái, hạn thanh toán |
| PaymentAllocation | Phân bổ tiền vào dòng hàng/phí ship; ngăn một nghĩa vụ bị thu hai lần |
| PointWallet | Balance, version; mọi thay đổi qua một service và cùng cơ chế khóa |
| PointTransaction | Amount, type, sourceType/sourceId, eventKey duy nhất, policyVersion |
| SubscriptionPlan / Benefit | durationDays, requiredPoints, discount, phạm vi, freeShip cap, priority, stacking policy |
| UserSubscription | Gói/quyền lợi snapshot, start/end, trạng thái; lịch sử thay thế/gia hạn |
| BulkOrder / BulkMemberLine | Lớp/người đại diện, tên/MSSV, mẫu/màu, quantity, file/design revision, trạng thái duyệt mẫu |
| IdempotencyRecord / PaymentEvent | Chống request lặp, lưu attempt và webhook/đối soát bền vững; Outbox worker là nâng cấp tùy chọn |

Có thể mở rộng bảng Payment hiện có thay vì tạo mới toàn bộ nếu giữ được các ràng buộc. Chốt migration sau khi kiểm tra schema thật và dữ liệu hiện hữu.

Ràng buộc DB bắt buộc: quantity > 0; amount hợp lệ; provider transaction code duy nhất; eventKey điểm duy nhất; idempotency duy nhất theo user/action/key; số tiền phân bổ/hoàn không vượt nghĩa vụ/giao dịch gốc. Các bất biến xuyên nhiều dòng cần transaction và kiểm tra service, không chỉ CHECK constraint.

## 5. Trạng thái và bất biến

Tách ít nhất ba trục:

- Giá/xác nhận: DRAFT → PENDING_QUOTE → READY_FOR_CONFIRMATION → CONFIRMED; có EXPIRED/CANCELLED.
- Thanh toán: UNPAID → PENDING → PAID; có FAILED/CANCELLED/RECONCILIATION_REQUIRED và trạng thái trả một phần theo nhóm.
- Fulfillment: NOT_READY → READY → PREPARING/PRINTING → READY_TO_SHIP → SHIPPED → DELIVERED; có PARTIALLY_FULFILLED/CANCELLED.

Trạng thái cha tính từ các phần đang hoạt động. Thanh toán không tự động biến mọi phần thành đã sản xuất/giao; hoàn tất một con không làm cha hoàn tất nếu các con còn lại chưa kết thúc.

Các bất biến:

- Không tạo intent cho phần hàng chưa có báo giá hợp lệ và chưa được khách chấp nhận.
- Tổng tiền phải thu = tổng hàng − giảm giá + ship; từng khoản được phân bổ và lưu snapshot.
- Không xác nhận hoặc tạo khoản thu mới dựa trên phiên bản giá đã cũ. Tiền thực tế đến qua link cũ vẫn phải được ghi nhận vào attempt gốc và chuyển đối soát khi không còn đủ điều kiện fulfillment; không từ chối ghi nhận tiền chỉ vì version đã cũ.
- Xác nhận lặp không trừ kho, tạo đơn, thu tiền hoặc cấp điểm lần nữa.
- Quy ước tồn: `Product.stock` là số lượng chưa commit cho đơn; tồn khả dụng = stock − tổng reservation RESERVED chưa hết hạn. Reserve chỉ tạo giữ kho, không trừ stock. Commit đồng thời trừ stock và chuyển reservation sang COMMITTED trong một transaction, đúng một lần; shipment không trừ lại. Release reservation RESERVED không cộng stock; hủy reservation COMMITTED trước xuất kho thì cộng lại đúng một lần. Hàng đã xuất chỉ nhập lại sau kiểm tra hàng trả. Khóa sản phẩm theo thứ tự ID cố định hoặc dùng cập nhật nguyên tử tương đương.
- Thanh toán online phải thành công trước sản xuất; COD phải được chính sách cho phép. Hoàn tất giao COD chưa đồng nghĩa đã thu đủ tiền.
- Chỉ một cơ chế sở hữu thanh toán cho một phần hàng: standalone hoặc checkout, không đồng thời cả hai.
- Hủy phần hàng chưa thanh toán chỉ tác động phần đó; phần đã thu tiền chuyển đối soát, dữ liệu đã giao/đã thu không bị ghi đè.

## 6. Kế hoạch triển khai theo giai đoạn

### Giai đoạn 0 — Khóa phạm vi và chuẩn bị dữ liệu

- [ ] Kiểm kê controller/service/repository, schema/migration, quyền API và tất cả caller của create/confirm/pay/cancel/complete/redeem/review.
- [ ] Đọc lại `CheckoutOrderServiceImpl`, `OrderServiceImpl`, `CustomOrderServiceImpl`, `PaymentServiceImpl`, `CartServiceImpl`, `UserSubscriptionServiceImpl`, `ReviewServiceImpl`, `FinanceServiceImpl` và DTO/entity liên quan.
- [ ] FE rà `CartPage`, `CustomOrderCheckoutPage`, `CustomRequests`, `BulkOrderPage`, `OrderList`, `SubscriptionPanel`, `productService`, `orderService`, payment service và role mapping.
- [ ] Lập bảng hợp đồng cũ/mới, OpenAPI và fixtures cho bốn loại đơn; kiểm tra tất cả nguồn tính commission, giá, phí ship và quyền lợi.
- [ ] Áp dụng chính sách mục 16: bỏ seller, cấm COD custom; chốt giá theo đơn vị, đổi gói và ưu đãi bulk. Không mở rộng sang chức năng ngoài phạm vi.
- [ ] Thống kê đơn chờ giá/đã thanh toán/đã hủy, ví và ledger; sao lưu và chuẩn bị báo cáo đối soát trước migration.

Điều kiện hoàn tất: có mapping dữ liệu và danh sách bất thường; không giả định dữ liệu cũ đúng.

### Giai đoạn 1 — Vá các lỗi giao dịch nghiêm trọng

- [ ] Bỏ việc dùng `customPrice` client làm giá chính thức. API cart không cho client thay đổi trường giá được BE xác nhận.
- [ ] Cấm tạo thanh toán checkout `PENDING_QUOTE`; kiểm tra toàn bộ phần hàng thuộc phạm vi thu đã được chốt và duyệt.
- [ ] Chặn API pay/accept/cancel độc lập của con thuộc checkout nếu thao tác phá vỡ phạm vi quản lý cha.
- [ ] Confirm yêu cầu `summaryVersion`; kiểm tra đúng trạng thái, chống lặp theo idempotency key và trả kết quả cũ khi request tương đương.
- [ ] Cùng key khác payload trả conflict; FE giữ nguyên key khi retry một hành động và tạo key mới khi người dùng thay đổi nội dung.
- [ ] Gom số lượng theo product trước kiểm tra kho; dùng cập nhật có điều kiện hoặc khóa sản phẩm để ngăn bán vượt tồn.
- [ ] Đảm bảo mọi nhánh checkout hàng sẵn đều qua bước giữ/commit kho; callback không tự trừ thêm lần nữa.
- [ ] Enum/validation cho mode, method, quantity, giá, ownership, role và các phần hàng được chọn; không chấp nhận selection chỉ khớp một phần mà không báo rõ.
- [ ] Không cho chuyển PENDING online sang sản xuất; chỉ cho COD hợp lệ hoặc đã trả tiền.
- [ ] Khi PayOS lỗi, trả trạng thái có thể phục hồi; không hiển thị thành công thanh toán hay nuốt lỗi như đã hoàn tất.

Điều kiện hoàn tất: các test khai thác sửa giá, trả tiền sớm, confirm lặp, trả tiền cha/con và tranh chấp tồn kho đều bị chặn.

### Giai đoạn 2 — Giá, báo giá và hợp đồng API thống nhất

- [ ] Tạo PricingService dùng chung cho standalone và checkout: unitPrice, quantity, subtotal, discounts, shipping, payableTotal, policyVersion.
- [ ] Bỏ cách dùng mơ hồ `quotedPrice`; API mới trả `unitPrice`, `quantity`, `lineTotal`, `quoteTotal`, `estimated` rõ ràng.
- [ ] Custom chưa được duyệt hiển thị “Chờ báo giá”; không dùng giá fallback 35.000/45.000 làm giá chính thức hoặc hiển thị 0đ.
- [ ] Mỗi lần báo lại giá hoặc thay thiết kế tăng revision và summaryVersion; vô hiệu xác nhận cũ và intent chưa thanh toán theo quy trình provider an toàn.
- [ ] Snapshot commission, quyền lợi, giá và cấu hình; thống nhất đường `/orders`, `/custom-orders` và `/checkout-orders` qua cùng orchestration hoặc adapter.
- [ ] Bổ sung sellerId, fulfillmentOriginId và khả năng giao vào DTO; sửa ProductDTO/productView/types để không cần `as any`.
- [ ] Preview API trả các phương án giao hợp lệ, tổng tiền đã chốt, phần chưa báo giá, khả năng COD và lý do không khả dụng.

Điều kiện hoàn tất: cùng input và policy cho cùng kết quả BE; FE hiển thị đúng response, không tự tính lại ưu đãi.

### Giai đoạn 3 — Giữ kho và giao hàng

- [ ] Tạo InventoryReservation với hạn thanh toán 15 phút và thời gian đệm giữ kho 5 phút, đề xuất tổng 20 phút theo mục 16. Bản đầu dùng lazy expiry: mọi truy vấn tồn khả dụng chỉ tính RESERVED có expiresAt > thời gian DB; thao tác mua/confirm/settle/release khóa sản phẩm và kiểm tra hạn trong transaction. Không phụ thuộc job quét để hàng hết hạn trở lại khả dụng. Job dọn trạng thái hết hạn chỉ là tùy chọn.
- [ ] Đơn chờ báo giá dài ngày không giữ kho vô thời hạn. Khi duyệt kiểm tra lại tồn/giá; thay đổi phải được khách đồng ý.
- [ ] COD commit kho sau xác nhận hợp lệ; hủy trước xuất kho release đúng một lần; hàng trả chỉ nhập kho sau kiểm tra thực tế.
- [ ] Với WAIT_ALL, tính khả năng gom theo điểm xuất và ngày sẵn sàng. Không gom được thì trả phương án nhiều kiện hoặc từ chối lựa chọn một kiện với lý do rõ ràng.
- [ ] Với AS_READY, tạo nhóm hàng sẵn độc lập khỏi nhóm custom; nhóm sẵn không bị trạng thái chờ giá của nhóm khác chặn.
- [ ] Tạo shipment, snapshot người nhận có cấu trúc, tracking và phí từng kiện; không dùng chuỗi địa chỉ ghép làm nguồn dữ liệu duy nhất.
- [ ] ShippingService dùng cấu hình vùng/điểm xuất/kiện hoặc tích hợp hãng giao khi có; chưa tích hợp thì ghi rõ phí cấu hình, không mô tả như phí hãng giao thật.
- [ ] PayOS trả tiền sau khi giữ kho hết hạn: khóa, thử giữ lại; nếu hết hàng chuyển đối soát, không tự giao hoặc bỏ tiền đã nhận.

Điều kiện hoàn tất: giao riêng hoạt động độc lập; giao chung chỉ xuất khi đủ điều kiện; mọi hủy/hết hạn đều trả giữ kho đúng.

### Giai đoạn 4 — Payment, COD, hủy trước thanh toán và đối soát

- [ ] Payment intent gắn phạm vi thu và summary/quote version bất biến. Dùng một payment cho toàn đơn đã chốt hoặc nhiều payment theo nhóm, không thu phần chưa chốt giá.
- [ ] Tách transaction DB khỏi gọi PayOS: transaction ngắn tạo intent/attempt và provider code duy nhất → gọi PayOS ngoài transaction → transaction ngắn lưu kết quả. Retry từ request/verify hoặc thao tác admin phải tra cứu attempt/provider code cũ trước; timeout không được tạo khoản thu mới tùy tiện. Không bắt buộc Outbox worker cho bản đầu.
- [ ] Lưu từng attempt và mã provider; nếu tra cứu provider lỗi thì chưa tạo link mới tùy tiện vì link cũ có thể còn khả dụng.
- [ ] Không tái sử dụng link có số tiền/phiên bản khác; hủy hoặc hết hạn link cũ và xử lý race thanh toán muộn.
- [ ] Webhook xác minh chữ ký, số tiền, currency nếu provider cung cấp và mã giao dịch; lưu inbox/event chống lặp; cập nhật đúng allocation.
- [ ] Webhook và verify dùng chung settle service; khóa/reload đúng dữ liệu để hai nguồn xác nhận không ghi nhận thu tiền hai lần.
- [ ] Không ghi đè con đã hủy thành PAID. Tiền đến sau hủy chuyển đối soát và tạo nghĩa vụ hoàn phù hợp.
- [ ] COD có số phải thu từng shipment và bước xác nhận thu tiền có quyền; không tạo payment COD thành công chỉ từ trạng thái giao hoàn tất.
- [ ] Hủy phần chưa thanh toán điều chỉnh tổng cha và giữ kho; phần đã trả tiền phải từ chối hủy thông thường và hướng dẫn liên hệ admin.
- [ ] Admin xem khoản tiền cần đối soát, ghi chú/audit; không có thao tác chuyển tiền hoặc xác nhận refund trong đợt này.
- [ ] Finance/revenue đọc tiền thực nhận và allocation, phân biệt khoản cần đối soát; không cộng cả payment cha lẫn con thành doanh thu kép.
- [ ] FE có trang chi tiết đơn cha, tải lại sau báo giá, duyệt version hiện hành, retry thanh toán, trạng thái pending/error và khôi phục sau refresh.

Điều kiện hoàn tất: retry và webhook lặp không thu/ghi nhận trùng; COD và tiền thu theo nhóm đối soát được đến dòng hàng.

### Giai đoạn 5 — Điểm thưởng và Subscription

- [ ] Tạo PointService tập trung; mọi EARN/REDEEM/REVIEW ghi ledger và cập nhật ví trong một transaction.
- [ ] Khóa user/wallet cùng thứ tự trong tất cả thao tác hoặc dùng version + retry có giới hạn; xử lý tạo ví đồng thời bằng ràng buộc duy nhất.
- [ ] Unique eventKey theo sự kiện nghiệp vụ, không chỉ dùng cờ rewardProcessed. Bảo đảm retry không ghi ledger hai lần.
- [ ] Dùng cơ sở tiền hàng đã thu và hoàn tất cho cả marketplace/custom; tính điểm mục tiêu cộng dồn theo checkout rồi cấp phần chênh lệch.
- [ ] Review có ảnh thưởng một lần cho source hợp lệ, có ledger; sửa review không thưởng lại. Chính sách xóa ảnh/review cần cấu hình và audit.
- [ ] Balance luôn không âm; chỉ redeem khi đủ số dư dưới lock. Không tạo nghĩa vụ thu hồi điểm hoặc chặn redeem theo refund.
- [ ] Trả lịch sử điểm, pending/available và lý do điều chỉnh; đồng bộ badge/profile sau redeem/gift/reward.
- [ ] Sửa danh sách gói trả đủ loại được phép; UI và BE thống nhất quyền USER/ADMIN và role mapping.
- [ ] Cùng gói: gia hạn từ max(now, endDate). Gói khác cùng nhóm: kết thúc gói cũ và tạo activation mới theo chính sách mục 3, lưu lịch sử đầy đủ.
- [ ] Không gia hạn gói A khi người dùng đổi gói B; snapshot quyền lợi để sửa/ngừng bán plan không âm thầm thay đổi quyền lợi đã đổi.
- [ ] Engine quyền lợi kiểm tra thời hạn, phạm vi, hạn mức miễn ship và stacking; snapshot áp dụng ở thời điểm khách xác nhận giá.
- [ ] Redeem/gift chống lặp; gift yêu cầu quyền admin, lưu người thực hiện/lý do. FE chỉ báo thành công khi API thành công.
- [ ] Bổ sung expiry/renewal và audit; kiểm thử boundary thời gian theo một clock/timezone thống nhất.

Điều kiện hoàn tất: mọi biến động ví có nguồn; không mất/cộng trùng điểm khi đồng thời; đổi gói và quyền lợi khớp giá checkout.

### Giai đoạn 6 — Hoàn thiện bốn hành trình FE/BE

#### A. Đơn hàng loạt theo lớp

- [ ] Một đơn lô có lớp, đại diện, liên hệ, hạn chốt, địa chỉ; mỗi thành viên có mẫu/tên/MSSV/màu/số lượng và design revision.
- [ ] Nhập CSV/Excel, xem trước, báo lỗi từng dòng, xác nhận tên/MSSV trùng và tổng số lượng; giới hạn kích thước và số dòng.
- [ ] Upload file có token định danh; retry gửi đơn dùng cùng idempotency key, không tạo nhiều request rời hoặc nhiều lô trùng.
- [ ] Duyệt mẫu và khóa danh sách trước sản xuất. Sửa sau khi khóa phải tạo revision/báo giá mới và thông báo ảnh hưởng lịch giao.
- [ ] Bulk discount tính từ số lượng đủ điều kiện trên toàn lô. Các mức 15/25/35% hiện trên banner chỉ được bật khi cấu hình và kiểm thử BE tương ứng.
- [ ] Mặc định giao một điểm; nếu nhiều địa chỉ thì tách shipment/phí. Điểm cấp đại diện theo mục 3.
- [ ] Admin theo dõi thiếu file, chưa duyệt mẫu, tiến độ in, số lượng QC đạt/lỗi; xuất danh sách đóng gói để không nhầm tên.

#### B. Chỉ in custom

- [ ] Chuẩn hóa Studio/upload/vault vào cùng quy trình: thiết kế → tính giá BE hoặc thẩm định → quote → khách duyệt → thanh toán/COD hợp lệ → sản xuất → QC → giao.
- [ ] Thiết kế và file lưu revision bất biến đã chốt; sửa nội dung sau duyệt bắt buộc đánh giá lại giá/thời gian.
- [ ] CustomOrderCheckoutPage bỏ giảm VIP/ship tự tính và địa chỉ mặc định của một cá nhân; dùng preview/địa chỉ thật.
- [ ] Không gọi pay ngay sau tạo REQUESTED; dẫn đến trang chờ báo giá. Chỉ mở PayOS khi phần hàng đã đủ điều kiện.
- [ ] Chuẩn hóa số lượng và tổng thu, ship, điểm như marketplace.

#### C. Chỉ hàng có sẵn

- [ ] Chọn hàng → preview giá/tồn/phí → giữ kho → xác nhận → PayOS/COD → đóng gói → giao; không qua PENDING_QUOTE.
- [ ] Không hiển thị bước in cho hàng thực sự có sẵn; nhiều điểm xuất hiển thị nhiều kiện và phí trước xác nhận.
- [ ] Hết hạn thanh toán giải phóng kho; retry không tạo đơn/giữ kho kép; hủy có kết quả rõ ràng.

#### D. Đơn hỗn hợp hàng sẵn và custom

- [ ] Một checkout hiển thị từng phần, giá chốt/chưa chốt và ngày sẵn sàng.
- [ ] WAIT_ALL: chờ báo giá, khách duyệt tổng, kiểm tra lại hàng sẵn rồi xác nhận; giao khi đủ và gom được.
- [ ] AS_READY: nhóm sẵn xác nhận/thu/giao trước; nhóm custom duyệt/thu/sản xuất sau. Hiển thị số đợt, phí từng đợt và số tiền còn lại.
- [ ] Nếu khách muốn trả một lần cho toàn đơn thì phải chờ tất cả giá chốt; không thu ước tính của custom.
- [ ] Hủy/từ chối một custom không hủy hàng đã giao; tính lại phí/ưu đãi phần còn lại và yêu cầu đồng ý nếu làm tăng nghĩa vụ khách.
- [ ] Tải lại trang hoặc đăng nhập thiết bị khác vẫn xem/duyệt/tiếp tục được đơn cha từ server.

Điều kiện hoàn tất: QA chạy được cả bốn hành trình, gồm PayOS, COD được phép, retry, đổi giá, hết kho và hủy từng phần.

## 7. Hợp đồng API dự kiến

Tên endpoint là đề xuất; chốt theo quy ước repo trong giai đoạn 0, tránh duy trì hai hợp đồng có cùng chức năng.

| Nhóm | Hợp đồng cần có |
|---|---|
| Preview | POST checkout preview: selected lines + revisions, addressId, fulfillment preference; trả giá/phương án hợp lệ/version |
| Checkout | Create có idempotency; GET detail/list; confirm có expectedVersion; cancel có scope/reason/version |
| Quote | Báo giá có revision, expiry, unitPrice/lineTotal; accept gắn đúng version và thiết kế |
| Payment | Create intent theo checkout/group và acceptedVersion; retry/verify không tạo khoản thu kép |
| Shipment | List/detail, tracking, chuyển trạng thái có expectedVersion; COD collection riêng có audit |
| Subscription | Plans, membership + structured benefits, redeem/gift idempotent, point history |
| Bulk | Import preview + validation, create batch, update revision, approve sample, packing list |

Mọi API kiểm tra ownership/role tại BE; không tin role FE. Chuẩn hóa lỗi VERSION_CONFLICT, OUT_OF_STOCK, PRICE_CHANGED, QUOTE_EXPIRED, PAYMENT_IN_PROGRESS và RECONCILIATION_REQUIRED để FE có hành động phục hồi.

## 8. Migration và tương thích dữ liệu cũ

- [ ] Dùng cơ chế migration đang có; nếu chưa có, chọn một công cụ/versioning phù hợp, không dựa vào auto-update schema ở production.
- [ ] Expand trước: thêm cột nullable, bảng mới và index; deploy code đọc tương thích, sau đó mới backfill và siết ràng buộc.
- [ ] Phân loại payment standalone/cha/con và đơn thanh toán thiếu giá; không tự nhân quotedPrice cũ vì chưa biết đó là đơn giá hay tổng giá.
- [ ] Đơn mơ hồ chuyển danh sách đối soát; giữ nguyên dấu vết số tiền provider, không sửa lịch sử thu tiền để khớp mô hình mới.
- [ ] Backfill shipment/địa chỉ chỉ từ dữ liệu đủ tin cậy; thiếu người nhận/điểm xuất thì đánh dấu cần bổ sung.
- [ ] Đối soát ví với ledger. Chênh lệch cũ ghi opening balance/adjustment có nguồn migration, không xóa số dư hoặc dựng lịch sử giả.
- [ ] Chuyển active subscription có snapshot; phát hiện nhiều gói cùng nhóm và xử lý theo chính sách trước unique constraint.
- [ ] Ánh xạ trạng thái/mode cũ qua adapter; ngừng dần endpoint cũ sau khi FE mới và job nền đã chuyển hết.
- [ ] Rollback ứng dụng giữ các bảng mới; không drop payment/ledger. Có runbook xử lý giao dịch phát sinh trong thời gian chuyển đổi.

## 9. Kiểm thử bắt buộc

### Unit/service

- Giá theo cấu hình, đơn giá × số lượng, phân bổ giảm giá/ship, rounding, giới hạn miễn ship và không cộng dồn sai ưu đãi.
- Đổi cùng gói, đổi khác gói cùng type, gói hết hạn/ngừng bán, thời điểm bắt đầu/kết thúc và role.
- Custom/marketplace cùng quy tắc điểm; tách đợt không đổi tổng điểm; không cấp điểm trước hoàn tất và xác nhận thu tiền.
- Không tạo intent khi thiếu giá, chưa duyệt, revision cũ hoặc scope đã được trả tiền.

### Integration với DB thật/test container phù hợp DB đang dùng

- Hai khách mua sản phẩm cuối; hai confirm cùng lúc; confirm retry; hết hạn giữ kho cùng lúc callback trả tiền.
- Hai đơn cùng cộng điểm vào một ví; cộng điểm đồng thời redeem/review; hai redeem cùng số dư; tạo ví lần đầu đồng thời.
- Webhook lặp/song song với verify; provider timeout sau khi đã tạo link; link cũ trả tiền sau báo giá mới/hủy đơn.
- Hủy phần chưa trả tiền trong đơn cha; chặn hủy phần đã trả tiền; không tính doanh thu hai lần.
- Migration trên bản sao dữ liệu có đơn cũ, quote mơ hồ, ledger thiếu và payment cha/con.

### E2E FE/BE

| Hành trình | Kịch bản tối thiểu |
|---|---|
| Đơn lớp | Import lỗi từng dòng, sửa danh sách, duyệt mẫu, giá theo bậc, trả tiền, giao một điểm, retry không trùng |
| Custom | Giá tự động BE và báo thủ công; quote hết hạn/sửa; quantity > 1; pay/COD hợp lệ; điểm hoàn tất |
| Hàng sẵn | Một/nhiều điểm xuất; còn/hết kho; PayOS lỗi; COD; hết hạn và hủy trả kho |
| Hỗn hợp | WAIT_ALL/AS_READY; hàng sẵn đi trước thật; custom bị từ chối; hủy phần chưa thanh toán; refresh tiếp tục đúng đơn |

### Kiểm tra khai thác và quyền

- Sửa customPrice/total/discount/role/userId từ request; truy cập đơn người khác; gọi thanh toán con để bỏ qua cha.
- Gửi mode/method lạ, quantity âm/quá giới hạn, selection thiếu/sai revision, dùng lại idempotency key với payload khác.
- Đánh dấu thu COD/gift bằng tài khoản không có quyền.

Không coi các unit test hiện hữu là bằng chứng đủ: lần review trước chưa lấy được kết quả chạy do tiến trình dừng ở Mockito. Giai đoạn 0 phải khôi phục chạy test ổn định trước khi dùng làm cổng phát hành.

## 10. Chia đợt triển khai và tiêu chí phát hành

| Đợt | Nội dung | Phụ thuộc |
|---|---|---|
| PR 1 | Guard giá/payment, validation, quyền, khóa/trạng thái confirm và test hồi quy; kèm SQL bổ sung tối thiểu nếu cần idempotency bền vững ngay | Giai đoạn 0 |
| PR 2 | Schema bổ sung, pricing/quote version, DTO và OpenAPI | PR 1 |
| PR 3 | Inventory reservation, nhóm fulfillment, shipment và phí | PR 2 |
| PR 4 | Payment allocation, webhook/verify, COD, hủy trước thanh toán, đối soát ngoại lệ và finance; không có refund | PR 2–3 |
| PR 5 | Point ledger và subscription/benefit engine | PR 2, 4 |
| PR 6 | FE checkout/detail/quotation/subscription cho hàng sẵn, custom, hỗn hợp | Hợp đồng PR 2–5 |
| PR 7A | Phân hệ mới: bulk MVP với đơn lô, bảng nhập thành viên thủ công, báo giá toàn lô, giao một điểm | PR 2–6 |
| PR 7B | Bulk mở rộng: import CSV/Excel, duyệt mẫu có workflow, packing list | PR 7A; nghiệm thu riêng |
| PR 8 | Backfill, rehearsal migration, E2E và rollout | Các đợt trên |

Các đợt là ranh giới review kỹ thuật; không tự động publish, merge hoặc deploy. Dùng feature flag cho engine mới, giao riêng và bulk; không bật UI trước khi BE tương ứng sẵn sàng. Ước lượng thời gian sau giai đoạn 0 dựa trên schema, provider và chất lượng test thực tế.

Cổng phát hành:

- [ ] Tất cả P1 đóng, không có đường tạo đơn/payment cũ vượt qua bất biến mới.
- [ ] Build FE/BE, test hồi quy, integration concurrency và E2E bốn luồng đạt.
- [ ] Đã diễn tập migration/rollback, đối soát đơn và ví; dữ liệu mơ hồ có hàng đợi xử lý.
- [ ] Có log correlation checkout/payment/provider/event; không log thông tin nhạy cảm không cần thiết.
- [ ] Có log/bộ lọc đối soát webhook lỗi, tiền chưa allocation, attempt chưa rõ kết quả và ledger lệch; cảnh báo worker chỉ bắt buộc nếu triển khai worker.
- [ ] Admin có cách xử lý payment đến muộn, hoàn thủ công và COD chưa thu tiền, có audit.
- [ ] FE không còn quyền lợi/ship/giảm bulk chỉ là banner không có xử lý tương ứng.
- [ ] Cập nhật `PROJECT_CONTEXT.md`, tài liệu cũ liên quan, hợp đồng API và hướng dẫn vận hành theo source cuối cùng.

## 11. Bản đồ file bị ảnh hưởng

Đây là phạm vi dự kiến để triển khai và review, không có nghĩa mọi file phải viết lại. Xác nhận caller và schema trong giai đoạn 0 trước khi chốt diff. Đường dẫn BE dưới đây tính từ `PrintHub_3D/src/main/java/com/fpt/printhub_3d`; đường dẫn FE tính từ `exe202-printhub3d-fe/exe-fe/src`.

### 11.1. BE — file hiện có cần sửa hoặc kiểm tra

| File/nhóm | Thay đổi dự kiến |
|---|---|
| `service/impl/CheckoutOrderServiceImpl.java` | Orchestration đơn cha, chốt giá/version, idempotency, chia nhóm và phạm vi thu |
| `service/impl/OrderServiceImpl.java` | Giữ/commit/release kho, trạng thái, hoàn tất và gọi PointService |
| `service/impl/CustomOrderServiceImpl.java` | Quote revision, unitPrice/lineTotal, duyệt đúng version, quản lý con thuộc checkout |
| `service/impl/PaymentServiceImpl.java` | Intent/attempt/allocation, webhook/verify, retry, COD, đối soát và hủy |
| `service/impl/CartServiceImpl.java` | Không tin customPrice client, kiểm tra revision và selection |
| `service/impl/UserSubscriptionServiceImpl.java` | Redeem/gift chống lặp, đổi/gia hạn đúng gói, snapshot quyền lợi |
| `service/impl/SubscriptionPlanServiceImpl.java` | Cấu hình thời hạn/quyền lợi và validation |
| `service/impl/ReviewServiceImpl.java` | Thưởng review qua PointService, ledger và chống thưởng trùng |
| `service/impl/FinanceServiceImpl.java` | Tiền thực nhận, doanh thu và khoản đối soát theo allocation, không đếm kép cha/con |
| Các interface tương ứng trong `service/` | Đồng bộ chữ ký và trách nhiệm service |
| `entity/CheckoutOrder.java`, `Order.java`, `OrderItem.java`, `CustomOrder.java` | Version, snapshot giá/thiết kế, trạng thái và liên kết fulfillment |
| `entity/Payment.java` | Mở rộng phạm vi thu và liên kết attempt/allocation theo thiết kế cuối |
| `entity/PointWallet.java`, `PointTransaction.java` | Cơ chế concurrency, nguồn giao dịch, eventKey, policyVersion |
| `entity/SubscriptionPlan.java`, `UserSubscription.java` | Quyền lợi có cấu trúc, duration, snapshot và lịch sử kích hoạt |
| `entity/ShippingInfo.java`, `CartItem.java`, `User.java` | Kiểm tra tương thích shipment, giá cart và cách đọc số dư/hội viên |
| Repository checkout/order/custom/payment/cart/product/point/subscription/shipping | Lock/update nguyên tử, truy vấn theo scope, chống trùng và mapping mới |
| `dto/checkout/`, `dto/order/`, `dto/custom_prints/`, `dto/payment/`, `dto/subscription/` | Request/version/idempotency và response giá/phạm vi/trạng thái mới |
| `dto/order/BulkOrderRequestDTO.java` | Nối vào luồng bulk thật hoặc thay bằng DTO mới có mapping tương thích |
| `dto/marketplace/ProductResponseDTO.java` | Seller/điểm xuất và dữ liệu cần để preview phương án giao |
| `controller/` và `controller/api/` của checkout/order/custom/payment/subscription/admin | API mới, ownership, quyền và chặn đường cũ vượt orchestration |
| `entity/Enumeration/`, `common/exception/` liên quan | Enum/trạng thái, mã lỗi rõ nguyên nhân và hành động phục hồi |
| `common/config/SecurityConfig.java` và cấu hình quyền liên quan | Kiểm tra mapping endpoint mới; chỉ sửa nếu cần quyền mới |

### 11.2. BE — module/file mới dự kiến

Tên cụ thể có thể điều chỉnh theo quy ước repo; phải giữ trách nhiệm và bất biến trong kế hoạch.

| Nhóm mới | File/thành phần dự kiến |
|---|---|
| Giá và quote | PricingService, QuoteRevision entity/repository và DTO preview/quote |
| Điểm | PointService và DTO/API lịch sử điểm |
| Kho | InventoryReservation entity/repository/service, lazy expiry; job dọn dẹp tùy chọn |
| Fulfillment | FulfillmentGroup, Shipment, ShipmentItem; service/repository/controller/DTO tương ứng |
| Thanh toán | PaymentAttempt/Allocation hoặc mở rộng bảng hiện có; settlement service dùng chung |
| Đối soát ngoại lệ | Trạng thái/ghi chú/audit của payment attempt khi đã nhận tiền nhưng chưa xử lý được đơn; không tạo RefundService/Refund entity |
| Bulk | BulkOrder/BulkMemberLine, import/validation, duyệt mẫu, packing list |
| Độ bền xử lý | IdempotencyRecord, payment event/attempt và audit; outbox/worker là nâng cấp tùy chọn |

### 11.3. FE — file hiện có cần sửa hoặc kiểm tra

| File/nhóm | Thay đổi dự kiến |
|---|---|
| `pages/CartPage.tsx` | Preview BE, giá chốt/chờ giá, mode giao hợp lệ, idempotency và xác nhận |
| `pages/CustomOrderCheckoutPage.tsx` | Bỏ tự tính VIP/ship, bỏ địa chỉ cá nhân fallback, chỉ pay khi đã duyệt giá |
| `features/custom/CustomRequests.tsx` | Quote revision, custom thuộc cha, chuyển từ gửi file rời sang bulk khi cần |
| `pages/BulkOrderPage.tsx` | Import/xem trước danh sách, lỗi từng dòng, duyệt mẫu và giá toàn lô |
| `features/orders/OrderList.tsx` | Đơn cha/con, payment scope, shipment và hành động đúng trạng thái |
| `features/subscriptions/SubscriptionPanel.tsx` | Quyền lợi thật, đổi/gia hạn, lịch sử điểm, chỉ báo thành công khi API thành công |
| `features/cart/hooks/useCart.ts` | Đồng bộ revision, giá server và retry; không fallback giá thành giá chính thức |
| `features/cart/hooks/cartPayload.ts` | Phân biệt estimate client với giá đã chốt ở BE |
| `features/cart/components/CartItem.tsx`, `CartDrawer.tsx` | Hiển thị giá/trạng thái mới và hành động chỉnh sửa hợp lệ |
| `services/productService.ts` | ProductDTO/productView giữ seller và điểm xuất |
| `services/orderService.ts`, `paymentService.ts`, `quotationService.ts` | Hợp đồng API mới, version, scope, lỗi và retry |
| `types/index.ts`, `routes/index.tsx` | Type/route mới, bỏ suy luận quyền lợi bằng `as any` |
| `context/AuthContext.tsx` | Kiểm tra role mapping, refresh summary điểm/hội viên; không dùng profile cũ để quyết định giá |
| `pages/admin/AdminCustomOrdersPage.tsx`, `AdminGlobalOrdersPage.tsx` | Quote, điều phối phần hàng, shipment và COD |
| `pages/admin/AdminSubscriptionsPage.tsx`, `AdminFinancePage.tsx` | Quyền lợi cấu trúc, tiền thực nhận và đối soát |
| `pages/OrdersPage.tsx`, `OrderHistoryPage.tsx`, `SubscriptionsPage.tsx`, `CustomOrderPage.tsx` | Kiểm tra wiring/props; trang chỉ bọc component có thể không cần sửa |

File mới dự kiến: service/DTO checkout, shipment, bulk; trang chi tiết checkout; component bảng import bulk, duyệt quote, breakdown thanh toán và tiến độ từng kiện. Tên và vị trí chốt theo cấu trúc FE hiện có.

### 11.4. Cấu hình, test và tài liệu

- BE `pom.xml`: dependency migration/test nếu cần; không thêm dependency khi khả năng hiện có đã đáp ứng.
- BE `src/main/resources/application-postgres.properties`, `application-mssql.properties` và cấu hình profile liên quan: migration và chế độ kiểm tra schema sau chuyển đổi.
- BE `src/test/java/...`: cập nhật `OrderServiceTest`, `UserSubscriptionServiceTest`; thêm test pricing, checkout, payment, custom, bulk, inventory, point và integration concurrency.
- FE: thêm/cập nhật test hành trình phù hợp công cụ được chọn; bổ sung script/dependency chỉ khi cần để chạy kiểm thử đã nêu.
- Migration SQL/versioning, runbook đối soát/rollback, OpenAPI và `PROJECT_CONTEXT.md`; cập nhật tài liệu cũ để tránh chỉ dẫn mâu thuẫn.

## 12. Ảnh hưởng database và bộ SQL migration phải bàn giao

**Triển khai toàn bộ kế hoạch có thay đổi database và phải bàn giao migration.** Một số bản vá giai đoạn 1 có thể chỉ đổi code, nhưng nhóm fulfillment, phân bổ tiền, lịch sử điểm và đơn lớp cần schema/dữ liệu mới.

### 12.1. Các thay đổi schema dự kiến

Tên dưới đây mô tả nhóm dữ liệu; tên bảng/cột SQL cuối cùng phải khớp annotation entity và schema thực tế.

| Nhóm bảng hiện có/mới | Thay đổi |
|---|---|
| Checkout/order/order item/custom | Thêm version, snapshot, trạng thái tách biệt; chuẩn hóa unitPrice/lineTotal và liên kết nhóm |
| Payment | Phạm vi thu, version, tham chiếu provider/attempt; giữ nguyên chứng cứ giao dịch cũ |
| Point wallet | Thêm version nếu chọn optimistic locking; nếu dùng khóa bi quan thì thống nhất mọi đường cập nhật |
| Point transaction | Source, eventKey duy nhất, policyVersion |
| Subscription plan/user subscription | Duration, quyền lợi cấu trúc/snapshot, lịch sử thay thế/gia hạn |
| Inventory reservation mới | Quantity, expiry, chủ sở hữu và trạng thái giữ kho |
| Fulfillment/shipment/shipment item mới | Điểm xuất, người nhận, phần hàng/số lượng, phí, tracking và trạng thái |
| Quote revision mới | Báo giá bất biến, thiết kế/version, đơn giá/thành tiền và hạn hiệu lực |
| Payment allocation/attempt mới hoặc mở rộng | Phân bổ tiền thu và lịch sử gọi provider |
| Bulk order/member line mới | Lớp, đại diện, tên/MSSV/mẫu/màu/số lượng và duyệt mẫu |
| Idempotency/payment event mới | Chống xử lý lặp và lưu đối soát bền vững; chỉ thêm outbox nếu chọn triển khai worker |

Mỗi thay đổi phải kèm FK/index/unique/check phù hợp; xác minh kiểu UUID, decimal, timestamp và độ dài chuỗi trên hệ quản trị đích. Không dùng SQL CHECK cho các bất biến tổng hợp xuyên nhiều dòng thay cho khóa/transaction.

### 12.2. Hiện trạng cấu hình và hệ quản trị đích

Tại thời điểm kiểm tra 18/10/2026, cả profile PostgreSQL và SQL Server có `spring.jpa.hibernate.ddl-auto=update`. Có SQL rời như `migration_user_otp_cleanup.sql`, `data.sql`; chưa thấy cấu hình Flyway/Liquibase trong `pom.xml` đã kiểm tra.

- [ ] Viết script cho **Supabase PostgreSQL**; xác nhận schema/tên bảng/cột từ source và schema export do người dùng cung cấp khi cần. Không tự truy cập Supabase để kiểm tra.
- [ ] Không viết migration SQL Server trong đợt này; không tự xóa profile SQL Server hiện có chỉ vì database đích đã chốt.
- [ ] Bàn giao các file SQL đánh số phiên bản để người dùng chạy thủ công trong Supabase SQL Editor hoặc công cụ họ chọn. Không bắt buộc thêm Flyway/Liquibase và không cấu hình tự chạy script.
- [ ] Chuẩn bị thay đổi cấu hình production sang schema validation cùng hướng dẫn thời điểm áp dụng sau khi người dùng chạy SQL thành công; không để Hibernate update tự thay schema Supabase khi deploy code mới.
- [ ] Nếu bảng trong schema được Supabase API expose, rà quyền truy cập/RLS và đưa SQL cần thiết vào script bàn giao; không tự mở quyền hoặc mặc định cho client truy cập payment/point ledger.
- [ ] Không dùng `data.sql`/sample data để thay thế migration nghiệp vụ hoặc reset dữ liệu thật.

### 12.3. Thứ tự và nội dung script

Các tên đợt là mô tả, chưa phải script đã tồn tại. Đặt tên file đánh số thứ tự, ghi rõ PostgreSQL/Supabase và tiền điều kiện. Người dùng tự thực thi từng đợt; Codex không tự chạy trên Supabase.

| Đợt SQL | Bàn giao bắt buộc |
|---|---|
| 01 — Expand | Tạo bảng/cột/index bổ sung, ưu tiên nullable cho dữ liệu cũ; không xóa cột đang được code cũ dùng |
| 02 — Backfill | Mapping trạng thái/đơn/payment/subscription, snapshot và số dư mở đầu có nguồn migration |
| 03 — Reconcile | Query/báo cáo phát hiện quote mơ hồ, payment cha/con trùng phạm vi, ví lệch ledger, đơn thiếu địa chỉ/điểm xuất |
| 04 — Constrain | Siết FK/NOT NULL/unique sau khi dữ liệu đạt; script phải dừng hoặc báo lỗi rõ nếu tiền điều kiện chưa đạt |
| 05 — Contract | Dọn cột/đường tương thích cũ sau giai đoạn ổn định và xác nhận không còn caller |

Đi kèm mỗi đợt: tiền điều kiện, hệ quản trị hỗ trợ, thứ tự chạy, tác động khóa bảng/thời gian dự kiến sau rehearsal, query kiểm tra trước/sau và phương án phục hồi. Schema migration có version không nhất thiết chạy lại tùy ý; worker/backfill phải có checkpoint hoặc chống xử lý lặp để tiếp tục an toàn.

Không tự nhân `quotedPrice` cũ với quantity khi chưa xác định nghĩa giá. Không sửa lịch sử số tiền đã thu để khớp mô hình mới. Không ghi lịch sử điểm giả: số dư cũ thiếu ledger dùng opening balance/adjustment được audit.

### 12.4. Phân biệt vá code và thay đổi cần migration

| Có thể vá code trước, không bắt buộc đổi schema ngay | Cần migration cho thiết kế đầy đủ |
|---|---|
| Chặn customPrice client, cấm pay khi chưa chốt giá | Quote revision và snapshot giá/ưu đãi |
| Kiểm tra trạng thái/version confirm, chặn đường pay con sai phạm vi | Idempotency bền vững và unique constraint |
| Dùng khóa sản phẩm hiện có, gom quantity trước kiểm tra | Reservation có expiry/commit/release |
| Sửa danh sách VIP, đổi đúng gói, bỏ tự tính VIP/ship ở FE | Quyền lợi cấu trúc và lịch sử activation |
| Guard thanh toán trước sản xuất, trả lỗi PayOS đúng | Payment allocation, attempt và đối soát |
| Ghi ledger review bằng cấu trúc hiện có như bản vá tạm | Source/eventKey và cơ chế chống lặp thống nhất |
| Sửa mapping seller và thông báo UI | Shipment, fulfillment origin, bulk member lines |

Một bản vá code không được mô tả là đã hoàn thành chức năng cần schema mới. Mỗi PR có thay đổi dữ liệu phải bàn giao cùng entity/repository/service, SQL migration, test migration và hướng dẫn chạy; FE đi kèm khi API/UI bị ảnh hưởng.

### 12.5. Gói script bàn giao để người dùng tự chạy

- [ ] `README` ghi thứ tự chạy, backup, phiên bản code tương thích và thời điểm đổi `ddl-auto` sang `validate`.
- [ ] Script preflight chỉ đọc để người dùng kiểm tra schema hiện tại, dữ liệu trùng/mơ hồ và tiền điều kiện.
- [ ] Script expand, backfill, constrain và contract tách riêng; không gộp thao tác phá hủy vào bước thêm schema.
- [ ] Query đối soát trước/sau cho số đơn, tiền thực nhận, giữ kho, số dư ví và subscription.
- [ ] Hướng dẫn phục hồi/forward-fix theo từng đợt, nêu rõ thao tác không thể đảo an toàn khi đã có giao dịch mới.
- [ ] Ghi rõ script nào mới được viết, script nào đã test local và script nào đã được người dùng xác nhận chạy trên Supabase. Không báo “đã migrate database” khi chỉ tạo file SQL.

## 13. Hướng dẫn bàn giao cho Antigravity hoặc agent triển khai khác

### 13.1. Cách thực hiện và giới hạn

1. Đọc toàn bộ plan và source liên quan ở cả hai repo; kiểm tra trạng thái Git và hướng dẫn repo trước khi sửa. Không ghi đè thay đổi hiện có của người dùng.
2. Bắt đầu giai đoạn 0 bằng bản mapping source → vấn đề → thay đổi. Các kết luận review là điểm cần kiểm chứng với source mới nhất, không phải lý do để viết lại module đã được sửa đúng.
3. Triển khai theo các đợt mục 10. Có thể viết code nhiều đợt trong workspace, nhưng không bật nhánh mới khi thiếu schema/API phụ thuộc. Không tạo PR, push, merge hoặc deploy chỉ vì bảng gọi tên “PR”; đó là ranh giới review, cần tuân theo yêu cầu riêng của người dùng.
4. Idempotency bền vững cần schema/unique tương ứng. Nếu PR 1 cần tính năng này, đưa SQL expand tối thiểu vào cùng đợt; không dùng cache bộ nhớ hoặc chỉ disabled button để tuyên bố đã chống request lặp.
5. Cấm truy cập/chạy script trên Supabase theo mục 1. Không chạy app/test bằng cấu hình có thể kết nối Supabase, kể cả chỉ để “validate schema”. Chỉ chạy DB local/test cô lập sau khi xác minh target không phải DB thật; không in connection string/secret vào log.
6. Tách rõ **code đã hoàn thành**, **SQL đã viết**, **test đã chạy**, **chờ người dùng áp dụng SQL** và **đã được xác nhận chạy trên Supabase**. Không tick một bước vận hành production chỉ vì đã viết script.
7. Nếu thiếu schema thật, tạo preflight query để người dùng tự chạy và ghi giả định trong README. Không đoán rồi thực hiện destructive SQL hoặc yêu cầu credentials để tự chạy.
8. Giữ luồng Studio/xuất file và UI ngoài phạm vi ổn định. Không dùng mock/localStorage để thay thế trạng thái đơn, giá, tiền hoặc điểm cần lưu server.

### 13.2. Các chi tiết phải chốt trong thiết kế trước khi viết module

- **Trạng thái trả tiền từng phần:** bổ sung PARTIALLY_PAID hoặc trường paidAmount/outstandingAmount có quy tắc tổng hợp tương đương. AS_READY có một nhóm đã trả không được hiển thị toàn đơn PAID; phần chưa có giá phải phân biệt với khoản nợ đã chốt.
- **Công thức điểm:** điểm mục tiêu = floor(tổng tiền hàng ròng đủ điều kiện đã thu và hoàn tất / 10.000); delta = điểm mục tiêu − tổng điểm mua hàng ròng đã ghi cho checkout. REVIEW không nằm trong tổng điểm mua hàng này. Giữ nguyên phần lẻ trong cơ sở tính, không làm tròn từng shipment.
- **Phân bổ ưu đãi:** xác định dòng đủ điều kiện, phân bổ theo tỷ lệ, làm tròn xuống rồi phân bổ số đồng còn lại theo thứ tự line ID ổn định; tổng allocation phải bằng tổng giảm giá. Hoàn hàng dùng allocation đã snapshot, không tính lại giá lịch sử theo plan hiện tại.
- **Snapshot hội viên:** dùng quyền lợi hợp lệ khi chốt phiên bản giá được khách duyệt, không lấy lại giá từ profile FE. Quyền lợi đã chốt không bị mất chỉ vì hội viên hết hạn sau đó. Báo giá lại phải giải thích thay đổi và được duyệt lại.
- **WAIT_ALL và nhiều điểm xuất:** WAIT_ALL là chờ đủ, không tự đồng nghĩa một kiện. Khi không có điểm gom, UI phải hiển thị số kiện/phí thực tế; không hứa “giao chung một kiện”.
- **Shipping policy chưa có cấu hình thật:** giữ phương án phí cấu hình rõ ràng hoặc trạng thái cần báo phí; không tự tạo mức giá/kết nối hãng giao giả. Không bật ưu đãi bulk/VIP chưa chốt trong dữ liệu vận hành.
- **COD custom và đổi gói:** đây là lựa chọn kinh doanh, không suy ra từ role hoặc banner. Triển khai theo cấu hình, hiển thị điều kiện; chính sách chưa được chốt không được âm thầm bật trên production. Mặc định đề xuất mục 3 chỉ dùng để xây dựng code/test có thể điều chỉnh.
- **Sự kiện thanh toán đến trước mapping hoàn chỉnh:** commit attempt/provider code trước lời gọi mạng; lưu đối soát cho callback hợp lệ chưa map được, không báo đã xử lý rồi bỏ sự kiện. Test timeout, callback đến sớm và retry request/admin.
- **Worker tùy chọn:** bản đầu dùng request-driven retry và reconciliation, không cần broker, Quartz hoặc ShedLock. Nếu nâng cấp sang Outbox, bắt buộc claim có DB lock/lease, retry có giới hạn và trạng thái cần can thiệp; scheduler chỉ đánh thức xử lý, không bảo đảm đúng một lần. UI đọc trạng thái server; không hứa tự retry khi app sleep.

### 13.3. Artifact tối thiểu sau mỗi đợt

- Checklist ID vấn đề đã xử lý và ID còn mở, kèm lý do/phụ thuộc.
- Danh sách file sửa/tạo mới ở FE và BE; API hoặc trạng thái thay đổi.
- SQL Supabase PostgreSQL đánh số, preflight/post-check và README khi có thay đổi schema/dữ liệu.
- Lệnh test/build thực tế đã chạy cùng kết quả; test bị chặn phải ghi nguyên nhân và giới hạn kết luận.
- Hướng dẫn chạy local, feature flag và thứ tự áp dụng SQL/code để người dùng không khởi động code mới trên schema cũ.
- Không yêu cầu reset/drop DB, xóa lịch sử giao dịch hoặc chạy script seed để đạt test/khởi động thành công.

### 13.4. Prompt giao việc có thể sao chép

```text
Đọc PLAN_SUBSCRIPTION_ORDER_PAYMENT.md trong repo FE và source hiện tại của cả FE/BE.
Thực hiện sửa theo plan, bắt đầu từ giai đoạn 0 và đi theo từng đợt có kiểm thử.
Kiểm chứng vấn đề trên source mới nhất, giữ thay đổi hiện có của tôi, không mở rộng
sang thiết kế Studio/xuất file ngoài phạm vi. Các chính sách chưa chốt phải để cấu hình,
ghi rõ giả định và không tự bật ưu đãi hoặc quyền COD trên production.

Database là Supabase PostgreSQL: chỉ viết SQL script đánh số, preflight/post-check
và README để tôi tự chạy. Không kết nối Supabase, không chạy DDL/DML/backfill,
không cấu hình migration/ddl-auto tự đổi schema, không chạy app/test trỏ DB thật.
Không tự push/merge/deploy. Không dùng mock để thay backend nghiệp vụ.

Mỗi đợt báo: vấn đề đã đóng/còn mở, file thay đổi, SQL cần tôi chạy, kết quả test
và phụ thuộc trước khi bật tính năng. Phân biệt code đã sửa với database chưa áp dụng.
Không tuyên bố hoàn tất toàn plan khi mới vá guard hoặc chưa kiểm thử bốn luồng.
```

## 14. Điều chỉnh sau phản biện kiến trúc

Mục này chốt cách triển khai bản đầu và được ưu tiên nếu checklist tổng thể phía trên có thể bị hiểu là yêu cầu dựng toàn bộ hạ tầng ngay.

### 14.1. Hạ tầng tối thiểu cho monolith

- Không bắt buộc RabbitMQ/Kafka, Quartz, ShedLock hoặc distributed scheduler. DB idempotency, attempt/event bền vững và transaction vẫn bắt buộc; không đánh đồng chống xử lý lặp với background worker.
- Lazy expiry áp dụng cả lúc tính tồn cho khách khác, không chỉ khi chủ đơn cũ quay lại. Sau expiresAt, reservation không còn chiếm tồn dù status chưa được job đổi sang EXPIRED.
- Dùng cùng thời gian DB, khóa sản phẩm theo thứ tự ổn định; expiry và settle đồng thời phải có test. Nếu reservation cũ hết hạn, callback trả tiền phải kiểm tra lại tồn khả dụng gồm cả reservation của người khác.
- Không giữ transaction/lock trong khi gọi PayOS. Request/admin verify là đường retry chủ động; webhook là nguồn nhận xác nhận. Khi app sleep không bảo đảm xử lý tức thì; sau khi app chạy lại phải có đường đối soát, không mất dấu tiền thực nhận.
- Outbox là nâng cấp khi cần tự động xử lý dù người dùng không quay lại hoặc khối lượng tăng; không phải điều kiện hoàn tất bản đầu.

### 14.2. Schema và môi trường test

- Quy định cấm truy cập chỉ áp dụng Supabase do người dùng quản lý; vẫn cho phép PostgreSQL local/test cô lập hoặc Testcontainers khi môi trường hỗ trợ. Test concurrency không được thay bằng mock repository.
- SQL do người dùng tự áp dụng. Chạy rehearsal trên PostgreSQL test từ schema snapshot đã loại bỏ dữ liệu nhạy cảm, áp SQL, rồi khởi động JPA validate và test integration. Thiếu Docker/PostgreSQL thì ghi rõ test chưa chạy, không tuyên bố đã kiểm chứng concurrency.
- Có thể dùng ddl-auto=update cho DB local dùng thử, có thể xóa; test nghiệm thu migration phải dùng SQL + validate để bắt sai kiểu/cột. Không dùng update trên Supabase dev/prod vì việc đó vẫn tự thay DB và trái yêu cầu người dùng.
- Validate giúp phát hiện lệch schema trước khi code xử lý giao dịch. Giảm rủi ro khởi động lỗi bằng preflight, kiểm tra kiểu PostgreSQL/JPA và thứ tự triển khai, không bằng tự sửa schema production. Không coi validate là công cụ kiểm tra đủ mọi index/constraint; có query post-check riêng.

### 14.3. Quyết định mô hình vận hành là đầu vào bắt buộc

- Chưa khẳng định PrintHub là một xưởng hay marketplace đa nơi xuất. Trước khi bật giao chung một kiện, người dùng cần xác nhận seller là creator hay đơn vị giữ/giao hàng thực sự.
- Nếu một xưởng: cấu hình điểm xuất PrintHub rõ ràng và gom hàng đủ điều kiện tại đó; không cần dựng mạng lưới hub.
- Nếu nhiều seller tự giao: tách theo điểm xuất; chưa có hub thì không cung cấp một kiện cho hàng khác điểm xuất. Có thể WAIT_ALL nhiều kiện với mô tả/chi phí thực tế.
- Khi chưa có quyết định, mặc định UI không hứa một kiện và không tự gán mọi seller về xưởng PrintHub; tiếp tục độc lập phần subscription, giá, payment và bulk model.

### 14.4. WAIT_ALL không làm mất công đặt hàng

- Khi hết hàng/đổi giá sau thời gian chờ quote, giữ nguyên checkout ID, thiết kế, quote, danh sách lựa chọn và dữ liệu nhập. Không bắt khách tạo lại đơn.
- Preview/reconfirm trả mã lỗi nghiệp vụ và breakdown: dòng nào đổi giá, thiếu bao nhiêu, dòng nào vẫn hợp lệ; trả các lựa chọn được phép và expectedVersion mới.
- Khách chọn bỏ/thay dòng hàng sẵn, chờ bổ sung hàng có thời hạn do admin xác nhận, hoặc chuyển AS_READY cho phần hợp lệ; không tự chọn thay khách và không giữ kho dài ngày mặc định.
- Quote custom còn hiệu lực được giữ; thay phần hàng làm thay đổi ưu đãi/ship thì tạo summary mới và yêu cầu duyệt lại. Chỉ reset quote custom khi thay đổi thực sự ảnh hưởng thiết kế/phạm vi báo giá.
- Sau khi khách duyệt tổng hợp lệ mới tạo giữ kho ngắn hạn và payment. Thêm E2E báo giá sau một ngày, hàng sẵn hết/đổi giá và khôi phục ngay trên đơn hiện tại.

### 14.5. Bulk là phân hệ mới, chia nghiệm thu riêng

- PR 7A là MVP: tạo một lô bằng bảng nhập thủ công, kiểm tra tên/MSSV/mẫu/màu/quantity, giá toàn lô, xác nhận danh sách/thiết kế, đại diện thanh toán và giao một điểm. Tái sử dụng pricing/payment/shipment/point đã có; không tạo hệ thanh toán thứ hai.
- PR 7B giữ trong phạm vi tổng thể nhưng là đợt mở rộng riêng: CSV/Excel, workflow duyệt mẫu và xuất packing list. Không chặn phát hành bản vá order/payment/subscription chỉ vì 7B chưa xong; phải ghi rõ bulk chưa đạt đầy đủ nghiệm thu cuối.
- Không ước lượng bulk chiếm 30–40% hoặc đưa lịch cố định khi chưa phân rã task và đo code thực tế. Báo khối lượng bulk độc lập với sửa lỗi hiện tại.

## 15. PostgreSQL Docker local — Antigravity cấu hình và chạy test

Người dùng đã yêu cầu thêm môi trường PostgreSQL Docker local và giao Antigravity cấu hình **rồi chạy test thực tế**, không chỉ viết hướng dẫn. Đây là việc cần làm sớm trong giai đoạn 0, trước khi nghiệm thu các thay đổi giao dịch. Không thay đổi quy định người dùng tự chạy SQL trên Supabase.

### 15.1. Hiện trạng và file bàn giao

Đã kiểm tra BE `docker-compose.dev.yml`: hiện chỉ chạy service Redis `sba-redis`, container `exe-dev`, host port `6380` sang container port `6379`. Không coi Redis là database để test JPA/PostgreSQL.

- [ ] Tạo BE `docker-compose.test.yml` riêng cho PostgreSQL test. Không đổi/xóa Redis và container hiện có; không dùng cùng volume với DB khác.
- [ ] Tạo `src/main/resources/application-test-local.properties` và cấu hình test tương ứng trong `src/test/resources/` nếu cần. Profile phải được chọn tường minh, không đổi profile mặc định thành profile test.
- [ ] Tạo thư mục BE `scripts/db-test/` hoặc vị trí theo quy ước repo, chứa bootstrap/schema baseline, script apply migration local và pre/post-check cần thiết. Các SQL dùng để giao người dùng chạy Supabase phải được kiểm thử tại đây khi tương thích; phần riêng Supabase ghi rõ giới hạn.
- [ ] Tạo hướng dẫn `TEST_POSTGRES_DOCKER.md` trong BE: khởi động, kiểm tra health, áp SQL, chạy BE/test, xem log, dừng, reset dữ liệu test và cách xử lý port trùng.
- [ ] Dùng image PostgreSQL có major version cố định; chọn theo version Supabase thực tế khi có thông tin, nếu chưa biết thì ghi rõ version local được chọn và chênh lệch chưa kiểm chứng. Không dùng `latest`.

### 15.2. Cấu hình cô lập bắt buộc

- [ ] Đề xuất host port `127.0.0.1:5433:5432`, DB `printhub_test`, user/password chỉ dành local test; kiểm tra port trước và ghi override nếu bị chiếm.
- [ ] Healthcheck bằng pg_isready, volume test có tên riêng và Compose project riêng, ví dụ `printhub-test`; script thao tác dùng đúng file/project/service đã định danh.
- [ ] Datasource test trỏ tường minh localhost:5433/printhub_test. Không fallback sang DATABASE_URL, datasource hoặc secret của Supabase khi thiếu biến test.
- [ ] Thêm guard trước test/script: target phải là DB local/test đã cấu hình, từ chối remote host và tên DB không đúng phạm vi. Không in mật khẩu/connection string nhạy cảm ra log.
- [ ] Kiểm tra cơ chế nạp `.env`/profile hiện có để test-local không bị credential Supabase ghi đè. Không sửa hoặc in secret hiện hữu.
- [ ] Dùng account test riêng, không dùng thông tin Supabase. Chỉ ứng dụng kết nối localhost; không mở PostgreSQL test ra mạng ngoài.
- [ ] PayOS/mail/upload/notification bên ngoài phải mock hoặc dùng test adapter; không tạo link, gửi thư hoặc gọi dịch vụ production để chạy test. Redis chỉ dùng khi bài test cần và không flush Redis dev hiện có; bổ sung Redis test riêng nếu cần cô lập.
- [ ] Script reset chỉ được tác động DB/volume test đúng định danh; không dùng `docker system prune`, xóa volume diện rộng hoặc tác động container dự án khác.

### 15.3. Quy trình schema và migration local

1. Khởi động PostgreSQL test, chờ healthcheck và xác minh target.
2. Dựng baseline đại diện schema cũ từ SQL/schema export đã làm sạch; nếu chỉ dựng từ entity hiện tại thì báo rõ đây chưa phải kiểm chứng migration dữ liệu cũ thực tế.
3. Thêm fixtures có đơn standalone/cha/con, quantity > 1, quote mơ hồ, payment, ví và subscription để kiểm tra backfill/đối soát.
4. Chạy preflight, áp các SQL theo thứ tự, chạy post-check. Script gặp dữ liệu mơ hồ phải báo cần đối soát, không tự sửa lịch sử tiền.
5. Chạy BE/test profile test-local với `ddl-auto=validate`, tắt auto seed `data.sql` và cơ chế init tự thay schema. Chỉ dùng update/create cho DB dùng thử riêng, không dùng để chứng minh SQL migration đã đúng.
6. Kiểm tra thêm FK/index/unique và bất biến bằng SQL/test; Hibernate validate không thay thế các kiểm tra này.
7. Supabase extension/auth/RLS không được PostgreSQL thuần tái hiện đầy đủ: tách script và ghi rõ phần chưa được test tương đương Supabase; không tự kết nối Supabase để bù kiểm thử.

### 15.4. Các test Antigravity phải thực thi

- [ ] Chạy build/test BE, build FE và test hồi quy phù hợp thay đổi; lưu lệnh và kết quả thực tế.
- [ ] Integration test chạy transaction/kết nối độc lập, có barrier/latch để tạo tranh chấp thật; không dùng tuần tự hoặc mock repository để giả lập concurrency.
- [ ] Hai checkout mua món cuối: chỉ một bên giữ/commit thành công; tồn và reservation không âm/sai tổng.
- [ ] Confirm/settle lặp và song song: chỉ commit kho, phân bổ tiền, cấp điểm đúng một lần.
- [ ] Lazy expiry: khách cũ không quay lại nhưng người mới vẫn mua được sau expiry; callback muộn tranh chấp cùng người mua mới không bán vượt tồn.
- [ ] Hai cộng điểm cùng ví, cộng điểm đồng thời redeem/review và tạo ví lần đầu: ledger/số dư nhất quán.
- [ ] Migration fresh schema và upgrade baseline + fixtures; sau áp SQL khởi động JPA validate thành công.
- [ ] E2E bốn luồng theo mức tính năng đã triển khai; bulk 7A/7B báo riêng. Test chưa thể chạy phải ghi nguyên nhân và không đánh dấu pass.

### 15.5. Kết quả cần báo cho người dùng

- File Docker/profile/script đã tạo; phiên bản PostgreSQL, port và tên DB local test.
- Lệnh ngắn để người dùng chạy lại môi trường và test; cách dừng/reset đúng phạm vi.
- Bảng test pass/fail/skipped và log/báo cáo cần thiết, bao gồm giới hạn fixture/schema baseline.
- SQL Supabase đã test phần nào, phần nào cần người dùng kiểm tra; trạng thái Supabase vẫn là **chưa áp dụng** cho tới khi người dùng xác nhận tự chạy.
- Không chỉ dừng ở việc viết Compose nếu Docker hoạt động. Nếu Docker/permission/image download chặn thực thi, báo đúng lỗi và phần test còn thiếu, không tuyên bố test thành công.

## 16. Quyết định bổ sung: bỏ seller, grace period, COD custom, ví điểm và cart sync

Các quyết định tại mục này thay thế lựa chọn cũ còn ghi “cần chốt” về seller, COD custom và ví âm trong các mục trước. Agent phải áp dụng đồng bộ trong code, SQL, DTO, UI và test; không giữ hai chính sách trái nhau.

### 16.1. Bỏ maker/seller khỏi nghiệp vụ đặt hàng

- Người dùng xác nhận bỏ maker/seller: PrintHub trực tiếp điều phối hàng sẵn và custom. Không còn nhóm đơn, kiểm tra quyền bán, phí hoa hồng seller hay điều kiện giao dựa vào seller_id. Điểm xuất PrintHub phải cấu hình rõ; không suy ra vị trí địa lý từ user cũ.
- SQL expand: `orders.seller_id` và `products.seller_id` nếu đang NOT NULL thì DROP NOT NULL; sửa entity nullable tương ứng. Giữ giá trị/FK lịch sử hợp lệ trong giai đoạn tương thích. FK không bắt buộc cột phải NOT NULL; không drop FK chỉ để cho phép NULL.
- Rà cả OrderServiceImpl và CheckoutOrderServiceImpl: bỏ seller validation/grouping, tạo một marketplace Order cho phần hàng được chọn trong checkout; nhóm fulfillment vẫn dựa readiness/điểm xuất nếu có. Không gán seller giả hoặc chọn một admin làm seller để né lỗi schema.
- Rà toàn bộ `getSeller()`, sellerId/sellerName mapping, repository/query, Product DTO/service, finance/commission và API cũ; mọi response lịch sử phải đọc được seller NULL. Không chỉ sửa vòng grouping gây NPE.
- Bỏ UI cảnh báo/ép SEPARATE vì multi-seller; thay bằng khả năng giao do BE trả. Không cần thêm sellerId mới vào FE chỉ để hỗ trợ logic đã bỏ.
- Commission cũ giữ để đối soát; đơn mới không tạo khoản hoa hồng seller. Không thay đổi số tiền lịch sử. Contract script chỉ drop cột/FK sau khi không còn caller và có quyết định dọn dữ liệu riêng.
- Test product không seller, order lịch sử seller NULL và cả hai đường tạo đơn; không NPE và không chia đơn theo seller.

### 16.2. Grace period giữa link và giữ kho

- Tách `paymentExpiresAt` và `reservationExpiresAt`: link PayOS đề xuất 15 phút, reservation = paymentExpiresAt + 5 phút. Cùng một mốc thời gian được lưu trước khi gọi provider; không cộng lại 20 phút mỗi lần retry.
- Kho vẫn được giữ trong grace period dù UI đã báo link hết hạn. Không release chỉ vì client quay về cancel URL hoặc đồng hồ FE về 0; hủy thực sự phải kiểm tra trạng thái provider/luồng hủy và chính sách callback muộn.
- Retry link không tự gia hạn kho vô hạn. Khi cần link mới, revalidate tồn/giá và xử lý link cũ; bảo đảm không có hai link hoạt động thu cùng nghĩa vụ.
- Grace period giảm rủi ro, không bảo đảm webhook luôn tới trong 5 phút. Callback sau 20 phút vẫn phải ghi nhận tiền và kiểm tra lại tồn dưới lock; thiếu hàng chuyển đối soát, không bỏ qua hoặc tự đánh dấu fulfillment thành công.
- Test khách trả lúc 14:50, callback lúc 15:10: vẫn giữ hàng; callback sau 20 phút cùng khách mới mua món cuối: không bán vượt tồn, tiền cũ có đối soát rõ ràng. Dùng clock có thể điều khiển, không sleep 20 phút trong test.

### 16.3. Custom chỉ thanh toán PayOS

- Cấm COD cho mọi custom, kể cả Studio, upload, vault, bulk hoặc custom con trong checkout. FE ẩn COD; BE kiểm tra độc lập tại create/update/accept/confirm/payment, không chỉ ở một controller.
- Đơn thuần hàng sẵn vẫn có thể COD theo chính sách. Đơn hỗn hợp WAIT_ALL dùng PayOS cho toàn phạm vi thu; AS_READY có thể cho marketplace COD và custom PayOS nếu payment scope theo nhóm đã hỗ trợ. Nếu chưa hỗ trợ nhiều phương thức thì toàn đơn dùng PayOS, không ngầm cho custom COD.
- Bulk chứa custom dùng PayOS; không triển khai cọc trong đợt này.
- Đơn custom COD cũ không tự đổi thành đã trả tiền hoặc tự chuyển sang PayOS. Script preflight liệt kê để admin xử lý; giữ chứng cứ giao dịch đã hoàn tất. Quy tắc chuyển tiếp cho đơn đang chạy phải được ghi trong runbook.
- Test gửi COD trực tiếp vào API dù UI đã ẩn, custom nested trong mixed/bulk và standalone; mọi đường mới đều từ chối COD custom bằng lỗi rõ ràng.

### 16.4. Balance không âm và cộng/đổi điểm đúng

- Chỉ cấp điểm mua hàng khi phần hàng đủ điều kiện đã COMPLETED/DELIVERED và thu tiền thành công.
- Chưa thấy CHECK balance >= 0 trong entity đã đọc; schema Supabase thật cần preflight. Thiết kế giữ balance >= 0 và SQL bổ sung CHECK sau đối soát dữ liệu cũ.
- Cộng điểm và redeem đều khóa ví, ghi ledger cùng transaction và có eventKey chống lặp. Redeem kiểm tra đủ số dư, không clamp số dư để che lỗi trừ vượt ví.
- Không có bảng unrecovered obligation, logic thu hồi điểm hoặc điều kiện chặn redeem vì refund trong đợt này.
- Test cộng điểm/đổi gói đồng thời, redeem lặp, hai redeem tranh chấp số dư và tạo ví lần đầu; balance không âm, ledger khớp số dư.

### 16.5. Cart sync trước checkout, không ghi đè hoặc cộng trùng

- API hiện có là **PUT /api/cart**, không phải POST. useCart đã có nhánh merge guest sau đăng nhập; cần sửa độ tin cậy của luồng này, không kết luận thiếu toàn bộ sync và không thêm POST trùng chức năng tùy tiện.
- Khi đăng nhập: đọc cart DB, merge guest với định danh clientLineId ổn định và quy tắc rõ cho dòng cùng sản phẩm/thiết kế, lưu server rồi dùng response chuẩn hóa làm state FE. Không PUT chỉ guest cart làm mất cart DB.
- Merge guest cần mergeBatchId/idempotency bền vững hoặc cơ chế tương đương: timeout sau commit, StrictMode, hai tab hoặc retry không cộng quantity lần hai. Không gộp hai custom khác revision/cá nhân hóa chỉ vì cùng productId.
- Chỉ xóa dữ liệu guest sau server xác nhận; lỗi đồng bộ giữ bản local và hiển thị retry. Chặn checkout trong khi hydration/merge/save đang chạy hoặc có lỗi.
- Trước create checkout, chờ hàng đợi save xong và dùng line ID/revision từ response DB; không gửi selection local cũ chưa được server nhận. Checkout kiểm tra đủ selection và trả conflict có thể phục hồi, giữ nguyên giỏ/đơn nhập.
- Full replace cart hiện có cần version/khóa chống ghi đè từ tab cũ; có thể thêm endpoint merge riêng có idempotency thay vì lạm dụng PUT toàn bộ nếu phù hợp thiết kế cuối.
- Test guest → login → checkout, cart DB đã có hàng, timeout sau server save, retry/StrictMode/hai tab, custom khác thiết kế và chuyển user giữa lúc request đang chạy; không EMPTY_SELECTION sai, mất hàng hoặc nhân đôi số lượng.

## 17. Definition of Done

Một giao dịch từ bất kỳ luồng nào đều truy vết được: thiết kế/sản phẩm nào → phiên bản giá nào → ưu đãi nào → giữ kho nào → đã thu bao nhiêu → giao kiện nào → cộng/đổi bao nhiêu điểm. Retry hoặc thực thi đồng thời không tạo thêm nghĩa vụ thanh toán, mất kho hoặc sai số dư. Khoản đã nhận tiền nhưng chưa thể xử lý đơn có trạng thái đối soát rõ ràng; không có chức năng refund trong phạm vi nghiệm thu.
