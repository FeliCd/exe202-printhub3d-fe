# Flow Nhóm 4 — Giữ tên file, đồng bộ hủy và hoàn tất kiểm thử

Ngày: 02/11/2026.

**Phạm vi:** F26–F27 (2 vấn đề). Đây là đặc tả sửa và nghiệm thu, chưa phải kết quả các lỗi nghiệp vụ đã được sửa. Bulk order ngoài phạm vi; F24 đã rút do prototype được bỏ.

**Tài liệu chung:** [Mục lục, quy tắc và thứ tự triển khai](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) · [Báo cáo audit](./REVIEW_LIVE_WEBSITE_UX_2026-11-02.md).

## Điều kiện bắt đầu và phụ thuộc

1. F26 dùng production asset/metadata đã thống nhất ở [Nhóm 1](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md), mục 1.3; không thêm một hợp đồng upload thứ hai. F27 dùng policy trạng thái/quyền của [Nhóm 2](./FLOW_FIX_LIVE_UX_GROUP_02_BUSINESS_2026-11-02.md).
2. Trước khi dọn dữ liệu QA phải GET đối chiếu trạng thái hiện tại. Nếu danh mục ID 5 đã được dọn ở Nhóm 1 thì chỉ ghi nhận đã vắng mặt; không lặp mutation hoặc xóa một bản ghi khác để thay thế.
3. Audit trước chỉ cho phép các bản ghi thử chưa trả tiền, không chuyển tiền/không đưa vào sản xuất. Các ca paid, OTP và sau bán cần fixture/môi trường/phạm vi phù hợp; không coi việc viết flow là đã được chạy thêm các nghiệp vụ đó.

## Flow sửa và tiêu chí nghiệm thu

### 4.1. F26 — Tải STL giữ đúng tên và phần mở rộng

**File:** BE [CloudinaryServiceImpl.java](../../PrintHub_3D/src/main/java/com/fpt/printhub_3d/service/impl/CloudinaryServiceImpl.java), UploadController/service metadata; FE helper upload/download, CustomRequests và nút tải của admin.

**Bước sửa:**

1. Giữ metadata `originalFilename`, format và byteSize/checksum từ lúc upload theo contract ở [Nhóm 1, mục 1.3](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md). Tên public storage có thể ngẫu nhiên, nhưng không được làm mất định dạng khi người dùng tải xuống.
2. Với file mới, storage key/public ID dùng hậu tố đúng hoặc endpoint download trả `Content-Disposition` có filename an toàn, phần mở rộng đúng. Không suy ra STL cho tất cả attachment.
3. Với file cũ có URL raw nhưng metadata thiếu: nếu có nguồn tin cậy để xác định format, bổ sung tên tải theo định dạng; nếu chưa xác định thì ghi chưa xác định, không gán `.stl` cho ảnh hoặc dữ liệu bất kỳ.
4. Dùng Unicode filename khi hỗ trợ và một fallback filename an toàn. Loại path separator/control character khỏi tên trả header.
5. Nếu tải qua FE fetch/blob để gán tên, kiểm tra CORS, lỗi HTTP và thu hồi object URL; không dựa duy nhất vào thuộc tính `<a download>` trên URL khác origin.
6. Download endpoint nếu được thêm **là API đề xuất**; phải kiểm tra quyền sở hữu/admin theo loại tài liệu. Không tạo proxy cho URL tùy ý do client truyền vào.

**Nghiệm thu:** chọn file tên tiếng Việt → upload → user/admin tải → tên có đuôi đúng; bytes và checksum không đổi. Thử STL/OBJ/STEP theo allowlist, filename dài, thiếu metadata, storage 404 và không đủ quyền.

### 4.2. F27 — Một luồng đối soát chung cho PayOS và purchase

**Hiện trạng trong mã:** PaymentResultPage bỏ gọi verify khi query cho biết cancel; PaymentService.verify khi gateway CANCELLED mới cập nhật Payment, chưa thấy cập nhật purchase trong nhánh đó. Đây là điểm cần sửa dựa trên audit; vẫn phải đối chiếu bản backend production trước triển khai.

