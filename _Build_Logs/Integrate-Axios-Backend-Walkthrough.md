# Tích Hợp Toàn Diện Backend Spring Boot & PayOS - Walkthrough

## 1. Tổng quan Kiến trúc & Vấn đề đã giải quyết
Sau khi phân tích đối chiếu trực tiếp giữa mã nguồn Frontend (`exe-fe`) và Backend Spring Boot (`D:\semester 7\EXE\PrintHub_3D`), toàn bộ 6 nhóm lỗi nghiêm trọng mà người dùng phản ánh đã được khắc phục triệt để:

1. **Lỗi không gửi OTP mail khi đăng ký**:
   - *Nguyên nhân*: Frontend trước đây chỉ gửi `email, fullName, password`, trong khi backend yêu cầu payload `RegisterRequestDTO` gồm `fullName, username, email, phone, address, password, confirmPassword` và sau đó kích hoạt gửi mã OTP qua JavaMail/Resend để chờ xác thực bước 2 (`/api/auth/verify-register-otp`).
   - *Giải pháp*: Xây dựng giao diện đăng ký 2 bước (Bước 1: Điền thông tin tài khoản; Bước 2: Nhập mã OTP 6 số để kích hoạt tài khoản), hỗ trợ đếm ngược gửi lại mã OTP.
2. **Lỗi 401 Unauthorized khi đăng nhập**:
   - *Nguyên nhân*: Trường mật khẩu chưa được bind hai chiều vào form submit và payload không khớp với trường `userNameOrEmail` của `LoginRequestDTO`, đồng thời chưa lưu `accessToken` đúng cấu trúc trả về từ backend.
   - *Giải pháp*: Cập nhật `AuthContext.tsx` và `LoginPage.tsx` truyền đúng `userNameOrEmail`, `password`, trích xuất `accessToken` lưu vào `localStorage`, đồng thời phân giải vai trò (Role) từ dữ liệu Backend.
3. **Lỗi không gọi được Backend Render (`https://exe-printhub-3d.onrender.com/`)**:
   - *Nguyên nhân*: URL người dùng cấu hình trên Vercel có dấu gạch chéo cuối (`/`) và thiếu tiền tố `@RequestMapping("/api/...")` của toàn bộ Controller backend, dẫn đến mọi API request đều bị 404 trên Render.
   - *Giải pháp*: Thêm hàm chuẩn hóa `getBaseUrl()` trong `api.ts`, tự động loại bỏ trailing slash và tự động chèn `/api` nếu thiếu. Đồng thời xử lý thời gian khởi động (cold start 50s) của Render Free tier mà không làm crash ứng dụng.
4. **Lỗi không điều hướng được sang trang thanh toán**:
   - *Nguyên nhân*: Cổng thanh toán thực tế của backend là **PayOS VietQR** (`/api/payments/create-link`), nhưng trước đây frontend chỉ có nút giả lập Ví và COD mà không tạo link PayOS hay điều hướng `window.location.href`.
   - *Giải pháp*: Tạo `paymentService.ts`, tích hợp nút chọn "Quét Mã VietQR (PayOS)" trong `CartPage.tsx`, gọi backend tạo link và tự động chuyển hướng trình duyệt sang cổng thanh toán trực tuyến của PayOS.
5. **Lỗi F5/Reload trên Vercel bị 404 Not Found**:
   - *Nguyên nhân*: Ứng dụng Single Page Application (Vite/React Router) trên Vercel thiếu rewrite rule cho các đường dẫn con (deep links).
   - *Giải pháp*: Tạo tệp cấu hình `vercel.json` (ở cả thư mục con `exe-fe/` và thư mục gốc repo) với luật rewrite `{"source": "/(.*)", "destination": "/index.html"}`.
6. **Chưa có trang xử lý kết quả Return và Cancel khi thanh toán**:
   - *Nguyên nhân*: `PaymentResultPage.tsx` trước đây là giao diện tĩnh, không đọc query parameters từ PayOS (`cancel`, `status`, `orderCode`, `vnp_ResponseCode`).
   - *Giải pháp*: Nâng cấp `PaymentResultPage.tsx` đọc toàn bộ query parameters, gọi `paymentService.verifyPayment(orderCode)` để đối soát với backend, hiển thị 2 trạng thái rõ ràng: Thành công (kèm nút theo dõi đơn hàng) và Thất bại / Đã hủy (kèm nút "Thử thanh toán lại" và "Tiếp tục mua hàng").

---

