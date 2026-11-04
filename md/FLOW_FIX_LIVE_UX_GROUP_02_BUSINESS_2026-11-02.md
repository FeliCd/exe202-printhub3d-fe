# Flow Nhóm 2 — Đồng nhất trạng thái, validation và điều hướng

Ngày: 02/11/2026.

**Phạm vi:** F06–F15, F18 (11 vấn đề). Đây là đặc tả sửa và nghiệm thu, chưa phải kết quả các lỗi nghiệp vụ đã được sửa. Bulk order ngoài phạm vi; F24 đã rút do prototype được bỏ.

**Tài liệu chung:** [Mục lục, quy tắc và thứ tự triển khai](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) · [Báo cáo audit](./REVIEW_LIVE_WEBSITE_UX_2026-11-02.md).

## Điều kiện bắt đầu và phụ thuộc

1. Dùng các contract địa chỉ, tổng tiền và production asset đã chốt ở [Nhóm 1](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md). Nếu contract chưa xong, ghi rõ phần chờ; không tự định nghĩa một shape khác cho cùng dữ liệu.
2. Quy tắc trạng thái/allowedActions ở 2.1 là đầu vào cho [Nhóm 3](./FLOW_FIX_LIVE_UX_GROUP_03_EXPERIENCE_2026-11-02.md) khi dịch nhãn và [Nhóm 4](./FLOW_FIX_LIVE_UX_GROUP_04_FILES_PAYMENT_QA_2026-11-02.md) khi kiểm thử hủy/đối soát.
3. Các file CustomRequests, CartPage, DTO và service có thể trùng với nhóm khác: tích hợp theo thứ tự, kiểm tra diff trước khi nhận bản cập nhật; chỉ chuẩn bị nội dung/fixture độc lập khi chưa chốt contract.

## Flow sửa và tiêu chí nghiệm thu

### 2.1. F06–F09 — Một chính sách trạng thái và thống kê

**File:** [OrderTransitionPolicy.java](../../PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/OrderTransitionPolicy.java), OrderService/CustomOrderService/DashboardService, DTO `allowedActions/blockedActions`; FE OrderList, CustomRequests, AdminCustomOrdersPage, AdminDashboardPage, AdminSidebar.

**Chốt trạng thái hiển thị:**

| Loại dữ liệu | Nhóm trên giao diện | Quy tắc |
| --- | --- | --- |
| Marketplace PENDING/PAID/PREPARING/PRINTING/SHIPPING | Đang xử lý | Mô tả thanh toán và sản xuất riêng; không suy ra đã trả tiền chỉ từ PENDING. |
| Marketplace COMPLETED | Lịch sử hoàn tất | Điều kiện đánh giá/bảo hành đọc theo quyền nghiệp vụ. |
| Marketplace CANCELLED/EXPIRED | Lịch sử đã kết thúc | EXPIRED có nhãn “Hết hạn thanh toán”, lý do và đường đặt lại nếu còn hàng. |
| Custom REQUESTED | Chờ báo giá | Được hủy theo guard; admin được báo giá khi server cho phép. |
| Custom QUOTED | Có báo giá | Chủ yêu cầu chấp nhận hoặc hủy theo guard hiện hành. |
| Custom ACCEPTED/PAID/PREPARING/PRINTING/SHIPPING | Đang xử lý | Hiển thị điều kiện thanh toán; chấp nhận báo giá không mặc định đủ điều kiện in. |
| Custom COMPLETED/CANCELLED/EXPIRED nếu có | Lịch sử tương ứng | Không còn hành động báo giá/sản xuất không phù hợp. |

**Bước sửa:**

