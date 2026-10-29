# Walkthrough: Đồng Bộ Toàn Bộ Giao Diện Theo Mẫu Thẻ Đơn Hàng (Design System Revamp)

## 1. Tổng Quan Triển Khai
- **Mục tiêu:** Nâng cấp toàn diện các trang trên nền tảng PrintHub 3D theo mẫu thiết kế chuẩn **Thẻ đơn hàng (Order Card)** đã được duyệt.
- **Nguyên tắc thẩm mỹ:**
  - Nền than đen đồng nhất (`#0A0A0A`, `--color-surface` `#18191d`, `--color-surface-inset` `#111215`).
  - Điểm nhấn xanh neon `#39FF14` chính xác, có kiểm soát, triệt tiêu các hiệu ứng neon glow gây chói mắt.
  - Bố cục thoáng đãng, micro-interactions tinh tế khi hover.
  - Sử dụng Tailwind CSS hiện có và CSS chi tiết; **không bổ sung Bootstrap**.
  - **Bảo toàn tuyệt đối 4 trang loại trừ:** `LoginPage`, `SignupPage`, `LandingPage`, và `AdminDashboardPage`.

---

## 2. Chi Tiết Triển Khai Theo Nhóm

### Nhóm 1: Bộ Component Nền Tảng Chung (`DataUI.tsx`)
- [PageHeader](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/DataUI.tsx#L50-L105): Hỗ trợ tiêu đề chính, mô tả phụ, icon biểu trưng, badge phân loại và khu vực action buttons.
- [Card & CardInset](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/DataUI.tsx#L110-L140): Nền than đen viền mảnh, bo góc tròn vừa phải (`rounded-2xl`).
- [Status Badge](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/DataUI.tsx#L330-L370): Chuẩn hóa màu sắc trạng thái theo nhóm ngữ nghĩa:
  - Đỏ: CANCELLED, REJECTED, DISPUTED, FAILED
  - Vàng cam: PENDING, REQUESTED, UNDER_REVIEW, UNPAID
  - Xanh neon `#39FF14`: PAID, APPROVED, ACCEPTED, RESOLVED, COMPLETED, SUCCESS
- [CopyButton](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/DataUI.tsx#L371-L411): Nút sao chép mã đơn hàng/mã yêu cầu với phản hồi visual tức thì.
- [Pagination & TabGroup](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/DataUI.tsx#L300-L330): Đồng nhất điều hướng phân trang và thanh chuyển tab ngang.

---

### Nhóm 2: Đơn Hàng & Hỗ Trợ (`OrderList`, `WarrantyPanel`, `DisputePanel`)
- [OrderList.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/orders/OrderList.tsx):
  - Áp dụng `PageHeader` thay thế tiêu đề cũ.
  - Tích hợp thanh bộ lọc tab trạng thái đơn (`Tất cả`, `Đang in`, `Đang giao`, `Hoàn thành`).
  - Tích hợp nút sao chép mã đơn (`CopyButton`), stepper 5 bước chuẩn hóa và thẻ đơn hàng cấu trúc rõ ràng.
- [WarrantyPanel.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/support/WarrantyPanel.tsx):
  - Đồng bộ thẻ yêu cầu bảo hành 1-đổi-1 theo phong cách thẻ đơn hàng.
  - Chuẩn hóa form gửi yêu cầu kèm upload ảnh minh chứng.
- [DisputePanel.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/support/DisputePanel.tsx):
  - Thẻ khiếu nại với badge trạng thái đồng nhất, xem lịch sử tin nhắn và phương án giải quyết (đổi thước / hoàn tiền).

---

### Nhóm 3: Khám Phá & Mua Hàng (`MainContent`, `BulkOrderPage`, `CatalogPreviewPage`)
- [MainContent.tsx (Catalog)](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/products/components/MainContent.tsx):
  - Tích hợp `PageHeader` với số lượng sản phẩm.
  - Thanh tìm kiếm và bộ lọc danh mục dạng pill button.
  - Phân trang chuẩn hóa bằng `Pagination`.
- [BulkOrderPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/BulkOrderPage.tsx):
  - Hiển thị các bậc chiết khấu (15%, 25%, 35%) trên thẻ tối giản viền mảnh.
- [CatalogPreviewPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CatalogPreviewPage.tsx):
  - Thẻ xem nhanh thông số sản phẩm và modal đồng bộ giao diện.

---

### Nhóm 4: Thiết Kế & Checkout (`CartPage`, `CustomOrderPage`, `Ruler3DPage`)
- [CartPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/CartPage.tsx):
  - Thay thế Panel thô bằng `PageHeader`.
  - **Bố cục 2 cột đáp ứng:**
    - Cột trái (7 cols): Danh sách sản phẩm Marketplace & thiết kế custom.
    - Cột phải (5 cols sticky): Khối cấu hình giao hàng (Giao chung / Giao riêng), địa chỉ nhận, phương thức thanh toán VietQR PayOS / COD, và bảng tính tổng tiền.
    - Tự động xếp dọc (1 cột) trên thiết bị di động.
- [Ruler3DPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/Ruler3DPage.tsx):
  - Áp dụng `PageHeader` và chuẩn hóa thẻ simulator 3D với hệ trục tọa độ X, Y, Z và thước kẹp Vernier.

---

### Nhóm 5: Tài Khoản, Hỗ Trợ & Thanh Toán (`DashboardPage`, `ProfilePage`, `AddressBookPage`, `SubscriptionPanel`, `HelpCenterPage`, `PaymentResultPage`)
- [ProfilePage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/ProfilePage.tsx):
  - Tích hợp `PageHeader`, `Notice`, chia form thành các nhóm rõ ràng (Hồ sơ sinh viên, MSSV, trường ĐHQG, địa chỉ mặc định).
- [AddressBookPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/AddressBookPage.tsx):
  - Áp dụng `PageHeader`, danh sách thẻ địa chỉ và modal thêm mới với các trường select tỉnh/huyện/xã đồng nhất.
- [SubscriptionPanel.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/subscriptions/SubscriptionPanel.tsx):
  - Chuyển sang `PageHeader`, thẻ gói VIP, đổi điểm thưởng PrintHub Xu và tặng gói cho Admin.
- [HelpCenterPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/HelpCenterPage.tsx):
  - `PageHeader`, thẻ hotline/Zalo xưởng in và accordion câu hỏi thường gặp về dung sai 3D.
- [PaymentResultPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/PaymentResultPage.tsx):
  - Thẻ biên lai thanh toán thành công / hủy giao dịch đồng bộ màu sắc.

---

### Nhóm 6: Quản Trị Admin (`AdminUsersPage`, `AdminProductsPage`, `AdminCategoriesPage`, `AdminCustomOrdersPage`, `AdminFinancePage`, `AdminSettingsPage`)
- [AdminUsersPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminUsersPage.tsx):
  - **Dùng bảng đa cột trên desktop** để tiện so sánh (Người dùng, Email & MSSV, Vai trò, Trạng thái, Thao tác).
  - **Tự động chuyển sang thẻ trên mobile** để không bị tràn màn hình.
- [AdminProductsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminProductsPage.tsx):
  - Áp dụng `PageHeader`, loại bỏ hiệu ứng neon glow quá mức.
- [AdminCategoriesPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCategoriesPage.tsx):
  - `PageHeader` và bảng danh mục sản phẩm gọn gàng.
- [AdminCustomOrdersPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx):
  - `PageHeader`, bộ lọc trạng thái và modal gửi báo giá custom.
- [AdminFinancePage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminFinancePage.tsx):
  - `PageHeader`, thẻ thống kê GMV, chiết khấu 5% sàn, nhật ký giao dịch PayOS.
- [AdminSettingsPage.tsx](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminSettingsPage.tsx):
  - `PageHeader`, `Notice`, nhóm 3 thẻ cài đặt thương hiệu, cước phí và bảo hành.

---

## 3. Kiểm Tra Tính Toàn Vẹn & Tiêu Chí Hoàn Thành
1. **Trang loại trừ:** `LoginPage.tsx`, `SignupPage.tsx`, `LandingPage.tsx`, `AdminDashboardPage.tsx` hoàn toàn không bị chỉnh sửa (giữ nguyên 100%).
2. **Trang không còn route:** Không khôi phục `HomePage.tsx`, `FileVaultPage.tsx`, `AdminProductionPage.tsx`.
3. **Thư viện bên thứ ba:** Không thêm bất kỳ package Bootstrap nào.
4. **Kiểm tra biên dịch:** `npm run build` (`tsc -b && vite build`) hoàn thành thành công với mã thoát 0 (0 lỗi).
