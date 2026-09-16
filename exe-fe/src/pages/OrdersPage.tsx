import { useState, useEffect } from 'react';
import { Package, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatPrice } from '../utils/format';
import type { Order } from '../types';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await orderService.getUserOrders();
        const rawList = res?.result?.content || res?.result || res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: Order[] = rawList.map((o: any, idx: number) => ({
            id: o.orderCode || o.code || (o.id ? (String(o.id).length > 12 ? `#${String(o.id).substring(0, 8).toUpperCase()}` : String(o.id)) : `ORD-${idx + 1}`),
            date: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : (o.orderDate || o.date || 'Gần đây'),
            items: Array.isArray(o.items || o.orderDetails) ? (o.items || o.orderDetails).map((it: any, i: number) => ({
              id: it.id || `ci-${i}`,
              product: it.product || {
                id: it.productId || `prod-${i}`,
                name: it.productName || it.title || it.name || 'Thước In 3D Kỹ Thuật',
                category: 'Thước Kỹ Thuật',
                categoryColor: 'text-emerald-400',
                material: it.material || 'PLA PRO+',
                originalPrice: it.price || 50000,
                price: it.price || 45000,
                description: '',
                badgeText: '',
                badgeColor: 'emerald',
                materialBadge: 'CHÍNH HÃNG',
                thumbnail: 'ruler-20cm',
              },
              quantity: it.quantity || 1,
              engraving: it.engravingText || it.engraving || '',
              colorOption: it.color || it.colorOption || '',
            })) : [],
            totalAmount: Number(o.totalAmount || o.total || o.amount || 0),
            status: o.status || 'PENDING',
            shippingAddress: o.shippingAddress || {
              id: 'addr-def',
              name: o.recipientName || 'Khách hàng',
              phone: o.phone || '',
              address: o.address || o.street || '',
              isDefault: true,
            },
            paymentMethod: o.paymentMethod || 'PAYOS',
            printerAssigned: o.printerAssigned,
            factoryName: o.factoryName,
            trackingNumber: o.trackingNumber,
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.warn('Backend orders API error:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">ĐÃ TIẾP NHẬN</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">CHUẨN BỊ FILE 3D</span>;
      case 'PRINTING':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#22c55e] border border-[#22c55e]/40 text-[10px] font-bold animate-pulse">ĐANG IN 3D</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">ĐANG GIAO HÀNG</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold">HOÀN THÀNH</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">ĐÃ HỦY</span>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-white">
          <Package className="w-6 h-6 text-[#22c55e]" />
          <h1 className="text-2xl font-black">Theo Dõi Đơn Hàng In 3D &amp; Lịch Sử Mua Hàng</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Theo dõi tiến độ gia công thực tế trên hệ thống máy in 3D công nghiệp</p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải danh sách đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#18191d] border border-[#272930] p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Bạn chưa có đơn hàng nào</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Các đơn đặt in 3D và tiến độ sản xuất sẽ được cập nhật trực tiếp tại đây sau khi bạn đặt hàng thành công.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#22c55e] text-slate-950 font-bold text-xs hover:bg-[#16a34a] transition"
          >
            Khám Phá Thước In 3D Ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 rounded-2xl bg-[#18191d] border border-[#272930] space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#272930] pb-4">
                <div>
                  <span className="text-xs text-[#94a3b8]">Mã đơn: </span>
                  <span className="text-sm font-black text-white font-mono">{order.id}</span>
                  <span className="text-xs text-[#94a3b8] ml-3">• {order.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="p-4 rounded-xl bg-[#111215] border border-[#272930] space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#22c55e]" /> Trạng Thái Tiến Độ Sản Xuất In 3D Real-time:
                </p>
                <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-center">
                  <div className="p-2 rounded-lg bg-emerald-950 text-[#22c55e] border border-emerald-800">
                    1. Tiếp nhận
                  </div>
                  <div className={`p-2 rounded-lg border ${order.status === 'PRINTING' || order.status === 'SHIPPING' || order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-[#18191d] text-slate-500 border-[#272930]'}`}>
                    2. Đang In 3D
                  </div>
                  <div className={`p-2 rounded-lg border ${order.status === 'SHIPPING' || order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-[#18191d] text-slate-500 border-[#272930]'}`}>
                    3. Đang Giao Ship
                  </div>
                  <div className={`p-2 rounded-lg border ${order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-[#18191d] text-slate-500 border-[#272930]'}`}>
                    4. Hoàn Thành
                  </div>
                </div>

                {order.printerAssigned && (
                  <div className="text-[11px] text-slate-300 pt-1 flex items-center justify-between">
                    <span>Máy in phân bổ: <strong className="text-[#22c55e] font-mono">{order.printerAssigned}</strong></span>
                    <span>Xưởng phụ trách: <strong className="text-white">{order.factoryName}</strong></span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="divide-y divide-[#272930]/60">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{item.product.name}</p>
                      {item.engraving && <p className="text-emerald-400 font-medium">Khắc: "{item.engraving}"</p>}
                      <p className="text-[#94a3b8]">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="font-black text-white">{formatPrice(item.product.price * item.quantity)}đ</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#272930] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#94a3b8]">Tổng thanh toán: </span>
                  <span className="text-base font-black text-[#22c55e]">{formatPrice(order.totalAmount)}đ</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/warranty"
                    className="px-3.5 py-1.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-slate-300 hover:text-white text-xs font-bold border border-[#272930] flex items-center gap-1.5 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Đổi Trả / Bảo Hành
                  </Link>
                  <Link
                    to="/disputes"
                    className="px-3.5 py-1.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-slate-300 hover:text-white text-xs font-bold border border-[#272930] flex items-center gap-1.5 transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Mở Khiếu Nại
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
