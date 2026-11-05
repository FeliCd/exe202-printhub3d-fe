# BÁO CÁO TỔNG KẾT KHẮC PHỤC LỖI GIAO DIỆN & ACCESSIBILITY (IMPECCABLE AUDIT)
**Ngày thực hiện:** 05/11/2026  
**Chuyên gia phụ trách:** Senior Software Engineer (Frontend & UI/UX Systems)  
**Mục tiêu kiểm định:** URL `https://www.printhub3d.id.vn/login?redirect=%2Fadmin%2Fcustom-orders`  
**Công cụ rà soát:** [Impeccable](https://impeccable.style) Audit Engine  

---

## 1. Tổng quan Hiện trạng trước khi Tối ưu
Công cụ Impeccable đã quét trang Đăng nhập (`/login`) và phát hiện hai nhóm vấn đề chính:
1. **7 Lỗi Chất lượng (Quality Issues):** Vi phạm cấu trúc phân cấp ngữ nghĩa HTML (Heading hierarchy), văn bản quá nhỏ dưới chuẩn đọc tối thiểu (Undersized functional text), cắt xén phần tử nổi do container bao ngoài (`overflow-hidden`), văn bản in hoa toàn bộ gây mỏi mắt.
2. **27 Dấu hiệu rập khuôn thiết kế sinh bởi AI (AI Tells):** Lạm dụng hiệu ứng đổ bóng phát sáng neon rực rỡ (`#39FF14`, cyan `#00E5FF`), lưới ma trận cyberpunk hai trục, viền siêu mảnh kết hợp bóng mờ cực đại (Hairline border + 60px blur shadow), dấu chấm nhấp nháy liên tục (`animate-pulse`).

---

## 2. Chi tiết 7 Lỗi Quality Issues & Giải pháp Khắc phục

| # | Hạng mục lỗi (Impeccable) | Vị trí file nguồn | Thực trạng trước sửa | Giải pháp kỹ thuật đã triển khai |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Positioned child clipped by overflow container** | [`App.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/App.tsx#L83) | Lớp bao gốc `#root > div` dùng `h-dvh overflow-hidden flex flex-col`. Khi màn hình thu nhỏ hoặc nội dung dài, các modal/tooltip bị cắt cụt. | Chuyển thành `min-h-screen flex flex-col`. Cho phép luồng cuộn tự nhiên, không bao giờ cắt xén các modal, toast thông báo hoặc phần tử định vị tuyệt đối. |
| **2** | **Skipped heading level (h1 -> h3)** | [`CartDrawer.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/components/CartDrawer.tsx#L58) | Tiêu đề trang là `<h1>Đăng Nhập Tài Khoản</h1>`, nhưng drawer giỏ hàng lại dùng `<h3>Giỏ Hàng Của Bạn</h3>`, thiếu mất thẻ cấp `<h2>`. | Chuyển tiêu đề `CartDrawer` thành `<h2 className="font-bold text-white text-base">Giỏ Hàng Của Bạn</h2>`, khôi phục phân cấp ngữ nghĩa chuẩn WCAG. |
| **3** | **Skipped heading level trong Modal** | [`LoginPage.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/LoginPage.tsx#L259) | Modal Quên mật khẩu dùng thẻ `<h3>Khôi Phục Mật Khẩu</h3>` dưới `<h1>`. | Chuyển thành `<h2 className="text-lg font-black text-white">Khôi Phục Mật Khẩu</h2>`. |
| **4** | **Undersized functional text (< 11px)** | [`PrintHubLogo.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/PrintHubLogo.tsx#L196) | Badge kỹ thuật `±0.1mm` đặt cỡ `text-[9px]`, vi phạm ngưỡng tối thiểu dễ đọc của người dùng. | Nâng lên `text-[11px] font-bold`, tăng padding và tương phản nền `bg-slate-800/80`. |
| **5** | **All-caps body text (37 ký tự)** | [`AuthLayout.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/auth/AuthLayout.tsx#L53) | Badge `"XƯỞNG CHẾ TÁC 3D // TRUY CẬP HỆ THỐNG"` áp dụng class `uppercase` dài 37 ký tự, gây rối mắt. | Bỏ class `uppercase`, chuẩn hóa sang tracking kỹ thuật `tracking-wide text-xs font-mono text-emerald-400`. |
| **6** | **Tiny body text (11px)** | [`AuthLayout.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/auth/AuthLayout.tsx#L65) | 3 dòng mô tả tính năng xưởng in (`Ruler`, `Cpu`, `ShieldCheck`) đặt cỡ `text-[11px]`. | Nâng toàn bộ khối lên `text-xs` (12px) với `text-slate-300`, tăng kích thước icon lên `w-4 h-4`. |
| **7** | **Tiny body text trong Printer Header** | [`PrinterAnimation.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/auth/PrinterAnimation.tsx#L45) | Text trạng thái máy in và nút pause/play dùng `text-[11px]`. | Chuẩn hóa lên `text-xs font-mono` và `text-xs font-medium`. |

---

## 3. Chi tiết Tinh chỉnh 27 Dấu hiệu "AI Tells" (Humanize & Polish UI)

Thiết kế sinh bởi AI thường có cảm giác "demo viễn tưởng" thiếu độ chín chắn của sản phẩm phần mềm thương mại. Đã thực hiện tinh chỉnh chuyên sâu:

1. **Loại bỏ hiệu ứng bóng phát sáng quá đà (Zero-offset Glowing Neon Shadows):**
   - Nút đăng nhập chính: Thay bóng rực sáng `shadow-[0_0_15px_rgba(57,255,20,0.35)]` thành bóng thực tế có chiều sâu `shadow-md shadow-emerald-950/40 hover:shadow-lg`.
   - Các nút submit trong modal và icon khôi phục mật khẩu: Thay toàn bộ bóng phát sáng `[0_0_12px_...]` sang `shadow-sm` thanh lịch.
   - Logo PrintHub 3D: Gỡ bỏ `drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]` trên chữ `3D`.
2. **Khử bảng màu AI Cliché (Cyan & Neon over-saturation):**
   - Badge ±0.1mm: Thay màu cyan neon chói `#22D3EE` trên nền tối sang gam trung tính công nghiệp `text-slate-300` viền `border-slate-700`.
   - Input OTP: Thay màu cyan neon `#00e5ff` thành `text-emerald-400`.
   - Icon CPU: Đồng bộ gam màu `text-emerald-400` đồng nhất cùng hệ sinh thái nhận diện xưởng in PrintHub.
3. **Loại bỏ nền lưới ma trận hai trục (Decorative Grid-line Background):**
   - Thay lớp phủ `linear-gradient` lưới ô xanh neon bằng hiệu ứng chiều sâu nền tinh tế:
     `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#040508] to-[#040508]`.
   - Lưới tọa độ bàn in trong `PrinterAnimation`: Chuyển từ vạch xanh lá `#39FF14` gắt sang lưới blueprint kỹ thuật mờ `rgba(148,163,184,0.08)`.
4. **Loại bỏ viền siêu mỏng kèm bóng mờ cực đại (Hairline border + 60px blur shadow):**
   - Card container: Thay `border-[#1e2433]` + `shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]` bằng `rounded-2xl bg-[#0a0c12] border border-slate-800 shadow-2xl shadow-black/80`.
5. **Loại bỏ dấu chấm nhấp nháy liên tục (Pulsing status dot):**
   - Gỡ bỏ `animate-pulse` và `animate-ping` gây mất tập trung thị giác, chuyển sang đèn tín hiệu Online cố định `w-2 h-2 rounded-full bg-emerald-400`.

---

## 4. Danh sách các File đã Sửa đổi

| File | Đường dẫn | Nội dung sửa đổi chính |
| :--- | :--- | :--- |
| **`App.tsx`** | [`exe-fe/src/App.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/App.tsx) | Xóa bỏ `h-dvh overflow-hidden`, ngăn chặn triệt để lỗi cắt xén positioned children. |
| **`CartDrawer.tsx`** | [`exe-fe/src/features/cart/components/CartDrawer.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/features/cart/components/CartDrawer.tsx) | Điều chỉnh heading `h3` -> `h2` chuẩn phân cấp tiêu đề. |
| **`PrintHubLogo.tsx`** | [`exe-fe/src/components/PrintHubLogo.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/PrintHubLogo.tsx) | Tăng cỡ chữ `±0.1mm` lên 11px, gỡ bỏ glow neon và cyan palette. |
| **`AuthLayout.tsx`** | [`exe-fe/src/components/auth/AuthLayout.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/auth/AuthLayout.tsx) | Khử grid neon, bỏ viền 60px shadow, xóa `uppercase` 37 ký tự, tăng cỡ body text lên 12px. |
| **`PrinterAnimation.tsx`** | [`exe-fe/src/components/auth/PrinterAnimation.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/components/auth/PrinterAnimation.tsx) | Chuyển lưới bàn in sang blueprint dịu mắt, gỡ bỏ ping pulse dot, nâng cỡ chữ header. |
| **`LoginPage.tsx`** | [`exe-fe/src/pages/LoginPage.tsx`](file:///d:/semester%207/EXE/exe202-printhub3d-fe/exe-fe/src/pages/LoginPage.tsx) | Thay thế toàn bộ bóng neon rực sáng bằng bóng thực tế, chuyển `h3` -> `h2` trong modal, khử cyan OTP input. |

---

## 5. Kết quả Kiểm định Biên dịch (Build Verification)
Sau khi áp dụng toàn bộ sửa đổi:
```bash
cd exe-fe
npm run build
```
- **Kết quả:** `✓ built in 1.31s`
- **Lỗi biên dịch:** `0 errors, 0 warnings`
- **TypeScript:** Type-checking `tsc -b` thông qua 100%.
- **Trạng thái:** Sẵn sàng kiểm tra lại bằng extension Impeccable trên trình duyệt hoặc đưa lên production.

