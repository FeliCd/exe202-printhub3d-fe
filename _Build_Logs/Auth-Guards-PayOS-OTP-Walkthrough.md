# Walkthrough: Xác Thực Đặt Hàng, Bỏ VietQR, Quên/Đổi Mật Khẩu Qua Email OTP

## 1. Tổng Quan Kiến Trúc & Yêu Cầu Đã Xử Lý

Chúng tôi đã hoàn thiện toàn diện 4 nhóm nhiệm vụ chính:

1. **Rà soát & Kích hoạt Auth Guards (Chặn khách chưa đăng nhập đặt hàng)**:
   - **Giỏ Hàng (`CartPage.tsx`)**: Bổ sung kiểm tra `isAuthenticated`. Khách chưa đăng nhập bấm "Đặt hàng" sẽ tự động chuyển hướng sang `/login?redirect=/cart`. Hiển thị banner cảnh báo đăng nhập và nút "Đăng Nhập Để Đặt Hàng & In 3D".
   - **Cart Drawer (`CartDrawer.tsx`)**: Khi bấm "TIẾN HÀNH ĐẶT HÀNG & IN 3D", kiểm tra trạng thái xác thực. Nếu chưa đăng nhập, tự động đóng Drawer và chuyển hướng sang `/login?redirect=/cart`.
   - **Đặt Hàng Hàng Loạt (`BulkOrderPage.tsx`)**: Chặn thao tác "Gửi Đơn Hàng Hàng Loạt" đối với khách vãng lai, chuyển hướng sang `/login?redirect=/bulk-order`. Hiển thị banner nhắc nhở đăng nhập tài khoản.
   - **In 3D Theo Yêu Cầu (`CustomOrderPage.tsx`)**: Chặn thao tác submit form upload file 3D khi chưa đăng nhập, chuyển hướng sang `/login?redirect=/custom`.
   - **Trình Thiết Kế Thước 3D (`RulerConfigurator.tsx`)**: Chặn nút "Xác Nhận & Đặt Hàng Ngay" nếu chưa đăng nhập, chuyển hướng sang `/login?redirect=/custom`.

2. **Loại bỏ hoàn toàn VietQR & tàn dư xưởng in**:
   - Backend `PrintHub_3D` chỉ hỗ trợ `COD` và `PAYOS` (`PaymentMethod` enum).
   - Trong `RulerConfigurator.tsx`: Xóa bỏ hoàn toàn khối tĩnh giả lập "VIETQR 3D" và text "xưởng in BK-Makerlab". Thay thế bằng 2 phương thức thực tế: **COD (Thanh toán khi nhận thước)** và **PayOS (Cổng thanh toán trực tuyến)**.
   - Thay thế toàn bộ các chuỗi text tàn dư như `VietQR / PayOS`, `Banking VietQR`, `Nạp tiền VietQR` thành `PayOS` / `COD` trên `PaymentResultPage.tsx`, `OrderHistoryPage.tsx`, `AdminGlobalOrdersPage.tsx`, `AdminFinancePage.tsx`.

3. **Luồng Quên Mật Khẩu với Email OTP (`LoginPage.tsx` & Backend)**:
   - Thêm nút "Quên mật khẩu?" trên form đăng nhập.
   - Mở Modal Quên Mật Khẩu 2 bước:
     - **Bước 1**: Nhập email -> Bấm "Gửi Mã OTP Về Email".
     - **Bước 2**: Nhập 6 số OTP + Mật khẩu mới + Xác nhận mật khẩu -> Bấm "Xác Nhận Đặt Lại Mật Khẩu".
   - Backend:
     - `POST /api/auth/forgot-password/send-otp`: Sinh mã OTP 6 số ngẫu nhiên qua `SecureRandom`, lưu vào `otps` (hiệu lực 5 phút), gửi mail qua `email/otp-email.html`.
     - `POST /api/auth/forgot-password`: Dùng `ForgotPasswordRequestDTO` (`email`, `otpCode`, `newPassword`, `confirmPassword`) để xác thực OTP và cập nhật mật khẩu đã mã hóa BCrypt.

