# Mục lục flow sửa chi tiết — 4 nhóm ưu tiên PrintHub 3D

Ngày lập: 02/11/2026.

Nguồn: [báo cáo kiểm thử website thật](./REVIEW_LIVE_WEBSITE_UX_2026-11-02.md), các bằng chứng đợt 1/2 và mã nguồn đang có trong hai workspace.

**Trạng thái:** đây là đặc tả để triển khai và nghiệm thu. Các lỗi nghiệp vụ trong bộ flow chưa được sửa trong lần viết tài liệu này. Thay đổi đã thực hiện riêng theo yêu cầu chủ website là bỏ trang prototype `CatalogPreviewPage.tsx`, bỏ liên kết menu và chuyển URL cũ về `/catalog`; đã kiểm tra build và lint. Chưa deploy.

**Phạm vi:** 26 phát hiện còn hiệu lực, giữ ID F01–F23 và F25–F27. **F24 đã rút** vì `catalog-preview` chỉ là prototype dùng mock data. Không sửa dữ liệu hoặc xây thêm chức năng cho trang prototype. Bulk order tiếp tục nằm ngoài phạm vi.

## Cách sử dụng bộ flow

Bốn nhóm đã được tách thành bốn file bên dưới; file này chỉ giữ quy tắc, phụ thuộc và kế hoạch phối hợp. Mỗi bước sửa chi tiết chỉ có một bản ở file nhóm tương ứng để tránh lệch nội dung.

Triển khai theo thứ tự Nhóm 1 → Nhóm 2 → Nhóm 3 → Nhóm 4. Trong một nhóm có thể chia thành các thay đổi nhỏ để review, nhưng không coi một lỗi đã xong nếu chỉ sửa giao diện mà dữ liệu/API vẫn sai.

Các tên có ghi **đề xuất** là API, field hoặc module cần bổ sung; không có nghĩa chúng đã tồn tại. Trước khi sửa production phải đối chiếu commit/backend đang chạy, migration thực tế và log lỗi. Các tài liệu `FLOW_FIX_01…09` cũ có thể tham khảo, nhưng phần mô tả hiện trạng của chúng không thay thế bằng chứng runtime ngày 02/11.

### Bản đồ công việc

| Nhóm / file flow riêng | ID trong báo cáo | Kết quả cần đạt |
| --- | --- | --- |
| [1 — Khôi phục luồng chính](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md) | F25, F01–F05 | Đặt hàng được; nhập lại thiết kế; đúng file sản xuất, địa chỉ/tổng tiền; CRUD danh mục. |
| [2 — Đồng nhất nghiệp vụ](./FLOW_FIX_LIVE_UX_GROUP_02_BUSINESS_2026-11-02.md) | F06–F15, F18 | Trạng thái/counters, validation, route, tùy biến, hỗ trợ và search cùng quy tắc. |
| [3 — Hoàn thiện trải nghiệm](./FLOW_FIX_LIVE_UX_GROUP_03_EXPERIENCE_2026-11-02.md) | F16–F17, F19–F23 | Nội dung thật, chính sách, form/modal, giá, ngôn ngữ và thời gian rõ ràng. |
| [4 — File, hủy giao dịch và dữ liệu QA](./FLOW_FIX_LIVE_UX_GROUP_04_FILES_PAYMENT_QA_2026-11-02.md) | F26–F27 | Tên file đúng; PayOS/Purchase đồng bộ; QA được xử lý và kiểm thử lại. |

### Những quy tắc dùng xuyên suốt

1. **Server quyết định giá và trạng thái nghiệp vụ.** FE gửi ID/lựa chọn và hiển thị kết quả; không tự quyết định đã trả tiền, đã hủy hoặc được miễn ship.
2. **Không đánh đồng các trạng thái.** `Order.status`, `CheckoutOrder.status`, `Payment.status` và `SubscriptionPurchase.status` là những trạng thái liên quan nhưng khác đối tượng. Cần ánh xạ rõ, không dùng một chuỗi bất kỳ thay tất cả.
3. **Ảnh preview khác file sản xuất.** PNG không thay thế STL; URL có chữ `raw` cũng chưa đủ thay việc biết loại file và nội dung thực tế.
4. **Hủy không đồng nghĩa xóa lịch sử.** Giữ giao dịch/nhật ký để đối soát; chỉ dọn các bản ghi QA theo điều kiện cụ thể ở Nhóm 4.
5. **Không sửa dữ liệu cũ bằng giá trị đoán.** Thiếu địa chỉ, vật liệu, file hoặc trường đại học phải ghi chưa xác định; không tạo giá trị có vẻ thật để lấp chỗ trống.
6. **Giữ tương thích khi đổi DTO.** Backend thêm field/endpoint trước, FE chuyển sang dùng sau; chỉ bỏ field cũ khi tất cả nơi gọi đã được kiểm tra.

### Thay đổi prototype đã thực hiện

```text
Trước: /catalog-preview -> CatalogPreviewPage -> products mock -> modal thông số
Sau:   /catalog-preview?q=...#... -> /catalog?q=...#...
       /catalog -> CatalogPage -> dữ liệu catalog hiện tại
```

Đã xóa file TSX và lazy import; bỏ mục “Xem trước Danh mục (Guest)” trong sidebar cũ. Giữ route chuyển hướng có `replace` để URL cũ không đi về trang chủ hoặc tạo thêm bước lặp trong lịch sử. Không xóa các dữ liệu/mock khác ngoài phạm vi đã yêu cầu.

## Phối hợp giữa các nhóm

