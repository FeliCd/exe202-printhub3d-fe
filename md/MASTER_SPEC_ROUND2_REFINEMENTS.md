# ĐẶC TẢ VÒNG 2 — ORDER, PAYMENT VÀ SUBSCRIPTION

Cập nhật: 19/10/2026. Đây là bản thay thế đặc tả vòng 2 trước đó. Các quyết định dưới đây là yêu cầu triển khai và kiểm thử, không phải xác nhận code đã hoàn thành.

## 1. Phạm vi và quyết định nghiệp vụ

- Kiểm tra và sửa cả BE Spring Boot và FE React cho hàng sẵn, custom standalone, checkout custom và checkout hỗn hợp.
- Hỗ trợ COMMON (nghiệp vụ WAIT_ALL: chờ đủ hàng, trả toàn đơn, giao chung) và SEPARATE (hàng sẵn và custom được xử lý/thanh toán/giao độc lập). Thống nhất mã API COMMON; không để FE/BE tùy ý trộn COMMON và WAIT_ALL.
- Bulk chưa triển khai trong đợt này; không coi hoàn thành đợt này là đã nghiệm thu đủ bốn luồng ban đầu.
- Không xây chức năng refund. Tiền đã nhận nhưng không thể thực hiện đơn phải lưu dấu vết và trạng thái cần đối soát cho admin, không tự gọi hoàn tiền hoặc hứa đã hoàn tiền.
- Hàng sẵn hỗ trợ COD hoặc PayOS. Custom chỉ PayOS. COMMON có custom phải PayOS toàn đơn. SEPARATE cho phép marketplace COD và custom PayOS.
- Ship thu đúng một lần cho toàn checkout theo cấu hình admin, mặc định 15.000đ. SEPARATE không thu thêm đợt hai. Chỉ một nhóm tồn tại thì tính phí cho nhóm đó.
- Giá mới: quotedPrice là đơn giá; priceVersion >= 2 tính đơn giá × số lượng. Legacy priceVersion null hoặc < 2 giữ cách tính tổng tiền cũ, không tự nhân/chuyển dữ liệu lịch sử.
- Agent chỉ viết SQL và chạy kiểm thử PostgreSQL Docker local. Không kết nối, chạy migration hoặc sửa Supabase thật. Người dùng tự chạy SQL.

## 2. Mô hình trạng thái và snapshot

### 2.1. Tách nghĩa vụ thanh toán khỏi tiến độ

- Payment theo scope ALL / MARKETPLACE / CUSTOM là nguồn trạng thái thu tiền. SUCCESS nghĩa là đã nhận tiền hợp lệ; không suy ra SUCCESS từ SHIPPING, DELIVERED hay COMPLETED.
- Tiến độ nhóm/đơn con mô tả chuẩn bị, in, giao, hoàn tất hoặc hủy. Không ghi PAID đè lên PREPARING, PRINTING, SHIPPING, COMPLETED chỉ vì admin vừa xác nhận thu tiền.
- DTO checkout trả paymentMethod, paymentStatus, payableAmount, quoteVersion/acceptedVersion, fulfillmentStatus và khả năng thao tác cho từng scope. FE không suy payment của custom từ paymentMethod chung của cha.
- Có thể giữ các field cũ để tương thích, nhưng phải có mapper và định nghĩa rõ; không dùng marketplaceStatus/customStatus đồng thời làm hai nguồn chân lý tài chính và giao hàng.
- Trạng thái cha là tổng hợp để hiển thị. Không dùng nó làm điều kiện duy nhất chặn xác nhận/thanh toán nhóm còn lại của SEPARATE.
- Tất cả đơn con hủy => cha CANCELLED. Ít nhất một đơn con COMPLETED và mọi đơn con còn hiệu lực COMPLETED => cha COMPLETED. Không có đơn con không được tự suy ra COMPLETED.
- Trạng thái tài chính cần đối soát vẫn được giữ độc lập dù fulfillment đã hủy/hoàn tất. Việc tổng hợp tiến độ không xóa dấu vết đối soát.
- Admin cập nhật mã theo dõi và tiến độ riêng từng nhóm; chưa tích hợp hãng vận chuyển vẫn phải có dữ liệu tracking nội bộ theo nhóm.

