import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShippingAddress } from '../features/address/data';
import type { useCart } from '../features/cart/hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { send } from '../services/api';
import { useAction } from '../hooks/useRemote';
import { PageHeader, Card, Notice, Status, button, secondary, CopyButton } from '../components/DataUI';
import { money } from '../utils/format';
import Modal from '../components/Modal';
import CartItem from '../features/cart/components/CartItem';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  ArrowRight,
  X,
  Truck,
  Package,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface Props {
  shippingAddress: ShippingAddress;
  cart: ReturnType<typeof useCart>;
  onOpenAddressModal: () => void;
}

interface CheckoutOrderDTO {
  id: string;
  userId: string;
  shippingAddress: string;
  shippingMode: 'COMMON' | 'SEPARATE';
  status: string;
  totalAmount?: number;
  shippingFee?: number;
  paymentMethod?: string;
  summaryVersion: number;
  paymentLinkUrl?: string;
  allCustomQuoted: boolean;
  readyForConfirm: boolean;
}

export default function CartPage({ shippingAddress: a, cart, onOpenAddressModal }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'COD' | 'PAYOS'>('PAYOS');
  const [shippingMode, setShippingMode] = useState<'COMMON' | 'SEPARATE'>('COMMON');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createdCheckoutOrder, setCreatedCheckoutOrder] = useState<CheckoutOrderDTO | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<{ id: string; totalAmount: number; checkoutUrl?: string } | null>(null);
  const action = useAction();

  // Tự động tick chọn tất cả các món khi giỏ hàng tải xong
  useEffect(() => {
    if (cart.items.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(cart.items.map(i => i.clientLineId || i.id)));
    }
  }, [cart.items]);

  // Phân chia thành 2 nhóm
  const marketplaceItems = useMemo(
    () => cart.items.filter(item => !item.product.rulerDesign),
    [cart.items]
  );
  const customItems = useMemo(
    () => cart.items.filter(item => !!item.product.rulerDesign),
    [cart.items]
  );

  // Lọc các món đang được tick chọn
  const selectedMarketplaceItems = useMemo(
    () => marketplaceItems.filter(item => selectedIds.has(item.clientLineId || item.id)),
    [marketplaceItems, selectedIds]
  );
  const selectedCustomItems = useMemo(
    () => customItems.filter(item => selectedIds.has(item.clientLineId || item.id)),
    [customItems, selectedIds]
  );

  const selectedCount = selectedMarketplaceItems.length + selectedCustomItems.length;
  const isAllSelected = cart.items.length > 0 && selectedCount === cart.items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.items.map(i => i.clientLineId || i.id)));
    }
  };

  const toggleItemSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Kiểm tra multi-seller trong các món Marketplace được chọn
  const marketplaceSellers = useMemo(() => {
    const sellers = new Set<string>();
    for (const item of selectedMarketplaceItems) {
      // Nếu có thông tin người bán
      const sellerId = (item.product as any)?.sellerId || (item.product as any)?.seller?.id;
      if (sellerId) sellers.add(sellerId);
    }
    return sellers;
  }, [selectedMarketplaceItems]);

  const hasMultipleSellers = marketplaceSellers.size > 1;

  // Nếu nhiều seller khác nhau, ép chuyển sang Giao riêng
  useEffect(() => {
    if (hasMultipleSellers && shippingMode === 'COMMON') {
      setShippingMode('SEPARATE');
    }
  }, [hasMultipleSellers, shippingMode]);

  // Tính toán tiền tạm tính
  const marketplaceSubtotal = selectedMarketplaceItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const customEstimatedSubtotal = selectedCustomItems.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  const shippingFee = selectedCount > 0 ? 30000 : 0;
  // Tính đủ cả sản phẩm có sẵn lẫn thước custom đã có giá tính sẵn
  const totalSubtotal = marketplaceSubtotal + customEstimatedSubtotal;
  const totalAmount = totalSubtotal + shippingFee;

  const handleCheckout = () =>
    action.run(async () => {
      if (cart.loading || cart.saving || cart.error || !cart.items.length) {
        throw new Error('Giỏ hàng chưa sẵn sàng. Vui lòng chờ đồng bộ hoặc tải lại trang.');
      }
      if (selectedCount === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm từ giỏ hàng để đặt hàng.');
      }
      if (!isAuthenticated) {
        navigate('/login?redirect=/cart');
        return;
      }
      if (!a.id) {
        throw new Error('Vui lòng chọn địa chỉ nhận hàng.');
      }

      const fullAddress = `${a.recipientName} - ${a.phone} - ${a.addressLine}, ${a.province}`;

      // Gọi API tạo đơn thanh toán cha (CheckoutOrder)
      const res = await send<CheckoutOrderDTO>('/checkout-orders', {
        selectedLineIds: Array.from(selectedIds),
        shippingMode,
        shippingAddress: fullAddress,
        recipientName: a.recipientName,
        recipientPhone: a.phone,
        paymentMethod: method,
      });

      setCreatedCheckoutOrder(res);

      if (res.paymentLinkUrl && method === 'PAYOS') {
        setConfirmOrder({
          id: res.id,
          totalAmount: res.totalAmount || totalAmount,
          checkoutUrl: res.paymentLinkUrl,
        });
      }

      // Xóa các món đã chọn khỏi state local (backend đã xóa trong DB khi tạo checkout-order)
      cart.removeLocalItems(Array.from(selectedIds));
      setSelectedIds(new Set());
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giỏ hàng & Thanh toán thông minh"
        description="Kiểm tra danh sách sản phẩm, tuỳ biến giao hàng và tiến hành thanh toán an toàn qua VietQR PayOS."
        badge={cart.items.length > 0 ? `${cart.items.length} món` : undefined}
        icon={ShoppingBag}
      />
      <Notice error={action.error || cart.error} />

      {/* POPUP XÁC NHẬN THANH TOÁN PAYOS */}
      <Modal open={!!confirmOrder} onClose={() => setConfirmOrder(null)} label="Thanh toán đơn hàng qua PayOS">
        {confirmOrder && (
          <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-surface p-5 sm:p-6 shadow-2xl space-y-4 relative max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <button
              type="button"
              onClick={() => setConfirmOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
              aria-label="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shrink-0">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Thanh toán đơn hàng qua PayOS</h3>
                <p className="text-xs text-slate-400">Quét mã VietQR chuyển khoản tự động 24/7</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-inset p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-slate-400 text-xs">Mã đơn thanh toán:</span>
                <span className="font-mono font-semibold text-white break-all text-xs">#{confirmOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-medium">Tổng tiền thanh toán:</span>
                <span className="text-2xl font-black text-primary">{money(confirmOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={confirmOrder.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20 min-h-[44px]"
                onClick={() => setConfirmOrder(null)}
              >
                <CreditCard className="h-4 w-4" />
                Mở cổng thanh toán VietQR
              </a>
              <button
                className={`${secondary} py-3 px-4 text-sm min-h-[44px] flex items-center justify-center`}
                onClick={() => setConfirmOrder(null)}
              >
                Để thanh toán sau
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* KẾT QUẢ TẠO ĐƠN THÀNH CÔNG */}
      {createdCheckoutOrder ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-start gap-4">
            <CheckCircle2 className="h-7 w-7 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                {createdCheckoutOrder.status === 'PENDING_QUOTE'
                  ? 'Đã tạo yêu cầu và đơn hàng cha thành công!'
                  : 'Đã tạo đơn hàng thành công!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {createdCheckoutOrder.status === 'PENDING_QUOTE' ? (
                  <>
                    Mã đơn cha: <strong className="text-white">#{createdCheckoutOrder.id}</strong> ({createdCheckoutOrder.shippingMode === 'COMMON' ? 'Giao chung' : 'Giao riêng'}).
                    <br />
                    Các sản phẩm in 3D custom đang được gửi đến xưởng để kỹ thuật viên thẩm định và báo giá chi tiết.
                    Sau khi có báo giá, bạn sẽ nhận được thông báo để duyệt và tiến hành thanh toán.
                  </>
                ) : (
                  <>
                    Mã đơn cha: <strong className="text-white">#{createdCheckoutOrder.id}</strong>.
                    Đơn hàng đã được xác nhận và sẵn sàng xử lý xuất kho.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Mã đơn:</span>
                <span className="font-mono text-base font-bold text-white">#{createdCheckoutOrder.id}</span>
                <CopyButton text={createdCheckoutOrder.id} />
              </div>
              <Status value={createdCheckoutOrder.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-border/60 bg-surface-inset p-4 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Phương thức giao hàng:</span>
                <span className="font-semibold text-white">
                  {createdCheckoutOrder.shippingMode === 'COMMON' ? '📦 Giao chung 1 đợt' : '🚚 Giao riêng từng phần'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Phương thức thanh toán:</span>
                <span className="font-semibold text-white">
                  {createdCheckoutOrder.paymentMethod === 'PAYOS' ? 'PayOS (VietQR)' : 'COD (Khi nhận hàng)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Trạng thái thanh toán:</span>
                <span className="font-bold text-primary">
                  {createdCheckoutOrder.totalAmount ? money(createdCheckoutOrder.totalAmount) : 'Chờ xưởng báo giá'}
                </span>
              </div>
            </div>

            {createdCheckoutOrder.paymentLinkUrl && (
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-6 text-sm font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20"
                onClick={() => {
                  if (createdCheckoutOrder.paymentLinkUrl) {
                    window.open(createdCheckoutOrder.paymentLinkUrl, '_blank');
                  }
                }}
              >
                <CreditCard className="h-4 w-4" />
                Mở trang thanh toán PayOS
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link className={`${button} flex items-center gap-1.5`} to="/orders">
              <ShoppingBag className="h-4 w-4" /> Quản lý danh sách đơn hàng
            </Link>
            <Link className={`${secondary} flex items-center gap-1.5`} to="/quotations">
              <Layers className="h-4 w-4" /> Xem tiến độ báo giá custom
            </Link>
            <Link className={`${secondary} flex items-center gap-1.5`} to="/catalog">
              Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {cart.loading && <p role="status" className="text-slate-400 py-4">Đang tải giỏ hàng…</p>}
          {cart.saving && (
            <p role="status" aria-live="polite" className="text-xs text-emerald-400 py-1">
              Đang đồng bộ thay đổi giỏ hàng lên hệ thống…
            </p>
          )}

          {!cart.loading && !cart.error && !cart.items.length && (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-medium">Giỏ hàng của bạn đang trống.</p>
              <div className="flex justify-center gap-3">
                <Link className={button} to="/catalog">
                  Khám phá Cửa hàng
                </Link>
                <Link className={secondary} to="/custom">
                  Thiết kế thước 3D trong Studio
                </Link>
              </div>
            </div>
          )}

          {cart.items.length > 0 && (
            <div className="space-y-6">
              {/* THANH CHỌN TẤT CẢ VÀ THỐNG KÊ */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-raised">
                <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-[#39FF14] focus:ring-[#39FF14] bg-surface cursor-pointer accent-[#39FF14]"
                  />
                  <span>Chọn tất cả ({cart.items.length} món)</span>
                </label>

                <span className="text-xs text-slate-400">
                  Đã chọn: <strong className="text-primary font-mono">{selectedCount}</strong> món
                </span>
              </div>

              {/* 2-COLUMN LAYOUT: Desktop side-by-side, Mobile stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* NHÓM 1: SẢN PHẨM CÓ SẴN (MARKETPLACE) */}
              {marketplaceItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      Sản phẩm có sẵn (Marketplace - Giao ngay)
                    </h3>
                    <span className="text-xs text-slate-400">
                      {marketplaceItems.length} sản phẩm
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {marketplaceItems.map(item => {
                      const lineId = item.clientLineId || item.id;
                      return (
                        <CartItem
                          key={lineId}
                          item={item}
                          onUpdateQuantity={cart.updateQuantity}
                          selected={selectedIds.has(lineId)}
                          onToggleSelect={() => toggleItemSelect(lineId)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NHÓM 2: THIẾT KẾ IN 3D CUSTOM */}
              {customItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Thiết kế in 3D Cá nhân hóa (Custom - Thẩm định & In theo yêu cầu)
                    </h3>
                    <span className="text-xs text-slate-400">
                      {customItems.length} thiết kế
                    </span>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Các mẫu thước trong giỏ có thể mở lại trong <strong>3D Studio</strong> để chỉnh sửa màu sắc, vạch chia hoặc khắc chữ bất cứ lúc nào.
                      Thước thẳng có giá ước tính; các mẫu thước phức tạp sẽ được xưởng thẩm định và báo giá chính thức khi tạo đơn.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {customItems.map(item => {
                      const lineId = item.clientLineId || item.id;
                      return (
                        <CartItem
                          key={lineId}
                          item={item}
                          onUpdateQuantity={cart.updateQuantity}
                          selected={selectedIds.has(lineId)}
                          onToggleSelect={() => toggleItemSelect(lineId)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: CẤU HÌNH VẬN CHUYỂN & THANH TOÁN (5 cols sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <Card>
                <div className="space-y-4">
                  {/* CHỌN HÌNH THỨC GIAO HÀNG */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" /> Phương thức giao hàng
                    </h4>

                    {hasMultipleSellers && (
                      <div className="mb-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Các sản phẩm bán sẵn bạn chọn đến từ nhiều người bán khác nhau. Hệ thống tự động chuyển sang phương thức <strong>Giao riêng</strong>.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          shippingMode === 'COMMON'
                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                            : hasMultipleSellers
                            ? 'opacity-40 border-border cursor-not-allowed bg-surface-inset'
                            : 'border-border bg-surface-inset hover:border-border/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMode"
                          value="COMMON"
                          disabled={hasMultipleSellers}
                          checked={shippingMode === 'COMMON'}
                          onChange={() => setShippingMode('COMMON')}
                          className="mt-1 accent-primary"
                        />
                        <div className="text-xs space-y-1">
                          <span className="font-bold text-white block">📦 Giao chung 1 đợt (Mặc định)</span>
                          <p className="text-slate-400 leading-relaxed">
                            Gom cả món Marketplace và Custom vào 1 đơn cha. Không trừ kho vĩnh viễn. Chờ xưởng báo giá xong toàn bộ món custom, duyệt tổng tiền rồi giao chung một kiện.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          shippingMode === 'SEPARATE'
                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                            : 'border-border bg-surface-inset hover:border-border/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMode"
                          value="SEPARATE"
                          checked={shippingMode === 'SEPARATE'}
                          onChange={() => setShippingMode('SEPARATE')}
                          className="mt-1 accent-primary"
                        />
                        <div className="text-xs space-y-1">
                          <span className="font-bold text-white block">🚚 Giao riêng từng phần</span>
                          <p className="text-slate-400 leading-relaxed">
                            Sản phẩm Marketplace xuất kho và giao ngay; Thiết kế Custom tiếp tục chờ báo giá và sản xuất giao đợt 2.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ĐỊA CHỈ NHẬN HÀNG */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> Địa chỉ giao hàng
                      </h4>
                      <button className={secondary} disabled={action.busy} onClick={onOpenAddressModal}>
                        {a.id ? 'Thay đổi địa chỉ' : '+ Chọn địa chỉ'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-xs mt-1.5">
                      {a.id
                        ? `${a.recipientName} · ${a.phone} · ${a.addressLine}, ${a.province}`
                        : 'Chưa chọn địa chỉ nhận hàng. Vui lòng bấm "+ Chọn địa chỉ" để tiếp tục.'}
                    </p>
                  </div>

                  {/* PHƯƠNG THỨC THANH TOÁN */}
                  <div className="pt-3 border-t border-border">
                    <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" /> Hình thức thanh toán
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                        <input
                          type="radio"
                          name="payment-method"
                          disabled={action.busy}
                          className="accent-primary"
                          checked={method === 'PAYOS'}
                          onChange={() => setMethod('PAYOS')}
                        />
                        <span>Thanh toán trực tuyến VietQR (PayOS)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                        <input
                          type="radio"
                          name="payment-method"
                          disabled={action.busy}
                          className="accent-primary"
                          checked={method === 'COD'}
                          onChange={() => setMethod('COD')}
                        />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </label>
                    </div>
                  </div>

                  {/* BẢNG TÍNH TIỀN TẠM TÍNH */}
                  <div className="pt-3 border-t border-border space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Sản phẩm có sẵn ({selectedMarketplaceItems.length} món):</span>
                      <span className="font-mono">{money(marketplaceSubtotal)}</span>
                    </div>

                    {selectedCustomItems.length > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Thiết kế Custom ({selectedCustomItems.length} món):</span>
                        <span className="font-mono font-medium">
                          {customEstimatedSubtotal > 0
                            ? `~${money(customEstimatedSubtotal)} (ước tính)`
                            : 'Chờ xưởng báo giá'}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-300">
                      <span>Phí vận chuyển dự kiến:</span>
                      <span className="font-mono">{money(shippingFee)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/60 text-sm">
                      <div>
                        <span className="font-bold text-white block">Tổng thanh toán:</span>
                      </div>
                      <span className="text-2xl font-black text-primary font-mono">
                        {money(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* NÚT BẤM ĐẶT HÀNG */}
                  <button
                    className={`${button} w-full py-3.5 text-base font-bold shadow-lg shadow-primary/20 mt-2`}
                    disabled={action.busy || cart.loading || cart.saving || !a.id || selectedCount === 0}
                    onClick={() => void handleCheckout()}
                  >
                    {action.busy ? 'Đang tạo đơn hàng…' : `Xác nhận đặt hàng (${selectedCount} món)`}
                  </button>
                </div>
              </Card>
            </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
}
