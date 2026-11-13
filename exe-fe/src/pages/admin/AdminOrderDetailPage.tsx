import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  MapPin,
  CreditCard,
  FileCheck,
  Download,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Box,
  Layers,
  X,
} from 'lucide-react';
import api, { send, unwrap } from '../../services/api';
import checkoutOrderService, { type CheckoutOrderDTO } from '../../services/checkoutOrderService';
import CheckoutOrderDetailCard from '../../features/custom/CheckoutOrderDetailCard';
import type { OrderDTO, OrderItemDTO } from '../../services/orderService';
import { Status } from '../../components/DataUI';
import { money, formatDateTime } from '../../utils/format';
import { RulerSpecsViewer } from '../../components/RulerSpecsViewer';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { Modal3DViewer } from '../../features/ruler-studio/Modal3DViewer';
import type { Design } from '../../features/ruler-studio/model';
import '../../features/ruler-studio/studio.css';

interface CustomOrderAdminDetail {
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
  unitQuotedPrice?: number;
  quoteNote?: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  createdAt: string;
  allowedActions?: string[];
  blockedActions?: { action: string; reasonCode: string; message: string }[];
}

const STEPS = [
  { key: 'PENDING', label: 'Đặt đơn hàng', icon: ShoppingBag, desc: 'Tiếp nhận / Chờ thanh toán' },
  { key: 'PREPARING', label: 'Chuẩn bị phôi & file', icon: Box, desc: 'Kiểm tra file 3D & vật liệu' },
  { key: 'PRINTING', label: 'Đang in 3D', icon: Layers, desc: 'Gia công in tại xưởng' },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: MapPin, desc: 'Đóng gói & vận chuyển' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle, desc: 'Đã giao thành công' },
];

