import Modal from './Modal';
import { ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LockOverlayModal() {
  const { user, unlockAccount } = useAuth();

  if (!user?.isLocked) return null;

  return (
    <Modal open={true} label="Tài khoản bị tạm khóa">
      <div className="w-full max-w-md bg-surface border-2 border-red-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-800">
            TÀI KHOẢN BỊ TẠM KHÓA GIAO DỊCH
          </span>
          <h3 className="text-xl font-black text-white mt-2">Cảnh Báo Vi Phạm &amp; Khóa Hệ Thống</h3>
          <p className="text-sm text-slate-300 mt-2 bg-surface-inset p-3 rounded-xl border border-border text-left">
            <span className="font-bold text-red-400 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4" /> Lý do tạm khóa:
            </span>
            {user.lockReason || 'Tài khoản chưa hoàn tất nghĩa vụ đền bù đơn hàng vi phạm quy chuẩn thiết kế.'}
          </p>
        </div>

        <div className="text-xs text-text-muted space-y-1 text-left bg-brand-surface">
          <p className="font-semibold text-slate-200">Hành động khắc phục:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Liên hệ Bộ phận Hỗ trợ Tranh chấp Admin PrintHub</li>
            <li>Nạp bổ sung tiền ký quỹ đền bù vào ví PrintHub</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={unlockAccount}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            Mô Phỏng Mở Khóa Tài Khoản (Admin Sandbox)
          </button>
        </div>
      </div>
    </Modal>
  );
}
