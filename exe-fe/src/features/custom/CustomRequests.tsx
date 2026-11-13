import RecordList, { RecordDetailHeader } from '../../components/RecordList';
import { useEffect, useMemo, useState } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import api, { send } from '../../services/api';
import { downloadFile } from '../../services/fileVaultService';
import { payOrder } from '../../services/paymentService';
import type { CustomDTO } from '../../services/quotationService';
import subscriptionService, { type BenefitPreviewResponse } from '../../services/subscriptionService';
import { Notice, RemoteState } from '../../components/DataUI';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDateTime, money } from '../../utils/format';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { CheckoutOrderDTO } from '../../services/checkoutOrderService';
import CheckoutOrderDetailCard from './CheckoutOrderDetailCard';
import {
  Ruler,
  Layers,
  Palette,
  User,
  Phone,
  MapPin,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  QrCode,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Box,
  Truck,
  Printer,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  XCircle,
} from 'lucide-react';

/* ========================================================================= */
/* 1. DATA PARSING HELPERS                                                   */
/* ========================================================================= */
interface ParsedRequirements {
  modelName: string;
  material: string;
  infill: string;
  infillNum: number;
  bodyColor: string;
  plateColor: string;
  textColor: string;
  engraveName?: string;
  studentId?: string;
  fontName?: string;
  stickersCount?: string;
  notes?: string;
  preferredPayment?: string;
}

function parseOrderRequirements(reqText: string, dto: CustomDTO): ParsedRequirements {
  const text = reqText || '';
  let jsonParsed: any = null;
  if (text.trim().startsWith('{')) {
    try {
      jsonParsed = JSON.parse(text);
    } catch {
      // ignore
    }
  }

  // 1. Model name
  let modelName = dto.rulerModel || (jsonParsed?.name) || '';
  if (!modelName) {
    const match = text.match(/Mẫu thước:\s*([^;]+)/i);
    if (match) modelName = match[1].trim();
  }
  if (!modelName) modelName = 'Thước In 3D Kỹ Thuật';

  // 2. Material
  let material = jsonParsed?.material || 'PLA Pro+ (Chống cong vênh)';
  const matMatch = text.match(/Vật liệu:\s*([^;]+)/i);
  if (matMatch) material = matMatch[1].trim();

  // 3. Infill
  let infill = jsonParsed?.infill ? `${jsonParsed.infill}%` : '20%';
  let infillNum = jsonParsed?.infill || 20;
  const infillMatch = text.match(/(?:Độ đặc|infill):\s*([^;]+)/i);
  if (infillMatch) {
    infill = infillMatch[1].trim();
    const num = parseInt(infill.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) infillNum = num;
  }

  // 4. 3-Layer Colors
  const allHex = (text + ' ' + (dto.color || '')).match(/#[0-9a-fA-F]{6}/g) || [];
  const bodyColor = jsonParsed?.color || allHex[0] || '#39FF14';
  const plateColor = jsonParsed?.tag?.color || allHex[1] || '#1C1D22';
  const textColor = jsonParsed?.tag?.textColor || allHex[2] || '#FFFFFF';

  // 5. Engraving details
  let engraveName = dto.customName || jsonParsed?.tag?.text || '';
  let studentId = dto.customStudentId || '';
  let fontName = dto.fontStyle || jsonParsed?.tag?.font || '';

  if (!engraveName) {
    const nameMatch = text.match(/Khắc tên:\s*([^(;\n]+)/i);
    if (nameMatch) engraveName = nameMatch[1].trim();
  }
  if (!studentId) {
    const idMatch = text.match(/MSSV:\s*([^);]+)/i);
    if (idMatch) studentId = idMatch[1].trim();
  }
  if (!fontName) {
    const fontMatch = text.match(/Font:\s*([^;]+)/i);
    if (fontMatch) fontName = fontMatch[1].trim();
  }

  // 6. Stickers & Notes
  let stickersCount: string | undefined;
  if (!jsonParsed) {
    const stickMatch = text.match(/sticker[^:]*:\s*([^;]+)/i);
    if (stickMatch) {
      const val = stickMatch[1].trim();
      if (val.length < 50 && !val.includes('{') && !val.includes('"')) {
        stickersCount = val;
      }
    }
  } else if (Array.isArray(jsonParsed.layers) && jsonParsed.layers.length > 0) {
    stickersCount = `${jsonParsed.layers.length} icon dập nổi`;
  }

  let notes: string | undefined;
  if (!jsonParsed) {
    const noteMatch = text.match(/Ghi chú[^:]*:\s*([^;]+)/i);
    if (noteMatch) {
      const val = noteMatch[1].trim();
      if (!val.includes('{') && !val.includes('"')) {
        notes = val;
      }
    }
  }

  // 7. Preferred Payment
  let preferredPayment = dto.paymentMethod || '';
  if (!preferredPayment && !jsonParsed) {
    const payMatch = text.match(/Phương thức[^:]*:\s*([^;]+)/i);
    if (payMatch) preferredPayment = payMatch[1].trim();
  }

  return {
    modelName,
    material,
    infill,
    infillNum,
    bodyColor,
    plateColor,
    textColor,
    engraveName: engraveName || undefined,
    studentId: studentId || undefined,
    fontName: fontName || undefined,
    stickersCount,
    notes,
    preferredPayment: preferredPayment || 'PAYOS',
  };
}

interface ParsedShipping {
  recipient: string;
  phone: string;
  address: string;
}

function parseShippingAddress(addrText: string, buyerName?: string): ParsedShipping {
  if (!addrText) {
    return {
      recipient: buyerName || 'Khách hàng PrintHub',
      phone: '',
      address: 'Chưa có thông tin địa chỉ giao nhận',
    };
  }

  if (addrText.includes('·')) {
    const parts = addrText.split('·').map(p => p.trim());
    return {
      recipient: parts[0] || buyerName || 'Khách hàng',
      phone: parts[1] || '',
      address: parts.slice(2).join(' · ') || addrText,
    };
  }

  return {
    recipient: buyerName || 'Khách hàng PrintHub',
    phone: '',
    address: addrText,
  };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function renderStatusBadge(status?: string, tr: (text: string) => string = text => text) {
  const s = (status || 'REQUESTED').toUpperCase();
  switch (s) {
    case 'REQUESTED':
    case 'PENDING':
    case 'PENDING_QUOTE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#ff9100]/40 bg-[#ff9100]/10 text-[#ff9100] whitespace-nowrap shrink-0 shadow-sm">
          <Clock className="w-3.5 h-3.5 animate-pulse text-[#ff9100]" />
          <span>{tr("Chờ báo giá")}</span>
        </span>
      );
    case 'QUOTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#39FF14]/60 bg-[#39FF14]/15 text-[#39FF14] ring-1 ring-[#39FF14]/30 whitespace-nowrap shrink-0 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>{tr("Đã có báo giá")}</span>
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff] whitespace-nowrap shrink-0 shadow-sm">
          <CreditCard className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>{tr("Chờ thanh toán")}</span>
        </span>
      );
    case 'ACCEPTED':
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14] whitespace-nowrap shrink-0 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>{tr("Đã chấp nhận")}</span>
        </span>
      );
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#39FF14]/50 bg-[#39FF14]/15 text-[#39FF14] whitespace-nowrap shrink-0 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>{tr("Đã thanh toán")}</span>
        </span>
      );
    case 'PREPARING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] whitespace-nowrap shrink-0 shadow-sm">
          <Box className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>{tr("Chuẩn bị phôi in")}</span>
        </span>
      );
    case 'PRINTING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#00e5ff]/60 bg-[#00e5ff]/15 text-[#00e5ff] ring-1 ring-[#00e5ff]/30 whitespace-nowrap shrink-0 shadow-sm">
          <Printer className="w-3.5 h-3.5 text-[#00e5ff] animate-bounce" />
          <span>{tr("Đang in 3D")}</span>
        </span>
      );
    case 'SHIPPING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff] whitespace-nowrap shrink-0 shadow-sm">
          <Truck className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>{tr("Đang giao hàng")}</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-[#39FF14]/60 bg-[#39FF14]/15 text-[#39FF14] whitespace-nowrap shrink-0 shadow-sm">
          <Check className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>{tr("Hoàn thành")}</span>
        </span>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-rose-500/50 bg-rose-500/10 text-rose-400 whitespace-nowrap shrink-0 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{tr("Đã hủy")}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border border-white/10 bg-[#0a0c12] text-slate-300 whitespace-nowrap shrink-0">
          <span>{status}</span>
        </span>
      );
  }
}

