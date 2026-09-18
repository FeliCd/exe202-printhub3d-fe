import { useState, useEffect } from 'react';
import { Factory, CheckCircle2, XCircle, Plus, Star, MapPin } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService } from '../../services/adminService';

interface PartnerFactory {
  id: string;
  name: string;
  location: string;
  printersCount: number;
  completedJobs: number;
  rating: number;
  commissionRate: number;
  totalEarnings: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

const mockFactories: PartnerFactory[] = [
  {
    id: 'FAC-001',
    name: 'BK-Makerlab Xưởng In 3D (ĐHQG TP.HCM)',
    location: 'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
    printersCount: 12,
    completedJobs: 1450,
    rating: 4.95,
    commissionRate: 5, // 5% platform fee
    totalEarnings: 82500000,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-002',
    name: 'HUST 3D Print Lab (Bách Khoa HN)',
    location: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    printersCount: 8,
    completedJobs: 890,
    rating: 4.88,
    commissionRate: 5,
    totalEarnings: 45200000,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-003',
    name: 'HCMUTE Prototype Hub (Sư Phạm Kỹ Thuật)',
    location: '01 Võ Văn Ngân, Thủ Đức, TP.HCM',
    printersCount: 6,
    completedJobs: 420,
    rating: 4.75,
    commissionRate: 5,
    totalEarnings: 21800000,
    status: 'SUSPENDED',
  },
];

export default function AdminFactoriesPage() {
  const [factories, setFactories] = useState<PartnerFactory[]>(mockFactories);

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const res = await adminService.getFactories();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setFactories(data);
        }
      } catch (error) {
        console.warn('Backend factories API error, using mock factories:', error);
      }
    };
    fetchFactories();
  }, []);

  const toggleFactoryStatus = (id: string) => {
    setFactories(prev =>
      prev.map(f => (f.id === id ? { ...f, status: f.status === 'ACTIVE' ? ('SUSPENDED' as const) : ('ACTIVE' as const) } : f))
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <Factory className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Xưởng In Đối Tác (Platform Partners)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Mô hình Sàn đa xưởng (Multi-vendor Platform). Admin quản lý cấp phép xưởng in, tỷ lệ chiết khấu sàn 5% và điểm đánh giá uy tín.
          </p>
        </div>

        <button disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="px-4 py-2.5 rounded-xl bg-purple-500 text-white font-black text-xs hover:bg-purple-600 transition flex items-center gap-2 shadow-lg shrink-0">
          <Plus className="w-4 h-4" /> Cấp Phép Xưởng In Mới
        </button>
      </div>

      <div className="space-y-4">
        {factories.map(f => (
          <div key={f.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-purple-400 font-bold">{f.id} • Chiết khấu sàn {f.commissionRate}%</span>
                <h3 className="font-bold text-white text-base mt-0.5">{f.name}</h3>
                <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-purple-400 shrink-0" /> {f.location}
                </p>
              </div>

              <div>
                {f.status === 'ACTIVE' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đang Hoạt Động
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-xs flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Tạm Tắt Hoạt Động
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-inset rounded-xl border border-border">
              <div>
                <span className="text-text-muted block">Cụm máy in:</span>
                <strong className="text-white">{f.printersCount} máy (FDM/SLA)</strong>
              </div>
              <div>
                <span className="text-text-muted block">Đơn đã gia công:</span>
                <strong className="text-[#39FF14]">{f.completedJobs} đơn hàng</strong>
              </div>
              <div>
                <span className="text-text-muted block">Đánh giá trung bình:</span>
                <strong className="text-yellow-400 flex items-center gap-1">{f.rating} <Star className="w-3 h-3 fill-yellow-400" /></strong>
              </div>
              <div>
                <span className="text-text-muted block">Tổng doanh thu xưởng:</span>
                <strong className="text-cyan-300 font-mono">{formatPrice(f.totalEarnings)}đ</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-text-muted">Trạng thái kiểm định thiết bị: <strong className="text-emerald-400">Đã xác minh ISO 9001</strong></span>

              <button
                onClick={() => toggleFactoryStatus(f.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                  f.status === 'ACTIVE'
                    ? 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                    : 'bg-emerald-950 text-[#39FF14] border border-emerald-800 hover:bg-emerald-900'
                }`}
              >
                {f.status === 'ACTIVE' ? 'Tạm Dừng Hoạt Động Xưởng' : 'Mở Lại Cấp Phép Xưởng'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
