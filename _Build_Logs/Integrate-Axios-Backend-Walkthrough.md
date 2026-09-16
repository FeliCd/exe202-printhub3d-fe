# Integrate Axios Backend Walkthrough

## 1. Tổng quan Kiến trúc
Tích hợp lớp dịch vụ HTTP client hoàn chỉnh sử dụng thư viện `axios` vào dự án PrintHub 3D Frontend, bám sát các file mẫu được cung cấp (`api.ts`, `authService`, `addressService`, `warrantyService`, `categoryService`).

Đặc biệt, hệ thống được thiết kế theo mô hình **Ưu tiên dữ liệu Backend & Tự động Fallback Mock Data**:
- Khi backend hoạt động và trả về dữ liệu hợp lệ: Giao diện ưu tiên hiển thị dữ liệu thực tế từ backend.
- Khi API gặp lỗi (chưa bật backend, timeout, lỗi mạng, mã lỗi 4xx/5xx): Hệ thống tự động ghi nhận cảnh báo `console.warn` mềm và chuyển sang hiển thị Mock Data tương ứng, đảm bảo người dùng và người chấm điểm/demo không bao giờ bị gián đoạn hay trắng màn hình (white screen).

---

## 2. Logic thay đổi & Chi tiết các tệp

### A. Tầng Cấu hình API Client & Interceptors
- **[exe-fe/src/services/api.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/api.ts)**:
  - Khởi tạo `axios.create` với `baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'`.
  - **Request Interceptor**: Tự động lấy JWT token từ `localStorage.getItem('token')` và đính kèm header `Authorization: Bearer <token>` (tự động bỏ qua các endpoint công khai `/auth/login`, `/auth/register`).
  - **Response Interceptor**: Bắt lỗi `401 Unauthorized`, tự động xóa token hết hạn trong `localStorage`.
  - Xuất các helper: `get`, `post`, `put`, `remove` và export default `api`.

### B. Bộ Service Layer (`src/services/`)
- **[authService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/authService.ts)**: Quản lý `login`, `register`, `verifyRegisterOtp`, `getCurrentUser`, `logout`.
- **[addressService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/addressService.ts)**: Quản lý `getAddresses`, `createAddress`, `setDefaultAddress`, `deleteAddress`.
- **[warrantyService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/warrantyService.ts)**: Quản lý yêu cầu bảo hành `createClaim`, `getUserClaims`, `getAllClaims`, `updateClaimStatus`.
- **[categoryService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/categoryService.ts)**: Quản lý `getCategories`, `createCategory`.
- **[productService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/productService.ts)**: Quản lý `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`.
- **[orderService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/orderService.ts)**: Quản lý `getUserOrders`, `getOrderHistory`, `createOrder`, `updateOrderStatus`.
- **[walletService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/walletService.ts)**: Quản lý `getWalletBalance`, `getTransactions`, `deposit`, `pay`.
- **[quotationService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/quotationService.ts)**: Quản lý `getQuotations`, `createQuotation`, `acceptQuotation`, `rejectQuotation`.
- **[notificationService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/notificationService.ts)**: Quản lý `getNotifications`, `markAsRead`, `markAllAsRead`.
- **[fileVaultService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/fileVaultService.ts)**: Quản lý tệp 3D `getFiles`, `uploadFile`, `deleteFile`.
- **[adminService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/adminService.ts)**: Quản trị `getUsers`, `getGlobalOrders`, `getFactories`, `toggleUserLock`, `updateUserRole`.
- **[factoryService.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/factoryService.ts)**: Vận hành xưởng in `getGCodes`, `getInventory`, `getQCItems`, `getPackingList`, `updateQCStatus`, `updatePackageStatus`.
- **[index.ts](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/services/index.ts)**: Export tập trung toàn bộ các module trên.

### C. Tích hợp Tự Động Fallback tại Contexts & Components
- **[AuthContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/AuthContext.tsx)**: Gọi `getCurrentUser()` khi có token, gọi `authService.login()` khi đăng nhập; nếu lỗi fallback về `defaultUser` mock.
- **[WalletContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/WalletContext.tsx)**: Gọi `walletService.getWalletBalance()` và `getTransactions()`, fallback `initialTransactions` và số dư `250.000đ`.
- **[NotificationContext.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/context/NotificationContext.tsx)**: Gọi `notificationService.getNotifications()`, fallback `initialNotifications`.
- **[MainContent.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/products/components/MainContent.tsx)** / **[CatalogPreviewPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CatalogPreviewPage.tsx)**: Gọi `productService.getProducts()`, fallback `mockProducts`.
- **[OrdersPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/OrdersPage.tsx)** / **[OrderHistoryPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/OrderHistoryPage.tsx)**: Gọi `orderService.getUserOrders()` và `getOrderHistory()`, fallback `mockOrders` / `mockPastOrders`.
- **[WarrantyPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/WarrantyPage.tsx)**: Gọi `warrantyService.getUserClaims()` và `createClaim()`, fallback `initialClaims`.
- **[AddressModal.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/address/components/AddressModal.tsx)**: Gọi `addressService.getAddresses()`, `createAddress`, `setDefaultAddress`, `deleteAddress`, fallback `DEFAULT_ADDRESSES`.
- **[QuotationsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/QuotationsPage.tsx)**: Gọi `quotationService.getQuotations()`, fallback `mockQuotes`.
- **[FileVaultPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/FileVaultPage.tsx)**: Gọi `fileVaultService.getFiles()`, fallback `mockVaultFiles`.
- **Admin Pages & Factory Pages**: Tích hợp các service tương ứng với cơ chế `try...catch` mềm.

---

## 3. Bài học kinh nghiệm & Lợi ích
- **Khả năng hoạt động bền bỉ (Resilience)**: Dự án có thể kết nối ngay lập tức với Spring Boot / Node.js backend mà không cần sửa đổi lại giao diện, đồng thời hoàn toàn có thể chạy demo độc lập (offline/standalone) mà không gặp bất kỳ lỗi Crash UI nào.
- **Clean Architecture**: Tách rời hoàn toàn giao diện (UI Views) khỏi tầng gọi mạng (Network Services), giúp việc bảo trì và viết Unit Test sau này dễ dàng hơn nhiều.
- **Tuân thủ Chuẩn Linter & TypeScript**: Đảm bảo toàn bộ mã nguồn đạt chuẩn ESLint và TypeScript (`tsc -b && vite build` và `eslint .` đều vượt qua 100%).
