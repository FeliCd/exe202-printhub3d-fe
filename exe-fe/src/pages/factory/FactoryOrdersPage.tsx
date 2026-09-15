import { useState } from 'react';
import { PackageCheck, Download, Printer } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function FactoryOrdersPage() {
  const [orders] = useState([
    { id: 'ORD-9024', item: 'Thước PLA Pro 20cm (Khắc MSSV)', buyer: 'Nguyễn Văn Anh', price: 45000, status: 'PRINTING' },
    { id: 'ORD-9023', item: 'Thước PETG Dẻo 30cm', buyer: 'Trần Thị B', price: 55000, status: 'PREPARING' },
    { id: 'ORD-8821', item: 'Thước Chữ T Kèm Thang Đo', buyer: 'Lê Văn C', price: 65000, status: 'COMPLETED' },
  ]);

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <PackageCheck className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Tiếp Nhận Đơn Hàng In 3D (Factory Orders)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Tải file 3D gcode/STL, chuẩn bị khay in và cập nhật tiến độ gia công</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#272930] pb-2.5">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{o.id}</span>
                <h3 className="font-bold text-white text-sm">{o.item}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                {o.status}
              </span>
            </div>

            <div className="flex justify-between items-center text-[#94a3b8]">
              <div>Sinh viên đặt: <strong className="text-white">{o.buyer}</strong></div>
              <div>Giá trị đơn: <strong className="text-[#39FF14]">{formatPrice(o.price)}đ</strong></div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#272930]">
              <button className="px-3.5 py-1.5 rounded-lg bg-[#111215] border border-[#272930] text-slate-200 font-bold flex items-center gap-1 hover:border-cyan-400">
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Tải Tệp CAD 3D (.STL)
              </button>
              <button className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] text-slate-950 font-bold flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> Chuyển Sang Máy In
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
