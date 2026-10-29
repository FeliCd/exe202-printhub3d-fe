# Rà soát order, subscription, chuyển trạng thái và bulk order

Ngày: 26/10/2026. Phạm vi: frontend `exe-fe/src` và backend `PrintHub_3D/src/main/java/com/fpt/printhub_3d` trong workspace hiện tại.

Đây là rà soát mã nguồn, đối chiếu hợp đồng API và kiểm tra build/test cục bộ; chưa xác minh trên database, tài khoản hay PayOS đang chạy. Các bước bên dưới là kịch bản tái hiện suy ra từ code, không phải giao dịch thật đã thực hiện. Chưa sửa logic ứng dụng.

P1: nên sửa trước khi đưa các luồng liên quan vào sử dụng; P2: lỗi nghiệp vụ/UI cần sửa. Không phát hiện đường bỏ qua quyền ADMIN trong các controller subscription đã kiểm tra: controller có `@PreAuthorize` và method security được bật.

## 1. [P1] Khách hàng tự đặt giá custom rồi dùng làm giá thanh toán

- Bằng chứng: backend `service/impl/CartServiceImpl.java:130,175` lưu `customPrice` trực tiếp từ request. `CheckoutOrderServiceImpl.java:98-108,131-133` dùng giá đó tính tổng, đánh dấu QUOTED và có thể tự chuyển cha sang CONFIRMED; dòng 181 tạo link thanh toán ngay.
- Tái hiện: cập nhật dòng custom trong giỏ với `customPrice = 1`, sau đó checkout PAYOS. Giá dương do khách gửi được coi như báo giá hợp lệ mà không cần admin.
- Ảnh hưởng: khách thao túng số tiền phải trả; kiểm tra `customAmount` trong PaymentService không chặn được vì chính tổng phía server đã bị nhiễm giá từ client.
- Sửa: server tự tính giá theo cấu hình đáng tin cậy hoặc yêu cầu báo giá admin. Không dùng giá gửi từ client làm giá có thẩm quyền.

## 2. [P1] Thanh toán được khi cha còn PENDING_QUOTE, bỏ qua báo giá và confirm

- Bằng chứng: `PaymentServiceImpl.java:88-101` cho phép CHECKOUT_ORDER ở cả CONFIRMED và PENDING_QUOTE. `CheckoutOrderServiceImpl.java:96-103` cộng custom chưa có giá thành 0. `PaymentServiceImpl.java:333-351` khi thanh toán sẽ đánh dấu toàn bộ đơn con PAID.
- Tái hiện: checkout có marketplace và custom chưa báo giá; gọi `/api/payments/create-link` với `orderType=CHECKOUT_ORDER`, ID cha, bỏ `customAmount`. Thanh toán tổng tạm tính chỉ gồm marketplace và phí ship có thể làm cả custom thành PAID.
- Sửa: chỉ tạo link sau confirm hợp lệ, tất cả báo giá đã chốt và giá/tồn kho được kiểm tra. Webhook phải kiểm tra snapshot đã xác nhận.

## 3. [P1] Checkout tự xác nhận bỏ qua kiểm tra và trừ tồn kho

- Bằng chứng: `CheckoutOrderServiceImpl.java:105-108,181-194` tự CONFIRMED và tạo link cho marketplace-only hoặc custom có giá. Tạo đơn không kiểm tra stock/trạng thái ACTIVE/seller active và không trừ stock. Trừ tồn chỉ nằm trong `confirmCheckoutOrder` dòng 260-267; webhook cũng không trừ stock.
- Tái hiện: checkout marketplace có số lượng vượt tồn rồi thanh toán qua link trả về. Không đi qua confirm nên vẫn có thể thanh toán mà stock không giảm. Sản phẩm ngừng bán sau khi vào giỏ cũng không được kiểm tra lại.
- Sửa: dùng chung một luồng kiểm tra và giữ/trừ tồn cho mọi checkout, kể cả đơn tự có giá.

## 4. [P1] Gọi confirm nhiều lần trừ tồn nhiều lần và kéo lùi trạng thái

