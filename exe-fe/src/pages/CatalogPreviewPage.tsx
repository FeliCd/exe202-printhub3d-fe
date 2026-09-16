import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { formatPrice } from '../utils/format';
import { Eye, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';

export default function CatalogPreviewPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await productService.getProducts();
        const rawList = res?.result?.content || res?.result || res?.data?.content || res?.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const thumbnailTypes: Product['thumbnail'][] = [
            'ruler-20cm',
            'ruler-30cm',
            'ruler-t',
            'stencil',
            'caliper',
            'combo',
          ];
          const mapped: Product[] = rawList.map((p: any, idx: number) => ({
            id: p.id ? String(p.id) : `prod-${idx}`,
            name: p.title || p.name || 'Thước In 3D Kỹ Thuật',
            category: p.categoryName || p.category?.categoryName || 'Thước Kẻ & Dụng Cụ 3D',
            categoryColor: 'text-emerald-400',
            material: p.material || 'PLA PRO+',
            originalPrice: p.price ? Math.round(Number(p.price) * 1.2) : 55000,
            price: p.price ? Number(p.price) : 45000,
            description: p.description || 'Thước in 3D công nghệ FDM sắc nét, chống gãy vỡ, bảo hành 1 đổi 1.',
            badgeText: p.status === 'ACTIVE' ? 'SẴN HÀNG' : 'HOT',
            badgeColor: 'emerald',
            materialBadge: 'CHÍNH HÃNG',
            thumbnail: thumbnailTypes[idx % thumbnailTypes.length],
            imageUrl: p.primaryImageUrl || p.imageUrl || p.images?.[0]?.imageUrl || '',
          }));
          setProductList(mapped);
        } else {
          setProductList([]);
        }
      } catch (error) {
        console.warn('Backend products API error:', error);
        setProductList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
            <p className="text-xs text-amber-200/80">
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
          <p className="text-xs text-[#94a3b8]">Trải nghiệm trước kích thước, vật liệu và mẫu dựng 3D chuẩn xác</p>
        </div>
      </div>

      {/* Grid Products */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải danh sách sản phẩm mẫu...
        </div>
      ) : productList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#18191d] border border-[#272930] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-base">Chưa có sản phẩm xem trước</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hệ thống chưa có sản phẩm nào được kích hoạt hiển thị.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productList.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] hover:border-[#22c55e]/40 transition space-y-3 flex flex-col justify-between"
            >
              <div className="h-40 bg-[#111215] rounded-xl flex items-center justify-center border border-[#272930] relative overflow-hidden">
                <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {p.material}
                </span>
                <div className="text-center font-mono text-xs text-slate-300 font-bold">
                  📐 Mẫu In 3D: {p.name}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-[#22c55e]">{p.category}</p>
                <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                <p className="text-xs text-[#94a3b8] line-clamp-2 mt-1">{p.description}</p>
              </div>

              <div className="pt-2 border-t border-[#272930] flex items-center justify-between">
                <span className="text-base font-black text-white">{formatPrice(p.price)}đ</span>
                <button
                  onClick={() => setPreviewItem(p)}
                  className="px-3 py-1.5 rounded-lg bg-[#1e2025] hover:bg-[#272930] text-xs font-semibold text-slate-200 border border-[#272930] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-[#22c55e]" /> Xem mẫu 3D
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Quick Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#18191d] border border-[#272930] rounded-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-[#272930] pb-3">
              <h3 className="font-bold text-white text-base">Thông số Mô hình 3D - {previewItem.name}</h3>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs text-[#94a3b8]">
              <div className="p-3 bg-[#111215] rounded-xl border border-[#272930] space-y-1">
                <p className="text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> Vật liệu in: {previewItem.material}
                </p>
                <p>• Độ chia vạch nhỏ nhất: 0.5mm (Công nghệ dập chìm chống sờn)</p>
                <p>• Dung sai quang học: ±0.05mm</p>
                <p>• Hỗ trợ laser khắc tên / MSSV riêng khi đăng ký tài khoản</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setPreviewItem(null)} className="px-4 py-2 rounded-xl bg-[#1e2025] text-xs font-bold text-slate-300">
                Đóng
              </button>
              <Link to="/login" className="px-4 py-2 rounded-xl bg-[#22c55e] text-xs font-bold text-slate-950 flex items-center gap-1">
                Đăng nhập để đặt mua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
