import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../../../types';
import ProductCard from './ProductCard';
import { useRemote } from '../../../hooks/useRemote';
import { productView, type ProductDTO, type PageDTO } from '../../../services/productService';
import { Panel, RemoteState, field, secondary } from '../../../components/DataUI';
export default function MainContent({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [params,setParams]=useSearchParams(); const [page,setPage]=useState(0); const [category,setCategory]=useState(''); const [sort,setSort]=useState('createdAt');
  const query=new URLSearchParams({keyword:params.get('q')||'',page:String(page),size:'12',sortBy:sort,sortDirection:sort==='price'?'asc':'desc'});if(category)query.set('categoryId',category);
  const remote=useRemote<PageDTO<ProductDTO>>(`/marketplace/product?${query}`); const categories=useRemote<{categoryId:number;categoryName:string}[]>('/categories');
  return <Panel title="Danh mục sản phẩm in 3D"><div className="grid gap-3 sm:grid-cols-3"><input aria-label="Tìm sản phẩm" className={field} value={params.get('q')||''} placeholder="Tìm sản phẩm…" onChange={e=>{setParams({q:e.target.value});setPage(0);}}/>
    <select className={field} aria-label="Danh mục" value={category} onChange={e=>{setCategory(e.target.value);setPage(0);}}><option value="">Tất cả danh mục</option>{categories.data?.map(c=><option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select>
    <select className={field} aria-label="Sắp xếp" value={sort} onChange={e=>{setSort(e.target.value);setPage(0);}}><option value="createdAt">Mới nhất</option><option value="price">Giá tăng dần</option><option value="title">Tên sản phẩm</option></select></div>
    <RemoteState {...remote} empty={!remote.data?.content.length} retry={remote.reload}/><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{remote.data?.content.map(p=><ProductCard key={p.id} product={productView(p)} onAddToCart={onAddToCart}/>)}</div>
    <div className="flex items-center gap-3"><button className={secondary} disabled={page===0||remote.loading} onClick={()=>setPage(page-1)}>Trước</button><span>Trang {page+1} / {Math.max(1,remote.data?.totalPages||1)}</span><button className={secondary} disabled={remote.loading||page+1>=(remote.data?.totalPages||0)} onClick={()=>setPage(page+1)}>Sau</button></div>
  </Panel>;
}
