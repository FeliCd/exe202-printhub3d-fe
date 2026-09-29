import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, RotateCcw, ShieldCheck, Wallet, ArrowDownRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type FinanceSummaryData } from '../../services/adminService';

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
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <DollarSign className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Báo Cáo Tài Chính &amp; Doanh Thu Platform (Finance &amp; Revenue)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Dữ liệu đối soát tài chính thực tế tổng hợp từ cơ sở dữ liệu các đơn hàng đã thanh toán và cổng PayOS/COD
          </p>
        </div>

        <button
          onClick={fetchFinance}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-[#39FF14] text-slate-200 hover:text-[#39FF14] font-bold text-xs flex items-center gap-2 transition shadow-sm shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
          <span>{loading ? 'Đang đối soát...' : 'Làm mới số liệu'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <p className="text-xs text-text-muted">Tổng Doanh Số GMV Hệ Thống</p>
          <p className="text-2xl font-black text-white">{formatPrice(data?.totalGmv ?? 0)}đ</p>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Tổng giá trị đơn hoàn tất
          </span>
        </div>

        {/* Lợi nhuận sàn 5% */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <p className="text-xs text-text-muted">Lợi Nhuận Chiết Khấu Sàn (5%)</p>
          <p className="text-2xl font-black text-[#39FF14]">{formatPrice(data?.platformCommission ?? 0)}đ</p>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Thu phí sàn duy trì hạ tầng
          </span>
        </div>

        {/* Số dư ví điểm */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <p className="text-xs text-text-muted">Số Dư Điểm Thưởng Hội Viên</p>
          <p className="text-2xl font-black text-cyan-400">
            {formatPrice(data?.studentWalletBalance ?? 0)} Điểm
          </p>
          <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Điểm tích lũy sinh viên
          </span>
        </div>

        {/* Thanh toán cho xưởng in */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <p className="text-xs text-text-muted">Doanh Thu Xưởng In Đối Tác (95%)</p>
          <p className="text-2xl font-black text-purple-400">{formatPrice(data?.factoryPayout ?? 0)}đ</p>
          <span className="text-xs text-text-muted flex items-center gap-0.5">
            <ArrowDownRight className="w-3 h-3 text-purple-400" /> Chuyển trả đơn vị gia công
          </span>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Nhật Ký Giao Dịch Thanh Toán Thực Tế (PayOS &amp; COD)
          </h3>
          <span className="text-xs text-text-muted font-mono">
            {data?.recentTransactions?.length ?? 0} giao dịch gần nhất
          </span>
        </div>

        <div className="divide-y divide-[#272930]">
          {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
            <div className="py-8 text-center text-text-muted">
              Chưa có giao dịch thanh toán thành công nào được ghi nhận dưới cơ sở dữ liệu.
            </div>
          ) : (
            data.recentTransactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-purple-400 font-bold">#{t.id}</span>
                  <h4 className="font-bold text-white text-xs">{t.type} • {t.user}</h4>
                  <p className="text-text-muted text-xs">
                    {t.date ? new Date(t.date).toLocaleString('vi-VN') : 'Mới tạo'} • Cổng:{' '}
                    <span className="font-semibold text-slate-300">{t.gateway || 'PayOS'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#39FF14] font-mono block">
                    {formatPrice(t.amount)}đ
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">{t.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
