import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService, type CheckoutOrderDetailDTO, type CustomOrderItemDTO } from '../services/checkoutService';
import { payOrder } from '../services/paymentService';
import { money } from '../utils/format';
import { Status, CopyButton, secondary, button } from '../components/DataUI';
import Modal from '../components/Modal';

export default function CheckoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<CheckoutOrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // PayOS Modal state
  const [payModal, setPayModal] = useState<{
    open: boolean;
    url: string;
    scope: 'ALL' | 'MARKETPLACE' | 'CUSTOM';
    title: string;
    amount: number;
  } | null>(null);

  // Khóa idempotency ổn định gắn liền với phiên bản đơn (Task 2.1)
  const confirmIdempotencyKey = useMemo(() => crypto.randomUUID(), [order?.id, order?.summaryVersion]);

  // Load checkout order details directly from server
  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await checkoutService.getCheckoutOrder(id);
      setOrder(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể tải thông tin đơn hàng.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout/${id}`);
      return;
    }
    loadOrder();
  }, [isAuthenticated, id, loadOrder, navigate]);

  // Handle PayOS payment link creation & launch
  const handlePay = async (scope: 'ALL' | 'MARKETPLACE' | 'CUSTOM', batchTitle: string, payableAmount: number) => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    try {
      // 1. If paying scope involves custom and order or custom batch is in QUOTED state, confirm it first with current summaryVersion (R03)
      // Scope guard: Paying for MARKETPLACE only must NOT confirm custom quotations!
      const scopeInvolvesCustom = scope === 'ALL' || scope === 'CUSTOM';
      const needsConfirm = scopeInvolvesCustom && (
        order.status === 'QUOTED' ||
        order.customStatus === 'QUOTED' ||
        (!order.readyForConfirm && order.allCustomQuoted && order.customStatus !== 'CONFIRMED' && order.customStatus !== 'PAID')
      );
      if (needsConfirm) {
        await checkoutService.confirmCheckoutOrder(order.id, {
          shippingAddress: order.shippingAddress,
          summaryVersion: order.summaryVersion,
          idempotencyKey: confirmIdempotencyKey,
        });
      }

      // 2. Generate PayOS Payment Link for the specified scope
      const paymentUrl = await payOrder(order.id, 'CHECKOUT_ORDER', scope, false);

      // Open PayOS Modal or direct URL
      setPayModal({
        open: true,
        url: paymentUrl,
        scope,
        title: batchTitle,
        amount: payableAmount,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo liên kết thanh toán. Vui lòng thử lại.';
      setActionError(msg);
      // Reload order in case price or summaryVersion changed on backend
      loadOrder();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium">Đang tải chi tiết đơn thanh toán từ máy chủ…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-red-500/30 bg-red-950/20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không thể hiển thị đơn thanh toán</h2>
        <p className="text-sm text-slate-300">{error || 'Không tìm thấy dữ liệu đơn hàng.'}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={loadOrder} className={`${button} flex items-center gap-2`}>
            <RefreshCw className="w-4 h-4" /> Thử tải lại
          </button>
          <Link to="/orders" className={secondary}>
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const isSeparate = order.shippingMode === 'SEPARATE';
  const hasMarketplace = order.marketplaceOrders && order.marketplaceOrders.length > 0;
  const hasCustom = order.customOrders && order.customOrders.length > 0;

  // Calculate totals
  const marketplaceSubtotal = (order.marketplaceOrders || []).reduce((acc, mo) => {
    return acc + (mo.items || []).reduce((subAcc, item) => subAcc + (item.unitPrice * item.quantity), 0);
  }, 0);

  const customSubtotal = (order.customOrders || []).reduce((acc, co) => {
    const qty = co.quantity || 1;
    if (co.quotedPrice != null && co.quotedPrice > 0) {
      if (co.priceVersion && co.priceVersion >= 2) {
        return acc + (co.quotedPrice * qty);
      }
      return acc + co.quotedPrice;
    }
    return acc;
  }, 0);

  // Delivery fee logic from server snapshot (R10)
  const singleShippingFee = order.shippingFee ?? 15000;
  const mpShipping = order.marketplaceShippingFee ?? (isSeparate && hasMarketplace ? singleShippingFee : 0);
  const custShipping = order.customShippingFee ?? (isSeparate && !hasMarketplace ? singleShippingFee : 0);

  const mpPayable = marketplaceSubtotal + mpShipping;
  const custPayable = customSubtotal + custShipping;
  const calculatedGrandTotal = isSeparate
    ? mpPayable + custPayable
    : marketplaceSubtotal + customSubtotal + singleShippingFee;

  // Nếu đơn có custom items đã báo giá nhưng chưa chuyển sang PAID/PROCESSING, dùng calculatedGrandTotal để phản ánh giá đã duyệt
  const totalCalculated = (order.status === 'PAID' || order.status === 'PROCESSING' || (order.status === 'CONFIRMED' && !hasCustom))
    ? (order.totalAmount ?? calculatedGrandTotal)
    : calculatedGrandTotal;

  const isPaymentCancelled = searchParams.get('cancel') === 'true';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* PayOS Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} label={payModal?.title || 'Thanh toán PayOS'}>
        {payModal && (
          <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-surface p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shrink-0">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{payModal.title}</h3>
                <p className="text-xs text-slate-400">Quét mã VietQR thanh toán tự động qua PayOS 24/7</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-inset p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-slate-400 text-xs">Phạm vi thanh toán:</span>
                <span className="font-semibold text-primary text-xs">
                  {payModal.scope === 'MARKETPLACE'
                    ? 'Đợt 1 - Hàng có sẵn'
                    : payModal.scope === 'CUSTOM'
                    ? 'Đợt 2 - Sản phẩm in Custom'
                    : 'Toàn bộ đơn hàng'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-medium">Số tiền cần thanh toán:</span>
                <span className="text-2xl font-black text-primary">{money(payModal.amount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={payModal.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-sm font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20 min-h-[44px]"
                onClick={() => setPayModal(null)}
              >
                <CreditCard className="h-4 w-4" />
                Mở cổng thanh toán VietQR
                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
              </a>
              <button
                className={`${secondary} py-3 px-4 text-sm min-h-[44px]`}
                onClick={() => setPayModal(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-surface text-slate-400 hover:text-white hover:border-primary/50 transition-colors"
            title="Quay lại danh sách đơn"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">Chi tiết đơn thanh toán</h1>
              <span className="font-mono text-sm px-2.5 py-1 rounded-lg bg-surface-inset text-primary font-bold border border-primary/20">
                #{order.id}
              </span>
              <CopyButton text={order.id} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Thời gian khởi tạo: {new Date(order.createdAt).toLocaleString('vi-VN')} · Phiên bản: v{order.summaryVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-slate-300 hover:text-white hover:border-primary/50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
          <Status value={order.status} />
        </div>
      </div>

      {/* Cancelled from PayOS Notice */}
      {isPaymentCancelled && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-200">
            <strong className="font-bold text-amber-300 block mb-0.5">Bạn vừa hủy hoặc quay lại từ cổng thanh toán</strong>
            Trạng thái đơn hàng vẫn được giữ nguyên an toàn. Bạn có thể kiểm tra lại thông tin chi tiết và bấm nút thanh toán bên dưới bất cứ lúc nào.
          </div>
        </div>
      )}

      {/* Action Error Alert */}
      {actionError && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-red-200 space-y-1">
            <strong className="font-bold text-red-300 block">Thao tác chưa thành công</strong>
            <p>{actionError}</p>
          </div>
        </div>
      )}

      {/* Order General Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/80 bg-surface p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-primary" /> Phương thức giao hàng
          </div>
          <p className="text-sm font-bold text-white">
            {isSeparate ? '🚚 Giao riêng từng phần (2 đợt)' : '📦 Giao chung 1 đợt (Sau khi custom xong)'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isSeparate
              ? 'Hàng có sẵn xuất kho giao ngay; Sản phẩm in custom sản xuất và giao đợt 2.'
              : 'Chờ xưởng hoàn thiện toàn bộ sản phẩm custom và giao cùng hàng có sẵn trong 1 kiện.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-primary" /> Địa chỉ giao hàng
          </div>
          <p className="text-sm font-medium text-slate-200 leading-relaxed break-words">
            {order.shippingAddress || 'Chưa cung cấp địa chỉ'}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-primary" /> Tổng thanh toán đơn cha
          </div>
          <p className="text-2xl font-black text-primary">
            {order.totalAmount ? money(order.totalAmount) : money(totalCalculated)}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Phí vận chuyển chuẩn:</span>
            <span className="font-semibold text-slate-200">{singleShippingFee > 0 ? money(singleShippingFee) : 'Miễn phí (VIP)'}</span>
          </div>
        </div>
      </div>

      {/* BATCHES SECTION */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Các đợt giao & Chi tiết sản phẩm
        </h2>

        {/* 1. MARKETPLACE BATCH */}
        {hasMarketplace && (
          <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isSeparate ? 'Đợt 1: Hàng có sẵn trong kho (Marketplace)' : 'Nhóm hàng có sẵn (Marketplace)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sản phẩm xuất kho trực tiếp từ người bán / hệ thống PrintHub 3D
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trạng thái đợt:</span>
                <Status value={order.marketplaceStatus || 'PENDING'} />
              </div>
            </div>

            {/* Items list */}
            <div className="divide-y divide-border/40">
              {order.marketplaceOrders?.flatMap(mo => mo.items || []).map((item, idx) => (
                <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="space-y-0.5 max-w-md">
                    <p className="font-semibold text-white">{item.productTitle}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>Đơn giá: <strong className="text-slate-200">{money(item.unitPrice)}</strong></span>
                      <span>· Số lượng: <strong className="text-white">{item.quantity}</strong></span>
                      {item.color && <span>· Màu: <strong className="text-slate-300">{item.color}</strong></span>}
                      {item.engravingText && <span>· Khắc tên: "{item.engravingText}"</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-100">{money(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Batch subtotal and Shipping breakdown */}
            <div className="rounded-xl border border-border/60 bg-surface-inset p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Tiền hàng có sẵn:</span>
                <span className="font-semibold text-slate-200">{money(marketplaceSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Phí vận chuyển đợt này:</span>
                <span className="font-semibold text-slate-200">
                  {mpShipping > 0 ? money(mpShipping) : '0đ (Đã bao gồm hoặc VIP Freeship)'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/40 text-base font-bold">
                <span className="text-white">Tổng tiền đợt 1:</span>
                <span className="text-primary font-black">{money(mpPayable)}</span>
              </div>
            </div>

            {/* Batch Action for Separate Shipping */}
            {isSeparate && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  {order.marketplaceStatus === 'PAID' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Đợt 1 đã thanh toán thành công · Đang chuẩn bị hàng
                    </span>
                  ) : (
                    <span>Bạn có thể thanh toán trước Đợt 1 để nhận hàng sớm mà không cần chờ duyệt custom.</span>
                  )}
                </div>

                {order.marketplaceStatus !== 'PAID' && (
                  (order.paymentMethod === 'COD' || order.marketplaceOrders?.some(m => m.paymentMethod === 'COD')) ? (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 px-3.5 py-2 text-xs text-blue-300 font-medium flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      Thanh toán khi nhận hàng (COD) · Người bán đang chuẩn bị giao
                    </div>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handlePay('MARKETPLACE', 'Thanh toán Đợt 1 - Hàng có sẵn', mpPayable)}
                      className={`${button} flex items-center gap-2`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Thanh toán Đợt 1 ({money(mpPayable)})
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. CUSTOM ORDER BATCH */}
        {hasCustom && (
          <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isSeparate ? 'Đợt 2: Sản phẩm in 3D theo yêu cầu (Custom)' : 'Nhóm sản phẩm in 3D Custom'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gia công theo thiết kế và thẩm định trực tiếp bởi kỹ thuật viên xưởng in
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trạng thái đợt:</span>
                <Status value={order.customStatus || 'PENDING_QUOTE'} />
              </div>
            </div>

            {/* Custom items list */}
            <div className="divide-y divide-border/40">
              {order.customOrders?.map((item: CustomOrderItemDTO, idx: number) => {
                const qty = item.quantity || 1;
                const unitPrice = item.unitPrice || item.quotedPrice;
                const lineTotal = item.quotedPrice != null && item.quotedPrice > 0
                  ? (item.priceVersion && item.priceVersion >= 2 ? item.quotedPrice * qty : item.quotedPrice)
                  : null;

                return (
                  <div key={idx} className="py-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {item.rulerModel ? `Thước in 3D: ${item.rulerModel}` : 'Mô hình in 3D Custom'}
                          </span>
                          <Status value={item.status} />
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                          Yêu cầu: {item.requirements || 'In theo file đính kèm'}
                        </p>
                        {item.attachmentUrl && (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium pt-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Xem file thiết kế 3D đã gửi
                          </a>
                        )}
                      </div>

                      <div className="text-right">
                        {lineTotal != null ? (
                          <div className="space-y-0.5">
                            <p className="text-base font-black text-primary font-mono">{money(lineTotal)}</p>
                            <p className="text-xs text-slate-400">
                              Đơn giá: <strong className="text-slate-200">{money(unitPrice || 0)}</strong> · SL: <strong className="text-white">{qty}</strong>
                            </p>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5" /> Chờ xưởng báo giá
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom batch totals */}
            <div className="rounded-xl border border-border/60 bg-surface-inset p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Tiền gia công in custom:</span>
                <span className="font-semibold text-slate-200">
                  {customSubtotal > 0 ? money(customSubtotal) : 'Chờ hoàn tất báo giá'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Phí vận chuyển đợt này:</span>
                <span className="font-semibold text-slate-200">
                  {custShipping > 0
                    ? money(custShipping)
                    : isSeparate && hasMarketplace
                    ? '0đ (Đã tính chung ở Đợt 1)'
                    : '0đ (VIP Freeship)'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/40 text-base font-bold">
                <span className="text-white">Tổng tiền đợt 2:</span>
                <span className="text-primary font-black">
                  {customSubtotal > 0 ? money(custPayable) : 'Chờ báo giá'}
                </span>
              </div>
            </div>

            {/* Batch Action for Separate Shipping */}
            {isSeparate && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  {order.customStatus === 'PAID' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Đợt 2 đã thanh toán thành công · Đang gia công in 3D
                    </span>
                  ) : order.allCustomQuoted ? (
                    <span className="text-slate-300">
                      Tất cả các món custom đã có báo giá từ kỹ thuật viên. Bạn có thể duyệt và thanh toán Đợt 2.
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Đang chờ xưởng duyệt báo giá đầy đủ trước khi thanh toán.
                    </span>
                  )}
                </div>

                {order.customStatus !== 'PAID' && order.allCustomQuoted && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handlePay('CUSTOM', 'Duyệt báo giá & Thanh toán Đợt 2 (Custom)', custPayable)}
                    className={`${button} flex items-center gap-2`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Duyệt & Thanh toán Đợt 2 ({money(custPayable)})
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. UNIFIED ACTION FOR WAIT_ALL / COMMON DELIVERY MODE */}
        {!isSeparate && (
          <div className="rounded-2xl border border-primary/40 bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Thanh toán toàn bộ đơn hàng (Giao chung 1 đợt)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {!order.allCustomQuoted
                    ? 'Đơn hàng đang chờ xưởng thẩm định và báo giá các sản phẩm custom. Sau khi hoàn tất báo giá, nút thanh toán sẽ sẵn sàng.'
                    : 'Toàn bộ sản phẩm đã có giá chốt. Bạn có thể tiến hành xác nhận và thanh toán an toàn qua VietQR PayOS.'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-primary font-mono">{money(totalCalculated)}</p>
                <p className="text-xs text-slate-400">Đã bao gồm phí vận chuyển</p>
              </div>
            </div>

            {order.status === 'PAID' || order.status === 'PROCESSING' || (order.status === 'CONFIRMED' && (order.paymentMethod === 'COD' || order.marketplaceStatus === 'PAID')) ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {order.paymentMethod === 'COD'
                  ? 'Đơn hàng giao chung đã được xác nhận (COD) và đang được chuẩn bị gia công/đóng gói.'
                  : 'Đơn hàng đã được thanh toán thành công và đang được chuẩn bị gia công/đóng gói.'}
              </div>
            ) : order.allCustomQuoted ? (
              <div className="pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handlePay('ALL', 'Thanh toán toàn bộ đơn hàng', totalCalculated)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-6 text-sm font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20"
                >
                  <CreditCard className="w-5 h-5" />
                  Xác nhận báo giá & Thanh toán qua PayOS ({money(totalCalculated)})
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border/80 bg-surface-inset p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                Vui lòng chờ kỹ thuật viên phản hồi báo giá để hoàn tất đơn hàng.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