- Bằng chứng: `CheckoutOrderServiceImpl.java:229-235` chỉ chặn CANCELLED; `summaryVersion` có thể không gửi. Mỗi lần gọi đều trừ stock tại 260-267 và đặt cha CONFIRMED tại 282. Dòng 291-294 đặt mọi custom khác PAID thành ACCEPTED, kể cả đã PRINTING/COMPLETED/CANCELLED.
- Tái hiện: gọi POST `/api/checkout-orders/{id}/confirm` hai lần, bỏ summaryVersion. Khi tồn còn đủ, mỗi lần đều trừ tồn. Có thể gọi sau thanh toán hoặc khi đơn con đã tiến triển để kéo lùi trạng thái.
- Sửa: chỉ cho phép đúng trạng thái trước confirm; bắt buộc phiên bản và xử lý idempotent; không tái kích hoạt đơn con đã hủy/hoàn thành.

## 5. [P1] “Nhận trước/nhận cùng lúc” chưa điều phối giao hàng

- Bằng chứng: toàn bộ tham chiếu `shippingMode` phía backend chỉ nằm ở entity/DTO và tạo/trả checkout. `CheckoutOrderServiceImpl.java:74-83` chỉ chặn nhiều seller khi COMMON, dòng 89 luôn thu 30.000đ. `OrderServiceImpl.updateOrderStatus` và `CustomOrderServiceImpl.updateCustomOrderStatus` không đọc mode hay độ sẵn sàng của đơn còn lại.
- Tái hiện COMMON: thanh toán giỏ trộn rồi admin đẩy marketplace sang SHIPPING khi custom chưa in xong; không có điều kiện ngăn giao riêng.
- Tái hiện SEPARATE: custom chưa báo giá vẫn làm cha PENDING_QUOTE và luồng checkout cha không có bước thanh toán/xử lý riêng marketplace để nhận trước.
- Sửa: COMMON phải có điều kiện gom chuyến khi các phần sẵn sàng; SEPARATE phải có lịch giao và cách phân bổ tiền/phí ship rõ ràng. Không thể sửa đầy đủ chỉ bằng đổi nhãn radio.

## 6. [P1] Frontend thiếu luồng xác nhận và khôi phục checkout cha

- Bằng chứng: tìm `checkout-orders` toàn bộ frontend chỉ thấy POST tạo tại `pages/CartPage.tsx:157`. Không có GET `/my`, GET chi tiết hoặc POST confirm. Kết quả checkout chỉ giữ trong state trang. OrderList dùng `/orders/me`, màn báo giá dùng các custom riêng.
- Tái hiện: đặt giỏ trộn có custom chờ giá, admin báo giá xong. Khách không có màn hình xác nhận tổng mới của cha. Reload trang cũng làm mất state kết quả/link tại giỏ.
- Ảnh hưởng: luồng cam kết “sau báo giá duyệt và thanh toán” của cha không hoàn chỉnh; lỗi link PayOS dễ khiến khách không có đường tiếp tục thanh toán cha trên UI.
- Sửa: thêm danh sách/chi tiết checkout cha, báo giá từng phần, tổng đã cập nhật, nút confirm và tiếp tục thanh toán dựa trên dữ liệu server.

## 7. [P1] Thanh toán/hủy đơn con không đồng bộ với cha

- Bằng chứng: `PaymentServiceImpl.java:61-101` cho thanh toán ORDER/CUSTOM_ORDER mà không kiểm tra chúng thuộc checkout cha; payment cha và con là các bản ghi độc lập. `settle` của cha dòng 341-351 đặt mọi con PAID, không kiểm tra trạng thái từng con. Hủy con trong hai order service không cập nhật tổng hay trạng thái cha.
- Tái hiện: tạo link thanh toán cho marketplace con PENDING, trả tiền con, rồi thanh toán cha: tổng cha vẫn chứa phần đã trả. Hoặc hủy con rồi thanh toán cha: webhook đổi con CANCELLED thành PAID.
- Sửa: một nguồn sự thật cho thanh toán; chặn API thanh toán con của checkout hoặc thiết kế thanh toán từng phần có ledger và số dư. Đồng bộ hủy, đối soát và tiến trình cha/con.

