import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { CopyButton, Status } from '../../../components/DataUI';

export type AdminOrderKind = 'CUSTOM' | 'CHECKOUT' | 'MARKETPLACE';

export interface AdminOrderSummaryCardProps {
  id: string;
  kind: AdminOrderKind;
  customerName?: string | null;
  shippingAddress?: string | null;
  createdAt?: string | null;
  status?: string | null;
  priorityProduction?: boolean | null;
}

const KIND_LABELS: Record<AdminOrderKind, { label: string; className: string }> = {
  CHECKOUT: {
    label: 'Đơn gộp',
    className: 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300',
  },
  CUSTOM: {
    label: 'In custom',
    className: 'border-violet-500/30 bg-violet-950/30 text-violet-300',
  },
  MARKETPLACE: {
    label: 'Marketplace',
    className: 'border-slate-700 bg-slate-800/40 text-slate-300',
  },
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'Chưa xác định';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Chưa xác định';
  return dt.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminOrderSummaryCard({
  id,
  kind,
  customerName,
  shippingAddress,
  createdAt,
  status,
  priorityProduction,
}: AdminOrderSummaryCardProps) {
  const kindMeta = KIND_LABELS[kind];
  const shortId = `#${id.slice(0, 8)}`;
  const detailUrl = `/admin/orders/${encodeURIComponent(id)}?kind=${kind}`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-md transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        {/* 1. Mã đơn + Tag phân loại + Badge VIP + Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-white" title={id}>
            {shortId}
          </span>
          <CopyButton text={id} label="Copy" />
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${kindMeta.className}`}>
            {kindMeta.label}
          </span>
          {priorityProduction && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              <Sparkles className="h-3 w-3" />
              Ưu tiên VIP
            </span>
          )}
          <Status value={status ?? undefined} />
        </div>

        {/* 2. Tên khách hàng & 3. Địa chỉ & 4. Ngày giờ đặt */}
        <div className="grid gap-1.5 text-xs text-slate-300 sm:grid-cols-3">
          <div className="truncate">
            <span className="text-text-muted">Khách hàng: </span>
            <span className="font-semibold text-white">{customerName?.trim() || 'Khách hàng'}</span>
          </div>
          <div className="truncate sm:col-span-2" title={shippingAddress || ''}>
            <span className="text-text-muted">Địa chỉ: </span>
            <span>{shippingAddress?.trim() || 'Chưa cập nhật địa chỉ'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Ngày đặt: {formatDateTime(createdAt)}</span>
        </div>
      </div>

      {/* 6. Duy nhất 1 nút bấm Xem chi tiết đơn hàng */}
      <div className="flex shrink-0 items-center justify-end border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
        <Link
          to={detailUrl}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:brightness-110 active:scale-95"
        >
          <span>Xem chi tiết đơn hàng</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

