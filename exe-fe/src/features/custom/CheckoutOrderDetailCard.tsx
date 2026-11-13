import { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  Layers,
  MapPin,
  Package,
  Phone,
  Printer,
  QrCode,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  X,
} from 'lucide-react';
import api from '../../services/api';
import checkoutOrderService, { type CheckoutOrderDTO } from '../../services/checkoutOrderService';
import quotationService, { type CustomDTO } from '../../services/quotationService';
import subscriptionService, { type BenefitPreviewResponse } from '../../services/subscriptionService';
import { payOrder } from '../../services/paymentService';
import { downloadFile } from '../../services/fileVaultService';
import RulerSpecsViewer from '../../components/RulerSpecsViewer';
import Modal from '../../components/Modal';
import { Modal3DViewer } from '../ruler-studio/Modal3DViewer';
import type { Design } from '../ruler-studio/model';
import { money, formatDateTime } from '../../utils/format';
import { Status } from '../../components/DataUI';

interface CheckoutOrderDetailCardProps {
  checkoutOrder: CheckoutOrderDTO;
  admin?: boolean;
  busy?: boolean;
  onRunAction: (fn: () => Promise<unknown>) => Promise<unknown>;
}

interface ChildDesignMeta {
  glbUrl: string | null;
  previewImageUrl: string | null;
  design: Design | null;
}

function extractDesignMeta(c: CustomDTO): ChildDesignMeta {
  if (!c.requirements || !c.requirements.trim().startsWith('{')) {
    return { glbUrl: null, previewImageUrl: null, design: null };
  }
  try {
    const p = JSON.parse(c.requirements) as Partial<Design> & {
      glbUrl?: string;
      previewImageUrl?: string;
      screenshotUrl?: string;
      imageUrl?: string;
    };
    return {
      glbUrl: p.glbUrl || null,
      previewImageUrl: p.previewImageUrl || p.screenshotUrl || p.imageUrl || null,
      design: p.rulerId ? (p as Design) : null,
    };
  } catch {
    return { glbUrl: null, previewImageUrl: null, design: null };
  }
}

function is3DModelUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.stl') ||
    lower.includes('.step') ||
    lower.includes('.stp') ||
    lower.includes('.obj') ||
    lower.includes('/raw/upload/')
  );
}

function isImageUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.png') ||
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('.webp') ||
    lower.includes('/image/upload/') ||
    lower.startsWith('data:image/')
  );
}

function resolveUnitQuotedPrice(item: CustomDTO): number {
  if (item.unitQuotedPrice != null && item.unitQuotedPrice > 0) {
    return item.unitQuotedPrice;
  }
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  if (item.quotedPrice != null && item.quotedPrice > 0) {
    return Math.round(item.quotedPrice / qty);
  }
  return 0;
}

function resolveLineTotal(item: CustomDTO): number {
  if (item.quotedPrice != null && item.quotedPrice > 0) {
    return item.quotedPrice;
  }
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  if (item.unitQuotedPrice != null && item.unitQuotedPrice > 0) {
    return item.unitQuotedPrice * qty;
  }
  return 0;
}