## 8. [P1] Admin chuyển đơn chưa thanh toán sang sản xuất và hoàn thành

- Bằng chứng: `OrderServiceImpl.java:405` cho cả PAID/PENDING sang PREPARING hoặc PRINTING, không yêu cầu COD hay payment SUCCESS. `CustomOrderServiceImpl.java:216` cho ACCEPTED/PAID vào sản xuất, không kiểm tra PAYOS đã trả tiền. Frontend `OrderList.tsx:178-181` cũng cho custom ACCEPTED sang PREPARING.
- Tái hiện: khách chấp nhận báo giá với PAYOS nhưng chưa trả; admin chuyển PREPARING → PRINTING → SHIPPING → COMPLETED. Marketplace PENDING có thể chuyển bằng API dù UI có chặn một phần.
- Ảnh hưởng: giao hàng chưa thu tiền; marketplace hoàn thành còn được cộng điểm. Webhook thanh toán đến sau có thể đặt trạng thái sản xuất trở lại PAID.
- Sửa: guard phía backend theo phương thức và trạng thái thanh toán; webhook chỉ cập nhật thanh toán và chuyển trạng thái nghiệp vụ theo các cạnh cho phép.

## 9. [P2] Đơn marketplace tạo qua checkout thiếu thông tin giao hàng/thanh toán ở màn quản lý

- Bằng chứng: `CheckoutOrderServiceImpl.java:148-175` tạo Order/OrderItem nhưng không tạo ShippingInfo, không lưu recipientName/recipientPhone và không tạo Payment COD cho con. `OrderServiceImpl.java:307-315` chỉ tra Payment của con, mặc định PAYOS/PENDING; không lấy từ cha. Custom DTO cũng chỉ tra payment của custom.
- Tái hiện: đặt giỏ marketplace bằng COD. `/admin/orders` trả shippingInfo null, paymentMethod PAYOS; UI `OrderList.tsx:169` vì vậy không hiện bước PREPARING cho con PENDING. Đơn trả tiền qua cha cũng có thể hiện paymentStatus PENDING ở màn con.
- Sửa: DTO phải lấy thông tin giao hàng và thanh toán từ checkout cha khi có liên kết, hoặc tạo snapshot con có hợp đồng nhất quán; giữ riêng tên/SĐT có cấu trúc.

## 10. [P2] Hủy đơn không hoàn tồn đã trừ

- Bằng chứng: `OrderServiceImpl.java:94-97` trừ stock lúc tạo order thường; nhánh CANCELLED dòng 388-400 chỉ cập nhật payment, không trả stock.
- Tái hiện: đặt đơn qua `/api/orders` rồi hủy khi PENDING. Tồn kho vẫn giảm mặc dù hàng chưa sản xuất/giao.
- Sửa: đánh dấu reservation và release đúng một lần khi hủy/hết hạn. Không hoàn tồn mù cho checkout chưa từng giữ tồn.

## 11. [P1] Cập nhật tồn kho và điểm thưởng có race condition

- Bằng chứng tồn: `OrderServiceImpl.java:59-97`, `CheckoutOrderServiceImpl.java:248-265` dùng `findById` rồi read-modify-write, không dùng `ProductRepository.findLockedById`. Entity Product không có @Version. Khóa cha checkout không khóa cùng sản phẩm giữa hai khách.
- Bằng chứng điểm: `OrderServiceImpl.java:207-261` đọc order/rewardProcessed/wallet không khóa; `redeemSubscription` khóa User nhưng đường cộng điểm không dùng cùng khóa đó.
- Kịch bản: hai khách cùng mua sản phẩm còn 1 có thể cùng thành công; hai request hoàn thưởng cùng order có thể cùng ghi giao dịch EARN; cộng điểm đồng thời đổi điểm hoặc hoàn hai đơn có thể ghi đè balance.
- Sửa: khóa/atomic update stock theo thứ tự ổn định; khóa order và wallet, mọi writer dùng chung quy tắc khóa; thêm ràng buộc chống thưởng trùng. Cần test concurrency với database thật để xác minh lịch xen kẽ cụ thể.

