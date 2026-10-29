# Tóm tắt lỗi còn lại — Review lần 2

Ngày: 18/10/2026. Đối chiếu source FE/BE đang lưu trên ổ đĩa với `REVIEW_RECHECK_AFTER_ANTIGRAVITY.md`.

## 1. Kết luận và phạm vi

**Chưa đủ điều kiện nghiệm thu toàn bộ hoặc deploy giao dịch thật.** Một số lỗi cũ đã sửa nhưng transaction, thanh toán theo nhóm, kho và cấu hình subscription còn vấn đề.

- FE: `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src` (`F/`).
- BE: `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d` (`B/`).
- SQL: `D:/semester 7/EXE/PrintHub_3D/scripts/db-test` (`SQL/`).
- Dòng tham chiếu là mốc lúc review; tìm theo method khi source đổi.
- Supabase theo xác nhận người dùng mới áp script 01. Agent chỉ viết SQL tiếp theo và test local, không truy cập Supabase.
- Không xây refund hoặc nghĩa vụ thu hồi điểm; tiền đã nhận nhưng không thể xử lý đơn phải lưu để admin đối soát.

## 2. Các lỗi cần sửa

### R2-01 — P1: Confirm SEPARATE vẫn gọi thanh toán ALL

- **Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:485`, confirm; nhánh create/CONFIRMED re-entry cũng cần rà.
- **Nguyên nhân:** request tạo link không truyền scope nên mặc định ALL, trong khi PaymentService cấm ALL cho SEPARATE.
- **Ảnh hưởng:** confirm gặp exception; do lời gọi qua service có transaction tham gia transaction chung, bắt exception ở ngoài không bảo đảm tránh rollback-only/UnexpectedRollbackException.
- **Sửa:** confirm đúng nhóm và version; ưu tiên tách xác nhận khỏi tạo link. Nếu tiếp tục tạo link thì phải dùng scope/amount đúng nhóm, không gọi ALL cho giao riêng. Không nuốt lỗi transaction rồi báo thành công.
- **Test:** Spring integration confirm SEPARATE sau quote, không chỉ mock PaymentService; marketplace đã trả không bị xác nhận/thu lại.

### R2-02 — P1: Order.status vẫn quá ngắn cho trạng thái đối soát

- **Vị trí:** `B/entity/Order.java:42–45`; `B/service/impl/PaymentServiceImpl.java:540`; `SQL/03_fix_status_length_and_constraints.sql`.
- **Nguyên nhân:** Payment đã tăng lên 50 nhưng Order vẫn @Size/column length 20; settlement gán RECONCILIATION_REQUIRED dài 23 ký tự vào Order. Script 03 chưa mở rộng orders.status.
- **Ảnh hưởng:** thiếu hàng có thể làm rollback transaction, không lưu được khoản tiền cần đối soát.
- **Sửa:** đồng bộ entity + SQL orders.status và rà DTO/enum liên quan; migration phải giữ nguyên dữ liệu.
- **Test:** persist/commit Order ở trạng thái đối soát trên PostgreSQL thật, đọc lại thành công.

### R2-03 — P1: Callback muộn vẫn có thể lấy hàng khách khác đang giữ

- **Vị trí:** `B/service/impl/PaymentServiceImpl.java:521`, settle.
- **Nguyên nhân:** chỉ so Product.stock với quantity; không kiểm tra hết hạn reservation và tồn khả dụng sau các giữ kho hợp lệ khác.
- **Ảnh hưởng:** A hết hạn → B giữ món cuối → callback A vẫn commit vì stock vật lý chưa trừ cho B.
- **Sửa:** khóa sản phẩm theo thứ tự ổn định; reservation hết hạn phải revalidate available, tính đủ reservation hợp lệ khác; thiếu hàng lưu tiền/attempt đối soát và chặn fulfillment, không clamp kho.
- **Test:** A expiry, B reserve, callback A song song với B; chỉ người đủ điều kiện có hàng, tiền còn lại có dấu vết đối soát.

### R2-04 — P1: Confirm hồi sinh reservation hết hạn mà không kiểm tra lại

- **Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:421–426`.
- **Nguyên nhân:** chỉ cần có reservation cũ là gia hạn expiresAt, bỏ qua tồn/giá. PaymentService sau đó thấy reservation còn hạn nên không revalidate nhánh expired.
- **Ảnh hưởng:** hai checkout có thể cùng giữ lượng hàng không đủ; nhánh kiểm tra mới ở PaymentService bị bỏ qua gián tiếp.
- **Sửa:** mọi reserve/renew/commit dùng cùng inventory service và transaction; phân biệt RESERVED còn hạn, hết hạn, COMMITTED và CANCELLED. Không gia hạn chỉ vì record tồn tại; nhóm đã trả/commit không xử lý lại khi confirm custom.
- **Test:** confirm sau expiry với stock đã được giữ/mua bởi người khác; không gia hạn sai hoặc đổi giá âm thầm.

