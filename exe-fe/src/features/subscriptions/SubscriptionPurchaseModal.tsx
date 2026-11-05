import { Sparkles, QrCode, X, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import { money } from '../../utils/format';

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays?: number;
  discountPercent?: number;
  pointsReward?: number;
  pointsCost?: number;
  active?: boolean;
  priorityQueue?: boolean;
  freeShippingThreshold?: number;
}

interface Props {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
}

export default function SubscriptionPurchaseModal({ plan, open, onClose, onConfirm, busy = false }: Props) {
  if (!plan) return null;

  const duration = plan.durationDays || 30;

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} label="Xác nhận mua gói hội viên">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-5 text-slate-100 shadow-xl shadow-black/70 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1e2433] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#39FF14]">
                XÁC NHẬN GIAO DỊCH HỘI VIÊN
              </span>
              <h3 className="font-bold text-lg text-white">
                Gói {plan.name}
              </h3>
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

        {/* Tóm tắt gói */}
        <div className="p-4 rounded-xl bg-[#040508] border border-[#1e2433] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Thời hạn sử dụng đặc quyền:</span>
            <span className="font-bold text-white font-mono text-sm">{duration} ngày</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Chiết khấu gia công in 3D:</span>
            <span className="font-bold text-[#39FF14] font-mono text-sm">Giảm {plan.discountPercent || 0}% trọn gói</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Phương thức thanh toán:</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Chuyển khoản VietQR (PayOS)</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300 font-semibold text-sm">Tổng tiền thanh toán:</span>
            <span className="text-xl font-black text-[#39FF14] font-mono">{money(plan.price || 0)}</span>
          </div>
        </div>

        {/* Thông tin an toàn */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#11141e] border border-white/10 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#00e5ff] shrink-0" />
          <span>Giao dịch được xử lý bảo mật tự động qua cổng VietQR PayOS. Quyền lợi gói hội viên sẽ được kích hoạt tức thì sau khi quét mã thành công.</span>
        </div>

        {/* Actions */}
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
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className="px-6 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs transition flex items-center gap-2 disabled:opacity-50 shadow-md shadow-emerald-950/50 cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Khởi Tạo...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận & Mở VietQR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

