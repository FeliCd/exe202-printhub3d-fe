import JSZip from "jszip";

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface ExportResult {
  zipBlob: Blob;
  imageBlob?: Blob | null;
  imageUrl?: string | null;
  stlBlob?: Blob | null;
  glbBlob?: Blob | null;
  safeName: string;
  stlFileName: string;
  glbFileName: string;
  imageFileName: string;
  jsonFileName: string;
  zipFileName: string;
}

export async function exportDesignPackage(options: {
  stlBlob?: Blob | null;
  glbBlob?: Blob | null;
  imageBlob?: Blob | null;
  design?: unknown;
  name: string;
  length: number;
}): Promise<ExportResult> {
  const safeName = (options.name || "PrintHub-Thuoc").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF-]/g, "_");
  const stlFileName = `${safeName}-${options.length}cm-3D.stl`;
  const glbFileName = `${safeName}-${options.length}cm-3D-View360.glb`;
  const imageFileName = `${safeName}-render.png`;
  const jsonFileName = `${safeName}-Thiet-Ke.json`;
  const infoFileName = `Thong-tin-thiet-ke-${safeName}.txt`;
  const zipFileName = `${safeName}-${options.length}cm-FullPackage.zip`;

  const infoText = [
    `=== THÔNG TIN THIẾT KẾ THƯỚC PRINTHUB 3D ===`,
    `Tên thiết kế: ${options.name}`,
    `Độ dài thước: ${options.length} cm`,
    `Ngày tạo: ${new Date().toLocaleString("vi-VN")}`,
    ``,
    `Gói tệp bao gồm:`,
    `1. ${stlFileName}: Tệp mô hình in 3D chuẩn xác (dành cho phần mềm cắt lớp slicer của xưởng in).`,
    `2. ${glbFileName}: Tệp mô hình 3D đa chiều đầy đủ màu sắc, vạch đo và chữ khắc (nhấp đúp mở bằng Windows 3D Viewer hoặc mở trên điện thoại để xoay lật 360 độ).`,
    `3. ${imageFileName}: Ảnh phối cảnh 3D render sắc nét để lưu trữ hoặc chia sẻ.`,
    `4. ${jsonFileName}: Dữ liệu thiết kế gốc để nhập (import) lại vào PrintHub Ruler Studio bất kỳ lúc nào.`,
    ``,
    `Cảm ơn bạn đã sáng tạo cùng PrintHub 3D!`,
  ].join("\n");

  const zip = new JSZip();
  if (options.stlBlob) {
    zip.file(stlFileName, options.stlBlob);
  }
  if (options.glbBlob) {
    zip.file(glbFileName, options.glbBlob);
  }
  if (options.imageBlob) {
    zip.file(imageFileName, options.imageBlob);
  }
  if (options.design) {
    zip.file(jsonFileName, JSON.stringify(options.design, null, 2));
  }
  zip.file(infoFileName, infoText);

  const zipContent = await zip.generateAsync({ type: "blob" });

  let imageUrl: string | null = null;
  if (options.imageBlob) {
    try {
      imageUrl = URL.createObjectURL(options.imageBlob);
    } catch {
      // ignore
    }
  }

  return {
    zipBlob: zipContent,
    imageBlob: options.imageBlob,
    imageUrl,
    stlBlob: options.stlBlob,
    glbBlob: options.glbBlob,
    safeName,
    stlFileName,
    glbFileName,
    imageFileName,
    jsonFileName,
    zipFileName,
  };
}
