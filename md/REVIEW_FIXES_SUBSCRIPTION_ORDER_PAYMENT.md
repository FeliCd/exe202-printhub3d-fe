# Danh sách sửa lỗi sau review FE/BE

Ngày: 18/10/2026. Căn cứ: source đang lưu trên ổ đĩa sau đợt chỉnh sửa của Antigravity và `PLAN_SUBSCRIPTION_ORDER_PAYMENT.md`.

## 1. Cách sử dụng và phạm vi

Tài liệu này là backlog sửa lỗi có thể thực thi, không phải xác nhận toàn bộ kế hoạch đã hoàn thành. Số dòng là mốc lúc review; khi sửa tìm theo class/method vì dòng sẽ dịch chuyển.

- BE: `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d` (ký hiệu `B/`).
- FE: `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src` (ký hiệu `F/`).
- Resources BE: `D:/semester 7/EXE/PrintHub_3D/src/main/resources` (ký hiệu `R/`).
- SQL BE: `D:/semester 7/EXE/PrintHub_3D/scripts/db-test` (ký hiệu `SQL/`).

Giải pháp hướng tới dự án khởi nghiệp sinh viên: giữ monolith Spring Boot, PostgreSQL, service dùng chung, DB lock và retry chủ động. Không bắt buộc broker, microservice hoặc background worker. Không xây chức năng hoàn tiền; tiền không xử lý được đơn phải lưu để admin đối soát. Agent chỉ viết SQL Supabase để người dùng tự chạy; test trên PostgreSQL Docker local cô lập.

P1: phải sửa trước khi dùng giao dịch thật. P2: sửa trước nghiệm thu tính năng liên quan. Không xóa dữ liệu hoặc ghi đè thay đổi đang có để làm test pass.

### Quyết định người dùng đã chốt sau review

Các quyết định này là phạm vi triển khai bắt buộc, thay thế đề xuất trước đó về khóa giao riêng. Nếu tài liệu kế hoạch tổng thể còn cho phép nghiệm thu bằng cách ẩn SEPARATE thì không áp dụng lựa chọn đó cho đợt sửa này.

1. **Hỗ trợ cả WAIT_ALL và SEPARATE**, không khóa/loại SEPARATE để giảm phạm vi MVP. Một CheckoutOrder có hai nhóm cố định khi có đủ hai loại hàng: MARKETPLACE (hàng sẵn) và CUSTOM. Đơn chỉ có một loại thì chỉ có một nhóm tương ứng.
2. **WAIT_ALL:** chờ toàn bộ giá được chốt, khách duyệt tổng và thanh toán một phạm vi toàn đơn; hàng sẵn chờ custom hoàn tất, giao chung một đợt tại xưởng PrintHub. Phí giao chung tính một lần, không cộng hai phí nhóm. Có custom thì toàn phạm vi dùng PayOS.
3. **SEPARATE:** nhóm hàng sẵn xác nhận/thu tiền hoặc COD hợp lệ và xử lý giao trước; nhóm custom tiếp tục báo giá → khách duyệt → PayOS → in → giao sau. Mỗi nhóm có subtotal/discount/shipping/payable, version, trạng thái thanh toán/giao và tracking riêng; không thu phần custom chưa chốt giá. **Phí ship chỉ thu một lần cho toàn checkout, không thu lại đợt 2** theo quy tắc mục 8 bên dưới.
4. **Báo giá mới dùng quotedPrice là đơn giá một chiếc.** Line total = quotedPrice × quantity; tổng thanh toán cộng ship và các khoản giảm đã được xác định. Không tự chuyển nghĩa/nhân dữ liệu báo giá cũ, đặc biệt đơn đã trả tiền. Giảm theo số lượng đã nằm trong đơn giá báo thì không áp lại cùng ưu đãi lần hai.
5. **Chọn trang chi tiết `/checkout/:id`** để đọc đơn từ server, duyệt quote/version và thanh toán; lịch sử đơn và thông báo dẫn tới đây. Không triển khai phương án danh sách đơn làm nơi duyệt duy nhất.
6. **Thêm payment_attempts và sửa logic retry/webhook đi kèm.** Mỗi attempt giữ provider code duy nhất, amount, payment scope và phiên bản giá bất biến; lưu trước gọi mạng, không ghi đè mã cũ. Timeout tra mã cũ; tiền đến khi đơn không còn đủ điều kiện chuyển cần đối soát.
7. **Không có refund.** Agent chỉ viết SQL PostgreSQL cho người dùng tự chạy Supabase. Test local cô lập và báo kết quả thật.
8. **Phí ship cấu hình bởi admin, mặc định 15.000 VND cho toàn đơn**, áp dụng cả giao chung và giao riêng; không gọi API hãng vận chuyển trong đợt này. Có hai đợt giao vẫn không thu 30.000đ. BE đọc cài đặt cửa hàng, áp quyền lợi subscription rồi trả phí cuối; FE bỏ các công thức ship riêng tại CartPage/custom checkout. Có thể phân bổ phí một lần vào nhóm MARKETPLACE khi nhóm đó có hàng và được xác nhận trước; đơn chỉ custom thu cùng nhóm CUSTOM. Nhóm còn lại hiển thị 0đ — đã tính phí trong đơn, không mô tả đây là ưu đãi VIP nếu không có ưu đãi.
9. **Admin chỉnh gói trên màn hình tạo/sửa gói hiện có:** tên, giá, điểm đổi, description, thời hạn và quyền lợi giảm tiền hàng/giảm hoặc miễn ship có cấu trúc. Phải lưu/đọc lại qua BE và có tác dụng thật khi tính đơn; mô tả không thay thế cấu hình. Sửa lỗi đổi gói B nhưng vẫn giữ gói A; không thêm engine ưu đãi hoặc quy trình mua gói bằng PayOS mới nếu chưa được yêu cầu.
10. **Bulk vẫn bắt buộc:** bản đầu là một loại đơn BULK có bảng nhập thành viên thủ công, quote toàn lô, đại diện thanh toán và giao một điểm. Excel/CSV làm đợt mở rộng sau; không coi import là điều kiện để bắt đầu bulk. Cập nhật này thay thế đề xuất trước về đưa CSV vào ngay bản đầu.

