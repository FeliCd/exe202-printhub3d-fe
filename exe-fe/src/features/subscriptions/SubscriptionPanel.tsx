import { useState } from 'react';
import { useRemote,useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { Panel,Card,RemoteState,Notice,field,button,secondary } from '../../components/DataUI';
interface Plan {id:string;name:string;price:number;benefits:string;requiredPoints:number;isActive:boolean;type:string}
interface Membership {points:number;subscriptions:{id:string;name:string;endDate:string}[]}
const empty={name:'',price:'0',benefits:'',requiredPoints:'100'};
export default function SubscriptionPanel({admin=false}:{admin?:boolean}){
  const remote=useRemote<Plan[]>(admin?'/admin/subscriptions':'/subscriptions/plans');const membership=useRemote<Membership>(admin?null:'/subscriptions/me');
  const users=useRemote<{id:string;name:string;role:string}[]>(admin?'/admin/users':null);
  const action=useAction(()=>{remote.reload();membership.reload();});const [editing,setEditing]=useState('');const [form,setForm]=useState(empty);const [open,setOpen]=useState(false);const [giftUser,setGiftUser]=useState('');
  return <Panel title={admin?'Quản lý hội viên':'Hội viên và điểm thưởng'}><Notice error={action.error}/><Notice error={membership.error}/>
    {membership.data&&<Card><p>Điểm hiện có: <strong>{membership.data.points}</strong></p>{membership.data.subscriptions.map(s=><p key={s.id}>{s.name} · Hết hạn {new Date(s.endDate).toLocaleDateString('vi-VN')}</p>)}</Card>}
    {admin&&<><button className={button} onClick={()=>{setOpen(true);setEditing('');setForm(empty);}}>Thêm gói</button><label>Người nhận gói tặng<select className={field} value={giftUser} onChange={e=>setGiftUser(e.target.value)}><option value="">Chọn người dùng</option>{users.data?.filter(u=>u.role==='USER').map(u=><option key={u.id} value={u.id}>{u.name} · {u.id}</option>)}</select></label></>}
    {open&&<Card><form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(await action.run(()=>send(`/admin/subscriptions/customer${editing?'/'+editing:''}`,{...form,price:Number(form.price),requiredPoints:Number(form.requiredPoints)},editing?'put':'post')))setOpen(false);}}>
      <label>Tên gói<input className={field} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Quyền lợi<textarea className={field} required value={form.benefits} onChange={e=>setForm({...form,benefits:e.target.value})}/></label><label>Điểm đổi gói<input className={field} required type="number" min={1} value={form.requiredPoints} onChange={e=>setForm({...form,requiredPoints:e.target.value})}/></label><button className={button} disabled={action.busy}>Lưu gói</button><button className={secondary} type="button" onClick={()=>setOpen(false)}>Đóng</button>
    </form></Card>}
    <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload}/>{remote.data?.map(p=><Card key={p.id}><h2 className="font-bold">{p.name}{!p.isActive&&' (Ngừng áp dụng)'}</h2><p>{p.benefits}</p><p>{p.requiredPoints || 0} điểm · 30 ngày</p>
      <div className="flex gap-2 flex-wrap">{admin?<><button className={secondary} onClick={()=>{setEditing(p.id);setForm({name:p.name,price:String(p.price),benefits:p.benefits,requiredPoints:String(p.requiredPoints||0)});setOpen(true);}}>Sửa</button><button className={secondary} disabled={action.busy||!p.isActive} onClick={()=>{if(confirm('Ngừng áp dụng gói này?'))void action.run(()=>send(`/admin/subscriptions/customer/${p.id}`,undefined,'delete'));}}>Ngừng áp dụng</button><button className={button} disabled={action.busy||!giftUser||!p.isActive} onClick={()=>void action.run(()=>send('/admin/subscriptions/gift',{userId:giftUser,planId:p.id,reason:'Tặng gói từ quản trị'}))}>Tặng gói</button></>:<button className={button} disabled={action.busy||!p.requiredPoints||(membership.data?.points||0)<p.requiredPoints} onClick={()=>{if(confirm(`Dùng ${p.requiredPoints} điểm để đổi gói ${p.name}?`))void action.run(()=>send(`/subscriptions/redeem/${p.id}`));}}>Đổi điểm lấy gói</button>}</div>
    </Card>)}</Panel>;
}