1. Kiểm kê các status thực có trong dữ liệu và enum; tạo bảng ánh xạ dùng chung. Không thêm EXPIRED cho Custom nếu backend chưa có lifecycle đó; trạng thái lạ cần nhãn rõ, không tự xếp vào đang xử lý.
2. F06: sửa filter active/history để EXPIRED không ở “đang xử lý”; stepper terminal hiển thị lý do kết thúc thay cho timeline sản xuất có vẻ còn chạy.
3. F07: chọn đích UX thống nhất: `/orders` có tab Marketplace/Custom/Tất cả, lấy cả dữ liệu user; `/order-history` xử lý cả hai theo cùng phân loại. `/quotations` vẫn phục vụ giai đoạn yêu cầu/báo giá, có link sang theo dõi sau khi chấp nhận. Gắn type + ID cho item, không nhập nhằng mã checkout cha và order con.
4. F08: render tác vụ từ `allowedActions`; mảng rỗng nghĩa là không có hành động, không phải tín hiệu bật fallback tùy ý. Nếu field thiếu do phiên bản API cũ, chỉ dùng fallback hạn chế đã thống nhất. Backend luôn kiểm tra lại dưới transaction trước mutation.
5. Backend trả lý do đúng cho CANCELLED, PAID hoặc đã sản xuất. FE không đổi lỗi “đã hủy” thành “vui lòng thử lại” hay “đã chấp nhận”.
6. F09: dashboard trả riêng tổng Custom, số REQUESTED, số QUOTED và số đang sản xuất. Sidebar/list/dashboard dùng cùng định nghĩa và cùng dữ liệu; bỏ badge cố định hoặc số total gắn nhãn chờ.
7. Sau quote/cancel/payment/progress, invalidate danh sách, counters và dashboard liên quan; tránh một màn mới, một màn giữ số cũ.

**Nghiệm thu:** fixture gồm EXPIRED, CANCELLED, REQUESTED, QUOTED và PAID cho kết quả nhóm/counters chính xác. Đơn Custom đã trả tiền tìm được từ trang theo dõi. Yêu cầu đã hủy không mở hành động báo giá; gọi API trực tiếp cũng bị từ chối và trạng thái giữ nguyên.

### 2.2. F10 — Validation số điện thoại cả FE và BE

**File:** AddressBookPage, AddressModal, ProfilePage, form nhận hàng; BE `AddressRequestDTO`, service lưu địa chỉ và các DTO nhận phone liên quan.

**Bước sửa:**

1. Chốt số được hỗ trợ trong giao hàng hiện tại. Đề xuất nhận số di động Việt Nam 10 chữ số; nếu hỗ trợ `+84`, chuẩn hóa về cùng dạng trước kiểm tra. Không dùng regex khác nhau ở mỗi form.
2. FE dùng helper chung chuẩn hóa khoảng trắng/dạng quốc tế được hỗ trợ, kiểm tra số ký tự và prefix. Hiển thị lỗi cạnh phone, giữ các trường khác.
3. BE áp dụng cùng quy tắc qua validation/service; không dựa vào `type=tel`. `abc`, thiếu/thừa số hoặc ký tự không được hỗ trợ trả 400 có field error.
4. Rà các địa chỉ cũ không hợp lệ; yêu cầu cập nhật trước checkout, không tự đoán số mới.

**Nghiệm thu:** `abc` không tạo bản ghi; các dạng được hỗ trợ chuẩn hóa đúng; FE/BE nhất quán; số sai từ request trực tiếp cũng bị chặn. Kiểm tra submit lỗi không đổi default address.

### 2.3. F11 — Sửa CTA Studio

Đổi link trong HelpCenterPage từ `/custom-order` thành `/custom`. Rà các link nội bộ tới route cũ. Có thể giữ redirect legacy nếu route đã được chia sẻ bên ngoài; không dựng thêm một trang Studio thứ hai.

**Nghiệm thu:** CTA mở đúng Studio, Back về đúng FAQ; hoạt động khi chưa đăng nhập và trên mobile. Không sửa nhầm route bulk order.

### 2.4. F12 — Tùy biến đúng sản phẩm đang xem