### R2-05 — P1: Attempt vẫn được lưu sau lời gọi PayOS

- **Vị trí:** `B/service/impl/PaymentServiceImpl.java:231–300`, createPaymentLink; class vẫn @Transactional.
- **Nguyên nhân:** provider create trước lưu attempt; kiểm tra reservation hết hạn nằm sau provider create; lookup/cancel link cũ lỗi vẫn có thể tạo mã mới.
- **Ảnh hưởng:** provider đã tạo link nhưng DB rollback do thiếu kho thì local mất mapping; timeout/callback sớm có thể mất dấu tiền hoặc phát sinh nhiều link.
- **Sửa:** kiểm tra/giữ kho trước; transaction ngắn commit attempt/provider code/amount/version, gọi mạng ngoài transaction, transaction ngắn cập nhật kết quả. Timeout tra cùng mã, không tạo mã mới khi trạng thái chưa rõ. Tách service transaction đúng cách, không dựa self-invocation.
- **Test:** provider đã tạo link nhưng timeout; callback đến trước response; thiếu kho khi retry; DB commit lỗi sau provider response. Không có link thật không được theo dõi.

### R2-06 — P1: Custom payment chưa bắt buộc confirm đúng version

- **Vị trí:** `B/service/impl/PaymentServiceImpl.java`, nhánh CUSTOM standalone/checkout; request tạo link và settlement.
- **Nguyên nhân:** đủ quotedPrice đã được phép tạo link, chưa bắt buộc scope được khách xác nhận đúng version; attempt có version nhưng chưa được kiểm tra đầy đủ khi settlement.
- **Ảnh hưởng:** gọi API trực tiếp bỏ bước duyệt, hoặc thanh toán theo quote cũ mà cấp hàng theo nội dung mới.
- **Sửa:** lưu acceptance theo scope/version, payment chỉ tạo từ acceptance hợp lệ; API nhận expected version. Quote mới vô hiệu acceptance chưa trả theo quy trình an toàn; tiền đến qua attempt cũ vẫn lưu đúng attempt rồi đối soát nếu không còn hợp lệ.
- **Test:** bypass confirm, quote đổi giữa lúc xem/trả tiền, callback old version và giá mới khác; không thu/cấp hàng ngoài nội dung khách đã đồng ý.

### R2-07 — P1: Hủy checkout COD không khôi phục kho COMMITTED

- **Vị trí:** `B/service/impl/OrderServiceImpl.java`, nhánh CANCELLED khoảng dòng 410; checkout create COD.
- **Nguyên nhân:** COD đã trừ stock và reservation COMMITTED, nhưng cancel checkout con chỉ release RESERVED. Cha/payment/scope chưa được hủy đồng bộ; callback muộn chưa bảo vệ đầy đủ phần hàng đã hủy.
- **Ảnh hưởng:** hủy trước xuất kho vẫn hụt tồn; trạng thái lệch; callback có thể đánh dấu lại đơn đã hủy thành PAID.
- **Sửa:** hủy qua scope với lock nhất quán: RESERVED release không tăng stock; COMMITTED chưa xuất kho phục hồi đúng một lần; tiền đã nhận không hủy thông thường. Đồng bộ cha/con/payment/reservation; callback muộn lưu đối soát, không hồi sinh fulfillment.
- **Test:** COD create→cancel, hai cancel đồng thời, cancel cạnh tranh webhook và hàng đã xuất; không mất/tăng kho giả.