## 2. Danh mục Tệp thay đổi & Logic chi tiết

### A. Cổng thanh toán PayOS & Kết quả giao dịch
- **[exe-fe/src/services/paymentService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/paymentService.ts)**:
  - `createPaymentLink`: Gọi `POST /api/payments/create-link` với body `{ orderId, orderType, description, customAmount, paymentOption }`.
  - `verifyPayment`: Gọi `GET /api/payments/verify/{orderCode}` để xác thực giao dịch từ PayOS.
- **[exe-fe/src/pages/CartPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CartPage.tsx)**:
  - Thêm phương thức thanh toán `PAYOS` ("Quét Mã VietQR (PayOS)").
  - Khi nhấn xác nhận đặt hàng, gọi backend tạo đơn và tạo link thanh toán, sau đó chuyển hướng `window.location.href = checkoutUrl`.
  - Hiển thị spinner và trạng thái loading khi đang khởi tạo kết nối cổng thanh toán.
- **[exe-fe/src/pages/PaymentResultPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/PaymentResultPage.tsx)**:
  - Sử dụng `useSearchParams` để phân tích `orderCode`, `status`, `cancel`, `vnp_ResponseCode`.
  - Nếu giao dịch bị hủy (`cancel=true` hoặc `status=CANCELLED`): Render màn hình cảnh báo đỏ, hiển thị mã đơn và nút "Thử Thanh Toán Lại" quay về `/cart`.
  - Nếu giao dịch thành công: Hiển thị chứng nhận thanh toán xanh lá, mã giao dịch thực tế, chính sách bảo hành 1 học kỳ và nút "Theo Dõi Đơn Hàng" (`/orders`).

### B. Xác thực & Đăng ký OTP
- **[exe-fe/src/pages/SignupPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/SignupPage.tsx)**:
  - Form Bước 1: Thu thập đầy đủ các trường khớp `RegisterRequestDTO` của Spring Boot (`fullName`, `username`, `email`, `phone`, `address`, `password`, `confirmPassword`).
  - Form Bước 2: Nhập mã OTP 6 số nhận qua Email, gọi `authService.verifyRegisterOtp({ email, otpCode })`.
  - Tự động lưu token và chuyển hướng người dùng sau khi kích hoạt thành công.
- **[exe-fe/src/pages/LoginPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/LoginPage.tsx)** & **[exe-fe/src/context/AuthContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/AuthContext.tsx)**:
  - Xử lý payload đăng nhập khớp backend `userNameOrEmail`, lưu trữ `accessToken` vào `localStorage`.

### C. Cấu hình Vercel & Chuẩn hóa URL
- **[exe-fe/src/services/api.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/api.ts)**:
  - Helper `getBaseUrl()` tự động chuẩn hóa URL backend Render, thêm hậu tố `/api` nếu cấu hình môi trường chỉ nhập domain gốc.
- **[exe-fe/vercel.json](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/vercel.json)** & **[vercel.json](file:///d:/semester%207/EXE/exe202-printhub3d-fe/vercel.json)**:
  - Đảm bảo cơ chế Single Page Application định tuyến toàn bộ request con về `/index.html`, triệt tiêu lỗi 404 khi người dùng F5 hoặc truy cập trực tiếp đường link.

### D. Đồng bộ Endpoints Sản phẩm & Đơn hàng
- **[exe-fe/src/services/productService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/productService.ts)**:
  - Ưu tiên gọi endpoint `/marketplace/product` của Spring Boot backend; tự động fallback `/products` nếu controller dùng định dạng khác.
- **[exe-fe/src/services/orderService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/orderService.ts)**:
  - Ưu tiên gọi `/orders/my-orders` của backend Spring Boot; fallback `/orders/me`.

---

## 3. Kiểm thử & Đảm bảo Chất lượng (Verification)
- **Kiểm tra cú pháp & Chuẩn linter**:
  - `npm --prefix exe-fe run lint`: **0 errors, 0 warnings** (vượt qua 100%).
- **Kiểm tra biên dịch Type & Bundle**:
  - `npm --prefix exe-fe run build`: `tsc -b && vite build` thành công, tạo bundle sản xuất tối ưu tại `exe-fe/dist/`.
- **Độ tin cậy (Resilience)**:
  - Toàn bộ service đều duy trì cơ chế fallback thông minh: Khi backend đang ngủ đông (Render spin-down) hoặc mất kết nối, người dùng vẫn xem được sản phẩm, thử nghiệm các tính năng mà không bao giờ gặp lỗi sập giao diện.
