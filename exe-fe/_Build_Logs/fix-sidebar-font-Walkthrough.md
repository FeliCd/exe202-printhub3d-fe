# Fix Sidebar Font Encoding

## Tổng quan kiến trúc & Vấn đề
- **Vấn đề**: Các mục trên thanh menu bên trái (trong giao diện User) bị lỗi hiển thị phông chữ, chữ cái tiếng Việt bị chuyển thành các ký tự rác (Mojibake) như `T├ái khoß║ún Sinh Vi├¬n`, `MUA Sß║«M`, `≡ƒôÉ`.
- **Nguyên nhân**: File `src/layouts/UserSidebar.tsx` đã bị lưu sai định dạng mã hóa (encoding) từ UTF-8 sang một chuẩn khác, dẫn đến chuỗi Unicode tiếng Việt bị hỏng trong mã nguồn.
- **Kiến trúc thay đổi**: Không có thay đổi về kiến trúc, chỉ tập trung vào việc khôi phục lại dữ liệu chữ tiếng Việt chuẩn xác trong mã nguồn.

## Logic thay đổi
1. Xác định được nguyên nhân hiển thị lỗi không phải do thiếu phông chữ CSS hay class `uppercase` của Tailwind.
2. Kiểm tra trực tiếp mã nguồn `UserSidebar.tsx` và phát hiện các chuỗi đã bị hỏng.
3. Thực hiện map lại toàn bộ văn bản từ file chuẩn (`Sidebar.tsx`) và viết lại bằng tiếng Việt có dấu chuẩn Unicode (UTF-8). Thay thế các ký hiệu rác bằng các biểu tượng Emoji tương ứng (`🛒`, `📦`, `📐`, `👤`).

## Bài học kinh nghiệm
- Khi thấy chữ tiếng Việt bị biến thành các ký tự đặc biệt có tính hệ thống (như `ß║`, `├`), nguyên nhân hàng đầu luôn là lỗi encoding của file source code (thường là do lưu nhầm bằng ANSI/Windows-1252 thay vì UTF-8), chứ không phải do thiếu font CSS.
- Cần chú ý thiết lập Editor (VS Code) luôn mặc định save file ở chuẩn UTF-8 để tránh tình trạng tương tự.
