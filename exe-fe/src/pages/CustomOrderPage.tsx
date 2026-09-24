import ErrorBoundary from '../components/ErrorBoundary';
import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Upload, MessageSquare, ArrowRight, Sparkles, LogIn } from 'lucide-react';
const RulerConfigurator = lazy(() => import('../components/3d/RulerConfigurator'));
import { formatPrice } from '../utils/format';
import type { CustomOrderRequest } from '../types';
import { useAuth } from '../context/AuthContext';


const sampleRequests: CustomOrderRequest[] = [
  {
    id: 'REQ-1092',
    fileName: 'Khung_Vo_Robot_Mechatronics.stl',
    fileSize: '14.2 MB',
    material: 'PETG Dẻo',
    color: 'Đen Matte',
    infill: 40,
    layerHeight: '0.16 mm',
    quantity: 2,
    status: 'QUOTED',
    quotedPrice: 165000,
    factoryNotes: 'Báo giá đã bao gồm xử lý bề mặt nhẵn và gọt bavia chân support.',
    createdAt: '2026-09-02 11:20',
  },
  {
    id: 'REQ-1080',
    fileName: 'Thuoc_Binh_Dien_Oto_R5.step',
    fileSize: '8.5 MB',
    material: 'Resin Độ Mịn Cao',
    color: 'Trắng Sữa',
    infill: 100,
    layerHeight: '0.05 mm',
    quantity: 1,
    status: 'IN_PRODUCTION',
    quotedPrice: 220000,
    factoryNotes: 'Đang tiến hành in trên máy Formlabs Form 3+',
    createdAt: '2026-08-30 15:45',
  },
];

export default function CustomOrderPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<CustomOrderRequest[]>(sampleRequests);
  const [activeTab, setActiveTab] = useState<'configurator' | 'upload' | 'list'>('configurator');

  // Form State
  const [fileName, setFileName] = useState('');
  const [material, setMaterial] = useState('PLA PRO+');
  const [color, setColor] = useState('Xanh Neon (Emerald)');
  const [infill, setInfill] = useState(30);
  const [layerHeight, setLayerHeight] = useState('0.16 mm');
  const [quantity, setQuantity] = useState(1);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/custom');
      return;
    }
    const newReq: CustomOrderRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      fileName: fileName || 'Model_Custom_In3D.stl',
      fileSize: '12.8 MB',
      material,
      color,
      infill,
      layerHeight,
      quantity,
      status: 'PENDING_QUOTE',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setRequests([newReq, ...requests]);
    setFileName('');
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#39FF14]">
            <Printer className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Yêu Cầu In 3D Tùy Chỉnh &amp; Trình Thiết Kế 3D</h1>
          </div>
          <p className="text-sm text-text-muted">
            Thiết kế phôi thước 3D trực quan real-time (React Three Fiber), khắc MSSV nổi và xuất file .STL trực tiếp cho hệ thống in 3D PrintHub.
          </p>
        </div>


        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-2xl border border-border text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('configurator')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'configurator'
                ? 'bg-[#39FF14] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 3D Configurator
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#39FF14] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> Tải File 3D (.STL/.OBJ)
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'list'
                ? 'bg-[#39FF14] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yêu Cầu Đã Gửi ({requests.length})
          </button>
        </div>
      </div>

      {/* 1. 3D CONFIGURATOR VIEWPORT (Requirement 1, 2, 3, 4) */}
      {activeTab === 'configurator' && <ErrorBoundary><Suspense fallback={<p role="status" className="p-6 text-slate-300">Đang tải trình thiết kế 3D…</p>}><RulerConfigurator /></Suspense></ErrorBoundary>}

      {/* 2. UPLOAD FILE FORM */}
      {activeTab === 'upload' && (
        <form onSubmit={handleCreateRequest} className="p-6 rounded-3xl bg-surface border border-border space-y-5 text-xs">
          <div className="border-2 border-dashed border-border hover:border-[#39FF14] rounded-2xl p-8 text-center space-y-2 transition cursor-pointer bg-surface-inset">
            <Upload className="w-8 h-8 text-[#39FF14] mx-auto" />
            <h3 className="font-bold text-white text-sm">Kéo thả tệp 3D (.STL, .OBJ, .STEP) vào đây</h3>
            <p className="text-text-muted text-sm">Dung lượng tối đa 100MB per file</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="customorderpage-field-1" className="font-bold text-slate-200">Tên tệp mô hình 3D:</label>
              <input id="customorderpage-field-1"
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Khung_Robot_Do_An.stl"
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="customorderpage-field-2" className="font-bold text-slate-200">Chất liệu nhựa in 3D:</label>
              <select id="customorderpage-field-2"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-[#39FF14]"
              >
                <option value="PLA PRO+">PLA PRO+ (Siêu bền)</option>
                <option value="PETG Dẻo">PETG Dẻo Chịu Nhiệt</option>
                <option value="Resin Độ Mịn Cao">Resin UV Quang Học</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="customorderpage-field-3" className="font-bold text-slate-200">Màu sắc nhựa:</label>
              <input id="customorderpage-field-3"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="customorderpage-field-4" className="font-bold text-slate-200">Mật độ Infill (%):</label>
              <input id="customorderpage-field-4"
                type="number"
                min={0}
                max={100}
                required
                value={infill}
                onChange={(e) => setInfill(Number(e.target.value))}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-[#39FF14]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="customorderpage-field-5" className="font-bold text-slate-200">Độ mịn Layer:</label>
              <select id="customorderpage-field-5"
                value={layerHeight}
                onChange={(e) => setLayerHeight(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-[#39FF14]"
              >
                <option value="0.16 mm">0.16 mm (Tối ưu độ bền)</option>
                <option value="0.12 mm">0.12 mm (Mịn đẹp)</option>
                <option value="0.05 mm">0.05 mm (Siêu mịn Resin)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="customorderpage-field-6" className="font-bold text-slate-200">Số lượng cần in:</label>
              <input id="customorderpage-field-6"
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-[#39FF14]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {!isAuthenticated ? (
              <>
                <LogIn className="w-4 h-4" /> Đăng Nhập Để Gửi Yêu Cầu
              </>
            ) : (
              <>
                Gửi Yêu Cầu Báo Giá Thường <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* 3. LIST OF REQUESTS */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2.5">
                <div>
                  <span className="font-mono text-[#39FF14] font-bold">{r.id}</span>
                  <h3 className="font-bold text-white text-sm">{r.fileName}</h3>
                  <p className="text-text-muted text-sm">{r.createdAt}</p>
                </div>

                <div>
                  {r.status === 'PENDING_QUOTE' && (
                    <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs">
                      Chờ PrintHub báo giá
                    </span>
                  )}
                  {r.status === 'QUOTED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs">
                      Đã có báo giá ({formatPrice(r.quotedPrice || 0)}đ)
                    </span>
                  )}
                  {r.status === 'IN_PRODUCTION' && (
                    <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs">
                      Đang sản xuất in 3D
                    </span>
                  )}
                </div>
              </div>

              {r.factoryNotes && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                  <span>{r.factoryNotes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
