import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, RotateCcw, ShieldCheck, Wallet, ArrowDownRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type FinanceSummaryData } from '../../services/adminService';
import { PageHeader } from '../../components/DataUI';

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
        title="BÁO CÁO TÀI CHÍNH &amp; ĐỐI SOÁT DOANH THU PLATFORM"
        description="Dữ liệu đối soát tài chính thực tế tổng hợp từ cơ sở dữ liệu các đơn hàng in 3D đã thanh toán qua cổng PayOS (VietQR) và COD."
        badge="Finance Telemetry"
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
          <p className="text-2xl font-black text-[#39FF14] font-mono drop-shadow-[0_0_12px_rgba(57,255,20,0.3)]">
            {formatPrice(data?.platformCommission ?? 0)}đ
          </p>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" /> Duy trì hạ tầng máy in
          </span>
        </div>

        {/* Số dư ví điểm */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00e5ff]/10 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">QUỸ ĐIỂM THƯỞNG HỘI VIÊN</p>
          <p className="text-2xl font-black text-[#00e5ff] font-mono">
            {formatPrice(data?.studentWalletBalance ?? 0)} <span className="text-sm">Xu</span>
          </p>
          <span className="text-xs text-[#00e5ff] font-mono font-bold flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Điểm thưởng sinh viên
          </span>
        </div>

        {/* Thanh toán cho xưởng in */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff9100]/10 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">XƯỞNG GIA CÔNG (95%)</p>
          <p className="text-2xl font-black text-[#ff9100] font-mono">{formatPrice(data?.factoryPayout ?? 0)}đ</p>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#ff9100]" /> Chuyển trả đối tác in
          </span>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-4 text-xs shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
            NHẬT KÝ GIAO DỊCH THANH TOÁN (PAYOS &amp; COD AUDIT)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {data?.recentTransactions?.length ?? 0} GIAO DỊCH GẦN NHẤT
          </span>
        </div>

        <div className="divide-y divide-[#1e2433]/70">
          {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
            <div className="py-12 text-center text-slate-500 font-mono">
              Chưa có giao dịch thanh toán thành công nào được ghi nhận dưới cơ sở dữ liệu.
            </div>
          ) : (
            data.recentTransactions.map((t) => (
              <div key={t.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#11141e]/50 px-2 rounded-xl transition">
                <div className="space-y-1">
                  <span className="font-mono text-[#00e5ff] font-bold text-xs">MÃ GD: #{t.id}</span>
                  <h4 className="font-bold text-white text-xs">{t.type} • {t.user}</h4>
                  <p className="text-slate-400 text-[11px] font-mono">
                    {t.date ? new Date(t.date).toLocaleString('vi-VN') : 'Mới tạo'} • Cổng:{' '}
                    <span className="font-semibold text-[#39FF14]">{t.gateway || 'PayOS VietQR'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#39FF14] font-mono block">
                    +{formatPrice(t.amount)}đ
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0">
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
