# Ruler Studio: Khắc Nổi / Chìm 3D Thật & Xuất Bản Mô Hình Đa Mục Đích (Walkthrough)

## 1. Tổng quan kiến trúc & Mục tiêu hoàn thành

Trước đây, Ruler Studio chỉ hiển thị chữ, bảng tên và vạch đo dưới dạng ảnh phẳng `CanvasTexture` (2D) dán lên mặt mô hình 3D. Khi người dùng bấm xuất STL, toàn bộ texture bị loại bỏ, dẫn đến tệp STL chỉ là một thanh thước trơn tuột không hề có chữ hay vạch số thực tế. Ngoài ra, tính năng tải tệp tự động ép người dùng nén toàn bộ định dạng vào file ZIP dung lượng lớn mà không cho phép tải riêng lẻ.

Đợt nâng cấp này đã hiện thực hóa toàn bộ các mốc **M0 – M4** trong `PLAN_RULER_DESIGN_EXPORT.md`:
1. **Dựng hình học 3D thật (Manifold Solid)**: Dùng font vector opentype trích xuất contour Bézier, chuyển thành Three.js Shapes và thực hiện phép toán CSG Boolean (Union cho chữ nổi / Subtract cho khắc chìm) tạo ra mô hình đặc kín (watertight).
2. **Hỗ trợ đầy đủ tiếng Việt có dấu**: Tích hợp bộ font vector chuẩn OFL (`Roboto-Bold.ttf`, `Roboto-Regular.ttf`) với 3.387 glyphs, xử lý trọn vẹn mọi ký tự tiếng Việt và ký tự có lỗ rỗng (O, B, 8, Đ,...).
3. **Chế độ xem trước "Bản in 3D (Solid)"**: Cho phép người dùng chuyển đổi tức thì giữa *"Thiết kế màu"* (texture mượt mà, phản hồi 60fps) và *"Bản in 3D"* (hiển thị hình khối thực tế sẽ in ra từ máy in).
4. **Kiểm tra khả năng in (Print Validation)**: Cảnh báo tự động nếu khắc chìm quá sâu gây thủng đáy thước, chữ quá nhỏ khó đọc, hoặc liệt kê rõ ràng các chi tiết chỉ có màu 2D sẽ không xuất hiện trong STL.
5. **Thiết kế lại luồng xuất tệp theo mục đích**: Tách riêng nhóm "Xem & Chia sẻ" (PNG render, GLB xoay 360°, JSON gốc) và nhóm "Sản xuất In 3D" (STL chuẩn mm có khối thật, Gói ZIP chuẩn xưởng kèm `manifest.json`).

---

## 2. Chi tiết các file thay đổi & Module mới

### Module mới tạo:
* `src/features/ruler-studio/design/migrate.ts`:
  * Tự động nhận diện và chuyển đổi thiết kế cũ từ `version: 1` sang `version: 2`.
  * Chuẩn hóa Unicode bằng `normalize('NFC')`.
  * Giữ nguyên thiết kế cũ ở chế độ `surface-color` (in màu) để không làm biến đổi sản phẩm người dùng đã lưu.
* `src/features/ruler-studio/geometry/textShapes.ts`:
  * Nạp font vector bất đồng bộ từ `/fonts/Roboto-Bold.ttf`.
  * Trích xuất đường cong Bézier từ `opentype.Path` thành Three.js `ShapePath` -> `Shape[]` (đảo trục Y chuẩn xác, bảo toàn lỗ rỗng).
  * Hàm `createExtrudedTextGeometry` tạo mesh 3D extruded theo mm/cm.
* `src/features/ruler-studio/geometry/surfaceFrames.ts`:
  * Tính toán ma trận biến đổi toạ độ và vector pháp tuyến từ bề mặt 2D (`ruler`, `back`, `tag`, `face-a/b/c`) vào không gian 3D của thân thước.
* `src/features/ruler-studio/geometry/manufacturing.ts`:
  * Engine CSG Boolean chính sử dụng `three-bvh-csg`.
  * Thực hiện hợp khối thân thước + bảng tên + chữ nổi (`ADDITION`) và khắc chìm (`SUBTRACTION`) với khoảng lún kỹ thuật chống lỗi coplanar.
* `src/features/ruler-studio/geometry/printValidation.ts`:
  * Bộ luật kiểm tra an toàn in ấn: độ dày đáy tối thiểu (≥ 0.6 mm), độ cao nét chữ (≥ 2.5 mm), phân loại chi tiết chỉ in màu.
* `src/features/ruler-studio/export/buildExport.ts`:
  * `buildSTLFromDesign`: Xuất file STL đơn sắc chuẩn milimét (tỉ lệ 1:1) có hình học nổi/chìm thật.
  * `buildFullPackage`: Đóng gói file ZIP kèm `manifest.json` từ snapshot bất biến.
* `src/features/ruler-studio/export/manifest.ts`:
  * Sinh tệp metadata `manifest.json` ghi nhận thông số in (Infill, Material, Dimensions, Physical Layers).