### R2-08 — P1: Phương thức thanh toán vẫn dùng chung ở cha

- **Vị trí:** `B/service/impl/PaymentServiceImpl.java`, setPaymentMethod(PAYOS); `B/service/impl/CheckoutOrderServiceImpl.java`, confirm dùng chosenMethod; `F/pages/CartPage.tsx:86`, `:568`.
- **Nguyên nhân:** payment custom ghi đè method cha; confirm có thể ghi lại trạng thái marketplace đang COD; FE vẫn ép mixed cart sang PayOS và khóa COD dù SEPARATE.
- **Ảnh hưởng:** chưa hoàn thành marketplace COD + custom PayOS; mất ý nghĩa method/trạng thái của nhóm sẵn khi duyệt nhóm custom.
- **Sửa:** method và nghĩa vụ thu thuộc scope; trạng thái nhóm marketplace độc lập custom. FE cho chọn COD/PayOS hàng sẵn ở SEPARATE; custom chỉ PayOS. WAIT_ALL có custom dùng PayOS toàn đơn.
- **Test:** marketplace COD đã chuẩn bị/giao rồi mới quote/pay custom; method và trạng thái marketplace không bị ghi đè.

### R2-09 — P1: Idempotency vẫn thiếu hash và phân biệt hành động

- **Vị trí:** `B/service/impl/CheckoutOrderServiceImpl.java:58`, `:347`, cuối confirm; create/confirm callers FE.
- **Nguyên nhân:** lookup đã chuyển trước đọc cart và có unique nhưng chưa hash payload/claim/result đầy đủ; FE chưa gửi key. Confirm so key với key lưu trên checkout, có thể trùng key create rồi return trước confirm/version validation.
- **Ảnh hưởng:** key khác payload không conflict; collision đồng thời có thể thành lỗi DB thay vì trả response cũ; request confirm có thể không làm gì nhưng trả thành công.
- **Sửa:** key riêng theo user/action CREATE/CONFIRM/scope, payload hash chuẩn hóa và kết quả lưu bền vững. Unique collision xử lý ở transaction boundary; FE giữ key khi retry cùng hành động, tạo key mới khi thay nội dung. Không dùng một field checkout key để quyết định mọi hành động là đã xử lý.
- **Test:** create+confirm cùng chuỗi key không làm skip confirm; cùng action/key khác hash conflict; hai create/confirm concurrent trả kết quả nhất quán.

### R2-10 — P2: Cart còn race state và guest merge chưa chống lặp

- **Vị trí:** `F/features/cart/hooks/useCart.ts:133`, `:159`, `:183–187`; BE full replace cart.
- **Nguyên nhân:** từng response save ghi đè state optimistic mới hơn; fetchCart(active) nhận boolean theo giá trị, cleanup không đổi được cờ trong request đang chờ; guest merge vẫn cộng quantity rồi PUT mà chưa có merge identity bền vững.
- **Ảnh hưởng:** thao tác nhanh có thể mất lần tăng quantity; request user cũ có thể cập nhật giỏ user mới; timeout sau commit rồi retry merge có thể nhân đôi số lượng.
- **Sửa:** request generation/version khi áp response, không áp snapshot cũ lên thao tác mới; guard identity sau mọi await; merge batch idempotency ở BE hoặc cơ chế tương đương. Giữ stable clientLineId/revision và response mapping đã sửa.
- **Test:** tăng quantity liên tục khi request chậm, guest timeout retry, StrictMode, hai tab và logout/login trong lúc hydrate/save.

## 3. Các yêu cầu vẫn chưa hoàn thành

