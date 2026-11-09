import { Link } from 'react-router-dom';
import { ArrowRight, Box, ChevronRight, ClipboardList, FileText, HelpCircle, Plus, Upload, Zap } from 'lucide-react';
import { button, RemoteState, secondary, Status } from '../components/DataUI';
import RecordList from '../components/RecordList';
import { useAuth } from '../context/AuthContext';
import { isActiveCustomOrder, isActiveProductOrder } from '../features/orders/summary';
import { useRemote } from '../hooks/useRemote';
import type { OrderDTO } from '../services/orderService';
import type { CustomDTO } from '../services/quotationService';
import { formatDateTime } from '../utils/format';

const panel = 'min-w-0 space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5';
const sectionTitle = 'flex items-center gap-2 text-lg font-bold text-theme-ink';
const quietLink = 'inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-semibold text-theme-accent hover:underline focus-visible:outline-2 focus-visible:outline-theme-accent';
const recordLimit = 3;
const shortcuts = [
  { to: '/custom?tab=upload', title: 'Gửi tệp in', description: 'Tải tệp 3D để nhận báo giá', icon: Upload },
  { to: '/help-center', title: 'Trợ giúp', description: 'Xem hướng dẫn và câu hỏi thường gặp', icon: HelpCircle },
];

function isOrderList<T extends { id: string; status: string }>(data: T[] | null): data is T[] {
  return Array.isArray(data) && data.every(order =>
    order && typeof order.id === 'string' && typeof order.status === 'string',
  );
}

