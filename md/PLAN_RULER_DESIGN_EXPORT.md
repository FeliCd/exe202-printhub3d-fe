# Kế hoạch cải thiện thiết kế và xuất mô hình Ruler Studio

Ngày lập: 16/10/2026. Trạng thái: kế hoạch, chưa triển khai tính năng.

## 1. Mục tiêu và nguyên tắc

- Người dùng nhìn thấy chữ nổi/chìm trong chế độ bản in thì STL phải có đúng chi tiết đó.
- Phân biệt rõ thiết kế màu để xem/chia sẻ với hình học dùng để in.
- Giữ đúng mẫu thước, kích thước, mặt thiết kế, chữ tiếng Việt, vị trí, xoay và lật đã chọn.
- Không báo xuất thành công nếu tệp bắt buộc thiếu hoặc mô hình in không hợp lệ.
- STL có thể hiển thị một màu: đây là đặc tính định dạng, không đồng nghĩa mất chi tiết hình học.
- Không cam kết in màu chỉ vì GLB có màu. Khả năng sản xuất phụ thuộc thiết bị và quy trình xưởng.

## 2. Hiện trạng đã xác minh

| Khu vực | Hiện trạng | Vấn đề cần xử lý |
| --- | --- | --- |
| `Scene.tsx / Artwork` | CanvasTexture trên plane | Chữ và họa tiết chưa có thể tích |
| `Scene.tsx / getSTLBlob` | Xóa đối tượng `userData.artwork`, nhân kích thước 10 | Chỉ còn thân và bảng tên; bỏ chữ/vạch đo |
| `Scene.tsx / Model` | `tag.mode` thay độ dày bảng tên | Chưa thực hiện nổi hoặc khắc chữ thật |
| `Scene.tsx / getGLBBlob` | Clone mô hình, xuất binary, giữ artwork | Phục vụ xem màu; cần kiểm tra texture và đơn vị khi mở lại |
| `Scene.tsx / getScreenshotBlob` | Chụp canvas hiện tại | Phụ thuộc canvas sẵn sàng và khung hình render |
| `surface.ts` | Vẽ chữ, sticker, nét vẽ, vạch đo lên canvas | Cần nguồn dữ liệu chung cho texture và hình học |
| `RulerStudio.tsx` | Tạo mọi định dạng, tự tải ZIP, sau đó mở modal | Người chỉ cần ảnh vẫn phải chờ; có thể thành công dù tệp null |
| `download.ts` | Đóng ZIP, mô tả GLB chứa chữ khắc | Nội dung mô tả chưa phản ánh hình học thực tế |
| `model.ts` | Design version 1, font CSS, tag raised/engraved | Cần migration và font vector có tiếng Việt |

Các file liên quan khác: `Panels.tsx`, `SurfaceEditor.tsx`, `text.ts`, `markings.ts`, `geometry/profiles.ts`, `geometry/solid.ts`, `liveArtwork.ts`, `useDesign.ts`, `Modal3DViewer.tsx`, `language.ts`, `translations.ts`, `studio.css`.

## 3. Phạm vi và quyết định sản phẩm

### Giai đoạn ưu tiên

1. Sửa thông tin xuất và quản lý lỗi; giữ hành vi cũ cho dữ liệu cũ.
2. Tạo chữ và vạch đo có hình học thật, đồng bộ preview/STL.
3. Bổ sung chế độ bản in, kiểm tra khả năng in, luồng tải theo mục đích.
4. Chuyển sticker vector và nét vẽ thành nổi/chìm.
5. Nghiên cứu 3MF nhiều phần/màu sau khi xác nhận nhu cầu xưởng.

### Quy tắc thể hiện

