import { useState, useEffect } from 'react';
import { FileEdit, Search, Download, Send, CheckCircle, Clock, RotateCcw, X, Sparkles } from 'lucide-react';
import { get, send } from '../../services/api';
import { formatPrice } from '../../utils/format';

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
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <FileEdit className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Báo Giá Đơn In Custom Theo Yêu Cầu</h1>
          </div>
          <p className="text-sm text-text-muted">
            Tiếp nhận yêu cầu in thước 3D cá nhân hóa, kiểm tra file thiết kế và gửi báo giá cho sinh viên
          </p>
        </div>

        <button
          onClick={fetchCustomOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-[#39FF14] text-slate-200 hover:text-[#39FF14] text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-surface-inset rounded-xl border border-border overflow-x-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'ALL' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilter('REQUESTED')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'REQUESTED' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ Báo Giá ({orders.filter((o) => o.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setFilter('QUOTED')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'QUOTED' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Đã Gửi Báo Giá ({orders.filter((o) => o.status === 'QUOTED').length})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'ACCEPTED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Đã Chốt Giá / Sản Xuất (
            {orders.filter((o) => ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status)).length}
            )
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, MSSV, mã đơn..."
            className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-white outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading && orders.length === 0 ? (
          <div className="p-10 text-center text-text-muted text-xs bg-surface rounded-2xl border border-border">
            <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
            Đang tải danh sách yêu cầu in custom...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-text-muted text-xs bg-surface rounded-2xl border border-border">
            Không có yêu cầu in custom nào trong mục này.
          </div>
        ) : (
          filteredOrders.map((o) => {
            const isPendingQuote = o.status === 'REQUESTED';
            const isQuoted = o.status === 'QUOTED';
            const isAccepted = ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING', 'COMPLETED'].includes(o.status);

            return (
              <div key={o.id} className="p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-purple-400 font-bold text-sm">
                      #CUS-{o.id.substring(0, 8)}
                    </span>
                    <span className="text-text-muted">• Người đặt: <strong className="text-white">{o.buyerName}</strong></span>
                    <span className="text-text-muted">• Ngày gửi: {new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPendingQuote && (
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Chờ Admin Báo Giá
                      </span>
                    )}
                    {isQuoted && (
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Đã Báo Giá ({formatPrice(o.quotedPrice || 0)}đ)
                      </span>
                    )}
                    {isAccepted && (
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-950 text-[#39FF14] border border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Khách Đã Chốt Giá ({o.status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-inset border border-border/80">
                  <div>
                    <span className="text-text-muted block text-xs">Mẫu Thước 3D:</span>
                    <span className="font-bold text-white text-xs">{o.rulerModel || 'Thước Kỹ Thuật Tùy Chỉnh'}</span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-xs">Khắc Tên &amp; MSSV:</span>
                    <span className="font-bold text-purple-300 text-xs">
                      {o.customName || 'Không khắc'} {o.customStudentId ? `(${o.customStudentId})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-xs">Màu Sắc &amp; Số Lượng:</span>
                    <span className="font-semibold text-slate-200 text-xs">
                      Màu {o.color || 'Mặc định'} • Số lượng: <strong>{o.quantity || 1}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-xs">File Thiết Kế 3D:</span>
                    {o.attachmentUrl ? (
                      <a
                        href={o.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#39FF14] hover:underline text-xs mt-0.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Tệp 3D
                      </a>
                    ) : (
                      <span className="text-slate-500 italic text-xs">Không đính kèm</span>
                    )}
                  </div>
                </div>

                {o.requirements && (
                  <div className="p-3 rounded-xl bg-surface-inset text-slate-300 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Yêu cầu gia công từ khách:</span>
                    <p>{o.requirements}</p>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    {isAccepted ? (
                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đơn hàng đã được chốt và tự động chuyển sang trang <strong>Quản Lý Đơn Hàng Hệ Thống</strong> để theo dõi gia công in 3D.
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted">
                        Sau khi khách hàng chấp nhận báo giá, đơn sẽ tự động chuyển vào hàng đợi gia công in 3D.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {o.quotedPrice && (
                      <span className="font-mono text-base font-bold text-[#39FF14] mr-2">
                        {formatPrice(o.quotedPrice)}đ
                      </span>
                    )}
                    <button
                      onClick={() => openQuoteModal(o)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        isAccepted
                          ? 'bg-surface-inset border border-border text-slate-400 hover:text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/40'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{o.quotedPrice ? 'Sửa Báo Giá' : 'Gửi Báo Giá Ngay'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quote Modal */}
      {quoteModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Báo Giá Yêu Cầu In 3D
              </h3>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-inset text-xs space-y-1.5">
              <p className="text-white font-bold">{selectedOrder.rulerModel || 'Thước 3D Custom'}</p>
              <p className="text-text-muted">Khách hàng: <span className="text-slate-200">{selectedOrder.buyerName}</span></p>
              <p className="text-text-muted">Khắc tên: <span className="text-purple-300 font-bold">{selectedOrder.customName || 'Không'}</span> • Số lượng: <strong className="text-white">{selectedOrder.quantity || 1}</strong></p>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Nhập giá báo cho khách (VNĐ) *</label>
                <input
                  required
                  type="number"
                  min={1000}
                  step={1000}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="VD: 55000"
                  className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 font-mono text-sm"
                />
                <span className="text-xs text-text-muted block">
                  Giá này bao gồm công in 3D, vật liệu nhựa và phí hoàn thiện khắc laser.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-inset border border-border text-slate-300 hover:text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-900/30 flex items-center gap-1.5"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Xác Nhận Báo Giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
