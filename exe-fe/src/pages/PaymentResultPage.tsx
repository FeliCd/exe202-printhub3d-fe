import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentResultPage() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-primary/20 text-[#22c55e] flex items-center justify-center mx-auto border border-[#22c55e]/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white">Thanh Toán Đơn Hàng Thành Công</h2>
        <p className="text-sm text-text-muted mt-1">PrintHub đã ghi nhận đơn hàng và chuyển sang xưởng in 3D.</p>
      </div>

      <div className="p-4 bg-surface-inset border border-border rounded-xl text-xs space-y-1.5 text-left text-text-muted">
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Mã giao dịch:</span> <span className="font-mono text-white">TXN-902182</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Cổng thanh toán:</span> <span className="text-emerald-400">VietQR / PayOS</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Trạng thái:</span> <span className="text-emerald-400 font-bold">Thành Công (Success)</span></div>
      </div>

      <div className="pt-2 flex gap-2">
        <Link to="/orders" className="flex-1 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs flex items-center justify-center gap-1">
          Theo Dõi Đơn Hàng <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/catalog" className="flex-1 py-3 rounded-xl bg-surface-raised text-slate-200 font-bold text-xs">
          Đặt In Thước
        </Link>
      </div>
    </div>
  );
}