| Nội dung | Lựa chọn | Mặc định đề xuất |
| --- | --- | --- |
| Chữ cá nhân | In màu bề mặt / Nổi / Khắc chìm | Khắc chìm cho thiết kế mới hướng tới in một màu |
| Vạch đo và số | Nổi / Khắc chìm / Chỉ hiển thị màu | Khắc chìm cho thiết kế mới, sau khi xưởng duyệt kích thước nét |
| Sticker vector | In màu / Nổi / Khắc chìm khi được hỗ trợ | In màu, yêu cầu thao tác rõ ràng để chuyển hình học |
| Emoji hoặc ảnh raster | In màu; chưa hứa tự động chuyển khối | Giữ dạng màu và chỉ rõ không có trong STL |
| Nét vẽ | In màu / Nổi / Khắc chìm ở giai đoạn sau | Giữ chế độ cũ khi migration |

Không tự chuyển thiết kế cũ từ texture sang khắc/nổi vì sẽ thay đổi sản phẩm người dùng đã lưu. Màu chữ ở chế độ in một màu cần phản ánh màu vật liệu; phối màu dự kiến chỉ được hiển thị khi có quy trình tương ứng.

## 4. Bước 1 — Khảo sát, mẫu đối chứng và chốt quy ước

- [ ] Kiểm tra cách lưu/nhập JSON, bản nháp, giỏ hàng, báo giá và payload backend dùng `Design`.
- [ ] Thu thập mẫu: thước phẳng, mẫu có lỗ/cạnh cong, thước tam giác ba mặt, bảng tên bật/tắt, hai mặt.
- [ ] Tạo bộ dữ liệu có chữ tiếng Việt, chữ có lỗ như O/B/8, xoay/lật, nhiều dòng, sticker và nét xóa.
- [ ] Ghi nhận bounding box, kích thước và ảnh trước sửa để đối chiếu.
- [ ] Chốt hệ tọa độ mặt, chiều pháp tuyến, đơn vị nội bộ và đơn vị xuất.
- [ ] Xác nhận giới hạn xưởng: nét nhỏ nhất, chiều cao nổi, độ sâu khắc, độ dày đáy còn lại, khoảng cách mép.
- [ ] Đánh giá thư viện đọc outline font và Boolean bằng mẫu thực tế; xác minh API, license, độ ổn định và chi phí bundle trước khi thêm dependency.

Đầu ra: bộ fixture, quy ước tọa độ/đơn vị và hồ sơ cấu hình in. Không dùng một ngưỡng độ sâu cố định cho mọi mẫu thước.

## 5. Bước 2 — Mở rộng dữ liệu và tương thích thiết kế cũ

- [ ] Tạo phiên bản schema mới và migration tường minh từ version 1.
- [ ] Bổ sung kiểu `surface-color | raised | engraved` cho những thành phần được hỗ trợ.
- [ ] Lưu chiều cao/độ sâu bằng mm; tách khỏi độ dày bảng tên.
- [ ] Bổ sung thiết lập vạch đo, hồ sơ in và ID font ổn định.
- [ ] Ánh xạ font CSS cũ sang font đã đóng gói; kiểm tra đầy đủ glyph tiếng Việt và giấy phép phân phối.
- [ ] Chuẩn hóa Unicode để tránh mất dấu hoặc xử lý sai ký tự tổ hợp.
- [ ] Migration giữ chữ cũ ở dạng màu; không diễn giải `tag.mode` cũ thành chữ khắc thật nếu trước đây chỉ đổi thân bảng tên.
- [ ] Kiểm tra undo/redo, lưu/khôi phục, import/export, giỏ hàng và báo giá với cả hai phiên bản.
- [ ] Xác định cách xử lý JSON phiên bản mới hơn ứng dụng: báo không hỗ trợ, tránh âm thầm làm mất trường.

Đầu ra: schema, migration và thông báo hướng dẫn nâng cấp nội dung cũ sang chi tiết có thể in.

## 6. Bước 3 — Tạo nguồn dữ liệu thiết kế chung

