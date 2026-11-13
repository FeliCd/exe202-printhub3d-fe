import { useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCw, Search, X } from 'lucide-react';
import { PageHeader, RemoteState, TabGroup, field, secondary, type TabItem } from '../../components/DataUI';
import { quotationService, type CustomDTO } from '../../services/quotationService';
import { checkoutOrderService, type CheckoutOrderDTO } from '../../services/checkoutOrderService';
import { getApiErrorMessage } from '../../utils/apiError';
import AdminOrderSummaryCard, { type AdminOrderKind } from '../../features/orders/components/AdminOrderSummaryCard';

type FilterTab = 'ALL' | 'REQUESTED' | 'QUOTED' | 'ACCEPTED' | 'PAID' | 'CANCELLED';

interface QuotationSummaryItem {
  id: string;
  kind: AdminOrderKind;
  customerName: string;
  shippingAddress: string;
  createdAt: string;
  status: string;
  bucket: FilterTab | 'OTHER';
  priorityProduction: boolean;
  searchText: string;
}

const resolveCheckoutBucket = (co: CheckoutOrderDTO): FilterTab | 'OTHER' => {
  const raw = (co.status || '').toUpperCase();
  if (raw === 'CANCELLED') return 'CANCELLED';
  if (raw === 'PAID') return 'PAID';
  if (raw === 'CONFIRMED') {
    return (co.paymentStatus || '').toUpperCase() === 'SUCCESS' ? 'PAID' : 'ACCEPTED';
  }
  if (raw === 'PENDING_QUOTE') {
    return co.allCustomQuoted ? 'QUOTED' : 'REQUESTED';
  }
  if (raw === 'QUOTED') return 'QUOTED';
  return 'OTHER';
};

const resolveCustomBucket = (c: CustomDTO): FilterTab | 'OTHER' => {
  const raw = (c.status || '').toUpperCase();
  if (raw === 'REQUESTED') return 'REQUESTED';
  if (raw === 'QUOTED') return 'QUOTED';
  if (raw === 'ACCEPTED') {
    return (c.paymentStatus || '').toUpperCase() === 'SUCCESS' ? 'PAID' : 'ACCEPTED';
  }
  if (raw === 'PAID') return 'PAID';
  if (raw === 'CANCELLED') return 'CANCELLED';
  return 'OTHER';
};

