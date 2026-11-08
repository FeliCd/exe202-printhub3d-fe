import { useState, useEffect } from 'react';
import { FileEdit, Search, Download, Eye, Send, CheckCircle, Clock, RotateCcw, X, Sparkles, XCircle, Image as ImageIcon } from 'lucide-react';
import api, { send, unwrap } from '../../services/api';
import { formatPrice, formatDateTime, formatRulerType, formatStickerLabel } from '../../utils/format';
import { PageHeader, Notice } from '../../components/DataUI';
import Modal from '../../components/Modal';
import { Modal3DViewer } from '../../features/ruler-studio/Modal3DViewer';
import '../../features/ruler-studio/studio.css';

interface CustomOrderItem {
  id: string;
  buyerName: string;
  rulerModel?: string;
  customName?: string;
  customStudentId?: string;
  color?: string;
  fontStyle?: string;
  requirements?: string;
  quantity: number;
  attachmentUrl?: string;
  quotedPrice?: number;
  status: string;
  paymentMethod?: string;
  shippingAddress?: string;
  createdAt: string;
}

async function loadCustomOrders(signal?: AbortSignal) {
  const res = await api.get<CustomOrderItem[] | { result: CustomOrderItem[] }>('/admin/custom-orders', { signal });
  return unwrap<CustomOrderItem[]>(res.data);
}



interface ParsedSpecs {
  name?: string;
  rulerId?: string;
  measurementSystem?: string;
  scaleId?: string;
  length?: number;
  angle?: number;
  material?: string;
  infill?: number;
  color?: string;
  markingsMode?: string;
  markingsDepth?: number;
  tag?: {
    enabled?: boolean;
    shape?: string;
    text?: string;
    font?: string;
    color?: string;
    textColor?: string;
    mode?: string;
    textMode?: string;
    textDepth?: number;
  };
  layers?: Array<{
    id?: string;
    kind?: 'text' | 'sticker';
    text?: string;
    font?: string;
    mode?: string;
    depth?: number;
    color?: string;
  }>;
  template?: string;
}