- [ ] Tách bố cục thành danh sách phần tử bề mặt: đường nét, glyph, vị trí, kích thước, màu, chế độ sản xuất.
- [ ] Cho renderer canvas và bộ dựng hình học cùng đọc danh sách này.
- [ ] Dùng chung kết quả xuống dòng, căn lề, fit chữ và phép xoay/lật; không tính riêng giữa canvas và mesh.
- [ ] Tách vạch đo/số từ `markings.ts` thành primitive có thể dùng cho cả 2D và 3D.
- [ ] Tạo phép biến đổi từ tọa độ mặt sang tọa độ mô hình cho ruler/back/face-a/face-b/face-c/tag.
- [ ] Quy định clipping và khoảng an toàn quanh mép, lỗ, bảng tên; tránh làm mất vạch đo cần thiết.

Đầu ra: bố cục thống nhất, tránh chữ trên GLB khác vị trí hoặc kích thước so với STL.

## 7. Bước 4 — Dựng chữ nổi/chìm và vạch đo thật

- [ ] Đọc outline từ font đã chọn, giữ contour ngoài và lỗ trong glyph.
- [ ] Tạo Shape/Path rồi extrude theo độ cao hoặc độ sâu đã xác thực.
- [ ] Chữ nổi phải giao với thân một khoảng kỹ thuật đủ để hợp nhất; tránh tiếp xúc đúng một mặt gây Boolean lỗi.
- [ ] Khắc chìm dùng phép trừ khối và kiểm tra độ dày còn lại; không được xuyên thủng thân ngoài ý muốn.
- [ ] Hợp nhất bảng tên với thân cho chế độ sản phẩm liền khối; xử lý riêng nếu sau này hỗ trợ bảng tên tháo rời.
- [ ] Thực hiện union/subtract thật; ghép BufferGeometry đơn thuần không loại bỏ mặt trong và không đảm bảo khối kín.
- [ ] Áp dụng đúng pháp tuyến từng mặt, gồm mặt sau và ba mặt thước tam giác.
- [ ] Chuyển vạch đo thành khối chữ nhật/path; số đo sử dụng cùng bộ dựng glyph.
- [ ] Kiểm tra sau Boolean: tọa độ hữu hạn, normal, tam giác suy biến, cạnh hở, thể tích và số thành phần rời.
- [ ] Khi kiểm tra thất bại: chỉ rõ lớp gây lỗi, không trả về STL thô như thể đã đầy đủ thiết kế.

Đầu ra: mô hình kín chứa đúng chi tiết hỗ trợ, có thể mở trong slicer.

## 8. Bước 5 — Tái cấu trúc pipeline mô hình và hiệu năng

Đề xuất module mới dưới `ruler-studio/`, tên cuối cùng có thể điều chỉnh theo cấu trúc repo:

```text
design/migrate.ts             Chuẩn hóa và nâng phiên bản thiết kế
design/layout.ts              Bố cục dùng chung
geometry/surfaceFrames.ts     Biến đổi từng mặt
geometry/textShapes.ts        Glyph và contour
geometry/manufacturing.ts     Union/subtract và dựng khối
geometry/printValidation.ts   Kiểm tra khả năng in và mesh
export/buildExport.ts         Xuất từ snapshot bất biến
export/manifest.ts            Danh sách tệp, cảnh báo và thông số
```

- [ ] Tạo một kết quả dựng mô hình dùng chung cho `Scene` và exporter; cache theo dữ liệu ảnh hưởng hình học.
- [ ] Không sửa/dispose geometry hoặc material đang dùng bởi scene khi xử lý bản xuất.
- [ ] Giữ thao tác kéo/nhập chữ phản hồi nhanh; debounce hoặc tạo preview tạm trước khi tính Boolean đầy đủ.
- [ ] Nếu tính toán gây chặn giao diện, chuyển phần nặng sang worker; kiểm tra khả năng đóng gói runtime trước.
- [ ] Dùng revision ID để bỏ kết quả cũ khi người dùng sửa liên tục.
- [ ] Khi xuất, chụp snapshot thiết kế đã commit; chờ font, tác vụ hình học và khung render hoàn tất.
- [ ] Thay chờ cố định 120 ms bằng tín hiệu sẵn sàng của scene/canvas.
- [ ] Hỗ trợ tiến trình, hủy tác vụ và giải phóng geometry, texture, worker, Object URL.
- [ ] Đo thời gian dựng, kích thước tệp và bộ nhớ trên desktop/mobile; chốt ngân sách hiệu năng sau prototype, trước mở rộng sticker/nét vẽ.