function getActiveStep(s: string) {
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
    case 'EXPIRED':
      return -1;
    default:
      return 0;
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'MARKETPLACE' | 'CUSTOM' | 'CHECKOUT' | null>(null);
  const [marketplaceOrder, setMarketplaceOrder] = useState<OrderDTO | null>(null);
  const [customOrder, setCustomOrder] = useState<CustomOrderAdminDetail | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<CheckoutOrderDTO | null>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [preview3D, setPreview3D] = useState<{ design: Design; name: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [codConfirmOpen, setCodConfirmOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    // 1. Thử tải dưới dạng đơn Marketplace
    try {
      const res = await api.get<{ code: number; result: OrderDTO } | OrderDTO>(`/orders/${id}`);
      const data = unwrap(res.data);
      if (data && (data.id || (data as OrderDTO).items)) {
        setMarketplaceOrder(data as OrderDTO);
        setCustomOrder(null);
        setCheckoutOrder(null);
        setOrderType('MARKETPLACE');
        setLoading(false);
        return;
      }
    } catch {
      // Bỏ qua lỗi và thử tiếp dạng CheckoutOrder cha
    }

    // 2. Thử tải dưới dạng đơn cha CheckoutOrder (đơn gộp / báo giá nhiều món)
    try {
      const coData = await checkoutOrderService.getAdminCheckoutOrder(id);
      if (coData && coData.id) {
        setCheckoutOrder(coData);
        setMarketplaceOrder(null);
        setCustomOrder(null);
        setOrderType('CHECKOUT');
        setLoading(false);
        return;
      }
    } catch {
      // Bỏ qua lỗi và thử tiếp dạng Custom Order lẻ
    }

    // 3. Thử tìm trong danh sách Custom Order của Admin
    try {
      const res = await api.get<{ code: number; result: CustomOrderAdminDetail[] } | CustomOrderAdminDetail[]>(
        '/admin/custom-orders'
      );
      const list = unwrap(res.data) || [];
      const found = Array.isArray(list) ? list.find((c) => c.id === id) : null;
      if (found) {
        setCustomOrder(found);
        setMarketplaceOrder(null);
        setCheckoutOrder(null);
        setOrderType('CUSTOM');
        setLoading(false);
        return;
      }
    } catch {
      // Thử thất bại
    }

    setError(`Không tìm thấy đơn hàng có mã ID: ${id}`);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

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

  // Tính toán trạng thái tiếp theo
  const getNextStatus = (): string => {
    if (orderType === 'MARKETPLACE' && marketplaceOrder) {
      if (marketplaceOrder.allowedActions && marketplaceOrder.allowedActions.length > 0) {
        const act = marketplaceOrder.allowedActions.find((a) => a !== 'CANCEL');
        return act ? actionToStatus(act) : '';
      }
      if (marketplaceOrder.status === 'PENDING') {
        if (marketplaceOrder.paymentMethod === 'COD') return 'PREPARING';
        if (
          marketplaceOrder.paymentMethod === 'PAYOS' &&
          (marketplaceOrder.paymentStatus === 'SUCCESS' || marketplaceOrder.paymentStatus === 'PAID')
        )
          return 'PREPARING';
        return '';
      }
      if (marketplaceOrder.status === 'PAID') return 'PREPARING';
      if (marketplaceOrder.status === 'PREPARING') return 'SHIPPING';
      if (marketplaceOrder.status === 'PRINTING') return 'SHIPPING';
      if (marketplaceOrder.status === 'SHIPPING') return 'COMPLETED';
    } else if (orderType === 'CUSTOM' && customOrder) {
      if (customOrder.allowedActions && customOrder.allowedActions.length > 0) {
        const act = customOrder.allowedActions.find((a) => a !== 'CANCEL' && a !== 'QUOTE');
        return act ? actionToStatus(act) : '';
      }
      if (customOrder.status === 'ACCEPTED') {
        if (customOrder.paymentMethod === 'COD') return 'PREPARING';
        if (
          customOrder.paymentMethod === 'PAYOS' &&
          (customOrder.paymentStatus === 'SUCCESS' || customOrder.paymentStatus === 'PAID')
        )
          return 'PREPARING';
        return '';
      }
      if (customOrder.status === 'PAID') return 'PREPARING';
      if (customOrder.status === 'PREPARING') return 'PRINTING';
      if (customOrder.status === 'PRINTING') return 'SHIPPING';
      if (customOrder.status === 'SHIPPING') return 'COMPLETED';
    }
    return '';
  };

  const nextStatus = getNextStatus();

  const handleUpdateStatus = async (targetStatus: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      if (orderType === 'CUSTOM') {
        await send(`/custom-orders/${id}/status`, { status: targetStatus }, 'put');
      } else {
        await send(`/orders/${id}/status`, { status: targetStatus }, 'put');
      }
      await fetchOrderDetail();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn:', err);
    } finally {
      setUpdating(false);
      setCodConfirmOpen(false);
      setCancelConfirmOpen(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!customOrder) return;
    try {
      const res = await api.get(`/admin/custom-orders/${customOrder.id}/file`, { responseType: 'blob' });
      const blob = new Blob([res.data as BlobPart], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `custom-ruler-${customOrder.id.slice(0, 8)}.stl`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Lỗi tải file 3D:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RotateCcw className="w-8 h-8 text-[#39FF14] animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Đang tải thông tin chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (orderType === 'CHECKOUT' && checkoutOrder) {
    return (
      <div className="space-y-6 w-full max-w-5xl mx-auto py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:bg-[#11141e] text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <span className="text-xs font-mono text-slate-400">
            Chi tiết &amp; Báo giá đơn hàng gộp (#CHK-{checkoutOrder.id.slice(0, 8)})
          </span>
        </div>

        <CheckoutOrderDetailCard
          checkoutOrder={checkoutOrder}
          admin
          busy={updating}
          onRunAction={async (fn) => {
            setUpdating(true);
            try {
              await fn();
              await fetchOrderDetail();
            } finally {
              setUpdating(false);
            }
          }}
        />
      </div>
    );
  }

  if (error || (!marketplaceOrder && !customOrder)) {
    return (
      <div className="space-y-6 w-full max-w-5xl mx-auto py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:bg-[#11141e] text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="p-8 rounded-2xl bg-[#0a0c12] border border-red-500/30 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Không tìm thấy đơn hàng</h2>
          <p className="text-sm text-slate-400 font-mono">{error || 'Đơn hàng không tồn tại trên hệ thống.'}</p>
          <div className="pt-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39FF14] text-[#040508] font-black text-xs shadow-md transition"
            >
              Về danh sách Quản lý đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = marketplaceOrder ? marketplaceOrder.status : customOrder!.status;
  const currentStepIdx = getActiveStep(currentStatus);

  // Parse custom requirement meta
  const customMeta = (() => {
    if (!customOrder?.requirements) return { glbUrl: null, previewImageUrl: null, design: null };
    try {
      if (customOrder.requirements.startsWith('{')) {
        const p = JSON.parse(customOrder.requirements);
        return {
          glbUrl: (p?.glbUrl as string) || null,
          previewImageUrl: (p?.previewImageUrl || p?.screenshotUrl || p?.imageUrl || null) as string | null,
          design: (p?.rulerId ? p : null) as Design | null,
        };
      }
    } catch {}
    return { glbUrl: null, previewImageUrl: null, design: null };
  })();

  const isAttachmentImg = Boolean(
    customOrder?.attachmentUrl &&
      (customOrder.attachmentUrl.toLowerCase().includes('.png') ||
        customOrder.attachmentUrl.toLowerCase().includes('.jpg') ||
        customOrder.attachmentUrl.toLowerCase().includes('.jpeg') ||
        customOrder.attachmentUrl.toLowerCase().includes('.webp') ||
        customOrder.attachmentUrl.toLowerCase().includes('/image/upload/'))
  );
  const resolvedCustomImage = customMeta.previewImageUrl || (isAttachmentImg ? customOrder?.attachmentUrl : null);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-[#0a0c12] hover:bg-[#11141e] text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#39FF14]" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:bg-[#11141e] text-slate-400 hover:text-white text-xs font-mono transition"
          >
            Quản lý đơn
          </Link>
          <Link
            to="/admin/order-history"
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:bg-[#11141e] text-slate-400 hover:text-white text-xs font-mono transition"
          >
            Lịch sử đơn
          </Link>
        </div>
      </div>

      {/* Main Order Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {orderType === 'MARKETPLACE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#39FF14] text-xs font-mono font-bold">
                  <ShoppingBag className="w-3.5 h-3.5" /> ĐƠN MUA MARKETPLACE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#ff9100] text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> ĐƠN IN 3D CUSTOM THEO YÊU CẦU
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-white font-mono">
                #{orderType === 'MARKETPLACE' ? marketplaceOrder?.id : customOrder?.id}
              </h1>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Sao chép mã đơn"
              >
                {copiedId ? <Check className="w-4 h-4 text-[#39FF14]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Thời gian khởi tạo:{' '}
              <span className="text-slate-200">
                {formatDateTime(marketplaceOrder?.createdAt || customOrder?.createdAt || '')}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">Trạng thái hiện tại:</span>
              <Status value={currentStatus} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="pt-4 border-t border-white/10">
          {currentStatus === 'CANCELLED' ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Đơn hàng này đã bị hủy bỏ trên hệ thống.</span>
            </div>
          ) : currentStatus === 'EXPIRED' ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-semibold">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Đơn hàng đã hết hạn thanh toán PayOS VietQR.</span>
            </div>
          ) : (
            <div className="py-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#39FF14] shadow-md shadow-emerald-950/50 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(0, Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100))}%`,
                  }}
                />

                {STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 group select-none">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? 'bg-[#39FF14] text-[#040508] shadow-md shadow-emerald-950/50 font-black'
                            : isCurrent
                            ? 'bg-[#040508] border-2 border-[#39FF14] text-[#39FF14] shadow-md shadow-emerald-950/50 ring-4 ring-[#39FF14]/20 scale-110'
                            : 'bg-[#040508] border border-white/15 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : <StepIcon className="w-5 h-5" />}
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
          )}
        </div>
      </div>

      {/* Grid: 2 Columns - Customer & Delivery / Payment & Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Khách hàng & Giao hàng */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 font-mono text-xs font-bold text-white uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#39FF14]" />
            <span>Thông Tin Khách Hàng &amp; Nhận Hàng</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-mono">Tài khoản đặt đơn:</span>
              <span className="text-white font-bold text-sm">
                {orderType === 'MARKETPLACE' ? marketplaceOrder?.buyerName : customOrder?.buyerName}
              </span>
            </div>

            {orderType === 'MARKETPLACE' && marketplaceOrder?.shippingInfo ? (
              <>
                <div>
                  <span className="text-slate-400 block font-mono">Người nhận hàng:</span>
                  <span className="text-slate-200 font-semibold">{marketplaceOrder.shippingInfo.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Số điện thoại liên lạc:</span>
                  <span className="text-[#39FF14] font-mono font-bold">{marketplaceOrder.shippingInfo.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Địa chỉ giao hàng đầy đủ:</span>
                  <p className="text-slate-200 font-medium leading-relaxed bg-[#11141e] p-3 rounded-xl border border-white/5 mt-1">
                    {marketplaceOrder.shippingInfo.address}, {marketplaceOrder.shippingInfo.province}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <span className="text-slate-400 block font-mono">Địa chỉ nhận hàng:</span>
                <p className="text-slate-200 font-medium leading-relaxed bg-[#11141e] p-3 rounded-xl border border-white/5 mt-1">
                  {customOrder?.shippingAddress || 'Chưa cung cấp địa chỉ giao hàng cụ thể.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Tài chính & Thanh toán */}
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 font-mono text-xs font-bold text-white uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#39FF14]" />
            <span>Thanh Toán &amp; Quyết Toán Sàn</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">Hình thức thanh toán:</span>
              <span className="font-semibold text-white">
                {(orderType === 'MARKETPLACE' ? marketplaceOrder?.paymentMethod : customOrder?.paymentMethod) === 'COD'
                  ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                  : 'PayOS (Cổng quét mã VietQR tự động)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">Tình trạng thanh toán:</span>
              <Status
                value={
                  orderType === 'MARKETPLACE'
                    ? marketplaceOrder?.paymentStatus || (marketplaceOrder?.status === 'PAID' ? 'PAID' : 'UNPAID')
                    : customOrder?.paymentStatus ||
                      (['PAID', 'COMPLETED'].includes(customOrder?.status || '') ? 'PAID' : 'PENDING')
                }
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-slate-400 font-mono text-sm">Tổng tiền đơn hàng:</span>
              <span className="text-2xl font-black text-[#39FF14] font-mono">
                {orderType === 'MARKETPLACE'
                  ? money(marketplaceOrder?.totalAmount || 0)
                  : customOrder?.quotedPrice
                  ? money(customOrder.quotedPrice)
                  : 'Chờ báo giá'}
              </span>
            </div>

            {currentStatus === 'PENDING' &&
              (orderType === 'MARKETPLACE' ? marketplaceOrder?.paymentMethod : customOrder?.paymentMethod) ===
                'PAYOS' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span>Đơn hàng đang chờ người mua quét mã VietQR PayOS trong phiên thanh toán.</span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Card 3: Chi tiết sản phẩm hoặc Bản thiết kế 3D Custom */}
      {orderType === 'MARKETPLACE' && marketplaceOrder && (
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-[#39FF14]" />
              <span>Danh Sách Sản Phẩm Trong Đơn ({marketplaceOrder.items?.length || 0})</span>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {marketplaceOrder.items?.map((item: OrderItemDTO, idx: number) => (
              <div key={idx} className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#11141e] border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                    <Box className="w-6 h-6 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.productTitle}</h3>
                    <div className="flex flex-wrap gap-2 text-slate-400 font-mono mt-0.5">
                      <span>
                        Số lượng: <strong className="text-white">{item.quantity}</strong>
                      </span>
                      {item.color && (
                        <span>
                          · Màu: <strong className="text-slate-200">{item.color}</strong>
                        </span>
                      )}
                      {item.engravingText && (
                        <span>
                          · Khắc tên: <strong className="text-[#39FF14]">"{item.engravingText}"</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white font-mono block">
                    {money(item.unitPrice * item.quantity)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{money(item.unitPrice)} / cái</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orderType === 'CUSTOM' && customOrder && (
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#ff9100]/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ff9100] uppercase tracking-wider">
              <FileCheck className="w-4 h-4" />
              <span>Hồ Sơ Kỹ Thuật Đơn In Thước 3D Cá Nhân Hóa</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {customMeta.design && (
                <button
                  type="button"
                  onClick={() =>
                    setPreview3D({
                      design: customMeta.design!,
                      name: customOrder.rulerModel || 'Thước 3D Custom',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[#39FF14] text-xs font-mono font-bold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem Mô Hình 3D (Xoay 360°)
                </button>
              )}

              {customMeta.glbUrl && (
                <a
                  href={customMeta.glbUrl}
                  download={`custom-ruler-${customOrder.id.slice(0, 8)}.glb`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Tải Tệp .GLB (3D Color)
                </a>
              )}

              <button
                type="button"
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-mono font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Tải Tệp STL / CAD
              </button>
            </div>
          </div>

          {/* Visual 3D Preview Image if Available */}
          {resolvedCustomImage && (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-[#040508] border border-white/10">
              <img
                src={resolvedCustomImage}
                alt="3D Preview Render"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg border border-white/10 bg-[#07090e] shrink-0 cursor-pointer hover:opacity-90 transition"
                onClick={() => setPreviewImage(resolvedCustomImage)}
              />
              <div className="space-y-1 text-xs">
                <span className="font-mono text-[#39FF14] font-bold block">ẢNH KẾT XUẤT 3D MÔ PHỎNG (PREVIEW RENDER)</span>
                <p className="text-slate-300">
                  Mô hình 3D thực tế theo các thông số đã cấu hình từ studio (vạch chia, chữ khắc, sticker nổi).
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewImage(resolvedCustomImage)}
                  className="text-xs text-[#00e5ff] hover:underline font-mono inline-flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> Xem ảnh kích thước đầy đủ
                </button>
              </div>
            </div>
          )}

          {/* Detailed Specs Viewer */}
          <RulerSpecsViewer requirements={customOrder.requirements || ''} />
        </div>
      )}

      {/* Card 4: Thao tác Quản trị viên (Admin Controls) */}
      <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
            <span>Thao Tác Quản Trị &amp; Cập Nhật Tiến Độ</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Quyền: Quản Trị Viên (System Admin)</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 space-y-1">
            <p>
              Tiến độ hiện tại: <span className="font-bold text-white font-mono">{currentStatus}</span>
            </p>
            {nextStatus && (
              <p>
                Bước kế tiếp: <span className="font-bold text-[#39FF14] font-mono">{nextStatus}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentStatus !== 'CANCELLED' && currentStatus !== 'COMPLETED' && currentStatus !== 'EXPIRED' && (
              <button
                type="button"
                onClick={() => setCancelConfirmOpen(true)}
                disabled={updating}
                className="px-4 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-xs transition cursor-pointer"
              >
                Hủy Đơn Hàng Này
              </button>
            )}

            {nextStatus && (
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  const paymentMethod =
                    orderType === 'MARKETPLACE' ? marketplaceOrder?.paymentMethod : customOrder?.paymentMethod;
                  if (nextStatus === 'COMPLETED' && paymentMethod === 'COD') {
                    setCodConfirmOpen(true);
                  } else {
                    void handleUpdateStatus(nextStatus);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black text-xs shadow-md shadow-emerald-950/50 transition cursor-pointer flex items-center gap-2"
              >
                {updating ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Chuyển Sang Trạng Thái:</span>
                    <Status value={nextStatus} />
                  </>
                )}
              </button>
            )}

            {!nextStatus && currentStatus === 'PENDING' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-semibold">
                <Clock className="w-4 h-4 animate-pulse text-amber-400 shrink-0" />
                <span>Chờ người mua thanh toán trước khi có thể chuyển bước gia công</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Interactive Viewer Modal */}
      {preview3D && (
        <Modal
          open={Boolean(preview3D)}
          onClose={() => setPreview3D(null)}
          label={`Mô hình 3D: ${preview3D.name}`}
          className="!w-full !max-w-2xl"
        >
          <div className="space-y-4">
            <Modal3DViewer design={preview3D.design} />
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPreview3D(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-[#11141e] hover:bg-[#1a2030] text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Render Image Fullsize Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-[#0a0c12] border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Render 3D Fullsize" className="max-w-full max-h-[80vh] object-contain mx-auto" />
            <div className="p-3 text-center">
              <span className="text-xs text-slate-300 font-mono">Nhấn vào bất kỳ đâu để đóng</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm COD Modal */}
      <ConfirmDialog
        open={codConfirmOpen}
        onClose={() => setCodConfirmOpen(false)}
        title="Xác nhận giao hàng & Thu tiền COD thành công"
        description={`Đơn hàng ${id?.slice(0, 8)} thanh toán bằng hình thức COD (${
          orderType === 'MARKETPLACE'
            ? money(marketplaceOrder?.totalAmount || 0)
            : money(customOrder?.quotedPrice || 0)
        }). Bạn xác nhận shipper đã giao hàng và thu đủ tiền từ khách hàng?`}
        confirmText="Đã Thu Tiền & Hoàn Thành Đơn"
        cancelText="Hủy Bỏ"
        variant="primary"
        busy={updating}
        onConfirm={() => void handleUpdateStatus('COMPLETED')}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmDialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        title="Xác nhận hủy đơn hàng"
        description={`Bạn có chắc chắn muốn hủy đơn hàng #${id?.slice(0, 8)}? Hành động này sẽ cập nhật trạng thái đơn thành CANCELLED.`}
        confirmText="Xác Nhận Hủy Đơn"
        cancelText="Đóng"
        variant="danger"
        busy={updating}
        onConfirm={() => void handleUpdateStatus('CANCELLED')}
      />
    </div>
  );
}
