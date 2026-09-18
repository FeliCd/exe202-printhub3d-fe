# Fix Encoding Issues Across All Pages

## Tổng quan kiến trúc & Vấn đề
- **Vấn đề**: Sau khi sửa lỗi font ở Sidebar, phát hiện thêm lỗi tương tự ở hàng loạt các trang khác (CartPage, CatalogPreviewPage, LoginPage, SignupPage, OrdersPage...). Tất cả các văn bản tiếng Việt đều bị biến dạng (mojibake) do lỗi lưu định dạng file.
- **Nguyên nhân cốt lõi**: Quá trình lưu file source code vô tình chuyển đổi định dạng UTF-8 sang một chuẩn khác (như CP437 hoặc Windows-1252), làm sai lệch byte của các ký tự Unicode tiếng Việt có dấu.
- **Phạm vi thay đổi**: 11 file `.tsx` trong thư mục `src/` bao gồm các file components và pages.

## Logic thay đổi
1. **Phân tích byte**: Đã phân tích mẫu ký tự rác (ví dụ: `ß║Ñ` -> `ấ`) và xác định thuật toán khôi phục.
2. **Khôi phục tự động**: Xây dựng kịch bản Node.js để tự động duyệt qua tất cả các file trong `src/`, chuyển đổi (encode) lại chuỗi mojibake UTF-8 bằng bảng mã `CP437` để lấy lại byte nguyên thuỷ, sau đó giải mã (decode) lại đúng theo chuẩn `UTF-8`.
3. **Thực thi & Kiểm tra**: Kịch bản chạy thành công trên 11 file. Kiểm tra ngẫu nhiên ở `MainContent.tsx` cho thấy toàn bộ nội dung tiếng Việt (ví dụ: "Thước In 3D Kỹ Thuật", "Khắc tên / MSSV miễn phí") đã được phục hồi chính xác 100%.

## Bài học kinh nghiệm
- Việc khôi phục văn bản lỗi Encoding đòi hỏi phân tích cẩn thận việc mã hoá sai từ bộ mã nào sang bộ mã nào, tránh dùng Regex Replace tay (rất dễ bỏ sót và dễ gây lỗi).
- Script tự động là công cụ mạnh mẽ và an toàn khi cần sửa lỗi hàng loạt file source code với pattern cố định.
