# Walkthrough - Ignore Agents Folder in Git

## Tổng quan (Overview)
Đã thêm thư mục `.agents` vào tệp `.gitignore` ở cả thư mục gốc của dự án (`/`) và thư mục dự án con (`/exe-fe/`) để đảm bảo các tệp cấu hình agent không bị theo dõi bởi Git.

## Thay đổi chi tiết (Detailed Changes)
- **Root `.gitignore`**: Đã cập nhật mẫu `.agents/` và `.agents`.
- **Subfolder `exe-fe/.gitignore`**: Đã đảm bảo có `.agents` và `.agents/*`.

## Bài học kinh nghiệm (Key Takeaways)
- Việc thêm `.agents` và `.agents/` vào `.gitignore` giúp giữ cho mã nguồn chính sạch sẽ và tránh làm bẩn git status với các tệp agent local/customizations.
