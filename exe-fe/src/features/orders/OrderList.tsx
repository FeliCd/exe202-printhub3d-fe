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
  Star,
  Clock,
} from 'lucide-react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import type { OrderDTO, OrderItemDTO } from '../../services/orderService';
import ReviewModal from '../reviews/ReviewModal';
import { RemoteState, Notice, Status } from '../../components/DataUI';
import { money } from '../../utils/format';

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
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-500 -z-0"
          style={{ width: `${Math.max(0, Math.min(100, (currentIdx / (STEPS.length - 1)) * 100))}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 group select-none">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                    : isCurrent
                    ? 'bg-[#040508] border-2 border-[#39FF14] text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.4)] ring-4 ring-[#39FF14]/20 scale-110'
                    : 'bg-[#040508] border border-white/15 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] font-mono font-bold mt-2 text-center whitespace-nowrap hidden sm:block ${
                  isCurrent ? 'text-[#39FF14]' : isDone ? 'text-slate-200' : 'text-slate-500'
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
  allowedActions?: string[];
  blockedActions?: { action: string; reasonCode: string; message: string }[];
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
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; item: OrderItemDTO } | null>(null);

  // Filter tabs for Buyer History
  const [historyTab, setHistoryTab] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  // Filter tabs for Buyer Active Orders
  const [activeOrderTab, setActiveOrderTab] = useState<'ALL' | 'PENDING' | 'PRINTING' | 'SHIPPING'>('ALL');

  // Đơn Marketplace
  const rawMarketplaceOrders = remote.data?.filter(o => !history || ['COMPLETED', 'CANCELLED'].includes(o.status)) || [];
  const marketplaceOrders = rawMarketplaceOrders.filter(o => {
    if (admin) return true;
    if (history) {
      if (historyTab === 'COMPLETED') return o.status === 'COMPLETED';
      if (historyTab === 'CANCELLED') return o.status === 'CANCELLED';
      return true;
    }
    if (activeOrderTab === 'PENDING') return ['PENDING', 'UNPAID', 'PAID', 'PREPARING'].includes(o.status);
    if (activeOrderTab === 'PRINTING') return o.status === 'PRINTING';
    if (activeOrderTab === 'SHIPPING') return o.status === 'SHIPPING';
    return true;
  });

  // Đơn Custom đã chốt báo giá (ACCEPTED, PAID, PREPARING, PRINTING, SHIPPING, COMPLETED)
  const acceptedCustomOrders = (customRemote.data || []).filter(c =>
    ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].includes(c.status)
  );

  const actionToStatus = (act: string): string => {
    switch (act) {
      case 'START_PREPARATION': return 'PREPARING';
      case 'START_PRINTING': return 'PRINTING';
      case 'START_SHIPPING': return 'SHIPPING';
      case 'COMPLETE_DELIVERY': return 'COMPLETED';
      case 'CANCEL': return 'CANCELLED';
      default: return act;
    }
  };

  const nextStateMarketplace = (o: OrderDTO): string => {
    if (o.allowedActions && o.allowedActions.length > 0) {
      const act = o.allowedActions.find(a => a !== 'CANCEL');
      return act ? actionToStatus(act) : '';
    }
    // Fallback nếu chưa có allowedActions từ server
    if (o.status === 'PENDING') {
      if (o.paymentMethod === 'COD') return 'PREPARING';
      if (o.paymentMethod === 'PAYOS' && (o.paymentStatus === 'SUCCESS' || o.paymentStatus === 'PAID')) return 'PREPARING';
      return '';
    }
    if (o.status === 'PAID') return 'PREPARING';
    if (o.status === 'PREPARING') return 'SHIPPING';
    if (o.status === 'PRINTING') return 'SHIPPING';
    if (o.status === 'SHIPPING') return 'COMPLETED';
    return '';
  };

  const nextStateCustom = (c: CustomOrderAdminItem): string => {
    if (c.allowedActions && c.allowedActions.length > 0) {
      const act = c.allowedActions.find(a => a !== 'CANCEL' && a !== 'QUOTE');
      return act ? actionToStatus(act) : '';
    }
    // Fallback nếu chưa có allowedActions từ server
    if (c.status === 'ACCEPTED') {
      if (c.paymentMethod === 'COD') return 'PREPARING';
      if (c.paymentMethod === 'PAYOS' && (c.paymentStatus === 'SUCCESS' || c.paymentStatus === 'PAID')) return 'PREPARING';
      return '';
    }
    if (c.status === 'PAID') return 'PREPARING';
    if (c.status === 'PREPARING') return 'PRINTING';
    if (c.status === 'PRINTING') return 'SHIPPING';
    if (c.status === 'SHIPPING') return 'COMPLETED';
    return '';
  };

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNextStatus = async (
    orderId: string,
    nextStatus: string,
    isCustom: boolean,
    totalAmount?: number,
    paymentMethod?: string
  ) => {
    if (nextStatus === 'COMPLETED' && paymentMethod === 'COD') {
      const confirmed = window.confirm(
        `Xác nhận hoàn thành giao hàng và đã thu đủ ${money(totalAmount || 0)} tiền mặt COD từ khách hàng?`
      );
      if (!confirmed) return;
    }
    if (isCustom) {
      await action.run(() => send(`/custom-orders/${orderId}/status`, { status: nextStatus }, 'put'));
    } else {
      await action.run(() => send(`/orders/${orderId}/status`, { status: nextStatus }, 'put'));
    }
  };

  const pageTitle = admin
    ? 'Quản lý đơn hàng hệ thống (Admin)'
    : history
    ? 'Lịch sử đơn hàng & In lại'
    : 'Theo dõi tiến độ in 3D';

  const pageDesc = admin
    ? 'Theo dõi tiến độ gia công in 3D và trạng thái giao hàng cho cả đơn Marketplace và đơn Custom đã chốt giá.'
    : history
    ? 'Xem lại các đơn hàng đã hoàn tất hoặc đã hủy, và gửi đánh giá chất lượng in.'
    : 'Theo dõi trực tiếp từng bước gia công in 3D và trạng thái giao hàng.';

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              {history ? <Package className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">{pageTitle}</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{pageDesc}</p>
        </div>

        <button className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl border border-white/10 bg-[#11141e] hover:bg-[#1a2030] text-slate-200 hover:text-white transition flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold" onClick={handleReload}>
          <RotateCcw className="h-3.5 w-3.5 text-[#39FF14]" /> Tải lại
        </button>
      </div>

      {/* Admin Tab Filters: Phân biệt rõ Đơn Marketplace vs Đơn Custom */}
      {admin && (
        <div className="flex items-center gap-2 p-1.5 bg-[#0a0c12] rounded-2xl border border-white/10 overflow-x-auto text-xs font-bold scrollbar-none font-mono">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Đơn Hàng ({marketplaceOrders.length + acceptedCustomOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MARKETPLACE'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Đơn Mua Marketplace ({marketplaceOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CUSTOM'
                ? 'bg-[#ff9100] text-[#040508] shadow-[0_0_15px_rgba(255,145,0,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Đơn In Custom Theo Yêu Cầu ({acceptedCustomOrders.length})
          </button>
        </div>
      )}

      {/* Buyer History Filter Tabs */}
      {!admin && history && (
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl border border-white/10 bg-[#0a0c12] scrollbar-none text-xs font-bold font-mono">
          <button
            onClick={() => setHistoryTab('ALL')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition cursor-pointer ${
              historyTab === 'ALL'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Lịch Sử ({rawMarketplaceOrders.length})
          </button>
          <button
            onClick={() => setHistoryTab('COMPLETED')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              historyTab === 'COMPLETED'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Đã Hoàn Thành ({rawMarketplaceOrders.filter(o => o.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setHistoryTab('CANCELLED')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              historyTab === 'CANCELLED'
                ? 'bg-[#ff9100] text-[#040508] shadow-[0_0_15px_rgba(255,145,0,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã Hủy ({rawMarketplaceOrders.filter(o => o.status === 'CANCELLED').length})
          </button>
        </div>
      )}

      {/* Buyer Active Order Filter Tabs */}
      {!admin && !history && (
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl border border-white/10 bg-[#0a0c12] scrollbar-none text-xs font-bold font-mono">
          <button
            onClick={() => setActiveOrderTab('ALL')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeOrderTab === 'ALL'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Đang Xử Lý ({rawMarketplaceOrders.length})
          </button>
          <button
            onClick={() => setActiveOrderTab('PENDING')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeOrderTab === 'PENDING'
                ? 'bg-[#ff9100] text-[#040508] shadow-[0_0_15px_rgba(255,145,0,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chờ Xử Lý ({rawMarketplaceOrders.filter(o => ['PENDING', 'UNPAID', 'PAID', 'PREPARING'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveOrderTab('PRINTING')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeOrderTab === 'PRINTING'
                ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_15px_rgba(57,255,20,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đang In 3D ({rawMarketplaceOrders.filter(o => o.status === 'PRINTING').length})
          </button>
          <button
            onClick={() => setActiveOrderTab('SHIPPING')}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeOrderTab === 'SHIPPING'
                ? 'bg-[#00e5ff] text-[#040508] shadow-[0_0_15px_rgba(0,229,255,0.3)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đang Giao Hàng ({rawMarketplaceOrders.filter(o => o.status === 'SHIPPING').length})
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
                className="space-y-4 rounded-2xl border border-white/10 bg-[#0a0c12] p-5 sm:p-6 shadow-xl transition-all hover:border-[#39FF14]/40 relative overflow-hidden backdrop-blur-md"
              >
                {/* Dải màu nhận diện Đơn Marketplace */}
                {admin && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39FF14] to-[#00e5ff]" />
                )}

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {admin && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#39FF14]/15 text-[#39FF14] font-extrabold text-[11px] border border-[#39FF14]/40 flex items-center gap-1 font-mono">
                          <ShoppingBag className="w-3 h-3" /> MARKETPLACE
                        </span>
                      )}
                      <span className="font-mono text-sm sm:text-base font-bold text-white break-all">#{o.id}</span>
                      <button
                        onClick={() => copyOrderId(o.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#040508] border border-white/10 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white transition-colors"
                        title="Sao chép mã đơn"
                      >
                        {copiedId === o.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#39FF14]" />
                            <span className="text-[#39FF14] font-medium font-mono">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Thời gian đặt: <span className="text-slate-300 font-sans">{new Date(o.createdAt).toLocaleString('vi-VN')}</span> ·{' '}
                      Khách hàng: <span className="text-white font-bold font-sans">{admin ? o.buyerName : 'Bạn'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Trạng thái:</span>
                    <Status value={o.status} />
                  </div>
                </div>

                {/* Stepper */}
                <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3 sm:p-4">
                  <OrderStepper status={o.status} />
                </div>

                {/* Danh sách sản phẩm in 3D */}
                <div className="rounded-xl border border-white/10 bg-[#040508] p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/10 font-mono">
                    <ShoppingBag className="h-3.5 w-3.5 text-[#39FF14]" />
                    <span>Sản phẩm đặt in ({o.items?.length || 0})</span>
                  </div>
                  <ul className="divide-y divide-white/10">
                    {o.items?.map((i: OrderItemDTO, n: number) => (
                      <li key={n} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="space-y-0.5 max-w-md">
                          <p className="font-semibold text-white">{i.productTitle}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-400 font-mono">
                            <span>Số lượng: <strong className="text-white">{i.quantity}</strong></span>
                            {i.color && <span>· Màu: <strong className="text-slate-300">{i.color}</strong></span>}
                            {i.engravingText && <span>· Khắc tên: <strong className="text-[#39FF14]">"{i.engravingText}"</strong></span>}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                          <div>
                            <p className="font-mono font-bold text-white">{money(i.unitPrice * i.quantity)}</p>
                            <p className="text-xs text-slate-400 font-mono">{money(i.unitPrice)} / cái</p>
                          </div>
                          {o.status === 'COMPLETED' && !admin && (
                            <div className="pt-0.5">
                              {i.reviewId ? (
                                <button
                                  type="button"
                                  onClick={() => setReviewTarget({ orderId: o.id, item: i })}
                                  className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold hover:bg-[#39FF14]/20 transition active:scale-95 font-mono"
                                  title="Xem hoặc chỉnh sửa đánh giá"
                                >
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{i.reviewRating || 5}/5 · Đã đánh giá</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setReviewTarget({ orderId: o.id, item: i })}
                                  className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition shadow-sm active:scale-95"
                                  title="Đánh giá chất lượng in cho sản phẩm này"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>Đánh giá sản phẩm</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Địa chỉ & Thanh toán */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                      <MapPin className="h-4 w-4 text-[#39FF14] shrink-0" />
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

                  <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                      <CreditCard className="h-4 w-4 text-[#39FF14] shrink-0" />
                      <span>Phương thức &amp; Tình trạng thanh toán</span>
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
                      {o.status === 'PENDING' && o.paymentMethod === 'PAYOS' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#ff9100] font-mono font-semibold pt-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse text-[#ff9100] shrink-0" />
                          <span>Hạn thanh toán 15 phút (Đang giữ chỗ tồn kho)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">Tổng tiền thanh toán:</span>
                    <span className="text-xl sm:text-2xl font-black text-[#39FF14] font-mono">{money(o.totalAmount)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {admin && next && (
                      <button
                        className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black text-xs shadow-[0_0_15px_rgba(57,255,20,0.3)] transition cursor-pointer"
                        disabled={action.busy}
                        onClick={() => handleNextStatus(o.id, next, false, o.totalAmount, o.paymentMethod)}
                      >
                        Chuyển sang <Status value={next} className="ml-1" />
                      </button>
                    )}
                    {admin && !next && o.status === 'PENDING' && o.paymentMethod === 'PAYOS' && o.paymentStatus !== 'SUCCESS' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400 shrink-0" />
                        <span>Chờ khách quét mã PayOS</span>
                      </div>
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
                className="space-y-4 rounded-2xl border border-[#ff9100]/40 bg-[#0a0c12] p-5 sm:p-6 shadow-xl transition-all hover:border-[#ff9100] relative overflow-hidden backdrop-blur-md"
              >
                {/* Dải màu nhận diện Đơn Custom */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9100] via-[#ffaa33] to-[#39FF14]" />

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#ff9100]/15 text-[#ff9100] font-extrabold text-[11px] border border-[#ff9100]/40 flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3" /> ĐƠN IN CUSTOM 3D
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-white break-all">#CUS-{c.id.substring(0, 8)}</span>
                      <button
                        onClick={() => copyOrderId(c.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#040508] border border-white/10 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white transition-colors"
                        title="Sao chép mã đơn"
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#39FF14]" />
                            <span className="text-[#39FF14] font-medium font-mono">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Thời gian yêu cầu: <span className="text-slate-300 font-sans">{new Date(c.createdAt).toLocaleString('vi-VN')}</span> ·{' '}
                      Sinh viên / Khách: <span className="text-white font-bold font-sans">{c.buyerName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Trạng thái:</span>
                    <Status value={c.status} />
                  </div>
                </div>

                {/* Stepper */}
                <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3 sm:p-4">
                  <OrderStepper status={c.status} />
                </div>

                {/* Thông số kỹ thuật in thước custom */}
                <div className="rounded-xl border border-[#ff9100]/30 bg-[#040508] p-3.5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-[#ff9100] font-mono">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Thông số chế tác thước cá nhân hóa</span>
                    </div>
                    {c.attachmentUrl && (
                      <a
                        href={c.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#39FF14] hover:underline normal-case font-bold font-mono"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Tệp 3D
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block font-mono">Mẫu Thước:</span>
                      <strong className="text-white text-sm font-sans">{c.rulerModel || 'Thước Kỹ Thuật'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-mono">Khắc Tên &amp; MSSV:</span>
                      <strong className="text-[#39FF14] text-sm font-mono">
                        {c.customName || 'Không khắc'} {c.customStudentId ? `(${c.customStudentId})` : ''}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-mono">Màu sắc &amp; Kiểu chữ:</span>
                      <span className="text-slate-200 font-semibold font-mono">
                        Màu: {c.color || 'Mặc định'} · Font: {c.fontStyle || 'Chuẩn'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-mono">Số lượng in:</span>
                      <strong className="text-white text-sm font-mono">{c.quantity || 1} cái</strong>
                    </div>
                  </div>

                  {c.requirements && (
                    <div className="pt-2 text-xs text-slate-300 border-t border-white/10 font-mono">
                      <span className="text-slate-400 font-sans">Ghi chú riêng:</span> {c.requirements}
                    </div>
                  )}
                </div>

                {/* Địa chỉ & Thanh toán đơn custom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                      <MapPin className="h-4 w-4 text-[#ff9100] shrink-0" />
                      <span>Địa chỉ giao hàng</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300 pl-6">
                      <p className="text-white font-medium">Người nhận: <span className="font-bold">{c.buyerName}</span></p>
                      <p className="text-slate-300">Địa chỉ: {c.shippingAddress || 'Nhận tại KTX / PrintHub Lab'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#040508]/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                      <CreditCard className="h-4 w-4 text-[#ff9100] shrink-0" />
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
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">Giá chốt báo giá:</span>
                    <span className="text-xl sm:text-2xl font-black text-[#ff9100] font-mono">
                      {money(c.quotedPrice || 0)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {next && (
                      <button
                        className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#ff9100] hover:bg-[#ff9e1a] text-[#040508] font-black text-xs shadow-[0_0_15px_rgba(255,145,0,0.3)] transition cursor-pointer"
                        disabled={action.busy}
                        onClick={() => handleNextStatus(c.id, next, true, c.quotedPrice, c.paymentMethod)}
                      >
                        Chuyển sang <Status value={next} className="ml-1" />
                      </button>
                    )}
                    {!next && c.status === 'ACCEPTED' && c.paymentMethod === 'PAYOS' && c.paymentStatus !== 'SUCCESS' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400 shrink-0" />
                        <span>Chờ khách quét mã PayOS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Đánh giá chất lượng in 3D */}
      {reviewTarget && (
        <ReviewModal
          open={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          orderId={reviewTarget.orderId}
          orderItem={reviewTarget.item}
          onSuccess={handleReload}
        />
      )}
    </div>
  );
}
