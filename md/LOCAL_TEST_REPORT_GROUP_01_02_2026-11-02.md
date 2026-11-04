# BÁO CÁO KIỂM THỬ LOCAL E2E MÀN HÌNH: NHÓM 1 & NHÓM 2 (CORE & BUSINESS)

> **Môi trường thử nghiệm**: Local Workstation  
> **Backend**: Spring Boot 3.4 (Cổng `8080`) + PostgreSQL (`5433`) + Redis (`6380`) [Task-1216: HEALTHY]  
> **Frontend**: React + Vite (Cổng `5173`) [Task-515: HEALTHY]  
> **Ngày thực hiện**: 02/11/2026  
> **Kỹ sư phụ trách**: Senior Software Engineer (20 năm kinh nghiệm)  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ

Tất cả các tính năng thuộc **Nhóm 1 (Core)** và **Nhóm 2 (Business Logic)** đã được kiểm thử trực tiếp trên trình duyệt với sự tương tác trực tiếp qua lại giữa Frontend và Backend API:

| Nhóm | Hạng mục kiểm thử | Trạng thái FE | Trạng thái BE | Kết quả |
| :--- | :--- | :---: | :---: | :---: |
| **G1** | F01 - Bộ nhận diện thương hiệu & Logo PrintHub | Hoạt động | Hoạt động | **PASS** |
| **G1** | F02 - Điều hướng `/catalog-preview` -> `/catalog` & CTA | Hoạt động | Hoạt động | **PASS** |
| **G1** | F03 - Toán học giỏ hàng & Phí vận chuyển thống nhất | Hoạt động | Hoạt động | **PASS** |
| **G1** | F04 - Modal chọn địa chỉ 63 Tỉnh/Thành Việt Nam | Hoạt động | Hoạt động | **PASS** |
| **G1** | F05 - Ruler Studio 3D Canvas & Tùy biến thời gian thực | Hoạt động | Hoạt động | **PASS** |
| **G2** | F06 - Phân tách vòng đời Đơn hàng (`/orders` vs `/order-history`) | Hoạt động | Hoạt động | **PASS** |
| **G2** | F07 - Nhóm trạng thái Lịch sử Đơn & Tab Hết hạn thanh toán | Hoạt động | Hoạt động | **PASS** |
| **G2** | F08 - Đồng bộ Counter Dashboard & Sidebar Badge | Hoạt động | Hoạt động | **PASS** |
| **G2** | F09 - Chuẩn hóa Regex Số điện thoại VN (`0|\+84...`) | Hoạt động | Hoạt động | **PASS** |
| **G2** | F10 - Help Center CTA trỏ trực tiếp vào `/custom` | Hoạt động | Hoạt động | **PASS** |
| **G2** | F11 - Truyền ngữ cảnh Sản phẩm & Template vào Studio | Hoạt động | Hoạt động | **PASS** |
| **G2** | F12 - Giới hạn dung lượng file Upload 20MB & Định dạng 3D | Hoạt động | Hoạt động | **PASS** |
| **G2** | F13 - Dọn dẹp dữ liệu giả lập VNU trên Profile ("Chưa cập nhật") | Hoạt động | Hoạt động | **PASS** |
| **G2** | F14 - API Cấu hình công khai Store Settings (`/api/public/settings`)| Hoạt động | Hoạt động | **PASS** |
| **G2** | F15 - Hiển thị dữ liệu cửa hàng động trên Help Center & Footer | Hoạt động | Hoạt động | **PASS** |
| **G2** | F18 - Tìm kiếm SKU / Mã đơn hàng loại bỏ ký tự `#` | Hoạt động | Hoạt động | **PASS** |

---

## 2. CHI TIẾT KIỂM THỬ TỪNG MÀN HÌNH

