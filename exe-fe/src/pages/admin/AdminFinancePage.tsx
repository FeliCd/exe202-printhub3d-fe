import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, RotateCcw, ShieldCheck} from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type FinanceSummaryData } from '../../services/adminService';
import { PageHeader } from '../../components/DataUI';

// Định dạng trạng thái giao dịch: Thành công (xanh) - Hủy (đỏ) - Pending (vàng)
const getTransactionStatusMeta = (rawStatus?: string) => {
  const s = (rawStatus || '').toUpperCase();
  if (s.includes('THÀNH CÔNG') || s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') {
    return {
      label: rawStatus || 'Thành công',
      badgeClass: 'bg-emerald-500/15 text-[#39FF14] border-emerald-500/40',
      dotClass: 'bg-[#39FF14] ring-[#39FF14]/30',
      amountClass: 'text-[#39FF14]',
      prefix: '+',
    };
  }
  if (s.includes('HỦY') || s.includes('HUY') || s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED' || s === 'EXPIRED') {
    return {
      label: s === 'EXPIRED' ? 'Hết hạn' : (rawStatus || 'Đã hủy'),
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      dotClass: 'bg-rose-400 ring-rose-400/30',
      amountClass: 'text-rose-400/80',
      prefix: '',
    };
  }
  // Pending / Chờ thanh toán / Chờ xử lý
  return {
    label: s === 'UNPAID' ? 'Chưa thanh toán' : (rawStatus || 'Chờ thanh toán (Pending)'),
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400 ring-amber-400/30',
    amountClass: 'text-amber-300',
    prefix: '',
  };
};

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getFinanceSummary();
      if (res) {
        setData(res);
      }
    } catch (err: unknown) {
      console.error('Lỗi tải báo cáo tài chính:', err);
      setError('Không thể kết nối máy chủ để lấy số liệu tài chính.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      <PageHeader
        title="ĐỐI SOÁT TÀI CHÍNH"
        icon={DollarSign}
        actions={
          <button
            onClick={fetchFinance}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] font-mono font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#39FF14] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'ĐANG ĐỐI SOÁT...' : 'LÀM MỚI SỐ LIỆU'}</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono font-medium">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/5 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">TỔNG DOANH SỐ GMV</p>
          <p className="text-2xl font-black text-white font-mono">{formatPrice(data?.totalGmv ?? 0)}đ</p>
          <span className="text-xs text-[#39FF14] font-mono font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tổng giá trị đơn hoàn tất
          </span>
        </div>

        {/* Lợi nhuận sàn 5% */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/10 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">CHIẾT KHẤU SÀN (5%)</p>
          <p className="text-2xl font-black text-[#39FF14] font-mono ">
            {formatPrice(data?.platformCommission ?? 0)}đ
          </p>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" /> Duy trì hạ tầng máy in
          </span>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-4 text-xs shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] ring-2 ring-[#39FF14]/40" />
            NHẬT KÝ GIAO DỊCH THANH TOÁN (PAYOS &amp; COD AUDIT)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {data?.recentTransactions?.length ?? 0} GIAO DỊCH GẦN NHẤT
          </span>
        </div>

        <div className="divide-y divide-[#1e2433]/70">
          {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
            <div className="py-12 text-center text-slate-500 font-mono">
              Chưa có giao dịch thanh toán nào được ghi nhận dưới cơ sở dữ liệu.
            </div>
          ) : (
            data.recentTransactions.map((t) => {
              const meta = getTransactionStatusMeta(t.status);
              return (
                <div key={t.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#11141e]/50 px-2 rounded-xl transition">
                  <div className="space-y-1">
                    <span className="font-mono text-[#00e5ff] font-bold text-xs">MÃ GD: #{t.id}</span>
                    <h4 className="font-bold text-white text-xs">{t.type} • {t.user}</h4>
                    <p className="text-slate-400 text-[11px] font-mono">
                      {t.date ? new Date(t.date).toLocaleString('vi-VN') : 'Mới tạo'} • Cổng:{' '}
                      <span className="font-semibold text-slate-200">{t.gateway || 'PayOS VietQR'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black font-mono block ${meta.amountClass}`}>
                      {meta.prefix}{formatPrice(t.amount)}đ
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${meta.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ring-2 ${meta.dotClass}`} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
