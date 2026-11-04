# Báo cáo kiểm thử chức năng & trải nghiệm người dùng PrintHub 3D

**Website:** [printhub3d.id.vn](https://printhub3d.id.vn/) — tự chuyển sang `www.printhub3d.id.vn`.

**Thời gian thực hiện:** 02/11/2026, đợt 1 khoảng 06:32–06:55; đợt 2 khoảng 07:06–07:15 sau khi chủ website xác nhận cho phép tạo và hủy dữ liệu thử. Giờ Việt Nam (UTC+07).

**Vai trò:** khách chưa đăng nhập, user và admin do chủ website cung cấp. Không ghi mật khẩu, token hoặc OTP vào báo cáo.

**Phạm vi loại trừ:** không mở hoặc kiểm thử chức năng **bulk order / đặt hàng hàng loạt**, kể cả phần gửi yêu cầu của chức năng này. Việc tên/liên kết bulk order xuất hiện trong ảnh menu không có nghĩa đã kiểm thử chức năng đó.

## 1. Kết luận để ưu tiên xử lý

Sau khi chủ website xác nhận `catalog-preview` chỉ là prototype dùng mock data, danh sách còn **26 phát hiện cần xử lý**, gồm lỗi chức năng đã tái hiện và vấn đề UX/nội dung: **6 mục P1**, **16 mục P2**, **4 mục P3**. F24 được rút khỏi danh sách lỗi; giữ nguyên ID các mục còn lại để đối chiếu bằng chứng. Chưa phát hiện tình huống đủ bằng chứng để xếp P0. Đợt 2 bổ sung F25–F27 sau khi được phép thực hiện các bước tạo dữ liệu thật.

**Điều chỉnh phạm vi theo chủ website:** đã xóa `CatalogPreviewPage.tsx` trong mã nguồn local, bỏ mục menu prototype, chuyển URL cũ `/catalog-preview` về `/catalog`. Chưa deploy thay đổi này lên website thật. Trang catalog chính vẫn là phạm vi kiểm thử và sửa lỗi.

Sáu mục cần xử lý trước khi tăng lưu lượng khách hoặc quảng bá mạnh:

1. JSON do Studio xuất ra không nhập lại được: bộ xuất ghi phiên bản 2, bộ nhập chỉ nhận phiên bản 1.
2. Nút tải STL của một báo giá thực tế mở ảnh PNG.
3. Đổi địa chỉ mặc định nhưng giỏ hàng vẫn dùng địa chỉ cũ khi điều hướng trong cùng phiên.
4. Phí vận chuyển giữa giỏ hàng dạng ngăn kéo và trang thanh toán lệch 30.000đ.
5. Admin tạo được danh mục nhưng sửa và xóa đều trả HTTP 404.
6. Xác nhận checkout Marketplace PayOS 79.000đ trả HTTP 500, tái hiện hai lần; không tạo được đơn mới.

**Kết quả bổ sung đợt 2:** upload STL hợp lệ → tạo yêu cầu QA → admin báo giá → user nhận báo giá → hủy yêu cầu đều thành công. Mua gói Student Pro 49.000đ mở được PayOS và hủy được giao dịch; tuy nhiên bản ghi mua gói trong PrintHub vẫn ở `PENDING` dù API xác minh thanh toán đã báo `CANCELLED`. Không chuyển tiền, không kích hoạt hội viên và không đưa đơn QA vào sản xuất.

**Không kết luận đã kiểm thử thành công 100% chức năng hoặc đã hoàn tất một vòng mua hàng đã trả tiền.** Đã duyệt và thao tác trên các nhóm màn hình bên dưới; các bước thanh toán thực, OTP, thay đổi quyền hoặc xử lý đơn/khiếu nại của khách hiện có được đánh dấu giới hạn riêng. Không lấy việc trang tải được làm bằng chứng rằng toàn bộ nghiệp vụ của trang hoạt động.

### Quy ước mức độ và bằng chứng

| Mức | Ý nghĩa trong báo cáo |
| --- | --- |
| P0 | Mất dữ liệu diện rộng, không sử dụng được hệ thống hoặc rủi ro nghiêm trọng đã chứng minh. Chưa có bằng chứng trong phiên này. |
| P1 | Có thể làm sai thông tin đặt hàng, cản trở khôi phục thiết kế hoặc chặn nghiệp vụ quản trị quan trọng. |
| P2 | Cản trở một tác vụ, làm người dùng hiểu sai hoặc thiếu điều kiện vận hành cần thiết. |
| P3 | Giảm độ rõ ràng, nhất quán hoặc khả năng sử dụng; chưa chặn luồng chính đã thử. |

Các mục **chức năng** mô tả hành vi sai đã quan sát. Các mục **UX/nội dung** mô tả khoảng cách giữa cách giao diện trình bày và trải nghiệm thực tế; không mặc định chúng là lỗi backend.

## 2. Môi trường và cách kiểm thử

- Dùng Microsoft Edge qua Playwright, truy cập website đang vận hành và API mà website thực sự gọi: `https://exe-printhub-3d.onrender.com/api`.
- Desktop: 1440 × 1000. Mobile giả lập: 390 × 844; kiểm tra bổ sung giỏ hàng ở 320 × 740. Đây là kiểm tra responsive trong trình duyệt, chưa phải thử trên điện thoại vật lý.
- Tách phiên khách, user và admin; kiểm tra cả giao diện lẫn phản hồi mạng. Các API admin dùng để kiểm tra quyền chỉ thực hiện yêu cầu GET.
- Thu thập ảnh, nội dung/điều khiển của trang, phản hồi HTTP lỗi và lỗi JavaScript. Đã có phiên hết hạn tự nhiên: JWT có thời hạn 900 giây; đăng nhập lại để tiếp tục và chụp lại những màn hình bị chuyển sang login.
- Có đọc một số file mã nguồn trong workspace để hỗ trợ giải thích nguyên nhân. Bằng chứng kết luận vẫn là hành vi trên website thật; chưa đối chiếu commit triển khai để khẳng định mã local trùng hoàn toàn bản production.
- Trong hai đợt audit không sửa mã nguồn ứng dụng, không deploy, không đổi mật khẩu, không thanh toán và không gửi phản hồi cho khách hàng thật. Việc bỏ trang prototype được thực hiện sau audit theo yêu cầu riêng, đã nêu ở phần điều chỉnh phạm vi.

Ảnh và dữ liệu kiểm thử nằm trong [thư mục bằng chứng](../output/qa-2026-11-02/), đợt bổ sung nằm trong [round2](../output/qa-2026-11-02/round2/). Tổng cộng 111 ảnh chụp (95 đợt đầu, 16 đợt bổ sung), bao gồm một số trạng thái đang tải; chỉ dùng trạng thái đã xác minh để kết luận lỗi. Các timeout do bộ kiểm thử chọn sai selector hoặc gặp hộp xác nhận không được tính là lỗi website.

## 3. Ma trận phạm vi đã thực hiện

| Nhóm / đường dẫn | Đã thực hiện thực tế | Kết quả / giới hạn |
| --- | --- | --- |
| Trang chủ `/` | Mở từ domain gốc, kiểm tra CTA, footer, menu mobile | Tải được; có nội dung/đầu mối liên hệ cần thống nhất. |
| Đăng nhập `/login` | Đăng nhập user/admin, một lần thử tài khoản không tồn tại, đăng nhập lại sau hết phiên | Cả hai tài khoản vào được; trường hợp sai có thông báo lỗi. |
| Đăng xuất | Đăng xuất cả user và admin | Về login; token bị xóa khỏi localStorage của phiên tương ứng. |
| Đăng ký `/signup` | Bước 1, validation username ngắn; chuyển sang bước 2 bằng thông tin thử | Validation username hoạt động. Chưa đăng ký tài khoản mới hoặc xác thực OTP. |
| Quên/đổi mật khẩu | Mở form quên mật khẩu và form đổi mật khẩu trong hồ sơ; kiểm tra cách đóng | Chưa gửi/nhận OTP và chưa đổi mật khẩu. Ghi nhận vấn đề Escape ở modal đổi mật khẩu. |
| Catalog `/catalog` | Tìm `parabol` từ header, từ khóa không có kết quả, lọc danh mục, sắp giá tăng, xem đánh giá, thêm giỏ, mở tùy biến | Các thao tác tìm/lọc/đọc đánh giá đã chạy được; có lỗi UX sản phẩm và giá hiển thị. |
| Catalog preview `/catalog-preview` | Đã mở trong đợt audit đầu; chủ website xác nhận đây là prototype mock data | Loại khỏi danh sách lỗi production. File TSX đã xóa local; URL cũ chuyển về catalog chính khi triển khai thay đổi. |
| Dashboard user `/dashboard` | Tải dữ liệu tài khoản và thống kê | Trang tải được; chưa đối soát toàn bộ phép tính thống kê. |
| Studio `/custom` | Tên thiết kế, lưu/mở bản lưu, chữ tiếng Việt, nhân bản lớp, undo/redo, thư viện thước, đổi sang ê-ke 45° giữ nội dung, icon, tìm icon, vẽ/undo/redo/xóa nét, góc nhìn, mặt trước/sau, panel biển tên, đổi ngôn ngữ | Các thao tác đã thử hoạt động; có lỗi nhập JSON và bản dịch chưa đầy đủ. Chỉ kiểm tra mẫu đại diện, chưa duyệt đủ 74 mẫu hoặc mọi tổ hợp hình học. |
| Giá Studio | Đổi thước thẳng 20cm PLA sang 30cm PETG, infill 50%; mở mẫu cần báo giá | Giá hiển thị thay đổi từ 65.000đ sang 93.000đ; ê-ke chuyển sang cần báo giá. Chưa xác minh giá thu thực tế. |
| Xuất thiết kế | Tải JSON, PNG, GLB, STL, ZIP và đọc cấu trúc file | Cả 5 loại tải được. ZIP kiểm tra CRC không lỗi; STL/GLB đúng cấu trúc cơ bản. JSON không nhập lại được. Chưa kiểm tra độ chính xác sản xuất hay in vật lý. |
| Nhập thiết kế | Nhập JSON sai cú pháp và chính JSON vừa xuất | JSON sai được báo lỗi; JSON vừa xuất cũng bị từ chối, là lỗi P1. |
| Gửi tệp `/custom`, tab Gửi tệp | Chặn khách chưa login; thử chọn TXT/STL 21MB; đợt 2 upload STL hợp lệ 1.548.084 byte và tạo một yêu cầu QA | Upload và tạo yêu cầu trả 200; file tải lại khớp SHA-256 file gốc. Có thiếu validation sớm và tên file tải xuống mất đuôi STL. |
| Yêu cầu của tôi / `/quotations` | Xem yêu cầu, bộ lọc, mở tải STL; đợt 2 nhận báo giá QA 35.000đ rồi hủy | Nhận báo giá và hủy thành công; bản ghi QA cuối cùng CANCELLED. Một bản ghi cũ mở PNG. Chưa chấp nhận đặt in hoặc thanh toán Custom. |
| Giỏ hàng `/cart` và drawer | Thêm/tăng/giảm/xóa; đợt 2 xác nhận đặt đơn PayOS 79.000đ, thử lại một lần sau khi xác nhận lần đầu không tạo đơn | Checkout trả 500 cả hai lần; không có checkout/order mới; tồn kho vẫn 48 và giỏ đã dọn rỗng. COD chưa thử tạo đơn. |
| Theo dõi `/orders` | Xem đơn và bộ lọc đang xử lý | Ba đơn EXPIRED vẫn ở nhóm đang xử lý. |
| Lịch sử `/order-history` | Mở trang và xem các nhóm lịch sử | User hiện có 0 đơn hoàn tất/hủy ở trang này; không đủ điều kiện thử đánh giá sau mua hoặc in lại. |
| Hội viên `/subscriptions` | Đọc gói/xu/lịch sử; đợt 2 tạo mua Student Pro 49.000đ, vào PayOS, xác nhận hủy, đối chiếu API | Tạo purchase 201, tạo link 200, PayOS hiển thị đúng 49.000đ. Đã hủy thanh toán nhưng purchase còn PENDING. User vẫn 0 xu, không có gói active. Chưa đổi xu hoặc tặng gói. |
| Hồ sơ `/profile` | Xem thông tin, mở chỉnh sửa rồi hủy, mở đổi mật khẩu | Có trường đại học hiển thị dù dữ liệu API là null. Chưa lưu thay đổi hồ sơ. |
| Địa chỉ `/addresses` | Thêm địa chỉ QA với phone `abc`, xóa địa chỉ QA, đổi mặc định giữa địa chỉ sẵn có rồi khôi phục | Tạo/xóa/đặt mặc định chạy được; phone không hợp lệ vẫn được lưu; giỏ bị stale khi chuyển trang. |
| Bảo hành `/warranty` | Xem form, danh sách và điều kiện chọn đơn hoàn tất | User chưa có đơn COMPLETED; chưa gửi hoặc giải quyết yêu cầu bảo hành. |
| Khiếu nại `/disputes` | Mở form user, đọc đơn có thể chọn và danh sách | Trang tải được; chưa gửi hồ sơ thật. |
| Trợ giúp `/help-center` | Tìm kiếm có/không có kết quả, lọc chủ đề, bấm CTA Studio | Tìm/lọc hoạt động; CTA Studio sai đường dẫn. |
| Thông báo | Mở danh sách thông báo | Đọc được; timestamp và một số trạng thái còn thô. Chưa đánh dấu tất cả đã đọc để giữ dữ liệu ban đầu. |
| Kết quả thanh toán `/payment-result` | Đợt 1 thử view; đợt 2 quay về từ thao tác hủy thật trên PayOS cho giao dịch mua gói QA | Return URL có CANCELLED và mã giao dịch thật; API verify xác nhận CANCELLED. Chưa kiểm tra thanh toán thành công/webhook PAID. |
| Admin `/admin/dashboard` | Đọc dashboard và liên kết | Có số liệu không đồng nhất về yêu cầu chờ báo giá. |
| Admin `/admin/users` | Đọc danh sách và giao diện desktop/mobile | Chưa khóa tài khoản hoặc thay đổi vai trò thật. |
| Admin `/admin/products` | Đọc danh sách, tìm tên, tìm SKU, mở form tạo, submit rỗng kiểm tra required/min, hủy | Tìm tên chạy được; tìm SKU hiển thị không ra kết quả. Chưa tạo/sửa/ẩn sản phẩm thật hoặc upload ảnh sản phẩm. |
| Admin `/admin/categories` | Tạo danh mục QA, thử sửa, thử xóa | Tạo thành công; PUT và DELETE trả 404. Bản ghi QA còn tồn. |
| Admin `/admin/custom-orders` | Đọc/lọc; đợt 2 gửi báo giá 35.000đ cho yêu cầu QA, rồi thử sửa báo giá sau khi user hủy | Báo giá thành công. UI vẫn cho mở/sửa sau hủy nhưng backend trả 400, bản ghi giữ CANCELLED; không sửa báo giá của khách hiện có. |
| Admin `/admin/orders` | Đọc đơn Marketplace/Custom và các nhóm lọc | Trang tải được; chưa chuyển sản xuất, giao hàng, hoàn tất hoặc hủy đơn thật. |
| Admin `/admin/finance` | Đọc số liệu và nhật ký | API đọc trả 200. Chưa đối soát với ngân hàng/PayOS. Chưa coi chênh lệch GMV và doanh thu dashboard là lỗi vì tiêu chí có thể khác nhau. |
| Admin `/admin/subscriptions` | Đọc gói, mở form tạo rồi hủy; thử tặng khi chưa chọn người nhận | Có cảnh báo yêu cầu chọn người nhận. Chưa lưu gói, dừng gói hoặc thực sự tặng gói. |
| Admin `/admin/disputes` | Đọc hồ sơ và mở phần trao đổi | Phần trao đổi mở được; không gửi tin nhắn, giải quyết hoặc từ chối hồ sơ của khách thật. |
| Admin `/admin/settings` | Tải, tải lại, đối chiếu API với giá trị form | GET trả 200 với `result: {}`; form đang hiển thị giá trị mặc định. Chưa lưu cấu hình toàn hệ thống. |
| Tìm kiếm nhanh admin | Mở command palette, tìm “tài chính”, Enter | Điều hướng đúng `/admin/finance`. |
| Phân quyền | Khách mở orders; user mở admin/users; GET các API admin bằng user | UI chặn đúng. Các API thực tế dashboard/users/finance summary/orders/settings trả 403 cho user. Không thực hiện pentest chuyên sâu. |
| Responsive | Trang chủ/catalog/cart/studio/địa chỉ trên 390px; dashboard/users/settings admin trên 390px; cart 320px | Không thấy tràn ngang toàn document trên các màn hình đã đo; menu mobile hoạt động, admin/users đổi sang dạng thẻ. Chưa xác nhận mọi modal, thiết bị và trình duyệt. |

## 4. Danh sách phát hiện

### F01 — P1 — JSON xuất ra không nhập lại được

**Loại:** lỗi chức năng. **Trang:** `/custom`.

**Tái hiện:** tạo/lưu thiết kế → Xuất file thiết kế → Tải dữ liệu gốc (.JSON) → dùng Nhập thiết kế đã lưu để chọn chính file đó.

**Thực tế:** file hợp lệ, kích thước 1.333 byte, chứa `"version": 2`; giao diện báo “Không thể nhập tệp. Chọn JSON thiết kế PrintHub phiên bản 1 nhỏ hơn 2 MB.” Đã thử lại và vẫn bị từ chối.

**Mong đợi:** file xuất từ phiên bản website hiện tại phải nhập lại được, giữ tên, kiểu thước, các lớp và thông số. Lỗi này làm hỏng luồng sao lưu/chia sẻ thiết kế qua file.

**Hướng sửa:** bộ nhập chấp nhận các phiên bản mà bộ xuất đang tạo; chuẩn hóa qua migration và báo rõ phiên bản không hỗ trợ. Kiểm tra vòng xuất → nhập với chữ tiếng Việt, nhiều lớp và mẫu thước khác nhau.

**Bằng chứng:** [thông báo nhập lại thất bại](../output/qa-2026-11-02/screenshots/89-exported-json-reimport.png), [file JSON đã xuất](../output/qa-2026-11-02/downloads/QA_AUDIT_20261102-Thiet-Ke.json). Đối chiếu local: `RulerStudio.tsx` kiểm tra `raw.version !== 1`.

### F02 — P1 — Nút tải STL mở ảnh PNG

**Loại:** lỗi chức năng/định dạng tài liệu. **Trang:** `/quotations`.

**Tái hiện:** user → Báo giá → yêu cầu `#6d72f597…` đã thanh toán → bấm “Tải file 3D (.STL)”.

**Thực tế:** tab mới mở URL Cloudinary `/image/upload/…/dswpssw9elxb6ib0tjuv.png`; trình duyệt nhận ảnh 1019 × 525. Không phải STL. Xác nhận trên bản ghi hiện có; chưa khẳng định mọi yêu cầu đều bị ảnh hưởng.

**Mong đợi:** tải đúng dữ liệu hình học; ảnh preview có nút riêng. Nếu chưa có file sản xuất phải ghi rõ, không gắn nhãn STL.

**Hướng sửa:** tách `previewImageUrl` và file sản xuất, lưu đúng file từ bộ xuất/upload raw; kiểm tra loại tài nguyên trước khi render nút tải.

**Bằng chứng:** [trang báo giá](../output/qa-2026-11-02/screenshots/55-quote-stl-action.png), [kết quả thực tế là PNG](../output/qa-2026-11-02/screenshots/56-stl-is-png.png), [snapshot tab đã mở, có URL PNG](../output/qa-2026-11-02/56-stl-is-png.json).

**Bổ sung đợt 2:** file của yêu cầu QA mới upload qua tab Gửi tệp tải về đúng byte STL, SHA-256 khớp file gốc. Vì vậy lỗi PNG được xác nhận ở bản ghi cũ nêu trên, không áp dụng cho mọi đường upload. File mới vẫn gặp lỗi mất đuôi ở F26.

### F03 — P1 — Địa chỉ mặc định mới chưa cập nhật vào giỏ

**Loại:** lỗi đồng bộ trạng thái. **Trang:** `/addresses` → `/cart`.

**Tái hiện:** giữ một sản phẩm trong giỏ → đặt địa chỉ có dòng đường “Main” làm mặc định → chuyển sang Giỏ hàng bằng menu trong ứng dụng, không reload toàn trang.

**Thực tế:** sổ địa chỉ đánh dấu địa chỉ mới là mặc định, nhưng checkout vẫn hiển thị địa chỉ “Nhà văn hóa sinh viên” trước đó.

**Mong đợi:** quy tắc chọn địa chỉ rõ ràng và nhất quán; nếu khách vừa đổi mặc định, giỏ phải cập nhật hoặc xác nhận lại địa chỉ đang chọn trước đặt hàng. Hiện tại có nguy cơ khách đặt về địa chỉ không chủ định. Chưa tạo đơn để chứng minh địa chỉ lưu trong đơn.

**Hướng sửa:** dùng trạng thái/cache địa chỉ chung, làm mới sau mutation đặt mặc định; đồng bộ giữa sổ địa chỉ, hồ sơ, drawer và checkout.

**Bằng chứng:** [địa chỉ mặc định đã đổi](../output/qa-2026-11-02/screenshots/61-address-default-changed.png), [giỏ vẫn dùng địa chỉ cũ](../output/qa-2026-11-02/screenshots/62-cart-stale-default-address.png). Đã khôi phục địa chỉ mặc định ban đầu.

### F04 — P1 — Phí vận chuyển trong drawer và checkout không khớp

**Loại:** lỗi hiển thị chi phí. **Trang:** drawer Giỏ hàng và `/cart`.

**Tái hiện:** thêm một Thước Kẹp Mini giá 49.000đ → xem drawer → sang trang giỏ.

**Thực tế:** drawer báo ship 0đ, còn `/cart` báo ship 30.000đ và tổng 79.000đ cho cùng sản phẩm/địa chỉ. Với 2 chiếc, trang giỏ báo tiền hàng 98.000đ và tổng 128.000đ. Không có giải thích thay đổi mức phí.

**Mong đợi:** mọi nơi dùng cùng phép tính chi phí; hiển thị rõ phí tạm tính nếu chưa chốt. Khách không nên thấy tổng tăng 30.000đ sau khi bấm tiếp tục.

**Hướng sửa:** lấy cùng bảng tổng tiền/quote vận chuyển từ backend hoặc một nguồn tính thống nhất. Form admin hiện hiển thị mặc định 15.000đ, nhưng API cài đặt trả `{}`; chưa có bằng chứng đây là mức phí đã lưu, và không dùng con số 15.000đ để khẳng định server tính sai.

**Bằng chứng:** [drawer, một chiếc](../output/qa-2026-11-02/screenshots/39-cart-drawer.png), [trang giỏ, một chiếc](../output/qa-2026-11-02/screenshots/90-cart-one-quantity.png), [trang giỏ, hai chiếc](../output/qa-2026-11-02/screenshots/40-cart-page.png). Đợt 2 không tạo được giao dịch Marketplace vì checkout lỗi 500, nên chưa đối chiếu được số tiền PayOS của luồng này.

### F05 — P1 — Admin không sửa/xóa được danh mục

**Loại:** lỗi chức năng/API. **Trang:** `/admin/categories`.

**Tái hiện:** tạo danh mục `QA AUDIT 20261102` → sửa tên thành `QA AUDIT 20261102 EDITED` → cập nhật; sau đó thử xóa bản ghi QA.

**Thực tế:** tạo trả 200 và cấp ID `5`; `PUT /api/categories/5` và `DELETE /api/categories/5` trả **404**, chi tiết `No static resource api/categories/5.` Sửa được thử lại và vẫn lỗi. UI chỉ báo lỗi chung.

**Mong đợi:** các hành động được cung cấp trong giao diện phải có endpoint tương ứng; xóa danh mục đang được sử dụng cần lỗi nghiệp vụ rõ ràng, không phải 404 do thiếu route.

**Hướng sửa:** bổ sung/đồng bộ contract PUT và DELETE, kiểm tra quyền admin và ràng buộc sản phẩm. Local `CategoryController` hiện chỉ có GET và POST, phù hợp hiện tượng quan sát được.

**Bằng chứng:** [sửa thất bại](../output/qa-2026-11-02/screenshots/36-category-edit-404.png), [xóa vẫn còn bản ghi](../output/qa-2026-11-02/screenshots/37-category-delete-result.png), [network log](../output/qa-2026-11-02/network-log.json). **Bản ghi QA ID 5 còn tồn**, cần dọn sau khi có cơ chế xóa đúng.

### F06 — P2 — Đơn EXPIRED bị xếp vào nhóm đang xử lý

**Loại:** lỗi phân loại trạng thái. **Trang:** `/orders`, `/order-history`.

**Tái hiện:** user mở Theo dõi tiến độ. Ba đơn `#fe4de050…`, `#d3c17619…`, `#cf975374…` đã EXPIRED vẫn nằm trong “Tất Cả Đang Xử Lý (3)”. Lịch sử lại là 0.

**Tác động:** khách tưởng đơn còn chạy, không biết cần đặt lại. Timeline vẫn trình bày các bước gia công thay vì giải thích hết hạn thanh toán.

**Hướng sửa:** xác định EXPIRED là trạng thái kết thúc, có nhãn tiếng Việt và thông tin giải phóng tồn kho; chuyển sang lịch sử hoặc nhóm “Hết hạn”.

**Bằng chứng:** [đơn đang xử lý](../output/qa-2026-11-02/screenshots/11-user-orders.png), [lịch sử](../output/qa-2026-11-02/screenshots/12-user-history.png).

### F07 — P2 — Theo dõi đơn Custom bị tách khỏi trang theo dõi chung mà thiếu hướng dẫn

**Loại:** UX/khả năng tìm thấy tác vụ. **Trang:** `/orders` và `/quotations`.

**Thực tế:** yêu cầu Custom `#6d72f597…` hiển thị “Đã thanh toán” trong Báo giá, nhưng không có trong trang “Theo dõi tiến độ in 3D” của user; trang này chỉ có ba đơn Marketplace hết hạn.

**Tác động:** sau khi trả tiền Custom, khách có thể mở trang theo dõi chung và tưởng đơn không còn. Dữ liệu vẫn tồn tại trong Báo giá; **chưa có bằng chứng mất đơn**.

**Hướng sửa:** hợp nhất theo dõi Marketplace/Custom hoặc thêm tab và liên kết rõ “Đơn in Custom xem tại Báo giá”. Thống kê/dashboard cũng cần nói rõ phạm vi.

**Bằng chứng:** [orders](../output/qa-2026-11-02/11-user-orders.json), [quotations](../output/qa-2026-11-02/13-user-quotes.json).

### F08 — P2 — Yêu cầu Custom đã hủy vẫn mở được form báo giá

**Loại:** lỗi điều kiện giao diện. **Trang:** `/admin/custom-orders`.

**Thực tế:** các yêu cầu `#ef63ad7f…` và `#583d5e77…` đã hủy ở phía user vẫn có nút “GỬI BÁO GIÁ NGAY” phía admin. Bấm nút mở được form nhập giá.

**Tác động:** admin dễ gửi lại báo giá nhầm hoặc gặp lỗi sau khi nhập công. Ở đợt 1 chưa bấm xác nhận trên các yêu cầu cũ; đợt 2 chỉ thử submit trên bản ghi QA mới, kết quả backend chặn được nêu bên dưới. Không có bằng chứng backend cho phép hồi sinh đơn đã hủy.

**Hướng sửa:** hiển thị rõ trạng thái đã hủy, khóa hành động không hợp lệ; đồng bộ `allowedActions` giữa API và UI, kiểm tra lại trên server.

**Bằng chứng:** [form báo giá của yêu cầu đã hủy](../output/qa-2026-11-02/screenshots/57-cancelled-custom-quote-form.png), [trạng thái phía user](../output/qa-2026-11-02/13-user-quotes.json).

**Bổ sung đợt 2:** đã thử trên chính yêu cầu QA `#9bd51575…` sau khi hủy. UI còn nút Sửa báo giá; submit bị backend từ chối HTTP 400, trạng thái cuối vẫn CANCELLED. Backend có chặn, nhưng thông điệp nói “yêu cầu đã được chấp nhận” dù thực tế đã hủy; UI lại báo lỗi chung “Vui lòng thử lại”. Không thực hiện submit trên các yêu cầu cũ của khách. [Kết quả kiểm tra guard](../output/qa-2026-11-02/round2/cancelled-quote-guard.json), [ảnh lỗi](../output/qa-2026-11-02/round2/screenshots/r2-15-cancelled-quote-rejected.png).

### F09 — P2 — Số yêu cầu chờ trên dashboard/menu/admin list mâu thuẫn

**Loại:** lỗi thống kê/trình bày. **Trang:** dashboard admin, sidebar, danh sách Custom.

**Thực tế:** dashboard báo “4 chờ duyệt / 4 yêu cầu đang chờ”; sidebar báo “1 chờ”; danh sách Custom có tổng 4 nhưng “CHỜ BÁO GIÁ (0)”. Dữ liệu quan sát có một đã báo giá, một đã thanh toán và hai đã hủy.

**Tác động:** admin không thể dựa vào dashboard để ưu tiên công việc.

**Hướng sửa:** tính theo cùng tập trạng thái cần xử lý; dùng tên chỉ số phản ánh đúng dữ liệu thay vì lấy tổng mọi yêu cầu làm số đang chờ.

**Bằng chứng:** [dashboard](../output/qa-2026-11-02/screenshots/09-admin-dashboard.png), [danh sách Custom](../output/qa-2026-11-02/screenshots/23-admin-custom.png).

### F10 — P2 — Lưu được số điện thoại `abc` trong sổ địa chỉ

**Loại:** lỗi validation đã xác nhận cả client và server. **Trang:** `/addresses`.

**Tái hiện:** thêm địa chỉ QA với thông tin bắt buộc đã điền; nhập phone `abc`; Lưu địa chỉ.

**Thực tế:** POST `/api/addresses` trả 200, thông báo thành công, lưu `phone: "abc"`, cấp ID `8`.

**Tác động:** địa chỉ có thể không dùng được để giao hàng/liên hệ; không nên đẩy lỗi sang bước đặt đơn hoặc đơn vị vận chuyển.

**Hướng sửa:** cùng quy tắc chuẩn hóa/kiểm tra số điện thoại ở frontend và backend; lỗi gắn với trường nhập. Kiểm thử chữ, thiếu số, khoảng trắng, số nội địa và dạng `+84` theo chính sách hỗ trợ.

**Bằng chứng:** [địa chỉ phone abc](../output/qa-2026-11-02/screenshots/34-address-invalid-phone.png), [network log](../output/qa-2026-11-02/network-log.json). Địa chỉ QA đã xóa thành công.

### F11 — P2 — CTA Studio trong trang hỗ trợ dẫn về trang chủ

**Loại:** lỗi điều hướng. **Trang:** `/help-center`.

**Tái hiện:** bấm “Mở 3D Slicer Studio”. Liên kết trỏ tới `/custom-order`, trong khi Studio thực tế ở `/custom`. Website chuyển sang `/`.

**Tác động:** khách đang tìm công cụ thiết kế bị đưa khỏi tác vụ mà không biết lý do.

**Hướng sửa:** dùng route `/custom` và kiểm tra các CTA nội bộ sau khi thay đổi router.

**Bằng chứng:** [link trong snapshot trang hỗ trợ](../output/qa-2026-11-02/04-help.json), [trang đích thực tế](../output/qa-2026-11-02/screenshots/28-help-studio-wrong-route.png).

### F12 — P2 — Nút “Tùy biến” không giữ ngữ cảnh sản phẩm

**Loại:** UX/luồng sản phẩm. **Trang:** `/catalog` → `/custom`.

**Thực tế:** bấm Tùy biến trên Thước Kẹp Mini Vernier Caliper 49.000đ mở Studio thước thẳng mặc định 20cm, giá 65.000đ. Liên kết chỉ là `/custom`, không mang sản phẩm hoặc mẫu đã chọn.

**Tác động:** khách kỳ vọng tùy biến chính thước đang xem nhưng nhận sản phẩm khác, giá khác; dễ thêm nhầm hoặc bỏ mua.

**Hướng sửa:** truyền model/sản phẩm tương ứng và mô tả rõ quy tắc giá. Nếu chỉ dẫn đến công cụ thiết kế độc lập, đổi nhãn thành “Tự thiết kế mẫu khác”.

**Bằng chứng:** [catalog](../output/qa-2026-11-02/screenshots/02-guest-catalog.png), [Studio sau khi đi từ catalog](../output/qa-2026-11-02/screenshots/38-studio-text.png).

### F13 — P2 — Chọn file sai loại/quá 20MB chưa có cảnh báo sớm

**Loại:** lỗi validation/UX phía client. **Trang:** `/custom`, tab Gửi tệp.

**Thực tế:** giao diện ghi STL/OBJ/STEP, tối đa 20MB, nhưng khi chọn TXT hoặc STL 21MB vẫn đưa vào danh sách như file bình thường, không có thông báo vượt giới hạn.

**Giới hạn kết luận:** chưa submit hai file TXT/21MB không hợp lệ lên server; chưa khẳng định backend chấp nhận file sai hay có lỗ hổng upload. Đợt 2 chỉ upload một STL hợp lệ khoảng 1,55MB. Kiểm tra `.txt` dùng khả năng chọn file ngoài bộ lọc của công cụ kiểm thử; `accept` của input chỉ là bộ lọc chọn file, không thay validation nghiệp vụ.

**Hướng sửa:** kiểm tra extension và dung lượng ngay khi chọn/kéo thả; gỡ file không hợp lệ, báo lý do cụ thể. Backend vẫn phải kiểm tra độc lập.

**Bằng chứng:** [file TXT](../output/qa-2026-11-02/screenshots/59-upload-invalid-extension.png), [file 21MB](../output/qa-2026-11-02/screenshots/60-upload-oversize.png).

### F14 — P2 — Hồ sơ tự hiển thị trường đại học khi API chưa có dữ liệu

**Loại:** lỗi trình bày dữ liệu/UX. **Trang:** `/profile`.

**Thực tế:** API profile trả `university: null`, `studentId: null`; UI vẫn hiển thị “Đại Học Quốc Gia TP.HCM” và nội dung ưu đãi/giao nhận gắn với trường này.

**Tác động:** người dùng có thể tưởng trường và điều kiện ưu đãi đã được xác nhận; mở chỉnh sửa còn có sẵn giá trị trường chưa do họ nhập.

**Hướng sửa:** dữ liệu rỗng hiển thị “Chưa cập nhật”; trường gợi ý đặt trong placeholder; quyền lợi cần dựa trên điều kiện được xác thực.

**Bằng chứng:** [hồ sơ](../output/qa-2026-11-02/screenshots/17-user-profile.png), [kết quả đối chiếu API đã rút gọn](../output/qa-2026-11-02/verified-details.json).

### F15 — P2 — Hotline/email hỗ trợ không có nguồn thống nhất

**Loại:** UX/nội dung vận hành. **Trang:** footer, help center, admin settings.

**Thực tế:** footer dùng hotline `0786954657`, email `support@inbound.printhub3d.vn`; Help Center ghi `0987.654.321`; form admin hiển thị `0987654321`, `support@printhub3d.com`. Footer ghi hỗ trợ 8h–22h, trong khi Help Center quảng bá CSKH 24/7.

**Lưu ý:** GET cài đặt trả `result: {}`, nên giá trị form admin hiện là mặc định; chưa chứng minh đây là cấu hình đã lưu hoặc một lần cập nhật đã không truyền sang storefront.

**Tác động:** khách không biết kênh nào đúng và thời gian nào có người hỗ trợ.

**Hướng sửa:** xác nhận đầu mối thực tế, dùng một nguồn cấu hình và hiển thị trạng thái “chưa cấu hình/chưa lưu” thay vì trình bày giá trị mẫu như dữ liệu vận hành.

**Bằng chứng:** [Help Center](../output/qa-2026-11-02/04-help.json), [giá trị/API settings](../output/qa-2026-11-02/verified-details.json).

### F16 — P2 — Catalog đang có ảnh và mô tả không phù hợp với sản phẩm

**Loại:** chất lượng nội dung/UX bán hàng. **Trang:** `/catalog`.

**Thực tế:** thước kẹp dùng ảnh người trong phòng thí nghiệm; thước kiếm dùng hình nền màu trừu tượng; một số ảnh không mô tả thước. Hai sản phẩm có mô tả chỉ là chuỗi số `18578`, `18576`; có thẻ thiếu ảnh rõ ràng.

**Tác động:** khách khó đánh giá hình dáng/kích thước/chất lượng và giảm tin tưởng vào khả năng giao đúng sản phẩm. Chưa kết luận mọi ảnh trống là lỗi HTTP; có thể do dữ liệu ảnh chưa được nhập.

**Hướng sửa:** dùng ảnh sản phẩm thật, góc nhìn nhất quán, ảnh cận vạch chia và mẫu khắc tên; loại nội dung thử khỏi catalog công khai.

**Bằng chứng:** [catalog desktop](../output/qa-2026-11-02/screenshots/02-guest-catalog.png), [nội dung đầy đủ catalog](../output/qa-2026-11-02/02-guest-catalog.json).

### F17 — P2 — Chính sách bảo mật/điều khoản còn “Sắp ra mắt”

**Loại:** mức độ hoàn thiện UX/nội dung, chưa phải kết luận vi phạm pháp luật.

**Thực tế:** footer giới thiệu Chính sách bảo mật, Điều khoản dịch vụ và Về PrintHub dưới trạng thái sắp ra mắt; không có nội dung tương ứng để đọc trước khi đăng ký/đặt hàng.

**Tác động:** khách đang cung cấp thông tin liên hệ, địa chỉ và tệp thiết kế không có chỗ rõ ràng để hiểu cách sử dụng dữ liệu, đổi trả hoặc trách nhiệm dịch vụ.

**Hướng sửa:** hoàn thiện các trang chính sách, liên kết từ đăng ký/checkout và ghi ngày áp dụng. Nội dung cần được chủ website xác nhận theo hoạt động thực tế.

**Bằng chứng:** [footer trang chủ](../output/qa-2026-11-02/01-guest-home.json).

### F18 — P2 — Tìm theo SKU đã hiển thị không tìm được sản phẩm

**Loại:** lỗi tìm kiếm/định danh UX. **Trang:** `/admin/products`.

**Tái hiện:** nhiều sản phẩm đang hiển thị `SKU: #c0000001` → nhập `c0000001` vào ô có hướng dẫn tìm theo tên hoặc mã SKU → Enter.

**Thực tế:** trả 0 sản phẩm, trong khi tìm `parabol` tìm được sản phẩm. Ngoài ra, đoạn ID rút gọn khiến nhiều SKU trên màn hình giống nhau.

**Tác động:** admin không tra cứu được theo thông tin mà chính giao diện cung cấp, khó phân biệt các bản ghi.

**Hướng sửa:** dùng mã SKU riêng/đoạn định danh đủ duy nhất, cho sao chép ID đầy đủ, thống nhất hợp đồng tìm kiếm với placeholder. Nếu không hỗ trợ tìm SKU phải sửa hướng dẫn.

**Bằng chứng:** [danh sách có SKU trùng](../output/qa-2026-11-02/20-admin-products.json), [tìm theo tên](../output/qa-2026-11-02/screenshots/78-admin-product-search.png), [tìm SKU rỗng](../output/qa-2026-11-02/screenshots/79-admin-sku-search-empty.png).

### F19 — P2 — Nhãn form sản phẩm admin chưa gắn với input/select

**Loại:** khả năng tiếp cận. **Trang:** `/admin/products`, form thêm sản phẩm.

**Thực tế qua DOM:** các trường tên, danh mục, loại sản phẩm, giá, tồn kho và URL ảnh có `labels: []`, không có `aria-label`; nhiều trường chỉ có placeholder. Danh mục và loại sản phẩm không có placeholder thay thế ý nghĩa nhãn.

**Tác động:** người dùng trình đọc màn hình khó biết đang chỉnh trường nào; bấm nhãn không đưa focus vào trường như mong đợi.

**Hướng sửa:** gắn `label htmlFor` với `id` hoặc bọc control đúng cách; bổ sung hướng dẫn/lỗi bằng `aria-describedby`. Kiểm tra keyboard và screen reader sau sửa.

**Bằng chứng:** [form admin](../output/qa-2026-11-02/screenshots/77-admin-form-accessibility.png). Đây là kiểm tra DOM/khả năng truy cập bằng bộ kiểm thử, chưa chạy một phiên NVDA hoặc JAWS thực tế.

### F20 — P3 — Giá gạch ngang bằng giá bán

**Loại:** UX giá. **Trang:** `/catalog`.

**Thực tế:** nhiều sản phẩm đồng thời hiển thị giá cũ gạch ngang và giá hiện tại giống nhau, ví dụ 49.000đ / 49.000đ, 46.000đ / 46.000đ.

**Tác động:** tạo cảm giác đang giảm giá nhưng không có giảm thực tế, gây nhiễu khi so sánh.

**Hướng sửa:** chỉ render giá gạch ngang khi giá gốc lớn hơn giá bán; nếu bằng nhau chỉ hiển thị một giá.

**Bằng chứng:** [catalog](../output/qa-2026-11-02/screenshots/02-guest-catalog.png).

### F21 — P3 — Đổi ngôn ngữ Studio chưa đầy đủ

**Loại:** nội dung/localization. **Trang:** `/custom`.

**Thực tế:** chọn English đổi được phần lớn panel, nhưng các nút “Xuất file thiết kế”, “Thiết kế màu”, “Bản in 3D (Solid)” và hướng dẫn kéo chuột vẫn còn tiếng Việt. Chế độ tiếng Việt cũng còn nhiều mô tả mẫu tiếng Anh.

**Tác động:** hành động quan trọng không đồng nhất với lựa chọn ngôn ngữ, gây khó hiểu cho người không đọc tiếng Việt.

**Hướng sửa:** gom toàn bộ nhãn/hướng dẫn/lỗi vào cùng hệ thống dịch; kiểm tra cả modal xuất, thư viện và các trạng thái lỗi.

**Bằng chứng:** [Studio English](../output/qa-2026-11-02/screenshots/75-studio-english.png).

### F22 — P3 — Thông báo hiển thị timestamp ISO và trạng thái kỹ thuật

**Loại:** UX thông báo. **Trang:** menu Thông báo và một số trang đơn hàng/tài chính.

**Thực tế:** thông báo hiển thị nguyên chuỗi như `2026-11-01T01:07:14.362229Z`; nội dung có `CANCELLED`, `EXPIRED`, `PENDING` trong khi phần lớn ứng dụng là tiếng Việt.

**Tác động:** khách phải tự đổi múi giờ và diễn giải mã trạng thái; khó biết sự kiện xảy ra lúc nào.

**Hướng sửa:** định dạng theo múi giờ/ngôn ngữ người dùng, ưu tiên thời gian tương đối kèm thời gian cụ thể; map trạng thái sang ngôn ngữ nghiệp vụ.

**Bằng chứng:** [thông báo](../output/qa-2026-11-02/screenshots/54-notifications.png), [đơn hàng](../output/qa-2026-11-02/11-user-orders.json).

### F23 — P3 — Một số modal chưa nhất quán về Escape và semantics

**Loại:** khả năng sử dụng bằng bàn phím. **Trang:** form sản phẩm admin và modal đổi mật khẩu.

**Thực tế:** nhấn Escape không đóng form thêm sản phẩm; form đang mở nhưng không có phần tử `role=dialog`. Modal đổi mật khẩu có `role=dialog`, nhưng Escape cũng không đóng trong lần thử. Không phải mọi modal đều như vậy: thư viện thước dùng dialog riêng.

**Tác động:** cách thoát không nhất quán; người dùng bàn phím hoặc trình đọc màn hình khó nhận biết phạm vi modal.

**Hướng sửa:** thống nhất component modal với nhãn truy cập được, focus vào nội dung, giữ focus trong modal, Escape để đóng khi phù hợp và trả focus về nút mở. Chưa khẳng định đã kiểm tra đầy đủ focus trap của mọi modal.

**Bằng chứng:** [form sản phẩm sau Escape](../output/qa-2026-11-02/screenshots/77-admin-form-accessibility.png), [đổi mật khẩu](../output/qa-2026-11-02/screenshots/44-password-form.png).

### F24 — Đã rút khỏi danh sách lỗi — Trang catalog-preview là prototype

Chủ website xác nhận trang này chỉ phục vụ prototype và chủ đích dùng mock data. Không yêu cầu bổ sung trình xem 3D hoặc sửa dữ liệu của trang prototype. Đã xóa `CatalogPreviewPage.tsx`, bỏ liên kết menu prototype và giữ redirect từ URL cũ về `/catalog`. Thay đổi này mới ở local, chưa deploy. Ảnh audit cũ được giữ để truy vết, không tính F24 vào tổng lỗi hay backlog sửa production.

### F25 — P1 — Checkout Marketplace PayOS 79.000đ trả lỗi HTTP 500

**Loại:** lỗi chức năng chặn đặt hàng. **Trang:** `/cart`. **Xác nhận ở đợt 2 sau khi được phép tạo đơn thử.**

**Tái hiện:** đăng nhập user → thêm một Thước Kẹp Mini Vernier Caliper, ID `c0000001-0000-0000-0000-000000000010`, giá 49.000đ, còn 48 → chọn địa chỉ hợp lệ có sẵn → PayOS → xác nhận đặt hàng. Tổng UI là 79.000đ, gồm 30.000đ vận chuyển.

**Thực tế:** `POST /api/checkout-orders` trả HTTP **500**, `code: 5000`, `errorKey: common.unexpected_error`, `message: Unexpected error`. Sau khi kiểm tra không có đơn mới, reload và thử lại một lần vẫn 500. Request có `selectedLineIds`, `shippingMode: COMMON`, địa chỉ/người nhận/số điện thoại và `paymentMethod: PAYOS`.

**Đối chiếu dữ liệu:** sau hai lần lỗi, danh sách checkout/order không có bản ghi mới trong thời gian audit; stock vẫn 48; dòng hàng vẫn trong giỏ trước khi được dọn. Không có mã PayOS Marketplace để tiếp tục thanh toán/hủy.

**Tác động:** người dùng không đặt mua được ở tình huống đã thử. Chỉ xác nhận cho sản phẩm, tài khoản và phương thức này; chưa kết luận mọi phương thức/sản phẩm đều lỗi.

**Hướng sửa:** tra server log theo hai timestamp `2026-11-02T00:07:20.997875350Z` và `2026-11-02T00:08:01.406714649Z`, xác định exception/transaction thất bại; kiểm tra tạo checkout, order con, shipping info, giữ kho và PayOS. Chưa có server log nên không kết luận nguyên nhân gốc. UI cần thông báo tiếng Việt và hướng dẫn khôi phục phù hợp.

**Bằng chứng:** [lần đầu](../output/qa-2026-11-02/round2/screenshots/r2-02-checkout-created.png), [thử lại](../output/qa-2026-11-02/round2/screenshots/r2-03-checkout-retry.png), [response/request đã ẩn thông tin người nhận](../output/qa-2026-11-02/round2/checkout-retry.json), [đối chiếu dữ liệu sau lỗi](../output/qa-2026-11-02/round2/after-checkout-error.json).

### F26 — P2 — File STL tải từ yêu cầu in bị mất đuôi `.stl`

**Loại:** lỗi tên file/UX tải tài liệu. **Trang:** tab Gửi tệp và `/quotations`.

**Tái hiện:** upload file `QA_AUDIT_20261102-20cm-3D.stl` hợp lệ → tạo yêu cầu QA → bấm “Tải file 3D (.STL)” trên yêu cầu đó.

**Thực tế:** trình duyệt nhận file tên `file_iukbnl`, không có phần mở rộng. Header trả `Content-Type: application/octet-stream`, `Content-Disposition: attachment; filename="file_iukbnl"`. File có 1.548.084 byte và SHA-256 khớp bản gốc, nên dữ liệu không bị hỏng; vấn đề là tên/định dạng được trình bày khi tải xuống.

**Tác động:** Windows/phần mềm slicer khó nhận diện file, khách hoặc admin phải tự đoán định dạng và đổi tên dù nút đã hứa tải STL.

**Hướng sửa:** giữ tên gốc hoặc cấp tên mới có phần mở rộng đúng; kiểm tra `Content-Disposition`, metadata upload và tên tải ở cả phía khách lẫn admin. Không chỉ đổi nhãn nút.

**Bằng chứng:** [kết quả tải bằng UI](../output/qa-2026-11-02/round2/attachment-ui-download.json), [header và so sánh SHA-256](../output/qa-2026-11-02/round2/custom-final.json), [file trình duyệt tải thực tế](../output/qa-2026-11-02/round2/downloads/file_iukbnl).

### F27 — P2 — Hủy PayOS chưa đồng bộ trạng thái đơn mua hội viên

**Loại:** lỗi đồng bộ trạng thái giao dịch. **Trang:** `/subscriptions`, PayOS, `/payment-result`.

**Tái hiện:** mua Student Pro 49.000đ → xác nhận mở PayOS → Huỷ → Xác nhận hủy → quay lại PrintHub. Không chuyển tiền.

**Thực tế:** purchase `9835ed99-7c84-43b2-a3b9-508d5c7effed` được tạo HTTP 201; cổng PayOS hiển thị đúng 49.000đ. Sau hủy, return URL và API `/payments/verify/3240744489273434` đều báo `CANCELLED`. Tuy vậy GET purchase trước verify, sau verify và lúc kiểm kê cuối đều còn `PENDING`, `settledAt: null`.

**Tác động:** dữ liệu thanh toán và đơn mua gói không cùng trạng thái, gây khó đối soát và để lại đơn chờ không còn khả năng thanh toán theo link vừa hủy. Chưa thấy gói bị kích hoạt sai: tài khoản vẫn 0 xu, `subscriptions: []`.

**Hướng sửa:** khi xác minh/webhook nhận CANCELLED hoặc EXPIRED, cập nhật purchase tương ứng theo cùng giao dịch, bảo đảm idempotency; cung cấp lịch sử và khả năng hủy/thử lại rõ ràng. Trang cancel của mua hội viên cũng nên bỏ gợi ý COD vì luồng mua gói hiện chỉ đưa sang PayOS.

**Tình trạng dọn dữ liệu:** giao dịch PayOS đã hủy; purchase vẫn PENDING là trạng thái lỗi đã nêu. Không thấy chức năng hủy/xóa purchase trong UI/API đã khảo sát nên không can thiệp DB hoặc đoán endpoint để đổi dữ liệu. Cần cập nhật/dọn bản ghi QA này sau khi sửa cơ chế đồng bộ.

**Bằng chứng:** [tạo purchase](../output/qa-2026-11-02/round2/membership-creation.json), [trang quay về sau hủy](../output/qa-2026-11-02/round2/screenshots/r2-12-membership-cancel-return.png), [PayOS verify CANCELLED nhưng purchase PENDING](../output/qa-2026-11-02/round2/membership-after-verify.json), [kiểm kê cuối](../output/qa-2026-11-02/round2/cleanup-results.json).

## 5. Những phần đã hoạt động trong phạm vi thử

- Đăng nhập/đăng xuất, điều hướng lại sau đăng nhập và chặn user vào trang admin hoạt động ở các tình huống đã thử. Guest gọi API admin dashboard nhận 401; user gọi các API admin thực tế nhận 403.
- Phiên hết hạn tự nhiên được vô hiệu, không tiếp tục dùng token cũ để lấy dữ liệu. Đã kiểm tra lại sau đăng nhập để tránh nhầm trạng thái hết phiên thành lỗi tính năng.
- Tìm kiếm sản phẩm theo tên, lọc danh mục, sắp giá tăng, empty state và đọc đánh giá sản phẩm chạy được.
- Giỏ hàng thêm/tăng/giảm/xóa và đồng bộ lại khi tải trang chạy được. Đây chưa phải bằng chứng checkout thành công.
- Các thao tác Studio đã thử ở ma trận chạy được; xuất PNG/GLB/STL/ZIP tạo file, riêng khả năng nhập lại JSON bị lỗi.
- Tạo/xóa địa chỉ và đặt mặc định chạy được ở API; thiếu validation phone và đồng bộ giỏ là vấn đề cần sửa.
- Đợt 2: upload STL hợp lệ, tạo yêu cầu QA, admin báo giá, user nhận báo giá và hủy thành công. Backend từ chối sửa báo giá của yêu cầu QA đã hủy; còn lỗi hiển thị hành động và thông điệp.
- Đợt 2: tạo purchase hội viên, mở PayOS đúng số tiền và hủy giao dịch thành công. Không có quyền hội viên hoặc xu được kích hoạt khi chưa trả tiền; trạng thái purchase chưa đồng bộ theo F27.
- Tìm/lọc FAQ, menu mobile và command palette admin chạy được.
- Không quan sát thấy lỗi JavaScript làm sập toàn ứng dụng trong các luồng đã thử; không suy ra rằng mọi nhánh đều không có lỗi.

### Kiểm tra file xuất

| Định dạng | Kích thước | Kiểm tra đã thực hiện |
| --- | ---: | --- |
| JSON | 1.333 byte | Parse JSON được; version 2; nhập lại trên website thất bại. |
| PNG | 38.359 byte | Có file render tải xuống. |
| GLB | 378.756 byte | Header `glTF`, version 2, độ dài khai báo khớp file. |
| STL | 1.548.084 byte | 30.960 tam giác; độ dài binary khớp `84 + 50 × số tam giác`. |
| ZIP | 1.968.961 byte | CRC không lỗi; có STL, GLB, PNG, JSON và manifest. |

Các kiểm tra trên xác nhận file tải xuống và cấu trúc cơ bản, **không chứng nhận mô hình kín hoàn toàn, dung sai đo lường, độ bền, chất lượng cắt lớp hay khả năng sản xuất ở mọi mẫu**. File thử nằm trong [downloads](../output/qa-2026-11-02/downloads/), kết quả trong [download-results.json](../output/qa-2026-11-02/download-results.json).

## 6. Dữ liệu thử và tình trạng hoàn tác

| Dữ liệu / thao tác | Trạng thái cuối phiên |
| --- | --- |
| Giỏ user ban đầu rỗng, thêm Thước Kẹp Mini trong hai đợt | Đã giảm/xóa về rỗng. Đợt 2 checkout lỗi 500 hai lần; kiểm kê xác nhận không có checkout/order Marketplace mới, tồn kho vẫn 48. |
| Địa chỉ QA `QA AUDIT 20261102`, ID 8, phone `abc` | Đã xóa; số địa chỉ user trở lại 3. |
| Đổi địa chỉ mặc định sang “Main” | Đã khôi phục địa chỉ mặc định ban đầu. |
| Danh mục QA `QA AUDIT 20261102`, ID 5 | **Còn tồn trên production**. Thử sửa/xóa đều 404. Mô tả: `Danh muc kiem thu tam thoi, se xoa ngay.` Không gán sản phẩm vào danh mục này. |
| Các thiết kế, nét vẽ, file xuất QA đợt 1 | Ở phiên trình duyệt tách biệt và thư mục bằng chứng. Đợt 2 dùng một STL đã xuất làm file kiểm thử upload; không đưa vào sản xuất. |
| Yêu cầu Custom QA `9bd51575-9766-4483-855e-6f7f2030dbc2` | Đã báo giá thử 35.000đ rồi hủy; trạng thái cuối **CANCELLED**, không chấp nhận đặt in, không thanh toán. Bản ghi lịch sử và file STL thử trên Cloudinary còn được lưu theo thiết kế hệ thống. |
| Mua gói QA `9835ed99-7c84-43b2-a3b9-508d5c7effed` | PayOS orderCode `3240744489273434` đã **CANCELLED**, không chuyển tiền; purchase trong PrintHub còn **PENDING** do F27. Không có gói active, xu vẫn 0. |
| Sản phẩm, bảng giá, quyền người dùng, gói hội viên, cấu hình toàn hệ thống | Không ghi thay đổi. |
| Đơn hàng, báo giá, bảo hành, tranh chấp có sẵn trước audit | Không thay đổi trạng thái; không gửi tin nhắn/phản hồi. Chỉ báo giá/hủy yêu cầu QA mới của đợt 2; thông báo nghiệp vụ phát sinh trên chính tài khoản được cấp được giữ theo lịch sử. |
| Phiên đăng nhập desktop user/admin | Đã đăng xuất. Các context trình duyệt phục vụ audit được đóng khi kết thúc. |

Chi tiết kiểm kê: [đợt 1](../output/qa-2026-11-02/cleanup-results.json), [đợt 2](../output/qa-2026-11-02/round2/cleanup-results.json). Sau khi sửa API danh mục, cần xóa riêng ID 5 với tên QA nêu trên; không xóa các danh mục có sẵn. Purchase QA cần chuyển trạng thái đúng theo giao dịch đã hủy hoặc dọn bằng quy trình quản trị được hỗ trợ; không chuyển nó sang đã thanh toán.

## 7. Các kiểm tra còn lại và điều kiện để chạy tiếp

Ở đợt 1, hệ thống duyệt tự động đã chặn việc tạo checkout thật vì chưa có xác nhận riêng. Sau đó chủ website đã trả lời **“Cho phép tạo và hủy dữ liệu thử”** cho: một đơn PayOS 79.000đ chưa thanh toán, một yêu cầu in 3D QA và một phiên mua hội viên chưa thanh toán, không chuyển tiền/không đưa vào sản xuất. Phạm vi được chấp thuận đã được tiếp tục thực hiện ở đợt 2 và ghi kết quả tại F25–F27; không còn chờ xác nhận cho những thao tác này.

Đơn Marketplace chưa tạo được do lỗi 500, không phải do còn thiếu quyền kiểm thử. Yêu cầu Custom đã hủy thành công; giao dịch PayOS mua gói đã hủy, nhưng purchase chưa đồng bộ. Việc hủy không đồng nghĩa xóa lịch sử hoặc file đính kèm khỏi hệ thống.

Các nhóm sau chưa đủ bằng chứng để xác nhận end-to-end:

1. **Marketplace:** sửa lỗi 500 rồi kiểm tra tiếp tạo PayOS, số tiền backend/PayOS, hủy/timeout/khôi phục, giữ/trả kho, webhook và chống tạo trùng. COD chưa tạo đơn. Chỉ đã chứng minh hai lần checkout lỗi không để lại đơn mới/tồn kho bị giảm.
2. **Custom:** upload → tạo → báo giá → nhận báo giá → hủy và tính toàn vẹn file đã thử thành công. Còn chấp nhận đặt in, thanh toán và sản xuất chưa thử; giữ giới hạn không đưa đơn QA vào sản xuất.
3. **Hội viên/điểm:** tạo giao dịch mua gói và hủy PayOS đã thử, ghi nhận lỗi đồng bộ purchase. Còn thanh toán thực, kích hoạt/expiry, đổi xu, trừ/cộng/hoàn điểm và thực thi giảm giá/miễn ship; tài khoản có 0 xu nên chưa đủ điều kiện đổi.
4. **OTP:** đăng ký mới, xác thực/resend, quên/đổi mật khẩu thành công và hết hạn OTP; cần quyền truy cập hộp thư thử hoặc môi trường test phù hợp.
5. **Sau bán:** đánh giá sau mua/in lại, gửi và xử lý bảo hành; user hiện không có đơn hoàn tất trong lịch sử. Chưa tạo điều kiện hoàn tất giả trên đơn thật.
6. **Quản trị ghi dữ liệu ngoài phạm vi QA đã thử:** sửa/ẩn sản phẩm, upload ảnh, đổi vai trò/khóa tài khoản, sửa/tặng/ngừng gói hội viên, lưu cấu hình, chuyển sản xuất và xử lý hồ sơ khách. Cần dữ liệu test được cô lập hoặc xác nhận phạm vi thay đổi tương ứng. Không coi việc đã báo giá thành công cho yêu cầu QA là bằng chứng các nghiệp vụ còn lại đều hoạt động.
7. **Độ tin cậy rộng hơn:** tải đồng thời, tốc độ trên mạng yếu/điện thoại thật, Safari/Firefox, kiểm tra bảo mật sâu và kiểm thử in vật lý. Không nằm trong những gì phiên trình duyệt này đã chứng minh.

Không tính các phản hồi 401/403 chủ động tạo ra khi kiểm tra phân quyền là lỗi. Một số yêu cầu GET thăm dò đường dẫn trước khi xác định đúng endpoint trả 404 cũng được loại khỏi danh sách lỗi; lỗi F05 là request xuất phát trực tiếp từ nút UI thật.

## 8. Thứ tự khắc phục đề xuất

Chi tiết đã được tách thành 4 file theo nhóm. Đọc [mục lục, quy tắc chung và phụ thuộc](./FLOW_FIX_LIVE_UX_4_PHASES_2026-11-02.md), sau đó dùng file nhóm tương ứng bên dưới để triển khai và nghiệm thu.

1. **[Nhóm 1 — Trước tiên](./FLOW_FIX_LIVE_UX_GROUP_01_CORE_2026-11-02.md):** F25 và F01–F05. Khôi phục checkout đang lỗi 500; sau sửa kiểm tra vòng xuất/nhập, đúng file sản xuất, địa chỉ, tổng tiền và CRUD danh mục; dọn ID 5.
2. **[Nhóm 2 — Tiếp theo](./FLOW_FIX_LIVE_UX_GROUP_02_BUSINESS_2026-11-02.md):** F06–F15, F18. Chốt mô hình trạng thái đơn, nguồn địa chỉ/giá và đầu mối hỗ trợ; sửa route và validation.
3. **[Nhóm 3 — Trước khi mở rộng quảng bá](./FLOW_FIX_LIVE_UX_GROUP_03_EXPERIENCE_2026-11-02.md):** F16–F17 và F19–F23. Hoàn thiện nội dung sản phẩm/chính sách, nhãn điều khiển và khả năng tiếp cận. F24 đã rút vì trang prototype được bỏ theo yêu cầu chủ website.
4. **[Nhóm 4 — Sửa F26–F27 rồi kiểm tra lại dữ liệu QA](./FLOW_FIX_LIVE_UX_GROUP_04_FILES_PAYMENT_QA_2026-11-02.md):** giữ tên/đuôi file, đồng bộ trạng thái purchase theo PayOS, dọn purchase còn PENDING. Tiếp tục các vòng nghiệp vụ còn lại trong môi trường/phạm vi phù hợp; chưa có bằng chứng thanh toán thành công hoặc sản xuất thực tế.

## 9. Chỉ mục bằng chứng

- [Ảnh chụp](../output/qa-2026-11-02/screenshots/)
- [Network log](../output/qa-2026-11-02/network-log.json): không ghi Authorization hoặc body đăng nhập.
- [Snapshot khảo sát user/admin ban đầu](../output/qa-2026-11-02/initial-role-coverage.json)
- [Chi tiết đã kiểm chứng](../output/qa-2026-11-02/verified-details.json): API cài đặt, profile rút gọn, phân quyền và file xuất.
- [Kết quả đăng nhập sai, validation và đăng xuất](../output/qa-2026-11-02/auth-validation-results.json)
- [Kết quả hoàn tác](../output/qa-2026-11-02/cleanup-results.json)
- [Metadata cuối phiên](../output/qa-2026-11-02/final-metadata.json)
- [Bằng chứng bổ sung đợt 2](../output/qa-2026-11-02/round2/)
- [Network log đợt 2](../output/qa-2026-11-02/round2/network-log.json)
- [Kiểm kê dữ liệu sau đợt 2](../output/qa-2026-11-02/round2/cleanup-results.json)
- [Thời gian, đăng xuất và đóng browser đợt 2](../output/qa-2026-11-02/round2/metadata.json)

Báo cáo phản ánh dữ liệu và phiên bản website quan sát được trong thời gian nêu trên, đã cập nhật sau khi chủ website cho phép tạo/hủy dữ liệu thử và loại trang prototype khỏi phạm vi. Các mục còn hiệu lực có thể giao cho đội phát triển theo ID F01–F23 và F25–F27; các mục chưa thử cần giữ trạng thái chưa xác minh.
