import { useState, type ReactNode, type ComponentType } from 'react';
import { Copy, Check, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

/* ========================================================================= */
/* 1. BUTTON & INPUT CLASS UTILITIES                                         */
/* ========================================================================= */
export const field =
  'w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-primary focus:ring-1 focus:ring-primary/40 focus:outline-none';

export const fieldSm =
  'w-full rounded-lg border border-border bg-surface-inset px-3 py-1.5 text-xs text-white placeholder-slate-500 transition-colors focus:border-primary focus:ring-1 focus:ring-primary/40 focus:outline-none';

export const button =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const buttonSm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const secondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-inset/80 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-surface-inset hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const secondarySm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-inset/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-surface-inset hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const destructive =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-3.5 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-900/30 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const destructiveSm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/20 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-900/30 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

export const ghostBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-surface-inset hover:text-white cursor-pointer';

/* ========================================================================= */
/* 2. PAGE HEADER                                                            */
/* ========================================================================= */
export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ComponentType<{ className?: string }>;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6 ${className}`}>
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/20">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {title}
          </h1>
          {badge && (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">{actions}</div>}
    </div>
  );
}

/* ========================================================================= */
/* 3. CARD & PANEL CONTAINERS                                                */
/* ========================================================================= */
export function Panel({
  title,
  children,
  className = '',
  actions,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`space-y-6 ${className}`}>
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`space-y-4 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-lg transition-all duration-200 ${
        hover ? 'hover:border-primary/40 hover:shadow-primary/5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardInset({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-surface-inset p-3.5 sm:p-4 text-xs ${className}`}>
      {children}
    </div>
  );
}

/* ========================================================================= */
/* 4. NOTICES, FEEDBACK & REMOTE STATE                                       */
/* ========================================================================= */
export function Notice({
  error,
  success,
  info,
}: {
  error?: string;
  success?: string;
  info?: string;
}) {
  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-300 shadow-sm animate-in fade-in">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
        <span className="leading-relaxed">{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div role="status" className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/10 p-3.5 text-xs text-primary shadow-sm animate-in fade-in">
        <Check className="h-4 w-4 shrink-0 text-primary" />
        <span className="leading-relaxed">{success}</span>
      </div>
    );
  }
  if (info) {
    return (
      <div role="status" className="flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-3.5 text-xs text-cyan-300 shadow-sm animate-in fade-in">
        <AlertCircle className="h-4 w-4 shrink-0 text-cyan-400" />
        <span className="leading-relaxed">{info}</span>
      </div>
    );
  }
  return null;
}

export function RemoteState({
  loading,
  error,
  empty,
  retry,
  emptyMessage = 'Chưa có dữ liệu để hiển thị.',
}: {
  loading: boolean;
  error: string;
  empty?: boolean;
  retry: () => void;
  emptyMessage?: string;
}) {
  return (
    <div className="space-y-4" aria-busy={loading}>
      {loading && (
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-surface-inset/40 p-8 text-xs text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Đang tải dữ liệu…</span>
        </div>
      )}
      <Notice error={error} />
      {error && !loading && (
        <div className="text-center pt-2">
          <button className={secondary} onClick={retry}>
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        </div>
      )}
      {!loading && !error && empty && (
        <div role="status" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface-inset/20 p-8 text-center text-xs text-text-muted">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* 5. TABS & PAGINATION                                                      */
/* ========================================================================= */
export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
  icon?: ComponentType<{ className?: string }>;
}

export function TabGroup<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl border border-border/80 bg-surface-inset scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-primary text-slate-950 shadow-md shadow-primary/30'
                : 'text-slate-400 hover:bg-surface hover:text-white'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-surface text-slate-300 border border-border/60'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  loading = false,
  className = '',
}: {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
  className?: string;
}) {
  const safeTotal = Math.max(1, totalPages || 1);
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs ${className}`}>
      <span className="text-text-muted">
        Trang <strong className="text-white font-mono">{page + 1}</strong> / <span className="font-mono">{safeTotal}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={secondarySm}
          disabled={page === 0 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </button>
        <button
          type="button"
          className={secondarySm}
          disabled={loading || page + 1 >= safeTotal}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 6. STATUS BADGES & COPYABLE CODE                                          */
/* ========================================================================= */
const labels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  PREPARING: 'Chuẩn bị phôi & file',
  PRINTING: 'Đang in 3D',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REQUESTED: 'Chờ báo giá',
  QUOTED: 'Đã báo giá',
  ACCEPTED: 'Đã chấp nhận',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  REPLACED: 'Đã đổi sản phẩm',
  OPEN: 'Đang mở',
  UNDER_REVIEW: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Không thành công',
  REFUNDED: 'Đã hoàn tiền',
  DISPUTED: 'Đang tranh chấp',
};

export function Status({ value, className = '' }: { value?: string; className?: string }) {
  const v = (value || '').toUpperCase();
  let color = 'border-slate-700 bg-slate-800/40 text-slate-300';
  let dotColor = 'bg-slate-400';

  if (['CANCELLED', 'FAILED', 'REJECTED', 'DISPUTED'].includes(v)) {
    color = 'border-red-500/40 bg-red-950/40 text-red-400 font-semibold';
    dotColor = 'bg-red-400';
  } else if (['PENDING', 'REQUESTED', 'UNDER_REVIEW', 'OPEN', 'UNPAID'].includes(v)) {
    color = 'border-amber-500/40 bg-amber-950/40 text-amber-300 font-semibold';
    dotColor = 'bg-amber-400';
  } else if (['PREPARING', 'PRINTING', 'SHIPPING', 'QUOTED'].includes(v)) {
    color = 'border-primary/40 bg-primary/10 text-primary font-semibold';
    dotColor = 'bg-primary';
  } else if (['COMPLETED', 'PAID', 'APPROVED', 'ACCEPTED', 'RESOLVED', 'SUCCESS', 'REPLACED'].includes(v)) {
    color = 'border-primary/40 bg-primary/10 text-primary font-semibold';
    dotColor = 'bg-primary';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${color} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {labels[v] || value || 'Không xác định'}
    </span>
  );
}

export function CopyButton({
  text,
  label = 'Sao chép',
  copiedLabel = 'Đã chép',
  className = '',
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-md bg-surface-inset border border-border/60 px-2 py-0.5 text-[11px] text-slate-400 hover:border-slate-500 hover:text-white transition-colors cursor-pointer ${className}`}
      title="Sao chép vào bộ nhớ tạm"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-primary" />
          <span className="text-primary font-medium">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

