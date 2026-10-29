import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import { money } from '../utils/format';
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

  const remote = useRemote<{ status: string; amount: number; orderCode?: string }>(
    isAuthenticated && code && !isCancelled ? `/payments/verify/${encodeURIComponent(code)}` : null
  );

  // Poll if pending
  useEffect(() => {
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

  const displayAmount = remote.data?.amount;
  const rewardPoints = displayAmount ? Math.floor(displayAmount / 1000) : 0;
  const transactionCode = code ? `#ORD-${code}` : '';
  const customerName = user?.name || user?.email || 'Khách hàng';

  return (
    <div className="min-h-[85vh] bg-[#040508] text-slate-200 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* ========================================================================= */}
        {/* CASE 1: LOADING SESSION & VERIFYING PAYOS TRANSACTION                     */}
        {/* ========================================================================= */}
        {isLoading || (remote.loading && !remote.data) ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(57,255,20,0.2)]">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Đang kiểm tra kết quả giao dịch...</h2>
            <p className="text-xs text-slate-400">
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
                  <div className="w-16 h-16 rounded-2xl bg-[#ff9100]/15 border border-[#ff9100]/40 text-[#ff9100] flex items-center justify-center shadow-[0_0_25px_rgba(255,145,0,0.2)]">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ff9100]/20 border border-[#ff9100]/40 text-[#ff9100]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9100] animate-pulse" />
                    ĐÃ HỦY GIAO DỊCH
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Bạn đã dừng giao dịch PayOS!
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Giao dịch thanh toán trực tuyến qua cổng VietQR đã được dừng lại. Tài khoản của bạn chưa bị trừ bất kỳ khoản phí nào. Bạn có thể mở lại đơn hàng để thanh toán lại hoặc chọn phương thức COD khi thuận tiện.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/cart"
                  className="whitespace-nowrap shrink-0 bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold py-3.5 px-6 rounded-xl transition shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Quay lại giỏ hàng</span>
                </Link>

                <Link
                  to="/orders"
                  className="whitespace-nowrap shrink-0 bg-[#11141e] border border-white/10 hover:border-[#39FF14]/40 text-slate-200 py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xem đơn hàng của tôi</span>
                </Link>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Cần hỗ trợ gấp về đơn hàng?</span>
                <Link to="/contact" className="text-[#39FF14] underline hover:text-[#32e012] ml-1">
                  Liên hệ CSKH PrintHub
                </Link>
              </div>
            </div>

            {/* Right Column: Cancelled Receipt */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#0a0c12] border border-white/10 shadow-2xl p-6 relative overflow-hidden space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                    CHI TIẾT GIAO DỊCH
                  </span>
                  <span className="font-mono text-slate-400 text-sm">{transactionCode}</span>
                </div>

                <div className="bg-[#040508] border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">Trạng thái:</span>
                  <span className="text-sm font-bold text-[#ff9100] uppercase tracking-wide font-mono">
                    Chưa thanh toán (HỦY)
                  </span>
                </div>

                <div className="space-y-3.5 text-sm py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cổng thanh toán:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#39FF14]" /> PayOS (VietQR)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Thời gian:</span>
                    <span className="font-mono text-slate-300">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tài khoản:</span>
                    <span className="font-medium text-white">{customerName}</span>
                  </div>
                </div>

                <div className="bg-[#ff9100]/10 border border-[#ff9100]/30 rounded-xl p-3.5 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#ff9100] shrink-0" />
                  <p className="text-xs text-[#ff9100] leading-relaxed">
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
          <div className="max-w-md mx-auto py-16 text-center space-y-5 rounded-3xl bg-[#0a0c12] border border-white/10 p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Xác minh tài khoản</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vui lòng đăng nhập để hệ thống liên kết biên lai và ghi nhận lịch sử đơn hàng cho bạn.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent('/payment-result?' + params.toString())}`}
              className="whitespace-nowrap shrink-0 w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold transition flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            >
              Đăng nhập ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : !code ? (
          /* ========================================================================= */
          /* CASE 3.5: NO TRANSACTION CODE (MISSING ORDER CODE)                        */
          /* ========================================================================= */
          <div className="max-w-md mx-auto py-16 text-center space-y-5 rounded-3xl bg-[#0a0c12] border border-white/10 p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#ff9100]/15 border border-[#ff9100]/40 text-[#ff9100] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,145,0,0.2)]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Không tìm thấy mã giao dịch</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Đường dẫn không chứa thông tin mã giao dịch để đối chiếu với hệ thống thanh toán. Vui lòng kiểm tra lại trạng thái đơn hàng của bạn.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/orders"
                className="whitespace-nowrap shrink-0 px-5 py-2.5 rounded-xl bg-[#39FF14] text-[#040508] font-bold text-xs shadow-lg shadow-[#39FF14]/20 hover:brightness-110 transition"
              >
                Quản lý đơn hàng
              </Link>
              <Link
                to="/quotations"
                className="whitespace-nowrap shrink-0 px-5 py-2.5 rounded-xl bg-[#11141e] border border-white/10 hover:border-[#39FF14]/40 text-slate-200 font-semibold text-xs transition"
              >
                Tiến trình báo giá custom
              </Link>
            </div>
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
                  <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.3)] shrink-0">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                    ĐÃ THANH TOÁN THÀNH CÔNG
                  </span>
                </div>

                {/* Tiêu đề & Nội dung mô tả */}
                <div className="space-y-2.5">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Đã xác nhận thanh toán!
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    Hệ thống đã nhận được tiền. Đơn hàng của bạn đã được cập nhật trạng thái và tự động chuyển sang hàng đợi chuẩn bị gia công in 3D.
                  </p>
                </div>
              </div>

              {/* Nhóm nút bấm hành động (Call To Action) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Primary CTA */}
                <Link
                  to="/orders"
                  className="whitespace-nowrap shrink-0 bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black py-3.5 px-6 rounded-xl transition shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 text-sm text-center"
                >
                  <span>Xem &amp; Theo dõi đơn hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Secondary CTA */}
                <Link
                  to="/custom"
                  className="whitespace-nowrap shrink-0 bg-[#11141e] border border-white/10 hover:border-[#39FF14]/40 text-slate-200 py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm text-center font-semibold"
                >
                  <PlusCircle className="w-4 h-4 text-[#39FF14]" />
                  <span>Gửi yêu cầu in mới</span>
                </Link>
              </div>

              {/* Nút hỗ trợ */}
              <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Cần hỗ trợ gấp về đơn hàng?</span>
                <Link to="/contact" className="text-[#39FF14] underline hover:text-[#32e012] ml-1">
                  Liên hệ CSKH PrintHub
                </Link>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CỘT PHẢI: Hóa đơn điện tử & Trạng thái tiến độ (lg:col-span-6)         */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#0a0c12] border border-white/10 shadow-2xl p-6 relative overflow-hidden space-y-4">
                {/* Header của Card */}
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                    CHI TIẾT THANH TOÁN
                  </span>
                  <span className="font-mono text-white font-bold text-sm">
                    {transactionCode}
                  </span>
                </div>

                {/* Khối số tiền tổng cộng (Highlight Amount) */}
                <div className="bg-[#040508] border border-white/10 rounded-xl p-4 flex justify-between items-center my-4 font-mono">
                  <span className="text-sm font-medium text-slate-300 font-sans">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-[#39FF14] tracking-tight">
                    {displayAmount ? money(displayAmount) : 'Đang đối chiếu...'}
                  </span>
                </div>

                {/* Bảng thông tin chi tiết (Key - Value Rows) */}
                <div className="space-y-3.5 text-sm border-t border-b border-white/10 py-4 my-4 font-mono">
                  {/* Cổng thanh toán */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Cổng thanh toán:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5 font-sans">
                      <CreditCard className="w-4 h-4 text-[#39FF14]" />
                      <span>PayOS (VietQR)</span>
                    </span>
                  </div>

                  {/* Thời gian giao dịch */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Thời gian giao dịch:</span>
                    <span className="text-slate-300">{formattedDate}</span>
                  </div>

                  {/* Tài khoản người mua */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Tài khoản người mua:</span>
                    <span className="font-medium text-white font-sans">{customerName}</span>
                  </div>

                  {/* Điểm thưởng tích lũy */}
                  {rewardPoints > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Điểm thưởng tích lũy:</span>
                      <span className="font-bold text-[#ff9100] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#ff9100]" />
                        <span>+{rewardPoints} xu PrintHub (Đã cộng vào ví)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Thẻ trạng thái tiến độ xưởng in (Printing Queue Mini Tracker) */}
                <div className="bg-[#39FF14]/5 border border-[#39FF14]/30 rounded-xl p-3 flex items-center gap-3">
                  <Printer className="w-5 h-5 text-[#39FF14] shrink-0 animate-pulse" />
                  <p className="text-xs text-slate-300 leading-relaxed">
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