Snapshot phí/ưu đãi: khi khách xác nhận scope đầu tiên, lưu phí toàn đơn, phần giảm ship, policy version, quyền lợi hội viên đã dùng và scope chịu phí. Admin đổi phí/gói sau đó không làm thay đổi khoản đã chốt; đợt 2 không đọc lại cấu hình để thu ship mới. Nếu thay đổi đơn trước xác nhận thì preview lại; sau khi đã thu/commit nghĩa vụ, không tự chuyển phí sang scope khác. Hủy scope chịu phí cần kiểm tra phần còn lại và yêu cầu khách duyệt điều chỉnh nếu phù hợp, không cộng phí lần hai hoặc hoàn tiền tự động.

Quy ước API: BE chọn một bộ enum nội bộ thống nhất. `COMMON` cũ ánh xạ WAIT_ALL; `SEPARATE` và tên AS_READY trong tài liệu cũ cùng nghĩa giao từng phần, không tạo thành chế độ thứ ba. Có adapter tương thích, FE mới gửi đúng hợp đồng đã chốt.

## 2. Thứ tự triển khai đề nghị

| Đợt | Mục cần làm | Kết quả |
|---|---|---|
| Chuẩn bị | L13–L14, thiết kế G01/G02 và schema scope | PostgreSQL test cô lập, schema/API thống nhất cho ALL hoặc MARKETPLACE/CUSTOM; chốt cấu hình ship/subscription trước tính tiền |
| A | L01–L07 + phần BE G01/G02 | Kho/payment/idempotency/COD hỗ trợ cả hai mode ngay từ đầu, phí ship toàn đơn thu một lần |
| B | L08–L10, L12 + phần FE/admin G01/G02 | Trang chi tiết có hai nhóm, duyệt/thu/giao đúng scope; cấu hình gói/ship có tác dụng thật |
| C | L11, L13–L15 | Đồng bộ giỏ, cấu hình DB an toàn, bộ test có giá trị |
| D | G03 bản 7A | Bulk là loại đơn riêng, nhập bảng thủ công, báo giá cả lô, kiểm tra kho khi có hàng sẵn, thanh toán/giao một điểm |
| Mở rộng | G03 bản 7B | Import Excel/CSV, validation theo dòng, duyệt mẫu/packing list nâng cao |

Không trì hoãn G01 tới đợt D: payment scope và UI hai nhóm được thiết kế ngay từ đợt A/B để tránh viết lại mô hình một lần thu. Không trì hoãn toàn bộ FE tới cuối: mỗi thay đổi API phải có FE caller tương ứng hoặc adapter tương thích. Làm A–C trước rồi bulk; chưa xong 7A chưa được nghiệm thu đủ bốn luồng. Không cam kết không bao giờ refactor, phải kiểm thử từng đợt.

## 3. Lỗi cần sửa

### L01 — P1: Thanh toán muộn vẫn commit kho không còn đủ

**Vị trí:** `B/service/impl/PaymentServiceImpl.java`, `settle()`, khoảng dòng 356–370; `B/repository/InventoryReservationRepository.java`.

**Nguyên nhân:** chỉ kiểm tra status RESERVED, không kiểm tra hạn giữ hoặc tồn khả dụng dành cho người khác. Dùng `Math.max(0, stock - quantity)` che thiếu kho.

**Ảnh hưởng:** A hết hạn, B mua món cuối, callback A đến vẫn báo PAID/COMMITTED; hệ thống nhận hai nghĩa vụ giao cho một món.

**Hướng khả thi:** một inventory service dùng transaction và khóa PostgreSQL; lazy expiry, không cần scheduler. Kho thiếu chuyển đối soát, không thêm refund.

**Sửa như sau:**

1. Khóa checkout/payment scope; gom reservation theo product và khóa product theo ID tăng dần.
2. Reservation còn hiệu lực: commit đúng một lần. Reservation hết hạn: tính lại available, loại reservation hết hạn và tính đủ reservation còn hiệu lực của khách khác.
3. Bỏ clamp stock. Không đủ hàng thì ghi nhận tiền thực nhận, lưu lý do `RECONCILIATION_REQUIRED`, không chuyển phần hàng sang sẵn sàng fulfillment.
4. Khi đủ hàng, trừ stock và đổi reservation COMMITTED trong cùng transaction; callback lặp không trừ thêm.
5. Dùng thời gian DB nhất quán cho kiểm tra expiry.

**Test nghiệm thu:** trả lúc 14:50, callback 15:10 vẫn được giữ; callback sau 20 phút cạnh tranh với B không bán vượt tồn; webhook lặp chỉ commit một lần.

### L02 — P1: Thanh toán con bỏ qua đơn cha

**Vị trí:** `B/service/impl/PaymentServiceImpl.java:66`, nhánh ORDER/CUSTOM_ORDER; `B/service/impl/CustomOrderServiceImpl.java`, `updateCustomOrderStatus()`.

**Nguyên nhân:** chưa phân biệt standalone với con có checkoutOrder. Custom con vẫn được accept/cancel độc lập.

**Ảnh hưởng:** trả riêng con bỏ qua ship/tổng cha, sau đó có thể trả cha lần nữa; trạng thái cha/con lệch nhau.

**Hướng khả thi:** checkout điều phối con; Payment có scope toàn đơn cho WAIT_ALL hoặc scope nhóm cho SEPARATE. Không cần phân bổ tiền thành mô hình kế toán phức tạp nhưng phải truy được khoản thu thuộc nhóm nào.

**Sửa như sau:**

1. API ORDER/CUSTOM_ORDER chỉ chấp nhận đơn standalone; có checkoutOrder thì trả lỗi chỉ dẫn dùng checkout.
2. Guard accept/cancel độc lập nếu thao tác phá quy trình cha; quote của admin vẫn được cập nhật qua quy trình quote có kiểm soát.
3. Standalone vẫn hoạt động trong giai đoạn tương thích; không vô hiệu mọi đơn cũ.
4. SEPARATE bắt buộc có scope MARKETPLACE/CUSTOM; WAIT_ALL có scope toàn đơn. Mỗi phần hàng chỉ có một scope sở hữu nghĩa vụ thanh toán; không đồng thời cho thu toàn cha và nhóm con. Sau khi tạo nghĩa vụ thu/giữ kho, không đổi mode âm thầm; đổi mode phải revalidate và vô hiệu hóa scope/link cũ an toàn, hoặc từ chối nếu đã trả tiền.

**Test nghiệm thu:** gọi trực tiếp pay con thuộc cha bị từ chối; standalone hợp lệ vẫn trả được; không có hai khoản thu cùng nghĩa vụ.

### L03 — P1: Retry PayOS tạo link mới và ghi đè dấu vết cũ

**Vị trí:** `B/service/impl/PaymentServiceImpl.java`, `createPaymentLink()` khoảng dòng 119–190; `handleWebhook()` khoảng dòng 219.

