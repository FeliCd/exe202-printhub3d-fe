import { useState, useRef } from 'react';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import { reviewService, type CustomOrderReviewDTO } from '../../services/reviewService';
import { errorText } from '../../services/api';
import { Sparkles, UploadCloud, X, Loader2, CheckCircle2 } from 'lucide-react';
import { button, secondary, Notice } from '../../components/DataUI';

export interface ReviewTargetItem {
  id?: number;
  productId: string;
  productTitle: string;
  color?: string;
  engravingText?: string;
  reviewId?: number;
  reviewRating?: number;
  reviewComment?: string | null;
}

export interface ReviewCustomTarget {
  id: string;
  title: string;
  color?: string;
  engravingText?: string;
  review?: CustomOrderReviewDTO | null;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  orderItem?: ReviewTargetItem | null;
  customOrder?: ReviewCustomTarget | null;
  onSuccess: () => void;
}

export default function ReviewModal({
  open,
  onClose,
  orderItem,
  customOrder,
  onSuccess,
}: ReviewModalProps) {
  const existingReview = customOrder?.review;
  const isEditing = Boolean(orderItem?.reviewId || existingReview?.id);
  const [rating, setRating] = useState<number>(existingReview?.rating ?? orderItem?.reviewRating ?? 5);
  const [comment, setComment] = useState<string>(existingReview?.comment ?? orderItem?.reviewComment ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(existingReview?.imageUrls ?? []);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open || (!orderItem && !customOrder)) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
      setError('Bạn chỉ được tải lên tối đa 5 hình ảnh thành phẩm in 3D.');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }
        const url = await reviewService.uploadReviewImage(file);
        newUrls.push(url);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOrder && !orderItem?.id) {
      setError('Không tìm thấy mã dòng sản phẩm cần đánh giá.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (customOrder) {
        await reviewService.upsertCustomOrderReview(customOrder.id, {
          rating,
          comment: comment.trim() || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });
      } else if (orderItem?.id) {
        await reviewService.createOrUpdateReview({
          orderItemId: orderItem.id,
          rating,
          comment: comment.trim() || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });
      }

      setSuccessMsg(isEditing ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá chất lượng in 3D thành công!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      setError(errorText(err) || 'Gửi đánh giá không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const targetTitle = customOrder?.title || orderItem?.productTitle || 'Sản phẩm in 3D';
  const targetColor = customOrder?.color || orderItem?.color;
  const targetEngraving = customOrder?.engravingText || orderItem?.engravingText;

  return (
    <Modal open={open} onClose={onClose} label="Đánh giá chất lượng sản phẩm in 3D">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-950/30 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-theme-ink text-base">
              {isEditing ? 'Chỉnh Sửa Đánh Giá' : 'Đánh Giá Chất Lượng In 3D'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-theme-muted hover:text-theme-ink transition p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Product preview card */}
        <div className="p-3.5 bg-surface-inset rounded-xl border border-border space-y-1.5">
          <p className="text-xs text-theme-muted">{customOrder ? 'Thiết kế đánh giá:' : 'Sản phẩm đánh giá:'}</p>
          <p className="text-sm font-bold text-theme-ink">{targetTitle}</p>
          <div className="flex flex-wrap gap-2 text-xs pt-1">
            {targetColor && (
              <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-theme-copy">
                Màu in: <strong className="text-theme-ink">{targetColor}</strong>
              </span>
            )}
            {targetEngraving && (
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                Khắc laser: <strong className="text-purple-200 app-light:text-purple-900">"{targetEngraving}"</strong>
              </span>
            )}
          </div>
        </div>

        {/* Notice & Error */}
        <Notice error={error || undefined} />
        {successMsg && (
          <div className="p-3 bg-[#39FF14]/15 border border-[#39FF14]/40 rounded-xl text-xs text-theme-accent font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Reward promotion banner */}
        {!customOrder && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Ưu đãi:</strong> Tặng ngay <strong>+20 Điểm thưởng (Reward Points)</strong> khi gửi đánh giá kèm hình ảnh chụp thành phẩm in 3D thực tế!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2 text-center py-2 bg-surface-inset rounded-xl border border-border">
            <label className="text-xs font-semibold text-theme-copy block">
              Mức độ hài lòng về chất lượng in:
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                onChange={setRating}
                size="lg"
                showText
              />
            </div>
          </div>

          {/* Comment Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-theme-copy flex items-center justify-between">
              <span>Nhận xét chi tiết (tùy chọn):</span>
              <span className="text-[11px] text-theme-muted">{comment.length}/2000</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về độ hoàn thiện bề mặt, độ chính xác vạch chia thước, độ sắc nét khi khắc laser và đóng gói giao hàng..."
              className="w-full rounded-xl bg-surface-inset border border-border px-3 py-2.5 text-xs text-theme-ink placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
            />
          </div>

          {/* Image Upload section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-theme-copy flex items-center justify-between">
              <span>Hình ảnh thành phẩm in 3D thực tế ({imageUrls.length}/5):</span>
              {uploadingImage && (
                <span className="text-[11px] text-theme-accent flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
                </span>
              )}
            </label>

            {/* Thumbnail list */}
            <div className="flex flex-wrap gap-2.5">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl border border-border overflow-hidden group bg-surface-inset"
                >
                  <img
                    src={url}
                    alt={`Review ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/80 text-slate-200 hover:text-white transition"
                    title="Xóa ảnh này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 5 && (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/60 text-theme-muted hover:text-theme-accent transition flex flex-col items-center justify-center gap-1 bg-surface-inset active:scale-95 cursor-pointer"
                  title="Thêm ảnh chụp thực tế"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Thêm ảnh</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className={secondary}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className={`${button} min-w-28 flex items-center justify-center gap-1.5`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                </>
              ) : isEditing ? (
                'Lưu Đánh Giá'
              ) : (
                'Gửi Đánh Giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
