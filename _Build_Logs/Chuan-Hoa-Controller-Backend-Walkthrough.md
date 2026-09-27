# Chuẩn Hóa Controller Backend PrintHub 3D — Walkthrough

> Ngày thực hiện: 27/09/2026  
> Phạm vi: Backend `PrintHub_3D` và Frontend `exe202-printhub3d-fe`  
> Trọng tâm: Xóa bỏ "God Controller" (`WorkflowController`), chuẩn hóa `CartController`, `VaultController` và tái cấu trúc hệ thống Controller theo mô hình Multi-tier Clean Architecture của dự án.

---

## 1. Tổng quan kiến trúc (Architecture Overview)

Trước khi refactor, hệ thống Backend gặp tình trạng phân mảnh kiến trúc nghiêm trọng:
- `CartController` và `VaultController` viết theo phong cách minified / one-line, trực tiếp nhúng `@PersistenceContext EntityManager`, viết raw JPQL trong Controller, ném `ResponseStatusException` và dùng Java records inline thay vì DTO chuẩn.
- `WorkflowController` hoạt động như một "God Controller" ôm đồm 7 nhóm trách nhiệm khác nhau (Order, Custom Order, Dispute, Admin User, Printer, Store Setting, Dashboard), vi phạm nguyên lý Single Responsibility (SRP).
- Toàn bộ kết quả trả về của các Controller này sử dụng kiểu `Object` hoặc `Map<String, Object>` thô, làm mất hoàn toàn tính an toàn kiểu (type-safety) và khả năng sinh OpenAPI/Swagger schema.

### Mô hình phân tầng chuẩn sau khi tái cấu trúc:
1. **Interface Layer (`controller/api/*API.java`)**:
   - Khai báo route (`@RequestMapping`), HTTP method, validation (`@Valid`), và tài liệu OpenAPI (`@Tag`, `@Operation`, `@SecurityRequirement`).
2. **Controller Layer (`controller/*Controller.java`)**:
   - Implement Interface tương ứng (`implements *API`).
   - Kiểm tra phân quyền method security (`@PreAuthorize`).
   - Đóng gói dữ liệu trả về 100% bằng `ResponseEntity<ApiResponse<T>>`.
3. **DTO Layer (`dto/<feature>/...`)**:
   - Tách rời RequestDTO và ResponseDTO với schema Swagger và Bean Validation annotations rõ ràng.
4. **Service Layer (`service/*Service.java` & `service/impl/*ServiceImpl.java`)**:
   - Quản trị nghiệp vụ, giao dịch (`@Transactional`), điều phối các repository và ném exception tập trung.
5. **Repository Layer (`repository/*Repository.java`)**:
   - Kế thừa `JpaRepository<Entity, ID>` chuẩn của Spring Data JPA.
6. **Exception Handling**:
   - Sử dụng `ApiException(ErrorCode)` đồng bộ với `GlobalExceptionHandler`.

---

## 2. Chi tiết các thay đổi logic (Changed Logic)

### 2.1. Module Giỏ hàng (Cart)
- **Interface**: Tạo mới `CartAPI.java` định nghĩa `GET /api/cart` và `PUT /api/cart`.
- **DTOs**: `CartItemRequestDTO`, `CartUpdateRequestDTO`, `CartItemResponseDTO`.
- **Repository**: Tạo `CartRepository` và `CartItemRepository` với hàm xóa theo `cartId`.
- **Service**: Tạo `CartService` và `CartServiceImpl` đảm bảo kiểm tra sản phẩm `ACTIVE`, chống trùng lặp ID sản phẩm trong giỏ và cập nhật thời gian sửa đổi.
- **Controller**: Viết lại `CartController` theo chuẩn `ApiResponse<List<CartItemResponseDTO>>`.

### 2.2. Module Kho File (Vault)
- **Interface**: Tạo mới `VaultAPI.java` định nghĩa upload, download, list và delete file.
- **DTOs**: `FileAssetResponseDTO`.
- **Repository**: Tạo `FileAssetRepository` (`findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc`).
- **Service**: Tạo `VaultService` và `VaultServiceImpl` quản lý lưu trữ tệp tại thư mục nội bộ `private-files`, kiểm tra quyền sở hữu và kiểm tra ràng buộc với `CustomOrder` trước khi xóa.
- **Controller**: Viết lại `VaultController` theo chuẩn `ApiResponse`.