**File:** ProductCard/CatalogPage/MainContent, productService/types, CustomOrderPage, RulerStudio và registry mẫu thước.

**Bước sửa:**

1. Xác định sản phẩm nào thực sự có template Studio tương ứng. **Đề xuất** metadata `customizable`, `rulerTemplateId`, kích thước/vật liệu hỗ trợ; backend/nguồn dữ liệu phải liên kết đúng sản phẩm.
2. Sản phẩm có template: Tùy biến truyền product ID và template ID; vào Studio lấy cấu hình hợp lệ rồi khởi tạo. Query/route có thể khôi phục sau reload, không chỉ dựa vào `location.state` tạm thời.
3. Có bản nháp chưa lưu: hỏi giữ bản nháp hay mở thiết kế từ sản phẩm; không âm thầm ghi đè.
4. Không có template: bỏ nhãn “Tùy biến” gây hiểu nhầm. Có thể dùng “Yêu cầu tùy biến sản phẩm này” chuyển sang form có sẵn product ID/tên; hoặc “Tự thiết kế mẫu khác” nếu chủ đích đi vào Studio độc lập.
5. Giá catalog và giá thiết kế có khác biệt phải được giải thích; giá in theo cấu hình cần quote đọc từ backend hoặc ghi tạm tính, không dùng giá catalog làm giá chính thức của mọi biến thể.

**Nghiệm thu:** chọn thước kẹp không tự thành thước thẳng mặc định; reload vẫn biết nguồn sản phẩm; trường hợp không hỗ trợ có lời giải thích; thay template không làm mất bản nháp không báo trước.

### 2.5. F13 — Kiểm tra file ngay khi chọn và trên server

**File:** CustomRequestForm trong CustomRequests, helper upload model, UploadController/CloudinaryService và cấu hình giới hạn multipart.

**Bước sửa:**

1. Chốt một allowlist định dạng cho luồng này: STL/OBJ/STEP/STP hiện được UI cung cấp; 3MF chỉ đưa vào nếu sản phẩm chủ đích hỗ trợ. Dùng cùng nguồn khai báo ở UI và server.
2. Kiểm tra file rỗng, phần mở rộng, dung lượng trước khi thêm vào selection; picker và kéo thả gọi cùng validator. File lỗi không được giữ như file đã hợp lệ.
3. Chốt giới hạn 20MB là 20.000.000 hay 20 × 1024 × 1024 byte và hiển thị thống nhất. Không để FE, Spring multipart và storage có ba giới hạn khác nhau.
4. Backend kiểm tra lại kích thước/loại/nội dung theo định dạng, tên file an toàn, quyền upload; trả 413 khi quá giới hạn và lỗi nghiệp vụ rõ khi sai file.
5. Upload thành công nhưng tạo yêu cầu thất bại: giữ asset để retry trong thời hạn phù hợp hoặc có chính sách dọn asset chưa được liên kết; không upload lại vô hạn mỗi lần bấm gửi.

**Nghiệm thu:** TXT và STL 21MB bị cảnh báo ngay; bypass FE vẫn bị BE chặn; STL hợp lệ tạo yêu cầu được; chọn lại file sau lỗi hoạt động; số byte/file metadata khớp lúc tải lại.

### 2.6. F14 — Không tự nhận trường đại học của người dùng

ProfilePage và AuthContext mapping giữ `university/studentId` null hoặc rỗng như dữ liệu thật. View hiển thị “Chưa cập nhật”; form để trống với placeholder ví dụ. Phần quyền lợi theo trường chỉ hiển thị khi có điều kiện xác nhận phù hợp, hoặc ghi rõ thông tin giới thiệu chung.

**Nghiệm thu:** API university null không hiển thị thành trường thật; mở rồi lưu một trường khác không vô tình ghi trường mặc định. Hủy chỉnh sửa không thay dữ liệu tài khoản.

### 2.7. F15 — Một nguồn thông tin hỗ trợ và trạng thái cấu hình

