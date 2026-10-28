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
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-[#39FF14]">
            <Cpu className="w-6 h-6 text-[#39FF14]" />
            <h1 className="text-2xl font-black text-white font-mono tracking-tight uppercase">
              HÀNG CHỜ SẢN XUẤT &amp; GIÁM SÁT MÁY IN 3D
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Điều phối lệnh in FDM/SLA, giám sát nhiệt độ nozzle/bed và tiến độ gia công sản phẩm thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#0a0c12] border border-[#1e2433] text-xs font-mono font-bold text-[#39FF14] flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
            TELEMETRY ONLINE
          </span>
        </div>
      </div>

      {/* Grid Printer Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {printers.map((p) => (
          <div key={p.id} className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 transition-all space-y-4 text-xs shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#39FF14]/5 blur-2xl pointer-events-none rounded-full" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2433] pb-3.5">
              <div>
                <span className="font-mono text-[#00e5ff] font-bold text-xs tracking-wider">UNIT: #{p.id} ({p.type})</span>
                <h3 className="font-bold text-white text-base font-mono">{p.name}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-mono font-bold uppercase text-[11px] whitespace-nowrap shrink-0 ${
                  p.status === 'PRINTING'
                    ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 animate-pulse shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                    : p.status === 'IDLE'
                    ? 'bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40'
                    : 'bg-[#ff9100]/15 text-[#ff9100] border border-[#ff9100]/40'
                }`}
              >
                {p.status === 'PRINTING' ? 'ĐANG GIA CÔNG' : p.status === 'IDLE' ? 'SẴN SÀNG' : 'BẢO TRÌ'}
              </span>
            </div>

            {p.status === 'PRINTING' && (
              <div className="space-y-2 bg-[#040508] p-3.5 rounded-xl border border-[#1e2433]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-300">LỆNH: <strong className="text-white">{p.currentJob}</strong></span>
                  <span className="text-[#39FF14] font-mono font-black text-sm">{p.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#11141e] overflow-hidden border border-[#1e2433]">
                  <div className="h-full bg-gradient-to-r from-[#39FF14] to-[#00e5ff] rounded-full shadow-[0_0_8px_rgba(57,255,20,0.5)] transition-all duration-500" style={{ width: `${p.progressPercent}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#040508] rounded-xl border border-[#1e2433] font-mono text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase block">NHIỆT ĐẦU PHUN NOZZLE</span>
                <span className="text-white font-bold text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9100]" />
                  {p.temperatureNozzle}°C
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase block">NHIỆT BÀN IN HEATBED</span>
                <span className="text-white font-bold text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                  {p.temperatureBed}°C
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => toggleStatus(p.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold border transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  p.status === 'PRINTING'
                    ? 'bg-[#ff9100]/15 hover:bg-[#ff9100]/25 text-[#ff9100] border-[#ff9100]/40'
                    : 'bg-[#39FF14]/15 hover:bg-[#39FF14]/25 text-[#39FF14] border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                }`}
              >
                {p.status === 'PRINTING' ? <Pause className="w-4 h-4 text-[#ff9100]" /> : <Play className="w-4 h-4 text-[#39FF14]" />}
                <span>{p.status === 'PRINTING' ? 'TẠM DỪNG MÁY IN' : 'PHÂN BỔ LỆNH IN MỚI'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
