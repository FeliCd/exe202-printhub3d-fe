import { useState } from 'react';
import { Cpu, Play, Pause } from 'lucide-react';
import type { PrinterMachine } from '../../types';

const initialPrinters: PrinterMachine[] = [
  {
    id: 'PRT-01',
    name: 'Bambu Lab X1C #01 (FDM)',
    type: 'FDM',
    status: 'PRINTING',
    currentJob: 'ORD-9024 (Thước PLA Pro 20cm)',
    progressPercent: 78,
    temperatureNozzle: 215,
    temperatureBed: 60,
  },
  {
    id: 'PRT-02',
    name: 'Bambu Lab X1C #02 (FDM)',
    type: 'FDM',
    status: 'PRINTING',
    currentJob: 'ORD-9023 (Thước PETG Dẻo 30cm)',
    progressPercent: 42,
    temperatureNozzle: 240,
    temperatureBed: 75,
  },
  {
    id: 'PRT-03',
    name: 'Formlabs Form 3+ (SLA)',
    type: 'SLA',
    status: 'IDLE',
    temperatureNozzle: 35,
    temperatureBed: 0,
  },
  {
    id: 'PRT-04',
    name: 'Ender 3 V3 SE #01 (FDM)',
    type: 'FDM',
    status: 'MAINTENANCE',
    temperatureNozzle: 25,
    temperatureBed: 25,
  },
];

export default function AdminProductionPage() {
  const [printers, setPrinters] = useState<PrinterMachine[]>(initialPrinters);

  const toggleStatus = (id: string) => {
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus: PrinterMachine['status'] = p.status === 'PRINTING' ? 'IDLE' : 'PRINTING';
          return {
            ...p,
            status: nextStatus,
            currentJob: nextStatus === 'PRINTING' ? 'ORD-NEW (Lệnh in vừa phân bổ)' : undefined,
            progressPercent: nextStatus === 'PRINTING' ? 5 : undefined,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[#22c55e]">
          <Cpu className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Sản Xuất &amp; Hàng Chờ Máy In 3D</h1>
        </div>
        <p className="text-sm text-text-muted">Điều phối lệnh in, giám sát nhiệt độ nozzle/bed và tiến độ gia công sản phẩm</p>
      </div>

      {/* Grid Printer Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {printers.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-[#22c55e] font-bold">{p.id}</span>
                <h3 className="font-bold text-white text-sm">{p.name}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full font-bold uppercase text-xs ${
                  p.status === 'PRINTING'
                    ? 'bg-emerald-500/20 text-[#22c55e] border border-[#22c55e]/40 animate-pulse'
                    : p.status === 'IDLE'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {p.status}
              </span>
            </div>

            {p.status === 'PRINTING' && (
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>Lệnh in: {p.currentJob}</span>
                  <span className="text-[#22c55e] font-mono">{p.progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-inset rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-gradient-to-r from-[#22c55e] to-emerald-400" style={{ width: `${p.progressPercent}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 p-3 bg-surface-inset rounded-xl border border-border text-text-muted font-mono text-xs">
              <div>Nhiệt đầu phun: <strong className="text-white">{p.temperatureNozzle}°C</strong></div>
              <div>Nhiệt bàn in: <strong className="text-white">{p.temperatureBed}°C</strong></div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(p.id)}
                className="flex-1 py-2 rounded-xl bg-surface-raised hover:bg-[#272930] text-slate-200 font-bold border border-border flex items-center justify-center gap-1.5"
              >
                {p.status === 'PRINTING' ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-[#22c55e]" />}
                {p.status === 'PRINTING' ? 'Tạm Dừng Máy In' : 'Phân Bổ Lệnh In Mới'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
