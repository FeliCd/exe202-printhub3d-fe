# Bỏ catalog prototype và lập flow sửa UX

Ngày: 02/11/2026.

## Tổng quan kiến trúc

Catalog chính vẫn dùng `CatalogPage` tại `/catalog`. Trang prototype `CatalogPreviewPage.tsx` đã được xóa theo yêu cầu chủ website, cùng lazy import và liên kết prototype trong sidebar cũ. URL `/catalog-preview` giữ một route redirect về `/catalog`; query và hash được giữ lại, sử dụng replace để không tạo vòng lặp Back.

Không thay đổi backend hoặc dữ liệu production trong lần chỉnh sửa này. Các lỗi checkout, file, địa chỉ, giá, trạng thái và hội viên mới được đặc tả để triển khai sau.

## Logic thay đổi

- Xóa `exe-fe/src/pages/CatalogPreviewPage.tsx`.
- Sửa `exe-fe/src/routes/index.tsx`: thay render prototype bằng Navigate tới catalog chính, giữ search/hash.
- Sửa `exe-fe/src/layouts/Sidebar.tsx`: bỏ mục Guest preview và import Eye không còn dùng.
- Cập nhật bản đồ route trong `PROJECT_CONTEXT.md`.
- Điều chỉnh báo cáo audit: F24 rút khỏi backlog do đây là prototype mock data có chủ đích. Còn 26 phát hiện: 6 P1, 16 P2, 4 P3; giữ ID các mục để đối chiếu bằng chứng.
- Tạo [bộ flow sửa theo 4 nhóm](../md/FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md), bao phủ F01–F23 và F25–F27. Theo yêu cầu tiếp theo, mỗi nhóm đã tách thành một file Markdown riêng; file chung giữ mục lục/quy tắc/phụ thuộc. Giữ nguyên 29 mục sửa/nghiệm thu của bản gộp. Tài liệu phân biệt API/field đề xuất với chức năng đang có; có kiểm thử, dữ liệu QA và điều kiện hoàn tất cho từng nhóm.

## Kiểm chứng

- `npm run build`: pass; Vite có cảnh báo chunk lớn, không chặn build.
- `npx eslint src/routes/index.tsx src/layouts/Sidebar.tsx` trong `exe-fe`: pass.
- Browser smoke test bản build local: `/catalog-preview?q=parabol#products` chuyển thành `/catalog?q=parabol#products`, render heading catalog, không có link menu `/catalog-preview`, không có pageerror trong lần thử.
- Không còn import `CatalogPreviewPage` hoặc liên kết menu tới route prototype trong source.
- Kiểm tra liên kết file trong bộ flow: không có link local bị thiếu; đủ 4 nhóm và tất cả 26 ID còn hiệu lực; báo cáo audit dẫn trực tiếp tới từng file nhóm. Các kiểm tra build/lint/browser bên trên thuộc thay đổi bỏ prototype; lần tách tài liệu không sửa thêm mã nguồn ứng dụng.
- Chưa deploy, chưa chạy lại các luồng thanh toán production; các lỗi nghiệp vụ được viết flow không được đánh dấu đã sửa.

## Bài học chính

1. Khi chủ website xác nhận một trang là prototype có chủ đích, cần sửa phạm vi audit, không chuyển mock data của trang đó thành backlog production.
2. Xóa một page phải xử lý cả import, route, menu và URL cũ; redirect giữ query giúp link đã chia sẻ tiếp tục dùng được.
3. Giữ nguyên ID lỗi đã bàn giao, rút riêng mục không còn hiệu lực để tránh nhầm các bằng chứng và thứ tự sửa.
4. Flow triển khai cần nêu riêng sự thật đã kiểm thử, giả thuyết cần log và hợp đồng mới đề xuất; không coi việc viết tài liệu là đã sửa xong tính năng.

## Đồng bộ log

Log đã lưu trong `_Build_Logs` của repository theo `.agents/AGENTS.md`. Đường dẫn Obsidian được file hướng dẫn ghi là `C:/Users/ADMIN/Desktop/second/Second-Brain/_Build_Logs/print-hub`; đã kiểm tra và đường dẫn không tồn tại trên máy hiện tại. Chưa đồng bộ sang đích đó; không tự tạo một thư mục hồ sơ người dùng ADMIN thay cho vault thật.
