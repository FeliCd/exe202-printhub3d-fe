import { useState } from 'react';
import { Package, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatPrice } from '../utils/format';
import type { Order } from '../types';
import { Link } from 'react-router-dom';

const mockOrders: Order[] = [
  {
    id: 'ORD-9024',
    date: '2026-09-03 10:15',
    items: [
      {
        id: 'ci-1',
        product: {
          id: 'ruler-pla-20cm',
          name: 'Th╞░ß╗¢c Kß╗╣ Thuß║¡t PLA Pro 20cm (Khß║»c T├¬n/MSSV)',
          category: 'Khß║»c t├¬n ri├¬ng / MSSV',
          categoryColor: 'text-emerald-400',
          material: 'PLA PRO+',
          originalPrice: 55000,
          price: 45000,
          description: '',
          badgeText: '',
          badgeColor: 'emerald',
          materialBadge: 'PLA PRO+',
          thumbnail: 'ruler-20cm',
        },
        quantity: 1,
        engraving: '20210123 - Nguyß╗àn V─ân Anh',
      },
      {
        id: 'ci-2',
        product: {
          id: 'ruler-petg-30cm',
          name: 'Th╞░ß╗¢c Thß║│ng Kh├íng G├úy PETG 30cm',
          category: 'Nhß╗▒a PETG Kh├íng Va ─Éß║¡p',
          categoryColor: 'text-cyan-400',
          material: 'PETG',
          originalPrice: 70000,
          price: 55000,
          description: '',
          badgeText: '',
          badgeColor: 'amber',
          materialBadge: 'PETG CHß╗ÉNG G├âY',
          thumbnail: 'ruler-30cm',
        },
        quantity: 1,
        colorOption: 'Xanh Neon Glow',
      },
    ],
    totalAmount: 100000,
    status: 'PRINTING',
    shippingAddress: {
      id: 'a1',
      name: 'Nguyß╗àn V─ân Anh',
      phone: '0987.654.321',
      address: 'Ph├▓ng 402, KTX Khu B ─Éß║íi Hß╗ìc Quß╗æc Gia TP.HCM',
      isDefault: true,
    },
    paymentMethod: 'WALLET',
    printerAssigned: 'M├íy In 3D Bambu Lab X1C #04',
    factoryName: 'X╞░ß╗ƒng In B├ích Khoa Makerlab',
    trackingNumber: 'SPX-BK98212',
  },
  {
    id: 'ORD-8710',
    date: '2026-08-25 14:20',
    items: [
      {
        id: 'ci-3',
        product: {
          id: 'ruler-t-square',
          name: 'Th╞░ß╗¢c ─Éo G├│c Chß╗» T K├¿m Thang ─Éo K├⌐p',
          category: '─Éo g├│c chß╗» T FDM',
          categoryColor: 'text-purple-400',
          material: 'PLA+',
          originalPrice: 85000,
          price: 65000,
          description: '',
          badgeText: '',
          badgeColor: 'purple',
          materialBadge: 'TH╞»ß╗ÜC CHß╗« T',
          thumbnail: 'ruler-t',
        },
        quantity: 1,
      },
    ],
    totalAmount: 65000,
    status: 'COMPLETED',
    shippingAddress: {
      id: 'a1',
      name: 'Nguyß╗àn V─ân Anh',
      phone: '0987.654.321',
      address: 'Ph├▓ng 402, KTX Khu B ─Éß║íi Hß╗ìc Quß╗æc Gia TP.HCM',
      isDefault: true,
    },
    paymentMethod: 'WALLET',
  },
];

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">─É├â TIß║╛P NHß║¼N</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">CHUß║¿N Bß╗è FILE 3D</span>;
      case 'PRINTING':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#22c55e] border border-[#22c55e]/40 text-xs font-bold animate-pulse">─ÉANG IN 3D</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold">─ÉANG GIAO H├ÇNG</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold">HO├ÇN TH├ÇNH</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">─É├â Hß╗ªY</span>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-white">
          <Package className="w-6 h-6 text-[#22c55e]" />
          <h1 className="text-2xl font-black">Theo D├╡i ─É╞ín H├áng In 3D &amp; Lß╗ïch Sß╗¡ Mua H├áng</h1>
        </div>
        <p className="text-sm text-text-muted">Theo d├╡i tiß║┐n ─æß╗Ö gia c├┤ng thß╗▒c tß║┐ tr├¬n hß╗ç thß╗æng m├íy in 3D c├┤ng nghiß╗çp</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="p-6 rounded-2xl bg-surface border border-border space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-text-muted">M├ú ─æ╞ín: </span>
                <span className="text-sm font-black text-white font-mono">{order.id}</span>
                <span className="text-xs text-text-muted ml-3">ΓÇó {order.date}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="p-4 rounded-xl bg-surface-inset border border-border space-y-3">
              <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22c55e]" /> Trß║íng Th├íi Tiß║┐n ─Éß╗Ö Sß║ún Xuß║Ñt In 3D Real-time:
              </p>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold text-center">
                <div className="p-2 rounded-lg bg-emerald-950 text-[#22c55e] border border-emerald-800">
                  1. Tiß║┐p nhß║¡n
                </div>
                <div className={`p-2 rounded-lg border ${order.status === 'PRINTING' || order.status === 'SHIPPING' || order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-surface text-slate-500 border-border'}`}>
                  2. ─Éang In 3D
                </div>
                <div className={`p-2 rounded-lg border ${order.status === 'SHIPPING' || order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-surface text-slate-500 border-border'}`}>
                  3. ─Éang Giao Ship
                </div>
                <div className={`p-2 rounded-lg border ${order.status === 'COMPLETED' ? 'bg-emerald-950 text-[#22c55e] border-emerald-800' : 'bg-surface text-slate-500 border-border'}`}>
                  4. Ho├án Th├ánh
                </div>
              </div>

              {order.printerAssigned && (
                <div className="text-xs text-slate-300 pt-1 flex items-center justify-between">
                  <span>M├íy in ph├ón bß╗ò: <strong className="text-[#22c55e] font-mono">{order.printerAssigned}</strong></span>
                  <span>X╞░ß╗ƒng phß╗Ñ tr├ích: <strong className="text-white">{order.factoryName}</strong></span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="divide-y divide-[#272930]/60">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{item.product.name}</p>
                    {item.engraving && <p className="text-emerald-400 font-medium">Khß║»c: "{item.engraving}"</p>}
                    <p className="text-text-muted">Sß╗æ l╞░ß╗úng: {item.quantity}</p>
                  </div>
                  <span className="font-black text-white">{formatPrice(item.product.price * item.quantity)}─æ</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-text-muted">Tß╗òng thanh to├ín: </span>
                <span className="text-base font-black text-[#22c55e]">{formatPrice(order.totalAmount)}─æ</span>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/warranty"
                  className="px-3.5 py-1.5 rounded-xl bg-surface-raised hover:bg-[#272930] text-slate-300 hover:text-white text-xs font-bold border border-border flex items-center gap-1.5 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> ─Éß╗òi Trß║ú / Bß║úo H├ánh
                </Link>
                <Link
                  to="/disputes"
                  className="px-3.5 py-1.5 rounded-xl bg-surface-raised hover:bg-[#272930] text-slate-300 hover:text-white text-xs font-bold border border-border flex items-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Mß╗ƒ Khiß║┐u Nß║íi
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}