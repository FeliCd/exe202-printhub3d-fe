import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import { send } from '../services/api';
import { Panel, Card, RemoteState, Status, money, button, secondary } from '../components/DataUI';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const code = params.get('orderCode');
  const isCancelled = params.get('cancel') === 'true' || params.get('status') === 'CANCELLED';
  const { isAuthenticated, isLoading } = useAuth();
  const [restored, setRestored] = useState(false);

  const remote = useRemote<{ status: string; amount: number }>(
    isAuthenticated && code && !isCancelled ? `/payments/verify/${encodeURIComponent(code)}` : null
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isCancelled) {
      const backupRaw = sessionStorage.getItem('printhub_cart_backup');
      const pendingOrderId = sessionStorage.getItem('printhub_pending_payos_order');
      if (backupRaw) {
        try {
          const items = JSON.parse(backupRaw);
          send('/cart', { items }, 'put').then(() => setRestored(true)).catch(() => undefined);
        } catch {
          // ignore
        }
        sessionStorage.removeItem('printhub_cart_backup');
      }
      if (pendingOrderId) {
        send(`/orders/${pendingOrderId}/status`, { status: 'CANCELLED' }, 'put').catch(() => undefined);
        sessionStorage.removeItem('printhub_pending_payos_order');
      }
    }
  }, [isAuthenticated, isCancelled]);

  useEffect(() => {
    if (remote.data?.status === 'PAID') {
      sessionStorage.removeItem('printhub_cart_backup');
      sessionStorage.removeItem('printhub_pending_payos_order');
    }
    if (remote.data?.status !== 'PENDING') return;
    const timer = setTimeout(remote.reload, 5000);
    return () => clearTimeout(timer);
  }, [remote.data?.status, remote.reload, remote.loading]);

  return (
    <Panel title="Kết quả thanh toán">
      <Card>
        {isLoading ? (
          <p>Đang khôi phục phiên…</p>
        ) : !isAuthenticated ? (
          <Link className={secondary} to={`/login?redirect=${encodeURIComponent('/payment-result?' + params.toString())}`}>
            Đăng nhập để kiểm tra giao dịch
          </Link>
        ) : isCancelled ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-800 bg-amber-950/40 text-amber-300 space-y-1">
              <h2 className="font-bold text-base">Bạn đã hủy giao dịch thanh toán PayOS</h2>
              <p className="text-sm text-slate-300">
                Đơn hàng chưa thanh toán đã được hủy. {restored ? 'Các sản phẩm đã được tự động giữ lại trong giỏ hàng của bạn.' : 'Bạn có thể quay lại giỏ hàng để tiếp tục đặt lại.'}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Link to="/cart" className={button}>Quay lại giỏ hàng</Link>
              <Link to="/orders" className={secondary}>Xem đơn hàng</Link>
            </div>
          </div>
        ) : !code ? (
          <p>Thiếu mã giao dịch. Hãy xem trạng thái trong danh sách đơn hàng.</p>
        ) : (
          <>
            <RemoteState {...remote} retry={remote.reload} />
            {remote.data && (
              <>
                <Status value={remote.data.status} />
                <p>
                  {remote.data.status === 'PAID'
                    ? 'Đã xác nhận thanh toán thành công!'
                    : remote.data.status === 'PENDING'
                    ? 'Đang chờ xác nhận thanh toán từ PayOS…'
                    : 'Giao dịch chưa thanh toán thành công.'}
                </p>
                <p>Số tiền: {money(remote.data.amount)}</p>
              </>
            )}
            <button className={secondary} onClick={remote.reload}>Kiểm tra lại</button>
            <div className="flex gap-3 pt-2">
              <Link to="/orders" className={secondary}>Đơn hàng</Link>
              <Link to="/quotations" className={secondary}>Yêu cầu in</Link>
            </div>
          </>
        )}
      </Card>
    </Panel>
  );
}