### 2.2. Phiên bản giá và xác nhận của khách

- priceVersion của CustomOrder chỉ là phiên bản quy ước tính giá legacy/v2, không phải số lần báo giá.
- Custom standalone có quoteVersion. Nhóm custom trong checkout có customPricingVersion. COMMON dùng summaryVersion của snapshot thanh toán toàn đơn.
- Marketplace giữ snapshot bất biến về sản phẩm, số lượng, đơn giá và phí ship phân bổ sau khi chốt; khi giữ bất biến thật sự, marketplacePricingVersion = 1 là hợp lệ. Không âm thầm thay giá sau hết hạn giữ kho. Muốn thay đổi phải có quy trình báo lại và version mới.
- Tăng phiên bản khi thay đổi nội dung phải được khách đồng ý, không tăng chỉ vì webhook hoặc tiến độ giao hàng đổi.
- Quote/confirm custom trong checkout khóa cha trước rồi khóa các dòng custom theo thứ tự ID ổn định; tránh mất lần tăng version khi hai admin báo giá đồng thời.
- Lưu acceptance theo scope: version đã đồng ý, snapshot/tổng tiền, người xác nhận và thời gian. API confirm bắt buộc expectedVersion; mismatch trả 409 để khách xem lại. Tạo payment chỉ từ acceptance hợp lệ, không chỉ kiểm tra quotedPrice khác null.
- PaymentAttempt lưu scope, scopeVersion, amount và tham chiếu snapshot bất biến. Khớp amount là cần thiết nhưng không đủ: phải đúng snapshot, trạng thái đơn và quyền thực hiện fulfillment.
- Admin chỉ sửa báo giá khi REQUESTED/QUOTED. Sau ACCEPTED hoặc đã trả tiền, không cho sửa qua endpoint quote thông thường. Không tự mở quyền sửa để thử version.
- Xác nhận custom SEPARATE kiểm tra có ít nhất một dòng custom còn hiệu lực, mọi dòng còn hiệu lực đã có giá hợp lệ, đúng version và chưa hủy/đối soát. Không cần trạng thái cha là PARTIALLY_PAID; hàng sẵn đang SHIPPING vẫn xác nhận được.
- Sau confirm, custom được đánh dấu đã xác nhận; lỗi tạo link không làm mất acceptance và không yêu cầu tạo đơn mới.

## 3. Payment: transaction ngắn và phục hồi an toàn

### 3.1. Ba pha qua Spring proxy

PaymentService là orchestration ngoài transaction. Các bước DB nằm trong bean riêng PaymentTransactionStepService, được gọi qua Spring proxy hoặc TransactionTemplate; không dựa self-invocation/private @Transactional.

1. **Prepare — Tx1:** kiểm tra quyền sở hữu, scope, acceptance/version, tổng tiền BE, trạng thái thanh toán và kho; khóa nhất quán; claim attempt hoặc trả attempt hiện tại; lưu providerCode và snapshot trước khi gọi mạng; commit.
2. **Provider — ngoài transaction:** request sở hữu quyền thực hiện mới gọi PayOS. Không giữ row lock hoặc transaction DB trong create/get/cancel. Dữ liệu mang ra ngoài là DTO scalar/snapshot, không truy cập lazy entity để mở lại kết nối trong lúc gọi mạng.
3. **Finalize — Tx2:** đọc và khóa lại payment/attempt; bổ sung URL/QR hoặc kết quả chưa rõ; không ghi lùi SUCCESS, RECONCILIATION_REQUIRED, DUPLICATE_PAID, CANCELLED hay trạng thái chốt khác. Không trả URL như một khoản phải trả nếu webhook đã chốt thanh toán.

Create checkout và confirm chỉ commit nghiệp vụ; không gọi provider trong transaction tạo/xác nhận đơn. FE gọi payment API sau khi nhận kết quả.

Webhook verify chữ ký trước khi ghi DB, rồi gọi settlement qua bean transaction. Verify chủ động gọi provider ngoài transaction, sau đó đưa kết quả vào cùng settlement. Rà mọi caller sau khi gỡ @Transactional cấp class.