## 12. [P1] Đổi/tặng gói B nhưng thực tế chỉ gia hạn gói A

- Bằng chứng: `UserSubscriptionServiceImpl.java:171-178` tìm subscription theo user và TYPE, không phải planId; nếu có chỉ cộng endDate, không đổi plan. Điểm đã bị trừ theo plan B tại dòng 107-140.
- Tái hiện: admin tạo hai gói CUSTOMER A/B có giá điểm/quyền lợi khác nhau. User đang có A, đổi điểm lấy B. Điểm bị trừ theo B nhưng response và subscription vẫn là A. Tặng B cho người có A cũng vậy.
- Sửa: phân biệt gia hạn cùng plan và chuyển gói; định nghĩa nâng cấp/cộng thời hạn rõ ràng, lưu đúng gói mà khách nhận và lịch sử đổi.

## 13. [P2] Quyền lợi subscription chưa được thực thi trong order

- Bằng chứng: `SubscriptionPlan.benefits` chỉ là văn bản. Các tham chiếu UserSubscriptionRepository trong mã nguồn chỉ phục vụ đăng ký/tóm tắt subscription; các order/checkout service không đọc gói còn hiệu lực để giảm giá, miễn ship hoặc ưu tiên sản xuất. Checkout luôn phí ship 30.000đ.
- Tái hiện: tạo gói với quyền lợi “giảm 15%, miễn ship”, đổi/tặng thành công rồi đặt đơn. Công thức tổng không dùng gói nên không áp dụng các quyền lợi đó.
- Giới hạn: kết luận này áp dụng quyền lợi tự động trong ứng dụng; nếu nghiệp vụ chủ đích xử lý ưu đãi thủ công thì cần ghi rõ trên UI và quy trình vận hành.
- Sửa: mô hình hóa quyền lợi thành trường có cấu trúc, áp dụng phía server, snapshot phần giảm và kiểm thử cả marketplace/custom/bulk.

## 14. [P2] Admin luôn báo tặng thành công ngay cả khi API lỗi

- Bằng chứng: `features/subscriptions/SubscriptionPanel.tsx:85-93` await action.run rồi alert thành công vô điều kiện. `hooks/useRemote.ts:34-40` bắt lỗi và trả false thay vì throw.
- Tái hiện: chọn gói đã bị vô hiệu hóa từ phiên admin khác hoặc gây lỗi API rồi tặng. UI vừa có lỗi vừa báo tặng thành công.
- Sửa: chỉ thông báo thành công khi action.run trả true; hiển thị gói thực tế và ngày hết hạn từ response.

## 15. [P2] Hợp đồng giá bulk/custom không nhất quán với checkout

- Bằng chứng: `features/custom/CustomRequests.tsx` nhập “giá trọn gói”, hiển thị quotedPrice cho toàn bộ quantity và dùng `/custom-orders`. `PaymentServiceImpl.java:86` lấy trực tiếp quotedPrice; hoàn COD trong CustomOrderServiceImpl cũng lấy trực tiếp quotedPrice. Ngược lại `CheckoutOrderServiceImpl.java:272-274` lấy quotedPrice nhân quantity. Admin báo giá qua cùng quoteCustomOrder, không có kiểu giá phân biệt.
- Tái hiện đối chiếu: custom/bulk quantity=10, admin nhập 100.000đ. Thanh toán custom độc lập tính 100.000đ; custom thuộc checkout khi confirm đóng góp 1.000.000đ vào tổng. Cùng trường và thao tác báo giá nhưng khác nghĩa.
- Giới hạn: không thể kết luận bulk đang thu thiếu nếu giá chủ đích là trọn lô; lỗi xác nhận là hợp đồng giá và UI không phân biệt hai cách hiểu.
- Sửa: thống nhất unitPrice/lineTotal hoặc quoteScope, hiển thị rõ đơn giá × số lượng = tổng. Bulk hiện tạo từng custom độc lập cho mỗi file, không có thực thể lô/giao dịch nguyên tử; cần công bố rõ số lượng là cho mỗi file hay toàn lô.

