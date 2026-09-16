# Tích Hợp Toàn Diện Backend Spring Boot & PayOS - Walkthrough

## 1. Tổng quan Kiến trúc & Vấn đề đã giải quyết
Sau khi phân tích đối chiếu trực tiếp giữa mã nguồn Frontend (`exe-fe`), Backend Spring Boot (`D:\semester 7\EXE\PrintHub_3D`), và hình ảnh thực tế người dùng cung cấp:

1. **Lỗi nút "TIẾN HÀNH ĐẶT HÀNG & IN 3D" trong Giỏ Hàng bên hông (Cart Drawer) không hoạt động**:
   - *Nguyên nhân phát hiện từ ảnh đính kèm*: Người dùng đang mở thanh giỏ hàng trượt từ bên phải màn hình (`CartDrawer.tsx`). Nút bấm `TIẾN HÀNH ĐẶT HÀNG & IN 3D` ở dưới cùng trước đây là nút bấm giao diện tĩnh, **hoàn toàn chưa được gắn sự kiện `onClick`**!
   - *Giải pháp*:
     - Tích hợp trực tiếp luồng gọi Backend và sinh link thanh toán PayOS ngay tại `CartDrawer.tsx`.
     - Khi người dùng bấm nút: hệ thống gọi `orderService.createOrder` và `paymentService.createPaymentLink`, hiển thị spinner *"ĐANG KẾT NỐI CỔNG PAYOS..."*, sau đó tự động chuyển hướng trình duyệt thẳng tới cổng PayOS (`window.location.href = checkoutUrl`).
     - Bổ sung nút phụ *"Mở trang Giỏ hàng & Chọn phương thức khác →"* để người dùng có thể chuyển sang trang `/cart` khi muốn xem chi tiết.
2. **Lỗi Đăng ký `409 (Conflict)`**:
   - *Nguyên nhân*: Trong `AuthServiceImpl.java` (dòng 121–126), Backend Spring Boot kiểm tra trùng lặp:
     ```java
     if (userRepository.findByEmail(request.email()).isPresent()) {
         throw new ApiException(CommonErrorCode.CONFLICT, "Email đã tồn tại");
     }
     if (userRepository.findByPhone(request.phone()).isPresent()) {
         throw new ApiException(CommonErrorCode.CONFLICT, "Số điện thoại đã tồn tại");
     }
     ```
     Mã lỗi **409 Conflict** xuất hiện do Email hoặc Số điện thoại người dùng nhập vào đã được đăng ký thành công trong cơ sở dữ liệu trước đó!
   - *Giải pháp*: Bắt riêng mã lỗi `409 Conflict` trong `SignupPage.tsx` và hiển thị thông báo rõ ràng: *"Email hoặc Số điện thoại này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng thông tin khác!"*.
3. **Cảnh báo Three.js trong Console**:
   - Các dòng `THREE.Clock deprecated`, `PCFSoftShadowMap deprecated`, `unsupported GPOS table`, `Context Lost`: Đây là các log cảnh báo tương thích phiên bản của thư viện dựng hình 3D (`three.js`, `@react-three/fiber`, `troika-three-text`), hoàn toàn không ảnh hưởng tới luồng gọi mạng, thanh toán hay xác thực tài khoản.

---

## 2. Danh mục Tệp thay đổi & Logic chi tiết

- **[exe-fe/src/features/cart/components/CartDrawer.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/components/CartDrawer.tsx)**:
  - Gắn hàm `handleProceedCheckout` vào nút `TIẾN HÀNH ĐẶT HÀNG & IN 3D`.
  - Gọi Backend Spring Boot tạo đơn hàng và link PayOS, tự động chuyển hướng người dùng sang trang thanh toán PayOS.
  - Bổ sung trạng thái loading và nút điều hướng tới `/cart`.
- **[exe-fe/src/pages/SignupPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/SignupPage.tsx)**:
  - Xử lý mã lỗi `409 Conflict` từ backend, thông báo người dùng đổi email/SĐT hoặc chuyển sang trang Đăng nhập.

---

## 3. Kiểm thử & Đảm bảo Chất lượng
- `npm --prefix exe-fe run lint`: **0 errors, 0 warnings**.
- `npm --prefix exe-fe run build`: **Biên dịch thành công 100% trong 715ms**.
