import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Sparkles, Filter } from 'lucide-react';
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
      {/* Page Header with Telemetry Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0a0c12] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#040508] border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-md shadow-[#39FF14]/15 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-white uppercase font-mono">
                Danh Mục Sản Phẩm In 3D
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                DUNG SAI &plusmn;0.05MM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Khám phá các mẫu thước kỹ thuật độ chính xác cao, dụng cụ vẽ cơ khí và phụ kiện in 3D FDM/Resin chuẩn học đường.
            </p>
          </div>
        </div>

        <Link
          to="/custom"
          className="btn-precision px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 relative z-10" />
          <span className="whitespace-nowrap">Tự Thiết Kế Thước 3D</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/10 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            <input
              aria-label="Tìm sản phẩm"
              className="w-full bg-[#040508] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition font-mono placeholder:text-slate-500"
              value={keyword}
              placeholder="Tìm tên thước, mã sản phẩm, loại nhựa (PLA, PETG, TPU)..."
              onChange={(e) => {
                setParams({ q: e.target.value });
                setPage(0);
              }}
            />
          </div>

          {/* Category Selector */}
          <div className="sm:col-span-3 relative">
            <select
              className="w-full bg-[#040508] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] transition font-mono"
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
          <div className="sm:col-span-3 relative">
            <select
              className="w-full bg-[#040508] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] transition font-mono"
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

        {/* Quick Category Pills if available */}
        {categories.data && categories.data.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
            <span className="text-slate-400 flex items-center gap-1 shrink-0 font-mono text-[11px]">
              <Filter className="w-3 h-3 text-[#39FF14]" /> LỌC NHANH:
            </span>
            <button
              onClick={() => {
                setCategory('');
                setPage(0);
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition shrink-0 cursor-pointer whitespace-nowrap ${
                category === ''
                  ? 'bg-[#39FF14] text-slate-950 shadow-md shadow-[#39FF14]/30'
                  : 'bg-[#040508] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả
            </button>
            {categories.data.map((c) => (
              <button
                key={c.categoryId}
                onClick={() => {
                  setCategory(String(c.categoryId));
                  setPage(0);
                }}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition shrink-0 cursor-pointer whitespace-nowrap ${
                  category === String(c.categoryId)
                    ? 'bg-[#39FF14] text-slate-950 shadow-md shadow-[#39FF14]/30'
                    : 'bg-[#040508] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {c.categoryName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Remote Status */}
      <RemoteState
        loading={remote.loading}
        error={remote.error}
        empty={!remote.data?.content.length}
        emptyMessage="Không tìm thấy sản phẩm in 3D nào phù hợp với bộ lọc."
        retry={remote.reload}
      />

      {/* Products Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}

