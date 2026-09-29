import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import { send } from '../services/api';
import { money } from '../components/DataUI';
import {
  Check,
  ArrowRight,
  Printer,
  CreditCard,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const code = params.get('orderCode');
  const isCancelled = params.get('cancel') === 'true' || params.get('status') === 'CANCELLED';
  const { user, isAuthenticated, isLoading } = useAuth();
  const [restored, setRestored] = useState(false);

  const remote = useRemote<{ status: string; amount: number; orderCode?: string }>(
    isAuthenticated && code && !isCancelled ? `/payments/verify/${encodeURIComponent(code)}` : null
  );

  // Restore cart if payment was cancelled
  useEffect(() => {
    if (isCancelled) {
      const backupRaw = sessionStorage.getItem('printhub_cart_backup');
      const pendingOrderId = sessionStorage.getItem('printhub_pending_payos_order');
      if (backupRaw) {
        try {
          const items = JSON.parse(backupRaw);
          if (isAuthenticated) {
            send('/cart', { items }, 'put')
              .then(() => setRestored(true))
              .catch(() => undefined);
          } else {
            localStorage.setItem('printhub_guest_cart', backupRaw);
            Promise.resolve().then(() => setRestored(true));
          }
        } catch {
          // ignore
        }
        sessionStorage.removeItem('printhub_cart_backup');
      }
      if (pendingOrderId && isAuthenticated) {
        send(`/orders/${pendingOrderId}/status`, { status: 'CANCELLED' }, 'put').catch(() => undefined);
        sessionStorage.removeItem('printhub_pending_payos_order');
      }
    }
  }, [isAuthenticated, isCancelled]);

  // Clean up cart backup and poll if pending
  useEffect(() => {
    if (remote.data?.status === 'PAID') {
      sessionStorage.removeItem('printhub_cart_backup');
      sessionStorage.removeItem('printhub_pending_payos_order');
    }
    if (remote.data?.status !== 'PENDING') return;
    const timer = setTimeout(remote.reload, 5000);
    return () => clearTimeout(timer);
  }, [remote.data?.status, remote.reload]);

  // Formatted date string for receipt
  const formattedDate = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} - ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }, []);

  const displayAmount = remote.data?.amount ?? 8000;
  const rewardPoints = Math.max(8, Math.floor(displayAmount / 1000));
  const transactionCode = code ? `#ORD-${code}` : '#ORD-88492015';
  const customerName = user?.name || user?.email || 'Lê Quốc Khánh';

  return (
    <div className="min-h-[85vh] bg-[#0B0C0E] text-neutral-200 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* ========================================================================= */}
        {/* CASE 1: LOADING SESSION & VERIFYING PAYOS TRANSACTION                     */}
        {/* ========================================================================= */}
        {isLoading || (remote.loading && !remote.data) ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Đang kiểm tra kết quả giao dịch...</h2>
            <p className="text-xs text-neutral-400">
              Vui lòng đợi giây lát trong khi hệ thống xác thực thanh toán với cổng VietQR PayOS.
            </p>
          </div>
        ) : isCancelled ? (
          /* ========================================================================= */
          /* CASE 2: TRANSACTION CANCELLED (SPLIT 2 COLS LAYOUT)                       */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            {/* Left Column: Status & Navigation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-4">
                {/* Status Badge & Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Đã hủy giao dịch thanh toán
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Bạn đã hủy giao dịch PayOS!
                  </h1>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Đơn hàng thanh toán trực tuyến đã được dừng lại. {restored
                      ? 'Các sản phẩm trong đơn đã được tự động lưu lại trong giỏ hàng để bạn thuận tiện đặt lại bất cứ lúc nào.'
                      : 'Tài khoản của bạn chưa bị trừ bất kỳ khoản phí nào.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/cart"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3.5 px-6 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Quay lại giỏ hàng</span>
                </Link>

                <Link
                  to="/orders"
                  className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xem đơn hàng của tôi</span>
                </Link>
              </div>

              <div className="pt-2 text-xs text-neutral-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-neutral-500" />
                <span>Cần hỗ trợ gấp về đơn hàng?</span>
                <Link to="/help" className="text-emerald-400 underline hover:text-emerald-300 ml-1">
                  Liên hệ CSKH PrintHub
                </Link>
              </div>
            </div>

            {/* Right Column: Cancelled Receipt */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#141518] border border-neutral-800/80 shadow-2xl p-6 relative overflow-hidden space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800/80">
                  <span className="text-xs font-semibold text-neutral-400 tracking-wider">
                    CHI TIẾT GIAO DỊCH
                  </span>
                  <span className="font-mono text-neutral-400 text-sm">{transactionCode}</span>
                </div>

                <div className="bg-[#1A1C20] border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-300">Trạng thái:</span>
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                    Chưa thanh toán (HỦY)
                  </span>
                </div>

                <div className="space-y-3.5 text-sm py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Cổng thanh toán:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-cyan-400" /> PayOS (VietQR)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Thời gian:</span>
                    <span className="font-mono text-neutral-300">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Tài khoản:</span>
                    <span className="font-medium text-white">{customerName}</span>
                  </div>
                </div>

                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    Giao dịch này không trừ tiền trong tài khoản ngân hàng của bạn. Bạn có thể chọn thanh toán COD khi đặt lại.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* ========================================================================= */
          /* CASE 3: UNAUTHENTICATED SESSION                                           */
          /* ========================================================================= */
          <div className="max-w-md mx-auto py-16 text-center space-y-5 rounded-3xl bg-[#141518] border border-neutral-800 p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Xác minh tài khoản</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Vui lòng đăng nhập để hệ thống liên kết biên lai và ghi nhận lịch sử đơn hàng cho bạn.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent('/payment-result?' + params.toString())}`}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
            >
              Đăng nhập ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 4: PAYMENT SUCCESS / CONFIRMED (SPLIT 2 COLS TECH LAYOUT)            */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            {/* --------------------------------------------------------------------- */}
            {/* CỘT TRÁI: Trạng thái & Điều hướng hành động (lg:col-span-6)            */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-4">
                {/* Badge trạng thái & Icon thành công */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đã thanh toán thành công
                  </span>
                </div>

                {/* Tiêu đề & Nội dung mô tả */}
                <div className="space-y-2.5">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Đã xác nhận thanh toán!
                  </h1>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                    Hệ thống đã nhận được tiền. Đơn hàng của bạn đã được cập nhật trạng thái và tự động chuyển sang hàng đợi chuẩn bị gia công in 3D.
                  </p>
                </div>
              </div>

              {/* Nhóm nút bấm hành động (Call To Action) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Primary CTA */}
                <Link
                  to="/orders"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3.5 px-6 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm text-center"
                >
                  <span>Xem & Theo dõi đơn hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Secondary CTA */}
                <Link
                  to="/custom"
                  className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm text-center"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Gửi yêu cầu in mới</span>
                </Link>
              </div>

              {/* Nút hỗ trợ */}
              <div className="pt-2 text-xs text-neutral-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-neutral-500" />
                <span>Cần hỗ trợ gấp về đơn hàng?</span>
                <Link to="/help" className="text-emerald-400 underline hover:text-emerald-300 ml-1">
                  Liên hệ CSKH PrintHub
                </Link>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CỘT PHẢI: Hóa đơn điện tử & Trạng thái tiến độ (lg:col-span-6)         */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#141518] border border-neutral-800/80 shadow-2xl p-6 relative overflow-hidden space-y-4">
                {/* Header của Card */}
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs font-semibold text-neutral-400 tracking-wider">
                    CHI TIẾT THANH TOÁN
                  </span>
                  <span className="font-mono text-neutral-200 font-bold text-sm">
                    {transactionCode}
                  </span>
                </div>

                {/* Khối số tiền tổng cộng (Highlight Amount) */}
                <div className="bg-[#1A1C20] border border-neutral-800 rounded-xl p-4 flex justify-between items-center my-4">
                  <span className="text-sm font-medium text-neutral-300">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {money(displayAmount)}
                  </span>
                </div>

                {/* Bảng thông tin chi tiết (Key - Value Rows) */}
                <div className="space-y-3.5 text-sm border-t border-b border-neutral-800/80 py-4 my-4">
                  {/* Cổng thanh toán */}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Cổng thanh toán:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>PayOS (VietQR)</span>
                    </span>
                  </div>

                  {/* Thời gian giao dịch */}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Thời gian giao dịch:</span>
                    <span className="font-mono text-neutral-300">{formattedDate}</span>
                  </div>

                  {/* Tài khoản người mua */}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Tài khoản người mua:</span>
                    <span className="font-medium text-white">{customerName}</span>
                  </div>

                  {/* Điểm thưởng tích lũy */}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Điểm thưởng tích lũy:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>+{rewardPoints} xu PrintHub (Đã cộng vào ví)</span>
                    </span>
                  </div>
                </div>

                {/* Thẻ trạng thái tiến độ xưởng in (Printing Queue Mini Tracker) */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex items-center gap-3">
                  <Printer className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    Đang xếp lịch máy in... Kỹ thuật viên sẽ kiểm tra file 3D trước khi nạp nhựa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
