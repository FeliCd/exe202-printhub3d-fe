# Setup README Walkthrough

## Tổng quan
Tạo và cập nhật tệp hướng dẫn thiết lập dự án `README.md` cùng tệp mẫu biến môi trường `.env.example` để hỗ trợ thành viên mới clone và setup môi trường phát triển một cách dễ dàng.

## Thay đổi chính
- **[README.md](file:///c:/Users/ADMIN/Desktop/EXE-FE/README.md)**: Thêm tài liệu hướng dẫn tổng quan dự án, danh sách công nghệ (React 19, TypeScript, Vite, TailwindCSS v4, Three.js), yêu cầu tiền đề (Node.js/npm), các bước clone, cài đặt npm dependencies, cấu hình `.env`, cách khởi chạy dev server và bảng giải thích các câu lệnh `npm scripts`.
- **[exe-fe/.env.example](file:///c:/Users/ADMIN/Desktop/EXE-FE/exe-fe/.env.example)**: Tạo tệp biến môi trường mẫu với các cấu hình cơ bản (`VITE_APP_NAME`, `VITE_API_BASE_URL`).
- **[exe-fe/README.md](file:///c:/Users/ADMIN/Desktop/EXE-FE/exe-fe/README.md)**: Cập nhật hướng dẫn nhanh trong sub-folder và liên kết về README chính.

## Bài học kinh nghiệm & Lợi ích
- Đảm bảo người mới tham gia dự án có thể thiết lập dự án ngay lập tức mà không cần hỏi lại cấu hình biến môi trường hoặc cấu trúc script chạy từ thư mục gốc.
