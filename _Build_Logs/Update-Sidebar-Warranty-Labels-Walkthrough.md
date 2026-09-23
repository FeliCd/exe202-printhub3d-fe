# Walkthrough: Cập Nhật Nhãn Sidebar và Nút Yêu Cầu Bảo Hành

## 1. Tổng Quan Yêu Cầu
- Điều chỉnh nhãn menu và nút bấm theo giao diện người dùng:
  1. Đổi nút bấm gửi yêu cầu bảo hành từ **"Gửi Yêu Cầu Bảo Hành 1-Đổi-1"** thành **"Gửi yêu cầu bảo hành"**.
  2. Cập nhật Sidebar: Đổi mục **"Trang Cá Nhân & Passcode"** thành **"Trang cá nhân"** (bỏ chữ Passcode).
  3. Cập nhật Sidebar: Đổi mục **"Bảo hành 1-đổi-1 (1 kỳ)"** thành **"Bảo hành"** (bỏ "1-đổi-1 (1 kỳ)").

---

## 2. Chi Tiết Thay Đổi Code

### 2.1. Nút Gửi Yêu Cầu Bảo Hành
- **File**: `exe-fe/src/pages/WarrantyPage.tsx`
- Sửa nhãn nút submit form từ `Gửi Yêu Cầu Bảo Hành 1-Đổi-1` thành `Gửi yêu cầu bảo hành`.

### 2.2. Nhãn Menu Sidebar
- **File**: `exe-fe/src/layouts/UserSidebar.tsx`
  - Đổi link `/profile`: `Trang Cá Nhân &amp; Passcode` ➔ `Trang cá nhân`.
  - Đổi link `/warranty`: `Bảo hành 1-đổi-1 (1 kỳ)` ➔ `Bảo hành`.
- **File**: `exe-fe/src/layouts/Sidebar.tsx`
  - Đổi link `/warranty`: `Bảo hành 1-đổi-1 (1 kỳ)` ➔ `Bảo hành` để đồng bộ.

---

## 3. Kiểm Tra & Xác Minh
- Đã chạy kiểm tra kiểu dữ liệu toàn bộ project: `npx tsc --noEmit` ➔ Kết quả: 0 lỗi (Exit Code 0).