function newestFirst(a: { createdAt: string }, b: { createdAt: string }) {
  return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const orders = useRemote<OrderDTO[]>(user ? '/orders/me' : null, user?.id);
  const requests = useRemote<CustomDTO[]>(user ? '/custom-orders' : null, user?.id);
  const productOrders = isOrderList(orders.data) ? orders.data : null;
  const customOrders = isOrderList(requests.data) ? requests.data : null;
  const orderError = orders.error || (user && !orders.loading && !productOrders ? 'Chưa đọc được danh sách đơn sản phẩm.' : '');
  const requestError = requests.error || (user && !requests.loading && !customOrders ? 'Chưa đọc được danh sách yêu cầu in.' : '');
  const activeOrdersLoading = orders.loading || requests.loading;
  const readyQuotes = (customOrders ?? []).filter(request => request.status === 'QUOTED').sort(newestFirst);
  const waitingQuotes = (customOrders ?? []).filter(request => ['REQUESTED', 'PENDING'].includes(request.status)).length;

  const activeOrders = [
    ...(productOrders ?? []).filter(order => isActiveProductOrder(order.status)).map(order => ({
      id: `product:${order.id}`,
      to: `/orders/${encodeURIComponent(`product:${order.id}`)}`,
      title: order.items?.map(item => item.productTitle).filter(Boolean).join(', ') || 'Đơn sản phẩm',
      meta: `#${order.orderCode || order.id.slice(0, 8)} · ${formatDateTime(order.createdAt, false)}`,
      status: <Status value={order.status} />,
      thumbnail: null,
      createdAt: order.createdAt,
    })),
    ...(customOrders ?? []).filter(order => isActiveCustomOrder(order.status)).map(order => ({
      id: `custom:${order.id}`,
      to: `/orders/${encodeURIComponent(`custom:${order.id}`)}`,
      title: order.rulerModel || 'Đơn in theo yêu cầu',
      meta: `#CUS-${order.id.slice(0, 8)} · ${formatDateTime(order.createdAt, false)}`,
      status: <Status value={order.status} />,
      thumbnail: typeof order.attachmentUrl === 'string' && /\.(png|jpe?g|webp)(?:[?#]|$)|\/image\/upload\//i.test(order.attachmentUrl)
        ? order.attachmentUrl
        : null,
      createdAt: order.createdAt,
    })),
  ].sort(newestFirst);
  const displayName = user?.name?.trim();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 sm:space-y-6">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="break-words text-2xl font-bold tracking-tight text-theme-ink sm:text-3xl">
            {displayName ? `Chào ${displayName}` : 'Tổng quan'}
          </h1>
          <p className="text-sm text-theme-muted">Quản lý đơn hàng, thiết kế và in 3D tại PrintHub 3D.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/custom" className={button + ' min-h-11'}>
            <Plus className="size-4" aria-hidden="true" /> Tạo thiết kế 3D
          </Link>
          <Link to="/catalog" className={secondary + ' min-h-11'}>
            <Box className="size-4" aria-hidden="true" /> Xem sản phẩm
          </Link>
        </div>
      </header>

      <section className={panel} aria-labelledby="dashboard-tasks">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <h2 id="dashboard-tasks" className={sectionTitle}>
            <ClipboardList className="size-5 shrink-0 text-theme-accent" aria-hidden="true" /> Việc cần làm
          </h2>
          <Link to="/quotations" className={quietLink}>Yêu cầu &amp; báo giá <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {(requests.loading || requestError) && (
          <RemoteState loading={requests.loading} error={requestError} retry={requests.reload} />
        )}
        {customOrders && (readyQuotes.length > 0 ? (
          <ul className="space-y-2" aria-label="Báo giá cần xem">
            {readyQuotes.slice(0, recordLimit).map(quote => (
              <li key={quote.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-raised/50 p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-inset text-theme-accent">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 basis-40 space-y-1">
                  <p className="break-words text-sm font-semibold text-theme-ink">Báo giá #{quote.id.slice(0, 8)} đã sẵn sàng</p>
                  <p className="text-xs leading-relaxed text-theme-muted">{quote.rulerModel || 'Yêu cầu in 3D'} · Xem báo giá và xác nhận nếu muốn đặt in.</p>
                </div>
                <Link to={`/quotations/${encodeURIComponent(quote.id)}`} className={button}
                  aria-label={`Xem báo giá #${quote.id.slice(0, 8)}`}>
                  Xem báo giá <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-theme-muted">
            {waitingQuotes ? `Bạn có ${waitingQuotes} yêu cầu đang chờ xưởng báo giá.` : 'Bạn chưa có báo giá nào cần xác nhận.'}
          </p>
        ))}
      </section>

      <section className={panel} aria-labelledby="dashboard-orders">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <h2 id="dashboard-orders" className={sectionTitle}>
            <Box className="size-5 shrink-0 text-theme-accent" aria-hidden="true" /> Đơn đang thực hiện
          </h2>
          <Link to="/orders" className={quietLink}>Xem tất cả đơn <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {(activeOrdersLoading || orderError) && (
          <RemoteState loading={activeOrdersLoading} error={orderError} retry={orders.reload} />
        )}
        {requestError && (
          <p className="text-sm text-theme-muted">Danh sách đơn in theo yêu cầu chưa tải được. Bạn có thể thử lại ở mục Việc cần làm.</p>
        )}
        {activeOrders.length > 0 && <RecordList label="Đơn đang thực hiện" actionLabel="Theo dõi đơn" entries={activeOrders.slice(0, recordLimit)} />}
        {productOrders && customOrders && activeOrders.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-theme-muted">Bạn chưa có đơn hàng đang thực hiện.</p>
        )}
      </section>

      <section className={panel} aria-labelledby="dashboard-shortcuts">
        <h2 id="dashboard-shortcuts" className={sectionTitle}>
          <Zap className="size-5 shrink-0 text-theme-accent" aria-hidden="true" /> Truy cập nhanh
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map(({ to, title, description, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised/50 p-3 hover:border-theme-accent focus-visible:outline-2 focus-visible:outline-theme-accent">
              <Icon className="size-5 shrink-0 text-theme-accent" aria-hidden="true" />
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block text-sm font-semibold text-theme-ink">{title}</span>
                <span className="block text-xs text-theme-muted">{description}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-theme-muted" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
