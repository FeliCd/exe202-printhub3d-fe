import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardDrive, Upload, Printer, Download, Trash2 } from 'lucide-react';
import type { FileVaultItem } from '../types';

const mockVaultFiles: FileVaultItem[] = [
  {
    id: 'FILE-001',
    fileName: 'Thuoc_Ky_Thuat_Goc_Truot_20cm.stl',
    fileFormat: 'STL',
    fileSize: '14.2 MB',
    weightGrams: 42,
    volumeCm3: 35,
    dimensions: { x: 200, y: 30, z: 4 },
    materialPreference: 'PLA Pro (Green Emerald)',
    uploadedAt: '2026-08-28 14:20',
    lastPrintedAt: '2026-09-01 09:15',
    printCount: 4,
  },
  {
    id: 'FILE-002',
    fileName: 'Khung_Robot_Do_An_Mechatronics.obj',
    fileFormat: 'OBJ',
    fileSize: '28.6 MB',
    weightGrams: 185,
    volumeCm3: 154,
    dimensions: { x: 120, y: 120, z: 85 },
    materialPreference: 'PETG Chịu Nhiệt (Black)',
    uploadedAt: '2026-08-15 10:05',
    lastPrintedAt: '2026-08-20 16:40',
    printCount: 2,
  },
  {
    id: 'FILE-003',
    fileName: 'Banh_Rang_Cong_Nghiep_Module2.step',
    fileFormat: 'STEP',
    fileSize: '8.4 MB',
    weightGrams: 28,
    volumeCm3: 23,
    dimensions: { x: 45, y: 45, z: 15 },
    materialPreference: 'Resin UV Quang Học',
    uploadedAt: '2026-09-02 11:30',
    printCount: 1,
  },
];

export default function FileVaultPage() {
  const [files, setFiles] = useState<FileVaultItem[]>(mockVaultFiles);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredFiles = files.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#39FF14]">
            <HardDrive className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý File Thiết Kế (Thư Viện 3D Vault)</h1>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Lưu trữ không giới hạn các tệp .STL, .OBJ, .STEP cá nhân. In lại nhanh chóng chỉ với 1 cú click mà không cần tải lại file.
          </p>
        </div>

        <Link
          to="/custom"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-950/40 shrink-0"
        >
          <Upload className="w-4 h-4" /> Tải Tệp 3D Mới Lên
        </Link>
      </div>

      {/* Search & Stats Bar */}
      <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên tệp 3D, định dạng .STL..."
          className="bg-[#111215] border border-[#272930] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#39FF14] w-full sm:w-80"
        />

        <div className="flex items-center gap-4 text-xs font-semibold text-[#94a3b8]">
          <span>Tổng số file: <strong className="text-white">{files.length} tệp</strong></span>
          <span>Dung lượng đã dùng: <strong className="text-[#39FF14]">51.2 MB / 5.0 GB (Free)</strong></span>
        </div>
      </div>

      {/* Files List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] hover:border-[#39FF14]/50 transition flex flex-col justify-between space-y-4 shadow-md group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-[#272930] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#111215] border border-[#272930] flex items-center justify-center text-[#39FF14] font-black text-xs shrink-0">
                    {file.fileFormat}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white text-xs truncate group-hover:text-[#39FF14] transition" title={file.fileName}>
                      {file.fileName}
                    </h3>
                    <p className="text-[11px] text-[#94a3b8]">{file.fileSize} • Đã in {file.printCount} lần</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-xs text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>Trọng lượng dự tính:</span>
                  <strong className="text-slate-200">{file.weightGrams}g</strong>
                </div>
                <div className="flex justify-between">
                  <span>Thể tích CAD:</span>
                  <strong className="text-slate-200">{file.volumeCm3} cm³</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kích thước Bounding Box:</span>
                  <strong className="text-slate-200 font-mono">{file.dimensions.x}x{file.dimensions.y}x{file.dimensions.z}mm</strong>
                </div>
                <div className="flex justify-between">
                  <span>Vật liệu hay in:</span>
                  <strong className="text-[#39FF14]">{file.materialPreference}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#272930] flex items-center gap-2">
              <button
                onClick={() => navigate('/custom')}
                className="flex-1 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Printer className="w-4 h-4" /> In Lại Ngay
              </button>
              <button
                title="Tải về"
                className="p-2.5 rounded-xl bg-[#111215] border border-[#272930] hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                title="Xóa tệp"
                className="p-2.5 rounded-xl bg-[#111215] border border-[#272930] hover:border-red-500 text-slate-300 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