**File:** [PaymentResultPage.tsx](../exe-fe/src/pages/PaymentResultPage.tsx), paymentService FE, SubscriptionPanel; BE PaymentServiceImpl, UserSubscriptionServiceImpl, SubscriptionPurchase/Payment repositories, DTO verify và job đối soát nếu có.

**Contract trạng thái đích:**

| Bằng chứng xác minh | Payment | Purchase | Hội viên/xu |
| --- | --- | --- | --- |
| Đang chờ hợp lệ | PENDING | PENDING theo tên hiện tại | Không cấp gói, không cộng xu. |
| Gateway xác nhận hủy, chưa có tiền thành công | CANCELLED | CANCELLED | Không cấp gói, không cộng xu. |
| Hết hạn và đã xác minh không có tiền/không còn khả năng trả theo attempt | EXPIRED | EXPIRED | Không cấp gói, không cộng xu. |
| Trả đủ tiền hợp lệ | SUCCESS hoặc mã canonical hiện hành | PAID theo mô hình hiện hành | Activation đúng một lần theo snapshot gói; không thưởng xu mua gói nếu policy hiện tại không cho. |
| Bằng chứng tiền về sau khi đối tượng đã kết thúc hoặc trạng thái mâu thuẫn | Giữ đúng bằng chứng tiền | Chuyển quy trình đối soát | Không âm thầm xóa tiền, tự hoàn tiền hoặc cấp gói không kiểm tra. |

Tên trạng thái cụ thể phải khớp enum/schema hiện có; không thêm một mã chỉ ở FE mà BE/DB không hiểu.

**Bước sửa backend:**

1. Tạo service/hàm dùng chung **đề xuất** `reconcilePaymentOutcome` để verify, xử lý thông báo gateway được xác thực và job đối soát gọi cùng quy tắc. Không triển khai ba nhánh cập nhật purchase khác nhau.
2. Lookup payment/purchase theo mã gateway, kiểm tra owner/target. Lấy bằng chứng gateway qua SDK hiện được cài; không lấy `status=CANCELLED` trên URL làm bằng chứng hủy server.
3. Gọi gateway ngoài transaction giữ khóa DB; sau đó transaction ngắn khóa root purchase rồi payment theo cùng thứ tự các luồng liên quan, đọc lại trạng thái để xử lý cạnh tranh với settlement.
4. Hủy hợp lệ: nếu chưa có payment SUCCESS/paid evidence thì chuyển Payment và Purchase từ trạng thái chờ sang CANCELLED trong cùng transaction, ghi thời điểm/lý do/nguồn xác minh. Không chạy activation, không ghi doanh thu hoặc cộng xu.
5. Verify/callback/job lặp lại phải idempotent; cùng kết quả không tạo thêm journal hay thay đổi quyền lợi nhiều lần. Dữ liệu đã SUCCESS không bị hạ thành CANCELLED chỉ vì browser gửi URL cũ.
6. Nhánh EXPIRED dùng quy tắc tương tự với bằng chứng phù hợp. Nếu đang có xác minh tiền chưa rõ, giữ trạng thái cần kiểm tra thay vì tuyên bố hủy chắc chắn.
7. Chỉ dùng webhook cho các loại sự kiện mà gateway/SDK thật sự hỗ trợ và đã xác thực. Nếu hủy không có webhook, cần verify khi quay về và job đối soát phía server cho khách đóng tab/không quay lại.
8. Response verify **đề xuất** bổ sung `purchaseId`, `purchaseStatus`, `verifiedAt` bên cạnh orderCode/payment status/amount/targetType. Các client cũ tiếp tục đọc được field cũ.
9. Nếu cần chức năng hủy từ trang hội viên, bổ sung command cancel purchase **đề xuất** theo owner/admin, có idempotency và kiểm tra tiền; không mở endpoint cho FE tùy ý đặt `status`.

**Bước sửa frontend:**

