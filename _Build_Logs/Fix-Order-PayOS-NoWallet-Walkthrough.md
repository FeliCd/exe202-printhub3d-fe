# Sửa lỗi Đặt hàng (Order 201), Kết nối PayOS và Loại bỏ Wallet API - Walkthrough

- **Ngày thực hiện**: 2026-09-16
- **Mục tiêu**: Khắc phục lỗi Order 400 Bad Request, PayOS 404 Not Found, sửa lỗi kẹt mock data và loại bỏ hoàn toàn Wallet API.

## 1. Tổng quan Kiến trúc & Nguyên nhân gốc rễ
1. **Lỗi 404 Wallet**: Backend Spring Boot không cung cấp endpoint `/api/wallet/*` (chỉ có `FinanceController` cho Admin). Frontend gửi request định kỳ gây lỗi 404.
2. **Lỗi kẹt Mock Data**: Backend trả về phân trang dạng Spring Page (`res.result.content`). Code FE trước đó chỉ kiểm tra `Array.isArray(res.result)`, khiến kết quả luôn trả về false và luôn hiển thị danh sách mock tĩnh có id là chuỗi text (`ruler-pla-20cm`).
3. **Lỗi 400 Đặt hàng**: Backend yêu cầu `OrderItemRequestDTO` phải có `productId` dạng `UUID` và phải tồn tại trong bảng `products` của database. Khi FE gửi `ruler-pla-20cm`, Jackson serialization văng lỗi 400.
4. **Lỗi 404 PayOS**: Do bước tạo đơn bị lỗi 400, FE dùng mã giả `550e8400...` gửi sang `/api/payments/create-link`. Backend tìm trong database không có đơn hàng này nên ném lỗi `ORDER_NOT_FOUND` (HTTP 404).

## 2. Logic Thay đổi Chi tiết
- **Wallet**:
  - `WalletContext.tsx`: Xóa bỏ `useEffect` gọi backend, chuyển toàn bộ sang local state.
  - `walletService.ts`: Chuyển sang mock in-memory, ngắt hoàn toàn các cuộc gọi HTTP.
  - `CartPage.tsx`: Loại bỏ phương thức thanh toán WALLET và modal Passcode.
- **Sản phẩm từ Backend**:
  - `MainContent.tsx` & `CatalogPreviewPage.tsx`: Bóc tách `res?.result?.content || res?.result` từ Spring Page, nạp sản phẩm thật từ Database Render với UUID chuẩn.
  - `ProductCard.tsx`: Hỗ trợ hiển thị `imageUrl` từ backend.
- **Tạo đơn & PayOS**:
  - `productService.ts`: Bổ sung `getActiveProductUUID()` để tự động ánh xạ UUID sản phẩm thật nếu giỏ hàng chứa sản phẩm mẫu.
  - `CartDrawer.tsx` & `CartPage.tsx`:
    - Chuẩn hóa payload theo `OrderCreateRequestDTO` (gửi `engravingText`, `color`, `productId` dạng UUID).
    - Nhận `realOrderId` từ kết quả tạo đơn hàng của database.
    - Gọi `/api/payments/create-link` với `realOrderId` và chuyển hướng `window.location.href = checkoutUrl`.

## 3. Bài học Kinh nghiệm
- Luôn kiểm tra định dạng dữ liệu phân trang của Spring Data REST / Page trước khi parse ở Frontend (`res.result.content` thay vì `res.result`).
- Với các API yêu cầu kiểu dữ liệu nghiêm ngặt như `java.util.UUID`, Frontend cần validate định dạng UUID trước khi gửi hoặc xây dựng cơ chế auto-resolve từ các thực thể có sẵn trong DB để tránh lỗi 400.
- Không bao giờ fallback sử dụng ID giả lập để gọi sang dịch vụ thanh toán của bên thứ ba (như PayOS) vì backend sẽ luôn kiểm tra tính tồn tại của đơn hàng trong Database.
