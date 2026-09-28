import type { ReactNode } from 'react';
export const field = 'w-full rounded-xl border border-border bg-surface-inset px-3 py-2 text-sm text-white';
export const button = 'rounded-xl bg-primary px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed';
export const secondary = 'rounded-xl border border-border px-3 py-2 text-sm text-slate-200 disabled:opacity-40';
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-5"><h1 className="text-2xl font-bold text-white">{title}</h1>{children}</section>;
}
export function Card({ children }: { children: ReactNode }) { return <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">{children}</div>; }
export function Notice({ error }: { error?: string }) { return error ? <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">{error}</p> : null; }
export function RemoteState({ loading, error, empty, retry }: { loading: boolean; error: string; empty?: boolean; retry: () => void }) {
  return <>{loading && <p role="status">Đang tải dữ liệu…</p>}<Notice error={error} />{error && <button className={secondary} onClick={retry}>Thử lại</button>}{!loading && !error && empty && <p className="text-slate-400">Chưa có dữ liệu.</p>}</>;
}
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
};

export function Status({ value, className = '' }: { value?: string; className?: string }) {
  const v = (value || '').toUpperCase();
  let color = 'border-slate-700 bg-slate-800/40 text-slate-300';
  if (['CANCELLED', 'FAILED', 'REJECTED', 'DISPUTED'].includes(v)) {
    color = 'border-red-500/40 bg-red-950/40 text-red-400 font-medium';
  } else if (['PENDING', 'REQUESTED', 'UNDER_REVIEW', 'OPEN', 'UNPAID'].includes(v)) {
    color = 'border-amber-500/40 bg-amber-950/40 text-amber-300 font-medium';
  } else if (['PREPARING', 'PRINTING', 'SHIPPING', 'QUOTED'].includes(v)) {
    color = 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-medium';
  } else if (['COMPLETED', 'PAID', 'APPROVED', 'ACCEPTED', 'RESOLVED', 'SUCCESS', 'REPLACED'].includes(v)) {
    color = 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-medium';
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${color} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {labels[v] || value || 'Không xác định'}
    </span>
  );
}

export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

