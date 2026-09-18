import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentResultPage() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-primary/20 text-[#22c55e] flex items-center justify-center mx-auto border border-[#22c55e]/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white">Giao Dß╗ïch Nß║íp Tiß╗ün / Thanh To├ín Th├ánh C├┤ng</h2>
        <p className="text-sm text-text-muted mt-1">Hß╗ç thß╗æng V├¡ PrintHub ─æ├ú ghi nhß║¡n biß║┐n ─æß╗Öng sß╗æ d╞░.</p>
      </div>

      <div className="p-4 bg-surface-inset border border-border rounded-xl text-xs space-y-1.5 text-left text-text-muted">
        <div className="flex justify-between"><span className="text-slate-300 font-bold">M├ú giao dß╗ïch:</span> <span className="font-mono text-white">TXN-902182</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Cß╗òng thanh to├ín:</span> <span className="text-emerald-400">VietQR / VNPay</span></div>
        <div className="flex justify-between"><span className="text-slate-300 font-bold">Trß║íng th├íi:</span> <span className="text-emerald-400 font-bold">Th├ánh C├┤ng (Success)</span></div>
      </div>

      <div className="pt-2 flex gap-2">
        <Link to="/wallet" className="flex-1 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs flex items-center justify-center gap-1">
          Xem V├¡ PrintHub <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/catalog" className="flex-1 py-3 rounded-xl bg-surface-raised text-slate-200 font-bold text-xs">
          ─Éß║╖t In Th╞░ß╗¢c
        </Link>
      </div>
    </div>
  );
}