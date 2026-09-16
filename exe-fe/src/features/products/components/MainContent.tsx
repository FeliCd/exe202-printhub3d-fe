import { useState, useEffect } from 'react';
import type { Product } from '../../../types';
import { products as mockProducts } from '../data/products';
import ProductCard from './ProductCard';
import { productService } from '../../../services/productService';

interface MainContentProps {
  onAddToCart: (product: Product) => void;
}

export default function MainContent({ onAddToCart }: MainContentProps) {
  const [productList, setProductList] = useState<Product[]>(mockProducts);

  // Thử gọi backend lấy danh sách sản phẩm, nếu lỗi dùng mock data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getProducts();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data);
        }
      } catch (error) {
        console.warn('Backend products API error, falling back to mock products:', error);
      }
    };
    fetchProducts();
  }, []);
  return (
    <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2.5 text-[#22c55e] mb-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Thước In 3D Kỹ Thuật &amp; Custom Theo Yêu Cầu
          </h1>
        </div>
        <p className="text-sm text-[#94a3b8]">
          In trực tiếp bằng vật liệu nhựa cao cấp PLA+/PETG dẻo bền, khắc laser tên/MSSV riêng, bảo hành 1 đổi 1 suốt kỳ học.
        </p>
      </div>

      {/* Banner 1: Commitment */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#18191d] to-[#18191d] border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Khắc tên / MSSV miễn phí &amp; Bảo hành gãy 1 đổi 1 trong 1 học kỳ!</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Sử dụng nhựa PETG/PLA+ thân thiện môi trường, chống bay số vạch, không lo thất lạc khi học thực hành xưởng và đồ án.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/60 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Cam kết chuẩn xác từng 0.1mm</span>
        </div>
      </div>

      {/* Banner 2: Tech Highlight */}
      <div className="p-5 rounded-xl bg-[#18191d] border border-[#272930] relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#22c55e]/5 rounded-full blur-2xl group-hover:bg-[#22c55e]/10 transition" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#22c55e]">
              CÔNG NGHỆ IN 3D CHÍNH XÁC CAO
            </span>
            <h3 className="text-lg font-bold text-white">Thước Kỹ Thuật Đa Năng Tích Hợp Đo Góc &amp; Stencil FDM Chuẩn Xác</h3>
            <p className="text-xs text-[#94a3b8] max-w-2xl leading-relaxed">
              Mỗi sản phẩm được in lớp dày 0.12mm siêu mịn, hiệu chỉnh sai số quang học và kiểm soát co ngót vật liệu nhiệt, đảm bảo thước không bị cong vênh dưới ánh nắng giảng đường.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-200 px-4 py-2.5 rounded-lg transition whitespace-nowrap self-start md:self-center">
            <span>Xem so sánh chất liệu PLA vs PETG</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
          <button className="px-3.5 py-2 rounded-full bg-[#22c55e] text-slate-950 font-bold whitespace-nowrap shadow-sm">
            Tất cả mẫu thước (18)
          </button>
          {['Thước kỹ thuật 15cm - 30cm', 'Thước dẻo chống gãy PETG/TPU', 'Thước đo góc & Thước đo lỗ', 'Thước vẽ hình kỹ thuật (Stencil)'].map(
            (label) => (
              <button
                key={label}
                className="px-3.5 py-2 rounded-full bg-[#18191d] hover:bg-[#272930] text-slate-300 hover:text-white border border-[#272930] whitespace-nowrap transition"
              >
                {label}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-[#94a3b8] shrink-0">
          <span>Sắp xếp:</span>
          <select className="bg-[#18191d] border border-[#272930] rounded-lg text-xs py-1.5 px-3 text-slate-200 focus:ring-[#22c55e] focus:border-[#22c55e] outline-none">
            <option>Bán chạy nhất (Sinh viên tin dùng)</option>
            <option>Giá từ thấp đến cao</option>
            <option>Giá từ cao đến thấp</option>
            <option>Mới cập nhật</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {productList.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </section>
    </main>
  );
}