1. Có orderCode và đã đăng nhập thì luôn xác minh, kể cả có `cancel=true`; query chỉ là gợi ý trạng thái của điều hướng.
2. Trong khi chờ: “Đang kiểm tra kết quả giao dịch”. Thiếu code/không đủ quyền/verify lỗi có trạng thái riêng; không hiện chắc chắn đã hủy hoặc đã trừ/chưa trừ tiền khi chưa xác minh.
3. Render theo `targetType` server. Với SUBSCRIPTION_PURCHASE, dùng CTA về hội viên/lịch sử purchase; bỏ nội dung giao hàng, sản xuất và COD không áp dụng.
4. Sau kết quả terminal, invalidate purchases/membership/points; lưu đủ ID để mở lại trạng thái sau reload. Không kích hoạt quyền lợi bằng localStorage.
5. Có lịch sử purchase chờ/đã hủy/thành công để khách hiểu lần mua trước. Nếu thử lại, tạo/reuse theo quy tắc server, không tạo thêm nghĩa vụ tiền do một lỗi giao diện.

**Flow đích:**

```mermaid
sequenceDiagram
  participant U as Người dùng
  participant P as PayOS
  participant F as PrintHub FE
  participant B as PrintHub BE
  participant D as Database
  U->>P: Hủy và xác nhận hủy
  P-->>F: Redirect kèm orderCode
  F->>B: Verify orderCode bằng phiên tài khoản
  B->>P: Lấy trạng thái giao dịch
  P-->>B: Bằng chứng CANCELLED
  B->>D: Khóa và đối chiếu Payment/Purchase
  B->>D: Cập nhật cả hai thành CANCELLED nếu chưa trả tiền
  B-->>F: Kết quả đã xác minh và trạng thái purchase
  F-->>U: Đã hủy; không kích hoạt gói
```

**Nghiệm thu:** hủy qua PayOS → Payment và Purchase cùng CANCELLED; reload/verify lại không đổi kết quả; đóng tab vẫn được job đối soát; user khác không đọc/hủy được purchase; callback lặp không cấp thêm gói; cạnh tranh cancel/paid không làm mất bằng chứng tiền. Các ca PAID/late payment chạy bằng fixture/provider test phù hợp trước, không chuyển tiền production để tạo điều kiện giả.

### 4.3. Dọn dữ liệu QA bằng điều kiện nhận diện cụ thể

Chỉ thực hiện phần này sau khi các API tương ứng đã sửa và đã kiểm thử; đây là flow dọn dữ liệu đề xuất, chưa phải thao tác đã thực hiện trong lần viết tài liệu.

| Đối tượng | ID cần đối chiếu | Flow xử lý |
| --- | --- | --- |
| Danh mục thử | ID `5`, tên `QA AUDIT 20261102` | GET xác nhận đúng tên/mô tả, không có sản phẩm → DELETE qua API admin đã sửa → kiểm tra không còn. Nếu đã được dùng hoặc đổi tên thì dừng để xác định lại, không xóa theo số ID đơn lẻ. |
| Mua gói thử | Purchase `9835ed99-7c84-43b2-a3b9-508d5c7effed`, orderCode `3240744489273434`, amount 49.000đ | Xác minh gateway hiện tại, ownership/plan/amount đúng → reconcile theo service mới → kỳ vọng Purchase CANCELLED, không có activation. Giữ lịch sử thanh toán; không sửa thành PAID hoặc xóa chứng cứ. |
| Yêu cầu in thử | Custom `9bd51575-9766-4483-855e-6f7f2030dbc2` | Xác nhận vẫn CANCELLED và chứa nhãn QA. Giữ lịch sử mặc định; chỉ xóa bản ghi/file nếu có chính sách retention và cơ chế quản trị phù hợp, không xóa hàng loạt đơn đã hủy. |
| Giỏ/tồn kho | User được cấp và sản phẩm `c0000001-0000-0000-0000-000000000010` | Trước audit đã dọn giỏ rỗng, stock cuối audit 48. Khi kiểm tra lại dùng baseline mới nhất; không ép tồn kho về 48 nếu từ đó có giao dịch thật. |

Sau mỗi thao tác ghi trước/sau, đối tượng, thời gian và kết quả. Không đưa câu SQL “update tất cả PENDING thành CANCELLED” vào quy trình. Nếu service mới chưa đủ sửa dữ liệu cũ, dùng tác vụ quản trị chỉ định ID và có dry run/audit, không tự chỉnh DB trong lúc triển khai flow này.

