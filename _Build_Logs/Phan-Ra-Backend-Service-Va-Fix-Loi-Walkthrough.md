# Phân Rã Backend Service, Chuẩn Hóa Domain Services & Khắc Phục Lỗi Frontend — Walkthrough

> **Ngày thực hiện**: 27/09/2026  
> **Phạm vi**: Frontend `exe-fe` (`PrintHub 3D`)  
> **Trọng tâm**: Sửa triệt để các lỗi biên dịch TypeScript, phân rã tệp gom chung `backend.ts` về đúng các file service có sẵn theo nhóm chức năng (không tạo file mới), và đồng bộ router sang các component API thật.

---

## 1. Tổng quan kiến trúc (Architecture Overview)

Trước khi thực hiện, dự án gặp phải các vấn đề phân mảnh kiến trúc và lỗi biên dịch:
1. **Lỗi chặn Build TypeScript**: Lỗi khai báo props thiếu ở `CartDrawer`, gọi hàm không tồn tại `lockAccount` ở `AdminDashboardPage`, và thuộc tính `disabled` bị lặp ở `ProfilePage`.
2. **File gom tạm "God File" `backend.ts`**: Tệp này chứa lẫn lộn các hàm HTTP lõi (`read`, `send`, `unwrap`, `errorText`), DTOs của nhiều domain (`ProductDTO`, `OrderDTO`, `CustomDTO`, `FileDTO`), hàm view adapter (`productView`), logic upload/download file và hàm điều hướng thanh toán PayOS (`payOrder`). Điều này vi phạm nguyên lý Single Responsibility và Separation of Concerns.
3. **Lệch Routing (Route Disconnect)**: Một số trang quản trị và người dùng (`/admin/products`, `/subscriptions`, `/admin/subscriptions`, `/disputes`, `/admin/disputes`, `/warranty`) vẫn trỏ về các trang mock data tĩnh thay vì sử dụng các feature components đã được chuẩn hóa API backend trong thư mục `src/features/`.

### Mô hình phân tầng dịch vụ chuẩn sau tái cấu trúc (Không sinh file mới):

* **[src/services/api.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/api.ts)**:
  * Đóng vai trò là HTTP Client trung tâm.
  * Cấu hình Axios instance, Base URL (`http://localhost:8080/api`), token injection interceptor và 401 auto-logout.
  * Xuất các hàm HTTP primitives: `read<T>`, `send<T>`, `unwrap<T>`, `errorText(error)`, `get`, `post`, `put`, `remove`.
* **[src/services/productService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/productService.ts)**:
  * Quản lý toàn bộ `ProductDTO`, `PageDTO<T>`, hàm view adapter `productView()`.
  * Điều phối các API `/api/marketplace/product`.
* **[src/services/orderService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/orderService.ts)**:
  * Quản lý `OrderDTO`, `OrderItemDTO`, `ShippingInfoDTO`.
  * Điều phối các API `/api/orders`, `/api/orders/me`, cập nhật trạng thái đơn và cộng điểm thưởng `/complete-rewards`.
* **[src/services/quotationService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/quotationService.ts)**:
  * Quản lý `CustomDTO`, `CustomOrderCreateRequest`.
  * Điều phối quy trình đặt in tùy chỉnh / báo giá: `/api/custom-orders`, `/api/admin/custom-orders`, gửi báo giá và duyệt báo giá.
* **[src/services/fileVaultService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/fileVaultService.ts)**:
  * Quản lý `FileDTO`, `uploadFile(file, name)`, `downloadFile(path, name)`.
  * Điều phối API kho tệp 3D cá nhân `/api/vault/files` và upload `/api/vault/upload`.
* **[src/services/paymentService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/paymentService.ts)**:
  * Quản lý `CreatePaymentLinkRequest`, `payOrder(orderId, orderType)`.
  * Điều phối tạo link thanh toán PayOS `/api/payments/create-link` và xác minh đơn `/api/payments/verify/{orderCode}`.
* **[src/services/adminService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/adminService.ts)**:
  * Quản lý người dùng (`getUsers`, `updateUserRole`, `toggleUserLock`).
  * Quản lý dashboard (`getAdminDashboard`, `getUserDashboard`).
  * Quản lý máy in 3D xưởng (`getPrinters`, `createPrinter`, `updatePrinter`).
  * Quản lý tài chính & quỹ (`getRevenueAnalytics`, `getCommissionFund`).
  * Quản lý cấu hình (`getStoreSettings`, `updateStoreSettings`).
* **[src/services/index.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/index.ts)**:
  * Re-export tập trung toàn bộ các dịch vụ và kiểu dữ liệu trên.
* **Xóa bỏ hoàn toàn file gom [backend.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/backend.ts)**.

---

## 2. Chi tiết các thay đổi logic (Changed Logic)

### 2.1. Khắc phục 3 lỗi biên dịch TypeScript
1. **[CartDrawer.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/components/CartDrawer.tsx)**: Bổ sung prop `couponCode` vào danh sách destructuring trong khai báo component `CartDrawer`.
2. **[AdminDashboardPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminDashboardPage.tsx)**: Xóa bỏ việc import và gọi hàm không tồn tại `lockAccount` từ `useAuth()`.
3. **[ProfilePage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/ProfilePage.tsx)**: Gộp thuộc tính `disabled` bị lặp thành `disabled={saving || isChangingPassword}`.

