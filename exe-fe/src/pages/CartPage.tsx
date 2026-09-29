import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShippingAddress } from '../features/address/data';
import type { useCart } from '../features/cart/hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { send } from '../services/api';
import { payOrder } from '../services/paymentService';
import type { OrderDTO } from '../services/orderService';
import { useAction } from '../hooks/useRemote';
import { Panel, Card, Notice, Status, button, secondary, money } from '../components/DataUI';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  shippingAddress: ShippingAddress;
  cart: ReturnType<typeof useCart>;
  onOpenAddressModal: () => void;
}

export default function CartPage({ shippingAddress: a, cart, onOpenAddressModal }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('COD');
  const [created, setCreated] = useState<OrderDTO[]>([]);
  const [confirmOrder, setConfirmOrder] = useState<OrderDTO | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const action = useAction();

  const checkout = () =>
    action.run(async () => {
      if (cart.items.some(item => item.product.rulerDesign)) {
        throw new Error('Thiết kế thước được lưu trên thiết bị này. Chưa thể thanh toán cấu hình Ruler Studio: cần tích hợp tiếp nhận artwork và xác nhận giá sản xuất.');
      }
      if (!isAuthenticated) {
        navigate('/login?redirect=/cart');
        return;
      }
      if (!a.id) throw new Error('Vui lòng chọn địa chỉ nhận hàng.');

      const orders = await send<OrderDTO[]>('/orders', {
        recipientName: a.recipientName,
        phone: a.phone,
        address: a.addressLine,
        province: a.province,
        items: cart.items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          color: i.colorOption,
          engravingText: i.engraving,
        })),
        paymentMethod: method,
      });

      setCreated(orders);

      if (method === 'PAYOS') {
        sessionStorage.setItem(
          'printhub_cart_backup',
          JSON.stringify(cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })))
        );
        if (orders[0]?.id) {
          sessionStorage.setItem('printhub_pending_payos_order', orders[0].id);
          // Tự động mở popup xác nhận thanh toán trước 100%
          setConfirmOrder(orders[0]);
        }
      } else {
        sessionStorage.removeItem('printhub_cart_backup');
        sessionStorage.removeItem('printhub_pending_payos_order');
      }

      cart.clearCart();
    });

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Panel title="Thanh toán đơn hàng">
      <Notice error={action.error || cart.error} />

      {/* POPUP XÁC NHẬN THANH TOÁN TRƯỚC 100% SỐ TIỀN QUA PAYOS */}
      {confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-surface p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setConfirmOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xác nhận thanh toán đơn hàng</h3>
                <p className="text-xs text-slate-400">Cổng thanh toán tự động VietQR PayOS</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-inset p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-slate-400 text-xs">Mã đơn hàng:</span>
                <span className="font-mono font-semibold text-white break-all text-xs">#{confirmOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-slate-400 text-xs">Hình thức:</span>
                <span className="font-semibold text-cyan-300 text-xs">Thanh toán trước 100%</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-medium">Số tiền cần thanh toán:</span>
                <span className="text-2xl font-black text-emerald-400">{money(confirmOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Bạn có xác nhận muốn <strong>thanh toán trước 100% số tiền ({money(confirmOrder.totalAmount)})</strong>{' '}
                để xưởng <strong>PrintHub 3D</strong> tiếp nhận và bắt đầu in mẫu 3D ngay không?
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20"
                disabled={action.busy}
                onClick={async () => {
                  const id = confirmOrder.id;
                  setConfirmOrder(null);
                  await action.run(() => payOrder(id));
                }}
              >
                <CreditCard className="h-4 w-4" />
                {action.busy ? 'Đang mở cổng PayOS...' : 'Xác nhận & Mở cổng PayOS'}
              </button>
              <button
                className={`${secondary} py-3 px-4 text-sm`}
                onClick={() => setConfirmOrder(null)}
              >
                Để thanh toán sau
              </button>
            </div>
          </div>
        </div>
      )}

      {created.length > 0 ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-white">Đã tạo {created.length} đơn hàng thành công!</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {method === 'PAYOS'
                  ? 'Vui lòng bấm nút thanh toán bên dưới để quét mã QR qua ứng dụng ngân hàng.'
                  : 'Đơn hàng đã được ghi nhận với hình thức thanh toán khi nhận hàng (COD).'}
              </p>
            </div>
          </div>

          {/* Danh sách các đơn hàng vừa tạo */}
          {created.map(o => (
            <div
              key={o.id}
              className="space-y-4 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Mã đơn:</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-white break-all">#{o.id}</span>
                  <button
                    onClick={() => copyOrderId(o.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-inset px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
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
                <Status value={o.status === 'PENDING' && method === 'PAYOS' ? 'PENDING' : o.status} />
              </div>

              {/* Thông tin tóm tắt 2 cột */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border/60 bg-surface-inset p-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Phương thức thanh toán:</span>
                  <span className="font-semibold text-white">
                    {method === 'PAYOS' ? 'PayOS (Quét mã VietQR)' : 'Thanh toán COD khi nhận hàng'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Số tiền cần thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-400">{money(o.totalAmount)}</span>
                </div>
              </div>

              {/* Nút bấm thanh toán ở DƯỚI CÙNG (không bị vỡ UI) */}
              {method === 'PAYOS' && (
                <div className="space-y-3 pt-2">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-300/90 leading-relaxed">
                    💡 Bấm nút bên dưới để mở giao diện quét mã QR PayOS và hoàn tất thanh toán trước 100% cho đơn hàng này.
                  </div>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-6 text-base font-bold text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    disabled={action.busy}
                    onClick={() => setConfirmOrder(o)}
                  >
                    <CreditCard className="h-5 w-5" />
                    {action.busy ? 'Đang xử lý...' : `Thanh toán PayOS (${money(o.totalAmount)})`}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Điều hướng tiếp */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link className={`${button} flex items-center gap-1.5`} to="/orders">
              <ShoppingBag className="h-4 w-4" /> Theo dõi tiến độ đơn hàng
            </Link>
            <Link className={`${secondary} flex items-center gap-1.5`} to="/catalog">
              Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {cart.loading && <p>Đang tải giỏ hàng…</p>}
          {!cart.loading && !cart.items.length && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
              <p className="text-slate-400">Giỏ hàng của bạn đang trống.</p>
              <Link className={button} to="/catalog">
                Khám phá Bộ sưu tập thước 3D
              </Link>
            </div>
          )}

          {cart.items.map(i => (
            <Card key={i.id}>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="font-semibold text-white">{i.product.name}</h2>
                  {i.product.rulerDesign && <div className="text-xs text-emerald-300"><p>{i.product.description}</p><button className="underline py-2" onClick={() => navigate('/custom', { state: { rulerDesign: i.product.rulerDesign } })}>Chỉnh sửa bản sao thiết kế</button></div>}
                  <p className="text-xs text-slate-400 mt-1">
                    {money(i.product.price)} × {i.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={secondary}
                    disabled={cart.saving}
                    onClick={() => cart.updateQuantity(i.id, -1)}
                  >
                    −
                  </button>
                  <span className="font-mono font-bold">{i.quantity}</span>
                  <button
                    className={secondary}
                    disabled={cart.saving}
                    onClick={() => cart.updateQuantity(i.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {!!cart.items.length && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Địa chỉ giao hàng
                </h2>
                <button className={secondary} onClick={onOpenAddressModal}>
                  {a.id ? 'Thay đổi địa chỉ' : '+ Chọn địa chỉ'}
                </button>
              </div>

              <p className="text-slate-300 text-sm">
                {a.id
                  ? `${a.recipientName} · ${a.phone} · ${a.addressLine}, ${a.province}`
                  : 'Chưa chọn địa chỉ nhận hàng. Vui lòng bấm "+ Chọn địa chỉ" để tiếp tục.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-3 border-t border-border">
                {['COD', 'PAYOS'].map(v => (
                  <label key={v} className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-200">
                    <input
                      type="radio"
                      className="accent-primary"
                      checked={method === v}
                      onChange={() => setMethod(v)}
                    />
                    {v === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua PayOS (Quét mã VietQR 100%)'}
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/50 text-sm">
                <span className="text-slate-300">Tổng tiền thanh toán:</span>
                <span className="text-2xl font-black text-emerald-400">{money(cart.total)}</span>
              </div>

              <p className="text-xs text-slate-400">
                Đơn hàng được thiết kế, sản xuất và giao trực tiếp từ xưởng in PrintHub 3D.
              </p>

              <button
                className={`${button} w-full py-3.5 text-base font-bold shadow-lg shadow-primary/20`}
                disabled={action.busy || cart.loading || cart.saving || !a.id || !!cart.error}
                onClick={() => void checkout()}
              >
                {action.busy ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
              </button>
            </Card>
          )}
        </>
      )}
    </Panel>
  );
}