**Nguyên nhân:** tra cứu/hủy link cũ thất bại bị bỏ qua; tạo mã mới rồi ghi đè Payment cũ. Callback không tìm thấy transaction trả thành công mà không lưu sự kiện.

**Ảnh hưởng:** hai link có thể cùng nhận tiền; tiền từ mã cũ không map được; timeout tạo link có thể để lại link provider mà local không có bằng chứng.

**Hướng khả thi:** giữ bảng Payment làm nghĩa vụ thu; thêm PaymentAttempt tối thiểu lưu mỗi lần thử. Retry qua request/admin; không cần outbox worker.

**Sửa như sau:**

1. Transaction ngắn lưu attempt với provider code duy nhất và trạng thái CREATING trước gọi mạng.
2. Gọi PayOS ngoài transaction; transaction ngắn cập nhật URL/kết quả. Tách service transaction để tránh self-invocation làm mất hiệu lực annotation.
3. Timeout lưu UNKNOWN/PENDING_RECONCILIATION; lần sau tra cứu cùng code, không tạo code khác khi trạng thái chưa rõ.
4. Giữ mọi mã cũ, không ghi đè; chỉ tạo attempt mới khi đã xác định an toàn với attempt trước.
5. Callback hợp lệ chưa map được phải lưu sự kiện/đối soát; có guard riêng cho webhook kiểm tra provider, không bỏ qua giao dịch thật.
6. Webhook/verify dùng cùng settlement service với khóa và event identity chống lặp.

**SQL cần viết:** `02_payment_attempts.sql` (hoặc version tiếp theo nếu số 02 đã dùng), provider code unique, quan hệ Payment/scope và event/audit tối thiểu. Giữ dữ liệu Payment hiện có khi backfill. Không chỉ thêm bảng mà giữ nguyên luồng ghi đè transactionId cũ.

**Test nghiệm thu:** provider đã tạo link nhưng client timeout; get/cancel provider lỗi; callback mã cũ; webhook đến sớm. Không tạo khoản thu kép và không mất dấu tiền. Attempt của nhóm MARKETPLACE không được đánh dấu nhóm CUSTOM hoặc toàn checkout PAID khi phần còn lại chưa trả tiền.

### L03b — P1: Payment one-to-one chặn hai khoản thu của SEPARATE

**Vị trí:** `B/entity/Payment.java`, checkoutOrder đang `@OneToOne` và `@JoinColumn(unique = true)`; `B/repository/PaymentRepository.java`, findByCheckoutOrderId trả Optional; baseline SQL có `payments_checkout_order_id_key UNIQUE (checkout_order_id)`.

**Nguyên nhân:** mô hình cũ chỉ cho một Payment cho toàn checkout; SEPARATE cần một nghĩa vụ MARKETPLACE và một nghĩa vụ CUSTOM cùng checkout.

**Ảnh hưởng:** tạo Payment nhóm thứ hai bị duplicate key. Nếu chỉ bỏ UNIQUE mà không sửa repository, truy vấn lấy một payment có thể lỗi nhiều kết quả hoặc dùng sai nhóm.

**Hướng khả thi:** một Payment cho mỗi scope, nhiều PaymentAttempt cho một Payment. Không tạo Payment mới mỗi lần retry link.

**Sửa như sau:**

1. Migration 02 (hoặc số tiếp theo): preflight constraint/index thực tế theo schema; thêm scope và backfill có kiểm chứng. Payment checkout cũ một khoản toàn đơn có thể map ALL sau kiểm tra; dữ liệu bất thường báo đối soát, không tự suy từ shippingMode.
2. Bỏ UNIQUE cũ trên checkout_order_id, gồm index unique độc lập nếu có. Giữ FK. Thêm `scope VARCHAR(30) NOT NULL DEFAULT 'ALL'`, CHECK cho ALL/MARKETPLACE/CUSTOM và UNIQUE(checkout_order_id, scope). DEFAULT không thay thế NOT NULL; scope null không được phép né unique.
3. Entity checkoutOrder đổi sang ManyToOne, bỏ unique ở JoinColumn, khai báo composite unique tương ứng trên Table và enum scope dạng STRING. Rà inverse mapping CheckoutOrder nếu có.
4. Repository thêm findByCheckoutOrderIdAndScope và findAllByCheckoutOrderId; thay các caller đang giả định một payment, gồm create/settle/verify/history/finance/DTO/FE. Standalone giữ mapping riêng; chặn một Payment đồng thời trỏ nhiều loại order. Unique checkout+scope không bảo vệ standalone có checkout_id NULL; giữ constraint standalone phù hợp.
5. Khóa checkout khi tạo/chuyển nghĩa vụ thu: WAIT_ALL chỉ ALL; SEPARATE chỉ MARKETPLACE/CUSTOM thực sự có hàng. Không cho ALL cùng tồn tại như nghĩa vụ đang hoạt động chồng lên hai scope nhóm. Composite unique tự nó không cấm ALL và MARKETPLACE/CUSTOM cùng checkout.
6. Unique chỉ bảo vệ một bản ghi nghĩa vụ trong DB, không chứng minh provider không thu hai lần. Vẫn bắt buộc L02/L03/L05: scope không chồng lấn, attempt history, retry/settlement idempotency và xử lý callback muộn.
7. Trước chuyển mode/phương thức, kiểm tra payment/attempt đang hoạt động hoặc đã thu; không xóa lịch sử để né unique. Payment amount/version đã có attempt không được âm thầm đổi; cần quy trình vô hiệu hóa/xác nhận lại an toàn hoặc từ chối thay đổi.

**Test nghiệm thu:** cùng checkout tạo được MARKETPLACE và CUSTOM, hai create cùng scope chỉ có một nghĩa vụ; scope null/lạ bị từ chối; ALL chồng nhóm bị chặn; lịch sử/finance đọc đúng hai khoản không lỗi nhiều kết quả; nhiều attempt không tạo payment thứ ba; script upgrade giữ nguyên số tiền lịch sử và validate mapping thành công.

### L04 — P1: Link tạo lại sống lâu hơn thời hạn giữ kho

**Vị trí:** `B/service/impl/PaymentServiceImpl.java:153`; thời điểm hết hạn trong `B/service/impl/CheckoutOrderServiceImpl.java`.

**Nguyên nhân:** link luôn dùng now + 15 phút, reservation giữ mốc ban đầu; chưa có logic phối hợp retry.

**Ảnh hưởng:** khách có thể trả qua link còn hạn sau khi hàng đã được người khác mua.

