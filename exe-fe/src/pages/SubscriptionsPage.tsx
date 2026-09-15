import { useState } from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/format';
import type { SubscriptionPlan } from '../types';

const plans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Maker Basic',
    price: 0,
    period: 'month',
    description: 'Miễn phí cho mọi sinh viên mới đăng ký tài khoản PrintHub',
    features: [
      'Khắc tên & MSSV miễn phí',
      'Bảo hành gãy 1-đổi-1 trong 1 học kỳ',
      'Hỗ trợ công cụ đo 3D trên trình duyệt',
      'Đặt in lẻ tối đa 5 thước/tháng',
    ],
    discountPercent: 0,
    freeShippingCount: 1,
  },
  {
    id: 'plan-pro',
    name: 'Pro Student Member',
    price: 49000,
    period: 'month',
    badge: 'HOT - SINH VIÊN TIN DÙNG',
    description: 'Dành cho sinh viên ngành Cơ khí, Điện tử & Kiến trúc',
    features: [
      'Giảm 15% tất cả đơn hàng thước in 3D',
      'Miễn phí 5 lượt ship KTX hàng tháng',
      'Ưu tiên xếp hàng máy in FDM/SLA siêu tốc',
      'Tặng gói bảo hành VIP chống vênh nhiệt 12 tháng',
    ],
    discountPercent: 15,
    freeShippingCount: 5,
    isPopular: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Factory Club',
    price: 199000,
    period: 'month',
    description: 'Dành cho Câu lạc bộ Robot, Đồ án tốt nghiệp & Xưởng in',
    features: [
      'Giảm 30% giá in 3D theo tệp tùy chỉnh',
      'Miễn phí vận chuyển toàn bộ đơn hàng',
      'Phân bổ máy in riêng (Bambu Lab X1C / Form3)',
      'Hỗ trợ tư vấn tối ưu hóa file CAD 1-on-1',
    ],
    discountPercent: 30,
    freeShippingCount: 99,
  },
];

export default function SubscriptionsPage() {
  const [activePlan, setActivePlan] = useState('plan-pro');
  const [upgraded, setUpgraded] = useState(false);

  return (
    <div className="space-y-8 w-full">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Gói Hội Viên Ưu Đãi Sinh Viên
        </div>
        <h1 className="text-3xl font-black text-white">Nâng Cấp Gói Hội Viên PrintHub</h1>
        <p className="text-xs text-[#94a3b8]">
          Tối ưu chi phí đồ án, nhận chiết khấu in 3D lên đến 30% và miễn phí ship KTX hàng tháng.
        </p>
      </div>

      {upgraded && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#22c55e]" /> Bạn đã đăng ký thành công Gói Pro Student Member!
        </div>
      )}

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-3xl bg-[#18191d] border relative flex flex-col justify-between space-y-6 transition ${
              plan.isPopular
                ? 'border-[#22c55e] shadow-2xl shadow-emerald-950/50'
                : 'border-[#272930] hover:border-slate-500'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22c55e] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                {plan.badge}
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-white">{plan.name}</h3>
                <p className="text-xs text-[#94a3b8] mt-1">{plan.description}</p>
              </div>

              <div className="text-2xl font-black text-white">
                {plan.price === 0 ? '0 VNĐ' : `${formatPrice(plan.price)}đ`}
                <span className="text-xs font-normal text-[#94a3b8]"> /{plan.period}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#272930] text-xs">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActivePlan(plan.id);
                setUpgraded(true);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs transition ${
                activePlan === plan.id
                  ? 'bg-[#22c55e] text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#1e2025] hover:bg-[#272930] text-white border border-[#272930]'
              }`}
            >
              {activePlan === plan.id ? 'Gói Đang Sử Dụng' : 'Đăng Ký Nâng Cấp'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
