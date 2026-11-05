import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X, Loader2 } from 'lucide-react';
import Modal from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  busy?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'primary',
  busy = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const iconColor = isDanger
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : isWarning
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/30';

  const confirmBtnClass = isDanger
    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50'
    : isWarning
    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-950/50'
    : 'bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black shadow-md shadow-emerald-950/50';

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} label={title}>
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-5 text-slate-100 shadow-xl shadow-black/70 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}>
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-bold text-base text-white tracking-tight">{title}</h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">{description}</div>
          </div>
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              aria-label="Đóng hộp thoại"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2433]">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer ${confirmBtnClass}`}
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

