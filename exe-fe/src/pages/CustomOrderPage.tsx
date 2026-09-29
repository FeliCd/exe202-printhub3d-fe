import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Product } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import { CustomRequestForm, CustomRequests } from '../features/custom/CustomRequests';
import { Panel, secondary } from '../components/DataUI';
import { useAuth } from '../context/AuthContext';
const RulerConfigurator=lazy(()=>import('../components/3d/RulerConfigurator'));
export default function CustomOrderPage({onAddToCart}: {onAddToCart: (product: Product) => void}){const location=useLocation();const [tab,setTab]=useState('design');const {isAuthenticated}=useAuth();return <Panel title="Thiết kế và đặt in 3D"><div className="flex gap-2 flex-wrap">{[['design','Thiết kế 3D'],['upload','Gửi tệp'],['requests','Yêu cầu của tôi']].map(([key,label])=><button key={key} className={secondary} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</div>
{tab==='design'&&<ErrorBoundary><Suspense fallback={<p>Đang tải thiết kế…</p>}><RulerConfigurator onAddToCart={onAddToCart} initialDesign={location.state?.rulerDesign}/></Suspense></ErrorBoundary>}
{tab==='upload'&&<CustomRequestForm onCreated={()=>setTab('requests')}/>}{tab==='requests'&&(isAuthenticated?<CustomRequests/>:<p>Đăng nhập để xem yêu cầu.</p>)}</Panel>;}
