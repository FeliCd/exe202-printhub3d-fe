# Change Global Font to Montserrat

## Tổng quan kiến trúc & Vấn đề
- **Yêu cầu**: Thay đổi và thống nhất toàn bộ font chữ của hệ thống sang **Montserrat** thay cho Inter (hiện tại).
- **Phạm vi thay đổi**: 
  - Cập nhật Google Fonts URL trong `index.html`.
  - Cập nhật biến CSS toàn cục `--font-sans` và `font-family` trong `:root` và `body` tại `index.css`.
- **Kiến trúc thay đổi**: Không thay đổi kiến trúc hệ thống, chỉ điều chỉnh cấu hình typography trong Tailwind CSS v4 và file entry HTML.

## Logic thay đổi
1. Gỡ bỏ font **Inter** khỏi `<link>` trong `index.html` và thêm font **Montserrat** với đầy đủ các weight (100 đến 900) để đảm bảo hỗ trợ tốt mọi style typography của dự án.
2. Tại `src/index.css`, đổi toàn bộ chuỗi `'Inter'` thành `'Montserrat'` để Tailwind CSS tự động render các class `font-sans` theo font mới, cũng như thay đổi font kế thừa mặc định của trình duyệt ở `body` và `:root`.

## Bài học kinh nghiệm
- Với Tailwind CSS v4, việc thay đổi font hệ thống có thể thực hiện rất dễ dàng bằng cách ghi đè biến `--font-sans` trong khối `@theme`, giúp toàn bộ hệ thống tự động cập nhật đồng bộ mà không cần phải compile lại hoặc thay đổi file config JS phức tạp.
- Cần chắc chắn cập nhật đầy đủ cấu hình trong `index.html` để tránh tình trạng fallback font do trình duyệt không tải được font từ CDN.
