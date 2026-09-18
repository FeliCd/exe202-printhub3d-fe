import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../../components/Modal';
import type { Product } from '../../../types';
import { products } from '../data/products';
import ProductCard from './ProductCard';

interface MainContentProps {
  onAddToCart: (product: Product) => void;
}

export default function MainContent({ onAddToCart }: MainContentProps) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [compareOpen, setCompareOpen] = useState(false);
  const categories = [
    { id: 'all', label: `Tất cả mẫu thước (${products.length})` },
    { id: 'straight', label: 'Thước kỹ thuật 15cm - 30cm' },
    { id: 'flexible', label: 'Thước dẻo PETG/TPU' },
    { id: 'angle', label: 'Thước đo góc & đo lỗ' },
    { id: 'stencil', label: 'Thước vẽ hình (Stencil)' },
  ];
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  const visibleProducts = products.filter(product => {
    const matchesQuery = normalize(`${product.name} ${product.material} ${product.category}`).includes(normalize(query.trim()));
    const matchesCategory = category === 'all'
      || (category === 'straight' && ['ruler-pla-20cm', 'ruler-petg-30cm'].includes(product.id))
      || (category === 'flexible' && /PETG|TPU/.test(product.material))
      || (category === 'angle' && ['ruler-t-square', 'caliper-mini', 'combo-eke-protractor'].includes(product.id))
      || (category === 'stencil' && product.id === 'stencil-multi');
    return matchesQuery && matchesCategory;
  }).sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : 0);
  return (
    <div className="min-w-0 space-y-6">
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
        <p className="text-sm text-text-muted">
          In trực tiếp bằng vật liệu nhựa cao cấp PLA+/PETG dẻo bền, khắc laser tên/MSSV riêng, bảo hành 1 đổi 1 suốt kỳ học.
        </p>
      </div>

      {/* Banner 1: Commitment */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#18191d] to-[#18191d] border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Khắc tên / MSSV miễn phí &amp; Bảo hành gãy 1 đổi 1 trong 1 học kỳ!</h2>
            <p className="text-sm text-slate-300 mt-0.5">
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
      <div className="p-5 rounded-xl bg-surface border border-border relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
              CÔNG NGHỆ IN 3D CHÍNH XÁC CAO
            </span>
            <h3 className="text-lg font-bold text-white">Thước Kỹ Thuật Đa Năng Tích Hợp Đo Góc &amp; Stencil FDM Chuẩn Xác</h3>
            <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
              Mỗi sản phẩm được in lớp dày 0.12mm siêu mịn, hiệu chỉnh sai số quang học và kiểm soát co ngót vật liệu nhiệt, đảm bảo thước không bị cong vênh dưới ánh nắng giảng đường.
            </p>
          </div>
          <button onClick={() => setCompareOpen(true)} className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-200 px-4 py-2.5 rounded-lg transition self-start md:self-center">
            <span>Xem so sánh chất liệu PLA vs PETG</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          Tìm sản phẩm
          <input type="search" value={query} onChange={event => setParams(previous => {
            const next = new URLSearchParams(previous);
            if (event.target.value) next.set('q', event.target.value); else next.delete('q');
            return next;
          }, { replace: true })} placeholder="Tên thước, chất liệu…" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3" />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Lọc loại sản phẩm">
          {categories.map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}
            className={`px-4 py-2 rounded-full text-sm border transition ${category === item.id ? 'bg-primary text-slate-950 border-[#22c55e]' : 'bg-surface text-slate-300 border-border hover:bg-[#272930]'}`}>{item.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p role="status" className="text-slate-400">{visibleProducts.length} sản phẩm phù hợp</p>
          <label className="flex flex-wrap items-center gap-2 text-slate-300">Sắp xếp:
            <select value={sort} onChange={event => setSort(event.target.value)} className="bg-surface border border-border rounded-xl px-3 py-2">
              <option value="default">Thứ tự danh mục</option>
              <option value="asc">Giá từ thấp đến cao</option>
              <option value="desc">Giá từ cao đến thấp</option>
            </select>
          </label>
        </div>
      </div>
      {visibleProducts.length === 0 && <div className="p-6 rounded-2xl border border-border text-slate-300">
        <p>Không tìm thấy sản phẩm phù hợp. Thử từ khóa hoặc loại sản phẩm khác.</p>
        <button className="mt-3 text-[#39FF14]" onClick={() => { setParams({}); setCategory('all'); }}>Xóa bộ lọc</button>
      </div>}
      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} label="So sánh chất liệu">
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <h2 className="text-xl font-semibold">Chất liệu trong danh mục</h2>
          <p><strong>PLA PRO+:</strong> Thước kỹ thuật 20cm, hỗ trợ khắc tên/MSSV miễn phí.</p>
          <p><strong>PETG:</strong> Thước dẻo 30cm, thiết kế chống gãy và viền vát cạnh.</p>
          <button className="px-4 py-2 bg-primary text-slate-950 rounded-xl" onClick={() => setCompareOpen(false)}>Đóng</button>
        </div>
      </Modal>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </section>
    </div>
  );
}