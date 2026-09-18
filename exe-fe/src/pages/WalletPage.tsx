import Modal from '../components/Modal';
import { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, Plus, History, Lock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../utils/format';
import PasscodeModal from '../components/PasscodeModal';

export default function WalletPage() {
  const { balance, transactions, deposit } = useWallet();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);

  const handleDepositInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositModalOpen(false);
    setPasscodeModalOpen(true);
  };

  const handlePasscodeSuccess = () => {
    deposit(depositAmount, 'QR Code Ngân Hàng QuickPay');
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-[#22c55e]">
          <WalletIcon className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Ví Điện Tử PrintHub &amp; Quản Lý Tài Chính</h1>
        </div>
        <p className="text-sm text-text-muted">
          Thanh toán nhanh đơn in 3D, nhận tiền hoàn bảo hành và bảo mật giao dịch bằng mã Passcode PIN.
        </p>
      </div>

      {/* Balance Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#18191d] via-[#111215] to-[#1e2025] border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Số dư Ví PrintHub khả dụng
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {formatPrice(balance)} <span className="text-lg font-normal text-[#22c55e]">VNĐ</span>
          </div>
          <p className="text-sm text-emerald-400 font-semibold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Mã bảo mật Passcode PIN 6 số: Đang kích hoạt (123456)
          </p>
        </div>

        <button
          onClick={() => setDepositModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nạp Tiền Vào Ví
        </button>
      </div>

      {/* Transactions History */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-[#22c55e]" /> Lịch Sử Biến Động Số Dư Ví
        </h3>

        <div className="divide-y divide-[#272930]/60">
          {transactions.map((t) => (
            <div key={t.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    t.type === 'DEPOSIT' || t.type === 'REFUND'
                      ? 'bg-emerald-500/10 text-[#22c55e] border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {t.type === 'DEPOSIT' || t.type === 'REFUND' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t.description}</p>
                  <p className="text-sm text-text-muted">{t.date} • Mã GD: {t.id}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-black text-sm ${
                    t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-[#22c55e]' : 'text-slate-200'
                  }`}
                >
                  {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}{formatPrice(t.amount)}đ
                </p>
                <span className="text-xs font-bold text-emerald-400 uppercase">Thành công</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Deposit */}
      {depositModalOpen && (
        <Modal open={depositModalOpen} onClose={() => setDepositModalOpen(false)} label="Nạp tiền vào ví">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <h3 className="font-bold text-white text-base">Nạp Tiền Vào Ví PrintHub</h3>
              <button aria-label="Đóng nạp tiền" onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDepositInitiate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Chọn số tiền cần nạp (VNĐ)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`p-2.5 rounded-xl border font-bold transition ${
                        depositAmount === amt
                          ? 'border-[#22c55e] bg-primary/15 text-[#22c55e]'
                          : 'border-border bg-surface-inset text-slate-300'
                      }`}
                    >
                      {formatPrice(amt)}đ
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-surface-inset border border-border rounded-xl text-center space-y-1">
                <p className="font-bold text-white">Quét mã QR Chuyển Khoản Nhanh</p>
                <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center font-mono font-bold text-black text-xs">
                  [QR VIETQR]
                </div>
                <p className="text-sm text-text-muted">Nạp tự động không mất phí giao dịch</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs"
              >
                Xác Nhận Qua Mã Passcode
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* Passcode Modal for Wallet Security */}
      <PasscodeModal
        isOpen={passcodeModalOpen}
        title="Xác Thực Nạp Tiền Vào Ví"
        subtitle={`Nhập mã PIN 6 số để hoàn tất cộng +${formatPrice(depositAmount)}đ`}
        onSuccess={handlePasscodeSuccess}
        onClose={() => setPasscodeModalOpen(false)}
      />
    </div>
  );
}