/* ========================================================================= */
/* 2. CUSTOM REQUEST FORM (UPLOAD TAB)                                       */
/* ========================================================================= */
/* ========================================================================= */
/* 3. CUSTOM REQUESTS - BEAUTIFIED LISTING PAGE                              */
/* ========================================================================= */
function normalizeQuoteBucket(status?: string, allCustomQuoted?: boolean): 'REQUESTED' | 'QUOTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' {
  const s = (status || '').toUpperCase();
  if (s === 'PENDING_QUOTE') {
    return allCustomQuoted ? 'QUOTED' : 'REQUESTED';
  }
  if (['REQUESTED', 'PENDING'].includes(s)) return 'REQUESTED';
  if (s === 'QUOTED') return 'QUOTED';
  if (['CONFIRMED', 'ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING'].includes(s)) return 'PROCESSING';
  if (s === 'COMPLETED') return 'COMPLETED';
  if (['CANCELLED', 'REJECTED', 'EXPIRED'].includes(s)) return 'CANCELLED';
  return 'REQUESTED';
}

export function CustomRequests({ admin = false, translate: tr = text => text }: { admin?: boolean; translate?: (text: string) => string }) {
  const remote = useRemote<CustomDTO[]>(admin ? '/admin/custom-orders' : '/custom-orders');
  const checkoutRemote = useRemote<CheckoutOrderDTO[]>(
    admin ? '/admin/checkout-orders' : '/checkout-orders/my'
  );
  const reloadAll = () => {
    remote.reload();
    checkoutRemote.reload();
  };
  const action = useAction(reloadAll);
  const [searchParams] = useSearchParams();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const { requestId } = useParams<{ requestId: string }>();
  const detailId = admin ? undefined : requestId;
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [codModalOrder, setCodModalOrder] = useState<{ id: string; nextStatus: string } | null>(null);
  const [quoteError, setQuoteError] = useState<Record<string, string>>({});

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const next = (c: CustomDTO): string | undefined => {
    if (c.allowedActions && c.allowedActions.length > 0) {
      const act = c.allowedActions.find(a => a !== 'CANCEL' && a !== 'QUOTE');
      if (act) {
        switch (act) {
          case 'START_PREPARATION': return 'PREPARING';
          case 'START_PRINTING': return 'PRINTING';
          case 'START_SHIPPING': return 'SHIPPING';
          case 'COMPLETE_DELIVERY': return 'COMPLETED';
          default: return act;
        }
      }
    }
    // Fallback nếu chưa có allowedActions từ server
    if (c.status === 'ACCEPTED') {
      if (c.paymentMethod === 'COD') return 'PREPARING';
      if (c.paymentMethod === 'PAYOS' && (c.paymentStatus === 'SUCCESS' || c.paymentStatus === 'PAID')) return 'PREPARING';
      return undefined;
    }
    if (c.status === 'PAID') return 'PREPARING';
    if (c.status === 'PREPARING') return 'PRINTING';
    if (c.status === 'PRINTING') return 'SHIPPING';
    if (c.status === 'SHIPPING') return 'COMPLETED';
    return undefined;
  };

  const checkoutCustomOrders = useMemo(
    () =>
      (checkoutRemote.data || []).filter(
        co => ((co.customOrderDetails?.length || co.customOrders?.length) ?? 0) > 0
      ),
    [checkoutRemote.data]
  );

  const childIdsInCheckout = useMemo(() => {
    const ids = new Set<string>();
    checkoutCustomOrders.forEach(co => {
      (co.customOrderDetails || co.customOrders || []).forEach(c => ids.add(c.id));
    });
    return ids;
  }, [checkoutCustomOrders]);

  // Filter tabs logic (loại trừ các child đã gộp trong CheckoutOrder để không bị trùng card)
  const allOrders = useMemo(
    () => (remote.data || []).filter(o => !childIdsInCheckout.has(o.id)),
    [remote.data, childIdsInCheckout]
  );

  const counts = useMemo(() => {
    const checkBuckets = checkoutCustomOrders.map(co => normalizeQuoteBucket(co.status, co.allCustomQuoted));
    const singleBuckets = allOrders.map(o => normalizeQuoteBucket(o.status));
    const combined = [...checkBuckets, ...singleBuckets];
    return {
      ALL: combined.length,
      REQUESTED: combined.filter(b => b === 'REQUESTED').length,
      QUOTED: combined.filter(b => b === 'QUOTED').length,
      PROCESSING: combined.filter(b => b === 'PROCESSING').length,
      COMPLETED: combined.filter(b => b === 'COMPLETED').length,
      CANCELLED: combined.filter(b => b === 'CANCELLED').length,
    };
  }, [checkoutCustomOrders, allOrders]);

  const filteredCheckouts = useMemo(() => {
    if (activeFilter === 'ALL') return checkoutCustomOrders;
    return checkoutCustomOrders.filter(co => normalizeQuoteBucket(co.status, co.allCustomQuoted) === activeFilter);
  }, [checkoutCustomOrders, activeFilter]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'ALL') return allOrders;
    return allOrders.filter(o => normalizeQuoteBucket(o.status) === activeFilter);
  }, [allOrders, activeFilter]);

  const visibleCheckout = detailId ? checkoutCustomOrders.find(co => co.id === detailId) : undefined;
  const visibleRequest = detailId && !visibleCheckout ? remote.data?.find(c => c.id === detailId) : undefined;

  const [quotePreviewState, setQuotePreviewState] = useState<{
    key: string;
    data: BenefitPreviewResponse;
  } | null>(null);
  const visibleLineTotal = visibleRequest?.quotedPrice ?? 0;
  const visibleShippingBase =
    visibleRequest?.shippingFee && visibleRequest.shippingFee > 0 ? visibleRequest.shippingFee : 30000;
  const quotePreviewKey =
    !admin && visibleRequest && visibleRequest.status === 'QUOTED' && visibleLineTotal > 0
      ? `${visibleRequest.id}:${visibleLineTotal}:${visibleShippingBase}`
      : '';

  useEffect(() => {
    if (!quotePreviewKey) return;
    let cancelled = false;
    subscriptionService
      .previewBenefits({
        scope: 'CUSTOM',
        itemsSubtotal: visibleLineTotal,
        baseShippingFee: visibleShippingBase,
      })
      .then(data => {
        if (!cancelled) {
          setQuotePreviewState({ key: quotePreviewKey, data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuotePreviewState(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [quotePreviewKey, visibleLineTotal, visibleShippingBase]);

  const activeQuotePreview =
    quotePreviewKey && quotePreviewState?.key === quotePreviewKey ? quotePreviewState.data : null;
  const createdBannerItems = searchParams.get('created') === 'true' ? searchParams.get('items') : null;
  const listLoading = remote.loading || checkoutRemote.loading;
  const hasVisibleItems = filteredCheckouts.length > 0 || filteredOrders.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 px-4 space-y-8 animate-in fade-in duration-300 min-w-0">
      {detailId ? (
        <RecordDetailHeader
          to="/quotations"
          label={tr("Yêu cầu & báo giá")}
          title={
            visibleCheckout
              ? `Đơn gộp #CHK-${visibleCheckout.id.slice(0, 8)}`
              : visibleRequest
                ? `Báo giá #${visibleRequest.id.slice(0, 8)}`
                : tr("Chi tiết báo giá")
          }
        />
      ) : <>
      {/* ========================================================================= */}
      {/* PAGE HEADER & QUICK ACTIONS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-2xl bg-primary/20 border border-primary/40 text-primary shrink-0">
              <Ruler className="w-7 h-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
                {admin ? tr("Quản Trị Báo Giá & Yêu Cầu In 3D") : tr("Báo Giá & Tiến Độ Yêu Cầu In 3D")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
                {admin
                  ? tr("Tiếp nhận tệp thiết kế CAD/STL, báo giá đơn hàng và điều phối tiến độ máy in.")
                  : tr("Theo dõi trực quan tiến độ thẩm định file 3D, báo giá từ xưởng và quy trình gia công.")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={reloadAll}
            disabled={listLoading}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
            title={tr("Tải lại danh sách")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? 'animate-spin text-primary' : ''}`} />
            <span>{tr("Làm mới")}</span>
          </button>

          {!admin && (
            <Link
              to="/custom"
              className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.98] transition flex items-center gap-2 text-xs shadow-lg shadow-primary/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{tr("Thiết kế thước mới")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TABS                                                               */}
      {/* ========================================================================= */}
      <div className="w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full min-w-0 max-w-full">
          {[
            { key: 'ALL', label: 'Tất cả', count: counts.ALL },
            { key: 'REQUESTED', label: 'Chờ báo giá', count: counts.REQUESTED, color: 'text-[#ff9100]' },
            { key: 'QUOTED', label: 'Đã báo giá', count: counts.QUOTED, color: 'text-[#39FF14]' },
            { key: 'PROCESSING', label: 'Đang sản xuất', count: counts.PROCESSING, color: 'text-[#00e5ff]' },
            { key: 'COMPLETED', label: 'Đã hoàn thành', count: counts.COMPLETED, color: 'text-[#39FF14]' },
            { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED, color: 'text-rose-400' },
          ].map(tab => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#39FF14] text-slate-950 shadow-md shadow-[#39FF14]/20'
                    : 'border border-white/10 bg-[#0a0c12] hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                <span>{tr(tab.label)}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive ? 'bg-black/30 text-slate-950' : 'bg-[#040508] text-slate-300 border border-white/5'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Notice error={action.error} />

      {/* Loading state */}
      {listLoading && (
        <div className="p-12 text-center rounded-3xl border border-border bg-surface space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-slate-400">{tr("Đang tải danh sách yêu cầu in 3D...")}</p>
        </div>
      )}

      {/* Empty State */}
      {!listLoading && !hasVisibleItems && (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-border bg-surface space-y-4 max-w-lg mx-auto w-full min-w-0">
          <div className="w-16 h-16 rounded-3xl bg-surface-inset border border-border flex items-center justify-center text-slate-500 mx-auto">
            <Ruler className="w-8 h-8 opacity-40" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-bold text-white break-words">{tr("Chưa có yêu cầu nào trong mục này")}</h2>
            <p className="text-xs text-slate-400 break-words">
              {activeFilter === 'ALL'
                ? tr("Bạn chưa gửi yêu cầu gia công thước in 3D nào. Hãy bắt đầu tạo thước ngay!")
                : tr("Không có đơn in 3D nào khớp với bộ lọc đã chọn.")}
            </p>
          </div>
          {!admin && (
            <Link
              to="/custom"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-primary/20 text-xs"
            >
              <PlusCircle className="w-4 h-4" /> {tr("Mở công cụ thiết kế Thước 3D")} </Link>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIVID & BEAUTIFIED REQUEST CARDS LIST                                      */}
      {/* ========================================================================= */}
      </>}
      {createdBannerItems && (
        <div className="rounded-2xl border border-[#39FF14]/40 bg-[#39FF14]/10 p-4 text-xs sm:text-sm text-slate-100 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
          <span>
            Đã gộp <strong className="text-[#39FF14]">{createdBannerItems} thiết kế custom</strong> vào 1 yêu cầu báo giá duy nhất. Bấm xem chi tiết bên dưới để theo dõi báo giá từng món và thanh toán 1 lần qua PayOS.
          </span>
        </div>
      )}
      {detailId && <Notice error={action.error} />}
      {detailId && (
        <RemoteState
          loading={listLoading}
          error={remote.error || checkoutRemote.error}
          empty={!visibleCheckout && !visibleRequest}
          emptyMessage={tr("Không tìm thấy yêu cầu này.")}
          retry={reloadAll}
        />
      )}
      {!admin && !detailId && hasVisibleItems && (
        <RecordList
          label={tr("Yêu cầu & báo giá")}
          entries={[
            ...filteredCheckouts.map(co => {
              const items = (co.customOrderDetails && co.customOrderDetails.length > 0 ? co.customOrderDetails : co.customOrders) || [];
              const firstName = items[0]?.rulerModel || `Đơn in 3D`;
              const extraCount = items.length > 1 ? ` (+${items.length - 1} thiết kế khác)` : '';
              return {
                id: co.id,
                to: `/quotations/${encodeURIComponent(co.id)}`,
                title: `${firstName}${extraCount}`,
                meta: `#CHK-${co.id.slice(0, 8)} · ${items.length} sản phẩm · ${formatDate(co.createdAt)}`,
                amount: co.totalAmount && co.totalAmount > 0 ? money(co.totalAmount) : undefined,
                status: renderStatusBadge(co.allCustomQuoted && co.status === 'PENDING_QUOTE' ? 'QUOTED' : co.status, tr),
                _ts: Date.parse(co.createdAt || '') || 0,
              };
            }),
            ...filteredOrders.map(c => ({
              id: c.id,
              to: `/quotations/${encodeURIComponent(c.id)}`,
              title: parseOrderRequirements(c.requirements, c).modelName,
              meta: `#${c.id.slice(0, 8)} · ${formatDate(c.createdAt)}`,
              amount: c.quotedPrice == null ? undefined : money(c.quotedPrice),
              status: renderStatusBadge(c.status, tr),
              _ts: Date.parse(c.createdAt || '') || 0,
            })),
          ]
            .sort((a, b) => b._ts - a._ts)
            .map(({ _ts: _unusedTs, ...entry }) => {
              void _unusedTs;
              return entry;
            })}
        />
      )}
      <div className="space-y-6">
        {(admin ? filteredCheckouts : visibleCheckout ? [visibleCheckout] : []).map(co => (
          <CheckoutOrderDetailCard
            key={co.id}
            checkoutOrder={co}
            admin={admin}
            busy={action.busy}
            onRunAction={action.run}
          />
        ))}
        {(admin ? filteredOrders : visibleRequest ? [visibleRequest] : []).map(c => {
          const req = parseOrderRequirements(c.requirements, c);
          const ship = parseShippingAddress(c.shippingAddress, c.buyerName);

          return (
            <div
              key={c.id}
              className="min-w-0 rounded-xl border border-border bg-surface overflow-hidden relative group"
            >
              {/* Subtle neon gradient top accent line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-[#39FF14] via-[#00e5ff] to-[#ff9100] opacity-70 group-hover:opacity-100 transition" />

              <div className="p-5 sm:p-7 space-y-6">
                {/* ------------------------------------------------------------- */}
                {/* A. CARD HEADER: Order ID, Model Name, Time, Status Pill        */}
                {/* ------------------------------------------------------------- */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="p-1.5 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] shrink-0">
                        <Ruler className="w-4 h-4" />
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {req.modelName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#040508] border border-white/10 text-xs font-mono font-bold text-[#39FF14] whitespace-nowrap shrink-0"> {tr("Số lượng: x")}{c.quantity || 1} {tr("cây")} </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <button
                        onClick={() => copyToClipboard(c.id)}
                        className="inline-flex items-center gap-1.5 font-mono text-slate-300 hover:text-white bg-[#040508] px-2.5 py-1 rounded-lg border border-white/10 transition whitespace-nowrap shrink-0"
                        title={tr("Sao chép mã yêu cầu")}
                      >
                        <span className="text-slate-500">{tr("Mã đơn:")}</span>
                        <span>#{c.id.substring(0, 8)}...</span>
                        {copiedId === c.id ? (
                          <Check className="w-3 h-3 text-[#39FF14]" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>

                      {c.createdAt && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDate(c.createdAt)}
                        </span>
                      )}

                      {admin && c.buyerName && (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                          <User className="w-3 h-3 text-[#39FF14]" /> {tr("Khách:")} {c.buyerName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {renderStatusBadge(c.status, tr)}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* B. STRUCTURED GRID: 3 VIVID MODULES                            */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
                  {/* MODULE 1: IN ẤN & THÔNG SỐ KỸ THUẬT */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#040508]/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#39FF14] font-bold text-xs uppercase tracking-wider font-mono">
                        <Layers className="w-4 h-4 text-[#39FF14]" /> {tr("Thông Số Kỹ Thuật 3D")} </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                          <span className="text-slate-400">{tr("Vật liệu in:")}</span>
                          <span className="font-semibold text-white">{req.material}</span>
                        </div>

                        {/* Infill Density Meter */}
                        <div className="space-y-1 pb-1.5 border-b border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">{tr("Độ đặc Infill:")}</span>
                            <span className="font-mono font-bold text-[#39FF14]">{req.infill}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#11141e] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#39FF14] to-[#00e5ff] rounded-full"
                              style={{ width: `${Math.min(100, Math.max(15, req.infillNum))}%` }}
                            />
                          </div>
                        </div>

                        {req.stickersCount && (
                          <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                            <span className="text-slate-400">{tr("Sticker trang trí:")}</span>
                            <span className="font-bold text-[#00e5ff] truncate max-w-[160px]" title={req.stickersCount}>
                              {req.stickersCount}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr("Thanh toán dự kiến:")}</span>
                          <span className="font-mono font-bold text-white bg-[#11141e] px-2 py-0.5 rounded border border-white/10 text-[11px]">
                            {req.preferredPayment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action: Download 3D File vs View Preview Image */}
                    {(() => {
                      let glbUrl: string | null = null;
                      try {
                        if (c.requirements?.startsWith('{')) {
                          const p = JSON.parse(c.requirements);
                          if (p?.glbUrl) glbUrl = p.glbUrl;
                        }
                      } catch {}
                      return (
                        <div className="pt-2 space-y-1.5">
                          {glbUrl && (
                            <a
                              href={glbUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2 px-3 rounded-xl border border-[#39FF14]/40 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] transition flex items-center justify-center gap-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{tr("Mô hình 3D màu (.GLB)")}</span>
                            </a>
                          )}
                      {c.attachmentUrl && (c.attachmentUrl.toLowerCase().includes('.stl') || c.attachmentUrl.toLowerCase().includes('.step') || c.attachmentUrl.toLowerCase().includes('.stp') || c.attachmentUrl.toLowerCase().includes('.obj') || c.attachmentUrl.toLowerCase().includes('/raw/upload/')) ? (
                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={async () => {
                            try {
                              const res = await api.get(`/custom-orders/${c.id}/file`, { responseType: 'blob' });
                              const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              let filename = `PrintHub3D-design-${c.id.slice(0, 8)}.stl`;
                              const disp = res.headers['content-disposition'];
                              if (disp && disp.includes('filename=')) {
                                const parts = disp.split('filename=');
                                if (parts[1]) filename = parts[1].split(';')[0].replace(/['"]/g, '').trim();
                              }
                              a.setAttribute('download', filename);
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(blobUrl);
                            } catch {
                              if (c.attachmentUrl?.startsWith('http')) {
                                window.open(c.attachmentUrl, '_blank');
                              } else if (c.attachmentUrl) {
                                void action.run(() => downloadFile(c.attachmentUrl, `design-${c.id}.stl`));
                              }
                            }
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] transition flex items-center justify-center gap-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{tr("Tải file 3D (.STL)")}</span>
                        </button>
                      ) : c.attachmentUrl && (c.attachmentUrl.toLowerCase().includes('.png') || c.attachmentUrl.toLowerCase().includes('.jpg') || c.attachmentUrl.toLowerCase().includes('.jpeg') || c.attachmentUrl.toLowerCase().includes('.webp') || c.attachmentUrl.toLowerCase().includes('/image/upload/') || c.attachmentUrl.startsWith('data:image/')) ? (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              window.open(c.attachmentUrl, '_blank');
                            }}
                            className="w-full py-2 px-3 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition flex items-center justify-center gap-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{tr("Xem ảnh thiết kế (PNG)")}</span>
                          </button>
                          <p className="text-[10px] text-amber-400/80 text-center italic">
                            {tr("Chưa có file 3D (.stl) — chỉ có ảnh minh họa")}
                          </p>
                        </div>
                      ) : c.attachmentUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            window.open(c.attachmentUrl, '_blank');
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center gap-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{tr("Tải tệp đính kèm")}</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-500 text-center text-xs italic">
                          {tr("Chưa đính kèm tệp")}
                        </div>
                      )}
                    </div>
                  );
                })()}
                  </div>

                  {/* MODULE 2: BẢNG PHỐI MÀU 3 LỚP & KHẮC LASER */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#040508]/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#00e5ff] font-bold text-xs uppercase tracking-wider font-mono">
                        <Palette className="w-4 h-4 text-[#00e5ff]" /> {tr("Bảng Màu & Khắc Laser")} </div>

                      {/* 3-Layer Color Swatches */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">{tr("Bảng màu 3 lớp:")}</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Body Color */}
                          <div className="p-1.5 rounded-lg bg-[#0a0c12] border border-white/10 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.bodyColor }}
                            />
                            <span className="text-[10px] text-slate-400">{tr("Thân")}</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.bodyColor}
                            </span>
                          </div>

                          {/* Plate Color */}
                          <div className="p-1.5 rounded-lg bg-[#0a0c12] border border-white/10 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.plateColor }}
                            />
                            <span className="text-[10px] text-slate-400">{tr("Mặt biển")}</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.plateColor}
                            </span>
                          </div>

                          {/* Text Color */}
                          <div className="p-1.5 rounded-lg bg-[#0a0c12] border border-white/10 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.textColor }}
                            />
                            <span className="text-[10px] text-slate-400">{tr("Chữ số")}</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.textColor}
                            </span>
                          </div>
                        </div>

                        {/* Combined color simulation strip */}
                        <div className="h-2 w-full rounded-full overflow-hidden flex border border-white/10 shadow-inner mt-1">
                          <div className="h-full flex-[5]" style={{ backgroundColor: req.bodyColor }} />
                          <div className="h-full flex-[3]" style={{ backgroundColor: req.plateColor }} />
                          <div className="h-full flex-[2]" style={{ backgroundColor: req.textColor }} />
                        </div>
                      </div>

                      {/* Laser Engraving Plate */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">{tr("Khắc laser cá nhân hóa:")}</span>
                        {req.engraveName || req.studentId ? (
                          <div className="p-2.5 rounded-xl border border-[#ff9100]/40 bg-[#ff9100]/10 font-mono text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#ff9100] tracking-wide text-sm">
                                {req.engraveName}
                              </span>
                              {req.studentId && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ff9100]/20 text-amber-200 border border-[#ff9100]/30 whitespace-nowrap shrink-0"> {tr("MSSV:")} {req.studentId}
                                </span>
                              )}
                            </div>
                            {req.fontName && (
                              <p className="text-[10px] text-amber-400/80 font-mono"> {tr("Kiểu chữ:")} {req.fontName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-500 text-xs italic text-center"> {tr("Không yêu cầu khắc laser")} </div>
                        )}
                      </div>
                    </div>

                    {req.notes && (
                      <div className="pt-2 text-[11px] text-slate-300 italic bg-[#0a0c12] p-2 rounded-lg border border-white/10">
                        <strong className="text-slate-400 not-italic">{tr("Ghi chú:")}</strong> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* MODULE 3: ĐỊA CHỈ GIAO HÀNG & TIẾN TRÌNH */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#040508]/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#39FF14] font-bold text-xs uppercase tracking-wider font-mono">
                        <MapPin className="w-4 h-4 text-[#39FF14]" /> {tr("Địa Chỉ Nhận Hàng")} </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl border border-white/10 bg-[#0a0c12] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#39FF14]" /> {ship.recipient}
                            </span>
                            {ship.phone && (
                              <span className="text-slate-300 font-mono bg-[#040508] px-2 py-0.5 rounded border border-white/10 text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                                <Phone className="w-2.5 h-2.5 text-[#39FF14]" /> {ship.phone}
                              </span>
                            )}
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed pt-1">
                            {ship.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Checklist */}
                    <div className="space-y-1 text-[11px] text-slate-400 pt-2">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                        <span>{tr("Chính sách: Miễn phí in lại nếu có lỗi kích thước/gãy vỡ do vận chuyển.")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* C. QUOTATION & PAYMENT BANNER (DYNAMIC BY STATUS)              */}
                {/* ------------------------------------------------------------- */}

                {/* 1. STATUS: REQUESTED (Chờ báo giá) */}
                {['REQUESTED', 'PENDING'].includes(c.status) && (
                  <div className="rounded-2xl border border-[#ff9100]/40 bg-gradient-to-r from-[#ff9100]/10 via-[#0a0c12] to-[#ff9100]/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#ff9100]/20 border border-[#ff9100]/40 flex items-center justify-center text-[#ff9100] shrink-0 mt-0.5">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#ff9100]"> {tr("Xưởng PrintHub 3D đang phân tích file STL & thẩm định báo giá")} </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed"> {tr("Kỹ thuật viên đang kiểm tra thông số cắt lớp (slicing), độ mịn lớp in 0.16mm và khối lượng nhựa PLA. Báo giá chính xác kèm thời gian bàn giao sẽ xuất hiện tại đây!")} </p>
                      </div>
                    </div>

                    {!admin && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => setCancelModalOrderId(c.id)}
                        className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 transition text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {tr("Hủy yêu cầu")} </button>
                    )}
                  </div>
                )}

                {/* 2. STATUS: QUOTED (Đã có báo giá từ Admin) */}
                {c.status === 'QUOTED' && (
                  <div className="rounded-2xl border-2 border-[#39FF14]/60 bg-gradient-to-r from-[#39FF14]/10 via-[#0a0c12] to-[#39FF14]/5 p-4 sm:p-5 shadow-lg shadow-[#39FF14]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 whitespace-nowrap shrink-0"> {tr("Báo giá chi tiết")} </span>
                        <span className="text-xs text-slate-300 font-mono">
                          {c.unitQuotedPrice && c.unitQuotedPrice > 0
                            ? `${money(c.unitQuotedPrice)} / chiếc × ${c.quantity || 1} sản phẩm`
                            : `${tr("Cho")} ${c.quantity || 1} ${tr("sản phẩm hoàn thiện")}`}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-3xl sm:text-4xl font-black text-[#39FF14] font-mono tracking-tight ">
                          {money(c.quotedPrice || 0)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">(chưa gồm phí ship nếu đặt kèm giao hàng)</span>
                      </div>
                      {c.quoteNote && (
                        <p className="text-xs text-cyan-200 bg-cyan-950/30 border border-cyan-500/20 rounded-lg px-2.5 py-1.5">
                          <strong className="text-cyan-400 font-mono">Ghi chú xưởng:</strong> {c.quoteNote}
                        </p>
                      )}
                      {!admin && visibleRequest?.id === c.id && activeQuotePreview?.hasActiveSubscription && (
                        <div className="mt-2 rounded-xl border border-[#39FF14]/40 bg-[#040508]/90 p-3 space-y-1.5 text-xs font-mono">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[#39FF14] font-bold flex items-center gap-1.5 font-sans">
                              <Sparkles className="w-3.5 h-3.5" />
                              Ưu đãi hội viên: {activeQuotePreview.planName || 'Gói VIP'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {activeQuotePreview.discountAmount > 0 && (
                                <span className="px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] text-[10px] font-bold">
                                  -{activeQuotePreview.discountPercent}%
                                </span>
                              )}
                              {activeQuotePreview.priorityProduction && (
                                <span className="px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 text-[10px] font-bold">
                                  Ưu tiên sản xuất
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Giá báo của xưởng:</span>
                            <span className="text-white">{money(c.quotedPrice || 0)}</span>
                          </div>
                          {activeQuotePreview.discountAmount > 0 && (
                            <div className="flex justify-between text-[#39FF14]">
                              <span>Giảm hội viên:</span>
                              <span>-{money(activeQuotePreview.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-300">
                            <span>
                              Phí vận chuyển
                              {activeQuotePreview.freeShippingUsesLimit != null
                                ? ` (Còn ${activeQuotePreview.remainingFreeShippingUses ?? 0}/${activeQuotePreview.freeShippingUsesLimit} lượt)`
                                : ''}
                              :
                            </span>
                            <span className={activeQuotePreview.shippingDiscountAmount > 0 ? 'text-[#39FF14] font-bold' : 'text-white'}>
                              {activeQuotePreview.shippingDiscountAmount > 0
                                ? activeQuotePreview.finalShippingFee === 0
                                  ? 'Miễn phí (0đ)'
                                  : money(activeQuotePreview.finalShippingFee)
                                : money(activeQuotePreview.finalShippingFee)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-sm">
                            <span className="text-white font-bold font-sans">Tổng cần thanh toán dự kiến:</span>
                            <span className="text-[#39FF14] font-black">{money(activeQuotePreview.finalTotal)}</span>
                          </div>
                          {activeQuotePreview.ineligibleReason && (
                            <p className="text-[11px] text-amber-300 font-sans">{activeQuotePreview.ineligibleReason}</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-300"> {tr("Đã bao gồm: Vật liệu sợi in PLA Pro+, gia công in FDM độ chính xác cao và khắc laser tên/MSSV.")} </p>
                    </div>

                    {!admin && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-[#040508] border border-[#39FF14]/30 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#39FF14]">
                          <CreditCard className="w-4 h-4 text-[#39FF14] shrink-0" />
                          <span>{tr("Thanh toán PayOS (VietQR)")}</span>
                        </div>

                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              send(
                                `/custom-orders/${c.id}/status`,
                                { status: 'ACCEPTED', paymentMethod: 'PAYOS' },
                                'put'
                              )
                            )
                          }
                          className="px-6 py-3 rounded-xl bg-[#39FF14] text-slate-950 font-black hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 text-xs uppercase tracking-tight shadow-xl shadow-[#39FF14]/25 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{tr("Chấp Nhận & Thanh Toán PayOS")}</span>
                        </button>

                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() => setCancelModalOrderId(c.id)}
                          className="px-3.5 py-3 rounded-xl border border-white/10 hover:border-rose-500/60 bg-[#040508] text-slate-400 hover:text-rose-300 transition text-xs whitespace-nowrap shrink-0 cursor-pointer"
                          title={tr("Hủy yêu cầu")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STATUS: ACCEPTED & PAYOS (Cần thanh toán trước) */}
                {c.status === 'ACCEPTED' && c.paymentMethod === 'PAYOS' && (() => {
                  const snapSub = c.subtotalAmount ?? c.quotedPrice ?? 0;
                  const snapDisc = c.discountAmount ?? 0;
                  const snapShip = c.shippingFee ?? 0;
                  const snapShipDisc = c.shippingDiscountAmount ?? 0;
                  const finalNet =
                    c.subtotalAmount != null
                      ? Math.max(0, snapSub - snapDisc) + Math.max(0, snapShip - snapShipDisc)
                      : c.quotedPrice || 0;
                  const hasSnapBenefit =
                    snapDisc > 0 || snapShipDisc > 0 || !!c.appliedSubscriptionName || !!c.priorityProduction;
                  return (
                    <div className="rounded-2xl border border-[#39FF14]/40 bg-[#39FF14]/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14] shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white"> {tr("Đơn hàng đã được duyệt — Cần hoàn tất thanh toán VietQR PayOS")} </h3>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {' '}{tr("Số tiền:")}{' '}
                            <strong className="text-[#39FF14] font-mono">{money(finalNet)}</strong>
                            {tr(". Sau khi quét mã QR thanh toán thành công, máy in sẽ được tự động kích hoạt.")}{' '}
                          </p>
                          {hasSnapBenefit && (
                            <p className="text-[11px] font-mono text-slate-300">
                              Giá gốc: {money(snapSub)}
                              {snapDisc > 0 ? ` · Giảm hội viên (${c.appliedSubscriptionName || 'VIP'}): -${money(snapDisc)}` : ''}
                              {snapShip > 0 ? ` · Ship: ${money(Math.max(0, snapShip - snapShipDisc))}` : ''}
                              {c.priorityProduction ? ' · Ưu tiên sản xuất' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {!admin && (
                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() => void action.run(() => payOrder(c.id, 'CUSTOM_ORDER'))}
                          className="px-6 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 text-xs uppercase tracking-tight shadow-lg shadow-[#39FF14]/25 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>{tr("Thanh toán ngay")}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* 4. STATUS: PRINTING / SHIPPING / COMPLETED (Hiển thị thanh tiến độ sản xuất) */}
                {['PRINTING', 'SHIPPING', 'COMPLETED'].includes(c.status) && (
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#040508]/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-2">
                        {c.status === 'PRINTING' && <Printer className="w-4 h-4 text-[#00e5ff] animate-spin-slow" />}
                        {c.status === 'SHIPPING' && <Truck className="w-4 h-4 text-[#00e5ff]" />}
                        {c.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />} {tr("Tiến độ sản xuất & Bàn giao:")} </span>
                      {(() => {
                        const snapSub = c.subtotalAmount ?? c.quotedPrice ?? 0;
                        const snapDisc = c.discountAmount ?? 0;
                        const snapShip = c.shippingFee ?? 0;
                        const snapShipDisc = c.shippingDiscountAmount ?? 0;
                        const netPaid =
                          c.subtotalAmount != null
                            ? Math.max(0, snapSub - snapDisc) + Math.max(0, snapShip - snapShipDisc)
                            : c.quotedPrice;
                        return netPaid != null ? (
                          <span className="text-[#39FF14] font-mono font-bold">
                            {' '}{tr("Giá chốt:")} {money(netPaid)} ({c.paymentMethod})
                            {snapDisc > 0 ? ` · Đã giảm ${money(snapDisc)}` : ''}
                            {c.priorityProduction ? ' · Ưu tiên in' : ''}
                          </span>
                        ) : null;
                      })()}
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] font-bold"> {tr("1. Đã duyệt file")} </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          ['PRINTING', 'SHIPPING', 'COMPLETED'].includes(c.status)
                            ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff] ring-1 ring-[#00e5ff]/30'
                            : 'bg-[#0a0c12] border-white/5 text-slate-500'
                        }`}
                      > {tr("2. Đang in 3D")} </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          ['SHIPPING', 'COMPLETED'].includes(c.status)
                            ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff] ring-1 ring-[#00e5ff]/30'
                            : 'bg-[#0a0c12] border-white/5 text-slate-500'
                        }`}
                      > {tr("3. Đang giao hàng")} </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          c.status === 'COMPLETED'
                            ? 'bg-[#39FF14]/15 border-[#39FF14]/50 text-[#39FF14] ring-1 ring-[#39FF14]/30'
                            : 'bg-[#0a0c12] border-white/5 text-slate-500'
                        }`}
                      > {tr("4. Hoàn tất")} </div>
                    </div>
                  </div>
                )}

                {c.status === 'CANCELLED' && (
                  <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        {(c.cancelledByRole || '').toUpperCase() === 'ADMIN'
                          ? tr('Xưởng đã hủy yêu cầu báo giá này')
                          : tr('Yêu cầu đặt in đã bị hủy')}
                      </span>
                    </div>
                    <p className="text-rose-200/90 pl-6">
                      {tr('Lý do:')}{' '}
                      <span className="font-semibold text-white">
                        {c.cancelReason || tr('Không có lý do chi tiết')}
                      </span>
                    </p>
                    {c.cancelledAt && (
                      <p className="text-[11px] font-mono text-rose-300/70 pl-6">
                        {tr('Thời điểm hủy:')} {formatDateTime(c.cancelledAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* D. ADMIN CONTROLS TOOLBAR                                     */}
                {/* ------------------------------------------------------------- */}
                {admin && (
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#040508]/60 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-[#ff9100] flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-4 h-4 text-[#ff9100]" /> {tr("Bảng điều khiển quản trị viên xưởng:")} </div>

                    {['REQUESTED', 'QUOTED'].includes(c.status) && (
                      <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const p = Number(prices[c.id]);
                          if (!p || p <= 0) {
                            setQuoteError(prev => ({ ...prev, [c.id]: 'Vui lòng nhập đơn giá hợp lệ (> 0 VNĐ).' }));
                            return;
                          }
                          setQuoteError(prev => ({ ...prev, [c.id]: '' }));
                          const noteVal = notes[c.id]?.trim() ? notes[c.id].trim() : undefined;
                          void action.run(() =>
                            send(`/admin/custom-orders/${c.id}/quote`, { unitPrice: p, price: p, note: noteVal }, 'put')
                          );
                        }}
                      >
                        <input
                          type="number"
                          min={1}
                          step={1000}
                          required
                          placeholder="Đơn giá / 1 chiếc (VND)"
                          value={prices[c.id] ?? (c.unitQuotedPrice ? String(c.unitQuotedPrice) : '')}
                          onChange={e => setPrices({ ...prices, [c.id]: e.target.value })}
                          className="rounded-xl border border-white/10 bg-[#0a0c12] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono w-48"
                        />
                        <input
                          type="text"
                          maxLength={500}
                          placeholder="Ghi chú kỹ thuật (tùy chọn)"
                          value={notes[c.id] ?? (c.quoteNote || '')}
                          onChange={e => setNotes({ ...notes, [c.id]: e.target.value })}
                          className="rounded-xl border border-white/10 bg-[#0a0c12] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-52"
                        />
                        {Number(prices[c.id] ?? c.unitQuotedPrice ?? 0) > 0 && (
                          <span className="text-[11px] font-mono text-slate-300">
                            × {c.quantity || 1} = <strong className="text-[#39FF14]">{money(Number(prices[c.id] ?? c.unitQuotedPrice ?? 0) * (c.quantity || 1))}</strong>
                          </span>
                        )}
                        <button
                          type="submit"
                          disabled={action.busy}
                          className="px-4 py-1.5 rounded-xl bg-[#39FF14] text-slate-950 text-xs font-bold hover:brightness-110 transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                        > {tr("Gửi báo giá")} </button>
                        {quoteError[c.id] && (
                          <span className="text-[11px] text-rose-400 font-semibold block w-full">{quoteError[c.id]}</span>
                        )}
                      </form>
                    )}

                    {next(c) && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => {
                          const n = next(c);
                          if (!n) return;
                          if (c.paymentMethod === 'COD' && n === 'COMPLETED') {
                            setCodModalOrder({ id: c.id, nextStatus: n });
                            return;
                          }
                          void action.run(() =>
                            send(`/custom-orders/${c.id}/status`, { status: n }, 'put')
                          );
                        }}
                        className="px-4 py-1.5 rounded-xl border border-[#39FF14]/50 bg-[#39FF14]/15 text-[#39FF14] text-xs font-bold hover:bg-[#39FF14]/25 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <span>{tr("Chuyển sang:")} {next(c)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!next(c) && c.status === 'ACCEPTED' && c.paymentMethod === 'PAYOS' && c.paymentStatus !== 'SUCCESS' && (
                      <span className="px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        Chờ khách quét mã PayOS
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impeccable P4: Cancel Custom Order ConfirmDialog */}
      <ConfirmDialog
        open={!!cancelModalOrderId}
        onClose={() => setCancelModalOrderId(null)}
        onConfirm={async () => {
          if (!cancelModalOrderId) return;
          const id = cancelModalOrderId;
          setCancelModalOrderId(null);
          await action.run(() => send(`/custom-orders/${id}/status`, { status: 'CANCELLED' }, 'put'));
        }}
        title="Xác nhận hủy yêu cầu đặt in"
        description="Bạn có chắc chắn muốn hủy yêu cầu đặt in này? Thao tác này không thể hoàn tác."
        confirmText="Hủy yêu cầu"
        variant="danger"
        busy={action.busy}
      />

      {/* Impeccable P4: COD Completion ConfirmDialog */}
      <ConfirmDialog
        open={!!codModalOrder}
        onClose={() => setCodModalOrder(null)}
        onConfirm={async () => {
          if (!codModalOrder) return;
          const { id, nextStatus } = codModalOrder;
          setCodModalOrder(null);
          await action.run(() => send(`/custom-orders/${id}/status`, { status: nextStatus }, 'put'));
        }}
        title="Xác nhận giao hàng & Thu tiền COD"
        description="Xác nhận bạn đã giao thành công sản phẩm in 3D và đã thu đủ tiền mặt COD từ khách hàng?"
        confirmText="Xác nhận hoàn thành"
        variant="primary"
        busy={action.busy}
      />
    </div>
  );
}
