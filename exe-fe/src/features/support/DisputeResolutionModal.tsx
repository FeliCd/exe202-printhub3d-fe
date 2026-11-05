import React, { useState } from 'react';
import { Scale, X, Loader2, DollarSign } from 'lucide-react';
import Modal from '../../components/Modal';
import { money } from '../../utils/format';

export interface DisputeResolutionTarget {
  disputeId: string;
  orderId?: string;
  buyerName?: string;
  maxAmount: number;
  status: 'RESOLVED' | 'REJECTED';
}

interface Props {
  target: DisputeResolutionTarget | null;
  onClose: () => void;
  onSubmit: (payload: {
    status: 'RESOLVED' | 'REJECTED';
    resolutionNote: string;
    refundAmount: number;
    refundType: 'FULL' | 'PARTIAL';
  }) => Promise<void>;
  busy?: boolean;
}

export default function DisputeResolutionModal({ target, onClose, onSubmit, busy = false }: Props) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!target) return null;

  const isResolved = target.status === 'RESOLVED';

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolutionNote.trim()) {
      setError('Vui lòng nhập kết luận / lý do giải quyết tranh chấp.');
      return;
    }

    if (isResolved) {
      if (!Number.isFinite(refundAmount) || refundAmount < 0 || refundAmount > target.maxAmount) {
        setError(`Số tiền hoàn trả không hợp lệ (từ 0đ đến tối đa ${money(target.maxAmount)}).`);
        return;
      }
    }

    const finalRefund = isResolved ? refundAmount : 0;
    const refundType = finalRefund === target.maxAmount ? 'FULL' : 'PARTIAL';

    await onSubmit({
      status: target.status,
      resolutionNote: resolutionNote.trim(),
      refundAmount: finalRefund,
      refundType,
    });
  };

  return (
    <Modal open={!!target} onClose={busy ? undefined : onClose} label="Giải quyết tranh chấp">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-5 text-slate-100 shadow-xl shadow-black/70 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 border-b border-[#1e2433] pb-3.5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isResolved ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isResolved ? 'Giải Quyết Tranh Chấp & Hoàn Tiền' : 'Từ Chối Khiếu Nại Tranh Chấp'}
              </h3>
              <p className="text-xs text-slate-400">
                Đơn hàng: <span className="font-mono text-slate-200 font-bold">#{target.orderId || target.disputeId.substring(0, 8)}</span>
                {target.buyerName ? ` · Khách hàng: ${target.buyerName}` : ''}
              </p>
            </div>
          </div>
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between">
              <span>{isResolved ? 'Kết luận giải quyết khiếu nại (bắt buộc):' : 'Lý do từ chối khiếu nại (bắt buộc):'}</span>
            </label>
            <textarea
              required
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={isResolved ? 'Ghi rõ phương án xử lý (hoàn tiền, đổi phôi in mới, chấp thuận phản hồi)...' : 'Ghi rõ lý do không thể chấp thuận khiếu nại này...'}
              disabled={busy}
              className="w-full p-3 rounded-xl bg-[#040508] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#39FF14] focus:outline-none transition leading-relaxed resize-none"
            />
          </div>

          {isResolved && (
            <div className="space-y-2 pt-1 border-t border-[#1e2433]">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Số tiền hoàn trả (VNĐ):</span>
                </label>
                <span className="text-slate-400 text-[11px] font-mono">
                  Tối đa: <strong className="text-white">{money(target.maxAmount)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={target.maxAmount}
                  step={1000}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                  disabled={busy}
                  className="flex-1 p-2.5 rounded-xl bg-[#040508] border border-white/10 text-white font-mono font-bold text-sm focus:border-[#39FF14] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setRefundAmount(target.maxAmount)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 transition cursor-pointer"
                >
                  Hoàn 100%
                </button>
                <button
                  type="button"
                  onClick={() => setRefundAmount(0)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 transition cursor-pointer"
                >
                  0đ
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Số tiền sẽ hoàn: <strong className="text-[#39FF14] font-mono">{money(refundAmount)}</strong>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2433]">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={busy}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
                isResolved
                  ? 'bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black shadow-md shadow-emerald-950/50'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50'
              }`}
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isResolved ? 'Xác Nhận Giải Quyết' : 'Xác Nhận Từ Chối'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