**Hướng khả thi:** dùng mốc thời gian lưu server cho cả link và reservation; chỉ cấp vòng thanh toán mới sau revalidation.

**Sửa như sau:** tái sử dụng link còn hợp lệ; link mới phải xử lý attempt cũ, kiểm tra giá/tồn và xác lập `reservationExpiresAt = paymentExpiresAt + 5 phút` trong transaction. Không gia hạn chỉ vì refresh. FE hiển thị thời gian từ server, không tự quyết định release.

**Test nghiệm thu:** retry ở phút 16/21, giá/tồn đã thay đổi, callback link cũ; kho không bị giữ vô hạn.

### L05 — P1: Idempotency chưa được dùng và thiếu expiresAt

**Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:93` và `:389`; `B/entity/IdempotencyRecord.java:61`; `SQL/01_expand.sql:43`; `F/pages/CartPage.tsx:163`.

**Nguyên nhân:** create chỉ lưu key; confirm ghi record sau xử lý, không lookup/hash/response. Không set expiresAt dù entity/SQL bắt buộc. FE chưa gửi key cho create checkout.

**Ảnh hưởng:** create đồng thời có thể tạo đơn trùng; dùng key khác payload không bị chặn; confirm có key có thể lỗi khi flush/commit. Catch quanh save không bảo đảm transaction vẫn commit được.

**Hướng khả thi:** dùng bảng hiện đã thêm và DB unique, không cache bộ nhớ.

**Sửa như sau:**

1. FE tạo UUID cho một hành động, giữ nguyên khi retry cùng payload; thay nội dung thì tạo key mới.
2. BE claim record theo user/action/key trước mutation; hash payload chuẩn hóa gồm line IDs/revisions, địa chỉ, mode và method.
3. Cùng key khác hash trả conflict; COMPLETED trả response cũ; PROCESSING trả trạng thái chờ/retry, không chạy lại.
4. Set expiresAt, requestHash và responseBody; trả kết quả transaction nhất quán với mutation.
5. Xử lý unique collision ở transaction boundary phù hợp; không nuốt integrity exception rồi tiếp tục dùng transaction đã rollback-only.
6. Confirm re-entry kiểm tra quyền, version/payload phù hợp; không coi mọi request CONFIRMED là tương đương.

**Test nghiệm thu:** create/confirm retry và hai request đồng thời, cùng key khác payload, timeout sau commit; một kết quả nghiệp vụ, không exception vì expiresAt null.

### L06 — P1: Endpoint tạo order cũ bỏ qua reservation

**Vị trí:** `B/service/impl/OrderServiceImpl.java:81–90`, `createOrders()`; `B/controller/OrderController.java`, API `/orders`.

**Nguyên nhân:** đọc/trừ stock trực tiếp không khóa và không trừ active reservation của checkout mới.

**Ảnh hưởng:** A giữ món cuối qua checkout, B vẫn mua được qua endpoint cũ; hai request cũ cũng có thể tranh chấp kho.

**Hướng khả thi:** chung inventory service cho cả hai đường; hoặc adapter endpoint cũ sang orchestration mới nếu giữ được response tương thích.

**Sửa như sau:** gom quantity theo product, khóa theo ID, kiểm tra available tính reservation; reserve/commit dùng chung L01. Rà mọi chỗ setStock tạo nghĩa vụ mua mới; không chỉ vá checkout.

**Test nghiệm thu:** chạy đồng thời `/orders` và checkout cho sản phẩm stock=1; chỉ một bên thành công.

### L07 — P1: COD, hủy và bước sản xuất chưa thống nhất

**Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:133–179`; `B/service/impl/OrderServiceImpl.java:370–411`.

**Nguyên nhân:** checkout COD commit kho nhưng không tạo Payment COD tương ứng; child PENDING, code quản lý trạng thái chỉ tìm payment theo con. Hủy không release/khôi phục kho. PENDING online vẫn được chuyển sản xuất.

**Ảnh hưởng:** mất tồn sau hủy, không biết đã thu COD chưa, có thể xử lý/cộng điểm đơn chưa trả tiền; payment/history FE sai.

**Hướng khả thi:** một payment COD theo scope cha/nhóm, resolver đọc đúng scope; thao tác xác nhận thu tiền riêng cho admin.

**Sửa như sau:**

1. Checkout hàng sẵn COD tạo payment với amount gồm các khoản thuộc scope; không tạo thêm payment con trùng.
2. Production guard: online phải PAID; COD hàng sẵn hợp lệ được chuẩn bị. Custom luôn PayOS.
3. Hủy chưa trả/thu tiền và chưa xuất hàng: khóa scope/product, release RESERVED hoặc khôi phục COMMITTED đúng một lần; cập nhật cha/con.
4. Có payment thành công thì chặn hủy thông thường, ghi hướng dẫn liên hệ admin; không triển khai refund.
5. Thu COD có quyền, số tiền, người xác nhận, thời điểm và audit; COMPLETED không tự chứng minh đã thu.
6. Chỉ cấp điểm khi đã thu và đã hoàn tất, bất kể hai sự kiện tới trước/sau nhau.

**Test nghiệm thu:** COD tạo→hủy trả đúng kho; hủy retry; online chưa trả không vào sản xuất; COD delivered nhưng chưa thu chưa có điểm.

### L08 — P1: FE chưa có bước confirm checkout sau báo giá

**Vị trí:** `F/pages/CartPage.tsx:163`; tìm toàn FE mới thấy create `/checkout-orders`; `B/service/impl/CustomOrderServiceImpl.java`, `quoteCustomOrder()`.

**Nguyên nhân:** thiếu màn hình đọc lại/confirm cha; quote thay đổi không cập nhật summaryVersion cha.

**Ảnh hưởng:** khách tạo custom từ cart không có đường chuẩn để duyệt tổng cha; dễ đi vào thanh toán con sai phạm vi; khách có thể duyệt theo dữ liệu cũ.

**Hướng khả thi:** thêm trang chi tiết `/checkout/:id` đơn giản, dùng component chung; mở rộng API đang có theo scope toàn đơn/nhóm, chưa cần thiết kế lại toàn app.

**Sửa như sau:**

