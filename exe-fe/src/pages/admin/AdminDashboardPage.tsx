import { useState, useEffect } from 'react';
import { BarChart3, Printer, DollarSign, AlertTriangle, Users, PackageCheck, RotateCcw, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type AdminDashboardData } from '../../services/adminService';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAdminDashboard();
      if (res) {
        setData(res);
      }
    } catch (err: unknown) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
      setError('Không thể kết nối máy chủ để lấy số liệu thực tế.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Dashboard Báo Cáo Quản Trị Hệ Thống PrintHub</h1>
          </div>
          <p className="text-sm text-text-muted">
            Dữ liệu vận hành thời gian thực kết nối trực tiếp từ cơ sở dữ liệu hệ thống
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-[#39FF14] text-slate-200 hover:text-[#39FF14] text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
          <span>{loading ? 'Đang cập nhật...' : 'Cập nhật số liệu'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu thực tế */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex justify-between items-center text-text-muted text-xs">
            <span>Tổng Doanh Thu Thực Tế</span>
            <DollarSign className="w-4 h-4 text-[#22c55e]" />
          </div>
          <p className="text-2xl font-black text-white">
            {formatPrice(data?.totalRevenue ?? data?.paidAmount ?? 0)}đ
          </p>
          <span className="text-xs text-[#22c55e] font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Đơn đã thanh toán &amp; hoàn thành
          </span>
        </div>

        {/* Card 2: Đơn đang in/chuẩn bị */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex justify-between items-center text-text-muted text-xs">
            <span>Đơn Hàng Đang In &amp; Chuẩn Bị</span>
            <Printer className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {data?.activePrintingOrders ?? 0} Đơn
          </p>
          <span className="text-xs text-cyan-400 font-bold">
            Tiến trình in ấn gia công 3D
          </span>
        </div>

        {/* Card 3: Tổng đơn & hoàn tất */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex justify-between items-center text-text-muted text-xs">
            <span>Tổng Đơn / Đã Giao</span>
            <PackageCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {data?.completedCount ?? 0} / {data?.orderCount ?? 0} Đơn
          </p>
          <span className="text-xs text-purple-400 font-bold">
            +{data?.customCount ?? 0} yêu cầu in custom
          </span>
        </div>

        {/* Card 4: Tranh chấp & Người dùng */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex justify-between items-center text-text-muted text-xs">
            <span>Tranh Chấp Cần Duyệt</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">
            {data?.pendingDisputesCount ?? 0} Ca
          </p>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Tổng: {data?.totalUsersCount ?? 0} người dùng
          </span>
        </div>
      </div>

      {/* Production & Machine Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hàng Chờ Đơn In Live Stream (Print Job Queue)
            </h3>
            <span className="text-xs text-text-muted font-mono">
              {data?.recentJobs?.length || 0} đơn đang gia công
            </span>
          </div>

          <div className="divide-y divide-[#272930]/60 text-xs">
            {(!data?.recentJobs || data.recentJobs.length === 0) ? (
              <div className="py-8 text-center text-text-muted">
                Hiện tại không có đơn hàng nào đang ở hàng chờ in 3D.
              </div>
            ) : (
              data.recentJobs.map((j) => (
                <div key={j.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{j.item}</p>
                    <p className="text-xs text-text-muted">
                      Mã đơn: <span className="font-mono text-[#22c55e] font-semibold">#{j.id}</span> • Phân loại:{' '}
                      <span className="font-semibold text-purple-300">
                        {j.type === 'CUSTOM' ? 'Đơn In Custom' : 'Đơn Marketplace'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800">
                      {j.status}
                    </span>
                    {j.price && (
                      <p className="text-xs font-mono text-slate-400 mt-1">{formatPrice(j.price)}đ</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Warnings & Operational Status */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Trạng Thái Vận Hành Hệ Thống
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-inset border border-border text-slate-300 space-y-1">
              <p className="font-bold text-white flex items-center justify-between">
                <span>Cơ Sở Dữ Liệu PostgreSQL</span>
                <span className="text-emerald-400 font-bold">● Kết nối tốt</span>
              </p>
              <p className="text-text-muted text-xs">Đồng bộ tự động đơn hàng và thông số in 3D.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-inset border border-border text-slate-300 space-y-1">
              <p className="font-bold text-white flex items-center justify-between">
                <span>Cổng Thanh Toán PayOS &amp; COD</span>
                <span className="text-emerald-400 font-bold">● Đang hoạt động</span>
              </p>
              <p className="text-text-muted text-xs">Webhook thanh toán PayOS cập nhật tức thì.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-300 space-y-1">
              <p className="font-bold text-purple-200">Gia Công Đơn Custom Thước Kẻ</p>
              <p className="text-text-muted text-xs">
                {data?.customCount ?? 0} yêu cầu in cá nhân hóa đã được gửi vào hệ thống.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
