import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, RefreshCw, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { formatPrice } from '../utils/format';

interface PastOrder {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number; material: string }[];
  total: number;
  status: 'COMPLETED' | 'CANCELLED' | 'SHIPPING';
  paymentMethod: string;
}

const mockPastOrders: PastOrder[] = [
  {
    id: 'ORD-9024',
    date: '2026-09-01 14:30',
    items: [
      { name: 'Thước Kỹ Thuật 20cm Khắc Tên/MSSV Laser', qty: 2, price: 45000, material: 'PLA Pro (Green)' },
      { name: 'Thước Kẹp Vernier 150mm Cơ Khí', qty: 1, price: 95000, material: 'Resin UV' },
    ],
    total: 185000,
    status: 'SHIPPING',
    paymentMethod: 'Ví PrintHub',
  },
  {
    id: 'ORD-8812',
    date: '2026-08-20 09:15',
    items: [
      { name: 'Thước Vuông Chữ T Đồ Án Kiến Trúc 30cm', qty: 3, price: 55000, material: 'PETG Clear' },
    ],
    total: 165000,
    status: 'COMPLETED',
    paymentMethod: 'Banking VietQR',
  },
  {
    id: 'ORD-7510',
    date: '2026-07-10 16:45',
    items: [
      { name: 'Combo 5 Thước Kỹ Thuật Lớp Cơ Điện', qty: 1, price: 210000, material: 'PLA Pro' },
    ],
    total: 210000,
    status: 'CANCELLED',
    paymentMethod: 'Ví PrintHub',
  },
];

export default function OrderHistoryPage() {
  const [tab, setTab] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const navigate = useNavigate();

  const filteredOrders = mockPastOrders.filter(o => {
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
        <p className="text-sm text-text-muted">
          Xem lại toàn bộ lịch sử đơn hàng in 3D đã thực hiện và mua lại (Re-order) chỉ với 1 thao tác bấm.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
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
                : 'bg-surface text-slate-400 hover:text-white border border-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-[#39FF14] font-bold text-sm">{order.id}</span>
                <p className="text-text-muted text-sm">Ngày đặt: {order.date} • {order.paymentMethod}</p>
              </div>

              <div>
                {order.status === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                  </span>
                )}
                {order.status === 'CANCELLED' && (
                  <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-xs flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Đã hủy
                  </span>
                )}
                {order.status === 'SHIPPING' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs flex items-center gap-1">
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
                    <p className="text-text-muted text-sm">Chất liệu: {item.material} • Số lượng: {item.qty}</p>
                  </div>
                  <strong className="text-slate-200 font-mono text-xs">{formatPrice(item.price * item.qty)}đ</strong>
                </div>
              ))}
            </div>

            {/* Order Bottom */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Tổng giá trị đơn:</span>
                <span className="text-base font-black text-[#39FF14] font-mono">{formatPrice(order.total)}đ</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="px-3.5 py-2 rounded-xl bg-surface-inset border border-border hover:border-[#39FF14] text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition"
                >
                  <Eye className="w-4 h-4 text-[#39FF14]" /> Xem Tiến Độ
                </Link>
                <button
                  onClick={() => handleReorder(order.id)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black flex items-center gap-1.5 transition shadow-md shadow-emerald-950/40"
                >
                  <RefreshCw className="w-4 h-4" /> Mua Lại / In Lại
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}