## 9. Bước 6 — Cải thiện giao diện chỉnh sửa và xem trước

- [ ] Thêm lựa chọn “In màu bề mặt”, “Chữ nổi”, “Khắc chìm” trong panel chữ/bảng tên.
- [ ] Chỉ hiện điều khiển độ cao/độ sâu khi phù hợp, kèm preset và giới hạn từ hồ sơ in.
- [ ] Hiển thị lỗi thiếu glyph, chữ quá nhỏ, ngoài mép, giao lỗ, khắc quá sâu ngay gần điều khiển.
- [ ] Thêm chuyển chế độ “Thiết kế màu” / “Bản in 3D”.
- [ ] Chế độ bản in dùng hình học sản xuất thật và vật liệu một màu; không dùng texture để giả chi tiết có trong STL.
- [ ] Giữ chữ nổi/chìm thật ở cả chế độ thiết kế màu; chỉ texture dành cho in màu được ẩn trong bản in.
- [ ] Hiển thị danh sách nội dung không có trong STL, có nút chọn lớp để sửa.
- [ ] Với nội dung chưa được hỗ trợ, vẫn cho lưu JSON/xuất GLB/PNG; STL chỉ tiếp tục khi người dùng chủ động chấp nhận bỏ nội dung màu, hoặc đã chuyển sang hình học.
- [ ] Bổ sung tiếng Việt/Anh, điều khiển bàn phím, trạng thái đọc màn hình và bố cục mobile.

## 10. Bước 7 — Thiết kế lại luồng tải theo mục đích

1. Người dùng nhấn “Tải thiết kế”.
2. Chọn nhóm “Xem và chia sẻ” hoặc “In 3D”.
3. Chọn định dạng; hiển thị nội dung sẽ có và giới hạn trước khi tạo tệp.
4. Với tệp in: chạy kiểm tra, đưa người dùng tới lớp lỗi hoặc yêu cầu xác nhận nội dung bị loại bỏ cụ thể.
5. Tạo đúng định dạng đã chọn từ cùng một snapshot.
6. Hiển thị kết quả và nút tải; báo rõ nếu thiếu tệp, không coi ZIP một phần là gói đầy đủ.

| Lựa chọn | Nội dung và mô tả |
| --- | --- |
| Ảnh PNG | Góc nhìn hiện tại sau khi render hoàn tất |
| Mô hình màu GLB | Xem/xoay thiết kế với màu và texture; không cam kết in màu trực tiếp |
| STL | Hình khối, chữ/vạch nổi hoặc khắc; không chứa màu |
| Gói gửi xưởng ZIP | STL đã xác thực, GLB, PNG, JSON và thông tin sản xuất |
| Dữ liệu JSON | Sao lưu thiết kế có phiên bản để chỉnh sửa lại |

- [ ] Bỏ tự động tạo/tải tất cả định dạng khi chỉ cần một tệp.
- [ ] Giữ lựa chọn tải cả gói cho người cần gửi xưởng.
- [ ] Chuyển API STL sang bất đồng bộ nếu dựng mô hình/worker yêu cầu.
- [ ] Kiểm tra GLB thực sự là ArrayBuffer và mở lại được; kiểm tra texture được nhúng.
- [ ] STL dùng tọa độ theo mm; GLB tuân thủ quy ước mét. Hiện scene dùng cm và chỉ STL nhân 10, vì vậy phải kiểm tra và chuẩn hóa GLB bằng mẫu đối chứng.
- [ ] PNG lấy từ đúng canvas qua ref và snapshot; tránh truy vấn nhầm scene nếu có nhiều viewer.
- [ ] Gói ZIP ghi manifest: phiên bản schema/exporter, kích thước, vật liệu, cấu hình in, chế độ từng lớp, tệp thực có và nội dung bị loại bỏ đã xác nhận.
- [ ] Ghi infill như chỉ dẫn sản xuất; không mô tả như cấu trúc rỗng đã được tạo trong STL.
- [ ] Sửa tên/mô tả “chữ khắc” chỉ dùng khi có hình học khắc thật.

