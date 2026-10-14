import Modal from '../components/Modal';
import { useState } from 'react';
import { products } from '../features/products/data/products';
import { formatPrice } from '../utils/format';
import { Eye, Lock, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, buttonSm, secondarySm } from '../components/DataUI';

export default function CatalogPreviewPage() {
  const [previewItem, setPreviewItem] = useState<(typeof products)[0] | null>(null);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Banner Guest Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Chế độ xem trước dành cho Khách truy cập</h2>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Bạn đang xem bản dùng thử danh mục sản phẩm. Đăng nhập để sử dụng đầy đủ tính năng khắc MSSV &amp; đặt in 3D.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
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
            className="p-5 rounded-2xl bg-surface border border-border/80 hover:border-primary/40 transition-all duration-200 space-y-3.5 flex flex-col justify-between shadow-lg group relative overflow-hidden"
          >
            <div className="h-44 bg-surface-inset rounded-xl flex items-center justify-center border border-border/60 relative overflow-hidden group-hover:border-primary/30 transition">
              <span className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/30">
                {p.material}
              </span>
              <div className="text-center font-mono text-xs text-slate-300 font-bold">
                📐 Mẫu In 3D: {p.name}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase font-bold text-primary tracking-wider">{p.category}</p>
              <h3 className="text-base font-bold text-white truncate">{p.name}</h3>
              <p className="text-xs text-text-muted line-clamp-2">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-lg font-black text-white font-mono">{formatPrice(p.price)}đ</span>
              <button
                onClick={() => setPreviewItem(p)}
                className={`${secondarySm} flex items-center gap-1`}
              >
                <Eye className="w-3.5 h-3.5 text-primary" /> Xem mẫu 3D
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Quick Preview */}
      {previewItem && (
        <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} label="Xem trước sản phẩm">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-4 text-left shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <h3 className="font-bold text-white text-base">Thông số Mô hình 3D - {previewItem.name}</h3>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs text-text-muted">
              <div className="p-3.5 bg-surface-inset rounded-xl border border-border/60 space-y-2">
                <p className="text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Vật liệu in: {previewItem.material}
                </p>
                <p className="text-slate-300">• Độ chia vạch nhỏ nhất: 0.5mm (Công nghệ dập chìm chống sờn)</p>
                <p className="text-slate-300">• Dung sai quang học: ±0.05mm</p>
                <p className="text-slate-300">• Hỗ trợ laser khắc tên / MSSV riêng khi đăng ký tài khoản</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
              <button onClick={() => setPreviewItem(null)} className={secondarySm}>
                Đóng
              </button>
              <Link to="/login" className={`${buttonSm} flex items-center gap-1`}>
                Đăng nhập để đặt mua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}