### 3.2. Quyền sở hữu attempt và retry

- Khóa đơn/scope ở prepare để chỉ có một attempt đang khởi tạo/hoạt động cho nghĩa vụ thanh toán. Lưu trạng thái điều phối và owner token/generation bền vững nếu cần phục hồi quyền thực hiện; không chỉ dùng boolean trong RAM.
- Request cạnh tranh thấy attempt đang khởi tạo thì trả 202 với attempt ID và hướng dẫn kiểm tra lại. FE hiểu 202 là đang xử lý, không lỗi mất URL và không tạo key/order mới. Không để request thứ hai tự gọi create cùng lúc.
- Phân biệt attempt đang tạo, link sẵn sàng, PENDING_VERIFY, thành công, đối soát, đã hủy/hết hạn và lỗi xác định. Ghi rõ bảng chuyển trạng thái trong implementation; mapping tương thích trạng thái hiện có phải được kiểm thử.
- Timeout hoặc lỗi mạng không chứng minh provider chưa tạo link. Giữ cùng providerCode và tra cứu khi retry, kể cả chưa có URL.
- Tra cứu/hủy thất bại hoặc kết quả không rõ => giữ trạng thái chưa xác minh, trả 202/503 phù hợp, không mở mã mới. CANCEL_FAILED vẫn là trạng thái chưa rõ, không phải quyền tạo attempt mới.
- 30 giây chỉ là ngưỡng bắt đầu tra cứu phục hồi, không phải bằng chứng request cũ chết hay link hết hiệu lực. Không dùng mốc 10 giây khác để tự cấp mã mới.
- Provider trả “không tìm thấy” một lần không đủ để thay mã khi request cũ có thể còn đang gửi. Phải ngăn owner cũ tiếp tục gọi provider sau khi bị thay thế; cập nhật DB của owner cũ phải bị từ chối bằng token/generation.
- Nếu cần gửi lại create cùng providerCode để phục hồi, phải xác minh khả năng chống trùng của API/SDK PayOS đang dùng và kiểm thử. Khi chưa chứng minh được, giữ PENDING_VERIFY và xử lý đối soát, không tự suy provider hỗ trợ idempotency.
- Chỉ thay mã khi có bằng chứng trạng thái cũ đã kết thúc an toàn và không còn thao tác tạo cũ có thể mở lại. Quy tắc provider cụ thể phải được xác minh trong triển khai.

### 3.3. Settlement và kho

- Khóa và đọc lại đúng attempt/payment, kiểm tra chữ ký, providerCode, amount và snapshot scope. Callback lặp không trừ kho/cấp điểm lại. Hai mã cùng được trả phải lưu cả khoản nhận và phân loại khoản trùng.
- So version đúng scope; báo giá custom không làm vô hiệu QR marketplace bất biến. Custom standalone dùng quoteVersion, không dùng priceVersion legacy.
- Snapshot không còn hợp lệ, đơn đã hủy hoặc thiếu kho => ghi nhận tiền/attempt cần đối soát, chặn fulfillment liên quan, không ném exception làm mất toàn bộ dấu vết khoản tiền đã nhận.
- Giữ kho 20 phút cho link 15 phút là khoảng đệm, không thay thế kiểm tra callback muộn. Hết hạn phải kiểm tra tồn khả dụng trừ các giữ kho còn hiệu lực khác dưới khóa sản phẩm.
- Khóa nhiều sản phẩm theo ID ổn định. Reserve/renew/commit/release phân biệt rõ RESERVED, COMMITTED, đã hủy/hết hạn; không gia hạn hoặc trừ kho lần nữa chỉ vì record tồn tại.
- Hủy RESERVED không tăng tồn; hủy COD COMMITTED chưa xuất kho khôi phục đúng một lần. Hủy và webhook phải dùng cùng quy tắc khóa/scope. Không hủy bình thường khoản đã thu thành công.

## 4. Checkout idempotency và giỏ guest

### 4.1. Tạo và confirm đơn

