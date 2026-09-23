# Walkthrough: Loại Bỏ Mock Data, Đồng Bộ Địa Chỉ Backend & Cải Tiến Sidebar Accordion

## 1. Tổng Quan Kiến Trúc & Vấn Đề
- **Tình trạng ban đầu**:
  - Dữ liệu sản phẩm, đơn hàng, giỏ hàng, địa chỉ vẫn đang dựa trên các mảng tĩnh (mock data).
  - Giỏ hàng (`CartDrawer`) mở lên luôn có sẵn 2 sản phẩm mẫu dù chưa thêm gì.
  - Trang giỏ hàng và thanh toán hiển thị địa chỉ tĩnh cố định "Nguyễn Văn Anh • 0987.654.321".
  - Sidebar dạng phẳng, chưa nhóm thành các danh mục Accordion/Dropdown có thể thu gọn.
  - Vẫn còn hiển thị ví điện tử trên Header và thanh bên dù không dùng đến.
  - Nhãn hiển thị menu cá nhân có kèm chữ Passcode ("Trang Cá Nhân & Passcode").

---

## 2. Chi Tiết Các Thay Đổi (Logic & Files)

### 2.1. Giỏ Hàng & Khởi Tạo Trống
- File: `exe-fe/src/features/cart/hooks/useCart.ts`
- Xóa bỏ 2 sản phẩm mẫu mặc định (`ruler-pla-20cm`, `ruler-petg-30cm`).
- Khởi tạo giỏ hàng luôn là `[]` (đọc từ `localStorage: printhub_cart_items`), đảm bảo cả khách vãng lai và người dùng đăng nhập đều bắt đầu với giỏ hàng trống.

### 2.2. Loại Bỏ Mock Data & Thêm Empty States
- **`exe-fe/src/features/products/components/MainContent.tsx`**:
  - Khởi tạo `productList` là `[]`.
  - Loại bỏ hoàn toàn fallback vào `mockProducts`.
  - Hiển thị Loading Spinner khi đang tải và Empty State ("Chưa có sản phẩm nào") nếu Backend không có sản phẩm.
- **`exe-fe/src/pages/CatalogPreviewPage.tsx`**:
  - Khởi tạo `productList` là `[]`.
  - Loại bỏ fallback vào `mockProducts`, hiển thị Empty State nếu danh mục chưa có sản phẩm.
- **`exe-fe/src/pages/OrdersPage.tsx`**:
  - Khởi tạo `orders` là `[]`. Loại bỏ hoàn toàn mảng `mockOrders`.
  - Hiển thị Empty State ("Bạn chưa có đơn hàng nào") kèm link quay lại danh mục sản phẩm.
- **`exe-fe/src/pages/OrderHistoryPage.tsx`**:
  - Khởi tạo `ordersList` là `[]`. Loại bỏ mảng `mockPastOrders`.
  - Hiển thị Empty State ("Chưa có lịch sử đơn hàng").

### 2.3. Quản Lý Địa Chỉ Động & Đồng Bộ Dữ Liệu Backend
- **`exe-fe/src/features/address/components/AddressModal.tsx`**:
  - Loại bỏ danh sách địa chỉ giả `DEFAULT_ADDRESSES`.
  - Gọi API Backend `/api/addresses` thông qua `addressService.getAddresses()`.
  - Tự động chuyển đổi thuộc tính `street` (từ Backend entity `Address.java`) thành `addressLine`.
  - Form thêm địa chỉ mới tự động điền họ tên (`user.name`) và số điện thoại (`user.phone`) của tài khoản hiện tại.
  - Lưu địa chỉ đã chọn vào `localStorage ('printhub_selected_address')` và phát sự kiện `printhub_address_changed`.
- **`exe-fe/src/pages/CartPage.tsx`**:
  - Lắng nghe sự kiện `printhub_address_changed` để cập nhật địa chỉ theo thời gian thực.
  - Thay thế toàn bộ đoạn text tĩnh "Nguyễn Văn Anh" bằng thông tin `shippingAddress` thực tế.
  - Cập nhật cả 2 hàm xử lý thanh toán (`handleCheckout` cho PayOS và `handleCODCheckout` cho COD) để gửi đúng `recipientName`, `phone`, `address`, `province` của địa chỉ đã chọn lên Backend.

### 2.4. Sidebar Accordion Dropdown & Gỡ Bỏ Ví Điện Tử
- **`exe-fe/src/layouts/UserSidebar.tsx`**:
  - Nhóm các tính năng thành 3 khối Accordion có trạng thái đóng/mở độc lập:
    - 🛒 **MUA SẮM & DỊCH VỤ** (`openShopping`)
    - 📊 **QUẢN LÝ GIAO DỊCH** (`openTransactions`)
    - 👤 **CÁ NHÂN & HỖ TRỢ** (`openAccount`)
  - Bổ sung icon `ChevronDown` có animation xoay `rotate-180` khi mở.
  - Đổi tên nhãn "Trang Cá Nhân & Passcode" thành **"Trang Cá Nhân"**.
  - Gỡ bỏ liên kết "Ví điện tử PrintHub-3D".
- **`exe-fe/src/layouts/Header.tsx` & `exe-fe/src/layouts/Sidebar.tsx`**:
  - Gỡ bỏ ô số dư ví điện tử trên Header và các import liên quan đến Ví.

---

## 3. Bài Học Kinh Nghiệm (Lessons Learned)
1. **Quản Lý Trạng Thái Khi Backend Chưa Có Data**:
   - Không nên sử dụng mock data làm fallback âm thầm trong ứng dụng kết nối API thật. Thay vào đó, cần thiết kế các Empty States và Loading States trực quan để người dùng hiểu rõ hiện trạng của hệ thống.
2. **Chuẩn Hóa Model Dữ Liệu FE - BE**:
   - Thuộc tính địa chỉ giữa FE (`addressLine`) và BE (`street` trong entity `Address.java`) cần được chuẩn hóa qua layer mapping trong Service hoặc Component để tránh tình trạng hiển thị `undefined`.
