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
        setErrorMessage(`Sß╗æ d╞░ v├¡ (${formatPrice(balance)}─æ) kh├┤ng ─æß╗º thanh to├ín (${formatPrice(total)}─æ). Vui l├▓ng nß║íp th├¬m tiß╗ün!`);
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
      if (!pay(total, `Thanh to├ín ─æ╞ín h├áng th╞░ß╗¢c in 3D (${items.length} m├│n)`)) {
        setErrorMessage('Sß╗æ d╞░ v├¡ kh├┤ng ─æß╗º. Vui l├▓ng kiß╗âm tra lß║íi ph╞░╞íng thß╗⌐c thanh to├ín.');
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
          <h2 className="text-2xl font-black text-white">─Éß║╖t H├áng Th├ánh C├┤ng!</h2>
          <p className="text-sm text-text-muted mt-1">M├ú ─æ╞ín h├áng: <span className="text-[#22c55e] font-mono font-bold">#ORD-9024</span></p>
        </div>
        <p className="text-sm text-slate-300 bg-surface-inset p-3 rounded-xl border border-border">
          ─É╞ín h├áng cß╗ºa bß║ín ─æ├ú ─æ╞░ß╗úc chuyß╗ân sang trß║íng th├íi <span className="text-[#22c55e] font-bold">─Éang Chuß║⌐n Bß╗ï File 3D</span> v├á ph├ón bß╗ò tß╗¢i m├íy in FDM.
        </p>
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs"
          >
            Theo D├╡i ─É╞ín H├áng
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="flex-1 py-3 rounded-xl bg-surface-raised text-slate-200 font-bold text-xs"
          >
            Tiß║┐p Tß╗Ñc Mua Th╞░ß╗¢c
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-2 text-white">
        <ShoppingBag className="w-6 h-6 text-[#22c55e]" />
        <h1 className="text-2xl font-black">Giß╗Å H├áng &amp; Thanh To├ín ─Éß║╖t In 3D</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Danh s├ích th╞░ß╗¢c ─æß║╖t mua ({items.length})</span>
              <span className="text-xs text-[#22c55e] normal-case font-semibold">Tß╗▒ ─æß╗Öng khß║»c laser MSSV</span>
            </h3>

            <div className="divide-y divide-[#272930]">
              {items.length === 0 && <p className="py-6 text-sm text-slate-300" role="status">Giß╗Å h├áng ─æang trß╗æng. H├úy chß╗ìn sß║ún phß║⌐m trong danh mß╗Ñc ─æß╗â tiß║┐p tß╗Ñc.</p>}
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-wrap items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-mono text-xs font-bold text-[#22c55e] shrink-0">
                    {item.product.material}
                  </div>
                  <div className="flex-1 min-w-32 text-sm space-y-1">
                    <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                    {item.engraving && <p className="text-emerald-400 font-medium">Khß║»c laser: "{item.engraving}"</p>}
                    <p className="text-text-muted">─É╞ín gi├í: {formatPrice(item.product.price)}─æ</p>
                  </div>
                  <div className="flex items-center border border-border rounded-lg bg-surface-inset">
                    <button aria-label={`Giß║úm sß╗æ l╞░ß╗úng ${item.product.name}`} onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-1 text-slate-400 hover:text-white">-</button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button aria-label={`T─âng sß╗æ l╞░ß╗úng ${item.product.name}`} onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-1 text-slate-400 hover:text-white">+</button>
                  </div>
                  <span className="font-black text-white text-sm w-20 text-right">
                    {formatPrice(item.product.price * item.quantity)}─æ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address Section */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#22c55e]" /> ─Éß╗ïa Chß╗ë Giao H├áng KTX / Nh├á Ri├¬ng
              </h3>
              <button onClick={onOpenAddressModal} className="text-xs text-[#22c55e] font-semibold hover:underline">
                Thay ─æß╗òi sß╗ò ─æß╗ïa chß╗ë
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-inset border border-border text-xs space-y-1">
              <p className="font-bold text-white">{shippingAddress.recipientName} ΓÇó {shippingAddress.phone}</p>
              <p className="text-text-muted">{shippingAddress.addressLine}</p>
            </div>
          </div>

          {/* Payment Method Picker */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#22c55e]" /> Ph╞░╞íng Thß╗⌐c Thanh To├ín
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
                  <p className="font-bold">V├¡ ─Éiß╗çn Tß╗¡ PrintHub</p>
                  <p className="text-sm text-text-muted">Sß╗æ d╞░ v├¡: <span className="text-[#22c55e] font-bold">{formatPrice(balance)}─æ</span></p>
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
                  <p className="font-bold">Thanh To├ín Khi Nhß║¡n H├áng (COD)</p>
                  <p className="text-sm text-text-muted">Thanh to├ín tiß╗ün mß║╖t khi ship tß╗¢i KTX</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">T├│m Tß║»t ─É╞ín H├áng</h3>

            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Tß║ím t├¡nh ({items.length} th╞░ß╗¢c):</span>
                <span className="text-white font-semibold">{formatPrice(subtotal)}─æ</span>
              </div>
              <div className="flex justify-between">
                <span>Giß║úm gi├í Voucher ({couponCode}):</span>
                <span className="text-[#22c55e] font-semibold">-{formatPrice(discount)}─æ</span>
              </div>
              <div className="flex justify-between">
                <span>Ph├¡ vß║¡n chuyß╗ân KTX Nß╗Öi Th├ánh:</span>
                <span className="text-white font-semibold">{formatPrice(shippingFee)}─æ</span>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center text-sm font-black text-white">
                <span>Tß╗òng tiß╗ün cß║ºn trß║ú:</span>
                <span className="text-[#22c55e] text-lg">{formatPrice(total)}─æ</span>
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
              X├íc Nhß║¡n ─Éß║╖t H├áng &amp; In 3D <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs text-text-muted bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>Cam kß║┐t bß║úo h├ánh g├úy 1-─æß╗òi-1 trong 1 hß╗ìc kß╗│.</span>
            </div>
          </div>
        </div>
      </div>

      <PasscodeModal
        isOpen={showPasscode}
        title="X├íc Thß╗▒c Thanh To├ín ─É╞ín H├áng"
        subtitle={`X├íc nhß║¡n trß╗½ ${formatPrice(total)}─æ tß╗½ V├¡ PrintHub`}
        onSuccess={processOrder}
        onClose={() => setShowPasscode(false)}
      />
    </div>
  );
}