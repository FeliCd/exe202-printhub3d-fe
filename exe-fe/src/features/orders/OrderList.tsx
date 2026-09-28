import { useState } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { payOrder } from '../../services/paymentService';
import type { OrderDTO } from '../../services/orderService';
import { Panel, Card, Notice, RemoteState, Status, button, secondary, field, money } from '../../components/DataUI';

export default function OrderList({ admin = false, history = false }: { admin?: boolean; history?: boolean }) {
  const remote = useRemote<OrderDTO[]>(admin ? '/admin/orders' : '/orders/me');
  const action = useAction(remote.reload);
  const rows = remote.data?.filter(o => !history || ['COMPLETED','CANCELLED'].includes(o.status)) || [];
  const [review, setReview] = useState(''); const [rating, setRating] = useState('5'); const [comment, setComment] = useState(''); const [reviewed, setReviewed] = useState<string[]>([]);
  const nextState = (o: OrderDTO) => ({ PENDING: o.paymentMethod === 'COD' ? 'PREPARING' : '', PAID: 'PREPARING', PREPARING: 'PRINTING', PRINTING: 'SHIPPING', SHIPPING: 'COMPLETED' }[o.status]);
  return <Panel title={admin ? 'Quản lý đơn hàng' : history ? 'Lịch sử đơn hàng' : 'Đơn hàng của tôi'}>
    <button className={secondary} onClick={remote.reload}>Tải lại</button><Notice error={action.error} /><RemoteState {...remote} empty={!rows.length} retry={remote.reload} />
    {rows.map(o => <Card key={o.id}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold break-all">#{o.id}</h2>{o.status==='PENDING'&&o.paymentMethod==='PAYOS'?<span className="inline-block rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs text-amber-300 font-semibold">Chờ thanh toán PayOS</span>:<Status value={o.status}/>}</div>
      <p className="text-sm text-slate-400">{new Date(o.createdAt).toLocaleString('vi-VN')} · {admin ? o.buyerName : 'Xưởng PrintHub 3D'}</p>
      <ul>{o.items.map((i,n)=><li key={n}>{i.productTitle} × {i.quantity} — {money(i.unitPrice*i.quantity)} {i.color && `· ${i.color}`} {i.engravingText && `· ${i.engravingText}`}</li>)}</ul>
      <p className="font-bold">Tổng: {money(o.totalAmount)}</p><p>{o.paymentMethod} · <Status value={o.paymentStatus}/></p>
      {o.shippingInfo && <p className="text-sm text-slate-300">{o.shippingInfo.recipientName} · {o.shippingInfo.phone} · {o.shippingInfo.address}, {o.shippingInfo.province}</p>}
      <div className="flex flex-wrap gap-2">
        {!admin && o.status==='PENDING' && o.paymentMethod==='PAYOS' && <button className={button} disabled={action.busy} onClick={()=>void action.run(()=>payOrder(o.id))}>Thanh toán PayOS</button>}
        {o.status==='PENDING' && <button className={secondary} disabled={action.busy} onClick={()=>{if(confirm('Hủy đơn hàng này?'))void action.run(()=>send(`/orders/${o.id}/status`,{status:'CANCELLED'},'put'));}}>Hủy đơn</button>}
        {admin && nextState(o) && <button className={button} disabled={action.busy} onClick={()=>{if(o.paymentMethod==='COD'&&nextState(o)==='COMPLETED'&&!confirm('Xác nhận đã giao hàng và thu đủ tiền COD?'))return;void action.run(()=>send(`/orders/${o.id}/status`,{status:nextState(o)},'put'));}}>Chuyển sang <Status value={nextState(o)!}/></button>}
        {!admin && o.status==='COMPLETED' && !reviewed.includes(o.id) && <button className={secondary} onClick={()=>setReview(review===o.id?'':o.id)}>Đánh giá</button>}
      </div>
      {review===o.id && <form className="space-y-2" onSubmit={async e=>{e.preventDefault();if(await action.run(()=>send('/reviews',{orderId:o.id,rating:Number(rating),comment}))){setReview('');setReviewed([...reviewed,o.id]);setComment('');}}}>
        <label>Số sao<select className={field} value={rating} onChange={e=>setRating(e.target.value)}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label><textarea aria-label="Nội dung đánh giá" className={field} maxLength={2000} value={comment} onChange={e=>setComment(e.target.value)}/><button className={button} disabled={action.busy}>Gửi đánh giá</button>
      </form>}
    </Card>)}
  </Panel>;
}