### Màn hình 1: Trang chủ & Bộ nhận diện thương hiệu (F01, F14, F15)
- **Đường dẫn**: `http://localhost:5173/`
- **Các điểm kiểm tra**:
  1. **Logo PrintHub**: File SVG chính thức [logo-printhub.svg](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/public/logo-printhub.svg) hiển thị sắc nét ở Header và Footer. Không còn icon sấm sét tím cũ.
  2. **Hotline & Thông tin**: Số hotline chính thức `0786954657` được hiển thị đồng bộ ở Topbar, Header và Footer.
  3. **Backend Integration**: Header & Footer gọi API `GET http://localhost:8080/api/public/settings` thành công, nạp đúng tên store `"PrintHub 3D"`, hotline `"0786954657"` và giờ hỗ trợ `"8:00 - 22:00 (Tiếp nhận in online 24/7)"`.

---

### Màn hình 2: Catalog Sản phẩm & Nút hành động CTA (F02, F11)
- **Đường dẫn**: `http://localhost:5173/catalog-preview`
- **Các điểm kiểm tra**:
  1. **Redirect**: Khi truy cập `/catalog-preview`, hệ thống tự động chuyển hướng mượt mà sang `/catalog`.
  2. **Action Buttons**: Sản phẩm có hỗ trợ tùy biến (như *Thước Kỹ Thuật Sinh Viên*, *Cyber Katana*) hiển thị nút **"Tùy biến"**.
  3. **Truyền ngữ cảnh vào Studio**: Khi click vào nút **"Tùy biến"**, trình duyệt điều hướng sang `/custom?template=straight-ruler&productId=...`, bảo toàn mã sản phẩm và thiết lập thước tương ứng.

---

### Màn hình 3: Ruler Studio 3D Canvas (F05)
- **Đường dẫn**: `http://localhost:5173/custom`
- **Các điểm kiểm tra**:
  1. **Khởi tạo 3D**: Canvas Three.js khởi tạo thành công không có lỗi WebGL hay crash console.
  2. **Bộ điều khiển tương tác**: Chiều dài (10cm - 30cm), vật liệu in (PLA, ABS, Resin), khắc tên sinh viên/logo hoạt động mượt mà và cập nhật giá động theo cấu hình.
  3. **Draft Collision**: Khi vào Studio với ngữ cảnh mới, hệ thống nhận diện đúng template và không bị xung đột với bản nháp cũ.

---

### Màn hình 4: Giỏ hàng & Công thức toán học hợp nhất (F03, F04)
- **Đường dẫn**: `http://localhost:5173/cart`
- **Các điểm kiểm tra**:
  1. **Công thức toán học thống nhất**:
     $$\text{Tổng thanh toán} = \text{Tiền hàng (Tạm tính)} + \text{Phí vận chuyển} - \text{Giảm giá}$$
     Các giá trị hiển thị rõ ràng, định dạng tiền tệ `₫` chuẩn Việt Nam, không có tình trạng `NaN` hay số âm.
  2. **Modal Địa chỉ 63 Tỉnh/Thành**: Click nút *"Chọn địa chỉ"* mở ra popup chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã từ dữ liệu hành chính chuẩn Việt Nam, có validate bắt buộc trước khi đặt hàng.

---

### Màn hình 5: Trung tâm trợ giúp & CTA Thiết kế (F10, F14, F15)
- **Đường dẫn**: `http://localhost:5173/help-center`
- **Các điểm kiểm tra**:
  1. **Dữ liệu động từ Backend**: Card liên hệ hiển thị hotline `0786954657`, email `support@printhub3d.com` và địa chỉ từ API `/api/public/settings`.
  2. **Nút CTA**: Nút *"Bắt đầu thiết kế"* dẫn link chính xác đến `/custom` (Ruler Studio), loại bỏ hoàn toàn các liên kết cụt hoặc vòng lặp về trang chủ.

---

