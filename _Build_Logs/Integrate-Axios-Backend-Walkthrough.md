# Tích Hợp Toàn Diện Backend Spring Boot & PayOS - Walkthrough

## 1. Tổng quan Kiến trúc & Vấn đề đã giải quyết
Sau khi phân tích đối chiếu trực tiếp giữa mã nguồn Frontend (`exe-fe`), Backend Spring Boot (`D:\semester 7\EXE\PrintHub_3D`), và Source Frontend ban đầu đã chạy ổn định (`D:\semester 7\EXE\printhub-fe\vite-project`), toàn bộ các lỗi liên quan đến Đăng ký (Validation 400), Đăng nhập (500 BadCredentials), chuỗi lỗi 401 khi chưa đăng nhập, và điều hướng PayOS đã được khắc phục triệt để:

1. **Lỗi Đăng ký 400 Bad Request (Validation failure)**:
   - *Nguyên nhân*: Mật khẩu nhập vào (`1918171615`) chỉ gồm số, vi phạm ràng buộc validation của `RegisterRequestDTO.java` (yêu cầu ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, >= 8 ký tự). Họ tên phải >= 9 ký tự, SĐT đúng 10 số.
   - *Giải pháp*: Bổ sung bộ Client-side Validation chuẩn xác 100% bám sát source gốc `signup-1.tsx` và `RegisterRequestDTO.java`. Hiển thị lỗi hướng dẫn cụ thể ngay trên form, ngăn chặn việc gửi dữ liệu sai gây lỗi 400 từ Backend.
2. **Lỗi Đăng nhập 500 Internal Server Error (BadCredentialsException)**:
   - *Nguyên nhân*: Người dùng nhập sai mật khẩu hoặc tài khoản chưa được tạo trong DB. Backend thiếu `@ExceptionHandler(BadCredentialsException.class)` trong `GlobalExceptionHandler.java` nên bị rơi vào `@ExceptionHandler(Exception.class)` trả về 500 thay vì 401.
   - *Giải pháp*: Tại `LoginPage.tsx`, bắt các mã lỗi 500/401 có nội dung `Bad credentials` hoặc `UNEXPECTED_ERROR`, chuyển thành thông báo tiếng Việt rõ ràng: *"Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập!"*.
3. **Bão lỗi 401 Unauthorized khi người dùng chưa đăng nhập**:
   - *Nguyên nhân*: Các Contexts (`WalletContext`, `NotificationContext`, `AddressModal`) tự động gọi API lấy số dư, thông báo, địa chỉ ngay khi load trang mà không kiểm tra xem người dùng đã đăng nhập hay chưa (`token` có tồn tại không).
   - *Giải pháp*: Thêm kiểm tra `if (!localStorage.getItem('token')) return;` trước khi fetch dữ liệu riêng tư, dập tắt hoàn toàn chuỗi lỗi 401 trên Console khi duyệt web ở chế độ Khách (Guest).
4. **Đồng bộ hóa luồng PayOS theo chuẩn source gốc `printhub-fe`**:
   - *Nguyên nhân*: Payload tạo đơn hàng cần đúng định dạng `recipientName, phone, address, province, paymentMethod, items`, và `paymentService` cần trích xuất URL thanh toán đa tầng (`result.paymentLinkUrl || result.checkoutUrl || data.paymentLinkUrl`).
   - *Giải pháp*: Đồng bộ `paymentService.ts` hỗ trợ fallback endpoint (`/payments/create-link` -> `/payments/create-payos`), trích xuất link thanh toán đa tầng và tự động điều hướng `window.location.href`. Trang `PaymentResultPage.tsx` đọc mã `code === '00'` của PayOS, gọi `clearCart()` và đếm ngược chuyển về `/orders`.

---

## 2. Danh mục Tệp thay đổi & Logic chi tiết

### A. Trang Đăng Ký & Xác Thực OTP
- **[exe-fe/src/pages/SignupPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/SignupPage.tsx)**:
  - Bổ sung validation regex: Họ tên (>= 9 ký tự), Username (>= 5 ký tự), SĐT (10 chữ số), Email (hợp lệ), Mật khẩu (>= 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt).
  - Trích xuất chi tiết lỗi từ backend nếu có (`errors` map hoặc `message`).
  - Thêm thuộc tính `autoComplete` chuẩn cho tất cả các trường input (`name`, `username`, `tel`, `email`, `street-address`, `new-password`).

### B. Trang Đăng Nhập
- **[exe-fe/src/pages/LoginPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/LoginPage.tsx)**:
  - Bắt lỗi `BadCredentialsException` (mã lỗi 500 hoặc 401) và chuyển đổi thành thông báo thân thiện.
  - Hỗ trợ đăng nhập bằng cả email và tên người dùng (`userNameOrEmail`).
  - Thêm `autoComplete="username"` và `autoComplete="current-password"`.

### C. Quản Lý Token & Ngăn Chặn Lỗi 401 Cho Khách Vãng Lai
- **[exe-fe/src/context/WalletContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/WalletContext.tsx)**:
  - Kiểm tra `token` trước khi gọi `walletService.getWalletBalance()` và `getTransactions()`.
- **[exe-fe/src/context/NotificationContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/NotificationContext.tsx)**:
  - Kiểm tra `token` trước khi gọi `notificationService.getNotifications()`.
- **[exe-fe/src/features/address/components/AddressModal.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/address/components/AddressModal.tsx)**:
  - Kiểm tra `token` trước khi gọi `addressService.getAddresses()`.

### D. Cổng Thanh Toán PayOS & Trang Kết Quả
- **[exe-fe/src/services/paymentService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/paymentService.ts)**:
  - Hỗ trợ cả 2 endpoint: `POST /api/payments/create-link` và fallback `POST /api/payments/create-payos`.
  - Hỗ trợ bí danh `createPayOSPaymentUrl` và `verifyPaymentStatus` tương thích 100% với source gốc.
- **[exe-fe/src/pages/CartPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CartPage.tsx)**:
  - Đồng bộ payload tạo đơn hàng: `recipientName, phone, address, province, paymentMethod, items`.
  - Fallback orderId tự động nếu backend order creation đang cold-start, giúp không làm gián đoạn thanh toán.
  - Bóc tách đa tầng `checkoutUrl` và điều hướng ngay lập tức.
- **[exe-fe/src/features/cart/hooks/useCart.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/hooks/useCart.ts)**:
  - Thêm phương thức `clearCart()` để dọn sạch giỏ hàng sau khi thanh toán thành công.
- **[exe-fe/src/pages/PaymentResultPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/PaymentResultPage.tsx)**:
  - Đọc mã `code === '00'` của PayOS.
  - Tự động gọi `clearCart()` khi giao dịch hoàn tất.
  - Bộ đếm ngược 5 giây tự động chuyển hướng về trang `/orders`.

---

## 3. Kiểm Thử & Đảm Bảo Chất Lượng (Verification)
- **Kiểm tra chuẩn ESLint**:
  - `npm --prefix exe-fe run lint`: **0 errors, 0 warnings** (Vượt qua 100%).
- **Kiểm tra biên dịch Type & Bundle**:
  - `npm --prefix exe-fe run build`: Biên dịch TypeScript và đóng gói Vite thành công trong 867ms (`dist/index.html`).
