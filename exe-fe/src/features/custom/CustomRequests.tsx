import { useState } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { uploadFile, downloadFile } from '../../services/fileVaultService';
import { payOrder } from '../../services/paymentService';
import type { CustomDTO } from '../../services/quotationService';
import { Panel, Card, Notice, RemoteState, Status, button, secondary, field, money } from '../../components/DataUI';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function CustomRequestForm({ bulk = false, onCreated }: { bulk?: boolean; onCreated?: () => void }) {
  const {isAuthenticated}=useAuth(); const action=useAction(onCreated);
  const [files,setFiles]=useState<File[]>([]); const [quantity,setQuantity]=useState(1); const [requirements,setRequirements]=useState(''); const [address,setAddress]=useState('');
  const [success,setSuccess]=useState('');
  if(!isAuthenticated)return <p><Link className="text-emerald-300" to={`/login?redirect=${bulk?'/bulk-order':'/custom'}`}>Đăng nhập</Link> để gửi yêu cầu in.</p>;
  return <Card><form className="space-y-3" onSubmit={async e=>{e.preventDefault();setSuccess('');let completed=0;
    const ok=await action.run(async()=>{if(!files.length)throw new Error('Chọn ít nhất một tệp thiết kế.');
      for(const file of files){const asset=await uploadFile(file);await send('/custom-orders',{fileId:asset.id,requirements,quantity,shippingAddress:address});completed++;setFiles(previous=>previous.filter(f=>f!==file));}
    });
    if(ok){setSuccess(`Đã gửi ${completed} yêu cầu. Theo dõi báo giá ở mục Báo giá.`);setRequirements('');}
    else if(completed)setSuccess(`Đã gửi ${completed} yêu cầu. Các tệp còn lại chưa gửi, bạn có thể thử lại.`);
  }}>
    <h2 className="font-bold">{bulk?'Gửi lô thiết kế để báo giá':'Gửi thiết kế để báo giá'}</h2><Notice error={action.error}/>{success&&<p role="status" className="text-emerald-300">{success}</p>}
    <label className="block">Tệp STL/OBJ/STEP (tối đa 20MB mỗi tệp)<input className={field} type="file" accept=".stl,.obj,.step,.stp" multiple={bulk} onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
    <p className="text-sm">{files.map(f=>f.name).join(', ')}</p>
    <label className="block">Số lượng mỗi thiết kế<input className={field} type="number" min={1} max={10000} required value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
    <label className="block">Vật liệu, màu, độ đặc, kích thước và yêu cầu khác<textarea className={field} maxLength={4000} required value={requirements} onChange={e=>setRequirements(e.target.value)}/></label>
    <label className="block">Người nhận, điện thoại và địa chỉ giao hàng<textarea className={field} maxLength={1000} required value={address} onChange={e=>setAddress(e.target.value)}/></label>
    <p className="text-sm text-slate-400">Xưởng sẽ gửi báo giá để bạn xác nhận trước khi đặt in.</p><button className={button} disabled={action.busy}>{action.busy?'Đang gửi…':'Gửi yêu cầu'}</button>
  </form></Card>;
}
export function CustomRequests({ admin = false }: { admin?: boolean }) {
  const remote=useRemote<CustomDTO[]>(admin?'/admin/custom-orders':'/custom-orders');const action=useAction(remote.reload);
  const [prices,setPrices]=useState<Record<string,string>>({});const [method,setMethod]=useState('COD');
  const next=(c:CustomDTO)=>({ACCEPTED:c.paymentMethod==='COD'?'PRINTING':'',PAID:'PRINTING',PRINTING:'SHIPPING',SHIPPING:'COMPLETED'}[c.status]);
  return <Panel title={admin?'Yêu cầu in và báo giá':'Báo giá và yêu cầu in'}><button className={secondary} onClick={remote.reload}>Tải lại</button><Notice error={action.error}/><RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload}/>
    {remote.data?.map(c=><Card key={c.id}><div className="flex flex-wrap gap-3 justify-between"><h2 className="break-all">#{c.id}</h2><Status value={c.status}/></div>
      <p>{c.buyerName} · Số lượng {c.quantity}</p><p className="whitespace-pre-wrap">{c.requirements}</p><p>{c.shippingAddress}</p>
      {c.rulerModel&&<p>Mẫu {c.rulerModel} · {c.customName} · {c.customStudentId} · {c.color} · {c.fontStyle}</p>}
      <button className={secondary} disabled={action.busy} onClick={()=>void action.run(()=>downloadFile(c.attachmentUrl,`design-${c.id}.stl`))}>Tải thiết kế</button>
      {c.quotedPrice!=null&&<p className="text-emerald-300 font-bold">Báo giá toàn bộ: {money(c.quotedPrice)}</p>}
      {admin&&['REQUESTED','QUOTED'].includes(c.status)&&<form className="flex gap-2" onSubmit={e=>{e.preventDefault();void action.run(()=>send(`/admin/custom-orders/${c.id}/quote`,{price:Number(prices[c.id])},'put'));}}><input className={field} type="number" min={1} step={1} required aria-label="Giá báo toàn bộ đơn" placeholder="Giá toàn bộ (VND)" value={prices[c.id]||''} onChange={e=>setPrices({...prices,[c.id]:e.target.value})}/><button className={button} disabled={action.busy}>Gửi báo giá</button></form>}
      <div className="flex gap-2 flex-wrap">
        {!admin&&c.status==='QUOTED'&&<><select className={field} aria-label="Thanh toán" value={method} onChange={e=>setMethod(e.target.value)}><option value="COD">COD</option><option value="PAYOS">PayOS</option></select><button className={button} disabled={action.busy} onClick={()=>void action.run(()=>send(`/custom-orders/${c.id}/status`,{status:'ACCEPTED',paymentMethod:method},'put'))}>Chấp nhận báo giá</button></>}
        {!admin&&['REQUESTED','QUOTED'].includes(c.status)&&<button className={secondary} disabled={action.busy} onClick={()=>{if(confirm('Hủy yêu cầu này?'))void action.run(()=>send(`/custom-orders/${c.id}/status`,{status:'CANCELLED'},'put'));}}>Hủy yêu cầu</button>}
        {!admin&&c.status==='ACCEPTED'&&c.paymentMethod==='PAYOS'&&<button className={button} disabled={action.busy} onClick={()=>void action.run(()=>payOrder(c.id,'CUSTOM_ORDER'))}>Thanh toán PayOS</button>}
        {admin&&next(c)&&<button className={button} disabled={action.busy} onClick={()=>{if(c.paymentMethod==='COD'&&next(c)==='COMPLETED'&&!confirm('Đã giao sản phẩm và thu đủ tiền COD?'))return;void action.run(()=>send(`/custom-orders/${c.id}/status`,{status:next(c)},'put'));}}>Chuyển sang <Status value={next(c)!}/></button>}
      </div>
    </Card>)}
  </Panel>;
}