- FE giữ key bền vững cho user + action + nội dung request. Retry, reload và timeout dùng lại key; thay đổi lựa chọn, quantity, design revision, địa chỉ hoặc phương thức tạo request/key mới. Không đổi key do re-render đơn thuần.
- DTO create có items gồm clientLineId, quantity và revision của custom/giỏ cần xác nhận. Chuẩn hóa thứ tự, kiểm tra ID trùng, quantity dương và quyền sở hữu. BE định giá từ dữ liệu tin cậy; không tin giá client.
- Hash lấy từ request chuẩn hóa, không lấy từ giỏ hiện tại sau khi đơn đã tạo. Tra idempotency trước đọc giỏ; retry khớp trả kết quả đã lưu, khác hash trả 409.
- Trong cùng transaction: claim bản ghi idempotency sớm, kiểm tra/khóa dữ liệu giỏ, tạo đơn, xóa đúng dòng đã đặt, lưu responseBody và COMPLETED. PROCESSING trong transaction chưa commit không được coi là kết quả thành công.
- Unique theo user/action/key. Claim sớm để request cạnh tranh không đọc giỏ đã bị request đầu xóa trước khi đụng unique. Lock giỏ vẫn cần để hai key khác nhau không đặt trùng cùng dòng.
- Bắt collision đúng constraint bên ngoài transaction đã rollback; mở transaction mới đọc kết quả và kiểm tra hash. Không biến mọi DataIntegrityViolationException thành thành công, không truy vấn tiếp trong transaction PostgreSQL đã lỗi.
- Confirm có namespace/scope/key/hash riêng; luôn kiểm tra quyền. Nhánh re-entry không bỏ qua kiểm tra payload/version chỉ vì status đã CONFIRMED.

### 4.2. Merge guest

- FE lưu mergeBatchId, target user và snapshot guest trước khi gửi PUT /cart/merge-guest. Reload/retry cùng batch giữ nguyên ID và payload.
- BE lưu batch trong DB (có thể tái sử dụng idempotency_records); cache không là nguồn chống lặp duy nhất. Unique theo user/action/batch, kiểm tra hash.
- Khóa giỏ; merge quantity và ghi nhận batch thành công trong cùng transaction. Request trùng không cộng lại. Kiểm tra ownership, quantity và design identity/revision; không gộp hai thiết kế khác nhau chỉ vì cùng productId.
- FE chỉ xóa các dòng/revision thuộc snapshot đã xác nhận thành công, không xóa toàn bộ guest nếu người dùng vừa thêm món mới trong thời gian chờ. Lỗi/timeout giữ nguyên snapshot pending.
- Guard response theo user và request generation; logout/login hoặc response cũ không được ghi lên giỏ tài khoản khác. Test cả hai tab và StrictMode.

## 5. COD, tracking và giao diện thanh toán

- Admin confirm COD chỉ đổi Payment sang SUCCESS với audit người xác nhận, thời gian, payment/scope và số tiền. Chặn đơn hủy và khoản đã đối soát; gọi lặp không thu/cấp điểm lại.
- Nếu cần tương thích status cũ, chỉ chuyển PENDING/CONFIRMED sang PAID; giữ nguyên mọi tiến độ đã bắt đầu. Không gán marketplaceStatus = PAID nếu field này đã dùng làm fulfillment.
- Quy ước hoàn tất để cấp điểm trong đợt này là COMPLETED. DELIVERED nếu tồn tại phải được mapping/quy trình chuyển rõ ràng, không tự cấp điểm chỉ vì tên tương tự.
- FE hiển thị theo scope và capability BE: QUOTED => Duyệt báo giá & thanh toán; đã accepted/confirmed nhưng chưa trả => Tiếp tục thanh toán; đang tạo/chưa xác minh => Kiểm tra thanh toán; SUCCESS => đã thanh toán; COD => trạng thái thu hộ; đối soát => cần hỗ trợ.
- Marketplace SHIPPING không ẩn nút custom còn nghĩa vụ thanh toán. COMMON đã thanh toán không hiện lại nút khi chuyển SHIPPING/COMPLETED. Không cho trả lại nhóm hủy hoặc thanh toán xong.
- Mọi trang đọc đơn từ server, hỗ trợ reload/link trực tiếp. Lỗi tạo link tiếp tục trên cùng đơn/attempt. Modal số tiền lấy từ snapshot/response thanh toán; không dùng tổng cũ trước confirm.
- Mọi màn custom chỉ PayOS. Admin quote chỉ REQUESTED/QUOTED; khóa cả ACCEPTED. Nhãn đơn giá và preview thành tiền thống nhất, legacy không nhân thêm. JSON thiết kế có bảng thông tin và mục xem bản gốc để không bỏ sót tag/font/layers/nét vẽ.

