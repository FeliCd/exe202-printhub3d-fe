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
const labels: Record<string, string> = { PENDING: 'Chờ xử lý', PAID: 'Đã thanh toán', PREPARING: 'Chuẩn bị', PRINTING: 'Đang in', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', REQUESTED: 'Chờ báo giá', QUOTED: 'Đã báo giá', ACCEPTED: 'Đã chấp nhận', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', REPLACED: 'Đã đổi sản phẩm', OPEN: 'Đang mở', UNDER_REVIEW: 'Đang xem xét', RESOLVED: 'Đã xử lý', SUCCESS: 'Thành công', FAILED: 'Không thành công' };
export function Status({ value }: { value: string }) { return <span className="inline-block rounded-full border border-emerald-800 px-3 py-1 text-xs text-emerald-300">{labels[value] || value}</span>; }
export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