function RulerSpecsViewer({ requirements }: { requirements: string }) {
  const [showRaw, setShowRaw] = useState(false);

  let parsed: ParsedSpecs | null = null;
  try {
    const trimmed = requirements.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      parsed = JSON.parse(trimmed);
    }
  } catch {
    parsed = null;
  }

  // Fallback if not JSON or plain text note
  if (!parsed || typeof parsed !== 'object') {
    return (
      <div className="p-4 rounded-xl bg-[#040508] text-slate-300 text-sm space-y-2 border border-[#1e2433]">
        <h3 className="font-bold text-[#39FF14] text-sm">
          Yêu cầu gia công từ sinh viên
        </h3>
        <p className="max-w-[70ch] whitespace-pre-wrap break-words leading-relaxed">{requirements}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 p-4 rounded-xl bg-[#040508] border border-[#1e2433] space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2433] pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="w-2 h-2 shrink-0 rounded-full bg-[#39FF14]" />
          <h3 className="font-bold text-white break-words">
            Cấu hình thước đặt in: <span className="text-[#39FF14]">{parsed.name || formatRulerType(parsed.rulerId)}</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          aria-expanded={showRaw}
          className="text-xs text-slate-300 hover:text-[#00e5ff] flex items-center gap-1 transition cursor-pointer"
        >
          {showRaw ? 'Ẩn mã JSON' : 'Xem mã JSON thô'}
        </button>
      </div>

      {/* Grid Specs */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Loại thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-xs text-slate-400">Kiểu thước</dt>
          <dd className="font-semibold text-white break-words">{formatRulerType(parsed.rulerId)}</dd>
        </div>

        {/* Kích thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-xs text-slate-400">Chiều dài / đo</dt>
          <dd className="font-semibold text-[#00e5ff]">
            {parsed.length ? `${parsed.length} cm` : 'Tiêu chuẩn'} {parsed.angle ? `• ${parsed.angle}°` : ''}
          </dd>
        </div>

        {/* Vật liệu & Infill */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-xs text-slate-400">Vật liệu &amp; infill</dt>
          <dd className="font-semibold text-[#ff9100]">
            {parsed.material || 'PLA'} • {parsed.infill ?? 30}% Infill
          </dd>
        </div>

        {/* Màu phôi thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-xs text-slate-400">Màu phôi thước</dt>
          <dd className="flex items-center gap-1.5 font-semibold text-white">
            {parsed.color && (
              <span
                className="w-3.5 h-3.5 rounded border border-white/20 shrink-0 inline-block"
                style={{ backgroundColor: parsed.color }}
              />
            )}
            <span className="break-words">{parsed.color || 'Mặc định'}</span>
          </dd>
        </div>
      </dl>

      {/* Thông số khắc vạch & Tag phụ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        <div className="p-3 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Kiểu khắc vạch chia:</span>
          <span className="font-bold text-white bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.markingsMode === 'engraved' ? 'Khắc Chìm (Engraved)' : 'Khắc Nổi (Raised)'}
            {parsed.markingsDepth !== undefined ? ` • ${parsed.markingsDepth}mm` : ''}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Hệ đo lường &amp; Tỉ lệ:</span>
          <span className="font-bold text-[#39FF14] bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.measurementSystem === 'metric' ? 'Hệ Mét (mm/cm)' : 'Hệ Inch'} • Tỉ lệ {parsed.scaleId || '1:1'}
          </span>
        </div>
      </div>

      {/* Thẻ phụ / Huy hiệu (Tag) nếu có */}
      {parsed.tag?.enabled && (
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-300 font-semibold text-sm">Thẻ khắc tên phụ (Sub-Badge)</span>
            <span className="text-[#00e5ff] font-bold">Hình dáng: {parsed.tag.shape || 'Badge'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-white">
              Nội dung: <strong className="text-[#39FF14]">"{parsed.tag.text}"</strong>
            </span>
            <span className="text-slate-400">Font: <span className="text-slate-200">{parsed.tag.font}</span></span>
            <span className="text-slate-400">
              Kiểu: <span className="text-slate-200">{parsed.tag.textMode === 'engraved' ? 'Chìm' : 'Nổi'}</span>
            </span>
            {parsed.tag.color && (
              <span className="flex items-center gap-1 text-slate-400">
                Nền thẻ:
                <span className="w-3 h-3 rounded border border-white/20 inline-block" style={{ backgroundColor: parsed.tag.color }} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lớp trang trí (Layers: Text / Stickers) */}
      {parsed.layers && parsed.layers.length > 0 && (
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-2">
          <span className="text-sm text-slate-300 font-semibold block">
            Chi tiết chữ &amp; biểu tượng khắc ({parsed.layers.length} phần tử)
          </span>
          <div className="flex flex-wrap gap-2">
            {parsed.layers.map((layer, idx) => (
              <span
                key={layer.id || idx}
                className="inline-flex max-w-full flex-wrap items-center gap-1.5 px-3 py-2 rounded-md bg-[#11141e] border border-[#1e2433] text-sm text-slate-200 break-words"
              >
                {layer.kind === 'sticker' ? (
                  <span className="text-amber-400 font-bold">{formatStickerLabel(layer.text || '')}</span>
                ) : (
                  <>
                    <span className="text-slate-400">Chữ:</span>
                    <strong className="text-[#39FF14]">"{layer.text}"</strong>
                    <span className="text-xs text-slate-400">({layer.font})</span>
                  </>
                )}
                <span className="text-xs text-[#00e5ff]">
                  {layer.mode === 'raised' ? 'Nổi' : 'Chìm'} {layer.depth}mm
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON collapse */}
      {showRaw && (
        <pre aria-label="Cấu hình thiết kế dạng JSON" className="max-w-full p-3 rounded-lg bg-[#020305] border border-[#1e2433] text-xs text-slate-300 overflow-x-auto font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

function extractRequirementsMeta(requirements?: string) {
  if (!requirements) return { glbUrl: null, previewImageUrl: null, design: null };
  try {
    const trimmed = requirements.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const p = JSON.parse(trimmed);
      return {
        glbUrl: p?.glbUrl || null,
        previewImageUrl: p?.previewImageUrl || p?.screenshotUrl || p?.imageUrl || null,
        design: p?.rulerId ? p : null,
      };
    }
  } catch {}
  return { glbUrl: null, previewImageUrl: null, design: null };
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'REQUESTED' | 'QUOTED' | 'ACCEPTED' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');

  // Quote Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrderItem | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview & Download File State
  const [previewOrder, setPreviewOrder] = useState<CustomOrderItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quoteModalError, setQuoteModalError] = useState<string | null>(null);

  const handleDownloadCustomFile = async (order: CustomOrderItem) => {
    setDownloadingId(order.id);
    try {
      const res = await api.get(`/custom-orders/${order.id}/file`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = blobUrl;
      let filename = `PrintHub3D-${(order.rulerModel || 'Design').replace(/[^a-zA-Z0-9_-]/g, '_')}-${order.id.slice(0, 8)}.stl`;
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
      if (order.attachmentUrl && order.attachmentUrl.startsWith('http')) {
        window.open(order.attachmentUrl, '_blank');
      } else {
        setActionError('Không tìm thấy tệp 3D đính kèm trên hệ thống hoặc tệp chưa được tải lên.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const data = await loadCustomOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn custom:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCustomOrders(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && Array.isArray(data)) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) console.error('Lỗi tải danh sách đơn custom:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const openQuoteModal = (order: CustomOrderItem) => {
    if (order.status === 'CANCELLED') return;
    setQuoteModalError(null);
    setSelectedOrder(order);
    setPriceInput(order.quotedPrice ? String(order.quotedPrice) : '');
    setQuoteModalOpen(true);
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !priceInput || selectedOrder.status === 'CANCELLED') return;

    setSubmitting(true);
    try {
      await send(`/admin/custom-orders/${selectedOrder.id}/quote`, { price: Number(priceInput) }, 'put');
      setQuoteModalOpen(false);
      void fetchCustomOrders();
    } catch (err) {
      console.error('Lỗi gửi báo giá:', err);
      setQuoteModalError('Không thể gửi báo giá. Vui lòng kiểm tra lại thông tin và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'REQUESTED' && o.status !== 'REQUESTED') return false;
    if (filter === 'QUOTED' && o.status !== 'QUOTED') return false;
    if (filter === 'ACCEPTED' && !['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status)) return false;
    if (filter === 'CANCELLED' && o.status !== 'CANCELLED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
        (o.customName && o.customName.toLowerCase().includes(q)) ||
        (o.customStudentId && o.customStudentId.toLowerCase().includes(q)) ||
        (o.rulerModel && o.rulerModel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-w-0 space-y-6 w-full max-w-6xl mx-auto pb-12">
      <Notice error={actionError || undefined} />
      <PageHeader
        title="Báo giá đơn in theo yêu cầu &amp; gia công CAD"
        description="Tiếp nhận yêu cầu in thước 3D cá nhân hóa, thẩm định độ phân giải lớp in STL/CAD và gửi báo giá cho sinh viên."
        className="[&_p]:max-w-[70ch] [&_p]:text-sm"
        badge={`${orders.length} yêu cầu`}
        icon={FileEdit}
        actions={
          <button
            onClick={() => { void fetchCustomOrders(); }}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            <span>Làm mới danh sách</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="min-w-0 p-4 rounded-2xl bg-[#0a0c12] border border-[#1e2433] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 text-xs shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div role="group" aria-label="Lọc đơn in theo trạng thái" className="flex min-w-0 items-center gap-1.5 p-1 bg-[#040508] rounded-xl border border-[#1e2433] overflow-x-auto">
          <button
            onClick={() => setFilter('ALL')}
            aria-pressed={filter === 'ALL'}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'ALL' ? 'bg-[#39FF14] text-[#040508] shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilter('REQUESTED')}
            aria-pressed={filter === 'REQUESTED'}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'REQUESTED' ? 'bg-[#ff9100] text-[#040508] shadow-md shadow-amber-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ báo giá ({orders.filter((o) => o.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setFilter('QUOTED')}
            aria-pressed={filter === 'QUOTED'}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'QUOTED' ? 'bg-[#00e5ff] text-[#040508] shadow-md shadow-cyan-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Đã báo giá ({orders.filter((o) => o.status === 'QUOTED').length})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            aria-pressed={filter === 'ACCEPTED'}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'ACCEPTED' ? 'bg-[#39FF14] text-[#040508] shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Đang sản xuất (
            {orders.filter((o) => ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status)).length}
            )
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            aria-pressed={filter === 'CANCELLED'}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'CANCELLED' ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Đã hủy ({orders.filter((o) => o.status === 'CANCELLED').length})
          </button>
        </div>

        <div className="relative w-full xl:flex-1 xl:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            aria-label="Tìm đơn in theo tên khách hàng, mã số sinh viên hoặc mã đơn"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, MSSV, mã đơn..."
            className="w-full bg-[#040508] border border-[#1e2433] rounded-xl pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-[#39FF14]"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading && orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-[#0a0c12] rounded-2xl border border-[#1e2433] font-mono space-y-2">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
            <p>ĐANG TRUY VẤN DỮ LIỆU ĐƠN IN CUSTOM TỪ DATABASE...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-[#0a0c12] rounded-2xl border border-[#1e2433] font-mono">
            Không có yêu cầu in custom nào trong danh mục này.
          </div>
        ) : (
          filteredOrders.map((o) => {
            const isPendingQuote = o.status === 'REQUESTED';
            const isQuoted = o.status === 'QUOTED';
            const isAccepted = ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status);
            const isCancelled = o.status === 'CANCELLED';
            const { glbUrl: glbDownloadUrl, previewImageUrl: orderPreviewImg } = extractRequirementsMeta(o.requirements);
            const resolvedImageUrl = orderPreviewImg || (o.attachmentUrl && (o.attachmentUrl.toLowerCase().includes('.png') || o.attachmentUrl.toLowerCase().includes('.jpg') || o.attachmentUrl.toLowerCase().includes('.jpeg') || o.attachmentUrl.toLowerCase().includes('.webp') || o.attachmentUrl.toLowerCase().includes('/image/upload/') || o.attachmentUrl.startsWith('data:image/')) ? o.attachmentUrl : null);

            return (
              <article key={o.id} aria-labelledby={`custom-order-${o.id}`} className="min-w-0 p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 transition-all space-y-4 text-sm shadow-lg relative overflow-hidden">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2433] pb-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 id={`custom-order-${o.id}`} className="font-mono text-[#39FF14] font-bold text-sm bg-[#39FF14]/10 px-2.5 py-0.5 rounded-lg border border-[#39FF14]/30">
                      #CUS-{o.id.substring(0, 8)}
                    </h2>
                    <span className="text-slate-400 font-mono">• Khách hàng: <strong className="text-white">{o.buyerName}</strong></span>
                    <span className="text-slate-400 font-mono text-xs">• Thời gian: {formatDateTime(o.createdAt)}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCancelled && (
                      <span className="max-w-full px-3 py-1 rounded-full font-mono font-bold text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5 shadow-md shadow-rose-950/50">
                        <XCircle className="w-3.5 h-3.5" /> ĐƠN ĐÃ HỦY BỎ
                      </span>
                    )}
                    {isPendingQuote && (
                      <span className="max-w-full px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#ff9100]/15 text-[#ff9100] border border-[#ff9100]/30 inline-flex items-center gap-1.5 shadow-md shadow-amber-950/50">
                        <Clock className="w-3.5 h-3.5" /> CHỜ THẨM ĐỊNH BÁO GIÁ
                      </span>
                    )}
                    {isQuoted && (
                      <span className="max-w-full px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 inline-flex items-center gap-1.5 shadow-md shadow-cyan-950/50">
                        <Send className="w-3.5 h-3.5" /> ĐÃ GỬI BÁO GIÁ ({formatPrice(o.quotedPrice || 0)}đ)
                      </span>
                    )}
                    {isAccepted && (
                      <span className="max-w-full px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 inline-flex items-center gap-1.5 shadow-md shadow-emerald-950/50">
                        <CheckCircle className="w-3.5 h-3.5" /> KHÁCH ĐÃ CHỐT ĐƠN ({o.status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4 rounded-xl bg-[#040508] border border-[#1e2433]">
                  <div>
                    <span className="text-slate-400 block text-xs">Mẫu thước 3D</span>
                    <span className="font-semibold text-white break-words">{o.rulerModel || 'Thước Kỹ Thuật Tùy Chỉnh'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Khắc tên &amp; MSSV</span>
                    <span className="font-semibold text-[#39FF14] break-words">
                      {o.customName || 'Không khắc'} {o.customStudentId ? `(${o.customStudentId})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Vật liệu &amp; số lượng</span>
                    <span className="font-semibold text-slate-200">
                      Màu {o.color || 'Mặc định'} • Số lượng: <strong className="text-white">{o.quantity || 1}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">File thiết kế 3D / minh họa</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {glbDownloadUrl && (
                        <a
                          href={glbDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-[#00e5ff] hover:underline text-xs whitespace-nowrap cursor-pointer"
                          title="Tải tệp 3D đa chiều đầy đủ màu sắc (.GLB)"
                        >
                          <Download className="w-3.5 h-3.5" /> TẢI FILE GLB (3D MÀU)
                        </a>
                      )}
                      {o.attachmentUrl && (o.attachmentUrl.toLowerCase().includes('.stl') || o.attachmentUrl.toLowerCase().includes('.step') || o.attachmentUrl.toLowerCase().includes('.stp') || o.attachmentUrl.toLowerCase().includes('.obj') || o.attachmentUrl.toLowerCase().includes('/raw/upload/')) && (
                        <button
                          type="button"
                          onClick={() => handleDownloadCustomFile(o)}
                          disabled={downloadingId === o.id}
                          className="inline-flex items-center gap-1.5 font-bold text-[#39FF14] hover:underline text-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" /> {downloadingId === o.id ? 'Đang tải file...' : 'TẢI FILE STL / CAD'}
                        </button>
                      )}
                      {resolvedImageUrl && (
                        <a
                          href={resolvedImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:underline text-xs whitespace-nowrap"
                          title="Xem ảnh kết xuất 3D xem trước"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> XEM ẢNH RENDER (PNG)
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewOrder(o)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-[#39FF14]" /> Xem chi tiết 3D
                      </button>
                    </div>
                  </div>
                </div>

                {/* Render preview image thumbnail in card if available */}
                {resolvedImageUrl && (
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl bg-[#040508] border border-[#1e2433]">
                    <img
                      src={resolvedImageUrl}
                      alt="Ảnh dựng 3D thước"
                      className="w-24 h-16 sm:w-28 sm:h-20 object-contain rounded-lg bg-black/50 border border-white/10 cursor-pointer hover:border-[#39FF14] transition"
                      onClick={() => setPreviewOrder(o)}
                      title="Nhấn để xem chi tiết thiết kế"
                    />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Ảnh mô phỏng kết xuất 3D thực tế</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Mẫu thước do sinh viên tự tùy chỉnh và đặt in từ Ruler Studio.
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={resolvedImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#39FF14] hover:underline font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Mở ảnh gốc sắc nét
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {o.requirements && (
                  <RulerSpecsViewer requirements={o.requirements} />
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#1e2433]/70">
                  <div className="min-w-0 flex-1">
                    {isCancelled ? (
                      <p className="max-w-[65ch] text-sm text-rose-400 font-semibold flex items-center gap-1.5 leading-relaxed">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Khách hàng đã hủy yêu cầu báo giá này.
                      </p>
                    ) : isAccepted ? (
                      <p className="max-w-[65ch] text-sm text-[#39FF14] font-semibold flex items-center gap-1.5 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Đơn đã được khách xác nhận và tự động liên kết với hàng đợi máy in.
                      </p>
                    ) : (
                      <p className="max-w-[65ch] text-sm text-slate-400 leading-relaxed">
                        Sau khi khách hàng chấp nhận báo giá, lệnh in sẽ tự động chuyển vào hàng đợi xưởng.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {o.quotedPrice && (
                      <span className="font-mono text-base font-black text-[#39FF14] mr-2">
                        {formatPrice(o.quotedPrice)}đ
                      </span>
                    )}
                    {isCancelled ? (
                      <span className="px-4 py-2.5 rounded-xl font-mono font-bold text-xs bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 select-none">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ĐÃ HỦY BỎ</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => openQuoteModal(o)}
                        className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                          isAccepted
                            ? 'bg-[#11141e] border border-[#1e2433] text-slate-300 hover:text-white'
                            : 'bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black shadow-md shadow-emerald-950/50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{o.quotedPrice ? 'SỬA BÁO GIÁ' : 'GỬI BÁO GIÁ NGAY'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Quote Modal */}
      <Modal open={quoteModalOpen && !!selectedOrder} onClose={() => setQuoteModalOpen(false)} label="Báo Giá Yêu Cầu In 3D">
        {selectedOrder && (
          <div className="w-full max-w-md bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 rounded-2xl p-6 shadow-lg space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5 shrink-0">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#39FF14]" />
                Báo giá gia công in 3D
              </h2>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#11141e] transition cursor-pointer whitespace-nowrap shrink-0"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#040508] text-sm space-y-1.5 border border-[#1e2433]">
              <p className="text-white font-bold">{selectedOrder.rulerModel || 'Thước 3D Custom'}</p>
              <p className="text-slate-400">Khách hàng: <span className="text-white font-bold">{selectedOrder.buyerName}</span></p>
              <p className="text-slate-400">Khắc tên: <span className="text-[#39FF14] font-bold">{selectedOrder.customName || 'Không'}</span> • Số lượng: <strong className="text-white">{selectedOrder.quantity || 1}</strong></p>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4 text-sm">
              {quoteModalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {quoteModalError}
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="custom-quote-price" className="font-semibold text-slate-300">Giá báo cho khách (VNĐ) *</label>
                <input
                  id="custom-quote-price"
                  aria-describedby="custom-quote-price-help"
                  required
                  type="number"
                  min={1000}
                  step={1000}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="VD: 55000"
                  className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] font-mono text-sm"
                />
                <span id="custom-quote-price-help" className="text-xs text-slate-400 leading-relaxed block">
                  Giá này bao gồm vật liệu PLA Pro+, công in FDM độ mịn 0.16mm và khắc laser tên/MSSV.
                </span>
              </div>

              {/* Fast presets */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-300">Gợi ý nhanh phân khúc</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Cơ bản', val: 35000 },
                    { label: 'Tiêu chuẩn', val: 55000 },
                    { label: 'Carbon Pro', val: 85000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriceInput(String(p.val))}
                      className="p-2 rounded-xl bg-[#11141e] hover:bg-[#1e2433] border border-[#1e2433] text-xs text-slate-300 hover:text-[#39FF14] transition font-semibold cursor-pointer"
                    >
                      {p.label}: {p.val.toLocaleString()}đ
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#1e2433] shrink-0">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2.5 min-h-[38px] rounded-xl bg-[#11141e] border border-[#1e2433] text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 min-h-[38px] rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-950/50 flex items-center gap-1.5 justify-center transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>XÁC NHẬN BÁO GIÁ</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Modal Xem Chi Tiết 3D & Thông Số Cho Admin Báo Giá */}
      <Modal
        open={!!previewOrder}
        onClose={() => setPreviewOrder(null)}
        label="Chi tiết mô hình 3D yêu cầu in"
        className="!w-full !max-w-2xl"
      >
        {previewOrder && (() => {
          const { glbUrl, previewImageUrl, design } = extractRequirementsMeta(previewOrder.requirements);
          const resolvedImg = previewImageUrl || (previewOrder.attachmentUrl && (previewOrder.attachmentUrl.toLowerCase().includes('.png') || previewOrder.attachmentUrl.toLowerCase().includes('.jpg') || previewOrder.attachmentUrl.toLowerCase().includes('.jpeg') || previewOrder.attachmentUrl.toLowerCase().includes('/image/upload/')) ? previewOrder.attachmentUrl : null);

          return (
            <div className="space-y-4 p-5 bg-[#0a0c12] text-slate-200 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#39FF14]" />
                  <h2 className="font-bold text-white text-base">Hồ sơ thiết kế kỹ thuật 3D</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOrder(null)}
                  aria-label="Đóng chi tiết thiết kế"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mô hình 3D tương tác trực tiếp nếu có cấu hình design */}
              {design && (
                <div className="space-y-1.5 p-3 rounded-xl bg-[#040508] border border-white/10">
                  <span className="text-xs text-[#39FF14] font-bold block font-mono">
                    MÔ HÌNH 3D TƯƠNG TÁC (XOAY 360°, PHÓNG TO, XEM CHI TIẾT KHẮC &amp; STICKER):
                  </span>
                  <Modal3DViewer design={design} />
                </div>
              )}

              {/* Preview image if available */}
              {resolvedImg && (
                <div className="p-3 rounded-xl bg-[#040508] border border-white/10 text-center space-y-2">
                  <span className="text-xs text-slate-400 block font-mono">Ảnh xem trước kết xuất 3D từ Studio</span>
                  <img
                    src={resolvedImg}
                    alt="3D Preview"
                    className="max-h-56 mx-auto rounded-lg border border-white/10 object-contain shadow-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-[#040508] border border-white/10 space-y-1">
                  <span className="text-slate-400 block font-mono">LOẠI MẪU:</span>
                  <span className="font-bold text-white">{previewOrder.rulerModel || 'Mẫu tùy chỉnh'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#040508] border border-white/10 space-y-1">
                  <span className="text-slate-400 block font-mono">VẬT LIỆU &amp; MÀU:</span>
                  <span className="font-bold text-[#39FF14]">PLA Nguyên Sinh • {previewOrder.color || 'Màu tiêu chuẩn'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#040508] border border-white/10 space-y-1">
                  <span className="text-slate-400 block font-mono">KHẮC TÊN:</span>
                  <span className="font-bold text-white">{previewOrder.customName || 'Không khắc'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#040508] border border-white/10 space-y-1">
                  <span className="text-slate-400 block font-mono">MÃ SỐ SINH VIÊN:</span>
                  <span className="font-bold text-white">{previewOrder.customStudentId || 'Không có'}</span>
                </div>
              </div>

              {/* Technical specs parser */}
              {previewOrder.requirements && (
                <RulerSpecsViewer requirements={previewOrder.requirements} />
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/10">
                {glbUrl && (
                  <a
                    href={glbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-xl bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Tải tệp 3D đa chiều đầy đủ màu sắc (.GLB)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File GLB (3D Màu)</span>
                  </a>
                )}
                {resolvedImg && (
                  <a
                    href={resolvedImg}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Render (PNG)</span>
                  </a>
                )}
                {previewOrder.attachmentUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCustomFile(previewOrder)}
                    disabled={downloadingId === previewOrder.id}
                    className="py-2 px-4 rounded-xl bg-[#39FF14] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#32e012] transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === previewOrder.id ? 'Đang tải...' : 'Tải File STL Cho Máy In'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewOrder(null)}
                  className="py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