## 11. Bước 8 — Sticker và nét vẽ

- [ ] Ưu tiên sticker có path vector sẵn trong hệ thống; giữ lỗ và phép biến đổi.
- [ ] Nét vẽ chuyển thành vùng kín theo độ rộng, line cap và line join tương ứng preview.
- [ ] Áp dụng nét xóa lên vùng vector trước khi extrude; không xuất nét đã bị xóa.
- [ ] Đơn giản hóa contour có kiểm soát sai số, loại vùng quá nhỏ và giới hạn độ phức tạp.
- [ ] Phát hiện giao cắt, chi tiết rời và phần ngoài vùng in.
- [ ] Emoji/raster không có outline ổn định: đánh dấu chỉ in màu; nếu bổ sung tracing phải có preview và người dùng chấp nhận kết quả.

Đầu ra: tập nội dung được hỗ trợ rõ ràng, không tự suy diễn màu ảnh thành độ sâu.

## 12. Bước 9 — 3MF và in nhiều màu, triển khai sau

- [ ] Xác nhận slicer, máy và khả năng xưởng trước khi chốt định dạng.
- [ ] Tách phần hình học theo vật liệu/màu, giữ đúng vị trí và đơn vị.
- [ ] Kiểm tra hỗ trợ vật liệu/màu của exporter và slicer đích; 3MF có màu không tự bảo đảm máy in thực hiện được.
- [ ] Mở lại trong slicer để xác minh parts, màu, kích thước và hướng in.
- [ ] Chỉ hiển thị lựa chọn in nhiều màu khi pipeline đã được kiểm chứng.

Không coi chuyển GLB sang STL/3MF là cách tự động biến texture thành chi tiết in.

## 13. Kế hoạch kiểm thử và tiêu chí nghiệm thu

### Kiểm thử tự động có giá trị

- [ ] Migration giữ nguyên nội dung version 1 và round-trip JSON version mới.
- [ ] Glyph tiếng Việt có dấu và glyph có lỗ giữ đúng topology.
- [ ] Phép biến đổi mặt trước/sau/ba mặt/tag giữ vị trí, hướng chữ và kích thước.
- [ ] So sánh thân trơn với mô hình có chữ: hình học/thể tích thay đổi đúng hướng khi nổi hoặc khắc.
- [ ] Mesh sau Boolean kín, không có thành phần rời ngoài chủ đích hoặc số không hữu hạn.
- [ ] Đọc lại STL/GLB để đối chiếu bounding box theo đơn vị thực; texture GLB tồn tại.
- [ ] Lỗi font, worker, Boolean và exporter được truyền tới UI; không báo thành công giả.
- [ ] Thay đổi thiết kế khi đang xuất không làm các tệp trong cùng gói lệch snapshot.

Repo chưa có script test trong package hiện tại: chọn runner nhẹ phù hợp và thêm fixture tập trung cho logic hình học/migration, tránh test chỉ lặp lại code.

### Kiểm tra thủ công bắt buộc

