# Kiểm tra các phản ánh của Khánh và Phúc — 05/11/2026

Phạm vi: đối chiếu code frontend và backend local. Báo cáo ghi rõ các hành vi xác nhận được qua code và những nguyên nhân còn cần đối chiếu request, phản hồi API hoặc dữ liệu production. Lượt kiểm tra này không thay đổi logic ứng dụng.

## Tổng hợp

| Mã | Nội dung | Kết quả |
| --- | --- | --- |
| K1 | User hủy đơn đặt in nhưng admin vẫn thấy chờ báo giá | Xác nhận lỗi cập nhật/hiển thị phía admin; chưa chứng minh được backend production không lưu hủy. |
| K2 | Màn hình báo giá thiếu thời gian | Admin chỉ hiện ngày; user đã có ngày, giờ và phút. Chưa có trường thời gian hoàn thành dự kiến trong dữ liệu báo giá. |
| K3 | Chặn admin khỏi trang giới thiệu | Chưa có chặn ở route `/`. Yêu cầu đã được xác nhận: chuyển admin về `/admin/dashboard`. |
| K4 | Admin tải STL bị sang trang giới thiệu | Có nhánh mở URL đính kèm trực tiếp khi tải thất bại; đường dẫn thuộc frontend có thể rơi vào route dự phòng. Cần URL thực tế để chốt đúng nhánh gây lỗi. |
| K5 | User tải STL bị 401 | Có nhánh mở tệp không gửi JWT và có lỗi backend xử lý đường dẫn nội bộ. Chưa định vị request trả 401 trên production. |
| K6 | Loại từ tiếng Anh khỏi giao diện | Còn nhiều nhãn tiếng Anh hiển thị trực tiếp. |
| P1 | Xác nhận thanh toán gói bằng popup của ứng dụng | Chưa làm; mua gói vẫn gọi `confirm()` của trình duyệt. |
| P2 | Màn hình xem và xử lý bảo hành | Giao diện và API xử lý đã có, nhưng chưa có route/menu admin và chưa truyền chế độ quản trị. |
| P3 | Đặt hàng loạt chuyển thành đang phát triển | Chưa làm; trang vẫn có biểu mẫu gửi yêu cầu và quảng bá mức giảm giá. |
| P4 | Thay hộp thoại trình duyệt ở các thao tác xác nhận | Source còn 13 `confirm`, 9 `alert`, 4 `prompt` trong 10 file; có cả màn hình cũ không còn được route trực tiếp. |

## Khánh

### K1. Hủy đơn chưa phản ánh đầy đủ ở màn hình quản trị

- User gửi `PUT /custom-orders/{id}/status` với `CANCELLED` và tải lại danh sách của chính mình: [CustomRequests.tsx:1059](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/custom/CustomRequests.tsx:1059>).
- Backend cho chủ đơn hủy khi đang `REQUESTED` hoặc `QUOTED`, sau đó lưu trạng thái mới: [OrderTransitionPolicy.java:74](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/OrderTransitionPolicy.java:74>), [CustomOrderServiceImpl.java:275](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/CustomOrderServiceImpl.java:275>).
- Admin tải dữ liệu khi mở trang; các lần tải tiếp theo là bấm làm mới hoặc vừa gửi báo giá. Không có cơ chế cập nhật khi user khác hủy: [AdminCustomOrdersPage.tsx:323](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:323>).
- Admin thiếu bộ lọc/nhãn cho `CANCELLED`, và nút báo giá vẫn hiện cho đơn đã hủy: [AdminCustomOrdersPage.tsx:472](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:472>), [AdminCustomOrdersPage.tsx:613](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:613>).
- Cách phân biệt: sau khi hủy thành công, lấy lại cùng ID qua API admin. Nếu API đã trả `CANCELLED` nhưng giao diện cũ thì lỗi đồng bộ/hiển thị. Nếu API vẫn trả `REQUESTED` thì cần kiểm tra request hủy, bản backend đang deploy và dữ liệu của cùng đơn.

### K2. Thời gian trên báo giá

