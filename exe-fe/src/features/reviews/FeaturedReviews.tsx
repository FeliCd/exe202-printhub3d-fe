import { useState } from 'react';
import { Images, Star } from 'lucide-react';
import { useRemote } from '../../hooks/useRemote';
import type { FeaturedProductReviewDTO } from '../../services/reviewService';
import { formatDateTime } from '../../utils/format';
import ReviewPhotoGallery, { ReviewPhoto } from './ReviewPhotoGallery';

export default function FeaturedReviews() {
  const { data, error, loading, reload } = useRemote<FeaturedProductReviewDTO[]>('/reviews/featured');
  const reviews = data ?? [];
  const [gallery, setGallery] = useState<FeaturedProductReviewDTO | null>(null);

  return (
    <section id="customer-reviews" aria-labelledby="customer-reviews-title" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div data-scroll-reveal className="space-y-6">
        <div className="space-y-2 border-b border-border pb-5">
          <h2 id="customer-reviews-title" className="text-2xl font-black tracking-tight text-theme-ink sm:text-4xl">
            Đánh giá nổi bật từ khách hàng
          </h2>
          <p className="text-sm leading-relaxed text-theme-copy">
            Đọc nhận xét và xem ảnh khách gửi sau khi nhận hàng.
          </p>
        </div>

        {loading ? (
          <p role="status" className="text-sm text-theme-muted">Đang tải đánh giá…</p>
        ) : error ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-theme-copy">
            <p role="status">Chưa tải được đánh giá.</p>
            <button type="button" onClick={reload} className="rounded-lg border border-border bg-surface px-3 font-semibold text-theme-accent">
              Thử lại
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-theme-muted">Chưa có đánh giá công khai để hiển thị.</p>
        ) : (
          <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <li key={review.id} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface">
                {review.imageUrls.length > 0 && (
                  <button
                    type="button"
                    aria-label={`Xem ảnh đánh giá của ${review.reviewerName}`}
                    onClick={() => setGallery(review)}
                    className="group relative block w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline-offset-[-3px]"
                  >
                    <div className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]">
                      <ReviewPhoto key={review.imageUrls[0]} src={review.imageUrls[0]} alt={`Ảnh thước do ${review.reviewerName} gửi`} />
                    </div>
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold text-white">
                      <Images className="size-3.5" aria-hidden="true" />
                      {review.imageUrls.length} ảnh
                    </span>
                  </button>
                )}

                <article className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span aria-label={`${review.rating} trên 5 sao`} role="img" className="inline-flex gap-0.5 text-amber-400 app-light:text-amber-700">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < review.rating ? 'fill-current' : 'text-theme-muted/35'}`}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                    <time dateTime={review.createdAt} className="text-xs text-theme-muted">{formatDateTime(review.createdAt, false)}</time>
                  </div>
                  {review.comment?.trim() && (
                    <blockquote className="whitespace-pre-line break-words text-sm leading-relaxed text-theme-copy">
                      {review.comment}
                    </blockquote>
                  )}
                  <div>
                    <p className="break-words text-sm font-bold text-theme-ink">{review.reviewerName}</p>
                    <p className="break-words text-xs leading-relaxed text-theme-muted">{review.productTitle}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReviewPhotoGallery review={gallery} onClose={() => setGallery(null)} />
    </section>
  );
}
