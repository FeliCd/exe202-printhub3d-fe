import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import Modal from '../../components/Modal';
import type { FeaturedProductReviewDTO } from '../../services/reviewService';

export function ReviewPhoto({
  src,
  alt,
  expanded = false,
  className = 'aspect-[4/3] w-full object-cover',
}: {
  src: string;
  alt: string;
  expanded?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const size = expanded ? 'min-h-48 max-h-[65dvh] w-full object-contain' : className;

  if (failed) {
    return (
      <span role="img" aria-label="Ảnh hiện không khả dụng" className={`grid place-items-center bg-surface-raised text-theme-muted ${size}`}>
        <ImageOff className="size-5" aria-hidden="true" />
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
      className={`block bg-surface-raised ${size}`}
    />
  );
}

export type ReviewPhotos = Pick<FeaturedProductReviewDTO, 'reviewerName' | 'productTitle' | 'imageUrls'>;

const galleryButton = 'grid size-11 shrink-0 place-items-center rounded-lg text-theme-copy hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-transparent';

export default function ReviewPhotoGallery({ review, onClose }: { review: ReviewPhotos | null; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const count = review?.imageUrls.length ?? 0;
  const src = review?.imageUrls[index];

  const close = () => {
    setIndex(0);
    onClose();
  };

  return (
    <Modal open={Boolean(src)} onClose={close} label="Ảnh khách hàng gửi">
      {review && src && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <p className="min-w-0 break-words text-sm font-bold text-theme-ink">{review.productTitle}</p>
            <button type="button" aria-label="Đóng ảnh" onClick={close} className={galleryButton}>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <ReviewPhoto key={src} src={src} alt={`Ảnh ${index + 1} do ${review.reviewerName} gửi`} expanded />
          {count > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2">
              <button type="button" aria-label="Ảnh trước" disabled={index === 0} onClick={() => setIndex(index - 1)} className={`${galleryButton} border border-border`}>
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <p aria-live="polite" className="text-sm tabular-nums text-theme-muted">{index + 1} / {count}</p>
              <button type="button" aria-label="Ảnh tiếp theo" disabled={index === count - 1} onClick={() => setIndex(index + 1)} className={`${galleryButton} border border-border`}>
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
