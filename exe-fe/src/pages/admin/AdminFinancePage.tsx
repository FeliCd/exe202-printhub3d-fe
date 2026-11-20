import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ArrowUpRight, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, CreditCard, Package } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type FinanceSummaryData } from '../../services/adminService';
import { PageHeader } from '../../components/DataUI';

// Định dạng trạng thái giao dịch: Thành công (xanh) - Hủy (đỏ) - Pending (vàng)
const getTransactionStatusMeta = (rawStatus?: string) => {
  const s = (rawStatus || '').toUpperCase();
  if (s.includes('THÀNH CÔNG') || s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') {
    return {
      label: rawStatus || 'Thành công',
      badgeClass: 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40',
      dotClass: 'bg-[#39FF14] ring-[#39FF14]/30',
      amountClass: 'text-[#39FF14]',
      prefix: '+',
    };
  }
  if (s.includes('HỦY') || s.includes('HUY') || s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED' || s === 'EXPIRED') {
    return {
      label: s === 'EXPIRED' ? 'Hết hạn' : (rawStatus || 'Đã hủy'),
      badgeClass: 'bg-rose-950/40 text-rose-400 border-rose-500/40',
      dotClass: 'bg-rose-400 ring-rose-400/30',
      amountClass: 'text-rose-400',
      prefix: '',
    };
  }
  // Pending / Chờ thanh toán / Chờ xử lý
  return {
    label: s === 'UNPAID' ? 'Chưa thanh toán' : (rawStatus || 'Chờ thanh toán (Pending)'),
    badgeClass: 'bg-amber-950/30 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400 ring-amber-400/30',
    amountClass: 'text-amber-300',
    prefix: '',
  };
};

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  const fetchFinance = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((v) => v + 1);
  }, []);

  useEffect(() => {
    let active = true;
    adminService
      .getFinanceSummary({
        from: fromDate || undefined,
        to: toDate || undefined,
      })
      .then((res) => {
        if (active && res) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        console.error('Lỗi tải báo cáo tài chính:', err);
        if (active) {
          setError('Không thể kết nối máy chủ để lấy số liệu tài chính.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [fromDate, toDate, reloadTick]);

  const summary = data?.financialSummary;
  const totalCashVnd = summary?.totalCashVnd ?? 0;
  const orderCashVnd = summary?.orderCashVnd ?? 0;
  const subscriptionCashVnd = summary?.subscriptionCashVnd ?? 0;
  const shippingCashVnd = summary?.shippingCashVnd ?? 0;
  const completedGoodsVnd = summary?.completedGoodsValueVnd ?? data?.totalGmv ?? 0;
  const pendingReconciliationVnd = summary?.pendingReconciliationVnd ?? 0;
  const reconciliationItems = summary?.reconciliationItems ?? [];
  const completionIssues = summary?.completionIssues ?? [];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      <PageHeader
        title="ĐỐI SOÁT TÀI CHÍNH"
        icon={DollarSign}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-mono text-theme-muted bg-surface border border-border rounded-xl px-2.5 py-1.5">
              <span>Từ</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-theme-ink outline-none"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-mono text-theme-muted bg-surface border border-border rounded-xl px-2.5 py-1.5">
              <span>Đến</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-theme-ink outline-none"
              />
            </label>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="px-2.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono text-[#00e5ff] hover:border-theme-accent cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
            <button
              onClick={() => void fetchFinance()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-[#39FF14] text-theme-ink hover:text-theme-accent font-mono font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-theme-accent ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'ĐANG ĐỐI SOÁT...' : 'LÀM MỚI SỐ LIỆU'}</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono font-medium">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tổng tiền thực thu thành công */}
        <div className="p-5 rounded-2xl bg-surface border border-[#39FF14]/40 space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/10 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">TỔNG TIỀN THU THÀNH CÔNG</p>
          <p className="text-2xl font-black text-theme-accent font-mono">{formatPrice(totalCashVnd)}đ</p>
          <span className="text-xs text-theme-copy font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-theme-accent" /> Tổng đơn hàng + gói hội viên (SUCCESS)
          </span>
        </div>

        {/* Tiền đơn hàng đã thu */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 relative overflow-hidden shadow-xl">
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">TIỀN ĐƠN HÀNG ĐÃ THU</p>
          <p className="text-2xl font-black text-theme-ink font-mono">{formatPrice(orderCashVnd)}đ</p>
          <span className="text-xs text-theme-muted font-mono flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#00e5ff]" /> Trong đó phí ship: {formatPrice(shippingCashVnd)}đ
          </span>
        </div>

        {/* Doanh thu gói hội viên */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 relative overflow-hidden shadow-xl">
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">DOANH THU GÓI HỘI VIÊN</p>
          <p className="text-2xl font-black text-[#00e5ff] font-mono">{formatPrice(subscriptionCashVnd)}đ</p>
          <span className="text-xs text-theme-muted font-mono flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#00e5ff]" /> Giao dịch mua gói PayOS thành công
          </span>
        </div>

        {/* GMV đơn hoàn tất */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/5 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">GIÁ TRỊ HÀNG ĐƠN HOÀN TẤT (GMV)</p>
          <p className="text-2xl font-black text-theme-ink font-mono">{formatPrice(completedGoodsVnd)}đ</p>
          <span className="text-xs text-theme-accent font-mono font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Chỉ tính đơn ở trạng thái COMPLETED
          </span>
        </div>

        {/* Lợi nhuận sàn 5% */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/10 blur-2xl pointer-events-none rounded-full" />
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">CHIẾT KHẤU SÀN (5%)</p>
          <p className="text-2xl font-black text-theme-accent font-mono">
            {formatPrice(data?.platformCommission ?? 0)}đ
          </p>
          <span className="text-xs text-theme-muted font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-theme-accent" /> Duy trì hạ tầng máy in
          </span>
        </div>

        {/* Chờ đối soát */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 relative overflow-hidden shadow-xl">
          <p className="text-[11px] text-theme-muted font-mono uppercase tracking-wider">TIỀN CHỜ ĐỐI SOÁT</p>
          <p className={`text-2xl font-black font-mono ${pendingReconciliationVnd > 0 ? 'text-amber-300' : 'text-theme-ink'}`}>
            {formatPrice(pendingReconciliationVnd)}đ
          </p>
          <span className="text-xs text-theme-muted font-mono flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${pendingReconciliationVnd > 0 ? 'text-amber-400' : 'text-theme-muted'}`} />
            {reconciliationItems.length} giao dịch · {completionIssues.length} cảnh báo hoàn tất
          </span>
        </div>
      </div>

      {(reconciliationItems.length > 0 || completionIssues.length > 0) && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 app-light:bg-amber-50 app-light:border-amber-300 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-amber-300 app-light:text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-400 app-light:text-amber-700" />
            <span>CẢNH BÁO ĐỐI SOÁT &amp; DỮ LIỆU ĐƠN HOÀN TẤT</span>
          </div>
          {reconciliationItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] font-semibold text-amber-200 app-light:text-amber-800 uppercase">
                Giao dịch cần đối soát ({reconciliationItems.length})
              </p>
              {reconciliationItems.map((item) => (
                <div
                  key={`${item.paymentId}-${item.reason}`}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-border font-mono"
                >
                  <span className="text-theme-ink">
                    {item.sourceType} #{item.sourceId?.slice(0, 8) || '--'} ·{' '}
                    <strong className="text-amber-300 app-light:text-amber-700">{item.reason}</strong>
                    {item.orderCode ? ` · PayOS #${item.orderCode}` : ''}
                  </span>
                  <span className="text-amber-300 app-light:text-amber-700 font-bold">
                    {item.amountVnd != null ? `${formatPrice(item.amountVnd)}đ` : '--'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {completionIssues.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] font-semibold text-amber-200 app-light:text-amber-800 uppercase">
                Đơn hoàn tất thiếu thông tin tính GMV ({completionIssues.length})
              </p>
              {completionIssues.map((issue) => (
                <div
                  key={`${issue.sourceType}-${issue.sourceId}-${issue.reason}`}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-border font-mono"
                >
                  <span className="text-theme-ink">
                    {issue.sourceType} #{issue.sourceId.slice(0, 8)} ·{' '}
                    <strong className="text-amber-300 app-light:text-amber-700">{issue.reason}</strong>
                  </span>
                  <span className="text-theme-muted">
                    {issue.completedAt ? new Date(issue.completedAt).toLocaleString('vi-VN') : 'Thiếu completedAt'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Logs Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 text-xs shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <h3 className="text-xs font-bold text-theme-ink uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] ring-2 ring-[#39FF14]/40" />
            NHẬT KÝ GIAO DỊCH THANH TOÁN (PAYOS &amp; COD AUDIT)
          </h3>
          <span className="text-[11px] text-theme-muted font-mono">
            {data?.recentTransactions?.length ?? 0} GIAO DỊCH GẦN NHẤT
          </span>
        </div>

        <div className="divide-y divide-border">
          {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
            <div className="py-12 text-center text-theme-muted font-mono">
              Chưa có giao dịch thanh toán nào được ghi nhận dưới cơ sở dữ liệu.
            </div>
          ) : (
            data.recentTransactions.map((t) => {
              const meta = getTransactionStatusMeta(t.status);
              return (
                <div key={t.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-surface-raised px-2 rounded-xl transition">
                  <div className="space-y-1">
                    <span className="font-mono text-[#00e5ff] font-bold text-xs">MÃ GD: #{t.id}</span>
                    <h4 className="font-bold text-theme-ink text-xs">{t.type} • {t.user}</h4>
                    <p className="text-theme-muted text-[11px] font-mono">
                      {t.date ? new Date(t.date).toLocaleString('vi-VN') : 'Mới tạo'} • Cổng:{' '}
                      <span className="font-semibold text-theme-copy">{t.gateway || 'PayOS VietQR'}</span>
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