1. Thêm checkout service FE, route `/checkout/:id`, liên kết sau create/lịch sử/thông báo. Reload hoặc mở trực tiếp URL vẫn dùng GET server, không cần location.state.
2. Hiển thị địa chỉ, mode, hai nhóm nếu có, giá chưa chốt, đơn giá/số lượng/thành tiền, phí giao và payment/tracking từng scope. Tổng chưa đủ giá không được trình bày như số tiền đã chốt toàn đơn.
3. WAIT_ALL có nút duyệt và thanh toán toàn đơn khi đủ giá; SEPARATE có hành động tương ứng từng nhóm, không chặn nhóm hàng sẵn vì custom chưa báo giá.
4. Gọi confirm với version/key của scope hiện hành rồi tạo/tiếp tục payment. Quote thay đổi cập nhật version scope custom và summary cha; không làm mất hiệu lực khoản nhóm hàng sẵn đã thanh toán.
5. Confirm/quote dùng thứ tự lock nhất quán. Conflict giữ đơn và chỉ rõ phần thay đổi để khách duyệt lại. PayOS lỗi có retry cùng đơn; refresh vẫn tiếp tục đúng attempt, không tạo đơn mới.
6. GET/confirm/pay và dữ liệu nhóm phải kiểm tra owner/admin tại BE, không dựa vào route guard FE.

**Test nghiệm thu:** create custom→admin quote→khách refresh/detail→duyệt→pay; sửa quote khi khách đang xem gây conflict đúng, không thu giá khác chưa được đồng ý.

### L09 — P1: quotedPrice chưa thống nhất đơn giá/thành tiền

**Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:339`; `B/service/impl/PaymentServiceImpl.java:87`; màn báo giá admin/custom FE.

**Nguyên nhân:** checkout nhân quantity, standalone thu quotedPrice trực tiếp; DTO/UI không định nghĩa rõ một nghĩa giá.

**Ảnh hưởng:** quantity > 1 có thể thu thiếu hoặc tính nhiều lần tùy đường đặt hàng.

**Hướng khả thi:** đã chốt quote mới là đơn giá một chiếc, tổng dòng = unitPrice × quantity; PricingService nhỏ dùng BigDecimal, không cần engine tổng quát.

**Sửa như sau:** request/response và UI ghi rõ đơn giá, số lượng, thành tiền; mọi create link lấy tổng từ cùng service; ship nằm riêng. Quote cũ chưa rõ nghĩa đưa báo cáo đối soát, không tự nhân dữ liệu lịch sử. SQL thêm cột/snapshot theo phương án cuối, giữ quotedPrice cũ để tương thích có thời hạn.

Ví dụ bắt buộc trên màn báo giá/duyệt: đơn giá 40.000đ × số lượng 5 = thành tiền 200.000đ; phí giao và tổng trả riêng bên dưới. UI admin phải cho xem trước tổng khi nhập đơn giá. Lưu dấu vết đơn giá đã gồm giảm số lượng nếu có để không áp cùng ưu đãi lại lần hai. Đơn đã trả tiền giữ nguyên số tiền/snapshot; đơn cũ chưa rõ nghĩa chỉ được thanh toán tiếp sau khi admin xác nhận lại nghĩa giá và khách duyệt phiên bản mới.

**Test nghiệm thu:** quantity 1/3/50 cho standalone và checkout cùng kết quả; tổng FE khớp amount provider.

### L10 — P1: Điểm và subscription còn logic cũ

**Vị trí:** `B/service/impl/OrderServiceImpl.java:191–240`; `B/service/impl/CustomOrderServiceImpl.java` nhánh COMPLETED; `B/service/impl/ReviewServiceImpl.java:186`; `B/service/impl/UserSubscriptionServiceImpl.java:48`, `:167–179`.

**Nguyên nhân:** rewardProcessed không khóa; ví cập nhật từ nhiều service; custom chưa cấp điểm; review thiếu ledger; activation tìm theo type rồi chỉ kéo endDate; plans chỉ lấy CUSTOMER.

**Ảnh hưởng:** cộng trùng/mất cập nhật, custom không được điểm, đổi B vẫn giữ A, VIP không hiện; đủ điều kiện COMPLETED nhưng chưa thu vẫn có thể được thưởng.

**Hướng khả thi:** PointService tập trung, khóa ví/user theo một thứ tự, unique eventKey. Plan benefit chỉ cần các trường dự án đang dùng, không xây rule engine lớn.

**Sửa như sau:**

1. Mọi earn/redeem/review dùng cùng transaction/lock; SQL thêm eventKey/source và unique sau đối soát.
2. Chỉ cấp điểm hàng đã hoàn tất và thu tiền; custom/marketplace dùng cùng công thức 10.000đ = 1 điểm, không tính ship.
3. Theo dõi điểm mục tiêu cộng dồn checkout; cấp phần chênh lệch để giao nhiều đợt không mất phần lẻ.
4. Review thưởng một lần, ghi ledger; balance không âm. Không thêm thu hồi điểm hoặc unrecovered obligation.
5. Cùng gói gia hạn; khác gói cùng nhóm tạo activation mới theo chính sách đã chốt, lưu lịch sử; không chỉ kéo gói cũ.
6. List plans lấy đủ loại hợp lệ; quyền USER/ADMIN nhất quán với redeem/gift. Thời hạn và benefit có cấu hình/snapshot.

**Bổ sung bắt buộc — sửa đổi gói và màn hình admin hiện có:**

- File cần rà thêm: `F/features/subscriptions/SubscriptionPanel.tsx`, `F/pages/admin/AdminSubscriptionsPage.tsx`; `B/service/impl/SubscriptionPlanServiceImpl.java`, DTO plan request/response, entity SubscriptionPlan/UserSubscription và repository tương ứng.
- Admin form phải sửa được price (VND), requiredPoints (điểm đổi), description và benefit cấu trúc; nếu benefits hiện là text thì giữ mapping hiển thị tương thích, không parse câu mô tả làm công thức. Có durationDays, phạm vi giảm, tỷ lệ giảm tiền hàng và giảm/miễn ship có giới hạn theo nhu cầu thực tế. Số tiền/điểm không âm, tỷ lệ 0–100, thời hạn dương; cấu hình mâu thuẫn phải bị BE từ chối.
- Cùng plan ID thì gia hạn từ max(now, endDate). Khác plan ID cùng nhóm thì kết thúc activation cũ và tạo activation trỏ đúng plan mới, snapshot quyền lợi mới; trừ điểm và đổi activation cùng transaction, có idempotency. UI báo rõ thay thế gói/thời hạn cũ trước xác nhận; không thu điểm B rồi tiếp tục hiển thị/quyền lợi A.
- Description là nội dung giới thiệu; price là giá niêm yết của gói, requiredPoints là chi phí đổi điểm. Lưu/hiển thị giá không đồng nghĩa tự xây thêm thanh toán mua gói; redeem vẫn trừ requiredPoints đúng chính sách đã có.
- Gói đã đổi giữ snapshot; sửa plan ảnh hưởng lần đổi/xác nhận mới, không âm thầm sửa giá đơn hoặc quyền lợi đã snapshot. Ngừng bán gói không tự xóa lịch sử hoặc hủy quyền lợi còn hạn.
- PricingService kiểm tra subscription còn hiệu lực khi chốt giá, áp giảm tiền hàng và phí ship toàn đơn; không suy VIP từ role ADMIN, không áp ưu đãi bằng FE, không cộng trùng miễn ship cho hai scope.
- SQL bổ sung trường/snapshot cấu trúc nếu thiếu; cấu hình cũ chỉ có text không tự suy ra 15%/miễn ship. Backfill minh bạch và admin cấu hình thật trước khi bật quyền lợi.

**Test bổ sung:** tạo/sửa gói rồi GET lại đủ price/requiredPoints/description/config; đổi A→B xác nhận đúng plan/điểm/quyền lợi; cùng A gia hạn; lỗi giữa chừng rollback; khách hết hạn không được ưu đãi mới; miễn ship chỉ một lần ở SEPARATE và cấu hình thay đổi không làm đổi đơn đã chốt.

**Test nghiệm thu:** hai reward cùng ví, reward với redeem, hai redeem cùng số dư, custom hoàn tất, đổi A→B cùng type và gói hết hạn.

### L11 — P2: Guest cart merge chưa an toàn khi retry/đổi user

**Vị trí:** `F/features/cart/hooks/useCart.ts:104–150`; `B/service/impl/CartServiceImpl.java`, full replace cart.

**Nguyên nhân:** merge cộng quantity rồi PUT cả giỏ, không merge identity bền vững. fetchCart nhận active boolean theo giá trị nên cleanup ngoài hàm không hủy được cờ trong request đang chờ.

**Ảnh hưởng:** timeout sau server commit có thể cộng lại guest; request user cũ có thể cập nhật state sau đổi tài khoản; hai tab ghi đè giỏ.

**Hướng khả thi:** dùng stable clientLineId + mergeBatchId/idempotency ở BE; request identity guard FE. API hiện có PUT /api/cart, không giả định có POST.

**Sửa như sau:** kiểm tra user/request generation sau mỗi await; merge DB và guest trong BE transaction hoặc versioned API tương đương; retry batch cũ trả cùng kết quả, không cộng lại. Chỉ xóa guest sau xác nhận; state FE lấy response chuẩn hóa. Trước checkout đợi hydrate/save xong và dùng ID/revision server; chặn khi sync lỗi.

**Test nghiệm thu:** guest→login→checkout, timeout sau commit, StrictMode, hai tab và đổi user trong lúc request chờ; không mất/nhân đôi dòng.

### L12 — P2: Mapping fontStyle bị xóa khi tạo custom

**Vị trí:** `B/service/impl/CustomOrderServiceImpl.java:149–155`, `createCustomOrder()`; `F/pages/CustomOrderCheckoutPage.tsx` vẫn gửi fontStyle.

**Nguyên nhân:** sửa phần COD đã bỏ luôn `order.setFontStyle(request.fontStyle())`.

**Ảnh hưởng:** đơn mất trường font đã chọn, admin đọc lại không đủ thông số cá nhân hóa.

**Hướng khả thi:** khôi phục mapping và kiểm tra snapshot input/output, không cần schema mới nếu cột đã có.

**Sửa như sau:** đặt fontStyle từ request sau validation, rà các trường mẫu/màu/tên/MSSV/file/quantity cùng luồng. Viết test create→detail bảo toàn giá trị font khác mặc định.

### L13 — P1 khi deploy: Profile Supabase vẫn tự update schema

**Vị trí:** `R/application-postgres.properties:14` có ddl-auto=update; `R/application-test-local.properties` có validate.

**Nguyên nhân:** chỉ bổ sung profile local, chưa chuẩn bị cấu hình deployment an toàn.

**Ảnh hưởng:** chạy code/entity mới bằng profile PostgreSQL có thể tự đổi schema Supabase, trái yêu cầu người dùng tự chạy SQL.

**Hướng khả thi:** script thủ công + validate, không cần cài Flyway tự chạy.

**Sửa như sau:** chuẩn bị production profile validate, tắt auto-init data.sql; README thứ tự preflight→người dùng áp SQL→post-check→deploy code tương thích. Không tự truy cập Supabase. Test SQL trên DB Docker local rồi validate; không dùng update để chứng minh script đúng.

**Test nghiệm thu:** DB local thiếu cột phải fail validate rõ; áp script thì pass; cấu hình Supabase không có đường tự DDL/init.

### L14 — P2: Test hiện có chưa chứng minh concurrency/local isolation

**Vị trí:** `src/test/java/.../service/CheckoutOrderSafetyTest.java` dùng mock repository; `PrintHub3DApplicationTests.java` chỉ contextLoads; `R/application-test-local.properties`; `TEST_POSTGRES_DOCKER.md`.

**Nguyên nhân:** mock test không chạy khóa/transaction/unique thực; profile cho override host mà chưa thấy guard; URL callback localhost không biến PayOS thành mock. Redis local dùng chung container dev.

**Ảnh hưởng:** unit pass vẫn có thể sai khi hai khách mua cùng lúc; chạy context/integration thiếu cấu hình có thể dùng client dịch vụ thật hoặc lẫn môi trường dev.

**Hướng khả thi:** giữ unit test nhanh và thêm integration PostgreSQL Docker sẵn có, mock cổng PayOS/mail/upload ở Spring context test.

**Sửa như sau:**

1. Guard host/database local trước chạy integration; không đọc datasource/credential Supabase làm fallback.
2. Integration dùng transaction/kết nối riêng, barrier/latch cho request tranh chấp, không chạy tất cả trong một test transaction chung.
3. Áp baseline + expand vào DB test có định danh riêng; kiểm thử fresh và upgrade fixtures rồi validate/post-check.
4. Mock bean/adapter PayOS/mail/upload; Redis test riêng nếu bài test cần; không flush Redis dev.
5. README ghi lệnh áp baseline trước expand; đường `psql -f` phải là file trong container đã copy, hoặc truyền stdin từ host; thêm ON_ERROR_STOP để script dừng khi lỗi.
6. Khắc phục treo Mockito trong môi trường chạy trước khi tuyên bố unit pass; ghi rõ fail/skipped nếu chưa chạy được.

**Test nghiệm thu:** chạy được L01/L05/L06/L10 với PostgreSQL thật, báo kết quả từng case và giới hạn môi trường.

### L15 — P2: Test cart và hợp đồng serialization chưa đồng bộ

**Vị trí:** FE `exe-fe/tests/cart-merge.test.mjs:9`; `F/features/cart/hooks/cartPayload.ts`.

**Nguyên nhân:** test kỳ vọng loại custom khỏi payload trong khi implementation hiện serialize cả custom; còn khác biệt trường undefined trong deepEqual.

**Ảnh hưởng:** suite không xanh; test cũ không bảo vệ được hợp đồng cart mới. Không đủ căn cứ coi riêng failure này là bằng chứng mất giỏ.

**Hướng khả thi:** chốt DTO cart BE hiện có, cập nhật test theo nghiệp vụ mới; không xóa test/chỉnh expected chỉ để xanh.

**Sửa như sau:** test payload qua JSON đúng wire format, đảm bảo product thật/custom design được gửi đúng, synthetic product ID không bị gửi làm UUID; thêm test revision/clientLineId và retry merge L11.

**Test nghiệm thu:** test cart pass với hợp đồng có cả hàng sẵn/custom; API nhận được payload thật, không chỉ deepEqual object nội bộ.

## 4. Khoảng trống tính năng — không gọi là đã sửa xong

### G01 — Giao riêng chưa có hành vi độc lập

**Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:77–89`, mode chỉ được lưu/trả; `F/pages/CartPage.tsx` vẫn mô tả giao hàng sẵn trước custom.

