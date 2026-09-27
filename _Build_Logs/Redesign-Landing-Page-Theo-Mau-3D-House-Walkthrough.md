# Redesign Landing Page Theo Mẫu 3D House - Walkthrough

## 1. Tổng Quan Kiến Trúc & Yêu Cầu

### Mục Tiêu
- Tái cấu trúc và thiết kế lại giao diện **Landing Page** của PrintHub 3D theo 3 ảnh mẫu tham khảo (phong cách Dark Cyber-Industrial / 3D Printing House):
  1. **Header & Hero Section (Mẫu 1)**: Header dạng pill capsule nổi, logo thương hiệu tinh gọn, CTA "Get a Quote", Hero chữ lớn "Bring Your 3D Visions to Life", hình ảnh máy in 3D FDM công nghiệp buồng kín đang in bàn tay robot xanh lá, kèm thanh thông số 4 trụ cột nổi bật có vạch màu accent thẳng đứng.
  2. **Discover Our Services (Mẫu 2)**: Badge tab trắng bo góc, background mờ máy in Delta 3D, câu tuyên ngôn chủ đạo với nút CTA "Find Out More", danh mục 4 dịch vụ cốt lõi của PrintHub 3D.
  3. **Why Choose Printhub3D (Mẫu 3)**: Badge tab bo góc, bố cục 2 cột chia sẻ 4 giá trị kỹ thuật (Innovative Design Techniques, High Quality Output, Personalized Consultations, Expert Guidance) cùng hình ảnh render cận cảnh vòi phun in robot đồ chơi màu xanh lá.
  4. **Cam Kết Bảo Hành & Chất Lượng**: Duy trì chính sách bảo hành 1-đổi-1 suốt 1 học kỳ.
  5. **Giữ Nguyên Footer**: Toàn bộ nội dung và layout Footer hiện tại được bảo toàn 100%.
  6. **Giữ Bản Sắc Thương Hiệu & Tính Năng**: Màu xanh neon signature `#39FF14` kết hợp xanh ngọc `emerald` và xanh dương `blue-600`, cùng toàn bộ liên kết điều hướng (`/catalog`, `/custom`, `/bulk-order`, `/ruler-3d`, `/warranty`, `/login`, `/dashboard`).

---

## 2. Logic Thay Đổi Chi Tiết

### A. Tách biệt & Nâng cấp Header riêng cho Landing Page (`LandingNavbar.tsx`)
- **Tập tin**: `src/layouts/LandingNavbar.tsx`
- **Thay đổi**:
  - Logo bên trái: Khối lập phương 3D màu xanh neon kèm typography `PRINTHUB 3D` và phụ đề `3D Printing House`.
  - Thanh menu dạng con nhộng (Pill navigation) ở giữa màn hình: Nền kính mờ `bg-[#12141a]/90 backdrop-blur-md border border-white/10 rounded-full`, hỗ trợ cuộn mượt (smooth scroll) đến các phân đoạn `#services`, `#why-choose` và chuyển trang đến `Materials`, `In Theo Yêu Cầu`, `Resources`, `Warranty`, `FAQ`.
  - Phía bên phải: Nút CTA `Get a Quote` bo tròn dạng pill màu xanh dương phát sáng, dẫn trực tiếp vào trang báo giá file 3D (`/custom`). Tích hợp logic phân quyền kiểm tra `isAuthenticated` (chuyển sang nút "Vào Bảng Điều Khiển" nếu đã đăng nhập).
  - Hỗ trợ menu trượt di động (Mobile drawer) khi mở trên điện thoại / tablet.

### B. Thiết kế lại Hero Section (`LandingPage.tsx`)
- **Tập tin**: `src/pages/LandingPage.tsx`
- **Bố cục**:
  - Tiêu đề chính: `Bring Your 3D Visions to Life` với phụ đề `Custom 3D Styles Just for You` kết hợp bản dịch và giới thiệu dịch vụ in 3D / thước kỹ thuật cho sinh viên.
  - Cặp nút bấm dạng pill: `Start Your Project` (nền xanh dương có mũi tên) và `Explore Our Styles` (nền tối viền mờ).
  - Khung ảnh máy in 3D công nghiệp buồng kín: Tích hợp hình ảnh render sắc nét `/images/hero_3d_printer.jpg` với hiệu ứng kính mờ và badge trạng thái in thời gian thực.
  - Thanh tính năng chân trang Hero (Hero Bottom Dock Bar): 4 cột chỉ số có vạch accent màu xanh dương/cyan tương tự mẫu gốc:
    1. `Tailored Designs`: Chuẩn xác 0.1mm, vạch dập chìm chống phai.
    2. `Unlimited Customization`: Tùy chọn PLA+/PETG, khắc laser tên/MSSV.
    3. `Available Worldwide`: Giao tận nơi cho sinh viên 20+ trường đại học.
    4. `Expert 3D Designers`: Kiểm duyệt mesh file CAD/STL và tư vấn in.
  - 4 thông số định lượng: 15,000+ đơn hàng, 0.12mm độ mịn FDM, 48+ máy in, 100% bảo hành.

