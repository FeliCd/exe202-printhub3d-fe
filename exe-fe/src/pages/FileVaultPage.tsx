import { useRef } from 'react';
import { useRemote, useAction } from '../hooks/useRemote';
import { send } from '../services/api';
import { uploadFile, downloadFile, type FileDTO } from '../services/fileVaultService';
import { Notice, RemoteState } from '../components/DataUI';
import {
  FileCode,
  Download,
  Printer,
  Trash2,
  UploadCloud,
  Loader2,
  HardDrive,
  Calendar,
} from 'lucide-react';

export default function FileVaultPage() {
  const remote = useRemote<FileDTO[]>('/vault/files');
  const action = useAction(remote.reload);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const selected = fileInputRef.current?.files?.[0];
    if (!selected) return;
    await action.run(async () => {
      await uploadFile(selected);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff]">
              <HardDrive className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Kho Lưu Trữ Tệp CAD / 3D Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Quản lý thư viện file STL, OBJ, STEP cá nhân để tải về hoặc yêu cầu in lại tức thì mà không cần upload lại.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#0a0c12] border border-white/10 text-xs font-mono text-[#39FF14] whitespace-nowrap shrink-0">
            {remote.data?.length || 0} tệp thiết kế
          </span>
        </div>
      </div>

      <Notice error={action.error} />

      {/* Upload Box */}
      <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00e5ff] to-[#39FF14]" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                TẢI TỆP THIẾT KẾ MỚI VÀO KHO
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Định dạng hỗ trợ: .STL, .OBJ, .STEP, .STP (Tối đa 50MB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.step,.stp"
              aria-label="Chọn thiết kế"
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/10 file:bg-[#040508] file:text-slate-200 file:text-xs file:font-mono hover:file:border-[#39FF14] cursor-pointer"
            />
            <button
              disabled={action.busy}
              onClick={handleUpload}
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-bold text-xs uppercase tracking-tight flex items-center gap-2 transition shadow-lg shadow-[#39FF14]/20 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {action.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Lưu Tệp</span>
            </button>
          </div>
        </div>
      </div>

      <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload} />

      {/* Grid danh sách tệp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {remote.data?.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/40 transition shadow-lg space-y-4 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-[#040508] border border-white/10 text-[11px] font-mono font-bold text-[#00e5ff] whitespace-nowrap shrink-0">
                  {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <h3 className="font-bold text-white text-sm tracking-tight truncate font-mono" title={f.fileName}>
                {f.fileName}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(f.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
              <button
                disabled={action.busy}
                onClick={() => void action.run(() => downloadFile(`/vault/files/${f.id}/download`, f.fileName))}
                className="flex-1 py-2 px-3 rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải về</span>
              </button>

              <button
                disabled={action.busy}
                onClick={() =>
                  void action.run(async () => {
                    const requirements = prompt('Yêu cầu vật liệu, màu, số lượng và thông số in:');
                    if (!requirements) return;
                    const shippingAddress = prompt('Người nhận, điện thoại, địa chỉ giao:');
                    if (!shippingAddress) return;
                    await send('/custom-orders', { fileId: f.id, requirements, shippingAddress, quantity: 1 });
                    alert('Đã gửi yêu cầu. Xem tại Báo giá.');
                  })
                }
                className="flex-1 py-2 px-3 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In lại</span>
              </button>

              <button
                disabled={action.busy}
                onClick={() => {
                  if (confirm('Xóa tệp này khỏi kho?')) void action.run(() => send(`/vault/files/${f.id}`, undefined, 'delete'));
                }}
                className="p-2 rounded-xl border border-white/10 hover:border-rose-500/50 bg-[#040508] text-slate-400 hover:text-rose-400 transition whitespace-nowrap shrink-0 cursor-pointer"
                title="Xóa tệp"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