## 6. Điểm thưởng và thứ tự khóa

- Chỉ tiền hàng của đơn con COMPLETED và payment scope tương ứng SUCCESS mới đủ điều kiện; không tính ship, tiền chưa thu hoặc khoản đối soát. Resolve đúng ALL/MARKETPLACE/CUSTOM.
- Checkout có rewardPointsAwarded. Tổng điểm được hưởng = floor(tổng tiền hàng đủ điều kiện toàn checkout / 10.000). Cấp thêm = tổng điểm được hưởng - rewardPointsAwarded; chỉ cấp nếu dương.
- Trong cùng transaction: kiểm tra nguồn, cập nhật ví, ghi ledger event duy nhất, cập nhật rewardPointsAwarded. Ledger event có khóa gắn aggregate và mốc điểm lũy kế để cho phép cấp thêm nhiều đợt nhưng không lặp cùng mốc.
- Standalone có aggregate/event chống lặp riêng; không chạy cả thưởng standalone và thưởng checkout cho cùng đơn con.
- Tất cả writer ví, kể cả redeem/gift nếu ảnh hưởng điểm, thống nhất khóa User trước khi đọc/tạo ví. Nếu ví chưa tồn tại, khóa User bảo vệ việc tạo; unique user_id của ví vẫn bắt buộc.
- Khi tác vụ cần nhiều loại khóa, dùng một thứ tự toàn cục: User (nếu cần) -> CheckoutOrder -> đơn con theo ID -> Payment -> PaymentAttempt -> sản phẩm theo ID -> ví/ledger. Tác vụ không cần một loại khóa được bỏ qua bước đó, không được đi ngược thứ tự. Xác minh với mọi caller và điều chỉnh thống nhất nếu schema yêu cầu thứ tự khác.
- Hàm ngoài đã khóa đơn con không được sau đó gọi hàm thưởng khóa User/cha theo chiều ngược lại. Refactor boundary ở orchestration trước khi thêm lock vào helper.
- Không khẳng định loại trừ mọi deadlock. Kiểm thử cạnh tranh và có retry giới hạn cho lỗi DB tạm thời chỉ ở bước DB idempotent; không retry mù lời gọi provider.

## 7. Subscription và phí ship

- Admin sửa được name, description/benefits hiển thị, price, requiredPoints, durationDays, freeShipping và shippingDiscountAmount. Quyền lợi vận hành không parse từ tên hoặc text.
- Validate durationDays > 0, giá/điểm/mức giảm theo miền hợp lệ. freeShipping ưu tiên hơn giảm cố định. Phí cuối = freeShipping ? 0 : max(0, baseShippingFee - shippingDiscountAmount).
- BE định giá và snapshot phí khi chốt đơn: baseShippingFee, discount thực áp dụng, finalShippingFee và scope chịu phí. Đổi cấu hình sau đó không sửa đơn đã chốt. SEPARATE chỉ một lần phí; không tự chuyển phí đã trả sang nhóm khác.
- API trả breakdown BE; /subscriptions/me trả quyền lợi snapshot đang hiệu lực. FE không suy theo VIP/PRO/admin và không cam kết tổng cuối từ hai request cấu hình/hội viên đọc ở thời điểm khác nhau.
- Activation lưu snapshot quyền lợi, thời hạn và căn cứ giá/điểm tại thời điểm kích hoạt. Admin sửa plan chỉ ảnh hưởng activation mới, không thay quyền lợi giai đoạn đang chạy.
- Cùng plan gia hạn sớm: giữ nguyên snapshot giai đoạn hiện tại; tạo giai đoạn kế tiếp bắt đầu khi giai đoạn hiện tại/kế hoạch gia hạn đã mua kết thúc, dùng snapshot tại lúc gia hạn. Không chỉ kéo endDate rồi thay quyền lợi cả kỳ cũ. Quyền lợi hiện hành lọc theo start <= now < end, không cần worker để kích hoạt.
- Khác plan: thay thế gói đang dùng theo quyết định đã chốt, giữ lịch sử; không kéo hạn gói A khi người dùng đổi B. Nếu có các kỳ gia hạn tương lai, không tự xóa quyền lợi đã mua: chặn đổi khác plan với thông báo cần xử lý cho đến khi có chính sách chuyển đổi riêng được chốt.
- Redeem và activation/ledger trừ điểm trong cùng transaction. Không trừ điểm khi activation thất bại, không cho balance âm.

