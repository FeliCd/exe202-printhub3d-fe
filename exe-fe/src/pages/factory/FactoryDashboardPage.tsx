import { Factory, PackageCheck } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function FactoryDashboardPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Factory className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Dashboard Quản Lý Xưởng In 3D (Maker Hub)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Theo dõi đơn hàng gia công, hiệu suất cụm máy in và doanh thu tích lũy</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Doanh Thu Xưởng Tháng Này</p>
          <p className="text-2xl font-black text-white">{formatPrice(48500000)}đ</p>
          <span className="text-[10px] text-cyan-400 font-bold">Chiết khấu hệ thống 5%</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Lệnh In Đang Chạy</p>
          <p className="text-2xl font-black text-[#39FF14]">8 Máy</p>
          <span className="text-[10px] text-emerald-400 font-bold">128.4 giờ in tích lũy</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Đơn Chờ Nhận Lệnh</p>
          <p className="text-2xl font-black text-amber-400">5 Đơn</p>
          <span className="text-[10px] text-amber-400 font-bold">Cần tải file STL về slicer</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Đánh Giá Từ Sinh Viên</p>
          <p className="text-2xl font-black text-yellow-400">4.95 ★</p>
          <span className="text-[10px] text-[#94a3b8]">142 lượt phản hồi</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-cyan-400" /> Đơn Hàng Cần Xử Lý Báo Giá &amp; Gia Công
        </h3>

        <div className="divide-y divide-[#272930]/60 text-xs">
          {[
            { id: 'ORD-9024', name: 'Thước Kỹ Thuật PLA Pro 20cm (Khắc MSSV)', qty: 2, status: 'Đang In (Bambu X1C)', action: 'Cập nhật tiến độ' },
            { id: 'REQ-1092', name: 'Khung robot Mechatronics Custom (PETG)', qty: 1, status: 'Chờ xưởng duyệt file mesh', action: 'Gửi báo giá' },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{item.id}</span>
                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                <p className="text-[#94a3b8]">Số lượng: {item.qty} cái</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                  {item.status}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-[#22c55e] text-slate-950 font-bold text-xs">
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
