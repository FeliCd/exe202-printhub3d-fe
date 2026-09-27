import { useState } from 'react';
import { useRemote,useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import type { ProductDTO, PageDTO } from '../../services/productService';
import { Panel,Card,RemoteState,Notice,field,button,secondary,money } from '../../components/DataUI';
const empty={title:'',description:'',price:'',stock:'',categoryId:'',type:'PHYSICAL',image:''};
export default function Products(){
  const [page,setPage]=useState(0);const remote=useRemote<PageDTO<ProductDTO>>(`/marketplace/product?page=${page}&size=12`);const categories=useRemote<{categoryId:number;categoryName:string}[]>('/categories');const action=useAction(remote.reload);
  const [form,setForm]=useState(empty);const [editing,setEditing]=useState('');const [open,setOpen]=useState(false);const [categoryName,setCategoryName]=useState('');
  return <Panel title="Quản lý sản phẩm và danh mục"><Notice error={action.error}/><button className={button} onClick={()=>{setForm(empty);setEditing('');setOpen(true);}}>Thêm sản phẩm</button>
    {open&&<Card><form className="grid gap-3 sm:grid-cols-2" onSubmit={async e=>{e.preventDefault();const payload={title:form.title,description:form.description,price:Number(form.price),stock:Number(form.stock),categoryId:Number(form.categoryId),type:form.type,imageUrls:form.image?[form.image]:[]};if(await action.run(()=>send(`/marketplace/product${editing?'/'+editing:''}`,payload,editing?'put':'post')))setOpen(false);}}>
      <label>Tên sản phẩm<input required maxLength={200} className={field} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Danh mục<select required className={field} value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">Chọn danh mục</option>{categories.data?.map(c=><option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></label>
      <label>Giá (VND)<input required min={1} step={1} type="number" className={field} value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Tồn kho<input required min={0} step={1} type="number" className={field} value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label>
      <label>Mô tả<textarea className={field} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>URL hình ảnh<input type="url" className={field} value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label>
      <button className={button} disabled={action.busy}>Lưu sản phẩm</button><button type="button" className={secondary} onClick={()=>setOpen(false)}>Đóng</button>
    </form></Card>}
    <form className="flex gap-2" onSubmit={async e=>{e.preventDefault();if(await action.run(()=>send('/categories',{categoryName,description:''}))){setCategoryName('');categories.reload();}}}><input className={field} required aria-label="Danh mục mới" placeholder="Tên danh mục mới" value={categoryName} onChange={e=>setCategoryName(e.target.value)}/><button className={secondary} disabled={action.busy}>Thêm danh mục</button></form>
    <RemoteState {...remote} empty={!remote.data?.content.length} retry={remote.reload}/><div className="grid gap-4 sm:grid-cols-2">{remote.data?.content.map(p=><Card key={p.id}><h2 className="font-bold">{p.title}</h2><p>{p.categoryName} · {money(p.price)} · Tồn {p.stock}</p><p>{p.description}</p><div className="flex gap-2"><button className={secondary} onClick={()=>{setEditing(p.id);setForm({title:p.title,description:p.description||'',price:String(p.price),stock:String(p.stock),categoryId:String(p.categoryId),type:p.type,image:p.primaryImageUrl||''});setOpen(true);}}>Sửa</button><button className={secondary} disabled={action.busy} onClick={()=>{if(confirm('Ngừng bán sản phẩm này? Lịch sử đơn vẫn được giữ.'))void action.run(()=>send(`/marketplace/product/${p.id}`,undefined,'delete'));}}>Ngừng bán</button></div></Card>)}</div>
    <div className="flex gap-3"><button className={secondary} disabled={!page} onClick={()=>setPage(page-1)}>Trước</button><span>Trang {page+1}</span><button className={secondary} disabled={page+1>=(remote.data?.totalPages||0)} onClick={()=>setPage(page+1)}>Sau</button></div>
  </Panel>;
}
