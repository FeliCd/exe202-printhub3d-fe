import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShippingAddress } from '../features/address/data';
import type { useCart } from '../features/cart/hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { send } from '../services/api';
import { payOrder } from '../services/paymentService';
import type { OrderDTO } from '../services/orderService';
import { useAction } from '../hooks/useRemote';
import { Panel, Card, Notice, button, secondary, money } from '../components/DataUI';
interface Props { shippingAddress: ShippingAddress; cart: ReturnType<typeof useCart>; onOpenAddressModal: () => void }
export default function CartPage({ shippingAddress: a, cart, onOpenAddressModal }: Props) {
  const { isAuthenticated } = useAuth(); const navigate = useNavigate(); const [method, setMethod] = useState('COD'); const [created, setCreated] = useState<OrderDTO[]>([]); const action = useAction();
  const checkout = () => action.run(async () => {
    if (!isAuthenticated) { navigate('/login?redirect=/cart'); return; }
    if (!a.id) throw new Error('Vui lòng chọn địa chỉ nhận hàng.');
    const orders = await send<OrderDTO[]>('/orders', { recipientName: a.recipientName, phone: a.phone, address: a.addressLine, province: a.province, items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity, color: i.colorOption, engravingText: i.engraving })), paymentMethod: method });
    setCreated(orders);
    if (method === 'PAYOS') {
      sessionStorage.setItem('printhub_cart_backup', JSON.stringify(cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity }))));
      if (orders[0]?.id) sessionStorage.setItem('printhub_pending_payos_order', orders[0].id);
    } else {
      sessionStorage.removeItem('printhub_cart_backup');
      sessionStorage.removeItem('printhub_pending_payos_order');
    }
    cart.clearCart();
  });
  return <Panel title="Thanh toán đơn hàng"><Notice error={action.error || cart.error} />
    {created.length ? <><p role="status" className="text-emerald-300">Đã tạo {created.length} đơn hàng thành công. {method === 'PAYOS' && 'Vui lòng bấm nút thanh toán để quét mã QR qua PayOS.'}</p>
      {created.map(o => <Card key={o.id}><p className="break-all">Đơn #{o.id}</p><strong>{money(o.totalAmount)}</strong>{method === 'PAYOS' && <button className={button} disabled={action.busy} onClick={() => void action.run(() => payOrder(o.id))}>Thanh toán PayOS</button>}</Card>)}<div className="flex gap-3"><Link className={secondary} to="/orders">Theo dõi đơn hàng</Link><Link className={secondary} to="/catalog">Tiếp tục mua sắm</Link></div></> : <>
      {cart.loading && <p>Đang tải giỏ hàng…</p>}{!cart.loading && !cart.items.length && <p>Giỏ hàng đang trống. <Link className="text-emerald-300" to="/catalog">Xem danh mục</Link></p>}
      {cart.items.map(i => <Card key={i.id}><div className="flex justify-between gap-4"><div><h2>{i.product.name}</h2><p>{money(i.product.price)} × {i.quantity}</p></div><div className="flex items-center gap-3"><button className={secondary} disabled={cart.saving} onClick={() => cart.updateQuantity(i.id,-1)}>−</button>{i.quantity}<button className={secondary} disabled={cart.saving} onClick={() => cart.updateQuantity(i.id,1)}>+</button></div></div></Card>)}
      {!!cart.items.length && <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Địa chỉ giao hàng</h2>
          <button className={secondary} onClick={onOpenAddressModal}>{a.id ? 'Thay đổi địa chỉ' : '+ Chọn địa chỉ'}</button>
        </div>
        <p className="text-slate-300">{a.id ? `${a.recipientName} · ${a.phone} · ${a.addressLine}, ${a.province}` : 'Chưa chọn địa chỉ nhận hàng. Vui lòng bấm "+ Chọn địa chỉ" để tiếp tục.'}</p>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border">{['COD','PAYOS'].map(v => <label key={v} className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={method===v} onChange={() => setMethod(v)} /> {v==='COD'?'Thanh toán khi nhận hàng (COD)':'Thanh toán qua PayOS (QR Code)'}</label>)}</div>
        <p>Tổng tiền thanh toán: <strong>{money(cart.total)}</strong></p>
        <p className="text-sm text-slate-400">Đơn hàng được sản xuất và giao trực tiếp từ xưởng PrintHub 3D.</p>
        <button className={button} disabled={action.busy || cart.loading || cart.saving || !a.id || !!cart.error} onClick={() => void checkout()}>{action.busy?'Đang tạo đơn…':'Xác nhận đặt hàng'}</button>
      </Card>}
    </>}
  </Panel>;
}
