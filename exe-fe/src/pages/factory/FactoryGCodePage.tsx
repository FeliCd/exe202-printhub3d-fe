import { useState, useEffect } from 'react';
import { Download, Play, FileCode, CheckCircle2 } from 'lucide-react';
import { factoryService } from '../../services/factoryService';

interface GCodeJob {
  id: string;
  orderId: string;
  gcodeName: string;
  slicer: 'Bambu Studio' | 'PrusaSlicer' | 'Formlabs PreForm';
  layerHeight: string;
  infill: number;
  printTimeHours: number;
  weightGrams: number;
  targetPrinter: string;
  status: 'READY' | 'PRINTING' | 'ARCHIVED';
}

const mockGCodes: GCodeJob[] = [
  {
    id: 'GC-9024',
    orderId: 'ORD-9024',
    gcodeName: 'Bambu_PLA_Ruler20cm_Engraved_Plate1.gcode',
    slicer: 'Bambu Studio',
    layerHeight: '0.12mm High Detail',
    infill: 30,
    printTimeHours: 1.5,
    weightGrams: 45,
    targetPrinter: 'Bambu Lab X1-Carbon #01',
    status: 'READY',
  },
  {
    id: 'GC-8812',
    orderId: 'ORD-8812',
    gcodeName: 'Prusa_PETG_TSquare_Arch_Plate2.gcode',
    slicer: 'PrusaSlicer',
    layerHeight: '0.15mm Optimum',
    infill: 40,
    printTimeHours: 3.2,
    weightGrams: 110,
    targetPrinter: 'Prusa MK4 #03',
    status: 'PRINTING',
  },
  {
    id: 'GC-7510',
    orderId: 'ORD-7510',
    gcodeName: 'Formlabs_Resin_VernierCaliper.form',
    slicer: 'Formlabs PreForm',
    layerHeight: '0.05mm Micro Detail',
    infill: 100,
    printTimeHours: 4.8,
    weightGrams: 28,
    targetPrinter: 'Formlabs Form 3+',
    status: 'READY',
  },
];

export default function FactoryGCodePage() {
  const [gcodes, setGcodes] = useState<GCodeJob[]>(mockGCodes);

  useEffect(() => {
    const fetchGCodes = async () => {
      try {
        const res = await factoryService.getGCodes();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setGcodes(data);
        }
      } catch (error) {
        console.warn('Backend G-code API error, using mock G-codes:', error);
      }
    };
    fetchGCodes();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <FileCode className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Thư Viện G-code &amp; Thông Số Kỹ Thuật (Slicing Vault)</h1>
        </div>
        <p className="text-sm text-text-muted">
          Quản lý các tệp G-code đã thực hiện cắt lớp (Slicing), thông số Infill %, nhiệt độ nozzle và nạp trực tiếp vào máy in xưởng.
        </p>
      </div>

      <div className="space-y-4">
        {gcodes.map(gc => (
          <div key={gc.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{gc.id} • Đơn {gc.orderId}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{gc.gcodeName}</h3>
                <p className="text-text-muted text-sm">Slicer dùng: {gc.slicer}</p>
              </div>

              <div>
                {gc.status === 'PRINTING' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 animate-pulse" /> Đang In Trên Máy
                  </span>
                )}
                {gc.status === 'READY' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn Sàng Nạp G-Code
                  </span>
                )}
              </div>
            </div>

            {/* Slicing Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-inset rounded-xl border border-border">
              <div>
                <span className="text-text-muted block">Độ mịn Layer:</span>
                <strong className="text-white font-mono">{gc.layerHeight}</strong>
              </div>
              <div>
                <span className="text-text-muted block">Mật độ Infill:</span>
                <strong className="text-white">{gc.infill}%</strong>
              </div>
              <div>
                <span className="text-text-muted block">Thời gian in dự tính:</span>
                <strong className="text-[#39FF14] font-mono">{gc.printTimeHours} giờ</strong>
              </div>
              <div>
                <span className="text-text-muted block">Trọng lượng nhựa:</span>
                <strong className="text-cyan-300 font-mono">{gc.weightGrams}g</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
              <span className="text-text-muted">Máy in mục tiêu: <strong className="text-white">{gc.targetPrinter}</strong></span>

              <div className="flex items-center gap-2">
                <button disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="px-3.5 py-2 rounded-xl bg-surface-inset border border-border hover:border-cyan-400 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition">
                  <Download className="w-4 h-4 text-cyan-400" /> Tải File G-code
                </button>
                <button disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 flex items-center gap-1.5 transition shadow-md">
                  <Play className="w-4 h-4" /> Nạp Máy In Ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
