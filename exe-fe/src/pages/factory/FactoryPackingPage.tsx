import { useState } from 'react';
import { Truck, Printer, CheckCircle2, Box, Send } from 'lucide-react';

interface DispatchPackage {
  id: string;
  orderId: string;
  recipientName: string;
  shippingAddress: string;
  itemSummary: string;
  carrier: string;
  trackingNumber: string;
  status: 'READY_TO_PACK' | 'PACKED' | 'DISPATCHED';
}

const mockPackages: DispatchPackage[] = [
  {
    id: 'PKG-9024',
    orderId: 'ORD-9024',
    recipientName: 'Nguyễn Văn Anh (20210123)',
    shippingAddress: 'KTX Khu A, ĐHQG TP.HCM - Phòng 304 Nhà A12',
    itemSummary: '2x Thước Kỹ Thuật PLA Pro 20cm (Khắc Laser MSSV)',
    carrier: 'Giao Hàng Hỏa Tốc KTX (BK-Express)',
    trackingNumber: 'BKX-9024-88',
    status: 'READY_TO_PACK',
  },
  {
    id: 'PKG-8812',
    orderId: 'ORD-8812',
    recipientName: 'Trần Thị B',
    shippingAddress: 'KTX Đại Học Bách Khoa - Lý Thường Kiệt P14 Q10',
    itemSummary: '3x Thước Vuông Chữ T 30cm PETG',
    carrier: 'GrabExpress 2h',
    trackingNumber: 'GRB-8812-99',
    status: 'PACKED',
  },
];

export default function FactoryPackingPage() {
  const [packages, setPackages] = useState<DispatchPackage[]>(mockPackages);

  const handlePack = (id: string) => {
    setPackages(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'PACKED' as const } : p))
    );
  };

  const handleDispatch = (id: string) => {
    setPackages(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'DISPATCHED' as const } : p))
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Truck className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Đóng Gói &amp; Bàn Giao Vận Chuyển (Packing &amp; Handover)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Xác nhận đóng hộp chống sốc, in phôi phiếu xuất kho mã QR / Mã vận đơn và bàn giao cho Shipper KTX.
        </p>
      </div>

      <div className="space-y-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#272930] pb-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{pkg.id} • Mã đơn {pkg.orderId}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{pkg.recipientName}</h3>
                <p className="text-[#94a3b8] text-[11px]">{pkg.shippingAddress}</p>
              </div>

              <div>
                {pkg.status === 'READY_TO_PACK' && (
                  <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[11px] flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" /> Chờ Đóng Gói Khung Đệm
                  </span>
                )}
                {pkg.status === 'PACKED' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Đóng Hộp - Chờ Shipper
                  </span>
                )}
                {pkg.status === 'DISPATCHED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[11px] flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> Đã Bàn Giao Vận Chuyển
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#111215] rounded-xl border border-[#272930] space-y-1">
              <span className="text-[#94a3b8] block">Sản phẩm trong kiện hàng:</span>
              <strong className="text-white">{pkg.itemSummary}</strong>
              <p className="text-[11px] text-cyan-300 mt-1">Đơn vị vận chuyển: {pkg.carrier} • Mã VD: <span className="font-mono text-white">{pkg.trackingNumber}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#272930]">
              <button
                onClick={() => alert(`Đang in phiếu xuất kho & Mã vận đơn ${pkg.trackingNumber}...`)}
                className="px-3.5 py-2 rounded-xl bg-[#111215] border border-[#272930] hover:border-cyan-400 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-cyan-400" /> In Phiếu Vận Đơn Mã QR
              </button>

              <div className="flex items-center gap-2">
                {pkg.status === 'READY_TO_PACK' && (
                  <button
                    onClick={() => handlePack(pkg.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 flex items-center gap-1.5 transition shadow-md"
                  >
                    <Box className="w-4 h-4" /> Xác Nhận Đóng Hộp Chống Sốc
                  </button>
                )}

                {pkg.status === 'PACKED' && (
                  <button
                    onClick={() => handleDispatch(pkg.id)}
                    className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md"
                  >
                    <Send className="w-4 h-4" /> Bàn Giao Cho Shipper KTX
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
