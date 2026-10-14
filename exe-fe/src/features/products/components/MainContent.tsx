import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Sparkles, Filter } from 'lucide-react';
import type { Product } from '../../../types';
import ProductCard from './ProductCard';
import { useRemote } from '../../../hooks/useRemote';
import { productView, type ProductDTO, type PageDTO } from '../../../services/productService';
import { PageHeader, RemoteState, Pagination, field, buttonSm } from '../../../components/DataUI';

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
      {/* Page Header */}
      <PageHeader
        title="Danh Mục Sản Phẩm In 3D"
        description="Khám phá các mẫu thước kỹ thuật độ chính xác cao, dụng cụ vẽ cơ khí và phụ kiện in 3D FDM/Resin chuẩn học đường."
        icon={ShoppingBag}
        actions={
          <Link to="/custom" className={buttonSm}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tự thiết kế thước 3D</span>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              aria-label="Tìm sản phẩm"
              className={`${field} pl-10`}
              value={keyword}
              placeholder="Tìm tên thước, mã sản phẩm, loại nhựa..."
              onChange={(e) => {
                setParams({ q: e.target.value });
                setPage(0);
              }}
            />
          </div>

          {/* Category Selector */}
          <div className="sm:col-span-3 relative">
            <select
              className={field}
              aria-label="Danh mục"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả danh mục ({categories.data?.length || 0})</option>
              {categories.data?.map((c) => (
                <option key={c.categoryId} value={c.categoryId} className="bg-surface text-white">
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3 relative">
            <select
              className={field}
              aria-label="Sắp xếp"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
            >
              <option value="createdAt" className="bg-surface text-white">Mới nhất</option>
              <option value="averageRating" className="bg-surface text-white">Đánh giá cao nhất</option>
              <option value="price" className="bg-surface text-white">Giá: Thấp đến cao</option>
              <option value="title" className="bg-surface text-white">Tên sản phẩm A-Z</option>
            </select>
          </div>
        </div>

        {/* Quick Category Pills if available */}
        {categories.data && categories.data.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
            <span className="text-text-muted flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-primary" /> Lọc nhanh:
            </span>
            <button
              onClick={() => {
                setCategory('');
                setPage(0);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                category === ''
                  ? 'bg-primary text-slate-950 shadow-sm shadow-primary/30'
                  : 'bg-surface-inset border border-border text-slate-400 hover:text-white'
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
                className={`px-3 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                  category === String(c.categoryId)
                    ? 'bg-primary text-slate-950 shadow-sm shadow-primary/30'
                    : 'bg-surface-inset border border-border text-slate-400 hover:text-white'
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