export default function CheckoutOrderDetailCard({
  checkoutOrder: co,
  admin = false,
  busy = false,
  onRunAction,
}: CheckoutOrderDetailCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [priceEdits, setPriceEdits] = useState<{ key: string; map: Record<string, string> }>({ key: '', map: {} });
  const [noteEdits, setNoteEdits] = useState<{ key: string; map: Record<string, string> }>({ key: '', map: {} });
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});
  const [batchQuoteError, setBatchQuoteError] = useState<string>('');
  const [previewDesign, setPreviewDesign] = useState<{ design: Design; name: string } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const items: CustomDTO[] = (co.customOrderDetails && co.customOrderDetails.length > 0
    ? co.customOrderDetails
    : co.customOrders) || [];

  const syncKey = `${co.id}:${co.summaryVersion ?? ''}:${items
    .map(i => `${i.id}:${i.unitQuotedPrice ?? ''}:${i.quotedPrice ?? ''}:${i.quoteNote ?? ''}`)
    .join('|')}`;

  const getPriceInput = (item: CustomDTO): string => {
    if (priceEdits.key === syncKey && priceEdits.map[item.id] !== undefined) {
      return priceEdits.map[item.id];
    }
    const unitVal = resolveUnitQuotedPrice(item);
    return unitVal > 0 ? String(unitVal) : '';
  };

  const getNoteInput = (item: CustomDTO): string => {
    if (noteEdits.key === syncKey && noteEdits.map[item.id] !== undefined) {
      return noteEdits.map[item.id];
    }
    return item.quoteNote || '';
  };

  const updatePriceInput = (itemId: string, val: string) => {
    setBatchQuoteError('');
    setPriceEdits(prev => ({
      key: syncKey,
      map: { ...(prev.key === syncKey ? prev.map : {}), [itemId]: val },
    }));
  };

  const updateNoteInput = (itemId: string, val: string) => {
    setNoteEdits(prev => ({
      key: syncKey,
      map: { ...(prev.key === syncKey ? prev.map : {}), [itemId]: val },
    }));
  };

  const activeItems = items.filter(i => (i.status || '').toUpperCase() !== 'CANCELLED');
  const quotableActiveItems = activeItems.filter(i =>
    ['REQUESTED', 'QUOTED'].includes((i.status || '').toUpperCase())
  );

  // Backend đã tính quotedPrice = lineTotal (= unitQuotedPrice * quantity), không nhân đôi quantity ở FE
  const computedItemsSubtotal =
    co.itemsSubtotal != null && co.itemsSubtotal > 0
      ? co.itemsSubtotal
      : activeItems.reduce((sum, item) => sum + resolveLineTotal(item), 0);

  const shippingFeeDisplay = co.shippingFee && co.shippingFee > 0 ? co.shippingFee : 30000;
  const isParentQuotable = ['PENDING_QUOTE', 'QUOTED'].includes((co.status || '').toUpperCase());
  const isBatchQuotable = admin && isParentQuotable && quotableActiveItems.length > 0;

  const [coPreviewState, setCoPreviewState] = useState<{
    key: string;
    data: BenefitPreviewResponse;
  } | null>(null);
  const previewScope: 'CUSTOM' | 'MIXED' | 'MARKETPLACE' =
    co.orderType === 'MIXED' ? 'MIXED' : co.orderType === 'MARKETPLACE' ? 'MARKETPLACE' : 'CUSTOM';
  const shouldPreviewBenefits = !admin && co.readyForConfirm && computedItemsSubtotal > 0;
  const coPreviewKey = shouldPreviewBenefits
    ? `${co.id}:${co.summaryVersion}:${previewScope}:${computedItemsSubtotal}:${shippingFeeDisplay}`
    : '';

  useEffect(() => {
    if (!coPreviewKey) return;
    let cancelled = false;
    subscriptionService
      .previewBenefits({
        scope: previewScope,
        itemsSubtotal: computedItemsSubtotal,
        baseShippingFee: shippingFeeDisplay,
      })
      .then(data => {
        if (!cancelled) {
          setCoPreviewState({ key: coPreviewKey, data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCoPreviewState(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [coPreviewKey, previewScope, computedItemsSubtotal, shippingFeeDisplay]);

  const coPreview = coPreviewKey && coPreviewState?.key === coPreviewKey ? coPreviewState.data : null;
  const hasServerBenefitSnapshot =
    (co.discountAmount ?? 0) > 0 ||
    (co.shippingDiscountAmount ?? 0) > 0 ||
    !!co.appliedSubscriptionName ||
    !!co.priorityProduction;

  const draftItemsSubtotal = activeItems.reduce((sum, item) => {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const rawUnit = getPriceInput(item);
    const parsedUnit = rawUnit !== '' ? Number(rawUnit) : resolveUnitQuotedPrice(item);
    if (parsedUnit > 0) {
      return sum + parsedUnit * qty;
    }
    return sum + resolveLineTotal(item);
  }, 0);

  const handleBatchQuoteSubmit = () => {
    const missing = quotableActiveItems.filter(i => {
      const val = Number(getPriceInput(i));
      return !val || val <= 0;
    });
    if (missing.length > 0) {
      setBatchQuoteError(
        `Vui lòng nhập đầy đủ đơn giá (> 0 VNĐ) cho tất cả ${quotableActiveItems.length} sản phẩm trước khi gửi báo giá toàn đơn.`
      );
      return;
    }
    setBatchQuoteError('');
    const payload = quotableActiveItems.map(i => {
      const n = getNoteInput(i).trim();
      return {
        customOrderId: i.id,
        unitPrice: Number(getPriceInput(i)),
        note: n || undefined,
      };
    });
    void onRunAction(() => checkoutOrderService.batchQuoteCheckoutOrder(co.id, payload));
  };

  const nextAdminAction = (): { action: string; nextStatus: string; label: string } | null => {
    const acts = co.allowedActions || [];
    if (acts.includes('START_PREPARATION')) {
      return { action: 'START_PREPARATION', nextStatus: 'PREPARING', label: 'Chuẩn bị phôi in (PREPARING)' };
    }
    if (acts.includes('START_PRINTING')) {
      return { action: 'START_PRINTING', nextStatus: 'PRINTING', label: 'Bắt đầu in 3D (PRINTING)' };
    }
    if (acts.includes('START_SHIPPING')) {
      return { action: 'START_SHIPPING', nextStatus: 'SHIPPING', label: 'Chuyển giao hàng (SHIPPING)' };
    }
    if (acts.includes('COMPLETE_DELIVERY')) {
      return { action: 'COMPLETE_DELIVERY', nextStatus: 'COMPLETED', label: 'Hoàn tất đơn hàng (COMPLETED)' };
    }
    return null;
  };

  const forwardAct = admin ? nextAdminAction() : null;
  const blockedPayment = (co.blockedActions || []).find(b => b.reasonCode === 'PAYMENT_REQUIRED');

  const handleCopyId = () => {
    navigator.clipboard.writeText(co.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleConfirmAndPay = () =>
    onRunAction(async () => {
      const confirmed = await checkoutOrderService.confirmCheckoutOrder(co.id, co.summaryVersion || 1);
      if (confirmed.paymentLinkUrl) {
        window.location.assign(confirmed.paymentLinkUrl);
        return;
      }
      await payOrder(co.id, 'CHECKOUT_ORDER');
    });

  const handlePayNow = () =>
    onRunAction(async () => {
      if (co.paymentLinkUrl) {
        try {
          const url = new URL(co.paymentLinkUrl);
          if (url.protocol === 'https:') {
            window.location.assign(url.href);
            return;
          }
        } catch {
          // fallback to create fresh link
        }
      }
      await payOrder(co.id, 'CHECKOUT_ORDER');
    });

  const handleDownloadStl = async (c: CustomDTO) => {
    try {
      const res = await api.get(`/custom-orders/${c.id}/file`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      let filename = `PrintHub3D-${c.id.slice(0, 8)}.stl`;
      const disp = res.headers['content-disposition'];
      if (disp && disp.includes('filename=')) {
        const parts = disp.split('filename=');
        if (parts[1]) filename = parts[1].split(';')[0].replace(/['"]/g, '').trim();
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      if (c.attachmentUrl?.startsWith('http')) {
        window.open(c.attachmentUrl, '_blank');
      } else if (c.attachmentUrl) {
        await onRunAction(() => downloadFile(c.attachmentUrl, `design-${c.id.slice(0, 8)}.stl`));
      }
    }
  };

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0a0c12] overflow-hidden shadow-xl space-y-5 p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-[11px] font-mono font-extrabold">
              <Layers className="w-3.5 h-3.5" />
              ĐƠN GỘP {items.length} THIẾT KẾ
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-white bg-[#040508] px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#39FF14]/40 transition cursor-pointer"
              title="Sao chép mã đơn cha"
            >
              <span>#CHK-{co.id.slice(0, 8)}</span>
              {copiedId ? <Check className="w-3.5 h-3.5 text-[#39FF14]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDateTime(co.createdAt)}
            </span>
            {(co.buyerName || co.recipientName) && (
              <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                <User className="w-3.5 h-3.5 text-[#39FF14]" />
                {co.recipientName || co.buyerName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Status value={co.status} />
        </div>
      </div>

      {/* Shipping & Payment summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/10 bg-[#040508]/70 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 font-mono font-bold text-[#39FF14]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Thông tin nhận hàng</span>
          </div>
          <div className="pl-6 space-y-1 text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white">{co.recipientName || co.buyerName || 'Khách hàng'}</span>
              {co.recipientPhone && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0c12] border border-white/10 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-[#39FF14]" />
                  {co.recipientPhone}
                </span>
              )}
            </div>
            <p className="leading-relaxed text-slate-300">{co.shippingAddress}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#040508]/70 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 font-mono font-bold text-[#ff9100]">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Thanh toán đơn gộp</span>
          </div>
          <div className="pl-6 space-y-1.5 text-slate-300">
            <p className="flex items-center gap-1.5">
              <span>Hình thức:</span>
              <strong className="text-white inline-flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-[#39FF14]" />
                PayOS (VietQR — Chỉ thanh toán 1 lần cho cả đơn)
              </strong>
            </p>
            <div className="flex items-center gap-2">
              <span>Trạng thái:</span>
              <Status value={co.paymentStatus || (co.status === 'PAID' ? 'PAID' : 'PENDING')} />
            </div>
          </div>
        </div>
      </div>

      {/* Child Custom Items Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#39FF14]" />
            <span>Chi tiết {items.length} sản phẩm in custom trong đơn</span>
          </h3>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const meta = extractDesignMeta(item);
            const hasStl = is3DModelUrl(item.attachmentUrl);
            const hasImg = isImageUrl(item.attachmentUrl);
            const previewUrl = meta.previewImageUrl || (hasImg ? item.attachmentUrl : null);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-[#040508]/80 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-2.5 border-b border-white/10">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px] font-bold text-slate-300">
                        #{idx + 1}/{items.length}
                      </span>
                      <Ruler className="w-4 h-4 text-[#39FF14] shrink-0" />
                      <h4 className="font-bold text-sm text-white break-words">
                        {item.rulerModel || `Thiết kế 3D #${idx + 1}`}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[#0a0c12] border border-white/10 font-mono text-xs font-bold text-[#39FF14]">
                        x{item.quantity || 1}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono">Mã dòng: #{item.id.slice(0, 8)}</span>
                      {item.customName && (
                        <span>
                          · Khắc tên: <strong className="text-amber-300">{item.customName}</strong>
                        </span>
                      )}
                      {item.customStudentId && (
                        <span>
                          · MSSV: <strong className="text-amber-200">{item.customStudentId}</strong>
                        </span>
                      )}
                      {item.color && (
                        <span>
                          · Màu: <strong className="text-slate-200">{item.color}</strong>
                        </span>
                      )}
                      {item.fontStyle && (
                        <span>
                          · Font: <strong className="text-slate-200">{item.fontStyle}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Status value={item.status} />
                    <div className="text-right space-y-0.5">
                      {(() => {
                        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
                        const unitVal = resolveUnitQuotedPrice(item);
                        const lineVal = resolveLineTotal(item);
                        if (lineVal > 0) {
                          return (
                            <>
                              {unitVal > 0 && (
                                <span className="text-[11px] font-mono text-slate-400 block">
                                  Đơn giá: <strong className="text-slate-200">{money(unitVal)}</strong> × {qty}
                                </span>
                              )}
                              <span className="font-mono font-bold text-sm text-[#39FF14] block">
                                Thành tiền: {money(lineVal)}
                              </span>
                            </>
                          );
                        }
                        return (
                          <>
                            <span className="text-[10px] font-mono text-slate-400 block">Báo giá</span>
                            <span className="font-mono font-bold text-sm text-[#39FF14]">Chờ báo giá</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {item.quoteNote && (
                  <div className="px-3 py-2 rounded-lg bg-[#0a0c12] border border-cyan-500/20 text-xs text-cyan-200">
                    <span className="font-mono font-bold text-cyan-400 mr-1.5">Ghi chú xưởng:</span>
                    <span>{item.quoteNote}</span>
                  </div>
                )}

                {/* Files & 3D View */}
                <div className="flex flex-wrap items-center gap-2">
                  {meta.design && (
                    <button
                      type="button"
                      onClick={() => setPreviewDesign({ design: meta.design!, name: item.rulerModel || 'Thước 3D' })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[#39FF14] text-xs font-mono font-bold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem 3D trực quan
                    </button>
                  )}
                  {meta.glbUrl && (
                    <a
                      href={meta.glbUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[#00e5ff] text-xs font-mono font-bold transition"
                    >
                      <Download className="w-3.5 h-3.5" /> File 3D (.GLB)
                    </a>
                  )}
                  {hasStl && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleDownloadStl(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải file in (.STL)
                    </button>
                  )}
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewImageUrl(previewUrl)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Xem ảnh preview
                    </button>
                  )}
                </div>

                {item.requirements && <RulerSpecsViewer requirements={item.requirements} />}

                {/* Admin inline quote control per item */}
                {admin && ['REQUESTED', 'QUOTED'].includes((item.status || '').toUpperCase()) && (
                  <form
                    className="space-y-2.5 pt-2.5 border-t border-white/10"
                    onSubmit={e => {
                      e.preventDefault();
                      const val = Number(getPriceInput(item));
                      if (!val || val <= 0) {
                        setQuoteErrors(prev => ({ ...prev, [item.id]: 'Vui lòng nhập đơn giá hợp lệ (> 0 VNĐ).' }));
                        return;
                      }
                      setQuoteErrors(prev => ({ ...prev, [item.id]: '' }));
                      const noteVal = getNoteInput(item);
                      void onRunAction(() => quotationService.quoteCustomOrder(item.id, val, noteVal));
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-mono text-slate-400 block">
                          Đơn giá / 1 chiếc (VNĐ)
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={1000}
                          placeholder="VD: 50000"
                          value={getPriceInput(item)}
                          onChange={e => updatePriceInput(item.id, e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0c12] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono"
                        />
                      </div>
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[11px] font-mono text-slate-400 block">
                          Ghi chú kỹ thuật (tùy chọn)
                        </label>
                        <input
                          type="text"
                          maxLength={500}
                          placeholder="VD: PLA+ 0.2mm, đã tính hỗ trợ"
                          value={getNoteInput(item)}
                          onChange={e => updateNoteInput(item.id, e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0c12] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
                        <div className="text-right font-mono text-xs">
                          <span className="text-slate-400 block text-[10px]">
                            × {item.quantity || 1} chiếc
                          </span>
                          <strong className="text-[#39FF14]">
                            {Number(getPriceInput(item)) > 0
                              ? money(Number(getPriceInput(item)) * (item.quantity || 1))
                              : '--'}
                          </strong>
                        </div>
                        <button
                          type="submit"
                          disabled={busy}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 text-xs font-bold transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          title="Lưu riêng sản phẩm này"
                        >
                          {item.status === 'QUOTED' ? 'Lưu món này' : 'Báo giá món'}
                        </button>
                      </div>
                    </div>
                    {quoteErrors[item.id] && (
                      <span className="text-[11px] text-rose-400 font-semibold block">{quoteErrors[item.id]}</span>
                    )}
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Banner for PAID+ states */}
      {['PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes((co.status || '').toUpperCase()) && (
        <div className="p-4 rounded-xl border border-white/10 bg-[#040508]/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-2">
              {co.status === 'PRINTING' && <Printer className="w-4 h-4 text-[#00e5ff]" />}
              {co.status === 'SHIPPING' && <Truck className="w-4 h-4 text-[#00e5ff]" />}
              {co.status === 'COMPLETED' && <Sparkles className="w-4 h-4 text-[#39FF14]" />}
              <span>Tiến độ sản xuất &amp; giao hàng chung:</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] font-bold">
              1. Đã thanh toán
            </div>
            <div
              className={`p-2 rounded-xl border font-bold ${
                ['PRINTING', 'SHIPPING', 'COMPLETED'].includes(co.status)
                  ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff]'
                  : 'bg-[#0a0c12] border-white/5 text-slate-500'
              }`}
            >
              2. Đang in 3D
            </div>
            <div
              className={`p-2 rounded-xl border font-bold ${
                ['SHIPPING', 'COMPLETED'].includes(co.status)
                  ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff]'
                  : 'bg-[#0a0c12] border-white/5 text-slate-500'
              }`}
            >
              3. Đang giao hàng
            </div>
            <div
              className={`p-2 rounded-xl border font-bold ${
                co.status === 'COMPLETED'
                  ? 'bg-[#39FF14]/15 border-[#39FF14]/50 text-[#39FF14]'
                  : 'bg-[#0a0c12] border-white/5 text-slate-500'
              }`}
            >
              4. Hoàn tất
            </div>
          </div>
        </div>
      )}

      {/* Admin Batch Quote Summary Bar */}
      {isBatchQuotable && (
        <div className="p-4 rounded-xl border border-[#39FF14]/40 bg-[#39FF14]/5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-3 text-slate-300">
                <span>
                  Tổng tiền hàng ({activeItems.length} món):{' '}
                  <strong className="text-white">{money(draftItemsSubtotal)}</strong>
                </span>
                <span>•</span>
                <span>
                  Phí vận chuyển:{' '}
                  <strong className="text-white">{money(shippingFeeDisplay)}</strong>
                </span>
              </div>
              <div className="text-sm text-[#39FF14] font-black">
                Tổng báo giá toàn đơn dự kiến:{' '}
                {draftItemsSubtotal > 0 ? money(draftItemsSubtotal + shippingFeeDisplay) : '--'}
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleBatchQuoteSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black hover:brightness-110 transition flex items-center gap-2 text-xs uppercase tracking-tight shadow-lg shadow-[#39FF14]/20 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {co.status === 'QUOTED' ? 'Cập nhật lại báo giá toàn đơn' : 'Gửi báo giá toàn đơn'}
              </span>
            </button>
          </div>

          {batchQuoteError && (
            <div className="text-xs text-rose-400 font-semibold">{batchQuoteError}</div>
          )}
        </div>
      )}

      {/* Footer Total & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="space-y-2 min-w-[260px]">
          {hasServerBenefitSnapshot && (
            <div className="rounded-xl border border-[#39FF14]/35 bg-[#39FF14]/5 px-3 py-2 text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[#39FF14] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Đã áp dụng ưu đãi hội viên
                  {co.appliedSubscriptionName ? `: ${co.appliedSubscriptionName}` : ''}
                </span>
                {co.priorityProduction && (
                  <span className="px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 font-mono text-[10px]">
                    Ưu tiên sản xuất
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-mono text-slate-300">
                {(co.discountAmount ?? 0) > 0 && (
                  <span>Giảm giá: <strong className="text-[#39FF14]">-{money(co.discountAmount || 0)}</strong></span>
                )}
                {(co.shippingDiscountAmount ?? 0) > 0 && (
                  <span>Giảm ship: <strong className="text-[#39FF14]">-{money(co.shippingDiscountAmount || 0)}</strong></span>
                )}
              </div>
            </div>
          )}

          {!hasServerBenefitSnapshot && coPreview?.hasActiveSubscription && (
            <div className="rounded-xl border border-[#39FF14]/35 bg-[#39FF14]/5 px-3 py-2 text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[#39FF14] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ưu đãi hội viên dự kiến: {coPreview.planName || 'Gói VIP'}</span>
                {coPreview.priorityProduction && (
                  <span className="px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 font-mono text-[10px]">
                    Ưu tiên xưởng
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-mono text-slate-300">
                {coPreview.discountAmount > 0 && (
                  <span>
                    Giảm {coPreview.discountPercent}%:{' '}
                    <strong className="text-[#39FF14]">-{money(coPreview.discountAmount)}</strong>
                  </span>
                )}
                {coPreview.shippingDiscountAmount > 0 && (
                  <span>
                    Miễn ship:{' '}
                    <strong className="text-[#39FF14]">-{money(coPreview.shippingDiscountAmount)}</strong>
                  </span>
                )}
                {coPreview.freeShippingUsesLimit != null && (
                  <span>
                    (Còn {coPreview.remainingFreeShippingUses ?? 0}/{coPreview.freeShippingUsesLimit} lượt freeship)
                  </span>
                )}
              </div>
              {coPreview.ineligibleReason && (
                <p className="text-[11px] text-amber-300">{coPreview.ineligibleReason}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
            <span>
              Giá báo xưởng:{' '}
              <strong className="text-slate-200">
                {computedItemsSubtotal > 0 ? money(computedItemsSubtotal) : '--'}
              </strong>
            </span>
            {hasServerBenefitSnapshot && (co.discountAmount ?? 0) > 0 && (
              <span>
                Giảm hội viên:{' '}
                <strong className="text-[#39FF14]">-{money(co.discountAmount || 0)}</strong>
              </span>
            )}
            {!hasServerBenefitSnapshot && coPreview && coPreview.discountAmount > 0 && (
              <span>
                Giảm hội viên:{' '}
                <strong className="text-[#39FF14]">-{money(coPreview.discountAmount)}</strong>
              </span>
            )}
            <span>
              Phí ship:{' '}
              {hasServerBenefitSnapshot ? (
                <strong className="text-slate-200">
                  {money(Math.max(0, (co.shippingFee || 0) - (co.shippingDiscountAmount || 0)))}
                </strong>
              ) : coPreview && coPreview.shippingDiscountAmount > 0 ? (
                <strong className="text-[#39FF14]">
                  {coPreview.finalShippingFee === 0 ? 'Miễn phí (0đ)' : money(coPreview.finalShippingFee)}
                </strong>
              ) : (
                <strong className="text-slate-200">
                  {co.shippingFee && co.shippingFee > 0
                    ? money(co.shippingFee)
                    : co.status === 'PENDING_QUOTE'
                      ? '30.000đ (khi đủ báo giá)'
                      : '0đ'}
                </strong>
              )}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono block">
            {!hasServerBenefitSnapshot && coPreview
              ? 'Tổng thanh toán dự kiến sau ưu đãi:'
              : co.totalAmount && co.totalAmount > 0
                ? 'Tổng cộng đơn gộp:'
                : 'Tổng tạm tính (các món đã báo giá):'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#39FF14] font-mono">
            {!hasServerBenefitSnapshot && coPreview
              ? money(coPreview.finalTotal)
              : co.totalAmount && co.totalAmount > 0
                ? money(co.totalAmount)
                : computedItemsSubtotal > 0
                  ? `${money(computedItemsSubtotal)} (+ ship)`
                  : 'Chờ xưởng báo giá'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!admin && co.readyForConfirm && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConfirmAndPay()}
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black hover:brightness-110 transition flex items-center gap-2 text-xs uppercase tracking-tight shadow-lg shadow-[#39FF14]/25 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Chấp Nhận &amp; Thanh Toán PayOS (Cả Đơn)</span>
            </button>
          )}

          {!admin && co.status === 'CONFIRMED' && co.paymentStatus !== 'SUCCESS' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePayNow()}
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black hover:brightness-110 transition flex items-center gap-2 text-xs uppercase tracking-tight shadow-lg shadow-[#39FF14]/25 cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>Thanh toán ngay PayOS</span>
            </button>
          )}

          {admin && forwardAct && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void onRunAction(() =>
                  checkoutOrderService.updateAdminCheckoutOrderStatus(co.id, { action: forwardAct.action })
                )
              }
              className="px-4 py-2 rounded-xl border border-[#39FF14]/50 bg-[#39FF14]/15 text-[#39FF14] text-xs font-bold hover:bg-[#39FF14]/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chuyển sang: {forwardAct.nextStatus}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {admin && !forwardAct && blockedPayment && (
            <span className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {blockedPayment.message}
            </span>
          )}
        </div>
      </div>

      {/* 3D Model Viewer Modal */}
      {previewDesign && (
        <Modal
          open={!!previewDesign}
          onClose={() => setPreviewDesign(null)}
          label={`Mô hình 3D: ${previewDesign.name}`}
          className="!w-full !max-w-2xl"
        >
          <div className="p-4 bg-[#0a0c12] text-slate-200 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-base">
                Mô hình 3D: <span className="text-[#39FF14]">{previewDesign.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDesign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Modal3DViewer design={previewDesign.design} />
          </div>
        </Modal>
      )}

      {/* Preview Image Modal */}
      {previewImageUrl && (
        <Modal
          open={!!previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
          label="Ảnh mô phỏng thiết kế 3D"
          className="!w-full !max-w-3xl"
        >
          <div className="p-4 bg-[#0a0c12] text-slate-200 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Ảnh mô phỏng thiết kế 3D</h3>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black/70 p-2 rounded-xl flex justify-center">
              <img src={previewImageUrl} alt="Ảnh preview thước 3D" className="max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
