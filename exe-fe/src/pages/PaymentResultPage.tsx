import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentResultPage() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#18191d] border border-[#272930] text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto border border-[#22c55e]/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white">Giao Dịch Nạp Tiền / Thanh Toán Thành Công</h2>
        <p className="text-xs text-[#94a3b8] mt-1">Hệ thống Ví PrintHub đã ghi nhận biến động số dư.</p>
      </div>

      <div className="p-4 bg-[#111215] border border-[#272930] rounded-xl text-xs space-y-1.5 text-left text-[#94a3b8]">
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Mã giao dịch:</span> <span className="font-mono text-white">TXN-902182</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Cổng thanh toán:</span> <span className="text-emerald-400">VietQR / VNPay</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Trạng thái:</span> <span className="text-emerald-400 font-bold">Thành Công (Success)</span></div>
      </div>

      <div className="pt-2 flex gap-2">
        <Link to="/wallet" className="flex-1 py-3 rounded-xl bg-[#22c55e] text-slate-950 font-bold text-xs flex items-center justify-center gap-1">
          Xem Ví PrintHub <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/catalog" className="flex-1 py-3 rounded-xl bg-[#1e2025] text-slate-200 font-bold text-xs">
          Đặt In Thước
        </Link>
      </div>
    </div>
  );
}
