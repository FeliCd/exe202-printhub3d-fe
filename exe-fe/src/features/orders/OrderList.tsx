import { useState } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { payOrder } from '../../services/paymentService';
import type { OrderDTO } from '../../services/orderService';
import { Panel, Notice, RemoteState, Status, button, secondary, field, money } from '../../components/DataUI';
import {
  Clock,
  Package,
  Printer,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CreditCard,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const trackingSteps = [
  { key: 'PENDING', label: 'Đặt đơn hàng', icon: Clock, desc: 'Tiếp nhận / Chờ thanh toán' },
  { key: 'PREPARING', label: 'Chuẩn bị phôi & file', icon: Package, desc: 'Kiểm tra file 3D & vật liệu' },
  { key: 'PRINTING', label: 'Đang in 3D', icon: Printer, desc: 'Gia công in tại xưởng' },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: Truck, desc: 'Đóng gói & vận chuyển' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2, desc: 'Đã giao thành công' },
];

function getStepIndex(status: string) {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'PAID':
    case 'PREPARING':
      return 1;
    case 'PRINTING':
      return 2;
    case 'SHIPPING':
      return 3;
    case 'COMPLETED':
      return 4;
    default:
      return -1;
  }
}

function OrderStepper({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-red-400">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Đơn hàng đã hủy</span>
          <span className="text-slate-400 ml-2">Đơn hàng này đã bị hủy bỏ. Quy trình sản xuất in 3D và giao hàng đã dừng.</span>
        </div>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);

  return (
    <div className="w-full py-2">
      <div className="relative grid grid-cols-5 gap-1">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-primary transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, (currentIdx / 4) * 100))}%` }}
          />
        </div>

        {trackingSteps.map((s, idx) => {
          const Icon = s.icon;
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={s.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
                    : isCurrent
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-4 ring-cyan-500/20 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="mt-2 px-0.5">
                <p
                  className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-cyan-300'
                      : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </p>
                <p className="hidden md:block text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderList({ admin = false, history = false }: { admin?: boolean; history?: boolean }) {
  const remote = useRemote<OrderDTO[]>(admin ? '/admin/orders' : '/orders/me');
  const action = useAction(remote.reload);
  const rows = remote.data?.filter(o => !history || ['COMPLETED', 'CANCELLED'].includes(o.status)) || [];

  const [review, setReview] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const nextState = (o: OrderDTO) =>
    ({
      PENDING: o.paymentMethod === 'COD' ? 'PREPARING' : '',
      PAID: 'PREPARING',
      PREPARING: 'PRINTING',
      PRINTING: 'SHIPPING',
      SHIPPING: 'COMPLETED',
    }[o.status]);

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Panel title={admin ? 'Quản lý đơn hàng (Admin)' : history ? 'Lịch sử đơn hàng & In lại' : 'Theo dõi tiến độ in 3D'}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {history
            ? 'Xem lại các đơn hàng đã hoàn tất hoặc đã hủy, và gửi đánh giá chất lượng in.'
            : 'Theo dõi trực tiếp từng bước gia công in 3D và trạng thái giao hàng.'}
        </p>
        <button className={`${secondary} flex items-center gap-1.5`} onClick={remote.reload}>
          <RotateCcw className="h-3.5 w-3.5" /> Tải lại
        </button>
      </div>

      <Notice error={action.error} />
      <RemoteState {...remote} empty={!rows.length} retry={remote.reload} />

      <div className="space-y-4">
        {rows.map(o => (
          <div
            key={o.id}
            className="space-y-4 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-lg transition-all hover:border-border"
          >
            {/* Header: Mã đơn + Thời gian + Trạng thái */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm sm:text-base font-bold text-white break-all">#{o.id}</span>
                  <button
                    onClick={() => copyOrderId(o.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-inset px-2 py-0.5 text-[11px] text-slate-400 hover:text-white transition-colors"
                    title="Sao chép mã đơn"
                  >
                    {copiedId === o.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Thời gian đặt: <span className="text-slate-300">{new Date(o.createdAt).toLocaleString('vi-VN')}</span> ·{' '}
                  Đơn vị: <span className="text-slate-300 font-medium">{admin ? o.buyerName : 'Xưởng in PrintHub 3D'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trạng thái:</span>
                <Status value={o.status} />
              </div>
            </div>

            {/* Thanh tiến trình Stepper theo dõi tiến độ */}
            <div className="rounded-xl border border-border/50 bg-surface-inset/40 p-3 sm:p-4">
              <OrderStepper status={o.status} />
            </div>

            {/* Danh sách sản phẩm in 3D */}
            <div className="rounded-xl border border-border/60 bg-surface-inset p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1 border-b border-border/40">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span>Chi tiết sản phẩm in ({o.items.length})</span>
              </div>
              <ul className="divide-y divide-border/40">
                {o.items.map((i, n) => (
                  <li key={n} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-white">{i.productTitle}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        <span>Số lượng: <strong className="text-white">{i.quantity}</strong></span>
                        {i.color && <span>· Màu: <strong className="text-slate-300">{i.color}</strong></span>}
                        {i.engravingText && <span>· Khắc tên: <strong className="text-slate-300">"{i.engravingText}"</strong></span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-200">{money(i.unitPrice * i.quantity)}</p>
                      <p className="text-xs text-slate-400">{money(i.unitPrice)} / cái</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lưới 2 cột: Địa chỉ nhận hàng & Phương thức thanh toán */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Cột 1: Thông tin người nhận & Địa chỉ */}
              <div className="rounded-xl border border-border/60 bg-surface-inset/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>Địa chỉ giao hàng</span>
                </div>
                {o.shippingInfo ? (
                  <div className="text-xs space-y-1 text-slate-300 pl-6">
                    <p className="text-white font-medium">
                      Người nhận: <span className="font-bold">{o.shippingInfo.recipientName}</span>
                    </p>
                    <p>
                      Số điện thoại: <span className="font-mono text-slate-200">{o.shippingInfo.phone}</span>
                    </p>
                    <p className="text-slate-300">
                      Địa chỉ: {o.shippingInfo.address}, {o.shippingInfo.province}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 pl-6">Chưa có thông tin địa chỉ giao hàng.</p>
                )}
              </div>

              {/* Cột 2: Phương thức & Trạng thái thanh toán */}
              <div className="rounded-xl border border-border/60 bg-surface-inset/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CreditCard className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Phương thức & Tình trạng thanh toán</span>
                </div>
                <div className="text-xs space-y-2 text-slate-300 pl-6">
                  <p>
                    Hình thức:{' '}
                    <span className="font-semibold text-white">
                      {o.paymentMethod === 'PAYOS' ? 'PayOS (Quét mã VietQR)' : 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span>Thanh toán:</span>
                    <Status value={o.paymentStatus || (o.status === 'PAID' ? 'PAID' : 'UNPAID')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Thẻ: Tổng tiền + Nút bấm hành động */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
              <div>
                <span className="text-xs text-slate-400 block">Tổng tiền thanh toán:</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{money(o.totalAmount)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {!admin && o.status === 'PENDING' && o.paymentMethod === 'PAYOS' && (
                  <button
                    className={`${button} flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:brightness-110`}
                    disabled={action.busy}
                    onClick={() => void action.run(() => payOrder(o.id))}
                  >
                    <CreditCard className="h-4 w-4" /> Thanh toán PayOS ngay
                  </button>
                )}

                {o.status === 'PENDING' && (
                  <button
                    className={`${secondary} text-red-300 hover:text-red-200 hover:border-red-800`}
                    disabled={action.busy}
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
                        void action.run(() => send(`/orders/${o.id}/status`, { status: 'CANCELLED' }, 'put'));
                      }
                    }}
                  >
                    Hủy đơn
                  </button>
                )}

                {admin && nextState(o) && (
                  <button
                    className={button}
                    disabled={action.busy}
                    onClick={() => {
                      if (o.paymentMethod === 'COD' && nextState(o) === 'COMPLETED' && !confirm('Xác nhận đã giao hàng và thu đủ tiền COD?')) {
                        return;
                      }
                      void action.run(() => send(`/orders/${o.id}/status`, { status: nextState(o) }, 'put'));
                    }}
                  >
                    Chuyển sang <Status value={nextState(o)!} className="ml-1" />
                  </button>
                )}

                {!admin && o.status === 'COMPLETED' && !reviewed.includes(o.id) && (
                  <button className={`${secondary} flex items-center gap-1`} onClick={() => setReview(review === o.id ? '' : o.id)}>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    {review === o.id ? 'Đóng đánh giá' : 'Đánh giá sản phẩm'}
                  </button>
                )}
              </div>
            </div>

            {/* Form đánh giá khi đơn hoàn thành */}
            {review === o.id && (
              <form
                className="mt-3 space-y-3 rounded-xl border border-primary/30 bg-surface-inset p-4"
                onSubmit={async e => {
                  e.preventDefault();
                  if (await action.run(() => send('/reviews', { orderId: o.id, rating: Number(rating), comment }))) {
                    setReview('');
                    setReviewed([...reviewed, o.id]);
                    setComment('');
                  }
                }}
              >
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Đánh giá chất lượng sản phẩm & Dịch vụ in 3D
                </h3>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-300">Số sao:</label>
                  <select className={`${field} w-auto`} value={rating} onChange={e => setRating(e.target.value)}>
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>
                        {'★'.repeat(n)} ({n} sao)
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  aria-label="Nội dung đánh giá"
                  className={field}
                  maxLength={2000}
                  rows={3}
                  placeholder="Chia sẻ cảm nhận về độ chi tiết, màu sắc và chất lượng hoàn thiện của mẫu in..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className={secondary} onClick={() => setReview('')}>
                    Hủy bỏ
                  </button>
                  <button className={button} disabled={action.busy}>
                    {action.busy ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