| Yêu cầu | Căn cứ hiện tại | Việc còn làm |
|---|---|---|
| Đổi gói B vẫn giữ A | UserSubscriptionServiceImpl:177 còn kéo endDate của gói cùng type | Cùng plan gia hạn; khác plan tạo activation đúng gói, snapshot/lịch sử, transaction với trừ điểm |
| Admin cấu hình quyền lợi | SubscriptionPlan vẫn benefits text | Form/API config, price, requiredPoints, description, duration và quyền lợi được BE áp dụng |
| Ship theo gói | Checkout còn suy miễn ship từ tên/type VIP | Pricing đọc cấu hình benefit có hiệu lực, không suy quyền lợi từ tên; snapshot phí/ưu đãi |
| Điểm thưởng | completeRewards vẫn findById và cập nhật balance riêng; custom thiếu luồng tương ứng | Lock ví/đơn, eventKey, ledger chung, chỉ thu tiền + hoàn tất mới cấp, cộng dồn checkout |
| COD thu tiền | Hoàn tất đơn vẫn tự ghi payment SUCCESS | Bước xác nhận thu tiền có quyền/audit, không coi delivered là bằng chứng đã thu |
| Giá ship FE | Cart vẫn hardcode 15.000đ | Preview/breakdown BE theo phí admin; ship toàn đơn thu một lần, không thu đợt 2 |
| Bulk | Chưa thấy service/entity bulk hoàn chỉnh | Một loại đơn lô, bảng nhập thủ công, quote toàn lô, đại diện thanh toán/giao một điểm; CSV/Excel sau |
| Tracking | Chưa thấy hành trình tracking nhóm đầy đủ | Admin cập nhật trạng thái/mã theo dõi riêng cho marketplace/custom và tổng hợp cha |

## 4. Những điểm đã sửa đúng hướng

- Cart sử dụng serializeCartItems giữ cả custom, valid UUID clientLineId/revision và lấy response server sau save.
- SEPARATE từ chối ALL/scope lạ; COMMON yêu cầu ALL.
- Confirm nhận QUOTED và một số trạng thái PARTIALLY_PAID thay vì chỉ PENDING_QUOTE.
- Trang checkout dùng `??` cho phí 0 thay vì `||` làm cộng lại 15.000đ.
- Payment.status đã tăng 50, có migration 03 và partial unique idempotency checkout; cần bổ sung Order.status theo R2-02.
- Đã có COD payment checkout và resolver tìm scope; cần hoàn thiện độc lập method, cancel và thu tiền theo R2-07/R2-08.

## 5. Kết quả kiểm tra lần này

| Kiểm tra | Kết quả |
|---|---|
| FE production build | Pass |
| FE test cart/usability/API chọn lọc | 7/7 pass |
| BE unit test chọn lọc ngoài sandbox | 13/13 pass: CheckoutOrderSafetyTest 7, OrderServiceTest 3, UserSubscriptionServiceTest 3 |
| PostgreSQL integration/concurrency/E2E trong lượt này | Chưa chạy, không xác nhận pass |
| Supabase | Không truy cập; theo người dùng mới áp script 01 |

Unit dùng mock không kiểm tra được transaction proxy, lock, rollback-only hoặc độ dài cột DB. Cần integration test tương ứng trước nghiệm thu; không coi test xanh là bằng chứng mọi lỗi đã đóng.

## 6. Ưu tiên và bàn giao

1. Sửa R2-01 tới R2-07 trước để tránh chặn confirm, mất dấu tiền và sai kho.
2. Hoàn thiện R2-08/R2-09 và cart race R2-10; tiếp tục các yêu cầu subscription/point/tracking/bulk còn thiếu.
3. Test PostgreSQL local với transaction/kết nối độc lập, có cạnh tranh thật; E2E WAIT_ALL và SEPARATE từ cart→quote→confirm→pay/COD→giao.
4. Script 02/03 hoặc bản bổ sung phải được đối chiếu entity cuối và rehearsal local; có preflight/post-check và hướng dẫn thứ tự chạy từ mốc Supabase chỉ có script 01.
5. Người dùng tự chạy SQL Supabase. Không đổi ddl-auto sang update để né thiếu schema, không tự chạy migration trên DB thật, không reset dữ liệu để test pass.

**Chưa nên deploy code giao dịch mới lên Supabase hiện tại. Đóng lỗi P1 và kiểm chứng SQL/transaction trước; ghi rõ phần chưa hoàn thành thay vì báo đã hoàn thành toàn bộ.**