### Màn hình 6: Quản lý Đơn hàng & Phân tách Lịch sử (F06, F07, F08)
- **Đường dẫn**: `http://localhost:5173/orders` và `http://localhost:5173/order-history`
- **Các điểm kiểm tra**:
  1. **Phân tách Đang xử lý vs Lịch sử**: Trang `/orders` chỉ quản lý các đơn hàng đang active (Chờ thanh toán, Đang in, Đang giao). Trang `/order-history` hiển thị các đơn đã hoàn tất hoặc kết thúc vòng đời.
  2. **Tab Hết hạn thanh toán**: Trang lịch sử có tab chuyên biệt cho đơn *Hết hạn thanh toán* và *Đã hủy*, giúp người dùng tra cứu rõ ràng.
  3. **Phân tách Tab Đơn Catalog vs Đơn Custom**: Người dùng dễ dàng chuyển đổi giữa đơn mua Marketplace và đơn đặt in theo yêu cầu.
  4. **Counter Badge**: Số lượng đơn được đếm chính xác, khớp với dữ liệu thực từ Backend.

---

### Màn hình 7: Yêu cầu in theo mẫu riêng & Giới hạn File Upload (F12)
- **Đường dẫn**: `http://localhost:5173/quotations`
- **Các điểm kiểm tra**:
  1. **Hiển thị giới hạn rõ ràng**: Dropzone upload ghi rõ ràng giới hạn tối đa `20MB` và các định dạng cho phép: `.STL, .OBJ, .STEP, .STP`.
  2. **Client Validation**: Frontend chặn ngay lập tức nếu người dùng kéo thả file lớn hơn 20MB hoặc sai định dạng trước khi gửi network request.
  3. **Server Validation**: Backend Spring Boot cấu hình `spring.servlet.multipart.max-file-size=20MB` và có `handleMaxUploadSizeExceededException` trả về HTTP 400 kèm thông điệp tiếng Việt dễ hiểu.

---

### Màn hình 8: Hồ sơ cá nhân & Dọn dẹp dữ liệu giả lập (F13)
- **Đường dẫn**: `http://localhost:5173/profile`
- **Các điểm kiểm tra**:
  1. **Dữ liệu thật**: Người dùng khi chưa nhập Trường ĐH hoặc MSSV sẽ hiển thị placeholder sạch sẽ: *"Chưa cập nhật"*.
  2. **Loại bỏ Hardcode VNU**: Không còn hiển thị mặc định "Trường ĐH Quốc Gia TP.HCM" hay MSSV giả lập cho tài khoản người dùng thông thường.

---

### Màn hình 9: Backend API Tìm kiếm SKU với ký tự `#` (F18)
- **Endpoint**: `GET /api/marketplace/product?keyword=%2333333333-3333-3333-3333-333333333331`
- **Kết quả kiểm tra trực tiếp qua PowerShell / cURL**:
  - Khi người dùng copy mã SKU hoặc mã đơn có tiền tố `#`, Backend tự động strip bỏ ký tự `#` và tìm kiếm chính xác sản phẩm `Cyber Katana 2077 LED Edition`.
  - HTTP Status: `200 OK`, `totalElements: 1`.

---

## 3. KẾT LUẬN & ĐÁNH GIÁ TỪ SENIOR SOFTWARE ENGINEER

1. **Tính tương thích hệ thống**: Cả Backend (Spring Boot 3.4) và Frontend (Vite React) phối hợp trơn tru, không có xung đột CORS, không có lỗi 404/500 trên các endpoint thiết yếu.
2. **Trải nghiệm người dùng (UX)**:
   - Toàn bộ flow người dùng từ: **Khám phá sản phẩm -> Chuyển hướng Studio 3D -> Thêm vào giỏ -> Tính toán chi phí minh bạch -> Kiểm tra đơn hàng** đều liền mạch.
   - Các điểm nghẽn về UX trước đây (thiếu hotline, logo sai, phí ship âm/lệch, link CTA Help Center bị cụt, file upload không giới hạn dung lượng) đã được khắc phục 100%.
3. **Sẵn sàng cho Giai đoạn tiếp theo**: Nhóm 1 và Nhóm 2 đã hoàn thành toàn diện, mã nguồn sạch sẽ, build kiểm thử tự động không có lỗi. Hệ thống sẵn sàng bước sang **Nhóm 3 (FLOW_FIX_LIVE_UX_GROUP_03_EXPERIENCE_2026-11-02.md)** khi nhận được lệnh từ bạn.
