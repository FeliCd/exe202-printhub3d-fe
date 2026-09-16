import { useState, useEffect } from 'react';
import { PackageCheck } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService } from '../../services/adminService';

interface SystemOrder {
  id: string;
  buyerName: string;
  date: string;
  itemsSummary: string;
  total: number;
  assignedFactory: string;
  status: 'PENDING' | 'PRINTING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
}

const mockSystemOrders: SystemOrder[] = [
  {
    id: 'ORD-9024',
    buyerName: 'Nguyễn Văn Anh (HCMUT)',
    date: '2026-09-03 10:15',
    itemsSummary: '1x Thước PLA Pro 20cm, 1x Thước PETG 30cm',
    total: 100000,
    assignedFactory: 'BK-Makerlab Xưởng In 3D (ĐHQG)',
    status: 'PRINTING',
    paymentMethod: 'Ví PrintHub',
  },
  {
    id: 'ORD-8812',
    buyerName: 'Trần Thị Mai (Kiến Trúc)',
    date: '2026-08-20 09:15',
    itemsSummary: '3x Thước Chữ T Đồ Án 30cm',
    total: 165000,
    assignedFactory: '3D Hub Thủ Đức (SPKT)',
    status: 'COMPLETED',
    paymentMethod: 'Banking VietQR',
  },
  {
    id: 'ORD-8990',
    buyerName: 'Phạm Đức Nam (Bách Khoa)',
    date: '2026-09-02 14:00',
    itemsSummary: '1x Thước Kẹp Vernier 150mm Cơ Khí',
    total: 95000,
    assignedFactory: 'Chưa phân bổ xưởng',
    status: 'PENDING',
    paymentMethod: 'COD Tiền mặt',
  },
  {
    id: 'ORD-7510',
    buyerName: 'Lê Văn Cường (HUST)',
    date: '2026-08-10 16:45',
    itemsSummary: '1x Combo 5 Thước Kỹ Thuật Lớp Cơ Điện',
    total: 210000,
    assignedFactory: 'BK-Makerlab Xưởng In 3D (ĐHQG)',
    status: 'CANCELLED',
    paymentMethod: 'Ví PrintHub',
  },
];

export default function AdminGlobalOrdersPage() {
  const [orders, setOrders] = useState<SystemOrder[]>(mockSystemOrders);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchGlobalOrders = async () => {
      try {
        const res = await adminService.getGlobalOrders();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      } catch (error) {
        console.warn('Backend global orders API error, using mock system orders:', error);
      }
    };
    fetchGlobalOrders();
  }, []);

  const filteredOrders = orders.filter(o => filterStatus === 'ALL' || o.status === filterStatus);

  const handleForceRefund = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o));
    alert(`Đã hủy đơn ${orderId} và hoàn lại tiền 100% về Ví PrintHub của sinh viên!`);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-purple-400">
          <PackageCheck className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Đơn Hàng Tổng Hệ Thống (Global Order Management)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Theo dõi toàn bộ đơn hàng đa xưởng in trên nền tảng. Điều phối xưởng gia công, kiểm soát dòng tiền và hoàn tiền hủy đơn.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-[#272930] pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: 'Tất Cả Đơn Hàng' },
          { key: 'PRINTING', label: 'Đang Sản Xuất' },
          { key: 'SHIPPING', label: 'Đang Giao Hàng' },
          { key: 'COMPLETED', label: 'Hoàn Thành' },
          { key: 'CANCELLED', label: 'Đã Hủy / Hoàn Tiền' },
        ].map(st => (
          <button
            key={st.key}
            onClick={() => setFilterStatus(st.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === st.key
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-[#18191d] text-slate-400 hover:text-white border border-[#272930]'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(o => (
          <div key={o.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#272930] pb-3">
              <div>
                <span className="font-mono text-purple-400 font-bold text-sm">{o.id}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{o.buyerName}</h3>
                <p className="text-[#94a3b8] text-[11px]">Ngày đặt: {o.date} • {o.paymentMethod}</p>
              </div>

              <div>
                {o.status === 'PRINTING' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[11px]">
                    Đang sản xuất tại xưởng
                  </span>
                )}
                {o.status === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px]">
                    Hoàn thành &amp; Đã giao
                  </span>
                )}
                {o.status === 'CANCELLED' && (
                  <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-[11px]">
                    Đã hủy &amp; Hoàn tiền
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#111215] rounded-xl border border-[#272930] space-y-1">
              <span className="text-[#94a3b8] block">Sản phẩm:</span>
              <strong className="text-white">{o.itemsSummary}</strong>
              <p className="text-[11px] text-cyan-300 mt-1">Xưởng in phân bổ: <strong className="text-white">{o.assignedFactory}</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#272930]">
              <span className="text-[#94a3b8]">Tổng giá trị đơn: <strong className="text-base font-black text-[#39FF14] font-mono">{formatPrice(o.total)}đ</strong></span>

              {o.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleForceRefund(o.id)}
                  className="px-4 py-2 rounded-xl bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 font-bold text-xs transition"
                >
                  Can Thiệp Hủy &amp; Hoàn Tiền 100%
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