## 16. [P2] Hai màn admin dùng tiến trình custom khác nhau, có trạng thái bị kẹt

- Bằng chứng: `features/orders/OrderList.tsx:178-184` chuyển ACCEPTED/PAID → PREPARING → PRINTING. `features/custom/CustomRequests.tsx:502-509` chuyển thẳng ACCEPTED(COD)/PAID → PRINTING và không có mapping PREPARING.
- Tái hiện: chuyển custom sang PREPARING ở trang quản lý đơn, sau đó mở màn quản lý custom/báo giá. Hàm next không trả hành động để tiếp tục đơn PREPARING tại màn đó.
- Sửa: dùng chung định nghĩa trạng thái/hành động và guard từ backend cho mọi màn admin.

## Các trường hợp phụ đã đối chiếu

- CUSTOMER_VIP có trong enum và đường redeem/gift chấp nhận, nhưng danh sách user chỉ lấy CUSTOMER; CRUD admin cũng cố định CUSTOMER. Nếu database còn gói CUSTOMER_VIP thì user không thấy và admin sửa/ngừng qua `/customer/{id}` sẽ bị PLAN_NOT_FOUND. Mức ảnh hưởng phụ thuộc dữ liệu thực tế.
- DTO checkout có idempotencyKey nhưng service không dùng; tạo checkout không khóa cart. Hai request đồng thời có thể đọc cùng giỏ trước khi xóa và tạo đơn trùng. Cần test tích hợp để xác nhận với isolation/database triển khai.
- Nhánh báo giá custom chỉ khóa/cập nhật custom, không tăng summaryVersion hoặc tổng cha. Kiểm tra version hiện tại không đại diện cho một snapshot báo giá đầy đủ.

## Thứ tự sửa và kiểm thử đề nghị

1. Chặn giá client và thanh toán PENDING_QUOTE; buộc snapshot giá đã duyệt, cấm thanh toán độc lập con của checkout khi chưa có thiết kế thanh toán từng phần.
2. Hợp nhất kiểm tra/giữ tồn, confirm idempotent và guard trạng thái có kiểm tra payment; đồng bộ cha/con khi thanh toán/hủy.
3. Hoàn thiện COMMON/SEPARATE và màn danh sách/chi tiết/xác nhận checkout cha; đồng bộ ShippingInfo/payment DTO cho admin.
4. Sửa đổi gói A/B, hợp đồng giá bulk và hành vi UI. Triển khai quyền lợi subscription theo chính sách được xác định.
5. Kiểm thử: giỏ marketplace-only/custom-only/mixed × COD/PAYOS × COMMON/SEPARATE; custom chưa báo giá/đủ giá/hủy một phần; retry/double click/concurrent checkout; hai buyer tranh stock=1; trả tiền trễ khi admin đang xử lý; đổi A→B; API tặng lỗi; bulk nhiều file với quantity>1 và lỗi giữa lô.

## Kiểm chứng cục bộ

- TypeScript: `.\\node_modules\\.bin\\tsc.cmd -b --pretty false` trong `exe-fe`: PASS.
- Maven wrapper không chạy vì repository thiếu `.mvn/wrapper/maven-wrapper.properties`. Chạy lại bằng Maven cài sẵn ngoài sandbox: `mvn -o -Dtest=UserSubscriptionServiceTest test` chạy 3 test, cả 3 ERROR do mock `findById` không khớp `findLockedById` trong service. Backend compile thành công; kết quả này không chứng minh các luồng nghiệp vụ chạy đúng.
- Bộ test subscription hiện mock `userRepository.findById` trong khi service đã dùng `findLockedById`; test cần cập nhật trước khi dùng làm bằng chứng xác nhận luồng chạy đúng.
- Chưa gọi API production, chưa thực hiện giao dịch thật và chưa thay đổi source tính năng.
