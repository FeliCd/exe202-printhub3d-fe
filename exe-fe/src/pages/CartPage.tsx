import type { ShippingAddress } from '../features/address/data';
import { useState } from 'react';
import type { useCart } from '../features/cart/hooks/useCart';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../utils/format';
import { ShoppingBag, ShieldCheck, MapPin, Wallet, CreditCard, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PasscodeModal from '../components/PasscodeModal';

interface CartPageProps {
  shippingAddress: ShippingAddress;
  cart: ReturnType<typeof useCart>;
  onOpenAddressModal: () => void;
}

export default function CartPage({ shippingAddress, cart, onOpenAddressModal }: CartPageProps) {
  const { items, subtotal, discount, shippingFee, total, updateQuantity, couponCode } = cart;
  const { balance, pay } = useWallet();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD' | 'BANKING' | 'VNPAY'>('WALLET');
  const [showPasscode, setShowPasscode] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckoutSubmit = () => {
    if (!items.length) return;
    setErrorMessage('');
    if (paymentMethod === 'WALLET') {
      if (balance < total) {
        setErrorMessage(`Số dư ví (${formatPrice(balance)}đ) không đủ thanh toán (${formatPrice(total)}đ). Vui lòng nạp thêm tiền!`);
        return;
      }
      setShowPasscode(true);
    } else {
      processOrder();
    }
  };

  const processOrder = () => {
    if (!items.length || orderSuccess) return;
    if (paymentMethod === 'WALLET') {
      if (!pay(total, `Thanh toán đơn hàng thước in 3D (${items.length} món)`)) {
        setErrorMessage('Số dư ví không đủ. Vui lòng kiểm tra lại phương thức thanh toán.');
        return;
      }
    }
    setOrderSuccess(true);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-primary/20 text-[#22c55e] flex items-center justify-center mx-auto border border-[#22c55e]/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Đặt Hàng Thành Công!</h2>
          <p className="text-sm text-text-muted mt-1">Mã đơn hàng: <span className="text-[#22c55e] font-mono font-bold">#ORD-9024</span></p>
        </div>
        <p className="text-sm text-slate-300 bg-surface-inset p-3 rounded-xl border border-border">
          Đơn hàng của bạn đã được chuyển sang trạng thái <span className="text-[#22c55e] font-bold">Đang Chuẩn Bị File 3D</span> và phân bổ tới máy in FDM.
        </p>
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs"
          >
            Theo Dõi Đơn Hàng
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="flex-1 py-3 rounded-xl bg-surface-raised text-slate-200 font-bold text-xs"
          >
            Tiếp Tục Mua Thước
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-2 text-white">
        <ShoppingBag className="w-6 h-6 text-[#22c55e]" />
        <h1 className="text-2xl font-black">Giỏ Hàng &amp; Thanh Toán Đặt In 3D</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Danh sách thước đặt mua ({items.length})</span>
              <span className="text-xs text-[#22c55e] normal-case font-semibold">Tự động khắc laser MSSV</span>
            </h3>

            <div className="divide-y divide-[#272930]">
              {items.length === 0 && <p className="py-6 text-sm text-slate-300" role="status">Giỏ hàng đang trống. Hãy chọn sản phẩm trong danh mục để tiếp tục.</p>}
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-wrap items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-mono text-xs font-bold text-[#22c55e] shrink-0">
                    {item.product.material}
                  </div>
                  <div className="flex-1 min-w-32 text-sm space-y-1">
                    <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                    {item.engraving && <p className="text-emerald-400 font-medium">Khắc laser: "{item.engraving}"</p>}
                    <p className="text-text-muted">Đơn giá: {formatPrice(item.product.price)}đ</p>
                  </div>
                  <div className="flex items-center border border-border rounded-lg bg-surface-inset">
                    <button aria-label={`Giảm số lượng ${item.product.name}`} onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-1 text-slate-400 hover:text-white">-</button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button aria-label={`Tăng số lượng ${item.product.name}`} onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-1 text-slate-400 hover:text-white">+</button>
                  </div>
                  <span className="font-black text-white text-sm w-20 text-right">
                    {formatPrice(item.product.price * item.quantity)}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address Section */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#22c55e]" /> Địa Chỉ Giao Hàng KTX / Nhà Riêng
              </h3>
              <button onClick={onOpenAddressModal} className="text-xs text-[#22c55e] font-semibold hover:underline">
                Thay đổi sổ địa chỉ
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-inset border border-border text-xs space-y-1">
              <p className="font-bold text-white">{shippingAddress.recipientName} • {shippingAddress.phone}</p>
              <p className="text-text-muted">{shippingAddress.addressLine}</p>
            </div>
          </div>

          {/* Payment Method Picker */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#22c55e]" /> Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  paymentMethod === 'WALLET'
                    ? 'border-[#22c55e] bg-primary/10 text-white'
                    : 'border-border bg-surface-inset text-slate-300 hover:border-slate-500'
                }`}
              >
                <Wallet className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ví Điện Tử PrintHub</p>
                  <p className="text-sm text-text-muted">Số dư ví: <span className="text-[#22c55e] font-bold">{formatPrice(balance)}đ</span></p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#22c55e] bg-primary/10 text-white'
                    : 'border-border bg-surface-inset text-slate-300 hover:border-slate-500'
                }`}
              >
                <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Thanh Toán Khi Nhận Hàng (COD)</p>
                  <p className="text-sm text-text-muted">Thanh toán tiền mặt khi ship tới KTX</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tóm Tắt Đơn Hàng</h3>

            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Tạm tính ({items.length} thước):</span>
                <span className="text-white font-semibold">{formatPrice(subtotal)}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá Voucher ({couponCode}):</span>
                <span className="text-[#22c55e] font-semibold">-{formatPrice(discount)}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển KTX Nội Thành:</span>
                <span className="text-white font-semibold">{formatPrice(shippingFee)}đ</span>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center text-sm font-black text-white">
                <span>Tổng tiền cần trả:</span>
                <span className="text-[#22c55e] text-lg">{formatPrice(total)}đ</span>
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleCheckoutSubmit}
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              Xác Nhận Đặt Hàng &amp; In 3D <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs text-text-muted bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>Cam kết bảo hành gãy 1-đổi-1 trong 1 học kỳ.</span>
            </div>
          </div>
        </div>
      </div>

      <PasscodeModal
        isOpen={showPasscode}
        title="Xác Thực Thanh Toán Đơn Hàng"
        subtitle={`Xác nhận trừ ${formatPrice(total)}đ từ Ví PrintHub`}
        onSuccess={processOrder}
        onClose={() => setShowPasscode(false)}
      />
    </div>
  );
}