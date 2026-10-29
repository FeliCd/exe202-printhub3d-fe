import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShippingAddress } from '../features/address/data';
import type { useCart } from '../features/cart/hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { send } from '../services/api';
import { useAction } from '../hooks/useRemote';
import { PageHeader, Notice, Status, CopyButton } from '../components/DataUI';
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
  Package,
  Layers,
  Info,
  Send,
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
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'CUSTOM'>('MARKETPLACE');
  const [method, setMethod] = useState<'COD' | 'PAYOS'>('PAYOS');
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

  // Phân chia thành 2 nhóm độc lập
  const marketplaceItems = useMemo(
    () => cart.items.filter(item => !item.product.rulerDesign),
    [cart.items]
  );
  const customItems = useMemo(
    () => cart.items.filter(item => !!item.product.rulerDesign),
    [cart.items]
  );

  // Tự động chuyển tab nếu nhóm hiện tại trống nhưng nhóm kia có hàng
  useEffect(() => {
    if (marketplaceItems.length === 0 && customItems.length > 0) {
      setActiveTab('CUSTOM');
    } else if (customItems.length === 0 && marketplaceItems.length > 0) {
      setActiveTab('MARKETPLACE');
    }
  }, [marketplaceItems.length, customItems.length]);

  // Lọc các món đang được tick chọn theo từng nhóm
  const selectedMarketplaceItems = useMemo(
    () => marketplaceItems.filter(item => selectedIds.has(item.clientLineId || item.id)),
    [marketplaceItems, selectedIds]
  );
  const selectedCustomItems = useMemo(
    () => customItems.filter(item => selectedIds.has(item.clientLineId || item.id)),
    [customItems, selectedIds]
  );

  const currentTabItems = activeTab === 'MARKETPLACE' ? marketplaceItems : customItems;
  const selectedTabItems = activeTab === 'MARKETPLACE' ? selectedMarketplaceItems : selectedCustomItems;
  const isAllTabSelected = currentTabItems.length > 0 && selectedTabItems.length === currentTabItems.length;

  const toggleSelectAllTab = () => {
    const next = new Set(selectedIds);
    if (isAllTabSelected) {
      currentTabItems.forEach(i => next.delete(i.clientLineId || i.id));
    } else {
      currentTabItems.forEach(i => next.add(i.clientLineId || i.id));
    }
    setSelectedIds(next);
  };

  const toggleItemSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Tiền thanh toán Marketplace
  const marketplaceSubtotal = selectedMarketplaceItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const marketplaceShippingFee = selectedMarketplaceItems.length > 0 ? 30000 : 0;
  const marketplaceTotalAmount = marketplaceSubtotal + marketplaceShippingFee;

  // Dự toán ước tính Custom (không thu tiền trực tiếp tại giỏ)
  const customEstimatedSubtotal = selectedCustomItems.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  // Đặt hàng Marketplace
  const handleMarketplaceCheckout = () =>
    action.run(async () => {
      if (cart.loading || cart.saving || cart.error || !cart.items.length) {
        throw new Error('Giỏ hàng chưa sẵn sàng. Vui lòng chờ đồng bộ hoặc tải lại trang.');
      }
      if (selectedMarketplaceItems.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm có sẵn để đặt hàng.');
      }
      if (!isAuthenticated) {
        navigate('/login?redirect=/cart');
        return;
      }
      if (!a.id) {
        throw new Error('Vui lòng chọn địa chỉ nhận hàng.');
      }

      const fullAddress = `${a.recipientName} - ${a.phone} - ${a.addressLine}, ${a.province}`;
      const marketplaceIds = selectedMarketplaceItems.map(i => i.clientLineId || i.id);

      // Gọi API tạo đơn Marketplace thuần túy (không trộn custom)
      const res = await send<CheckoutOrderDTO>('/checkout-orders', {
        selectedLineIds: marketplaceIds,
        shippingMode: 'COMMON',
        shippingAddress: fullAddress,
        recipientName: a.recipientName,
        recipientPhone: a.phone,
        paymentMethod: method,
      });

      setCreatedCheckoutOrder(res);

      if (res.paymentLinkUrl && method === 'PAYOS') {
        setConfirmOrder({
          id: res.id,
          totalAmount: res.totalAmount || marketplaceTotalAmount,
          checkoutUrl: res.paymentLinkUrl,
        });
      }

      // Xóa các món marketplace đã đặt khỏi giỏ
      cart.removeLocalItems(marketplaceIds);
      setSelectedIds(prev => {
        const next = new Set(prev);
        marketplaceIds.forEach(id => next.delete(id));
        return next;
      });
    });

  // Gửi yêu cầu báo giá Custom (REQUESTED, không thanh toán ngay)
  const handleCustomQuoteSubmit = () =>
    action.run(async () => {
      if (selectedCustomItems.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 thiết kế in 3D để gửi yêu cầu báo giá.');
      }
      if (!isAuthenticated) {
        navigate('/login?redirect=/cart');
        return;
      }
      if (!a.id) {
        throw new Error('Vui lòng chọn địa chỉ giao hàng trước khi gửi yêu cầu báo giá.');
      }

      const fullAddress = `${a.recipientName} - ${a.phone} - ${a.addressLine}, ${a.province}`;
      const customItemIds = selectedCustomItems.map(i => i.clientLineId || i.id);

      for (const item of selectedCustomItems) {
        await send('/custom-orders', {
          quantity: item.quantity,
          shippingAddress: fullAddress,
          requirements: item.product.rulerDesign ? JSON.stringify(item.product.rulerDesign) : item.product.name,
          rulerModel: item.product.name,
          attachmentUrl: item.product.imageUrl || item.product.thumbnail,
          paymentMethod: 'PAYOS',
        });
      }

      // Xóa các món custom đã gửi khỏi giỏ
      cart.removeLocalItems(customItemIds);
      setSelectedIds(prev => {
        const next = new Set(prev);
        customItemIds.forEach(id => next.delete(id));
        return next;
      });

      // Điều hướng về trang báo giá theo chuẩn Flow 01
      navigate('/quotations?created=true');
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
          <div className="w-full max-w-lg rounded-2xl border border-[#39FF14]/40 bg-[#0a0c12] p-5 sm:p-6 shadow-[0_0_35px_rgba(57,255,20,0.15)] space-y-4 relative max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <button
              type="button"
              onClick={() => setConfirmOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
              aria-label="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] shrink-0">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Thanh toán đơn hàng qua PayOS</h3>
                <p className="text-xs text-slate-400">Quét mã VietQR chuyển khoản tự động 24/7</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#040508] p-4 space-y-3 text-sm font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-slate-400 text-xs">Mã đơn thanh toán:</span>
                <span className="font-semibold text-white break-all text-xs">#{confirmOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-medium">Tổng tiền thanh toán:</span>
                <span className="text-2xl font-black text-[#39FF14]">{money(confirmOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={confirmOrder.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 whitespace-nowrap shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] py-3 px-4 text-sm font-black text-[#040508] transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] min-h-[44px]"
                onClick={() => setConfirmOrder(null)}
              >
                <CreditCard className="h-4 w-4" />
                Mở cổng thanh toán VietQR
              </a>
              <button
                className="whitespace-nowrap shrink-0 px-4 py-3 rounded-xl bg-[#11141e] text-slate-300 hover:text-white border border-white/10 text-sm font-semibold min-h-[44px] flex items-center justify-center transition"
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
          <div className="rounded-2xl border border-[#39FF14]/40 bg-[#0a0c12] p-5 flex items-start gap-4 shadow-[0_0_25px_rgba(57,255,20,0.1)]">
            <CheckCircle2 className="h-7 w-7 text-[#39FF14] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                {createdCheckoutOrder.status === 'PENDING_QUOTE'
                  ? 'Đã tạo yêu cầu và đơn hàng cha thành công!'
                  : 'Đã tạo đơn hàng thành công!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {createdCheckoutOrder.status === 'PENDING_QUOTE' ? (
                  <>
                    Mã đơn cha: <strong className="text-white font-mono">#{createdCheckoutOrder.id}</strong>.
                    <br />
                    Các sản phẩm in 3D custom đang được gửi đến xưởng để kỹ thuật viên thẩm định và báo giá chi tiết.
                    Sau khi có báo giá, bạn sẽ nhận được thông báo để duyệt và tiến hành thanh toán.
                  </>
                ) : (
                  <>
                    Mã đơn cha: <strong className="text-white font-mono">#{createdCheckoutOrder.id}</strong>.
                    Đơn hàng đã được xác nhận và sẵn sàng xử lý xuất kho.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a0c12] p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Mã đơn:</span>
                <span className="font-mono text-base font-bold text-white">#{createdCheckoutOrder.id}</span>
                <CopyButton text={createdCheckoutOrder.id} />
              </div>
              <Status value={createdCheckoutOrder.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-white/10 bg-[#040508] p-4 text-xs sm:text-sm font-mono">
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-sans">Hình thức vận chuyển:</span>
                <span className="font-semibold text-white">
                  🚚 Tiêu chuẩn PrintHub (Giao tận nơi)
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-sans">Phương thức thanh toán:</span>
                <span className="font-semibold text-white">
                  {createdCheckoutOrder.paymentMethod === 'PAYOS' ? 'PayOS (VietQR)' : 'COD (Khi nhận hàng)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-sans">Trạng thái thanh toán:</span>
                <span className="font-bold text-[#39FF14]">
                  {createdCheckoutOrder.totalAmount ? money(createdCheckoutOrder.totalAmount) : 'Chờ xưởng báo giá'}
                </span>
              </div>
            </div>

            {createdCheckoutOrder.paymentLinkUrl && (
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] py-3.5 px-6 text-sm font-black text-[#040508] transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] whitespace-nowrap shrink-0"
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
            <Link className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition" to="/orders">
              <ShoppingBag className="h-4 w-4" /> Quản lý danh sách đơn hàng
            </Link>
            <Link className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#11141e] hover:bg-[#1a2030] text-slate-200 border border-white/10 hover:border-[#39FF14]/40 font-semibold text-xs flex items-center gap-1.5 transition" to="/quotations">
              <Layers className="h-4 w-4" /> Xem tiến độ báo giá custom
            </Link>
            <Link className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#11141e] hover:bg-[#1a2030] text-slate-200 border border-white/10 hover:border-[#39FF14]/40 font-semibold text-xs flex items-center gap-1.5 transition" to="/catalog">
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
            <div className="rounded-2xl border border-white/10 bg-[#0a0c12] p-12 text-center space-y-4 shadow-xl">
              <ShoppingBag className="w-12 h-12 text-[#39FF14]/60 mx-auto" />
              <p className="text-slate-200 font-medium">Giỏ hàng của bạn đang trống.</p>
              <div className="flex justify-center gap-3 pt-2">
                <Link className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold text-xs shadow-[0_0_15px_rgba(57,255,20,0.3)] transition" to="/catalog">
                  Khám phá Cửa hàng
                </Link>
                <Link className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl bg-[#11141e] hover:bg-[#1a2030] text-slate-200 border border-white/10 hover:border-[#39FF14]/40 font-semibold text-xs transition" to="/custom">
                  Thiết kế thước 3D trong Studio
                </Link>
              </div>
            </div>
          )}

          {cart.items.length > 0 && (
            <div className="space-y-6">
              {/* TAB SELECTOR: MARKETPLACE VS CUSTOM */}
              <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl border border-white/10 bg-[#0a0c12]">
                <button
                  type="button"
                  onClick={() => setActiveTab('MARKETPLACE')}
                  className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'MARKETPLACE'
                      ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_20px_rgba(57,255,20,0.3)] ring-2 ring-[#39FF14]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Sản phẩm có sẵn (Marketplace)</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    activeTab === 'MARKETPLACE' ? 'bg-black/20 text-[#040508]' : 'bg-[#040508] text-slate-300 border border-white/10'
                  }`}>
                    {marketplaceItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CUSTOM')}
                  className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'CUSTOM'
                      ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_20px_rgba(57,255,20,0.3)] ring-2 ring-[#39FF14]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Thiết kế in 3D (Custom - Báo giá)</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    activeTab === 'CUSTOM' ? 'bg-black/20 text-[#040508]' : 'bg-[#040508] text-slate-300 border border-white/10'
                  }`}>
                    {customItems.length}
                  </span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: SẢN PHẨM CÓ SẴN (MARKETPLACE) */}
              {/* ========================================================================= */}
              {activeTab === 'MARKETPLACE' && (
                <div className="space-y-6">
                  {marketplaceItems.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0a0c12] p-10 text-center space-y-4">
                      <Package className="w-12 h-12 text-[#39FF14]/50 mx-auto" />
                      <p className="text-slate-300 font-medium text-sm">
                        Không có sản phẩm có sẵn nào trong giỏ hàng.
                      </p>
                      <Link
                        to="/catalog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39FF14] text-[#040508] font-bold text-xs shadow-lg shadow-[#39FF14]/20 hover:brightness-110 transition whitespace-nowrap shrink-0"
                      >
                        Khám phá Cửa hàng Marketplace <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* THANH CHỌN TẤT CẢ VÀ THỐNG KÊ */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#0a0c12] shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-white">
                          <input
                            type="checkbox"
                            checked={isAllTabSelected}
                            onChange={toggleSelectAllTab}
                            className="w-4 h-4 rounded border-white/20 text-[#39FF14] focus:ring-[#39FF14] bg-[#040508] cursor-pointer accent-[#39FF14]"
                          />
                          <span>Chọn tất cả sản phẩm có sẵn ({marketplaceItems.length} món)</span>
                        </label>

                        <span className="text-xs text-slate-400">
                          Đã chọn: <strong className="text-[#39FF14] font-mono text-sm">{selectedMarketplaceItems.length}</strong> món
                        </span>
                      </div>

                      {/* 2-COLUMN LAYOUT: MARKETPLACE */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (7 cols) */}
                        <div className="lg:col-span-7 space-y-3">
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

                        {/* CỘT PHẢI: THANH TOÁN MARKETPLACE (5 cols) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-20">
                          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                            {/* ĐỊA CHỈ NHẬN HÀNG */}
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-[#39FF14]" /> Địa chỉ giao hàng
                                </h4>
                                <button className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-[#11141e] hover:bg-[#1a2030] text-slate-200 border border-white/10 hover:border-[#39FF14]/40 font-semibold text-xs transition cursor-pointer" disabled={action.busy} onClick={onOpenAddressModal}>
                                  {a.id ? 'Thay đổi' : '+ Chọn địa chỉ'}
                                </button>
                              </div>
                              <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                                {a.id
                                  ? `${a.recipientName} · ${a.phone} · ${a.addressLine}, ${a.province}`
                                  : 'Chưa chọn địa chỉ nhận hàng. Vui lòng bấm "+ Chọn địa chỉ" để tiếp tục.'}
                              </p>
                            </div>

                            {/* PHƯƠNG THỨC THANH TOÁN */}
                            <div className="pt-3 border-t border-white/10">
                              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#39FF14]" /> Hình thức thanh toán
                              </h4>
                              <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                                  <input
                                    type="radio"
                                    name="payment-method"
                                    disabled={action.busy}
                                    className="accent-[#39FF14]"
                                    checked={method === 'PAYOS'}
                                    onChange={() => setMethod('PAYOS')}
                                  />
                                  <span>Thanh toán VietQR (PayOS)</span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                                  <input
                                    type="radio"
                                    name="payment-method"
                                    disabled={action.busy}
                                    className="accent-[#39FF14]"
                                    checked={method === 'COD'}
                                    onChange={() => setMethod('COD')}
                                  />
                                  <span>Khi nhận hàng (COD)</span>
                                </label>
                              </div>
                            </div>

                            {/* BẢNG TÍNH TIỀN MARKETPLACE */}
                            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                              <div className="flex justify-between text-slate-300">
                                <span>Tiền hàng ({selectedMarketplaceItems.length} món):</span>
                                <span className="font-mono text-white">{money(marketplaceSubtotal)}</span>
                              </div>

                              <div className="flex justify-between text-slate-300">
                                <span>Phí vận chuyển:</span>
                                <span className="font-mono text-white">{money(marketplaceShippingFee)}</span>
                              </div>

                              <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-sm">
                                <span className="font-bold text-white block">Tổng thanh toán:</span>
                                <span className="text-2xl font-black text-[#39FF14] font-mono">
                                  {money(marketplaceTotalAmount)}
                                </span>
                              </div>
                            </div>

                            {/* NÚT BẤM ĐẶT HÀNG */}
                            <button
                              className="whitespace-nowrap shrink-0 w-full py-3.5 text-base font-black bg-[#39FF14] hover:bg-[#32e012] text-[#040508] rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.35)] transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                              disabled={action.busy || cart.loading || cart.saving || !a.id || selectedMarketplaceItems.length === 0}
                              onClick={() => void handleMarketplaceCheckout()}
                            >
                              {action.busy ? 'Đang tạo đơn hàng…' : `Xác nhận đặt hàng (${selectedMarketplaceItems.length} món)`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: THIẾT KẾ IN 3D CUSTOM (BÁO GIÁ) */}
              {/* ========================================================================= */}
              {activeTab === 'CUSTOM' && (
                <div className="space-y-6">
                  {customItems.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0a0c12] p-10 text-center space-y-4">
                      <Layers className="w-12 h-12 text-[#39FF14]/50 mx-auto" />
                      <p className="text-slate-300 font-medium text-sm">
                        Chưa có thiết kế in 3D cá nhân hóa nào trong giỏ hàng.
                      </p>
                      <Link
                        to="/custom"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39FF14] text-[#040508] font-bold text-xs shadow-lg shadow-[#39FF14]/20 hover:brightness-110 transition whitespace-nowrap shrink-0"
                      >
                        Mở công cụ thiết kế Thước 3D <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* INFORMATIONAL NOTICE BANNER */}
                      <div className="rounded-2xl border border-[#39FF14]/30 bg-[#39FF14]/5 p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3 shadow-md">
                        <Info className="w-5 h-5 text-[#39FF14] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white text-sm block mb-1">Quy trình thẩm định và báo giá in 3D:</strong>
                          Tất cả thiết kế trong tab này sẽ được gửi đến kỹ sư xưởng PrintHub 3D để kiểm tra tệp 3D (slicing, độ dày thành, khối lượng nhựa) và phát hành báo giá chính thức trong vòng 24 giờ.
                          <span className="text-[#39FF14] font-semibold block mt-1">
                            ✓ Bạn chưa phải thanh toán bất kỳ khoản tiền nào ở bước gửi yêu cầu này.
                          </span>
                        </div>
                      </div>

                      {/* THANH CHỌN TẤT CẢ VÀ THỐNG KÊ */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#0a0c12] shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-white">
                          <input
                            type="checkbox"
                            checked={isAllTabSelected}
                            onChange={toggleSelectAllTab}
                            className="w-4 h-4 rounded border-white/20 text-[#39FF14] focus:ring-[#39FF14] bg-[#040508] cursor-pointer accent-[#39FF14]"
                          />
                          <span>Chọn tất cả thiết kế custom ({customItems.length} mẫu)</span>
                        </label>

                        <span className="text-xs text-slate-400">
                          Đã chọn: <strong className="text-[#39FF14] font-mono text-sm">{selectedCustomItems.length}</strong> thiết kế
                        </span>
                      </div>

                      {/* 2-COLUMN LAYOUT: CUSTOM REQUEST */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI: DANH SÁCH THIẾT KẾ CUSTOM (7 cols) */}
                        <div className="lg:col-span-7 space-y-3">
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

                        {/* CỘT PHẢI: GỬI YÊU CẦU BÁO GIÁ (5 cols) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-20">
                          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                              <div className="w-8 h-8 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                                <Send className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Gửi yêu cầu báo giá đến xưởng
                                </h4>
                                <p className="text-[11px] text-slate-400">Kỹ thuật viên sẽ phản hồi trong 24h</p>
                              </div>
                            </div>

                            {/* ĐỊA CHỈ GIAO HÀNG (ĐỂ TÍNH PHÍ VẬN CHUYỂN KHI BÁO GIÁ) */}
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-[#39FF14]" /> Địa chỉ giao nhận dự kiến
                                </h4>
                                <button className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-[#11141e] hover:bg-[#1a2030] text-slate-200 border border-white/10 hover:border-[#39FF14]/40 font-semibold text-xs transition" disabled={action.busy} onClick={onOpenAddressModal}>
                                  {a.id ? 'Thay đổi' : '+ Chọn địa chỉ'}
                                </button>
                              </div>
                              <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                                {a.id
                                  ? `${a.recipientName} · ${a.phone} · ${a.addressLine}, ${a.province}`
                                  : 'Chưa chọn địa chỉ. Vui lòng bấm "+ Chọn địa chỉ" để xưởng tính cước giao hàng.'}
                              </p>
                            </div>

                            {/* BẢNG TÍNH DỰ TOÁN SƠ BỘ */}
                            <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs">
                              <div className="flex justify-between text-slate-300">
                                <span>Số lượng thiết kế:</span>
                                <span className="font-mono text-white font-bold">{selectedCustomItems.length} mẫu</span>
                              </div>

                              <div className="flex justify-between text-slate-300">
                                <span>Dự toán sơ bộ (ước tính):</span>
                                <span className="font-mono text-[#39FF14] font-medium">
                                  {customEstimatedSubtotal > 0 ? `~${money(customEstimatedSubtotal)}` : 'Chờ xưởng báo giá'}
                                </span>
                              </div>

                              <div className="p-3 rounded-xl border border-white/10 bg-[#040508] text-[11px] text-slate-400 space-y-1">
                                <p className="text-slate-300 font-semibold">ℹ️ Lưu ý về báo giá:</p>
                                <p>Đơn giá chính thức sẽ được kỹ thuật viên báo sau khi kiểm tra độ mịn lớp in (layer height 0.16mm) và kết cấu sợi in PLA Pro+.</p>
                              </div>
                            </div>

                            {/* NÚT GỬI YÊU CẦU BÁO GIÁ */}
                            <button
                              className="whitespace-nowrap shrink-0 w-full py-3.5 text-sm font-black bg-[#39FF14] hover:bg-[#32e012] text-[#040508] rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.35)] transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
                              disabled={action.busy || !a.id || selectedCustomItems.length === 0}
                              onClick={() => void handleCustomQuoteSubmit()}
                            >
                              <Send className="w-4 h-4" />
                              <span>
                                {action.busy
                                  ? 'Đang gửi yêu cầu báo giá...'
                                  : `Gửi Yêu Cầu Báo Giá (${selectedCustomItems.length} thiết kế)`}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