### 2.2. Phân rã `backend.ts` và Cập nhật Import
Đã di chuyển toàn bộ code sang các file dịch vụ có sẵn và cập nhật đường dẫn import tại 16 file:
* `src/App.tsx`: Chuyển sang import `read` từ `./services/api`.
* `src/hooks/useRemote.ts`: Chuyển sang import `read, errorText` từ `../services/api`.
* `src/context/AuthContext.tsx`: Chuyển sang import `read, send, unwrap` từ `../services/api`.
* `src/pages/ProfilePage.tsx`: Chuyển sang import `errorText` từ `../services/api`.
* `src/pages/FileVaultPage.tsx`: Import `send` từ `api`, `uploadFile, downloadFile, FileDTO` từ `fileVaultService`.
* `src/pages/CartPage.tsx`: Import `send` từ `api`, `payOrder` từ `paymentService`, `OrderDTO` từ `orderService`.
* `src/features/address/components/AddressModal.tsx`: Import `send` từ `api`.
* `src/features/cart/hooks/useCart.ts`: Import `read, send, errorText` từ `api`, `productView, ProductDTO` từ `productService`.
* `src/features/products/components/MainContent.tsx`: Import `productView, ProductDTO, PageDTO` từ `productService`.
* `src/features/admin/Products.tsx`: Import `send` từ `api`, `ProductDTO, PageDTO` từ `productService`.
* `src/features/orders/OrderList.tsx`: Import `send` từ `api`, `payOrder` từ `paymentService`, `OrderDTO` từ `orderService`.
* `src/features/custom/CustomRequests.tsx`: Import `send` từ `api`, `uploadFile, downloadFile` từ `fileVaultService`, `payOrder` từ `paymentService`, `CustomDTO` từ `quotationService`.
* `src/features/support/DisputePanel.tsx`: Import `send` từ `api`, `OrderDTO` từ `orderService`.
* `src/features/support/WarrantyPanel.tsx`: Import `send` từ `api`, `OrderDTO` từ `orderService`.
* `src/features/subscriptions/SubscriptionPanel.tsx`: Import `send` từ `api`.
* `src/components/3d/RulerConfigurator.tsx`: Import `send, errorText` từ `api`, `uploadFile` từ `fileVaultService`.

### 2.3. Khắc phục lệch Router kết nối API thật
* **[AdminProductsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminProductsPage.tsx)**: Chuyển sang kết nối trực tiếp `features/admin/Products.tsx` (quản lý sản phẩm thật gọi `/api/marketplace/product`).
* **[SubscriptionsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/SubscriptionsPage.tsx)** & **[AdminSubscriptionsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminSubscriptionsPage.tsx)**: Chuyển sang kết nối trực tiếp `features/subscriptions/SubscriptionPanel.tsx` (gọi `/api/subscriptions/*`).
* **[DisputesPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/DisputesPage.tsx)** & **[AdminDisputesPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminDisputesPage.tsx)**: Chuyển sang kết nối trực tiếp `features/support/DisputePanel.tsx` (gọi `/api/disputes/*` kèm chat trao đổi).
* **[WarrantyPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/WarrantyPage.tsx)**: Chuyển sang kết nối trực tiếp `features/support/WarrantyPanel.tsx` (gọi `/api/warranty/*`).

---

## 3. Kết quả nghiệm thu (Verification Results)

* **Build Status**: Chạy `npm run build` thành công 100%, 0 lỗi TypeScript, mã nguồn phân tách sạch sẽ thành các module bundle độc lập.
* **Kiểm tra tệp tin**: Tệp `backend.ts` đã được xóa sạch, không còn bất kỳ tham chiếu nào tồn đọng.
* **Cấu trúc thư mục `src/services/`**: Gồm đúng 13 file theo cấu trúc ban đầu, không tạo thêm bất kỳ file mới nào.

---

## 4. Bài học kinh nghiệm (Core Lessons Learned)

1. **Tránh tạo "God File" chứa đa trách nhiệm**:
   - Khi phát triển nhanh hoặc refactor ban đầu, việc tạo một file trung gian như `backend.ts` có thể tiện lợi tức thì, nhưng rất dễ trở thành "nợ kỹ thuật" khiến các module khác bị gắn kết lỏng lẻo nhưng phụ thuộc chặt vào một tệp chung.
   - Luôn phân bổ DTO và API vào các file theo đúng Domain Model ngay từ đầu (`product`, `order`, `vault`, `payment`).
2. **Khai thác tối đa các file service có sẵn**:
   - Thay vì vội vã tạo các file mới như `httpClient.ts` hay `customOrderService.ts`, việc tận dụng `api.ts`, `quotationService.ts` và `adminService.ts` giúp giữ cho cây thư mục dự án gọn gàng, đúng quy ước của nhóm phát triển.
3. **Đảm bảo đồng bộ giữa Component hoàn thiện và Router**:
   - Khi một feature component mới được viết xong để thay thế trang mock cũ, cần cập nhật ngay router hoặc trang bọc để tránh tình trạng component xịn đã có nhưng người dùng vẫn thấy giao diện mock cũ.
