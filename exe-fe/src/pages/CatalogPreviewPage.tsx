import Modal from '../components/Modal';
import { useState } from 'react';
import { products } from '../features/products/data/products';
import { formatPrice } from '../utils/format';
import { Eye, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CatalogPreviewPage() {
  const [previewItem, setPreviewItem] = useState<(typeof products)[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Banner Guest Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Chế độ xem trước dành cho Khách truy cập</h2>
            <p className="text-sm text-amber-200/80">
              Bạn đang xem bản dùng thử danh mục sản phẩm. Đăng nhập để sử dụng đầy đủ tính năng khắc MSSV &amp; đặt in 3D.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Lock className="w-3.5 h-3.5" /> Đăng nhập ngay
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Xem Trước Danh Mục Thước In 3D</h1>
          <p className="text-sm text-text-muted">Trải nghiệm trước kích thước, vật liệu và mẫu dựng 3D chuẩn xác</p>
        </div>
      </div>

      {/* Grid Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-surface border border-border hover:border-[#22c55e]/40 transition space-y-3 flex flex-col justify-between"
          >
            <div className="h-40 bg-surface-inset rounded-xl flex items-center justify-center border border-border relative overflow-hidden">
              <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {p.material}
              </span>
              <div className="text-center font-mono text-xs text-slate-300 font-bold">
                📐 Mẫu In 3D: {p.name}
              </div>
            </div>

            <div>
              <p className="text-sm uppercase font-semibold text-[#22c55e]">{p.category}</p>
              <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
              <p className="text-sm text-text-muted line-clamp-2 mt-1">{p.description}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-base font-black text-white">{formatPrice(p.price)}đ</span>
              <button
                onClick={() => setPreviewItem(p)}
                className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-[#272930] text-xs font-semibold text-slate-200 border border-border flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-[#22c55e]" /> Xem mẫu 3D
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Quick Preview */}
      {previewItem && (
        <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} label="Xem trước sản phẩm">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <h3 className="font-bold text-white text-base">Thông số Mô hình 3D - {previewItem.name}</h3>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs text-text-muted">
              <div className="p-3 bg-surface-inset rounded-xl border border-border space-y-1">
                <p className="text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> Vật liệu in: {previewItem.material}
                </p>
                <p>• Độ chia vạch nhỏ nhất: 0.5mm (Công nghệ dập chìm chống sờn)</p>
                <p>• Dung sai quang học: ±0.05mm</p>
                <p>• Hỗ trợ laser khắc tên / MSSV riêng khi đăng ký tài khoản</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setPreviewItem(null)} className="px-4 py-2 rounded-xl bg-surface-raised text-xs font-bold text-slate-300">
                Đóng
              </button>
              <Link to="/login" className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-slate-950 flex items-center gap-1">
                Đăng nhập để đặt mua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}