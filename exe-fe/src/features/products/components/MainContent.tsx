import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Sparkles, Filter } from 'lucide-react';
import type { Product } from '../../../types';
import ProductCard from './ProductCard';
import { useRemote } from '../../../hooks/useRemote';
import { productView, type ProductDTO, type PageDTO } from '../../../services/productService';
import { RemoteState, Pagination } from '../../../components/DataUI';

export default function MainContent({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('createdAt');

  const keyword = params.get('q') || '';

  const query = new URLSearchParams({
    keyword,
    page: String(page),
    size: '12',
    sortBy: sort,
    sortDirection: sort === 'price' ? 'asc' : 'desc',
  });
  if (category) query.set('categoryId', category);

  const remote = useRemote<PageDTO<ProductDTO>>(`/marketplace/product?${query}`);
  const categories = useRemote<{ categoryId: number; categoryName: string }[]>('/categories');

  return (
    <div className="space-y-6 w-full pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-theme-ink sm:text-3xl">Chọn thước. Thêm dấu ấn riêng.</h1>
          <p className="text-sm text-theme-muted">Thước in 3D dành cho học tập và sáng tạo.</p>
        </div>
        <Link
          to="/custom"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-theme-ink hover:border-theme-accent"
        >
          <Sparkles className="w-3.5 h-3.5 relative z-10" />
          <span className="whitespace-nowrap">Tự thiết kế</span>
        </Link>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-12">
          {/* Search Input */}
          <div className="sm:col-span-6 relative lg:hidden">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            <input
              aria-label="Tìm sản phẩm"
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-theme-ink outline-none focus:border-[#39FF14] transition placeholder:text-slate-500"
              value={keyword}
              placeholder="Tìm tên thước, mã sản phẩm, loại nhựa (PLA, PETG, TPU)..."
              onChange={(e) => {
                setParams({ q: e.target.value });
                setPage(0);
              }}
            />
          </div>

          {/* Category Selector */}
          <div className="sm:col-span-3 relative lg:col-span-9 xl:hidden">
            <select
              className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-theme-copy outline-none focus:border-[#39FF14] transition"
              aria-label="Danh mục"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            >
              <option value="" className="bg-[#0a0c12] text-white">Tất cả danh mục ({categories.data?.length || 0})</option>
              {categories.data?.map((c) => (
                <option key={c.categoryId} value={c.categoryId} className="bg-[#0a0c12] text-white">
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3 xl:col-start-10 relative">
            <select
              className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-theme-copy outline-none focus:border-[#39FF14] transition"
              aria-label="Sắp xếp"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
            >
              <option value="createdAt" className="bg-[#0a0c12] text-white">Mới nhất</option>
              <option value="averageRating" className="bg-[#0a0c12] text-white">Đánh giá cao nhất</option>
              <option value="price" className="bg-[#0a0c12] text-white">Giá: Thấp đến cao</option>
              <option value="title" className="bg-[#0a0c12] text-white">Tên sản phẩm A-Z</option>
            </select>
          </div>
        </div>

      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[11rem_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-xl border border-border bg-surface p-3 xl:block" aria-label="Lọc theo danh mục">
          <h2 className="flex items-center gap-2 px-2 pb-2 text-sm font-semibold text-theme-ink">
            <Filter size={16} aria-hidden="true" /> Danh mục
          </h2>
          <div className="grid gap-1">
            {[{ categoryId: '', categoryName: 'Tất cả' }, ...(categories.data ?? [])].map(item => {
              const value = String(item.categoryId);
              return (
                <button
                  type="button"
                  key={value}
                  aria-pressed={category === value}
                  onClick={() => { setCategory(value); setPage(0); }}
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm text-theme-copy hover:bg-surface-raised aria-pressed:bg-primary/10 aria-pressed:font-semibold aria-pressed:text-theme-accent"
                >
                  {item.categoryName}
                </button>
              );
            })}
          </div>
        </aside>
        <section aria-label="Kết quả tìm sản phẩm" className="min-w-0 space-y-4">
          {/* Remote Status */}
          <RemoteState
            loading={remote.loading}
            error={remote.error}
            empty={!remote.data?.content.length}
            emptyMessage="Không tìm thấy sản phẩm in 3D nào phù hợp với bộ lọc."
            retry={remote.reload}
          />

          {/* Products Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {remote.data?.content.map((p) => (
              <ProductCard key={p.id} product={productView(p)} onAddToCart={onAddToCart} />
            ))}
          </div>

          {/* Pagination */}
          {remote.data && remote.data.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={remote.data.totalPages}
              loading={remote.loading}
              onPageChange={setPage}
            />
          )}
        </section>
      </div>
    </div>
  );
}

