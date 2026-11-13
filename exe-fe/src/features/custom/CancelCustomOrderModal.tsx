import { useState } from 'react';
import { XCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { destructive, field, ghostBtn, Notice } from '../../components/DataUI';

const PRESET_REASONS = [
  'File STL lỗi / không kín mặt lưới (non-manifold)',
  'Kích thước vượt khổ máy in 3D hiện tại',
  'Hết vật liệu màu khách chọn',
  'Không thể liên hệ xác nhận thông số in',
];

export interface CancelCustomOrderModalProps {
  open: boolean;
  orderId?: string | null;
  orderLabel?: string | null;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (cancelReason: string) => Promise<void> | void;
}

export default function CancelCustomOrderModal({
  open,
  orderId,
  orderLabel,
  submitting = false,
  error = '',
  onClose,
  onConfirm,
}: CancelCustomOrderModalProps) {
  const modalKey = `${open ? 'open' : 'closed'}:${orderId || ''}`;
  const [reasonDraft, setReasonDraft] = useState<{ key: string; value: string }>({ key: '', value: '' });
  const [errorDraft, setErrorDraft] = useState<{ key: string; value: string }>({ key: '', value: '' });

  const reason = reasonDraft.key === modalKey ? reasonDraft.value : '';
  const localError = errorDraft.key === modalKey ? errorDraft.value : '';

  const setReason = (value: string) => setReasonDraft({ key: modalKey, value });
  const setLocalError = (value: string) => setErrorDraft({ key: modalKey, value });

  const trimmed = reason.trim();
  const isValid = trimmed.length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setLocalError('Vui lòng nhập lý do hủy đơn (tối thiểu 5 ký tự).');
      return;
    }
    setLocalError('');
    await onConfirm(trimmed);
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      label="Hủy yêu cầu báo giá"
      className="max-w-lg w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/30 text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hủy yêu cầu báo giá</h3>
              <p className="text-xs text-text-muted">
                {orderId ? `Đơn #${orderId.slice(0, 8)}` : ''}
                {orderLabel ? ` · ${orderLabel}` : ''}
              </p>
            </div>
          </div>
        </div>

        <Notice error={localError || error} />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Chọn nhanh lý do phổ biến</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_REASONS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={submitting}
                onClick={() => {
                  setReason(preset);
                  setLocalError('');
                }}
                className="rounded-lg border border-border bg-surface-inset px-2.5 py-1.5 text-left text-xs text-slate-300 transition-colors hover:border-primary/50 hover:text-white cursor-pointer disabled:opacity-40"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cancel-reason-input" className="block text-xs font-semibold text-slate-300">
            Lý do hủy gửi tới khách hàng <span className="text-red-400">*</span>
          </label>
          <textarea
            id="cancel-reason-input"
            rows={4}
            maxLength={1000}
            value={reason}
            disabled={submitting}
            onChange={(e) => {
              setReason(e.target.value);
              if (localError && e.target.value.trim().length >= 5) setLocalError('');
            }}
            placeholder="Nhập rõ nguyên nhân hủy để khách hàng nắm thông tin (tối thiểu 5 ký tự)..."
            className={field}
          />
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Tối thiểu 5 ký tự · Lưu audit log & thông báo ngay cho khách</span>
            <span className={trimmed.length < 5 ? 'text-amber-400' : 'text-emerald-400'}>
              {trimmed.length}/1000
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border/60 pt-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className={ghostBtn}
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className={destructive}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