**File:** StoreSettingService/Controller/API, AdminSettingsPage, Footer, HelpCenterPage, các layout/landing dùng contact.

**Bước sửa:**

1. Chủ website xác nhận hotline, email, giờ hỗ trợ và chính sách vận hành thực tế. Tài liệu này không tự chọn một số điện thoại/email đang mâu thuẫn làm số đúng.
2. BE cung cấp cấu hình công khai tối thiểu **đề xuất** `GET /api/public/settings`: brand/contact/hours và các thông tin chủ đích hiển thị công khai; không trả secret hoặc cấu hình nội bộ. Admin API đọc/ghi riêng.
3. Admin form phân biệt “chưa cấu hình”, “giá trị mặc định” và “đã lưu”. Response `{}` không được trông như bản cấu hình đã áp dụng.
4. Footer/Help/landing đọc cùng dữ liệu. Sau lưu thành công invalidate cache; lỗi tải dùng fallback được chủ website xác nhận, không phát sinh số/email giả mới.
5. Giờ trực tiếp 8h–22h khác nhận yêu cầu online 24/7 phải được ghi rõ nếu đó là mô hình thật.

**Nghiệm thu:** mọi nơi hiển thị cùng kênh liên hệ; thay đổi ở môi trường test truyền qua UI; refresh không quay về giá trị mẫu. Kiểm tra endpoint public không chứa secret.

### 2.8. F18 — SKU và tìm kiếm dùng cùng định danh

**File:** AdminProductsPage, Product DTO/entity/repository/service và hàm search.

**Bước sửa:**

1. Phân biệt business SKU với UUID kỹ thuật. Không gọi 8 ký tự đầu UUID là SKU nếu có thể trùng như `c0000001`.
2. Sửa tối thiểu: hiển thị đủ ID khi cần, cho copy ID đầy đủ và tìm được theo ID được cung cấp. Nếu bổ sung SKU, tạo field có ràng buộc duy nhất và migration cấp mã rõ ràng cho dữ liệu cũ.
3. Backend search theo các tiêu chí UI công bố: tên và SKU/ID; không chỉ đổi placeholder mà vẫn không có cách tra mã. Hỗ trợ bỏ dấu `#` do UI thêm khi copy và chuẩn hóa khoảng trắng.
4. Khi thay bộ lọc/keyword, reset đúng trang và loại response tìm kiếm cũ đến muộn.

**Nghiệm thu:** lấy một mã hiển thị từ danh sách → search ra đúng sản phẩm; hai sản phẩm không có cùng mã hiển thị gây nhầm. Tìm tên vẫn hoạt động; keyword không có kết quả có empty state đúng.

### 2.9. Cổng nghiệm thu Nhóm 2

- [ ] Active/history, counters và allowedActions khớp fixture cũng như dữ liệu thật đã đối chiếu.
- [ ] Không lưu phone sai, không suy diễn trường đại học chưa có dữ liệu.
- [ ] Link Help đúng Studio; Tùy biến không mất ngữ cảnh sản phẩm.
- [ ] File sai/quá giới hạn bị chặn ở cả client và server.
- [ ] Kênh hỗ trợ và trạng thái cấu hình nhất quán.
- [ ] Search mã lấy từ chính UI tìm được sản phẩm tương ứng.

## Bàn giao khi hoàn tất nhóm

Bàn giao bảng ánh xạ trạng thái/allowedActions/counters, quy tắc validation, contract contact/template/search và kết quả 2.9.

Với mỗi ID, ghi file/schema đã đổi, bằng chứng kiểm thử, môi trường và trạng thái: đã sửa và đã kiểm thử / đã sửa chưa kiểm thử live / chưa sửa. Giữ nguyên ID để đối chiếu báo cáo; không đánh dấu ca chưa chạy là pass.

Quay lại [mục lục và kế hoạch phối hợp](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) trước khi chuyển sang nhóm tiếp theo.