- Admin dùng `toLocaleDateString('vi-VN')`, làm mất giờ/phút dù `createdAt` có timestamp: [AdminCustomOrdersPage.tsx:485](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:485>).
- User đã dùng `toLocaleString` với `hour`, `minute`: [CustomRequests.tsx:200](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/custom/CustomRequests.tsx:200>).
- Nếu phản ánh là thời gian gia công/giao hàng dự kiến thì cần bổ sung dữ liệu và biểu mẫu riêng; DTO hiện chỉ có `createdAt`, `updatedAt`: [CustomOrderDetailResponseDTO.java](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/dto/custom_prints/CustomOrderDetailResponseDTO.java>).

### K3. Chặn admin khỏi trang giới thiệu

- Route `/` render `LandingPage` trực tiếp, không kiểm tra vai trò: [routes/index.tsx:97](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/routes/index.tsx:97>).
- Cần kiểm tra phiên đăng nhập trước khi quyết định render trang giới thiệu hoặc chuyển admin về `/admin/dashboard`; phải xử lý cả lúc tải lại URL và điều hướng từ logo/link.
- Đây là yêu cầu điều hướng giao diện; các API quản trị vẫn phải giữ kiểm tra quyền riêng ở backend.

### K4 và K5. Tải tệp STL

**Những lỗi xác nhận được trong code:**

1. Nhánh tải chính dùng Axios có gắn Bearer token. Tuy nhiên, khi thất bại, admin mở trực tiếp `attachmentUrl`; phía user cũng có nhiều nhánh mở trực tiếp URL. Các lần mở này không đi qua interceptor JWT: [AdminCustomOrdersPage.tsx:280](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:280>), [CustomRequests.tsx:845](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/custom/CustomRequests.tsx:845>), [CustomRequests.tsx:895](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/custom/CustomRequests.tsx:895>), [api.ts:21](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/services/api.ts:21>).
2. Khi tạo đơn từ `fileId`, backend lưu đường dẫn `/api/vault/files/{id}/download`. Nhưng hàm tải file của đơn lại luôn chuyển đường dẫn này thành URL tuyệt đối bằng `new URI(url).toURL()`. Đường dẫn tương đối sẽ không xử lý được: [CustomOrderServiceImpl.java:183](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/CustomOrderServiceImpl.java:183>), [CustomOrderServiceImpl.java:388](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/CustomOrderServiceImpl.java:388>).
3. Khi URL tuyệt đối trỏ về API cần xác thực, kết nối HTTP backend hiện không gắn thông tin xác thực. Lỗi tải nguồn bị bọc thành lỗi nội bộ; frontend lại thử mở URL gốc.
4. Nếu URL được mở trên host frontend, cấu hình Vercel đưa mọi đường dẫn về ứng dụng và route không khớp sẽ chuyển về `/`. Cơ chế này giải thích được trường hợp mở đường dẫn API nhầm host rồi sang trang giới thiệu, nhưng cần URL đính kèm thực tế để xác nhận cho phản ánh của admin: [vercel.json](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/vercel.json>), [routes/index.tsx:462](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/routes/index.tsx:462>).
5. Hộp xem chi tiết admin hiện hiện nút có nhãn tải STL cho mọi đơn có `attachmentUrl`, kể cả ảnh xem trước. Cần phân biệt ảnh và tệp in thật: [AdminCustomOrdersPage.tsx:781](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/admin/AdminCustomOrdersPage.tsx:781>).

**Hướng xử lý:** thống nhất tải qua API theo ID đơn, nhận blob có xác thực, hiển thị lỗi thay vì mở URL API trực tiếp; backend đọc tệp nội bộ theo `FileAsset` hoặc dịch vụ lưu trữ. Giữ kiểm tra chủ đơn/admin ở API. Để chốt 401 production cần Request URL, phản hồi và việc có gửi Authorization; không đưa giá trị token vào báo cáo.

### K6. Việt hóa giao diện

Ví dụ còn hiển thị: `Dashboard Quản Trị`, `Báo Giá Đơn In Custom`, `Gói Subscriptions`, `Admin Panel`, `Bulk Order`, `POPULAR`, `Free Ship`, `Sub-Badge`, `Infill`, `Precision Additive Farm`.

Nguồn: [AdminSidebar.tsx:40](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/layouts/AdminSidebar.tsx:40>), [SubscriptionPanel.tsx:468](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/subscriptions/SubscriptionPanel.tsx:468>), [BulkOrderPage.tsx:9](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/BulkOrderPage.tsx:9>), [LandingNavbar.tsx:40](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/layouts/LandingNavbar.tsx:40>).