Với khối lượng hiện tại, tách bốn file giúp giao việc, review và cập nhật từng nhóm dễ hơn; mục lục chung giữ các quy tắc không bị sao chép thành bốn phiên bản. Không chia tiếp thành nhiều file nhỏ nếu chưa có nhu cầu giao một flow riêng.

| Phần dùng chung | Nhóm phụ trách trước | Nhóm dùng tiếp / cách phối hợp |
| --- | --- | --- |
| Production asset, upload metadata | Nhóm 1, mục 1.3 | Nhóm 2 kiểm tra file; Nhóm 4 giữ tên/đuôi/download. Dùng cùng contract, không phát sinh hai đường upload khác nhau. |
| Địa chỉ và tổng tiền checkout | Nhóm 1, mục 1.4–1.5 | Nhóm 2–3 dùng nguồn chung; Nhóm 4 kiểm thử lại. Không tự thêm một phép tính giá/ship khác. |
| Trạng thái, allowedActions và counters | Nhóm 2, mục 2.1 | Nhóm 3 dịch nhãn; Nhóm 4 kiểm thử terminal/cancel. Server vẫn kiểm tra quyền và trạng thái. |
| Modal và giao diện dùng chung | Nhóm 3 | Kiểm tra các form Nhóm 1–2 đã sửa và luồng hủy Nhóm 4 khi đổi API props/focus. |
| PaymentService và purchase | Nhóm 1 sửa phần checkout theo nguyên nhân; Nhóm 4 sửa reconcile | Review cùng contract/transaction; tránh ghi đè thay đổi hoặc tạo payment engine thứ hai. |
| Danh mục QA ID 5 | Nhóm 1, mục 1.6 | Nhóm 4 kiểm kê lại; nếu đã xóa thì ghi nhận, không xóa lặp hoặc thay bằng ID khác. |

Có thể chuẩn bị nội dung, fixture và bản dịch độc lập trong khi nhóm trước đang làm. Với code trùng file/service hoặc DTO chưa chốt, tích hợp theo thứ tự và kiểm tra diff trước khi chuyển việc. Đọc xong một file nhóm không thay cho việc đọc quy tắc chung ở đây.


## Kế hoạch chia thay đổi để triển khai

| Đợt thay đổi | Nội dung | Phụ thuộc / bằng chứng cần có |
| --- | --- | --- |
| A0 — Đã thực hiện local | Bỏ CatalogPreviewPage, menu prototype, redirect URL cũ, điều chỉnh phạm vi báo cáo | Build/lint và kiểm tra redirect local. Chưa deploy. |
| A1 | Điều tra/sửa F25, giữ transaction/giỏ/kho đúng | Log exception gốc, regression tạo đơn/thất bại/retry. |
| A2 | Import JSON F01; phân tách production asset F02 | File v1/v2 và file xuất → nhập/tải có đối chiếu. |
| A3 | Address source F03; summary giá F04 | Contract preview/địa chỉ, kiểm thử điều hướng SPA và thay đổi giá. |
| A4 | Category CRUD F05 | Auth/validation/409, sau đó xử lý QA ID 5. |
| B1 | F06–F09 trạng thái/counters | DTO/action policy chung; fixture các trạng thái. |
| B2 | F10–F15 và F18 | Contract phone/upload/contact/product template/search; không sửa bằng fallback giả. |
| C1 | F16–F17 | Nội dung/ảnh/chính sách được chủ website xác nhận. |
| C2 | F19–F23 | Form/modal/giá/dịch/time; kiểm tra keyboard/mobile. |
| D1 | F26 tên file và legacy metadata | Dựa contract asset A2; kiểm tra storage/header/download thực tế. |
| D2 | F27 reconcile + dọn purchase QA + kiểm thử tích hợp | Cạnh tranh trạng thái/paid/cancel, bằng chứng gateway và dữ liệu cuối. |

Mỗi đợt ghi rõ API/field mới, migration và cách rollback phần code. Các migration tài chính/dữ liệu mới nên bổ sung tương thích trước; rollback FE không được xóa dữ liệu nghiệp vụ vừa tạo. Không deploy FE yêu cầu endpoint chưa có, và không thay backend response khiến bản FE đang phục vụ ngừng đọc được dữ liệu.

## Kết quả bàn giao cần có khi đội phát triển thực hiện xong

1. Với từng F còn hiệu lực: thay đổi code/schema liên quan, nguyên nhân đã xác định, bằng chứng trước/sau và kết quả nghiệm thu.
2. Danh sách ca đã chạy ở local/test/production, ghi rõ môi trường; build pass không thay cho thanh toán hoặc in thực tế đã pass.
3. Bảng đối chiếu tổng tiền, trạng thái Payment/Purchase/Order và reservation của các ca thử; không chỉ ảnh thông báo thành công.
4. Biên bản xử lý QA ID 5/purchase còn PENDING; những dữ liệu lịch sử/file cố ý giữ lại cần được ghi rõ.
5. Cập nhật [báo cáo audit](./REVIEW_LIVE_WEBSITE_UX_2026-11-02.md) theo từng ID: đã sửa và đã kiểm thử / đã sửa chưa kiểm thử live / chưa sửa. F24 giữ trạng thái đã rút, không đưa lại vào backlog.

Tài liệu này không yêu cầu triển khai toàn bộ một kiến trúc thanh toán mới để sửa từng lỗi nhỏ. Tái sử dụng các service và state policy đã có; bổ sung hợp đồng chung ở nơi hiện đang bị phân tán, và giữ các điều kiện dữ liệu/tiền/kho nêu trong từng flow.