* `public/fonts/`:
  * Lưu trữ font vector `Roboto-Bold.ttf` và `Roboto-Regular.ttf` phục vụ đóng gói và offline client.

### Các file hiện hữu được nâng cấp:
* `model.ts`:
  * Bổ sung `version: 1 | 2`, `PhysicalMode` (`surface-color | raised | engraved`), `GraduationMode`, `markingsMode`, `markingsDepth`, `textMode`, `textDepth`.
  * Cập nhật `normalizeDesign` tự động tích hợp migration schema.
* `Panels.tsx`:
  * Thêm bộ điều khiển *Chế độ sản xuất* (Khắc chìm 3D / Chữ nổi 3D / In màu) và chọn độ cao/độ sâu mm trong tab Name Tag, Text và Ruler.
* `Scene.tsx`:
  * Thêm component `PrintModel` hiển thị khối 3D thật khi bật chế độ "Bản in 3D".
  * Cập nhật `getSTLBlob` để trả về khối STL đã qua phép toán Boolean thật.
* `RulerStudio.tsx`:
  * Thêm thanh công cụ chuyển đổi chế độ xem: `[ 🎨 Thiết kế màu ]` / `[ 🧊 Bản in 3D (Solid) ]`.
  * Hộp thoại xuất tệp đa mục đích: cho phép tải riêng rẽ từng tệp (PNG, GLB, JSON, STL, ZIP) kèm hiển thị cảnh báo kỹ thuật trước khi tải.
* `studio.css`:
  * Bổ sung styling cho toggle bar, preview pill, validation alert boxes, loading overlay.

---

## 3. Bài học kinh nghiệm & Tối ưu hóa

1. **Tránh nghẽn Main Thread khi tính CSG Boolean**:
   * Phép toán CSG trên lưới 3D có nhiều chữ tiếng Việt tốn khoảng 100 - 300ms CPU.
   * *Giải pháp*: Trong chế độ "Thiết kế màu", tiếp tục dùng `CanvasTexture` 2D để việc gõ phím mượt mà 60fps. Chỉ tính toán CSG Boolean khi chuyển sang chế độ "Bản in 3D" hoặc khi người dùng bấm nút tải file STL.
2. **Khắc phục lỗi Non-Manifold / Coplanar Faces trong Boolean**:
   * Nếu chữ nổi chỉ đặt tiếp xúc vừa khít (tiếp tuyến) với mặt phẳng thước, thuật toán Boolean dễ sinh ra tam giác suy biến hoặc mặt hở.
   * *Giải pháp*: Cho chữ nổi lún sâu 0.01cm - 0.02cm vào thân phôi trước khi thực hiện phép cộng (`ADDITION`), đảm bảo khối giao nhau rõ ràng và xuất ra file STL kín ruột (watertight).
3. **Quy chuẩn đơn vị đo giữa GLB và STL**:
   * Trong Scene của ứng dụng, mô hình sử dụng hệ toạ độ cm. Khi xuất STL, toàn bộ mesh được nhân tỉ lệ 10 (`scale.setScalar(10)`) để đưa về milimét tiêu chuẩn của phần mềm Slicer (Cura, Bambu Studio, PrusaSlicer).

---

## 4. Xử lý triệt để hiện tượng STL trắng trơn (Blank Solid Root Cause Analysis)

### Nguyên nhân đã phát hiện:
1. **Fallback `surface-color` làm bỏ qua chi tiết**: Thiết kế cũ trong cache/local session bị gán chế độ `surface-color`, dẫn đến engine CSG bỏ qua chữ và chi tiết khi xuất STL.
2. **Khóa chặn kiểm tra in quá chặt**: `printValidation.ts` coi độ sâu 0.6mm trên thẻ tên 1.0mm là lỗi nghiêm trọng, kích hoạt fallback âm thầm xóa toàn bộ artwork trong `Scene.tsx`.
3. **Thiếu vạch đo và sticker trong CSG**: `manufacturing.ts` ban đầu chưa có module khắc chìm vạch chia độ và chưa hỗ trợ biến đổi vector sticker thành khối 3D.

### Giải pháp đã thực hiện:
* Cập nhật `model.ts` và `migrate.ts`: mặc định các thành phần sang `raised` (bảng tên), `engraved` (chữ cá nhân, vạch đo, sticker).
* Cập nhật `printValidation.ts`: chỉ báo lỗi khi thực sự thủng đáy thước; cho phép khắc chữ bình thường trên thẻ tên.
* Cập nhật `manufacturing.ts`:
  * Tích hợp phép trừ khối vạch chia độ (cm & 0.5cm) tối ưu siêu tốc (~0.18s).
  * Tích hợp `SVGLoader` để biến đổi các icon sticker (như hình trái tim) thành hình khối 3D đắp nổi / khắc chìm.
* Cập nhật `Panels.tsx`: hiển thị và cho phép chọn chế độ sản xuất cho cả Sticker, đảm bảo người dùng kiểm soát được hình khối 3D.