Cần rà nhãn, trạng thái và thông báo người dùng nhìn thấy. Những mã định dạng, vật liệu và tên thương hiệu như STL, CAD, PLA, PayOS cần được xử lý theo ngữ cảnh, tránh đổi nhầm dữ liệu kỹ thuật hoặc API.

## Phúc

### P1. Xác nhận mua gói hội viên

`handleCashPurchase` vẫn gọi `confirm()` trước khi tạo đơn mua gói và mở thanh toán: [SubscriptionPanel.tsx:429](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/subscriptions/SubscriptionPanel.tsx:429>).

Cần hộp thoại ứng dụng hiển thị tên gói, thời hạn, số tiền, phương thức thanh toán và hai lựa chọn hủy/xác nhận. Chỉ tạo giao dịch sau khi xác nhận; giữ các chốt chống gửi lặp hiện có.

### P2. Màn hình bảo hành quản trị

- `/warranty` đã có màn hình user: [WarrantyPage.tsx](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/WarrantyPage.tsx>).
- `WarrantyPanel` đã có chế độ admin và các nút duyệt, từ chối, xác nhận đổi mới, nhưng mặc định `admin=false`; hiện không có màn hình nào truyền chế độ quản trị này: [WarrantyPanel.tsx:32](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/support/WarrantyPanel.tsx:32>), [WarrantyPanel.tsx:348](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/support/WarrantyPanel.tsx:348>).
- Chưa có route `/admin/warranty` và mục menu bảo hành ở `AdminSidebar`.
- Backend đã có API lấy toàn bộ yêu cầu và đổi trạng thái, bảo vệ bằng quyền ADMIN: [WarrantyController.java:43](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/controller/WarrantyController.java:43>).
- Giới hạn thêm: việc tạo bảo hành hiện tra `OrderRepository`; đơn đặt in tùy chỉnh nằm ở `CustomOrder` chưa được hỗ trợ trong phần này: [WarrantyServiceImpl.java:68](</D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/WarrantyServiceImpl.java:68>).

### P3. Đặt hàng loạt đang phát triển

Trang `/bulk-order` vẫn render `<CustomRequestForm bulk />` và các mức giảm giá, tức vẫn cho gửi yêu cầu: [BulkOrderPage.tsx:50](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/pages/BulkOrderPage.tsx:50>).

Cần thay trang bằng thông báo đang phát triển, gỡ biểu mẫu đang hoạt động và đồng bộ nhãn/điểm vào ở menu, trang giới thiệu, bảng điều khiển. Truy cập trực tiếp URL cũng phải nhận trạng thái đang phát triển.

### P4. Các hộp thoại trình duyệt còn lại

Tổng source: 13 `confirm`, 9 `alert`, 4 `prompt`, phân bố trong 10 file. Có cả các file cũ không còn được route trực tiếp như `FileVaultPage` và `features/admin/Products`.

Các luồng đang dùng có thể thấy rõ: mua/đổi/tặng/ngừng áp dụng gói, hủy yêu cầu đặt in, xác nhận thu tiền khi giao, xóa địa chỉ, xóa danh mục, đổi trạng thái sản phẩm, nhập quyết định giải quyết tranh chấp và báo lỗi tải tệp/báo giá.

Ví dụ: [SubscriptionPanel.tsx:354](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/subscriptions/SubscriptionPanel.tsx:354>), [CustomRequests.tsx:1059](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/custom/CustomRequests.tsx:1059>), [OrderList.tsx:271](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/orders/OrderList.tsx:271>), [DisputePanel.tsx:233](</D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/features/support/DisputePanel.tsx:233>).

Cần dùng hộp thoại xác nhận chung cho thao tác cần quyết định, biểu mẫu popup cho thao tác cần nhập dữ liệu, thông báo tại màn hình cho lỗi/kết quả; bảo đảm không gửi thao tác khi hủy hoặc nhấn lặp.

## Thứ tự xử lý đề xuất

1. Luồng tải tệp có xác thực và xử lý tệp nội bộ; đồng bộ/hiển thị đơn đã hủy.
2. Nối màn hình bảo hành quản trị, xác nhận phạm vi bảo hành đơn tùy chỉnh.
3. Chặn admin ở trang giới thiệu; hiển thị đủ thời gian báo giá.
4. Thống nhất các hộp thoại xác nhận, chuyển đặt hàng loạt sang đang phát triển và Việt hóa nhãn.
