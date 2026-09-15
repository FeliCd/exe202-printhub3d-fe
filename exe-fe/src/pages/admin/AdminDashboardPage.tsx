import { BarChart3, Printer, DollarSign, AlertTriangle, Cpu, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const { lockAccount } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Dashboard Báo Cáo Quản Trị Hệ Thống PrintHub</h1>
          </div>
          <p className="text-xs text-[#94a3b8]">Tổng quan chỉ số doanh thu, công suất máy in 3D và cảnh báo sự cố toàn hệ thống</p>
        </div>

        <button
          onClick={() => lockAccount('Tài khoản bị gắn cờ vi phạm quy định đền bù chất lượng in.')}
          className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-400 text-xs font-bold flex items-center gap-1.5 transition"
        >
          <AlertTriangle className="w-4 h-4" /> Mô Phỏng Khóa Cảnh Báo Tài Khoản
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <div className="flex justify-between items-center text-[#94a3b8] text-xs">
            <span>Tổng Doanh Thu</span>
            <DollarSign className="w-4 h-4 text-[#22c55e]" />
          </div>
          <p className="text-2xl font-black text-white">{formatPrice(128450000)}đ</p>
          <span className="text-[10px] text-[#22c55e] font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4% so với tháng trước
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <div className="flex justify-between items-center text-[#94a3b8] text-xs">
            <span>Đơn Hàng Đang In Live</span>
            <Printer className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">42 Đơn</p>
          <span className="text-[10px] text-cyan-400 font-bold">14 xưởng in đang hoạt động</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <div className="flex justify-between items-center text-[#94a3b8] text-xs">
            <span>Hiệu Suất Máy In SLA/FDM</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">88.5%</p>
          <span className="text-[10px] text-purple-400 font-bold">38 / 42 máy in đang chạy</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <div className="flex justify-between items-center text-[#94a3b8] text-xs">
            <span>Tranh Chấp Cần Duyệt</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">3 Ca</p>
          <span className="text-[10px] text-red-400 font-bold">Cần quyết định bồi hoàn</span>
        </div>
      </div>

      {/* Production & Machine Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hàng Chờ Đơn In Live Stream (Print Job Queue)</h3>

          <div className="divide-y divide-[#272930]/60 text-xs">
            {[
              { id: 'ORD-9024', item: 'Thước PLA Pro 20cm (Khắc MSSV)', factory: 'BK Makerlab #02', status: '85% (Bambu X1C)' },
              { id: 'ORD-9023', item: 'Thước PETG Dẻo 30cm', factory: 'Xưởng In Quận 10', status: '40% (Ender 3 V3)' },
              { id: 'ORD-9020', item: 'Khung Robot Mechatronics Custom', factory: 'Formlabs SLA Hub', status: '15% (Form 3+)' },
            ].map((j, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{j.item}</p>
                  <p className="text-[10px] text-[#94a3b8]">Mã đơn: <span className="font-mono text-[#22c55e]">{j.id}</span> • Xưởng: {j.factory}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Warnings */}
        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Cảnh Báo Phạt &amp; Sự Cố Máy In
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300">
              <p className="font-bold">Xưởng BK-Maker quá hạn đơn #ORD-8910</p>
              <p className="text-[10px] opacity-80 mt-0.5">Tự động trừ 10.000đ phí phạt giao trễ vào ví ký quỹ xưởng.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300">
              <p className="font-bold">Máy in Formlabs SLA #02 báo tắc đầu phun</p>
              <p className="text-[10px] opacity-80 mt-0.5">Yêu cầu bảo trì thay khay nhựa chứa UV resin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