## 8. Migration và triển khai

Chỉ chuẩn bị scripts/migrations/02_to_04_cumulative_supabase.sql cho người dùng chạy. Baseline theo xác nhận: Supabase đã áp 01. Không tự chạy lên Supabase.

### 8.1. Preflight và schema

- Kiểm tra bảng/cột/kiểu/constraint thực tế, dữ liệu trùng và dữ liệu không hợp lệ; báo lỗi rõ thay vì dùng IF NOT EXISTS để bỏ qua schema sai.
- Bao gồm thay đổi 02/03: Payment checkout ManyToOne, bỏ unique checkout_order_id đơn lẻ, unique theo checkout/scope; bảng attempts và FK/index; độ dài các status đủ cho trạng thái đối soát; các cột delivery/price cần thiết từ các migration trước.
- Bổ sung quote_version cho custom standalone; custom_pricing_version cho checkout; scope_version cho attempt; reward_points_awarded cho checkout.
- Bổ sung cấu hình ship/thời hạn plan; schema snapshot và các giai đoạn hiệu lực UserSubscription; snapshot phí checkout (tái sử dụng cột tương đương nếu có, không tạo hai nguồn chân lý).
- Bổ sung event_key ledger cùng unique phù hợp; claim/hash/result idempotency; dữ liệu ownership/recovery attempt nếu mô hình dùng; tất cả entity/DTO và SQL phải có mapping rõ.
- NOT NULL, CHECK và default áp theo khả năng backfill, không ép dữ liệu cũ thành hợp lệ giả. Có post-check, hướng dẫn thứ tự, backup và cách rollback tương thích dữ liệu.

### 8.2. Dữ liệu cũ

- Không tự nhân quotedPrice lịch sử hoặc đổi tổng đã thanh toán.
- Attempt thiếu snapshot/version giữ dấu legacy. Nếu không đủ bằng chứng hợp lệ thì đối soát; webhook lặp của giao dịch đã được ghi nhận thành công không tự hạ trạng thái vì thiếu cột mới.
- rewardPointsAwarded không mặc nhiên = 0 cho checkout đã được thưởng. Backfill từ ledger/cờ thưởng có căn cứ và đối chiếu tổng; trường hợp không xác minh được phải chặn tự cấp lại để rà soát. Standalone cũng tránh chạy lại thưởng cũ.
- Backfill snapshot gói đang dùng từ quyền lợi có bằng chứng; không đặt free_shipping=false làm mất quyền lợi đang có mà không báo. Nếu dữ liệu cũ chỉ có text mơ hồ, cung cấp danh sách cần admin phân loại, không đoán tự động.
- Giữ mapping mọi mã PayOS cũ để callback muộn truy ra được khoản thanh toán.

## 9. Ma trận triển khai và nghiệm thu

