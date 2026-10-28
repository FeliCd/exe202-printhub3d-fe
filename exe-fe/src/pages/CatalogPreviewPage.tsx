import Modal from '../components/Modal';
import { useState } from 'react';
import { products } from '../features/products/data/products';
import { formatPrice } from '../utils/format';
import { Eye, Lock, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/DataUI';

export default function CatalogPreviewPage() {
  const [previewItem, setPreviewItem] = useState<(typeof products)[0] | null>(null);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Banner Guest Notice */}
      <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#ff9100]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(255,145,0,0.1)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ff9100]/15 text-[#ff9100] border border-[#ff9100]/30 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff9100]/20 text-[#ff9100] border border-[#ff9100]/40 uppercase">
                GUEST PREVIEW MODE
              </span>
              <h2 className="text-sm font-bold text-white">Chế độ xem trước dành cho Khách truy cập</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bạn đang xem bản dùng thử danh mục sản phẩm. Đăng nhập để kích hoạt khắc MSSV bằng laser &amp; đặt in 3D cá nhân hóa.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#ff9100] hover:bg-[#ff9e1a] text-[#040508] font-black text-xs flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(255,145,0,0.3)]"
        >
          <Lock className="w-3.5 h-3.5" /> Đăng nhập ngay
        </Link>
      </div>

      <PageHeader
        title="Xem Trước Danh Mục Thước In 3D"
        description="Trải nghiệm trước kích thước, vật liệu và mẫu dựng 3D chuẩn xác trước khi tiến hành đặt in cá nhân hóa."
        icon={ShoppingBag}
      />

      {/* Grid Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-[#0a0c12]/90 border border-white/10 hover:border-[#39FF14]/50 hover:shadow-[0_0_25px_rgba(57,255,20,0.15)] transition-all duration-300 space-y-3.5 flex flex-col justify-between group relative overflow-hidden backdrop-blur-md"
          >
            <div className="h-44 bg-[#040508] rounded-xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden group-hover:border-[#39FF14]/40 transition">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />
              <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 uppercase">
                {p.material}
              </span>
              <div className="text-center font-mono text-xs text-slate-300 font-bold z-10 flex flex-col items-center gap-1">
                <span className="text-[#39FF14] text-lg">📐</span>
                <span className="tracking-wide">{p.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">CAD SPEC: 0.05mm TOLERANCE</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase font-bold text-[#00e5ff] tracking-wider">{p.category}</p>
              <h3 className="text-base font-bold text-white group-hover:text-[#39FF14] transition truncate">{p.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-lg font-black text-[#39FF14] font-mono">{formatPrice(p.price)}<span className="text-xs font-normal text-slate-400 ml-0.5">đ</span></span>
              <button
                onClick={() => setPreviewItem(p)}
                className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-[#11141e] hover:bg-[#1a2030] text-xs font-semibold text-slate-200 border border-white/10 hover:border-[#39FF14]/40 transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#39FF14]" /> Xem mẫu 3D
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Quick Preview */}
      {previewItem && (
        <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} label="Xem trước sản phẩm">
          <div className="w-full max-w-lg bg-[#0a0c12] border border-white/15 rounded-2xl p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
                <h3 className="font-bold text-white text-base">Thông số Mô hình 3D - {previewItem.name}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 bg-[#040508] rounded-xl border border-white/10 space-y-2 font-mono">
                <p className="text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Vật liệu in: <span className="text-[#39FF14]">{previewItem.material}</span>
                </p>
                <p className="text-slate-300">• Độ chia vạch nhỏ nhất: 0.5mm (Công nghệ dập chìm chống sờn)</p>
                <p className="text-slate-300">• Dung sai quang học: ±0.05mm</p>
                <p className="text-[#00e5ff]">• Hỗ trợ laser khắc tên / MSSV riêng khi đăng ký tài khoản</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button onClick={() => setPreviewItem(null)} className="whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg bg-[#11141e] text-slate-300 hover:text-white text-xs border border-white/10 transition">
                Đóng
              </button>
              <Link to="/login" className="whitespace-nowrap shrink-0 px-4 py-2 rounded-lg bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition">
                Đăng nhập để đặt mua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}