4. **Luồng Đổi Mật Khẩu với Email OTP trong Trang Cá Nhân (`ProfilePage.tsx` & Backend)**:
   - Thêm thẻ "Đổi Mật Khẩu Tài Khoản (Xác Thực Email OTP)" trong `ProfilePage.tsx`.
   - Các trường nhập: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
   - Nút "Gửi Mã OTP" gửi mã 6 số về hòm thư của tài khoản đang đăng nhập kèm đồng hồ đếm ngược 60s chống spam.
   - Ô nhập OTP 6 số và nút "Xác Nhận Đổi Mật Khẩu".
   - Backend:
     - `POST /api/auth/reset-password/send-otp`: Gửi OTP 6 số đổi mật khẩu về email.
     - `POST /api/auth/reset-password`: Dùng `ResetPasswordRequestDTO` (`email`, `oldPassword`, `newPassword`, `confirmPassword`, `otpCode`) để kiểm tra mật khẩu cũ, kiểm tra OTP, và cập nhật mật khẩu mới.

---

## 2. Danh Sách Tệp Thay Đổi

### Backend (`D:\semester 7\EXE\PrintHub_3D`)
- [ForgotPasswordRequestDTO.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/dto/authen/ForgotPasswordRequestDTO.java): Bổ sung `otpCode`, `newPassword`, `confirmPassword`.
- [ResetPasswordRequestDTO.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/dto/authen/ResetPasswordRequestDTO.java): Bổ sung `otpCode`.
- [AuthAPI.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/controller/api/AuthAPI.java): Khai báo `sendForgotPasswordOtp`, `forgotPassword`, `sendResetPasswordOtp`, `resetPassword`.
- [AuthService.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/AuthService.java): Khai báo các phương thức nghiệp vụ tương ứng.
- [AuthController.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/controller/AuthController.java): Định nghĩa các controller endpoint trả về `ApiResponse`.
- [AuthServiceImpl.java](file:///D:/semester%207/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/AuthServiceImpl.java): Xử lý chi tiết việc sinh OTP, gửi mail qua `otp-email.html`, xác thực OTP và đổi mật khẩu an toàn.

### Frontend (`d:\semester 7\EXE\exe202-printhub3d-fe\exe-fe`)
- [authService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/authService.ts): Thêm `sendForgotPasswordOtp`, `forgotPassword`, `sendResetPasswordOtp`, `resetPassword`.
- [LoginPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/LoginPage.tsx): Hỗ trợ redirect sau đăng nhập và modal Quên mật khẩu OTP.
- [ProfilePage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/ProfilePage.tsx): Tích hợp khối đổi mật khẩu kèm xác thực OTP email.
- [CartPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CartPage.tsx): Thêm auth check, banner nhắc nhở, nút đổi trạng thái theo auth, chuyển phương thức thanh toán thành PayOS.
- [CartDrawer.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/components/CartDrawer.tsx): Thêm auth check chuyển hướng tới login nếu chưa đăng nhập.
- [BulkOrderPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/BulkOrderPage.tsx): Thêm auth check, banner nhắc đăng nhập, chuyển hướng redirect.
- [CustomOrderPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CustomOrderPage.tsx): Thêm auth check cho form upload, dọn sạch tàn dư "xưởng in".
- [RulerConfigurator.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/3d/RulerConfigurator.tsx): Thêm auth check, xóa bỏ VietQR và BK-Makerlab, thêm lựa chọn COD / PayOS.
- [PaymentResultPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/PaymentResultPage.tsx), [OrderHistoryPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/OrderHistoryPage.tsx), [AdminGlobalOrdersPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminGlobalOrdersPage.tsx), [AdminFinancePage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminFinancePage.tsx), [QuotationsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/QuotationsPage.tsx): Dọn sạch các chuỗi "VietQR", "BK-Makerlab".

---

## 3. Kết Quả Kiểm Tra (Verification Results)

1. **Backend Compilation**:
   ```
   [INFO] Compiling 193 source files with javac [debug parameters release 21] to target\classes
   [INFO] BUILD SUCCESS
   ```
2. **Frontend Compilation**:
   ```
   ✓ 2907 modules transformed.
   ✓ built in 830ms
   [INFO] dist/assets/index-s2-DA1gT.js (0 errors)
   ```
