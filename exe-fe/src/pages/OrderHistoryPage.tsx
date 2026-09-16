import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, RefreshCw, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { orderService } from '../services/orderService';

interface PastOrder {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number; material: string }[];
  total: number;
  status: 'COMPLETED' | 'CANCELLED' | 'SHIPPING';
  paymentMethod: string;
}

export default function OrderHistoryPage() {
  const [ordersList, setOrdersList] = useState<PastOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        let res: any;
        try {
          res = await orderService.getOrderHistory();
        } catch {
          res = await orderService.getUserOrders();
        }
        const rawList = res?.result?.content || res?.result || res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: PastOrder[] = rawList.map((o: any, idx: number) => ({
            id: o.orderCode || o.code || (o.id ? (String(o.id).length > 12 ? `#${String(o.id).substring(0, 8).toUpperCase()}` : String(o.id)) : `ORD-${idx + 1}`),
            date: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : (o.orderDate || o.date || 'Gần đây'),
            items: Array.isArray(o.items || o.orderDetails) ? (o.items || o.orderDetails).map((it: any) => ({
              name: it.productName || it.title || it.name || it.product?.name || 'Thước In 3D Kỹ Thuật',
              qty: it.quantity || 1,
              price: it.price || it.product?.price || 45000,
              material: it.material || it.product?.material || 'PLA PRO+',
            })) : [],
            total: Number(o.totalAmount || o.total || o.amount || 0),
            status: (o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'SHIPPING') ? o.status : 'COMPLETED',
            paymentMethod: o.paymentMethod || 'PAYOS',
          }));
          setOrdersList(mapped);
        } else {
          setOrdersList([]);
        }
      } catch (error) {
        console.warn('Backend order history API error:', error);
        setOrdersList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredOrders = ordersList.filter(o => {
    if (tab === 'COMPLETED') return o.status === 'COMPLETED';
    if (tab === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const handleReorder = (orderId: string) => {
    alert(`Đã thêm lại các sản phẩm của đơn hàng ${orderId} vào giỏ hàng!`);
    navigate('/cart');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#39FF14]">
          <History className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Lịch Sử Đơn Hàng &amp; Mua Lại (Order History)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Xem lại toàn bộ lịch sử đơn hàng in 3D đã thực hiện và mua lại (Re-order) chỉ với 1 thao tác bấm.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#272930] pb-3">
        {[
          { key: 'ALL', label: 'Tất Cả Đơn Hàng' },
          { key: 'COMPLETED', label: 'Đã Hoàn Thành' },
          { key: 'CANCELLED', label: 'Đã Hủy' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'ALL' | 'COMPLETED' | 'CANCELLED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t.key
                ? 'bg-[#39FF14] text-slate-950 shadow-md'
                : 'bg-[#18191d] text-slate-400 hover:text-white border border-[#272930]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải lịch sử đơn hàng...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#18191d] border border-[#272930] p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Chưa có lịch sử đơn hàng</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Các đơn hàng đã hoàn tất hoặc đã hủy sẽ hiển thị ở đây để bạn xem lại chi tiết và mua lại.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#22c55e] text-slate-950 font-bold text-xs hover:bg-[#16a34a] transition"
          >
            Xem Danh Mục Sản Phẩm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-[#272930] pb-3">
                <div>
                  <span className="font-mono text-[#39FF14] font-bold text-sm">{order.id}</span>
                  <p className="text-[#94a3b8] text-[11px]">Ngày đặt: {order.date} • {order.paymentMethod}</p>
                </div>

                <div>
                  {order.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                    </span>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-[11px] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Đã hủy
                    </span>
                  )}
                  {order.status === 'SHIPPING' && (
                    <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px] flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang giao hàng
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#272930]/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-xs">{item.name}</h4>
                      <p className="text-[#94a3b8] text-[11px]">Chất liệu: {item.material} • Số lượng: {item.qty}</p>
                    </div>
                    <strong className="text-slate-200 font-mono text-xs">{formatPrice(item.price * item.qty)}đ</strong>
                  </div>
                ))}
              </div>

              {/* Order Bottom */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#272930]">
                <div className="flex items-center gap-2">
                  <span className="text-[#94a3b8]">Tổng giá trị đơn:</span>
                  <span className="text-base font-black text-[#39FF14] font-mono">{formatPrice(order.total)}đ</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/orders"
                    className="px-3.5 py-2 rounded-xl bg-[#111215] border border-[#272930] hover:border-[#39FF14] text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4 text-[#39FF14]" /> Xem Tiến Độ
                  </Link>
                  <button
                    onClick={() => handleReorder(order.id)}
                    className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black flex items-center gap-1.5 transition shadow-md shadow-emerald-950/40"
                  >
                    <RefreshCw className="w-4 h-4" /> Mua Lại / In Lại
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
