import { useMemo, useState } from 'react';
import { History, Package, RefreshCw, Search, X } from 'lucide-react';
import { useRemote } from '../../../hooks/useRemote';
import type { OrderDTO } from '../../../services/orderService';
import type { CheckoutOrderDTO } from '../../../services/checkoutOrderService';
import type { CustomDTO } from '../../../services/quotationService';
import { PageHeader, RemoteState, TabGroup, field, secondary, type TabItem } from '../../../components/DataUI';
import AdminOrderSummaryCard, { type AdminOrderKind } from './AdminOrderSummaryCard';

type KindFilter = 'ALL' | 'MARKETPLACE' | 'CUSTOM';
type ActiveStatusTab = 'ALL' | 'PENDING' | 'PRINTING' | 'SHIPPING';
type HistoryStatusTab = 'ALL' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

interface UnifiedAdminOrderItem {
  id: string;
  kind: AdminOrderKind;
  category: 'MARKETPLACE' | 'CUSTOM';
  customerName: string;
  shippingAddress: string;
  createdAt: string;
  status: string;
  priorityProduction: boolean;
  searchText: string;
}

const normalizeSearch = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{Diacritic}|#/gu, '')
    .replace(/đ/g, 'd');

export default function AdminOrdersUnifiedList({ history = false }: { history?: boolean }) {
  const marketRemote = useRemote<OrderDTO[]>('/admin/orders');
  const checkoutRemote = useRemote<CheckoutOrderDTO[]>('/admin/checkout-orders');
  const customRemote = useRemote<CustomDTO[]>('/admin/custom-orders');

  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
  const [activeStatusTab, setActiveStatusTab] = useState<ActiveStatusTab>('ALL');
  const [historyStatusTab, setHistoryStatusTab] = useState<HistoryStatusTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleReload = () => {
    marketRemote.reload();
    checkoutRemote.reload();
    customRemote.reload();
  };

  const loading = marketRemote.loading || checkoutRemote.loading || customRemote.loading;
  const error =
    marketRemote.error && checkoutRemote.error && customRemote.error
      ? marketRemote.error
      : '';

  const allItems = useMemo<UnifiedAdminOrderItem[]>(() => {
    const checkouts = Array.isArray(checkoutRemote.data) ? checkoutRemote.data : [];
    const customs = Array.isArray(customRemote.data) ? customRemote.data : [];
    const markets = Array.isArray(marketRemote.data) ? marketRemote.data : [];

    // Đơn cha CheckoutOrder (ưu tiên hiển thị thay cho các đơn con bên trong)
    const relevantCheckouts = checkouts.filter((co) => {
      const childCustoms = (co.customOrderDetails?.length ? co.customOrderDetails : co.customOrders) || [];
      const childMarkets = Array.isArray(co.marketplaceOrders) ? co.marketplaceOrders : [];
      return childCustoms.length > 0 || childMarkets.length > 0 || (co.orderType || '').toUpperCase() !== 'MARKETPLACE';
    });

    const childCustomIds = new Set<string>();
    const childMarketIds = new Set<string>();
    relevantCheckouts.forEach((co) => {
      (co.customOrderDetails || co.customOrders || []).forEach((c) => {
        if (c?.id) childCustomIds.add(c.id);
      });
      (co.marketplaceOrders || []).forEach((m) => {
        const mo = m as { id?: string };
        if (mo?.id) childMarketIds.add(mo.id);
      });
    });

    const inScope = (status?: string, isCustom = false): boolean => {
      const s = (status || '').toUpperCase();
      if (history) {
        return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(s);
      }
      if (isCustom) {
        return ['CONFIRMED', 'ACCEPTED', 'PAID', 'PROCESSING', 'PREPARING', 'PRINTING', 'SHIPPING'].includes(s);
      }
      return ['PENDING', 'UNPAID', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING'].includes(s);
    };

    const checkoutItems: UnifiedAdminOrderItem[] = relevantCheckouts
      .filter((co) => inScope(co.status, true))
      .map((co) => {
        const childCustoms = (co.customOrderDetails?.length ? co.customOrderDetails : co.customOrders) || [];
        const hasCustom = childCustoms.length > 0 || ['CUSTOM', 'MIXED'].includes((co.orderType || '').toUpperCase());
        const childText = childCustoms.flatMap((c) => [c.id, c.customName, c.customStudentId, c.rulerModel]);
        return {
          id: co.id,
          kind: 'CHECKOUT',
          category: hasCustom ? 'CUSTOM' : 'MARKETPLACE',
          customerName: co.recipientName?.trim() || co.buyerName?.trim() || 'Khách hàng',
          shippingAddress: co.shippingAddress?.trim() || 'Chưa cập nhật địa chỉ',
          createdAt: co.createdAt,
          status: co.status,
          priorityProduction: Boolean(co.priorityProduction),
          searchText: normalizeSearch(
            [co.id, co.buyerName, co.recipientName, co.shippingAddress, ...childText].filter(Boolean).join(' ')
          ),
        };
      });

    const standaloneCustomItems: UnifiedAdminOrderItem[] = customs
      .filter((c) => !c.checkoutOrderId && !childCustomIds.has(c.id) && inScope(c.status, true))
      .map((c) => ({
        id: c.id,
        kind: 'CUSTOM',
        category: 'CUSTOM',
        customerName: c.buyerName?.trim() || 'Khách hàng',
        shippingAddress: c.shippingAddress?.trim() || 'Chưa cập nhật địa chỉ',
        createdAt: c.createdAt,
        status: c.status,
        priorityProduction: Boolean(c.priorityProduction),
        searchText: normalizeSearch(
          [c.id, c.buyerName, c.shippingAddress, c.customName, c.customStudentId, c.rulerModel].filter(Boolean).join(' ')
        ),
      }));

    const marketplaceItems: UnifiedAdminOrderItem[] = markets
      .filter((o) => !childMarketIds.has(o.id) && inScope(o.status, false))
      .map((o) => {
        const addr = [o.shippingInfo?.address, o.shippingInfo?.province].filter(Boolean).join(', ');
        return {
          id: o.id,
          kind: 'MARKETPLACE',
          category: 'MARKETPLACE',
          customerName: o.shippingInfo?.recipientName?.trim() || o.buyerName?.trim() || 'Khách hàng',
          shippingAddress: addr || 'Chưa cập nhật địa chỉ',
          createdAt: o.createdAt,
          status: o.status,
          priorityProduction: Boolean(o.priorityProduction),
          searchText: normalizeSearch(
            [
              o.id,
              o.orderCode,
              o.buyerName,
              o.shippingInfo?.recipientName,
              addr,
              ...(o.items?.map((i) => i.productTitle) || []),
            ]
              .filter(Boolean)
              .join(' ')
          ),
        };
      });

    return [...checkoutItems, ...standaloneCustomItems, ...marketplaceItems].sort((a, b) => {
      const ta = Date.parse(a.createdAt || '') || 0;
      const tb = Date.parse(b.createdAt || '') || 0;
      return tb - ta;
    });
  }, [checkoutRemote.data, customRemote.data, marketRemote.data, history]);

  const byKindAndSearch = useMemo(() => {
    const q = normalizeSearch(searchQuery);
    return allItems.filter((item) => {
      if (kindFilter !== 'ALL' && item.category !== kindFilter) return false;
      if (q && !item.searchText.includes(q)) return false;
      return true;
    });
  }, [allItems, kindFilter, searchQuery]);

  const activeCounts = useMemo<Record<ActiveStatusTab, number>>(() => {
    const out: Record<ActiveStatusTab, number> = {
      ALL: byKindAndSearch.length,
      PENDING: 0,
      PRINTING: 0,
      SHIPPING: 0,
    };
    for (const item of byKindAndSearch) {
      const s = (item.status || '').toUpperCase();
      if (['PENDING', 'UNPAID', 'ACCEPTED', 'CONFIRMED', 'PAID', 'PROCESSING', 'PREPARING'].includes(s)) {
        out.PENDING += 1;
      } else if (s === 'PRINTING') {
        out.PRINTING += 1;
      } else if (s === 'SHIPPING') {
        out.SHIPPING += 1;
      }
    }
    return out;
  }, [byKindAndSearch]);

  const historyCounts = useMemo<Record<HistoryStatusTab, number>>(() => {
    const out: Record<HistoryStatusTab, number> = {
      ALL: byKindAndSearch.length,
      COMPLETED: 0,
      CANCELLED: 0,
      EXPIRED: 0,
    };
    for (const item of byKindAndSearch) {
      const s = (item.status || '').toUpperCase();
      if (s === 'COMPLETED') out.COMPLETED += 1;
      else if (s === 'CANCELLED') out.CANCELLED += 1;
      else if (s === 'EXPIRED') out.EXPIRED += 1;
    }
    return out;
  }, [byKindAndSearch]);

  const visibleItems = useMemo(() => {
    if (history) {
      if (historyStatusTab === 'ALL') return byKindAndSearch;
      return byKindAndSearch.filter((item) => (item.status || '').toUpperCase() === historyStatusTab);
    }
    if (activeStatusTab === 'ALL') return byKindAndSearch;
    if (activeStatusTab === 'PENDING') {
      return byKindAndSearch.filter((item) =>
        ['PENDING', 'UNPAID', 'ACCEPTED', 'CONFIRMED', 'PAID', 'PROCESSING', 'PREPARING'].includes(
          (item.status || '').toUpperCase()
        )
      );
    }
    return byKindAndSearch.filter((item) => (item.status || '').toUpperCase() === activeStatusTab);
  }, [byKindAndSearch, history, historyStatusTab, activeStatusTab]);

  const activeTabs: TabItem<ActiveStatusTab>[] = [
    { key: 'ALL', label: 'Tất cả', count: activeCounts.ALL },
    { key: 'PENDING', label: 'Chờ xử lý & Chuẩn bị', count: activeCounts.PENDING },
    { key: 'PRINTING', label: 'Đang in 3D', count: activeCounts.PRINTING },
    { key: 'SHIPPING', label: 'Đang giao hàng', count: activeCounts.SHIPPING },
  ];

  const historyTabs: TabItem<HistoryStatusTab>[] = [
    { key: 'ALL', label: 'Tất cả', count: historyCounts.ALL },
    { key: 'COMPLETED', label: 'Hoàn thành', count: historyCounts.COMPLETED },
    { key: 'CANCELLED', label: 'Đã hủy', count: historyCounts.CANCELLED },
    { key: 'EXPIRED', label: 'Hết hạn', count: historyCounts.EXPIRED },
  ];

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={history ? 'Lịch sử đơn hàng toàn hệ thống (Admin)' : 'Quản lý đơn hàng hệ thống (Admin)'}
        description={
          history
            ? 'Danh sách lịch sử các đơn hàng đã hoàn thành, đã hủy hoặc hết hạn. Nhấn Xem chi tiết đơn hàng để xem đầy đủ thông tin.'
            : 'Danh sách tổng hợp đơn hàng đang xử lý (Marketplace, In custom, Đơn gộp). Nhấn Xem chi tiết đơn hàng để cập nhật tiến độ.'
        }
        icon={history ? History : Package}
        actions={
          <button type="button" onClick={handleReload} disabled={loading} className={secondary}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
        }
      />

      {/* Thanh tìm kiếm */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng, người nhận, địa chỉ, tên sản phẩm..."
            className={`${field} pl-10 pr-10`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-surface hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-surface-inset p-1.5">
          {(
            [
              ['ALL', 'Tất cả loại'],
              ['MARKETPLACE', 'Marketplace'],
              ['CUSTOM', 'In Custom'],
            ] as [KindFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setKindFilter(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                kindFilter === key
                  ? 'bg-primary text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {history ? (
        <TabGroup tabs={historyTabs} activeTab={historyStatusTab} onChange={setHistoryStatusTab} />
      ) : (
        <TabGroup tabs={activeTabs} activeTab={activeStatusTab} onChange={setActiveStatusTab} />
      )}

      <RemoteState
        loading={loading}
        error={error}
        empty={!loading && !error && visibleItems.length === 0}
        retry={handleReload}
        emptyMessage={
          searchQuery.trim()
            ? 'Không tìm thấy đơn hàng phù hợp với từ khóa.'
            : history
              ? 'Chưa có lịch sử đơn hàng nào.'
              : 'Không có đơn hàng nào đang cần xử lý.'
        }
      />

      {!loading && !error && visibleItems.length > 0 && (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <AdminOrderSummaryCard
              key={`${item.kind}-${item.id}`}
              id={item.id}
              kind={item.kind}
              customerName={item.customerName}
              shippingAddress={item.shippingAddress}
              createdAt={item.createdAt}
              status={item.status}
              priorityProduction={item.priorityProduction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

