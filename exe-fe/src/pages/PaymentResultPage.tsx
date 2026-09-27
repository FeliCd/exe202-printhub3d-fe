import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import { Panel, Card, RemoteState, Status, money, secondary } from '../components/DataUI';
export default function PaymentResultPage(){
  const [params]=useSearchParams();const code=params.get('orderCode');const {isAuthenticated,isLoading}=useAuth();
  const remote=useRemote<{status:string;amount:number}>(isAuthenticated&&code?`/payments/verify/${encodeURIComponent(code)}`:null);
  useEffect(()=>{if(remote.data?.status!=='PENDING')return;const timer=setTimeout(remote.reload,5000);return()=>clearTimeout(timer);},[remote.data?.status,remote.reload,remote.loading]);
  return <Panel title="Kết quả thanh toán"><Card>{isLoading?<p>Đang khôi phục phiên…</p>:!isAuthenticated?<Link className={secondary} to={`/login?redirect=${encodeURIComponent('/payment-result?'+params.toString())}`}>Đăng nhập để kiểm tra giao dịch</Link>:!code?<p>Thiếu mã giao dịch. Hãy xem trạng thái trong danh sách đơn hàng.</p>:<>
    <RemoteState {...remote} retry={remote.reload}/>{remote.data&&<><Status value={remote.data.status}/><p>{remote.data.status==='PAID'?'Đã xác nhận thanh toán.':remote.data.status==='PENDING'?'Đang chờ xác nhận thanh toán.':'Giao dịch chưa thanh toán thành công.'}</p><p>Số tiền: {money(remote.data.amount)}</p></>}
    <button className={secondary} onClick={remote.reload}>Kiểm tra lại</button></>}
    <div className="flex gap-3"><Link to="/orders" className={secondary}>Đơn hàng</Link><Link to="/quotations" className={secondary}>Yêu cầu in</Link></div>
  </Card></Panel>;
}