| Phần | File/nhóm chịu tác động | Bằng chứng bắt buộc |
|---|---|---|
| Payment | PaymentServiceImpl, PaymentTransactionStepService/Helper, repositories, Payment/Attempt, controller/DTO | Spring proxy thật, prepare commit trước provider, finalize không ghi lùi webhook |
| Checkout | CheckoutOrderServiceImpl, DTO create/confirm/detail, inventory, custom quote | Scope/version/acceptance đúng; hàng sẵn đang giao không chặn custom |
| Cart | Cart controller/service/DTO, idempotency; useCart, CartPage | Merge batch bền vững, retry không mất/nhân giỏ; create retry không đọc giỏ đã xóa |
| Rewards | OrderServiceImpl, CustomOrderServiceImpl, UserSubscriptionServiceImpl, user/wallet/ledger | Lock đúng thứ tự, cộng dồn checkout, ledger duy nhất, migration không thưởng lại |
| Subscription | Plan/UserSubscription entity/service/API/DTO; SubscriptionPanel/admin form | Config và snapshot áp đúng; đổi gói đúng ID; gia hạn sớm không thay kỳ cũ |
| Tracking/FE | OrderList, CheckoutDetailPage, CustomRequests, AdminCustomOrdersPage, payment services | Status/payment theo scope, retry sau confirm, COD không lùi tiến độ, giá legacy đúng |
| SQL | Migration tổng hợp và hướng dẫn local | Chạy từ baseline 01; chạy lại an toàn; preflight/post-check và dữ liệu lịch sử |

### 9.1. Kiểm thử PostgreSQL local bắt buộc

Dùng Spring proxy thật và transaction/kết nối độc lập, provider giả lập có kiểm soát. Unit mock hoặc new Helper không chứng minh transaction/lock đúng. Không cần gọi thanh toán thật để kiểm thử cạnh tranh.

1. Hai request payment cùng scope; một attempt chủ động, không hai lần create cạnh tranh.
2. Provider đã nhận create nhưng response timeout; retry dùng cùng mã, get/cancel lỗi không sinh mã mới.
3. Owner bị dừng trước/sau khi gửi; request cũ chạy lại sau recovery; không mở hai link đang hoạt động.
4. Webhook đến trước response; finalize muộn không ghi lùi SUCCESS/đối soát.
5. Marketplace QR đang mở, admin báo giá custom; callback marketplace vẫn hợp lệ nếu snapshot của nó không đổi.
6. SEPARATE marketplace COD/PayOS đang SHIPPING, custom quote -> confirm -> tạo link lỗi -> reload -> tiếp tục trả tiền.
7. Callback trễ sau expiry, người khác giữ món cuối; không lấy hàng đang được giữ sai và có dấu vết tiền cần đối soát.
8. Hủy cạnh tranh webhook; COD commit -> cancel hai lần; không tăng/trừ kho lặp.
9. Hai complete cùng checkout và hai checkout cùng user; complete đồng thời redeem; ví và ledger đúng, không mất/cấp trùng điểm.
10. 6.000đ marketplace + 6.000đ custom hoàn tất hai đợt => tổng 1 điểm. Chưa thu tiền/ship không được tính.
11. Create/confirm cùng key concurrent, khác hash, timeout sau commit, reload; không tạo hai đơn, không EMPTY_SELECTION do retry.
12. Merge guest commit nhưng mất response; request lỗi trước commit; hai tab; thêm món trong lúc merge; logout/login. Không mất dữ liệu hoặc cộng hai lần.
13. COMMON/SEPARATE và standalone: giá mới/legacy, phí 0/giảm/toàn phần, COD chỉ hàng sẵn, báo giá nhiều sản phẩm.
14. Gói A -> B; cùng gói gia hạn sớm; admin sửa plan giữa kỳ; số dư không đủ và rollback activation; quyền lợi snapshot đúng.
15. Migration từ baseline 01 với đơn/attempt/điểm/subscription cũ và chạy lại; không mất mapping, không cấp lại điểm.

### 9.2. Điều kiện bàn giao

- FE typecheck/build và test phù hợp pass; BE compile/unit và các integration bắt buộc pass. Báo riêng test chưa chạy và lý do; không dùng build xanh thay bằng chứng giao dịch.
- Review SQL với entity cuối; người dùng tự áp Supabase sau khi local rehearsal đạt. Không dùng ddl-auto=update để che thiếu migration.
- Không tuyên bố đã hoàn tất mọi lỗi nếu còn tình huống P1 chưa được kiểm chứng. Bulk và refund ngoài phạm vi đợt này.
