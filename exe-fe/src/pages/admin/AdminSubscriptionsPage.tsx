import { useState } from 'react';
import { Sparkles, Edit2, Users } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function AdminSubscriptionsPage() {
  const [plans] = useState([
    { id: '1', name: 'Maker Basic', price: 0, members: 1240, discount: 0 },
    { id: '2', name: 'Pro Student Member', price: 49000, members: 480, discount: 15 },
    { id: '3', name: 'Enterprise Factory Club', price: 199000, members: 62, discount: 30 },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-purple-400">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Gói Hội Viên Subscriptions Admin</h1>
        </div>
        <p className="text-sm text-text-muted">Cấu hình mức giá, quyền lợi chiết khấu và thống kê số lượng hội viên đăng ký</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <h3 className="font-bold text-white text-base">{p.name}</h3>
              <button aria-label="Chỉnh sửa gói hội viên" disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="p-1.5 rounded-lg bg-surface-inset text-slate-400 hover:text-white">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-white">{formatPrice(p.price)}đ / tháng</p>
              <p className="text-[#22c55e] font-bold">Chiết khấu in: {p.discount}%</p>
            </div>

            <div className="p-3 bg-surface-inset rounded-xl border border-border flex items-center justify-between text-text-muted">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-400" /> Thành viên đăng ký:</span>
              <strong className="text-white font-mono text-sm">{p.members} user</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
