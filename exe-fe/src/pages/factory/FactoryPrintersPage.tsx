import { Cpu, RefreshCw } from 'lucide-react';

export default function FactoryPrintersPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Trạng Thái Cụm Máy In 3D Xưởng (Printer Machines)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Theo dõi cảm biến nhiệt độ bàn in, nhiệt nozzle và tình trạng cuộn nhựa FDM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { id: 'PRT-BK1', name: 'Bambu Lab X1C #01', status: 'Đang In (78%)', tempN: '215°C', tempB: '60°C', material: 'PLA PRO+ Emerald' },
          { id: 'PRT-BK2', name: 'Bambu Lab X1C #02', status: 'Đang In (42%)', tempN: '240°C', tempB: '75°C', material: 'PETG Clear' },
          { id: 'PRT-BK3', name: 'Formlabs Form 3+', status: 'Sẵn Sàng (Idle)', tempN: '35°C', tempB: '0°C', material: 'Resin UV White' },
        ].map((m, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#272930] pb-2.5">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{m.id}</span>
                <h3 className="font-bold text-white text-sm">{m.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[10px]">
                {m.status}
              </span>
            </div>

            <div className="p-3 bg-[#111215] rounded-xl border border-[#272930] grid grid-cols-2 gap-2 text-[#94a3b8]">
              <div>Nozzle: <strong className="text-white">{m.tempN}</strong></div>
              <div>Bed: <strong className="text-white">{m.tempB}</strong></div>
              <div className="col-span-2">Cuộn nhựa gá: <strong className="text-cyan-300">{m.material}</strong></div>
            </div>

            <button className="w-full py-2 bg-[#1e2025] hover:bg-[#272930] text-slate-200 font-bold rounded-xl border border-[#272930] flex items-center justify-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-cyan-400" /> Cập Nhật Cảm Biến Real-time
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
