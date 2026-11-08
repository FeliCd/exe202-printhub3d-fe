import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CircleAlert, CircleX, Loader2, ShieldCheck } from 'lucide-react';
import { button, secondary } from '../components/DataUI';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import type { VerifyPaymentResponse } from '../services/paymentService';
import { money } from '../utils/format';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const code = params.get('orderCode');
  const cancelReturn = params.get('cancel') === 'true' || params.get('status') === 'CANCELLED';
  const { isAuthenticated, isLoading } = useAuth();
  const remote = useRemote<VerifyPaymentResponse>(
    isAuthenticated && code ? `/payments/verify/${encodeURIComponent(code)}` : null,
  );
  const status = remote.data?.status;
  const isSubscription = remote.data?.targetType === 'SUBSCRIPTION_PURCHASE' || params.get('type') === 'SUBSCRIPTION_PURCHASE';
  const returnTo = isSubscription ? '/subscriptions' : '/cart';
  const ordersLink = isSubscription ? '/subscriptions' : '/orders';
  const ordersLabel = isSubscription ? 'Xem gói hội viên' : 'Theo dõi đơn hàng';

  useEffect(() => {
    if (status !== 'PENDING') return;
    const timer = setTimeout(remote.reload, 5000);
    return () => clearTimeout(timer);
  }, [status, remote.reload]);

  const verifying = isLoading || remote.loading;
  const paid = status === 'PAID' || status === 'SUCCESS';
  const cancelled = status === 'CANCELLED';
  const leftCheckout = cancelReturn && !code;
  const amount = remote.data?.amount;
  const points = paid && !isSubscription && typeof amount === 'number' ? Math.floor(amount / 10000) : 0;

  let Icon = CircleAlert;
  let title = 'Chưa xác nhận được thanh toán';
  let description = remote.error || 'Kiểm tra lại trạng thái giao dịch hoặc mở đơn hàng để xem chi tiết.';
  let actions = <>
    {code && <button className={button} type="button" onClick={remote.reload}>Kiểm tra lại</button>}
    <Link className={secondary} to={ordersLink}>{ordersLabel}</Link>
  </>;

  if (verifying || status === 'PENDING') {
    Icon = Loader2;
    title = 'Đang xác minh';
    description = 'PrintHub đang kiểm tra trạng thái giao dịch với PayOS.';
    actions = <>
      <button className={secondary} disabled={verifying} type="button" onClick={remote.reload}>Kiểm tra lại</button>
      <Link className={secondary} to={ordersLink}>{ordersLabel}</Link>
    </>;
  } else if (paid) {
    Icon = Check;
    title = isSubscription ? 'Đã kích hoạt gói hội viên' : 'Đã thanh toán';
    description = isSubscription
      ? `${remote.data?.planName ?? 'Gói hội viên'} đã được kích hoạt.`
      : 'Thanh toán đã được xác nhận và đơn hàng đã được ghi nhận.';
    actions = <>
      <Link className={button} to={ordersLink}>{ordersLabel}</Link>
      <Link className={secondary} to={isSubscription ? '/profile' : '/catalog'}>{isSubscription ? 'Xem hồ sơ' : 'Về sản phẩm'}</Link>
    </>;
  } else if (cancelled || leftCheckout) {
    Icon = CircleX;
    title = cancelled ? 'Đã hủy thanh toán' : 'Đã thoát thanh toán';
    description = cancelled ? 'Bạn có thể mở lại đơn hàng để xem các lựa chọn tiếp theo.' : 'PrintHub chưa có mã giao dịch để xác minh kết quả.';
    actions = <>
      <Link className={button} to={ordersLink}>{isSubscription ? ordersLabel : 'Mở đơn hàng'}</Link>
      {!isSubscription && <Link className={secondary} to="/cart">Về giỏ hàng</Link>}
    </>;
  } else if (!isAuthenticated) {
    Icon = ShieldCheck;
    title = 'Đăng nhập để xác minh';
    description = 'Đăng nhập vào tài khoản đã tạo giao dịch để xem kết quả thanh toán.';
    actions = <Link className={button} to={`/login?redirect=${encodeURIComponent('/payment-result?' + params.toString())}`}>Đăng nhập</Link>;
  } else if (!code) {
    title = 'Không tìm thấy mã giao dịch';
    description = 'Mở đơn hàng để kiểm tra trạng thái thanh toán.';
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 py-3 sm:py-7">
      <Link to={returnTo} className="inline-flex min-h-9 items-center gap-2 text-sm text-theme-muted hover:text-theme-accent">
        <ArrowLeft className="size-4" aria-hidden="true" /> {isSubscription ? 'Về hội viên' : 'Về giỏ hàng'}
      </Link>
      <section aria-live="polite" className="space-y-5 rounded-xl border border-border bg-surface p-5 text-center sm:p-8">
        <div className={`mx-auto grid size-14 place-items-center rounded-full ${paid ? 'bg-primary text-slate-950' : 'bg-surface-raised text-theme-muted'}`}>
          <Icon className={`size-7 ${verifying ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-theme-ink">{title}</h1>
          <p className="text-sm leading-relaxed text-theme-muted">{description}</p>
        </div>
        {code && (
          <dl className="divide-y divide-border rounded-lg border border-border bg-surface-inset px-3.5 text-left text-sm">
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="shrink-0 text-theme-muted">Mã giao dịch</dt>
              <dd className="break-all text-right font-semibold text-theme-ink">{remote.data?.orderCode || code}</dd>
            </div>
            {typeof amount === 'number' && Number.isFinite(amount) && (
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-theme-muted">Số tiền</dt>
                <dd className="font-semibold text-theme-ink">{money(amount)}</dd>
              </div>
            )}
          </dl>
        )}
        {points > 0 && <p className="text-xs text-theme-muted">Dự kiến cộng {points} xu khi đơn hàng hoàn tất.</p>}
        <div className="grid gap-2">{actions}</div>
        <Link to="/help-center" className="text-xs text-theme-muted underline underline-offset-4 hover:text-theme-accent">Liên hệ hỗ trợ</Link>
      </section>
    </div>
  );
}
