import { useState } from 'react';
import { Ruler, Check } from 'lucide-react';

export default function Ruler3DPage() {
  const [modelType, setModelType] = useState<'ruler20' | 'caliper' | 'cube'>('ruler20');
  const [unit, setUnit] = useState<'mm' | 'cm' | 'inch'>('mm');
  const [caliperValue, setCaliperValue] = useState(14.85);

  const getDimensions = () => {
    switch (modelType) {
      case 'ruler20':
        return { x: 200, y: 28, z: 3.2 };
      case 'caliper':
        return { x: 150, y: 45, z: 6.0 };
      default:
        return { x: 50, y: 50, z: 50 };
    }
  };

  const dims = getDimensions();
  const scale = unit === 'cm' ? 0.1 : unit === 'inch' ? 0.0393701 : 1;

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-[#22c55e]">
          <Ruler className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Công Cụ Thước Đo Mô Hình 3D Directly On Browser</h1>
        </div>
        <p className="text-sm text-text-muted">
          Trực quan hóa mô hình 3D, đo đạc kích thước 3 chiều Bounding Box (X, Y, Z) và mô phỏng thước kẹp du xích Vernier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 3D Canvas Mock Viewport */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-inset border border-border flex flex-col justify-between min-h-[380px] relative overflow-hidden group">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#272930_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Top Canvas Controls */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#22c55e] bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              3D VIEWPORT • WEBGL SIMULATOR
            </span>
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1 text-xs">
              <button
                onClick={() => setUnit('mm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  unit === 'mm' ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                mm
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  unit === 'cm' ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setUnit('inch')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  unit === 'inch' ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                inch
              </button>
            </div>
          </div>

          {/* 3D Visual Rendering Simulation */}
          <div className="relative z-10 my-8 flex items-center justify-center">
            {modelType === 'ruler20' && (
              <div className="w-4/5 h-20 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-2 border-emerald-300 shadow-2xl shadow-emerald-950/60 flex items-center justify-between px-4 text-slate-950 font-mono text-xs font-bold transition transform group-hover:scale-105">
                <span>|||||||||||||||||||| 200mm</span>
                <span className="bg-slate-950/20 px-2 py-1 rounded">Vạch chìm 0.5mm</span>
              </div>
            )}

            {modelType === 'caliper' && (
              <div className="w-72 h-20 bg-zinc-800 rounded-xl border-2 border-zinc-600 p-3 flex items-center justify-between text-slate-200 font-mono text-xs">
                <span className="text-[#22c55e] font-black text-sm">Khoảng đo cữ: {(caliperValue * scale).toFixed(2)}{unit}</span>
                <div className="w-12 h-12 bg-primary text-slate-950 font-bold rounded-lg flex items-center justify-center text-xs">
                  Cữ đo
                </div>
              </div>
            )}

            {modelType === 'cube' && (
              <div className="w-28 h-28 bg-purple-600/80 rounded-2xl border-2 border-purple-300 shadow-2xl flex items-center justify-center font-mono font-bold text-white text-xs">
                Cube 50mm³
              </div>
            )}
          </div>

          {/* Bottom Live Coordinates */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
            <div className="flex items-center gap-4 font-mono font-bold text-white">
              <span className="text-[#22c55e]">X: {(dims.x * scale).toFixed(1)}{unit}</span>
              <span className="text-cyan-400">Y: {(dims.y * scale).toFixed(1)}{unit}</span>
              <span className="text-purple-400">Z: {(dims.z * scale).toFixed(1)}{unit}</span>
            </div>
            <span className="text-xs text-slate-400">Thể tích lưới mesh: {((dims.x * dims.y * dims.z) / 1000).toFixed(2)} cm³</span>
          </div>
        </div>

        {/* Right Tools Controls */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chọn Mô Hình Đo Mẫu</h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setModelType('ruler20')}
                className={`w-full p-3 rounded-xl border font-bold text-left flex items-center justify-between transition ${
                  modelType === 'ruler20' ? 'border-[#22c55e] bg-primary/15 text-[#22c55e]' : 'border-border bg-surface-inset text-slate-300'
                }`}
              >
                <span>Thước thẳng Kỹ thuật 20cm</span>
                {modelType === 'ruler20' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setModelType('caliper')}
                className={`w-full p-3 rounded-xl border font-bold text-left flex items-center justify-between transition ${
                  modelType === 'caliper' ? 'border-[#22c55e] bg-primary/15 text-[#22c55e]' : 'border-border bg-surface-inset text-slate-300'
                }`}
              >
                <span>Mô hình Thước Kẹp Mini Vernier</span>
                {modelType === 'caliper' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setModelType('cube')}
                className={`w-full p-3 rounded-xl border font-bold text-left flex items-center justify-between transition ${
                  modelType === 'cube' ? 'border-[#22c55e] bg-primary/15 text-[#22c55e]' : 'border-border bg-surface-inset text-slate-300'
                }`}
              >
                <span>Khối Lập Phương Standard 50mm</span>
                {modelType === 'cube' && <Check className="w-4 h-4" />}
              </button>
            </div>

            {modelType === 'caliper' && (
              <div className="pt-2 border-t border-border space-y-2 text-xs">
                <label htmlFor="ruler3dpage-field-1" className="font-bold text-slate-300">Thao tác trượt cữ đo thước kẹp:</label>
                <input id="ruler3dpage-field-1"
                  type="range"
                  min={0}
                  max={50}
                  step={0.05}
                  value={caliperValue}
                  onChange={(e) => setCaliperValue(parseFloat(e.target.value))}
                  className="w-full accent-[#22c55e]"
                />
                <p className="text-sm text-[#22c55e] font-bold font-mono">Độ chia du xích: {caliperValue.toFixed(2)} mm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
