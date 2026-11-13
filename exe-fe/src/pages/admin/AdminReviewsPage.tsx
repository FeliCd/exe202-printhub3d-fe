import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { field, PageHeader, Pagination, RemoteState } from '../../components/DataUI';
import ReviewPhotoGallery, { ReviewPhoto, type ReviewPhotos } from '../../features/reviews/ReviewPhotoGallery';
import { useRemote } from '../../hooks/useRemote';
import { errorText } from '../../services/api';
import type { PageDTO } from '../../services/productService';
import { reviewService, type AdminReviewSummaryDTO, type ProductReviewDTO } from '../../services/reviewService';
import { formatDateTime } from '../../utils/format';

const reviewColumns = 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_7rem_11.5rem]';

type VisibilityFilter = 'ALL' | 'PUBLIC' | 'HIDDEN';

export default function AdminReviewsPage() {
  const [rating, setRating] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('ALL');
  const [page, setPage] = useState(0);
  const [gallery, setGallery] = useState<ReviewPhotos | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const params = new URLSearchParams({ page: String(page) });
  if (rating) params.set('rating', rating);
  if (visibility === 'PUBLIC') params.set('isPublic', 'true');
  if (visibility === 'HIDDEN') params.set('isPublic', 'false');

  const { data, error, loading, reload } = useRemote<PageDTO<ProductReviewDTO>>(`/admin/reviews?${params}`);
  const { data: summary, reload: reloadSummary } = useRemote<AdminReviewSummaryDTO>('/admin/reviews/summary');

  const reviews = data?.content ?? [];
  const totalPages = data?.totalPages ?? page + 1;
  const maxPublicLimit = summary?.maxPublicLimit ?? 10;
  const publicCount = summary?.publicCount ?? 0;
  const hiddenCount = summary?.hiddenCount ?? Math.max(0, (data?.totalElements ?? 0) - publicCount);
  const totalCount = summary?.totalReviews ?? data?.totalElements ?? 0;
  const isAtPublicLimit = publicCount >= maxPublicLimit;

  const handleToggleVisibility = async (review: ProductReviewDTO) => {
    const currentlyPublic = Boolean(review.isPublic);
    const nextPublic = !currentlyPublic;
    if (nextPublic && isAtPublicLimit) {
      setFeedback({
        type: 'error',
        message: `Đã đạt giới hạn tối đa ${maxPublicLimit} đánh giá công khai. Vui lòng tắt bớt bài khác trước khi bật bài mới.`,
      });
      return;
    }

    setTogglingId(review.id);
    setFeedback(null);
    try {
      const res = await reviewService.updateReviewVisibility(review.id, nextPublic);
      setFeedback({
        type: 'success',
        message: nextPublic
          ? `Đã công khai đánh giá lên trang chủ (${res.publicCount}/${res.maxPublicLimit}).`
          : `Đã ẩn đánh giá khỏi trang chủ (${res.publicCount}/${res.maxPublicLimit}).`,
      });
      reload();
      reloadSummary();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: errorText(err),
      });
      reload();
      reloadSummary();
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đánh giá khách hàng"
        description="Xem nhận xét, ảnh khách gửi và chọn tối đa 10 đánh giá hiển thị công khai trên trang chủ."
        icon={MessageSquare}
        actions={
          <div
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold tabular-nums ${
              isAtPublicLimit
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 app-light:text-amber-700'
                : 'border-primary/40 bg-primary/10 text-theme-accent'
            }`}
          >
            <Eye className="size-4" aria-hidden="true" />
            <span>
              Đang công khai: {publicCount} / {maxPublicLimit}
              {isAtPublicLimit ? ' (Đã đạt tối đa)' : ''}
            </span>
          </div>
        }
      />

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-red-500/40 bg-red-950/30 text-red-300 app-light:bg-red-50 app-light:text-red-700'
              : 'border-primary/40 bg-primary/10 text-theme-accent'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      <section aria-label="Danh sách đánh giá" className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-end gap-3">
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

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc trạng thái công khai">
              {([
                { key: 'ALL', label: `Tất cả (${totalCount})` },
                { key: 'PUBLIC', label: `Công khai (${publicCount}/${maxPublicLimit})` },
                { key: 'HIDDEN', label: `Không public (${hiddenCount})` },
              ] as const).map(tab => {
                const active = visibility === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setVisibility(tab.key);
                      setPage(0);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'border-primary bg-primary/15 text-theme-accent'
                        : 'border-border bg-surface-inset text-theme-copy hover:border-slate-500 hover:text-theme-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p aria-live="polite" className="pb-1 text-sm tabular-nums text-theme-muted">
            {data && `${data.totalElements.toLocaleString('vi-VN')} đánh giá phù hợp`}
          </p>
        </div>

        {reviews.length > 0 ? (
          <>
            <div aria-hidden="true" className={`hidden gap-4 border-b border-border bg-surface-inset/50 px-5 py-3 text-xs font-semibold text-theme-muted md:grid ${reviewColumns}`}>
              <span>Khách hàng</span>
              <span>Sản phẩm và đơn hàng</span>
              <span>Đánh giá</span>
              <span>Ảnh đính kèm</span>
              <span>Hiển thị trang chủ</span>
            </div>
            <ul aria-label="Các đánh giá" className="divide-y divide-border">
              {reviews.map(review => {
                const reviewerName = review.reviewerName?.trim() || 'Khách hàng';
                const photos = [...new Set(review.imageUrls.filter(url => /^https?:\/\//i.test(url)))];
                const isPublic = Boolean(review.isPublic);
                const isBusy = togglingId === review.id;
                const isBlockedByLimit = !isPublic && isAtPublicLimit;

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
                    <div className="flex flex-col items-start gap-1.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPublic}
                        aria-label={isPublic ? `Tắt công khai đánh giá của ${reviewerName}` : `Bật công khai đánh giá của ${reviewerName}`}
                        disabled={isBusy || isBlockedByLimit}
                        title={isBlockedByLimit ? `Đã đạt giới hạn tối đa ${maxPublicLimit} bài công khai` : undefined}
                        onClick={() => handleToggleVisibility(review)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          isPublic
                            ? 'border-primary/50 bg-primary/15 text-theme-accent hover:bg-primary/25 cursor-pointer'
                            : isBlockedByLimit
                              ? 'border-border bg-surface-inset/50 text-theme-muted opacity-50 cursor-not-allowed'
                              : 'border-border bg-surface-inset text-theme-copy hover:border-slate-500 hover:text-theme-ink cursor-pointer'
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        ) : isPublic ? (
                          <Eye className="size-3.5" aria-hidden="true" />
                        ) : (
                          <EyeOff className="size-3.5" aria-hidden="true" />
                        )}
                        <span>{isPublic ? 'Public' : 'Không public'}</span>
                        <span
                          aria-hidden="true"
                          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                            isPublic ? 'bg-primary' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block size-3 transform rounded-full bg-slate-950 transition-transform ${
                              isPublic ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </span>
                      </button>
                      {isBlockedByLimit && (
                        <span className="text-[11px] leading-tight text-amber-400 app-light:text-amber-700">
                          Đã đủ {maxPublicLimit}/{maxPublicLimit} bài public
                        </span>
                      )}
                    </div>
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
              emptyMessage={
                visibility === 'PUBLIC'
                  ? 'Chưa có đánh giá nào được bật công khai.'
                  : rating
                    ? `Chưa có đánh giá ${rating} sao phù hợp.`
                    : 'Chưa có đánh giá từ khách hàng.'
              }
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
