# Chuẩn Hóa Hệ Thống Auth, Tracking Role Tự Động & Loại Bỏ Vai Trò Maker (PrintHub 3D)

## 1. Tổng quan Kiến trúc & Mục tiêu
Dự án PrintHub 3D chuyển đổi từ mô hình sàn 3 bên (Khách hàng sinh viên - Nền tảng trung gian - Xưởng in đối tác bên ngoài) sang mô hình hệ thống sản xuất trực tiếp khép kín do PrintHub 3D tự vận hành và quản lý. 
Để đồng bộ mô hình mới và nâng cao trải nghiệm người dùng:
1. **Form Đăng Ký**: Cho phép tạo tài khoản nhanh chóng, field Địa chỉ trở thành tùy chọn (Optional), người dùng cấu hình địa chỉ tại Trang Cá Nhân hoặc khi thanh toán đơn hàng.
2. **Form Đăng Nhập**: Loại bỏ hoàn toàn khối demo vai trò thủ công, tự động đọc `user_role` từ JWT/API Backend để điều hướng chính xác.
3. **Vai Trò Maker**: Loại bỏ hoàn toàn vai trò `FACTORY`/Maker khỏi cả Frontend và Backend.

---

## 2. Chi tiết Thay đổi & Logic Implementation

### 2.1. Backend (`PrintHub_3D`)
- **`RegisterRequestDTO.java`**:
  - Gỡ bỏ annotation `@NotBlank` trên trường `address` để chuyển địa chỉ thành **Optional**.
  - Điều chỉnh `@Size(min = 2, max = 50)` cho trường `fullName` (trước đó là `min = 9` gây lỗi 400 với người dùng có tên ngắn).
- **`UserRepository.java`**:
  - Bổ sung `Optional<User> findByUsername(String username);` và `boolean existsByUsername(String username);`.
- **`AuthServiceImpl.java`**:
  - Fix bug: Trong `updateProfile()`, đổi `user.setUsername(profile.fullName())` thành `user.setFullName(profile.fullName())`.
  - Fix bug: Trong `getProfile()`, đổi `fullName(user.getUsername())` thành `fullName(user.getFullName())`.
  - Bổ sung kiểm tra trùng lặp `username` khi đăng ký tài khoản mới.
- **Dọn dẹp Maker artifacts**:
  - Xóa `MakerRegistrationRequest.java`, `MakerApplicationResponse.java`, `MakerStatusUpdateRequest.java`.
  - Xóa `MakerStatus.java`.
  - Dọn dẹp các import thừa trong `AuthController.java` và `AuthService.java`.

### 2.2. Frontend (`exe-fe`)
- **`src/types/index.ts`**:
  - Thu hẹp `UserRole = 'BUYER' | 'ADMIN';` (loại bỏ `'FACTORY'`).
  - Bổ sung `address?: string;` vào interface `User`.
- **`src/services/authService.ts`**:
  - Bổ sung method `updateProfile` gọi API `PUT /api/auth/profile`.
- **`src/context/AuthContext.tsx`**:
  - Cập nhật hàm `login` nhận `(userNameOrEmail: string, password?: string)` và tự động nhận diện `role` từ Backend API response.
  - Gỡ bỏ logic fallback và tham chiếu tới role `FACTORY`.
  - Bổ sung trường `address` vào user state và đồng bộ khi gọi `updateProfile`.
- **`src/pages/LoginPage.tsx`**:
  - Gỡ bỏ khối UI "CHỌN VAI TRÒ ĐĂNG NHẬP DEMO" và 3 nút chọn role thủ công.
  - Tự động điều hướng sau khi `login` trả về role: `ADMIN` vào `/admin/dashboard`, `BUYER` vào `/dashboard`.
- **`src/pages/SignupPage.tsx`**:
  - Bổ sung đầy đủ các field: Họ tên, Tên đăng nhập, Email, Số điện thoại, Địa chỉ (Optional), Mật khẩu, Xác nhận mật khẩu, MSSV, Trường ĐH.
  - Bind state đầy đủ cho mật khẩu.
  - Tích hợp luồng gọi API đăng ký và màn hình nhập mã OTP 6 số để kích hoạt tài khoản.
- **`src/pages/ProfilePage.tsx`**:
  - Bổ sung ô nhập `Địa chỉ nhận hàng mặc định (KTX / Nhà riêng)`.
  - Tự động lưu và cập nhật địa chỉ vào profile người dùng.
- **Gỡ bỏ Module Factory/Maker**:
  - Xóa toàn bộ thư mục `src/pages/factory/` (8 trang).
  - Xóa `FactoryLayout.tsx`, `FactorySidebar.tsx`, `factoryService.ts`, `AdminFactoriesPage.tsx`.
  - Cập nhật `src/routes/index.tsx`: xóa route `/factory/*`, xóa route quản lý xưởng admin, chuẩn hóa `allowedRoles` thành `['BUYER', 'ADMIN']`.
  - Dọn dẹp `ProtectedRoute.tsx`, `Sidebar.tsx`, `UserSidebar.tsx`, `AdminUsersPage.tsx`, `AdminSidebar.tsx`.

---

## 3. Bài học Kinh nghiệm (Core Learnings)
1. **Kiểm tra kỹ Bean Validation giữa FE và BE**:
   - Khi FE gửi request không thành công, hãy luôn kiểm tra các ràng buộc validation ở BE (`@Size`, `@NotBlank`, regex). Ràng buộc `min = 9` cho `fullName` hoặc `@NotBlank` cho `address` là nguyên nhân hàng đầu gây lỗi 400 Bad Request âm thầm nếu FE không có thông báo chi tiết.
2. **Tránh lưu sai thuộc tính Entity trong DTO Mapping**:
   - Trong quá trình phát triển nhanh, việc nhầm lẫn `user.setUsername(profile.fullName())` làm biến mất username gốc của user và gây lỗi nghiêm trọng khi user cố đăng nhập lại. Cần luôn rà soát kỹ các hàm mapper/setter.
3. **Cơ chế Tracking Role tự động**:
   - Không nên để Frontend tự quyết định vai trò thông qua việc chọn nút demo khi đã có API Authentication. Việc trả role từ JWT/LoginResponse và lưu vào context giúp bảo mật phân quyền và ngăn chặn việc truy cập trái phép.

---

## 4. Trạng thái Build & Kiểm thử
- **Backend Build**: `mvn test-compile` $\rightarrow$ **BUILD SUCCESS (193 source files, 0 errors)**.
- **Frontend Build**: `npm run build` $\rightarrow$ **BUILD SUCCESS (2906 modules transformed, 0 errors)**.
