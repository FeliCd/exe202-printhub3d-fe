import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, Images, Star, X } from 'lucide-react';
import Modal from '../../components/Modal';
import { useRemote } from '../../hooks/useRemote';
import type { FeaturedProductReviewDTO } from '../../services/reviewService';
import { formatDateTime } from '../../utils/format';

function ReviewPhoto({ src, alt, expanded = false }: { src: string; alt: string; expanded?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = expanded ? 'min-h-48 max-h-[65dvh] object-contain' : 'aspect-[4/3] object-cover';

  if (failed) {
    return (
      <span role="img" aria-label="Ảnh hiện không khả dụng" className={`grid w-full place-items-center bg-surface-raised text-theme-muted ${size}`}>
        <ImageOff className="size-6" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={expanded ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`block w-full bg-surface-raised ${size}`}
    />
  );
}

export default function FeaturedReviews() {
  const { data, error, loading, reload } = useRemote<FeaturedProductReviewDTO[]>('/reviews/featured');
  const reviews = data?.filter(review => review.rating === 5 && review.imageUrls.length > 0) ?? [];
  const [gallery, setGallery] = useState<{ review: FeaturedProductReviewDTO; index: number } | null>(null);
  const galleryCount = gallery?.review.imageUrls.length ?? 0;

  const changePhoto = (step: number) => {
    setGallery(current => current && {
      ...current,
      index: Math.max(0, Math.min(current.review.imageUrls.length - 1, current.index + step)),
    });
  };

  return (
    <section id="customer-reviews" aria-labelledby="customer-reviews-title" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div data-scroll-reveal className="space-y-6">
        <div className="space-y-2 border-b border-border pb-5">
          <h2 id="customer-reviews-title" className="text-2xl font-black tracking-tight text-theme-ink sm:text-4xl">
            Đánh giá 5 sao từ khách hàng
          </h2>
          <p className="text-sm leading-relaxed text-theme-copy">
            Xem ảnh thước khách chụp và chia sẻ sau khi nhận hàng.
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
          <p className="text-sm text-theme-muted">Chưa có đánh giá 5 sao kèm ảnh.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <li key={review.id} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface">
                <button
                  type="button"
                  aria-label={`Xem ảnh đánh giá của ${review.reviewerName}`}
                  onClick={() => setGallery({ review, index: 0 })}
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

                <article className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span aria-label="5 trên 5 sao" role="img" className="inline-flex gap-0.5 text-amber-400 app-light:text-amber-700">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-current" aria-hidden="true" />)}
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

      <Modal open={gallery !== null} onClose={() => setGallery(null)} label="Ảnh khách hàng gửi">
        {gallery && (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <p className="min-w-0 break-words text-sm font-bold text-theme-ink">{gallery.review.productTitle}</p>
              <button type="button" aria-label="Đóng ảnh" onClick={() => setGallery(null)} className="grid size-11 shrink-0 place-items-center rounded-lg text-theme-copy hover:bg-surface-raised">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <ReviewPhoto
              key={gallery.review.imageUrls[gallery.index]}
              src={gallery.review.imageUrls[gallery.index]}
              alt={`Ảnh ${gallery.index + 1} do ${gallery.review.reviewerName} gửi`}
              expanded
            />
            {galleryCount > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2">
                <button type="button" aria-label="Ảnh trước" disabled={gallery.index === 0} onClick={() => changePhoto(-1)} className="grid size-11 place-items-center rounded-lg border border-border text-theme-copy hover:bg-surface-raised">
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <p aria-live="polite" className="text-sm tabular-nums text-theme-muted">{gallery.index + 1} / {galleryCount}</p>
                <button type="button" aria-label="Ảnh tiếp theo" disabled={gallery.index === galleryCount - 1} onClick={() => changePhoto(1)} className="grid size-11 place-items-center rounded-lg border border-border text-theme-copy hover:bg-surface-raised">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