**Nguyên nhân/ảnh hưởng:** một trạng thái/tổng thanh toán cho cả đơn; lựa chọn SEPARATE không thực hiện đúng lời hứa trên UI.

**Hướng khả thi:** một checkout, hai nhóm hàng sẵn/custom cố định, tối đa hai đợt ở xưởng PrintHub; không dựng multi-seller/hub hoặc chia tùy ý nhiều đợt. Có scope giá/thu/giao rõ cho mỗi nhóm, tái sử dụng inventory/pricing/payment/point.

**Cách sửa:**

1. Thêm group/shipment tối thiểu và SQL/API/DTO tương ứng; trạng thái giá/thanh toán/giao tách theo nhóm. Có thể hai nhóm fulfillment nhưng một phạm vi thu và một shipment cho WAIT_ALL.
2. WAIT_ALL kiểm tra đủ quote, khách duyệt tổng, giữ kho và thu toàn đơn; ship chung một lần sau custom sẵn sàng. Thời gian chờ quote không giữ hàng sẵn vô hạn; thay đổi tồn/giá cho phép khách điều chỉnh trên cùng checkout.
3. SEPARATE xác nhận nhóm hàng sẵn ngay, giữ/commit kho và giao trước; custom báo giá, xác nhận và PayOS riêng sau. Custom không COD; hàng sẵn có COD nếu được chọn và hỗ trợ đúng L07.
4. Ship toàn checkout lấy từ cài đặt admin, mặc định 15.000đ, áp subscription rồi chỉ thu một lần cho cả WAIT_ALL/SEPARATE. Gán phí vào đúng một scope; đợt 2 shippingPayable = 0, hiển thị đã tính trong đơn. Tổng phí các scope bằng phí snapshot cha. Tổng cha phản ánh tiền đã trả, tiền đã chốt còn phải trả và phần chưa báo giá; không gọi toàn đơn PAID khi chỉ một nhóm trả tiền.
5. Webhook cập nhật đúng scope, không ghi đè các con còn chờ giá thành PAID. Điểm cấp theo phần đủ điều kiện và mục tiêu cộng dồn của checkout.
6. UI luôn hỗ trợ lựa chọn cả hai sau triển khai. Không dùng ẩn/disable SEPARATE làm giải pháp nghiệm thu thay thế. Có thể dùng flag trong lúc phát triển, nhưng phải bật và test đủ cả hai khi bàn giao.

**Nghiệm thu:** E2E WAIT_ALL thu/giao chung một lần; SEPARATE hàng sẵn thực sự được xử lý trước custom, quote custom chưa có không chặn nhóm sẵn. Cấu hình 15.000đ và không ưu đãi: tổng ship vẫn 15.000đ dù hai lần giao; đợt 2 không thu thêm. Kiểm tra miễn/giảm ship, admin đổi phí giữa hai đợt, COD hàng sẵn + PayOS custom, retry từng scope, một nhóm hết hạn và refresh trang. Không thu tiền/ship/điểm hai lần.

### G02 — Giá/ưu đãi FE vẫn tự quyết định

**Vị trí:** `F/pages/CustomOrderCheckoutPage.tsx:138–144`; cart tính ship cố định; chưa thấy PricingService dùng chung.

**Nguyên nhân/ảnh hưởng:** FE tự gán fallback 45.000, VIP 15%, ship 15.000/miễn; checkout khác ship 30.000. Tổng hiển thị không được BE xác nhận.

**Hướng khả thi:** PricingService nhỏ với cấu hình đơn giản; custom chưa báo giá chỉ hiển thị estimate/chờ báo giá.

**Cách sửa:** BE trả breakdown và version; FE dùng response, bỏ suy VIP từ admin role/as any; chỉ hiển thị ưu đãi có cấu hình thực. Không cần engine voucher phức tạp. Test cùng input hiển thị/thu tiền khớp nhau.

**Cấu hình phí ship admin bắt buộc:**

- Rà `B/service/impl/StoreSettingServiceImpl.java`, DTO/entity/controller cài đặt hiện có và `F/pages/admin/AdminSettingsPage.tsx`. Tận dụng field hiện hữu nếu đúng nghĩa; nếu chưa lưu/đọc end-to-end thì nối hoàn chỉnh, không khẳng định đã có chỉ vì UI có input.
- Một field phí ship mặc định cho toàn checkout, giá trị mặc định 15.000 VND, admin chỉnh được và BE validation không âm. Đây là mức cố định cấu hình, không tích hợp API tính cước vận chuyển trong đợt này.
- Bỏ hardcode 30.000 tại checkout/cart và 15.000/miễn theo ngưỡng 100.000 ở custom checkout. 15.000 chỉ là default/seed cấu hình có kiểm soát, không là công thức rải ở FE.
- BE trả shippingBase, shippingDiscount, shippingPayable và policyVersion; miễn/giảm lấy từ gói còn hiệu lực, không suy từ description hoặc loại tài khoản. Snapshot khi khách xác nhận theo mục 1.
- Đơn standalone, checkout, đơn giao riêng và bulk dùng cùng nguồn phí; không cấp phí miễn/giảm hai lần vì có hai nhóm. Không tự thay phí của đơn đã chốt hoặc ghi đè cài đặt admin đã có bằng migration seed.