export default function AdminCustomOrdersPage() {
  const [checkoutOrders, setCheckoutOrders] = useState<CheckoutOrderDTO[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const [coRes, customRes] = await Promise.allSettled([
        checkoutOrderService.getAdminCheckoutOrders(),
        quotationService.getAllCustomOrders(),
      ]);
      if (!active) return;

      let firstError = '';
      if (coRes.status === 'fulfilled') {
        setCheckoutOrders(Array.isArray(coRes.value) ? coRes.value : []);
      } else {
        firstError = getApiErrorMessage(coRes.reason, 'Không thể tải danh sách đơn gộp custom.');
      }

      if (customRes.status === 'fulfilled') {
        setCustomOrders(Array.isArray(customRes.value) ? customRes.value : []);
      } else if (!firstError) {
        firstError = getApiErrorMessage(customRes.reason, 'Không thể tải danh sách yêu cầu in custom.');
      }

      if (coRes.status === 'rejected' && customRes.status === 'rejected') {
        setError(firstError);
      } else {
        setError('');
      }
      setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, [reloadTick]);

  const handleManualReload = () => {
    setLoading(true);
    setError('');
    setReloadTick((t) => t + 1);
  };

  const items = useMemo<QuotationSummaryItem[]>(() => {
    const relevantCheckouts = checkoutOrders.filter((co) => {
      const orderType = (co.orderType || '').toUpperCase();
      const childCount = (co.customOrderDetails?.length || 0) + (co.customOrders?.length || 0);
      return orderType === 'CUSTOM' || orderType === 'MIXED' || childCount > 0;
    });

    const childIdsInCheckouts = new Set<string>();
    const mappedCheckouts: QuotationSummaryItem[] = relevantCheckouts.map((co) => {
      const children = co.customOrderDetails?.length ? co.customOrderDetails : co.customOrders || [];
      children.forEach((child) => {
        if (child?.id) childIdsInCheckouts.add(child.id);
      });

      const childSearchParts = children.flatMap((c) => [
        c.id,
        c.buyerName,
        c.customName,
        c.customStudentId,
        c.rulerModel,
      ]);

      return {
        id: co.id,
        kind: 'CHECKOUT',
        customerName: co.recipientName?.trim() || co.buyerName?.trim() || 'Khách hàng',
        shippingAddress: co.shippingAddress?.trim() || 'Chưa cập nhật địa chỉ',
        createdAt: co.createdAt,
        status: co.status,
        bucket: resolveCheckoutBucket(co),
        priorityProduction: Boolean(co.priorityProduction),
        searchText: [
          co.id,
          co.buyerName,
          co.recipientName,
          co.shippingAddress,
          ...childSearchParts,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      };
    });

    const mappedStandalone: QuotationSummaryItem[] = customOrders
      .filter((c) => !c.checkoutOrderId && !childIdsInCheckouts.has(c.id))
      .map((c) => ({
        id: c.id,
        kind: 'CUSTOM',
        customerName: c.buyerName?.trim() || 'Khách hàng',
        shippingAddress: c.shippingAddress?.trim() || 'Chưa cập nhật địa chỉ',
        createdAt: c.createdAt,
        status: c.status,
        bucket: resolveCustomBucket(c),
        priorityProduction: Boolean(c.priorityProduction),
        searchText: [
          c.id,
          c.buyerName,
          c.shippingAddress,
          c.customName,
          c.customStudentId,
          c.rulerModel,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }));

    return [...mappedCheckouts, ...mappedStandalone].sort((a, b) => {
      const ta = Date.parse(a.createdAt || '') || 0;
      const tb = Date.parse(b.createdAt || '') || 0;
      return tb - ta;
    });
  }, [checkoutOrders, customOrders]);

  const searchedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.searchText.includes(q));
  }, [items, searchQuery]);

  const counts = useMemo(() => {
    const base: Record<FilterTab, number> = {
      ALL: searchedItems.length,
      REQUESTED: 0,
      QUOTED: 0,
      ACCEPTED: 0,
      PAID: 0,
      CANCELLED: 0,
    };
    for (const item of searchedItems) {
      if (item.bucket !== 'OTHER') {
        base[item.bucket] += 1;
      }
    }
    return base;
  }, [searchedItems]);

  const visibleItems = useMemo(() => {
    if (activeTab === 'ALL') return searchedItems;
    return searchedItems.filter((item) => item.bucket === activeTab);
  }, [searchedItems, activeTab]);

  const tabs: TabItem<FilterTab>[] = [
    { key: 'ALL', label: 'Tất cả', count: counts.ALL },
    { key: 'REQUESTED', label: 'Chờ báo giá', count: counts.REQUESTED },
    { key: 'QUOTED', label: 'Đã báo giá', count: counts.QUOTED },
    { key: 'ACCEPTED', label: 'Đã duyệt · Chờ TT', count: counts.ACCEPTED },
    { key: 'PAID', label: 'Đã thanh toán', count: counts.PAID },
    { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo giá đơn in custom"
        description="Danh sách đơn in 3D cá nhân hóa và đơn gộp cần báo giá. Nhấn Xem chi tiết đơn hàng để kiểm tra file 3D, báo giá từng sản phẩm hoặc hủy yêu cầu kèm lý do."
        icon={FileText}
        actions={
          <button
            type="button"
            onClick={handleManualReload}
            disabled={loading}
            className={secondary}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        }
      />

      {/* Thanh tìm kiếm đưa lên trên toàn hàng trước các tab */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã đơn, tên khách, người nhận, địa chỉ, tên in trên thước, MSSV, mẫu thước..."
          className={`${field} pl-10 pr-10`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-surface hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bộ lọc trạng thái */}
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <RemoteState
        loading={loading}
        error={error}
        empty={!loading && !error && visibleItems.length === 0}
        retry={handleManualReload}
        emptyMessage={
          searchQuery.trim()
            ? 'Không tìm thấy đơn in custom phù hợp với từ khóa.'
            : 'Chưa có đơn hàng nào ở trạng thái này.'
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