### C. Phân đoạn "Discover Our Services"
- Badge tab bo tròn: `DISCOVER OUR SERVICES`.
- Hero card với nền ảnh máy in Delta `/images/delta_printer_dark.jpg` tương phản cao, phủ lớp gradient tối.
- Trích dẫn tuyên ngôn thương hiệu và nút `Find Out More`.
- Lưới 4 thẻ dịch vụ trực quan:
  1. *Thước Kỹ Thuật PLA+/PETG* -> `/catalog`
  2. *Báo Giá File 3D Tùy Chỉnh* -> `/custom`
  3. *Đặt In Đơn Hàng Lớn* -> `/bulk-order`
  4. *Công Cụ Thước Đo 3D* -> `/ruler-3d`

### D. Phân đoạn "Why Choose Printhub3D?"
- Badge tab bo tròn: `WHY CHOOSE PRINTHUB3D?`.
- Bố cục 2 cột:
  - Cột trái: 4 khối biểu tượng hình học tối giản tương ứng 4 giá trị cốt lõi:
    - `Innovative Design Techniques` (icon vi mạch Cpu)
    - `High Quality Output` (icon khối hộp Box)
    - `Personalized Consultations` (icon lấp lánh Sparkles)
    - `Expert Guidance` (icon huy hiệu Award)
  - Cột phải: Hình ảnh render cận cảnh vòi phun in đầu robot đồ chơi màu xanh lá `/images/printer_robot_toy.jpg` kèm badge layer 0.12mm.

### E. Cam Kết Bảo Hành & Giữ Nguyên Footer
- Banner cam kết chất lượng & bảo hành gãy 1-đổi-1 suốt 1 học kỳ với nút gửi yêu cầu bảo hành sang `/warranty`.
- Footer nguyên bản được giữ nguyên không thay đổi logic hay giao diện.

---

## 3. Danh Sách Tệp Tác Động
1. `src/layouts/LandingNavbar.tsx`: Nâng cấp navbar dạng pill capsule riêng biệt cho landing page.
2. `src/pages/LandingPage.tsx`: Viết lại giao diện Landing Page theo bố cục 3 ảnh mẫu tham khảo.
3. `public/images/hero_3d_printer.jpg`: Ảnh minh họa máy in 3D buồng kín in bàn tay robot xanh.
4. `public/images/delta_printer_dark.jpg`: Ảnh nền xưởng in với máy in Delta công nghiệp.
5. `public/images/printer_robot_toy.jpg`: Ảnh cận cảnh đầu phun in robot đồ chơi xanh lá.

---

## 4. Bài Học Kinh Nghiệm & Kiểm Thử
- **TypeScript Strict Unused Check**: Trong dự án Vite + TS, các biến hoặc icon import không sử dụng sẽ gây lỗi biên dịch build (`TS6133`). Cần kiểm tra kỹ danh sách import sạch sẽ trước khi chạy `npm run build`.
- **Đồng bộ hóa hình ảnh chất lượng cao**: Việc chuẩn bị các asset hình ảnh độ nét cao và bố cục đúng tỉ lệ (16:9 cho Hero/Banner và 3:4 cho cận cảnh Robot) giúp giao diện đạt mức độ hoàn thiện cao, sát với bản thiết kế tham khảo.
- **Xác thực tự động qua Browser Subagent**: Đã chạy kiểm tra trực quan trên trình duyệt `http://localhost:5173/`, chụp ảnh xác nhận toàn bộ các khối giao diện từ Header, Hero, Services, Why Choose Us, Guarantee đến Footer hoạt động trơn tru.