**Test bổ sung:** admin đổi phí 15.000→20.000 thì preview đơn mới đổi đúng; đơn cũ giữ snapshot. Cart/custom hiển thị bằng BE; SEPARATE có/không subscription không thu lần hai; quyền lợi không hợp lệ không được trừ.

### G03 — Bulk vẫn là nhiều custom request rời

**Vị trí:** `F/pages/BulkOrderPage.tsx`; `F/features/custom/CustomRequests.tsx:361–374`; BE chỉ thấy BulkOrderRequestDTO, chưa thấy service/entity bulk hoàn chỉnh.

**Nguyên nhân/ảnh hưởng:** chưa triển khai phân hệ mới; không có danh sách lớp/quote toàn lô/khóa danh sách, banner ưu đãi chưa bảo đảm thực thi.

**Hướng khả thi:** 7A nhập bảng thủ công, một đại diện, một lô, báo giá và PayOS toàn lô, giao một điểm. Hoãn Excel/CSV và workflow nâng cao sang 7B.

**Cách sửa:** thêm bulk/member lines, validation tên/MSSV/mẫu/màu/quantity, snapshot danh sách được duyệt; tái sử dụng pricing/payment/point. Không tạo payment engine thứ hai. Banner giảm giá chỉ bật khi policy BE có thật. Không chặn phát hành bản vá P1 vì Excel chưa làm, nhưng báo rõ bulk chưa hoàn thành.

**Mô hình và kho:** bulk là loại đơn `BULK` riêng về nghiệp vụ, có quan hệ với checkout/payment hiện có để tái sử dụng xử lý. Bản thủ công và CSV sau này phải đi qua cùng validation/service; tổng quantity là tổng các dòng, không phải số thành viên hoặc số file. Nếu có hàng sẵn, gom quantity theo product/SKU, kiểm tra tồn khả dụng dưới lock và reserve/commit/release theo L01/L06/L07; không trừ kho ngay khi nhập/xem trước danh sách, không trừ hai lần khi nhận tiền. Nếu chỉ custom, kiểm tra khả năng nhận sản xuất và báo giá; không trừ Product.stock thành phẩm cho sản phẩm chưa được in. Nếu dự án quản lý phôi/vật liệu thì dùng tồn vật liệu thật, không tự dựng số lượng giả.

**7B — Excel/CSV sau 7A:** cung cấp mẫu cột, preview và báo lỗi từng dòng, giới hạn file/dòng, quantity nguyên dương, product/design tham chiếu hợp lệ, tên/MSSV và quy tắc xử lý trùng rõ ràng. BE parse/validate hoặc xác minh đầy đủ dữ liệu đã parse, không tin FE kiểm tồn. Sau preview vẫn revalidate tồn/giá lúc xác nhận; hai lớp đặt cùng hàng cuối phải được khóa đúng. Hàng thiếu chỉ rõ dòng/SKU và số còn lại, giữ batch để sửa, không âm thầm giảm số lượng hay tạo lô một phần. Import retry có batch ID/idempotency, không nhân đôi đơn hoặc số lượng.

**Nghiệm thu bulk:** một lô có danh sách/số lượng đúng, quote theo đơn giá × quantity, ship cấu hình thu một lần, custom PayOS, admin đọc được danh sách đã chốt. Test manual trước; 7B test CSV trùng SKU, sai quantity, hết kho sau preview và import retry. Chưa có 7B không được quảng bá import đã hỗ trợ.

## 5. SQL và bằng chứng nghiệm thu cần bàn giao

- Mỗi đợt có schema change phải có script Supabase PostgreSQL đánh số, preflight/post-check, README và phương án phục hồi; người dùng tự chạy trên Supabase.
- Không drop dữ liệu payment, point ledger hoặc seller lịch sử để khớp entity. Những trường giá cũ mơ hồ phải báo đối soát.
- Không thêm bảng Refund/RefundAllocation/unrecovered obligation. Giữ payment event/attempt để đối soát tiền đến muộn.
- Dùng DB test Docker `127.0.0.1:5433/printhub_test`; không reset volume/container khác. Profile local không được fallback remote host.
- Mỗi lỗi báo file sửa, SQL cần chạy, test đã chạy với kết quả; không đánh đồng compile thành công với integration/concurrency pass.

## 6. Kết quả kiểm tra ở thời điểm lập báo cáo

| Kiểm tra | Kết quả |
|---|---|
| FE production build | Pass; còn cảnh báo chunk lớn, không phải trọng tâm giao dịch đợt này |
| FE usability/API/cart test chọn lọc | 5 pass, 1 fail tại cart-merge.test.mjs |
| BE compile và testCompile | Thành công trong lệnh unit test chọn lọc |
| BE CheckoutOrderSafetyTest/OrderServiceTest/UserSubscriptionServiceTest | Tiến trình dừng ở Mockito, không trả kết quả; đã dừng thủ công, không xác nhận pass |
| Docker PostgreSQL local | Container printhub-test-postgres healthy tại 127.0.0.1:5433 |
| PostgreSQL concurrency/migration rehearsal trong lượt review | Chưa chạy; không có kết luận pass |
| Supabase | Không kết nối, không áp SQL |

## 7. Điều kiện hoàn tất sửa lỗi

- L01–L07 không còn đường thu tiền/kho vòng qua cơ chế chung.
- Quote quantity, confirm version, COD và điểm có E2E đúng từ FE tới BE.
- Không mất thông số thiết kế, không nhân đôi cart khi retry/đổi tài khoản.
- Script local rehearsal + validate và test concurrency có kết quả kiểm chứng; mọi hạn chế được ghi rõ.
- G01 bắt buộc triển khai và kiểm thử cả WAIT_ALL/SEPARATE, không nghiệm thu bằng cách khóa SEPARATE. G02 phải hiển thị đúng giá BE. G03 chia 7A/7B theo kế hoạch, báo đúng mức hoàn thành; không tuyên bố đã hoàn tất cả bốn luồng nếu chỉ vá guard.
- Admin chỉnh gói đủ config/price/requiredPoints/description và đổi gói A→B có hiệu lực đúng; phí ship default 15.000đ do admin quản lý, BE tính/snapshot, SEPARATE không thu lại ở đợt hai. Phải có test end-to-end cho các quyết định này.