- [ ] Chữ “Nguyễn Ánh – Đặng”, O/B/8, xuống dòng, xoay/lật và giới hạn độ dài.
- [ ] Bảng tên bật/tắt, mọi hình dạng, vị trí sát mép và hai chế độ nổi/chìm.
- [ ] Các họ thước có profile khác nhau; đặc biệt lỗ, cạnh cong và thước tam giác.
- [ ] Nhiều lớp chồng nhau, sticker unsupported, nét xóa và thiết kế trống.
- [ ] Mobile: chỉnh sửa → xem trước → xuất; hủy/tải lại, xử lý lỗi và tên file tiếng Việt.
- [ ] Mở STL bằng slicer của xưởng: chữ hiện bằng hình học, đúng mm, xem lớp cắt qua vùng chữ để phát hiện mặt trong/lỗi Boolean.
- [ ] Mở GLB bằng viewer độc lập: màu, texture, chữ, mặt sau và kích thước đúng.
- [ ] In thử một mẫu chữ/vạch đo trước khi gọi tính năng sẵn sàng sản xuất.
- [ ] Chạy `npm run build` và `npm run lint`; phân biệt lỗi mới với lỗi nền có sẵn.

### Điều kiện hoàn thành MVP

1. Chữ tiếng Việt và vạch đo được hỗ trợ có hình học nổi/chìm thật trong STL.
2. Bản in preview và file xuất dùng cùng dữ liệu mô hình; cùng snapshot cho mọi tệp trong gói.
3. Đơn vị được kiểm chứng qua tệp mở lại, không chỉ bằng hiển thị trong ứng dụng.
4. Nội dung chỉ có màu được thông báo trước xuất; không bị bỏ âm thầm.
5. Dữ liệu cũ vẫn nhập/sửa được mà không tự thay đổi ý nghĩa thiết kế.
6. Lỗi tạo tệp hoặc hình học không hợp lệ ngăn thông báo thành công đầy đủ.
7. Bộ fixture hình học, kiểm tra slicer và build/lint đạt yêu cầu; có giới hạn hỗ trợ được ghi rõ.

## 14. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
| --- | --- |
| Boolean lỗi ở chữ nhỏ hoặc nhiều giao cắt | Prototype sớm, kiểm tra topology, quy tắc khoảng giao và báo lớp lỗi |
| Font preview khác font mesh | Dùng font đóng gói và bố cục chung, đợi font tải xong |
| Thước mỏng bị khắc thủng | Kiểm tra độ dày còn lại theo profile và vị trí |
| Sai hướng mặt sau/tam giác | Fixture mặt cục bộ và đối chiếu file mở lại |
| UI chậm hoặc hết bộ nhớ | Cache, worker khi cần, giới hạn contour, hủy tác vụ cũ, dispose tài nguyên |
| Slicer sửa mô hình làm mất chi tiết | Kiểm tra lớp cắt thực tế và in thử, không dựa riêng vào render đẹp |
| Tính năng in màu bị hiểu nhầm | Phân biệt rõ texture xem trước, chỉ dẫn xưởng và hình học in |

## 15. Thứ tự bàn giao

| Mốc | Phần việc | Điều kiện chuyển mốc |
| --- | --- | --- |
| M0 | Khảo sát, fixture, thử font/Boolean, quy ước đơn vị | Dựng và xuất thử một chữ tiếng Việt nổi/chìm thành công |
| M1 | Schema/migration, bố cục chung | Thiết kế cũ giữ nguyên; tọa độ/font thống nhất |
| M2 | Chữ/vạch đo, kiểm tra mesh, pipeline chung | STL mở trong slicer có đủ chi tiết và đúng kích thước |
| M3 | Panel chế độ, bản in preview, xuất theo mục đích | Người dùng biết chính xác nội dung từng tệp |
| M4 | Kiểm thử mở lại, mobile, hiệu năng, in thử | Đạt toàn bộ điều kiện MVP |
| M5 | Sticker/nét vẽ | Từng nhóm nội dung qua kiểm tra geometry và UX |
| M6 | 3MF nếu có nhu cầu | Xưởng và slicer đích xác nhận quy trình |

Mỗi mốc cập nhật checkbox và ghi kết quả kiểm chứng thực tế. Khi hoàn thành triển khai tính năng/sửa lỗi, tạo walkthrough kiến trúc, logic thay đổi và bài học trong `_Build_Logs/` theo hướng dẫn repo; đồng bộ Obsidian chỉ khi đường dẫn đích khả dụng và quyền ghi được cấp.
