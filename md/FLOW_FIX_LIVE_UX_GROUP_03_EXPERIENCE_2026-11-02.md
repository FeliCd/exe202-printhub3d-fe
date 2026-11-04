# Flow Nhóm 3 — Hoàn thiện nội dung và khả năng sử dụng

Ngày: 02/11/2026.

**Phạm vi:** F16–F17, F19–F23 (7 vấn đề). Đây là đặc tả sửa và nghiệm thu, chưa phải kết quả các lỗi nghiệp vụ đã được sửa. Bulk order ngoài phạm vi; F24 đã rút do prototype được bỏ.

**Tài liệu chung:** [Mục lục, quy tắc và thứ tự triển khai](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) · [Báo cáo audit](./REVIEW_LIVE_WEBSITE_UX_2026-11-02.md).

## Điều kiện bắt đầu và phụ thuộc

1. Nội dung có thể chuẩn bị trước; khi tích hợp phải dùng nguồn contact/status từ [Nhóm 2](./FLOW_FIX_LIVE_UX_GROUP_02_BUSINESS_2026-11-02.md) và nguồn giá từ [Nhóm 1](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md). Không đưa lại số điện thoại, trạng thái hoặc giá giả để lấp dữ liệu rỗng.
2. Trang catalog-preview đã bỏ theo yêu cầu, F24 đã rút. Chỉ chỉnh catalog chính; không tạo lại prototype để sửa nhãn hoặc mock data.
3. Thay component Modal cần kiểm tra lại checkout/quote/import của Nhóm 1–2 và luồng hủy ở [Nhóm 4](./FLOW_FIX_LIVE_UX_GROUP_04_FILES_PAYMENT_QA_2026-11-02.md); tránh thay API props làm hỏng các form đã sửa.

## Flow sửa và tiêu chí nghiệm thu

### 3.1. F16 — Dọn catalog đang phục vụ thật

Chỉ xử lý `/catalog`, không khôi phục prototype đã bỏ.

1. Xuất danh sách sản phẩm đang active cùng ảnh, mô tả và giá; chủ website xác định sản phẩm thật và bản ghi thử. Không tự xóa sản phẩm có lịch sử đặt hàng.
2. Thay ảnh phòng thí nghiệm/hình nền không liên quan bằng ảnh đúng sản phẩm; có ảnh tổng thể, vạch chia và cá nhân hóa nếu thực sự hỗ trợ.
3. Thay mô tả `18576`, `18578` bằng nội dung được xác nhận. Bản ghi chưa sẵn sàng nên ẩn/ngừng bán có kiểm soát thay vì hiển thị dữ liệu thử cho khách.
4. Chuẩn hóa khung ảnh và fallback khi thiếu ảnh. Fallback phải là trạng thái “Chưa có ảnh”, không phải ảnh một sản phẩm khác.
5. Giữ tồn kho/giá/lịch sử đơn; thay nội dung không tự thay các trường nghiệp vụ khác.

**Nghiệm thu:** từng sản phẩm active có tên/ảnh/mô tả tương ứng, không còn chuỗi thử; kiểm tra desktop/mobile, ảnh chậm/lỗi và sản phẩm không có ảnh.

### 3.2. F17 — Xuất bản nội dung chính sách đã được chủ website xác nhận

1. Soạn chính sách bảo mật, điều khoản dịch vụ, giao hàng/đổi trả/bảo hành phù hợp hoạt động thực tế. Đây là nội dung cần chủ website xác nhận, không tự biến các lời quảng bá cũ thành cam kết mới.
2. Tạo route riêng **đề xuất** `/privacy-policy`, `/terms`; nội dung bảo hành có thể dùng trang riêng hoặc phần chính sách hiện có, không trộn với form gửi yêu cầu.
3. Footer, signup và checkout dẫn tới cùng bản đang áp dụng. Ghi ngày áp dụng/version nội dung; nếu thu thập xác nhận điều khoản, lưu phiên bản đã được người dùng chấp thuận.
4. Bỏ nhãn “Sắp ra mắt” khi trang đã có nội dung; link phải truy cập được cả khi chưa login.

**Nghiệm thu:** đọc được chính sách từ signup/checkout/footer, mobile không vỡ bố cục, Back giữ được form/bước đang thực hiện. Không coi đây là chứng nhận tuân thủ pháp lý.

### 3.3. F19 — Nhãn, hướng dẫn và lỗi của form admin

**File:** AdminProductsPage và các form liên quan sử dụng cùng mẫu.

1. Mỗi input/select/textarea có ID ổn định và `<label htmlFor>` tương ứng hoặc được bọc label đúng; placeholder chỉ là ví dụ.
2. Đặt `aria-describedby` cho hint và lỗi; `aria-invalid` theo validation. Dấu bắt buộc và đơn vị tiền/số lượng phải có trong accessible name hoặc hint.
3. Upload ảnh/file có tên điều khiển rõ và trạng thái kết quả; nút chỉ có icon phải có nhãn thao tác và đối tượng.
4. Submit lỗi đưa focus tới lỗi đầu tiên; trạng thái đang lưu/đã lưu được thông báo phù hợp, không chỉ đổi màu.
5. Kiểm tra bằng bàn phím và ít nhất một trình đọc màn hình trước khi nghiệm thu đầy đủ.

**Nghiệm thu:** click label focus đúng field; tab có thứ tự; trình đọc màn hình phân biệt tên/danh mục/giá/tồn kho; lỗi field không chỉ xuất hiện trong alert chung.

