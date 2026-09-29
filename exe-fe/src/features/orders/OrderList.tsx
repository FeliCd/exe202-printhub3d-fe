import { useState } from 'react';
import {
  Package,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  CreditCard,
  MapPin,
  Check,
  Copy,
  Download,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import type { OrderDTO, OrderItemDTO } from '../../services/orderService';
import { Panel, RemoteState, Notice, Status, button, secondary, money } from '../../components/DataUI';

// Stepper 5 bước chuẩn hóa
const STEPS = [
  { key: 'PENDING', label: 'Đặt đơn hàng', icon: ShoppingBag, desc: 'Tiếp nhận / Chờ thanh toán' },
  { key: 'PREPARING', label: 'Chuẩn bị phôi & file', icon: Package, desc: 'Kiểm tra file 3D & vật liệu' },
  { key: 'PRINTING', label: 'Đang in 3D', icon: Layers, desc: 'Gia công in tại xưởng' },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: MapPin, desc: 'Đóng gói & vận chuyển' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: Check, desc: 'Đã giao thành công' },
];

function OrderStepper({ status }: { status: string }) {
  const getActiveStep = (s: string) => {
    switch (s) {
      case 'PENDING':
      case 'UNPAID':
        return 0;
      case 'PAID':
      case 'ACCEPTED':
      case 'PREPARING':
        return 1;
      case 'PRINTING':
        return 2;
      case 'SHIPPING':
        return 3;
      case 'COMPLETED':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentIdx = getActiveStep(status);

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-red-300 text-xs font-semibold">
        <span>Đơn hàng này đã bị hủy bỏ.</span>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${Math.max(0, Math.min(100, (currentIdx / (STEPS.length - 1)) * 100))}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-primary text-slate-950 shadow-md shadow-primary/30'
                    : isCurrent
                    ? 'bg-slate-900 border-2 border-primary text-primary shadow-lg shadow-primary/40 ring-4 ring-primary/20 scale-110'
                    : 'bg-surface-inset border border-border text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center whitespace-nowrap hidden sm:block ${
                  isCurrent ? 'text-primary' : isDone ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CustomOrderAdminItem {
  id: string;
  buyerName: string;
  rulerModel?: string;
  customName?: string;
  customStudentId?: string;
  color?: string;
  fontStyle?: string;
  requirements?: string;
  quantity: number;
  attachmentUrl?: string;
  quotedPrice?: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  createdAt: string;
}

export default function OrderList({ admin = false, history = false }: { admin?: boolean; history?: boolean }) {
  const remote = useRemote<OrderDTO[]>(admin ? '/admin/orders' : '/orders/me');
  const customRemote = useRemote<CustomOrderAdminItem[]>(admin ? '/admin/custom-orders' : null);

  const handleReload = () => {
    remote.reload();
    if (admin) customRemote.reload();
  };

  const action = useAction(handleReload);

  // Filter Tabs: ALL, MARKETPLACE, CUSTOM
  const [activeTab, setActiveTab] = useState<'ALL' | 'MARKETPLACE' | 'CUSTOM'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Đơn Marketplace
  const marketplaceOrders = remote.data?.filter(o => !history || ['COMPLETED', 'CANCELLED'].includes(o.status)) || [];

  // Đơn Custom đã chốt báo giá (ACCEPTED, PAID, PREPARING, PRINTING, SHIPPING, COMPLETED)
  const acceptedCustomOrders = (customRemote.data || []).filter(c =>
    ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].includes(c.status)
  );

  const nextStateMarketplace = (o: OrderDTO): string => {
    const map: Record<string, string> = {
      PENDING: o.paymentMethod === 'COD' ? 'PREPARING' : '',
      PAID: 'PREPARING',
      PREPARING: 'PRINTING',
      PRINTING: 'SHIPPING',
      SHIPPING: 'COMPLETED',
    };
    return map[o.status] || '';
  };

  const nextStateCustom = (c: CustomOrderAdminItem): string => {
    const map: Record<string, string> = {
      ACCEPTED: 'PREPARING',
      PAID: 'PREPARING',
      PREPARING: 'PRINTING',
      PRINTING: 'SHIPPING',
      SHIPPING: 'COMPLETED',
    };
    return map[c.status] || '';
  };

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNextStatus = async (orderId: string, nextStatus: string, isCustom: boolean) => {
    if (isCustom) {
      await action.run(() => send(`/admin/custom-orders/${orderId}/status`, { status: nextStatus }, 'put'));
    } else {
      await action.run(() => send(`/orders/${orderId}/status`, { status: nextStatus }, 'put'));
    }
  };

  return (
    <Panel title={admin ? 'Quản lý đơn hàng hệ thống (Admin)' : history ? 'Lịch sử đơn hàng & In lại' : 'Theo dõi tiến độ in 3D'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {admin
            ? 'Theo dõi tiến độ gia công in 3D và trạng thái giao hàng cho cả đơn Marketplace và đơn Custom đã chốt giá.'
            : history
            ? 'Xem lại các đơn hàng đã hoàn tất hoặc đã hủy, và gửi đánh giá chất lượng in.'
            : 'Theo dõi trực tiếp từng bước gia công in 3D và trạng thái giao hàng.'}
        </p>

        <button className={`${secondary} flex items-center gap-1.5 self-start sm:self-auto shrink-0`} onClick={handleReload}>
          <RotateCcw className="h-3.5 w-3.5" /> Tải lại
        </button>
      </div>

      {/* Admin Tab Filters: Phân biệt rõ Đơn Marketplace vs Đơn Custom */}
      {admin && (
        <div className="flex items-center gap-2 p-1.5 bg-surface-inset rounded-2xl border border-border overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Đơn Hàng ({marketplaceOrders.length + acceptedCustomOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'MARKETPLACE'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Đơn Mua Marketplace ({marketplaceOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CUSTOM'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Đơn In Custom Theo Yêu Cầu ({acceptedCustomOrders.length})
          </button>
        </div>
      )}

      <Notice error={action.error} />
      <RemoteState {...remote} empty={!marketplaceOrders.length && !acceptedCustomOrders.length} retry={handleReload} />

      <div className="space-y-5">
        {/* ========================================================================= */}
        {/* 1. HIỂN THỊ ĐƠN HÀNG MARKETPLACE */}
        {/* ========================================================================= */}
        {(activeTab === 'ALL' || activeTab === 'MARKETPLACE') &&
          marketplaceOrders.map(o => {
            const next = nextStateMarketplace(o);
            return (
              <div
                key={o.id}
                className="space-y-4 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-lg transition-all hover:border-purple-500/40 relative overflow-hidden"
              >
                {/* Dải màu nhận diện Đơn Marketplace */}
                {admin && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {admin && (
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 font-extrabold text-[11px] border border-cyan-800 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" /> MARKETPLACE
                        </span>
                      )}
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
                      Khách hàng: <span className="text-slate-200 font-bold">{admin ? o.buyerName : 'Bạn'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Trạng thái:</span>
                    <Status value={o.status} />
                  </div>
                </div>

                {/* Stepper */}
                <div className="rounded-xl border border-border/50 bg-surface-inset/40 p-3 sm:p-4">
                  <OrderStepper status={o.status} />
                </div>

                {/* Danh sách sản phẩm in 3D */}
                <div className="rounded-xl border border-border/60 bg-surface-inset p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1 border-b border-border/40">
                    <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Sản phẩm đặt in ({o.items?.length || 0})</span>
                  </div>
                  <ul className="divide-y divide-border/40">
                    {o.items?.map((i: OrderItemDTO, n: number) => (
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

                {/* Địa chỉ & Thanh toán */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border/60 bg-surface-inset/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>Địa chỉ giao hàng</span>
                    </div>
                    {o.shippingInfo ? (
                      <div className="text-xs space-y-1 text-slate-300 pl-6">
                        <p className="text-white font-medium">Người nhận: <span className="font-bold">{o.shippingInfo.recipientName}</span></p>
                        <p>Số điện thoại: <span className="font-mono text-slate-200">{o.shippingInfo.phone}</span></p>
                        <p className="text-slate-300">Địa chỉ: {o.shippingInfo.address}, {o.shippingInfo.province}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 pl-6">Chưa có thông tin địa chỉ giao hàng.</p>
                    )}
                  </div>

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

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
                  <div>
                    <span className="text-xs text-slate-400 block">Tổng tiền thanh toán:</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">{money(o.totalAmount)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {admin && next && (
                      <button
                        className={button}
                        disabled={action.busy}
                        onClick={() => handleNextStatus(o.id, next, false)}
                      >
                        Chuyển sang <Status value={next} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* ========================================================================= */}
        {/* 2. HIỂN THỊ ĐƠN HÀNG IN CUSTOM (ĐÃ CHỐT BÁO GIÁ) TRONG ADMIN */}
        {/* ========================================================================= */}
        {admin && (activeTab === 'ALL' || activeTab === 'CUSTOM') &&
          acceptedCustomOrders.map(c => {
            const next = nextStateCustom(c);
            return (
              <div
                key={c.id}
                className="space-y-4 rounded-2xl border border-amber-600/40 bg-surface p-5 sm:p-6 shadow-lg transition-all hover:border-amber-500 relative overflow-hidden"
              >
                {/* Dải màu nhận diện Đơn Custom */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 font-extrabold text-[11px] border border-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> ĐƠN IN CUSTOM 3D
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-white break-all">#CUS-{c.id.substring(0, 8)}</span>
                      <button
                        onClick={() => copyOrderId(c.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-inset px-2 py-0.5 text-[11px] text-slate-400 hover:text-white transition-colors"
                        title="Sao chép mã đơn"
                      >
                        {copiedId === c.id ? (
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
                      Thời gian yêu cầu: <span className="text-slate-300">{new Date(c.createdAt).toLocaleString('vi-VN')}</span> ·{' '}
                      Sinh viên / Khách: <span className="text-slate-200 font-bold">{c.buyerName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Trạng thái:</span>
                    <Status value={c.status} />
                  </div>
                </div>

                {/* Stepper */}
                <div className="rounded-xl border border-border/50 bg-surface-inset/40 p-3 sm:p-4">
                  <OrderStepper status={c.status} />
                </div>

                {/* Thông số kỹ thuật in thước custom */}
                <div className="rounded-xl border border-amber-800/40 bg-surface-inset p-3.5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border/40 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Thông số chế tác thước cá nhân hóa</span>
                    </div>
                    {c.attachmentUrl && (
                      <a
                        href={c.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#39FF14] hover:underline normal-case font-bold"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Tệp 3D
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-text-muted block">Mẫu Thước:</span>
                      <strong className="text-white text-sm">{c.rulerModel || 'Thước Kỹ Thuật'}</strong>
                    </div>

                    <div>
                      <span className="text-text-muted block">Khắc Tên &amp; MSSV:</span>
                      <strong className="text-purple-300 text-sm">
                        {c.customName || 'Không khắc'} {c.customStudentId ? `(${c.customStudentId})` : ''}
                      </strong>
                    </div>

                    <div>
                      <span className="text-text-muted block">Màu sắc &amp; Kiểu chữ:</span>
                      <span className="text-slate-200 font-semibold">
                        Màu: {c.color || 'Mặc định'} · Font: {c.fontStyle || 'Chuẩn'}
                      </span>
                    </div>

                    <div>
                      <span className="text-text-muted block">Số lượng in:</span>
                      <strong className="text-white text-sm">{c.quantity || 1} cái</strong>
                    </div>
                  </div>

                  {c.requirements && (
                    <div className="pt-2 text-xs text-slate-300 border-t border-border/30">
                      <span className="text-text-muted">Ghi chú riêng:</span> {c.requirements}
                    </div>
                  )}
                </div>

                {/* Địa chỉ & Thanh toán đơn custom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border/60 bg-surface-inset/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Địa chỉ giao hàng</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300 pl-6">
                      <p className="text-white font-medium">Người nhận: <span className="font-bold">{c.buyerName}</span></p>
                      <p className="text-slate-300">Địa chỉ: {c.shippingAddress || 'Nhận tại KTX / PrintHub Lab'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-surface-inset/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <CreditCard className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Phương thức thanh toán đã chọn</span>
                    </div>
                    <div className="text-xs space-y-2 text-slate-300 pl-6">
                      <p>
                        Hình thức:{' '}
                        <span className="font-semibold text-white">
                          {c.paymentMethod === 'PAYOS' ? 'PayOS (Quét mã VietQR)' : 'Thanh toán khi nhận hàng (COD)'}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span>Trạng thái:</span>
                        <Status value={c.paymentStatus || (['PAID', 'COMPLETED'].includes(c.status) ? 'PAID' : 'PENDING')} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
                  <div>
                    <span className="text-xs text-slate-400 block">Giá chốt báo giá:</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      {money(c.quotedPrice || 0)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {next && (
                      <button
                        className={button}
                        disabled={action.busy}
                        onClick={() => handleNextStatus(c.id, next, true)}
                      >
                        Chuyển sang <Status value={next} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </Panel>
  );
}