### 2.3. Giải thể & Phân rã `WorkflowController`
Đã xóa bỏ hoàn toàn `WorkflowController.java`, `WorkflowService.java` và `NotificationWriter.java`, phân phối các trách nhiệm về đúng domain:
1. **Order & Admin Orders**:
   - Bổ sung `GET /api/orders/me`, `GET /api/orders/{id}`, `PUT /api/orders/{id}/status` vào `OrderAPI` / `OrderController`.
   - Tạo mới `AdminOrderAPI` và `AdminOrderController` quản lý `GET /api/admin/orders`.
2. **Custom Orders**:
   - Tạo mới `CustomOrderAPI` và `CustomOrderController` xử lý toàn bộ luồng: tạo đơn custom từ file vault, admin/maker gửi báo giá (`quote`), duyệt báo giá (`ACCEPTED`) và chuyển trạng thái in.
3. **Disputes (Khiếu nại & Chat)**:
   - Tạo `DisputeResponseRepository`.
   - Bổ sung các endpoint chat và lấy danh sách khiếu nại (`/api/disputes`, `/api/admin/disputes`, `/api/disputes/{id}/messages`) vào `DisputeAPI` và `DisputeController`.
4. **Admin Users**:
   - Tạo mới `AdminUserAPI` và `AdminUserController` (`/api/admin/users`) cho quản trị viên khóa tài khoản và phân quyền.
5. **3D Printers**:
   - Tạo mới `PrinterRepository`, `PrinterService`, `PrinterAPI` và `PrinterController` (`/api/admin/printers`) phục vụ giám sát và quản lý máy in xưởng.
6. **Store Settings**:
   - Tạo mới `StoreSettingRepository`, `StoreSettingService`, `StoreSettingAPI` và `StoreSettingController` (`/api/admin/settings`).
7. **Warranty (Bảo hành)**:
   - Tách khỏi `WorkflowService`, tạo `WarrantyService`, `WarrantyServiceImpl`, `WarrantyAPI` và cập nhật `WarrantyController`.
8. **Notifications (Thông báo)**:
   - Thay thế `NotificationWriter` bằng `NotificationService` và `NotificationController` chuẩn `ApiResponse`.
9. **Dashboard**:
   - Tạo `DashboardAPI` và `DashboardController` tổng hợp các chỉ số số lượng đơn hàng, doanh thu và đơn in custom.

---

## 3. Bài học kinh nghiệm cốt lõi (Core Lessons)

1. **Tránh bẫy "God Controller" và "Shortcut Controller"**:
   - Khi frontend phát sinh nhiều nhu cầu API cùng lúc, việc gom tất cả vào một controller tạm thời (như `WorkflowController`) có thể giải quyết nhanh giao diện nhưng sẽ để lại nợ kỹ thuật lớn (Technical Debt), phá vỡ kiến trúc DDD và làm tê liệt khả năng mở rộng/kiểm thử.
2. **Đồng nhất chuẩn DTO và kiểu dữ liệu trả về**:
   - Trả về `Object` hoặc `Map<String, Object>` khiến Swagger UI không thể tạo schema tài liệu cho team Frontend và dễ gây lỗi `NullPointerException` hoặc `ClassCastException` trong thời gian chạy. Việc ép buộc sử dụng `ResponseEntity<ApiResponse<T>>` bảo đảm tính nhất quán trên toàn hệ thống.
3. **Bảo mật tầng Controller vs Business logic**:
   - Controller chỉ nên giữ vai trò trỏ cổng (Gateway), xác thực quyền (`@PreAuthorize`) và unwrap thông tin người dùng (`SecurityUtils.getCurrentUser()`). Toàn bộ điều kiện ràng buộc dữ liệu (data constraint), kiểm tra sở hữu (ownership verification) và biến đổi trạng thái nghiệp vụ phải nằm trong `@Transactional Service`.