### 4.4. Ma trận kiểm thử end-to-end sau sửa

| Luồng | Ca bắt buộc | Điều kiện đạt |
| --- | --- | --- |
| Marketplace PayOS | Preview → create → mở link → hủy; retry/double click; provider timeout; expiry | Tổng tiền nhất quán; không trùng đơn; trạng thái và reservation kết thúc đúng một lần; giỏ theo quy tắc đã chốt. |
| Marketplace COD | Tạo → hủy trước xử lý; admin chuyển tiến độ trên dữ liệu test | Không cần PayOS; giữ/trả kho đúng; hành động đúng quyền/trạng thái. Chạy ở môi trường test hoặc phạm vi riêng được cho phép. |
| Custom | Upload/Studio/giỏ → báo giá → nhận → hủy; file tải từ user/admin | Đúng file/metadata, bản ghi và counters; không có hành động báo giá sau hủy. |
| Custom thanh toán/sản xuất | Chấp nhận báo giá → trả tiền → chuẩn bị/in/giao/hoàn tất | Chạy bằng dữ liệu test phù hợp; không tự kích hoạt máy in production. Chưa được coi pass từ việc chỉ nhận báo giá. |
| Hội viên PayOS | Tạo purchase → link → hủy/reload/đóng tab; verify/job lặp | Payment và Purchase thống nhất; không cấp gói/xu khi chưa trả tiền. |
| Hội viên trả tiền | PAID hợp lệ, callback lặp, cancel/paid cạnh tranh, expiry | Gói cấp đúng một lần theo snapshot, không hạ trạng thái tiền đã nhận, có xử lý mâu thuẫn. |
| Điểm/quyền lợi | Đủ/thiếu xu, đổi đồng thời, giảm giá/ship, hết hạn gói | Không âm điểm/đổi trùng; summary và checkout theo cùng điều kiện. |
| OTP/tài khoản | Register/verify/resend, OTP sai/hết hạn, forgot/change password | Cần hộp thư thử; thông báo rõ và không lộ OTP/token trong log. |
| Sau bán | Review/reorder/warranty/dispute bằng đơn test đủ điều kiện | Đúng ownership/trạng thái; không đánh giá hoặc xử lý hồ sơ của khách thật để tạo fixture. |
| Responsive/accessibility | 320px/390px/desktop, menu, form, modal, ngôn ngữ | Không che nút chính/tràn ngang bất thường; keyboard/focus/nhãn dùng được. |

Các ca đã được phép ở audit trước vẫn không bao gồm chuyển tiền hoặc đưa đơn vào sản xuất. Khi kiểm thử lại, dùng môi trường test và fixture cho các bước vượt giới hạn đó; không suy diễn quyền thực hiện thêm từ việc đã được cho phép tạo một số bản ghi QA.

### 4.5. Cổng nghiệm thu Nhóm 4

- [ ] File tải đúng tên/đuôi/bytes cho các định dạng được hỗ trợ.
- [ ] Hủy/expiry của purchase được reconcile ở server, không phụ thuộc query hoặc khách quay lại.
- [ ] Không hạ trạng thái đã nhận tiền; đối soát có idempotency và kiểm tra ownership.
- [ ] QA ID 5 và purchase chờ được xử lý đúng điều kiện; giữ lịch sử cần thiết.
- [ ] Đã ghi kết quả cho từng ca end-to-end; ca chưa chạy vẫn được đánh dấu chưa xác minh.

## Bàn giao khi hoàn tất nhóm

Bàn giao kết quả filename/checksum, đối chiếu Payment–Purchase, biên bản dữ liệu QA và ma trận 4.4 với trạng thái từng ca đã chạy/chưa xác minh.

Với mỗi ID, ghi file/schema đã đổi, bằng chứng kiểm thử, môi trường và trạng thái: đã sửa và đã kiểm thử / đã sửa chưa kiểm thử live / chưa sửa. Giữ nguyên ID để đối chiếu báo cáo; không đánh dấu ca chưa chạy là pass.

Quay lại [mục lục và kế hoạch phối hợp](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md) trước khi chuyển sang nhóm tiếp theo.
