import { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  printerName: string;
  totalRunHours: number;
  lastNozzleChange: string;
  maintenanceType: 'ROUTINE' | 'NOZZLE_REPLACEMENT' | 'EMERGENCY_REPAIR';
  description: string;
  performedBy: string;
  date: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'NEEDS_ATTENTION';
}

const mockLogs: MaintenanceRecord[] = [
  {
    id: 'MNT-041',
    printerName: 'Bambu Lab X1C #01',
    totalRunHours: 428.5,
    lastNozzleChange: '2026-08-15',
    maintenanceType: 'ROUTINE',
    description: 'Vệ sinh thanh trượt Carbon rod, bôi mỡ chì trục Z, lau kính bàn in.',
    performedBy: 'KTV. Nguyễn Văn A',
    date: '2026-08-30',
    status: 'COMPLETED',
  },
  {
    id: 'MNT-042',
    printerName: 'Bambu Lab X1C #02',
    totalRunHours: 680.0,
    lastNozzleChange: '2026-07-01',
    maintenanceType: 'NOZZLE_REPLACEMENT',
    description: 'Thay Nozzle Hardened Steel 0.4mm do mòn vạch sau khi in PETG.',
    performedBy: 'KTV. Trần Văn B',
    date: '2026-09-02',
    status: 'COMPLETED',
  },
  {
    id: 'MNT-043',
    printerName: 'Ender 3 V2 Custom #04',
    totalRunHours: 850.2,
    lastNozzleChange: '2026-06-10',
    maintenanceType: 'EMERGENCY_REPAIR',
    description: 'Kẹt nhựa nóng chảy ở PTFE tube (Heat creep clogging). Cần cân lại dây curoa Y.',
    performedBy: 'KTV. Nguyễn Văn A',
    date: '2026-09-03',
    status: 'NEEDS_ATTENTION',
  },
];

export default function FactoryMaintenancePage() {
  const [logs] = useState<MaintenanceRecord[]>(mockLogs);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Wrench className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Nhật Ký Bảo Trì &amp; Hao Mòn Máy In (Maintenance Log)</h1>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Theo dõi số giờ chạy thực tế, lịch thay đầu phun nozzle, bảo dưỡng trục trượt và báo cáo kẹt nhựa/sự cố thiết bị.
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition flex items-center gap-2 shadow-lg shrink-0">
          <Plus className="w-4 h-4" /> Tạo Nhật Ký Bảo Trì Mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] space-y-1">
          <p className="text-xs text-[#94a3b8]">Tổng Giờ Chạy Cụm Máy In</p>
          <p className="text-2xl font-black text-cyan-400">1,958.7 giờ</p>
          <span className="text-[10px] text-emerald-400 font-bold">Hiệu suất 94.2%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] space-y-1">
          <p className="text-xs text-[#94a3b8]">Lịch Thay Nozzle Sắp Tới</p>
          <p className="text-2xl font-black text-amber-400">1 Máy</p>
          <span className="text-[10px] text-amber-400 font-bold">Bambu Lab #02 (&gt;650h)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] space-y-1">
          <p className="text-xs text-[#94a3b8]">Sự Cố Cần Xử Lý</p>
          <p className="text-2xl font-black text-red-400">1 Máy</p>
          <span className="text-[10px] text-red-400 font-bold">Ender 3 kẹt nhựa PTFE</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lịch Sử Bảo Trì &amp; Báo Tình Trạng Thiết Bị</h3>

        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 rounded-xl bg-[#111215] border border-[#272930] text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-[#272930] pb-2.5">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">{log.id} • {log.printerName}</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">{log.description}</h4>
                </div>

                <div>
                  {log.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã Bảo Trì xong
                    </span>
                  )}
                  {log.status === 'NEEDS_ATTENTION' && (
                    <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Cần Xử Lý Sự Cố
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[#94a3b8] text-[11px] gap-2">
                <span>Tổng giờ chạy máy: <strong className="text-white font-mono">{log.totalRunHours}h</strong></span>
                <span>Thay nozzle gần nhất: <strong className="text-white font-mono">{log.lastNozzleChange}</strong></span>
                <span>Kỹ thuật viên: <strong className="text-cyan-300">{log.performedBy}</strong></span>
                <span>Ngày ghi: <strong className="text-slate-200">{log.date}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
