import { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { field, PageHeader, Pagination, RemoteState } from '../../components/DataUI';
import ReviewPhotoGallery, { ReviewPhoto, type ReviewPhotos } from '../../features/reviews/ReviewPhotoGallery';
import { useRemote } from '../../hooks/useRemote';
import type { PageDTO } from '../../services/productService';
import type { ProductReviewDTO } from '../../services/reviewService';
import { formatDateTime } from '../../utils/format';

const reviewColumns = 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)_7rem]';

export default function AdminReviewsPage() {
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(0);
  const [gallery, setGallery] = useState<ReviewPhotos | null>(null);
  const params = new URLSearchParams({ page: String(page) });
  if (rating) params.set('rating', rating);
  const { data, error, loading, reload } = useRemote<PageDTO<ProductReviewDTO>>(`/admin/reviews?${params}`);
  const reviews = data?.content ?? [];
  const totalPages = data?.totalPages ?? page + 1;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đánh giá khách hàng"
        description="Xem nhận xét, ảnh khách gửi và đơn hàng tương ứng."
        icon={MessageSquare}
      />

      <section aria-label="Danh sách đánh giá" className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="grid w-full gap-1.5 sm:w-44">
            <label htmlFor="admin-review-rating" className="text-xs font-semibold text-theme-copy">Số sao</label>
            <select
              id="admin-review-rating"
              value={rating}
              className={field}
              onChange={event => {
                setRating(event.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả mức sao</option>
              {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}
            </select>
          </div>
          <p aria-live="polite" className="pb-1 text-sm tabular-nums text-theme-muted">
            {data && `${data.totalElements.toLocaleString('vi-VN')} đánh giá`}
          </p>
        </div>

        {reviews.length > 0 ? (
          <>
            <div aria-hidden="true" className={`hidden gap-4 border-b border-border bg-surface-inset/50 px-5 py-3 text-xs font-semibold text-theme-muted md:grid ${reviewColumns}`}>
              <span>Khách hàng</span>
              <span>Sản phẩm và đơn hàng</span>
              <span>Đánh giá</span>
              <span>Ảnh đính kèm</span>
            </div>
            <ul aria-label="Các đánh giá" className="divide-y divide-border">
              {reviews.map(review => {
                const reviewerName = review.reviewerName?.trim() || 'Khách hàng';
                const photos = [...new Set(review.imageUrls.filter(url => /^https?:\/\//i.test(url)))];

                return (
                  <li key={review.id} className={`grid items-start gap-3 px-4 py-4 sm:px-5 md:gap-4 ${reviewColumns}`}>
                    <div className="min-w-0 space-y-1">
                      <p className="break-words text-sm font-semibold text-theme-ink">{reviewerName}</p>
                      <time dateTime={review.createdAt} className="block text-xs tabular-nums text-theme-muted">{formatDateTime(review.createdAt)}</time>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="break-words text-sm text-theme-copy">{review.productTitle}</p>
                      <Link
                        to={`/admin/orders/${review.orderId}`}
                        className="inline-block rounded-sm text-xs font-semibold text-theme-accent underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:decoration-current"
                      >
                        Đơn #{review.orderId.slice(0, 8)}
                      </Link>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-theme-ink">
                        <Star aria-hidden="true" className="size-4 fill-current text-amber-400 app-light:text-amber-700" />
                        {review.rating} sao
                      </p>
                      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-theme-copy">
                        {review.comment?.trim() || 'Không có nhận xét.'}
                      </p>
                    </div>
                    {photos.length > 0 ? (
                      <button
                        type="button"
                        aria-label={`Xem ${photos.length} ảnh đánh giá của ${reviewerName}`}
                        onClick={() => setGallery({ ...review, reviewerName, imageUrls: photos })}
                        className="inline-flex w-fit cursor-zoom-in items-center gap-2 rounded-lg border border-border p-1 pr-2 text-xs font-semibold text-theme-copy hover:bg-surface-raised"
                      >
                        <ReviewPhoto key={photos[0]} src={photos[0]} alt="" className="size-9 rounded object-cover" />
                        {photos.length} ảnh
                      </button>
                    ) : (
                      <p className="text-xs text-theme-muted">Không có ảnh</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="p-4 sm:p-5">
            <RemoteState
              loading={loading}
              error={error ? 'Chưa tải được danh sách đánh giá.' : ''}
              empty={!loading && !error}
              retry={reload}
              emptyMessage={rating ? `Chưa có đánh giá ${rating} sao. Hãy thử chọn mức sao khác.` : 'Chưa có đánh giá từ khách hàng.'}
            />
          </div>
        )}

        {(page > 0 || totalPages > 1) && (
          <Pagination className="px-4 pb-4 sm:px-5" page={page} totalPages={totalPages} loading={loading} onPageChange={setPage} />
        )}
      </section>

      <ReviewPhotoGallery review={gallery} onClose={() => setGallery(null)} />
    </div>
  );
}
