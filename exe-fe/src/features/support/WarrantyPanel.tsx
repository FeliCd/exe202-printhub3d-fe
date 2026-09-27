import { useState } from 'react';
import { useRemote,useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import type { OrderDTO } from '../../services/orderService';
import { Panel,Card,RemoteState,Notice,Status,field,button } from '../../components/DataUI';
interface Claim {id:string;orderId:string;description:string;imageUrl?:string;status:string;buyerName:string;createdAt:string}
export default function WarrantyPanel({admin=false}:{admin?:boolean}){
  const remote=useRemote<Claim[]>(admin?'/warranty/admin/claims':'/warranty/user/me');const orders=useRemote<OrderDTO[]>(admin?null:'/orders/me');const action=useAction(remote.reload);
  const [orderId,setOrder]=useState('');const [description,setDescription]=useState('');const [imageUrl,setImage]=useState('');
  return <Panel title={admin?'Xử lý bảo hành':'Yêu cầu bảo hành'}><Notice error={action.error}/>
    {!admin&&<Card><form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(await action.run(()=>send('/warranty/claim',{orderId,description,imageUrl}))){setDescription('');setImage('');}}}>
      <label>Đơn đã hoàn thành<select required className={field} value={orderId} onChange={e=>setOrder(e.target.value)}><option value="">Chọn đơn hàng</option>{orders.data?.filter(o=>o.status==='COMPLETED').map(o=><option key={o.id} value={o.id}>{o.id} · {o.items.map(i=>i.productTitle).join(', ')}</option>)}</select></label><Notice error={orders.error}/>
      <label>Mô tả lỗi<textarea className={field} required maxLength={4000} value={description} onChange={e=>setDescription(e.target.value)}/></label><label>URL ảnh bằng chứng<input type="url" className={field} value={imageUrl} onChange={e=>setImage(e.target.value)}/></label><button className={button} disabled={action.busy}>Gửi yêu cầu</button>
    </form></Card>}
    <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload}/>{remote.data?.map(c=><Card key={c.id}><p className="break-all">Đơn {c.orderId} · {c.buyerName}</p><Status value={c.status}/><p>{c.description}</p>{c.imageUrl&&<a className="text-emerald-300" href={c.imageUrl} target="_blank" rel="noreferrer">Xem ảnh bằng chứng</a>}
      {admin&&<div className="flex gap-2">{(c.status==='PENDING'?['APPROVED','REJECTED']:c.status==='APPROVED'?['REPLACED']:[]).map(status=><button key={status} className={button} disabled={action.busy} onClick={()=>void action.run(()=>send(`/warranty/admin/claim/${c.id}/status`,{status},'put'))}><Status value={status}/></button>)}</div>}
    </Card>)}</Panel>;
}
