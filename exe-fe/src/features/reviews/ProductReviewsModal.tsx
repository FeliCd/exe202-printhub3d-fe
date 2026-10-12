import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import {
  reviewService,
  type ProductReviewDTO,
  type ProductReviewSummaryDTO,
} from '../../services/reviewService';
import { Star, Image as ImageIcon, MessageSquare, CheckCircle2, X } from 'lucide-react';
import { secondary } from '../../components/DataUI';

interface ProductReviewsModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  } | null;
}

export default function ProductReviewsModal({
  open,
  onClose,
  product,
}: ProductReviewsModalProps) {
  const [summary, setSummary] = useState<ProductReviewSummaryDTO | null>(null);
  const [reviews, setReviews] = useState<ProductReviewDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<number | 'ALL' | 'IMAGE'>('ALL');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    if (!open || !product?.id) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      reviewService.getProductReviewSummary(product.id).catch(() => null),
      reviewService.getProductReviews(product.id, page, 10).catch(() => null),
    ])
      .then(([sumRes, revRes]) => {
        if (!isMounted) return;
        if (sumRes) setSummary(sumRes);
        if (revRes) {
          setReviews(revRes.content || []);
          setTotalPages(revRes.totalPages || 1);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Không thể tải đánh giá sản phẩm.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, product?.id, page]);

  if (!open || !product) return null;

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'IMAGE') return r.imageUrls && r.imageUrls.length > 0;
    return r.rating === selectedFilter;
  });

  const totalReviews = summary?.reviewCount || 0;
  const avgRating = summary?.averageRating || 0;

  const getPercent = (count: number) => {
    if (!totalReviews) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <Modal open={open} onClose={onClose} label={`Đánh giá sản phẩm ${product.name}`}>
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 space-y-6 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">Đánh Giá &amp; Nhận Xét Chất Lượng In</h3>
              <p className="text-xs text-slate-400 truncate max-w-md">{product.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1"
          >
            ✕
          </button>
        </div>

        {/* Rating Summary Bar */}
        <div className="p-4 rounded-xl bg-surface-inset border border-border/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/60 pb-3 md:pb-0 pr-0 md:pr-3">
            <span className="text-4xl font-black text-amber-400">{avgRating.toFixed(1)}</span>
            <div className="py-1">
              <StarRating rating={avgRating} readOnly size="sm" />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {totalReviews > 0 ? `${totalReviews} lượt đánh giá thực tế` : 'Chưa có đánh giá nào'}
            </span>
          </div>

          {/* Breakdown progress bars */}
          <div className="md:col-span-8 space-y-1.5 text-xs text-slate-300">
            {[
              { star: 5, count: summary?.count5Star || 0 },
              { star: 4, count: summary?.count4Star || 0 },
              { star: 3, count: summary?.count3Star || 0 },
              { star: 2, count: summary?.count2Star || 0 },
              { star: 1, count: summary?.count1Star || 0 },
            ].map(({ star, count }) => {
              const pct = getPercent(count);
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-10 text-[11px] text-slate-400 shrink-0 font-medium">{star} sao</span>
                  <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-[11px] text-slate-400 text-right shrink-0">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-border/40 pb-3">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-surface-inset text-slate-400 hover:text-white border border-border'
            }`}
          >
            Tất cả ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                selectedFilter === s
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-surface-inset text-slate-400 hover:text-white border border-border'
              }`}
            >
              <span>{s} sao</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedFilter('IMAGE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              selectedFilter === 'IMAGE'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-surface-inset text-slate-400 hover:text-white border border-border'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Có hình ảnh
          </button>
        </div>

        {/* Review list */}
        <div className="space-y-4 min-h-48">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">Đang tải danh sách đánh giá...</div>
          ) : error ? (
            <div className="text-center py-8 text-rose-400 text-xs">{error}</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">Chưa có đánh giá nào phù hợp với bộ lọc này.</p>
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-surface-inset/60 border border-border/60 space-y-2.5 transition hover:border-border"
              >
                {/* Reviewer Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-primary text-slate-950 font-extrabold text-xs flex items-center justify-center">
                      {rev.reviewerName ? rev.reviewerName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {rev.reviewerName}
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Đã mua hàng
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        {rev.updatedAt && ' (Đã chỉnh sửa)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <StarRating rating={rev.rating} readOnly size="sm" />
                  </div>
                </div>

                {/* Classification info (color, laser text) */}
                {(rev.color || rev.engravingText) && (
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {rev.color && (
                      <span className="px-2 py-0.5 rounded bg-surface-raised border border-border/60">
                        Màu: <strong className="text-slate-300">{rev.color}</strong>
                      </span>
                    )}
                    {rev.engravingText && (
                      <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300">
                        Khắc tên: "{rev.engravingText}"
                      </span>
                    )}
                  </div>
                )}

                {/* Comment */}
                {rev.comment && (
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>
                )}

                {/* Photo gallery */}
                {rev.imageUrls && rev.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rev.imageUrls.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setZoomImage(img)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition group cursor-pointer"
                        title="Bấm để phóng to ảnh"
                      >
                        <img
                          src={img}
                          alt="Thành phẩm in 3D"
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination if multiple pages */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={secondary}
            >
              Trang trước
            </button>
            <span className="text-slate-400">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={secondary}
            >
              Trang sau
            </button>
          </div>
        )}

        {/* Zoom image modal */}
        {zoomImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-surface">
              <img
                src={zoomImage}
                alt="Phóng to ảnh thành phẩm in 3D"
                className="w-full h-full max-h-[80vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
