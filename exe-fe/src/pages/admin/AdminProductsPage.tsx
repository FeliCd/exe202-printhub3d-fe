import { useState } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { products } from '../../features/products/data/products';
import { formatPrice } from '../../utils/format';
import type { Product } from '../../types';

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>(products);

  const handleDelete = (id: string) => {
    if (!window.confirm('Xóa mục này? Thao tác này không thể hoàn tác trong phiên hiện tại.')) return;
    setProductsList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <Package className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Sản Phẩm &amp; Danh Mục (Catalog Management)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Đăng bán sản phẩm thước mới, cập nhật giá niêm yết, tùy chỉnh thông số in 3D (PLA/PETG/Resin) &amp; huy hiệu ưu đãi.
          </p>
        </div>

        <button disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="px-4 py-2.5 rounded-xl bg-purple-500 text-white font-black text-xs hover:bg-purple-600 transition flex items-center gap-2 shadow-lg shrink-0">
          <Plus className="w-4 h-4" /> Thêm Thước 3D Mới
        </button>
      </div>

      {/* Product List Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {productsList.length === 0 && <p role="status" className="col-span-full text-slate-300">Chưa có sản phẩm trong danh mục.</p>}
        {productsList.map(product => (
          <div key={product.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-purple-400 font-bold">{product.id} • {product.category}</span>
                <h3 className="font-bold text-white text-base mt-0.5">{product.name}</h3>
                <p className="text-text-muted text-sm line-clamp-2 mt-1">{product.description}</p>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full ${({ emerald: 'bg-emerald-400', amber: 'bg-amber-400', purple: 'bg-purple-400', blue: 'bg-blue-400', pink: 'bg-pink-400' })[product.badgeColor]} text-slate-950 font-black text-xs uppercase shrink-0`}>
                {product.badgeText}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-surface-inset rounded-xl border border-border">
              <div>
                <span className="text-text-muted block">Giá niêm yết:</span>
                <strong className="text-[#39FF14] text-sm font-mono">{formatPrice(product.price)}đ</strong>
                <span className="text-xs text-slate-500 line-through block">{formatPrice(product.originalPrice)}đ</span>
              </div>
              <div>
                <span className="text-text-muted block">Chất liệu gá in:</span>
                <strong className="text-cyan-300">{product.material}</strong>
              </div>
              <div>
                <span className="text-text-muted block">Dung sai quang học:</span>
                <strong className="text-white font-mono">{product.specs?.tolerance || '±0.1mm'}</strong>
              </div>
              <div>
                <span className="text-text-muted block">Độ đặc Infill:</span>
                <strong className="text-white">{product.specs?.infillDensity || '30%'}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đang hiển thị trên Catalog
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Sửa sản phẩm ${product.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-surface-inset border border-border hover:border-purple-400 text-slate-200 font-bold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-400" /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 font-bold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
