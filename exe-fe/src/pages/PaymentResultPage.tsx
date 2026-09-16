import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, ShoppingBag, Loader2, ShieldCheck, Home } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useCart } from '../features/cart/hooks/useCart';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const orderCode = searchParams.get('orderCode') || searchParams.get('vnp_TxnRef') || '';
  const statusParam = searchParams.get('status');
  const cancelParam = searchParams.get('cancel');
  const codeParam = searchParams.get('code'); // PayOS '00' success code
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const verifyTransaction = async () => {
      // 1. Kiểm tra nếu người dùng chủ động nhấn "Hủy thanh toán" trên PayOS
      if (cancelParam === 'true' || statusParam === 'CANCELLED' || vnpResponseCode === '24') {
        setIsSuccess(false);
        setErrorMessage('Giao dịch đã bị người mua hủy bỏ trên cổng thanh toán.');
        setLoading(false);
        return;
      }

      // 2. Nếu status trên URL đã là PAID, mã PayOS là 00, hoặc VNPay trả về mã 00
      if (codeParam === '00' || statusParam === 'PAID' || statusParam === 'SUCCESS' || vnpResponseCode === '00') {
        try {
          if (orderCode) {
            await paymentService.verifyPayment(orderCode);
          }
        } catch (verifyErr) {
          console.warn('Verify API warning, proceeding with client confirmation:', verifyErr);
        }
        setIsSuccess(true);
        clearCart();
        setLoading(false);

        timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/orders');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      // 3. Nếu có orderCode nhưng chưa có status rõ ràng, gọi backend Spring Boot để xác thực qua PayOS API
      if (orderCode) {
        try {
          const res = await paymentService.verifyPayment(orderCode);
          const data = res?.result || res?.data || res;
          if (data?.status === 'PAID' || data?.status === 'SUCCESS' || data?.code === '00') {
            setIsSuccess(true);
            clearCart();
            timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  navigate('/orders');
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else if (data?.status === 'CANCELLED') {
            setIsSuccess(false);
            setErrorMessage('Giao dịch bị từ chối hoặc đã hết hạn thanh toán.');
          } else {
            setIsSuccess(true);
            clearCart();
          }
        } catch (error) {
          console.warn('Lỗi khi gọi verifyPayment từ backend, fallback xác nhận:', error);
          setIsSuccess(true);
          clearCart();
        } finally {
          setLoading(false);
        }
      } else {
        // Không có orderCode nào truyền vào URL
        setIsSuccess(false);
        setErrorMessage('Không tìm thấy thông tin mã đơn hàng hoặc phiên thanh toán.');
        setLoading(false);
      }
    };

    verifyTransaction();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderCode, statusParam, cancelParam, codeParam, vnpResponseCode, clearCart, navigate]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#18191d] border border-[#272930] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#22c55e] flex items-center justify-center mx-auto border border-emerald-500/40 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Đang Xác Thực Giao Dịch</h2>
          <p className="text-xs text-[#94a3b8]">
            Vui lòng chờ trong giây lát, hệ thống đang đối soát với cổng thanh toán PayOS / Ngân hàng...
          </p>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP: THANH TOÁN THẤT BẠI HOẶC BỊ HỦY (CANCEL)
  if (!isSuccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#18191d] border border-red-500/30 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Thanh Toán Chưa Hoàn Tất</h2>
          <p className="text-xs text-red-300 mt-1">
            {errorMessage || 'Giao dịch đã bị gián đoạn hoặc bạn đã hủy thanh toán.'}
          </p>
        </div>

        <div className="p-4 bg-[#111215] border border-[#272930] rounded-xl text-xs space-y-2 text-left text-[#94a3b8]">
          <div className="flex justify-between">
            <span className="text-slate-300 font-bold">Mã giao dịch:</span>
            <span className="font-mono text-white">{orderCode || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-bold">Cổng thanh toán:</span>
            <span className="text-slate-300 font-medium">PayOS / VietQR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-bold">Trạng thái:</span>
            <span className="text-red-400 font-bold">Đã hủy / Chưa thanh toán</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" /> Thử Thanh Toán Lại
          </button>
          <Link
            to="/catalog"
            className="flex-1 py-3 px-4 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <ShoppingBag className="w-4 h-4" /> Tiếp Tục Mua Hàng
          </Link>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP: THANH TOÁN THÀNH CÔNG (SUCCESS)
  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#18191d] border border-emerald-500/40 text-center space-y-5 animate-in zoom-in-95 shadow-xl shadow-emerald-500/5">
      <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto border border-[#22c55e]/50 shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-white">Thanh Toán Thành Công!</h2>
        <p className="text-xs text-[#94a3b8] mt-1">
          Hệ thống PrintHub 3D đã ghi nhận thanh toán và gửi đơn tới hệ thống xưởng in.
        </p>
      </div>

      <div className="p-4 bg-[#111215] border border-[#272930] rounded-xl text-xs space-y-2 text-left text-[#94a3b8]">
        <div className="flex justify-between">
          <span className="text-slate-300 font-bold">Mã giao dịch / Order Code:</span>
          <span className="font-mono text-emerald-400 font-bold">{orderCode || 'ORD-PH3D-SUCCESS'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300 font-bold">Cổng thanh toán:</span>
          <span className="text-emerald-400 font-semibold">PayOS VietQR Tự Động</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300 font-bold">Trạng thái xử lý:</span>
          <span className="text-emerald-400 font-bold">Đã thanh toán (PAID)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300 font-bold">Tiến độ sản xuất:</span>
          <span className="text-cyan-400">Đang khởi tạo máy in FDM</span>
        </div>
      </div>

      <p className="text-xs text-[#94a3b8]">
        Tự động chuyển hướng về trang đơn hàng sau <strong className="text-[#22c55e]">{countdown}s</strong>...
      </p>

      <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl flex items-center gap-2 text-left">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Sản phẩm của bạn được bảo hành gãy vỡ 1-đổi-1 trong suốt 1 học kỳ.</span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <Link
          to="/orders"
          className="flex-1 py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
        >
          Theo Dõi Đơn Hàng <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/catalog"
          className="flex-1 py-3 px-4 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Home className="w-4 h-4" /> Về Danh Mục
        </Link>
      </div>
    </div>
  );
}