### 3.4. F20 — Chỉ hiển thị giá cũ khi thực sự có giảm giá

**File:** [productService.ts](../exe-fe/src/services/productService.ts), ProductCard và DTO nếu cần.

1. Không coi `originalPrice = price` trong mapper là bằng chứng đang giảm.
2. Card chỉ render giá gạch ngang khi giá gốc hợp lệ và lớn hơn giá bán. Giá bằng nhau/không có giá gốc thì chỉ có một giá.
3. Nếu backend chưa có giá gốc, bỏ phần giá cũ thay vì tự tính giá khuyến mãi giả.
4. Nhãn phần trăm giảm, nếu có, lấy từ cùng hai giá và quy tắc làm tròn được thống nhất.

**Nghiệm thu:** không có hai giá 49.000đ giống nhau; trường hợp có giảm thật thể hiện đúng; số 0/null/giá lỗi không tạo nhãn giảm vô lý.

### 3.5. F21 — Hoàn tất dịch Studio và các modal con

1. Rà chuỗi hardcoded trong toolbar, export modal, hướng dẫn xoay, thư viện, import errors, quote form, nhãn ARIA và các toast.
2. Đưa về cùng bảng dịch/hook ngôn ngữ hiện có; tránh thêm hệ thống dịch thứ hai cho riêng vài nút.
3. Tên kỹ thuật/model có thể giữ tên gốc, nhưng mô tả và hành động phải theo ngôn ngữ đã chọn. Những chuỗi chưa có bản dịch có fallback được chủ đích, không xen ngôn ngữ ngẫu nhiên.
4. Kiểm tra tên dài trên 320/390px và trong modal; đổi ngôn ngữ không reset thiết kế.

**Nghiệm thu:** ở English không còn nút xuất/solid/hướng dẫn quan trọng bằng tiếng Việt; tiếng Việt có hướng dẫn dùng được; lựa chọn ngôn ngữ được giữ theo quy tắc hiện tại sau reload.

### 3.6. F22 — Định dạng thời gian và trạng thái qua helper chung

1. Tạo formatter dùng chung cho thông báo/đơn/tài chính; parse timestamp UTC có timezone, render theo locale và múi giờ người dùng. Không cộng thủ công 7 giờ vào mọi chuỗi.
2. Cho thời gian tương đối ở thông báo khi phù hợp, kèm thời gian cụ thể có thể xem; timestamp không hợp lệ dùng fallback rõ.
3. Map mã status sang nhãn tiếng Việt/English theo ngữ cảnh Order/Payment, giữ mã gốc trong dữ liệu phục vụ debug.
4. Không map mọi trạng thái lạ thành “Chờ xử lý”; phải hiện chưa xác định và giữ thông tin đối chiếu cho vận hành.

**Nghiệm thu:** timestamp ISO trong audit có hiển thị dễ đọc; EXPIRED/CANCELLED không bị gộp; kiểm tra giao ngày UTC/Việt Nam và lựa chọn ngôn ngữ.

### 3.7. F23 — Dùng một contract modal nhất quán

**File:** [Modal.tsx](../exe-fe/src/components/Modal.tsx), ChangePasswordModal, AdminProductsPage và các modal custom chưa theo component chung.

1. Dùng dialog/component chuẩn có accessible name gắn tiêu đề và `aria-modal`; tránh một overlay `div` không có semantics.
2. Mở modal đưa focus vào vị trí hợp lý; Tab/Shift+Tab ở trong modal; nền không nhận tương tác ngoài ý muốn; đóng trả focus về nút mở.
3. Escape đóng modal thông thường. Nếu đang gửi hoặc có dữ liệu chưa lưu cần quy tắc rõ: chờ thao tác/kết quả hoặc xác nhận bỏ thay đổi, không im lặng bỏ qua phím.
4. Đồng nhất nút X, Hủy và click nền theo chính sách; form submit không bị kích hoạt bởi nút đóng thiếu `type=button`.
5. Giữ cuộn và bàn phím mobile ổn định; không tạo hai dialog đồng thời tranh focus.

**Nghiệm thu:** form sản phẩm và đổi mật khẩu dùng được bằng keyboard, Escape theo chính sách, focus quay đúng chỗ. Kiểm tra modal export/thư viện/quote sau khi thay component để tránh hồi quy.

### 3.8. Cổng nghiệm thu Nhóm 3

- [ ] Catalog chính không dùng nội dung sản phẩm thử gây nhầm.
- [ ] Trang chính sách có nội dung được xác nhận và link từ các vị trí cần thiết.
- [ ] Giá cũ/bản dịch/thời gian/status không gây hiểu nhầm.
- [ ] Form và modal quan trọng qua kiểm tra nhãn, bàn phím, focus và màn hình nhỏ.
- [ ] Không còn lazy import/menu tới trang prototype; URL cũ về catalog chính.

## Bàn giao khi hoàn tất nhóm

Bàn giao nội dung được chủ website xác nhận, các trường/form/modal đã kiểm tra, kết quả desktop/mobile/keyboard/ngôn ngữ và checklist 3.8.

Với mỗi ID, ghi file/schema đã đổi, bằng chứng kiểm thử, môi trường và trạng thái: đã sửa và đã kiểm thử / đã sửa chưa kiểm thử live / chưa sửa. Giữ nguyên ID để đối chiếu báo cáo; không đánh dấu ca chưa chạy là pass.

Quay lại [mục lục và kế hoạch phối hợp](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) trước khi chuyển sang nhóm tiếp theo.
