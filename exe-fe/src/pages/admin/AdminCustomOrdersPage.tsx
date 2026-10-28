import { useState, useEffect } from 'react';
import { FileEdit, Search, Download, Send, CheckCircle, Clock, RotateCcw, X, Sparkles } from 'lucide-react';
import { get, send } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { PageHeader } from '../../components/DataUI';
import Modal from '../../components/Modal';

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

function formatRulerType(id?: string) {
  switch (id) {
    case 'straight-ruler':
      return 'Thước Thẳng Kỹ Thuật';
    case 'triangular-scale':
      return 'Thước Tam Giác Tỉ Lệ (Kiến Trúc)';
    case 'protractor':
      return 'Thước Đo Góc Chuyên Dụng';
    case 'vernier-caliper':
      return 'Thước Kẹp Vernier Du Xích';
    default:
      return id || 'Thước Kỹ Thuật In 3D';
  }
}

function formatStickerLabel(text: string) {
  const clean = text.replace(/^lucide:/, '');
  const map: Record<string, string> = {
    Star: '⭐ Ngôi sao',
    Heart: '❤️ Trái tim',
    Sun: '☀️ Mặt trời',
    Moon: '🌙 Mặt trăng',
    Smile: '😊 Mặt cười',
    Shield: '🛡️ Khiên bảo hộ',
    Flame: '🔥 Ngọn lửa',
    Zap: '⚡ Tia sét',
    Sparkles: '✨ Lấp lánh',
  };
  return map[clean] || `Biểu tượng (${clean})`;
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
      <div className="p-3.5 rounded-xl bg-[#040508] text-slate-300 text-xs space-y-1 border border-[#1e2433]">
        <span className="font-bold text-[#39FF14] font-mono text-[11px] uppercase tracking-wide">
          YÊU CẦU GIA CÔNG TỪ SINH VIÊN:
        </span>
        <p className="leading-relaxed font-sans">{requirements}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#040508] border border-[#1e2433] space-y-3.5 text-xs font-mono">
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2433] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wide">
            CẤU HÌNH THƯỚC ĐẶT IN: <span className="text-[#39FF14]">{parsed.name || formatRulerType(parsed.rulerId)}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-[11px] text-slate-400 hover:text-[#00e5ff] flex items-center gap-1 transition cursor-pointer"
        >
          {showRaw ? 'Ẩn mã JSON' : 'Xem mã JSON thô'}
        </button>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Loại thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Kiểu Thước:</span>
          <span className="font-bold text-white text-xs truncate block">{formatRulerType(parsed.rulerId)}</span>
        </div>

        {/* Kích thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Chiều Dài / Đo:</span>
          <span className="font-bold text-[#00e5ff] text-xs">
            {parsed.length ? `${parsed.length} cm` : 'Tiêu chuẩn'} {parsed.angle ? `• ${parsed.angle}°` : ''}
          </span>
        </div>

        {/* Vật liệu & Infill */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Vật Liệu &amp; Infill:</span>
          <span className="font-bold text-[#ff9100] text-xs">
            {parsed.material || 'PLA'} • {parsed.infill ?? 30}% Infill
          </span>
        </div>

        {/* Màu phôi thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Màu Phôi Thước:</span>
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            {parsed.color && (
              <span
                className="w-3.5 h-3.5 rounded border border-white/20 shrink-0 inline-block"
                style={{ backgroundColor: parsed.color }}
              />
            )}
            <span className="truncate">{parsed.color || 'Mặc định'}</span>
          </div>
        </div>
      </div>

      {/* Thông số khắc vạch & Tag phụ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Kiểu khắc vạch chia:</span>
          <span className="font-bold text-white bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.markingsMode === 'engraved' ? 'Khắc Chìm (Engraved)' : 'Khắc Nổi (Raised)'}
            {parsed.markingsDepth !== undefined ? ` • ${parsed.markingsDepth}mm` : ''}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Hệ đo lường &amp; Tỉ lệ:</span>
          <span className="font-bold text-[#39FF14] bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.measurementSystem === 'metric' ? 'Hệ Mét (mm/cm)' : 'Hệ Inch'} • Tỉ lệ {parsed.scaleId || '1:1'}
          </span>
        </div>
      </div>

      {/* Thẻ phụ / Huy hiệu (Tag) nếu có */}
      {parsed.tag?.enabled && (
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Thẻ Khắc Tên Phụ (Sub-Badge):</span>
            <span className="text-[#00e5ff] font-bold">Hình dáng: {parsed.tag.shape || 'Badge'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
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
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Chi Tiết Chữ &amp; Biểu Tượng Khắc ({parsed.layers.length} phần tử):
          </span>
          <div className="flex flex-wrap gap-2">
            {parsed.layers.map((layer, idx) => (
              <span
                key={layer.id || idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#11141e] border border-[#1e2433] text-[11px] text-slate-200"
              >
                {layer.kind === 'sticker' ? (
                  <span className="text-amber-400 font-bold">{formatStickerLabel(layer.text || '')}</span>
                ) : (
                  <>
                    <span className="text-slate-400">Chữ:</span>
                    <strong className="text-[#39FF14]">"{layer.text}"</strong>
                    <span className="text-[10px] text-slate-500">({layer.font})</span>
                  </>
                )}
                <span className="text-[10px] text-[#00e5ff]">
                  {layer.mode === 'raised' ? 'Nổi' : 'Chìm'} {layer.depth}mm
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON collapse */}
      {showRaw && (
        <div className="p-3 rounded-lg bg-[#020305] border border-[#1e2433] text-[10px] text-slate-400 overflow-x-auto whitespace-pre font-mono">
          {JSON.stringify(parsed, null, 2)}
        </div>
      )}
    </div>
  );
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'REQUESTED' | 'QUOTED' | 'ACCEPTED'>('ALL');
  const [search, setSearch] = useState('');

  // Quote Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrderItem | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const res = await get('/admin/custom-orders');
      const data = (res.data as any)?.result || res.data;
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
    fetchCustomOrders();
  }, []);

  const openQuoteModal = (order: CustomOrderItem) => {
    setSelectedOrder(order);
    setPriceInput(order.quotedPrice ? String(order.quotedPrice) : '');
    setQuoteModalOpen(true);
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !priceInput) return;

    setSubmitting(true);
    try {
      await send(`/admin/custom-orders/${selectedOrder.id}/quote`, { price: Number(priceInput) }, 'put');
      setQuoteModalOpen(false);
      fetchCustomOrders();
    } catch (err) {
      console.error('Lỗi gửi báo giá:', err);
      alert('Không thể gửi báo giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'REQUESTED' && o.status !== 'REQUESTED') return false;
    if (filter === 'QUOTED' && o.status !== 'QUOTED') return false;
    if (filter === 'ACCEPTED' && !['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status)) return false;

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
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      <PageHeader
        title="BÁO GIÁ ĐƠN IN THEO YÊU CẦU &amp; GIA CÔNG CAD (ADMIN)"
        description="Tiếp nhận yêu cầu in thước 3D cá nhân hóa, thẩm định độ phân giải lớp in STL/CAD và gửi báo giá cho sinh viên."
        badge={`${orders.length} yêu cầu`}
        icon={FileEdit}
        actions={
          <button
            onClick={fetchCustomOrders}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            <span>LÀM MỚI DANH SÁCH</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#1e2433] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-1.5 p-1 bg-[#040508] rounded-xl border border-[#1e2433] overflow-x-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'ALL' ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            TẤT CẢ ({orders.length})
          </button>
          <button
            onClick={() => setFilter('REQUESTED')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'REQUESTED' ? 'bg-[#ff9100] text-[#040508] shadow-[0_0_12px_rgba(255,145,0,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            CHỜ BÁO GIÁ ({orders.filter((o) => o.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setFilter('QUOTED')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'QUOTED' ? 'bg-[#00e5ff] text-[#040508] shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            ĐÃ BÁO GIÁ ({orders.filter((o) => o.status === 'QUOTED').length})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filter === 'ACCEPTED' ? 'bg-[#39FF14] text-[#040508] shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            ĐANG SẢN XUẤT (
            {orders.filter((o) => ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status)).length}
            )
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, MSSV, mã đơn..."
            className="w-full bg-[#040508] border border-[#1e2433] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] font-mono"
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

            return (
              <div key={o.id} className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 transition-all space-y-4 text-xs shadow-2xl relative overflow-hidden">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2433] pb-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[#39FF14] font-bold text-sm bg-[#39FF14]/10 px-2.5 py-0.5 rounded-lg border border-[#39FF14]/30">
                      #CUS-{o.id.substring(0, 8)}
                    </span>
                    <span className="text-slate-400 font-mono">• Khách hàng: <strong className="text-white">{o.buyerName}</strong></span>
                    <span className="text-slate-500 font-mono">• Thời gian: {new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPendingQuote && (
                      <span className="px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#ff9100]/15 text-[#ff9100] border border-[#ff9100]/30 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(255,145,0,0.15)]">
                        <Clock className="w-3.5 h-3.5" /> CHỜ THẨM ĐỊNH BÁO GIÁ
                      </span>
                    )}
                    {isQuoted && (
                      <span className="px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
                        <Send className="w-3.5 h-3.5" /> ĐÃ GỬI BÁO GIÁ ({formatPrice(o.quotedPrice || 0)}đ)
                      </span>
                    )}
                    {isAccepted && (
                      <span className="px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
                        <CheckCircle className="w-3.5 h-3.5" /> KHÁCH ĐÃ CHỐT ĐƠN ({o.status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#040508] border border-[#1e2433] font-mono">
                  <div>
                    <span className="text-slate-400 block text-xs">MẪU THƯỚC 3D:</span>
                    <span className="font-bold text-white text-xs">{o.rulerModel || 'Thước Kỹ Thuật Tùy Chỉnh'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">KHẮC TÊN &amp; MSSV:</span>
                    <span className="font-bold text-[#39FF14] text-xs">
                      {o.customName || 'Không khắc'} {o.customStudentId ? `(${o.customStudentId})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">VẬT LIỆU &amp; SỐ LƯỢNG:</span>
                    <span className="font-semibold text-slate-200 text-xs">
                      Màu {o.color || 'Mặc định'} • Số lượng: <strong className="text-white">{o.quantity || 1}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">FILE THIẾT KẾ 3D:</span>
                    {o.attachmentUrl ? (
                      <a
                        href={o.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-[#00e5ff] hover:underline text-xs mt-0.5 whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> TẢI FILE STL / CAD
                      </a>
                    ) : (
                      <span className="text-slate-500 italic text-xs">Không đính kèm</span>
                    )}
                  </div>
                </div>

                {o.requirements && (
                  <RulerSpecsViewer requirements={o.requirements} />
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#1e2433]/70">
                  <div>
                    {isAccepted ? (
                      <p className="text-xs text-[#39FF14] font-semibold flex items-center gap-1.5 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Đơn đã được khách xác nhận và tự động liên kết với hàng đợi máy in.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 font-mono">
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
                    <button
                      onClick={() => openQuoteModal(o)}
                      className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                        isAccepted
                          ? 'bg-[#11141e] border border-[#1e2433] text-slate-300 hover:text-white'
                          : 'bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{o.quotedPrice ? 'SỬA BÁO GIÁ' : 'GỬI BÁO GIÁ NGAY'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quote Modal */}
      <Modal open={quoteModalOpen && !!selectedOrder} onClose={() => setQuoteModalOpen(false)} label="Báo Giá Yêu Cầu In 3D">
        {selectedOrder && (
          <div className="w-full max-w-md bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5 shrink-0">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide font-mono">
                <Sparkles className="w-4 h-4 text-[#39FF14]" />
                BÁO GIÁ GIA CÔNG IN 3D
              </h3>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#11141e] transition cursor-pointer whitespace-nowrap shrink-0"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#040508] text-xs space-y-1.5 border border-[#1e2433] font-mono">
              <p className="text-white font-bold">{selectedOrder.rulerModel || 'Thước 3D Custom'}</p>
              <p className="text-slate-400">Khách hàng: <span className="text-white font-bold">{selectedOrder.buyerName}</span></p>
              <p className="text-slate-400">Khắc tên: <span className="text-[#39FF14] font-bold">{selectedOrder.customName || 'Không'}</span> • Số lượng: <strong className="text-white">{selectedOrder.quantity || 1}</strong></p>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">NHẬP GIÁ BÁO CHO KHÁCH (VNĐ) *</label>
                <input
                  required
                  type="number"
                  min={1000}
                  step={1000}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="VD: 55000"
                  className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] font-mono text-sm"
                />
                <span className="text-[11px] text-slate-500 block">
                  Giá này bao gồm vật liệu PLA Pro+, công in FDM độ mịn 0.16mm và khắc laser tên/MSSV.
                </span>
              </div>

              {/* Fast presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono">GỢI Ý NHANH PHÂN KHÚC:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Cơ bản', val: 35000 },
                    { label: 'Tiêu chuẩn', val: 55000 },
                    { label: 'Carbon Pro', val: 85000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriceInput(String(p.val))}
                      className="p-2 rounded-xl bg-[#11141e] hover:bg-[#1e2433] border border-[#1e2433] text-[10px] text-slate-300 hover:text-[#39FF14] transition font-bold cursor-pointer whitespace-nowrap shrink-0"
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
                  className="px-5 py-2.5 min-h-[38px] rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-1.5 justify-center transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>XÁC NHẬN BÁO GIÁ</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
