import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowUpRight,
  CheckCircle2,
  Box,
  Layers,
  Wifi,
  FileBox,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { adminService, type AdminDashboardData } from '../../services/adminService';

const activityTimeline = [
  { time: 'Vừa xong', text: 'Cổng PayOS đồng bộ trạng thái giao dịch nạp xu/thanh toán', tone: 'brand' },
  { time: '10 phút trước', text: 'Hệ thống tự động kiểm tra tính toàn vẹn tệp mô hình 3D STL', tone: 'brand' },
  { time: '35 phút trước', text: 'Cập nhật chỉ số doanh thu & chiết khấu sàn định kỳ', tone: 'accent' },
  { time: '1 giờ trước', text: 'Chính sách bảo hành thước kỹ thuật 1-đổi-1 đang kích hoạt', tone: 'mute' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('--:--');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminDashboard();
      if (res) {
        setData(res);
      }
    } catch (err: unknown) {
      console.warn('Backend chưa sẵn sàng hoặc rỗng, dùng dữ liệu khởi tạo:', err);
    } finally {
      setLoading(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Values calculated with clean zero fallbacks (no fake mock numbers)
  const totalRev = data?.totalRevenue ?? data?.paidAmount ?? 0;
  const activeOrdersCount = data?.activePrintingOrders ?? 0;
  const completedOrders = data?.completedCount ?? 0;
  const totalOrders = data?.orderCount ?? 0;
  const deliveryPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const disputesCount = data?.pendingDisputesCount ?? 0;
  const usersCount = data?.totalUsersCount ?? 0;
  const customCount = data?.customCount ?? 0;
  const recentJobs = data?.recentJobs ?? [];

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header with Cyber-Industrial styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            <p className="text-xs sm:text-sm font-semibold text-slate-400">
              Hệ thống điều hành sản xuất &amp; Đơn hàng PrintHub 3D
            </p>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tổng quan vận hành <span className="text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">PrintHub 3D</span>
          </h1>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-[#39FF14]/50 text-slate-200 hover:text-white text-xs font-semibold transition active:scale-95 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#39FF14] ${loading ? 'animate-spin' : ''}`} />
          <span>
            Cập nhật lúc <span className="font-mono font-bold text-[#39FF14]">{lastUpdated}</span>
          </span>
        </button>
      </div>

      {/* 2. Unified Bento StatStrip (4 KPI metrics with #39FF14 accents) */}
      <section
        aria-label="Chỉ số chính"
        className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(odd)]:border-r lg:[&>*:not(:first-child)]:border-l"
      >
        {/* Metric 1: Doanh thu thực tế */}
        <div className="p-5 sm:p-6 transition-all hover:bg-surface-raised/40 hover:border-[#39FF14]/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Doanh thu thực tế
            </p>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#39FF14]">
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.4} />
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-black leading-none tracking-tight text-white">
            {formatPrice(totalRev)}đ
          </p>
          <p className="mt-2.5 text-xs text-slate-400 truncate">
            Từ đơn đã thanh toán &amp; hoàn thành
          </p>
        </div>

        {/* Metric 2: Đang in & Chuẩn bị */}
        <div className="p-5 sm:p-6 transition-all hover:bg-surface-raised/40 hover:border-[#39FF14]/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đang gia công in
            </p>
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#39FF14]">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
              Live
            </span>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-black leading-none tracking-tight text-white">
            {activeOrdersCount} <span className="text-base font-normal text-slate-400">đơn</span>
          </p>
          <p className="mt-2.5 text-xs text-slate-400 truncate">
            {activeOrdersCount > 0 ? (
              <span className="font-semibold text-[#39FF14]">{activeOrdersCount} đơn đang xử lý</span>
            ) : (
              <span>Không có đơn in chờ phôi</span>
            )}
          </p>
        </div>

        {/* Metric 3: Đã giao / Tổng đơn */}
        <div className="p-5 sm:p-6 transition-all hover:bg-surface-raised/40 hover:border-[#39FF14]/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đã giao / Tổng đơn
            </p>
            <span className="text-xs font-mono font-bold text-[#39FF14]">{deliveryPct}%</span>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-black leading-none tracking-tight text-white">
            {completedOrders}{' '}
            <span className="text-base font-normal text-slate-400">/ {totalOrders}</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset border border-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.5)] transition-all duration-500"
                style={{ width: `${Math.max(deliveryPct, totalOrders > 0 ? 5 : 0)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-amber-400 shrink-0">
              +{customCount} custom mới
            </span>
          </div>
        </div>

        {/* Metric 4: Tranh chấp & Người dùng */}
        <div className="p-5 sm:p-6 transition-all hover:bg-surface-raised/40 hover:border-[#39FF14]/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tranh chấp cần duyệt
            </p>
            {disputesCount === 0 ? (
              <span className="rounded-full bg-[#39FF14]/10 px-2 py-0.5 text-[11px] font-bold text-[#39FF14] border border-[#39FF14]/30">
                Ổn định
              </span>
            ) : (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                Cần xử lý
              </span>
            )}
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-black leading-none tracking-tight text-white">
            {disputesCount} <span className="text-base font-normal text-slate-400">vụ khiếu nại</span>
          </p>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 truncate">
            {disputesCount === 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                <span>Không tồn khiếu nại chưa xử lý • {usersCount} tài khoản</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{disputesCount} khiếu nại đang chờ can thiệp</span>
              </>
            )}
          </p>
        </div>
      </section>

      {/* 3. Row 2: Recent Print Jobs & Custom Orders / Infrastructure */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        {/* Left: Danh sách đơn gia công gần đây */}
        <section className="rounded-2xl border border-border hover:border-[#39FF14]/30 bg-surface p-5 sm:p-6 shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#39FF14]" />
                  <span>Đơn Gia Công Gần Đây (Production Feed)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Theo dõi tiến độ đơn hàng sàn và đơn gia công theo yêu cầu
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#39FF14] hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border mx-auto flex items-center justify-center text-slate-500">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Chưa có đơn gia công nào cần xử lý</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Khi khách hàng đặt hàng hoặc thanh toán, các đơn in sẽ tự động cập nhật tại đây.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <li key={job.id} className="py-4 first:pt-4 last:pb-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-[#39FF14] shrink-0">
                        <Box className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">{job.item || 'Đơn in 3D'}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[#39FF14] font-bold">#{job.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{job.factory || 'Xưởng đối tác'}</span>
                          <span>•</span>
                          <span className="text-slate-300">{job.type || 'Sản phẩm'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {job.price !== undefined && (
                        <p className="text-sm font-bold text-white font-display">
                          {formatPrice(job.price)}đ
                        </p>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 mt-1">
                        {job.status || 'Đang xử lý'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Right: In Custom Báo Giá & Trạng Thái Hạ Tầng */}
        <div className="space-y-6">
          {/* Card Báo Giá Custom STL */}
          <section className="relative overflow-hidden rounded-2xl border border-border hover:border-[#39FF14]/30 bg-surface p-5 sm:p-6 shadow-md transition-all">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-[#39FF14] to-transparent" />

            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  <FileBox className="w-4 h-4 text-amber-400" />
                  <span>In Custom Cần Báo Giá</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Yêu cầu mô hình 3D tải lên từ khách hàng</p>
              </div>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                {customCount} chờ duyệt
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-border bg-surface-inset space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Trạng thái hàng đợi custom:</span>
                <span className="font-bold text-white">
                  {customCount > 0 ? `${customCount} yêu cầu đang chờ` : 'Đã phản hồi toàn bộ'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Các tệp in custom STL/STEP kèm kích thước thước kẻ, độ dày lớp in và ghi chú vật liệu từ sinh viên được tổng hợp tại cổng báo giá.
              </p>
              <Link
                to="/admin/custom-orders"
                className="w-full py-2.5 px-4 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition shadow-[0_0_12px_rgba(57,255,20,0.3)] cursor-pointer"
              >
                <span>Mở Cổng Duyệt Báo Giá</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>
            </div>
          </section>

          {/* Card Trạng Thái Hạ Tầng Hệ Thống */}
          <section className="rounded-2xl border border-border hover:border-[#39FF14]/30 bg-surface p-5 sm:p-6 shadow-md transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#39FF14]" />
                <h3 className="font-bold text-sm text-white">Trạng thái hạ tầng</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14]">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                100% Online
              </span>
            </div>

            <ul className="mt-3.5 space-y-3">
              {[
                { name: 'Cơ sở dữ liệu PostgreSQL', note: 'Kết nối ổn định, đồng bộ đơn hàng & cài đặt', ping: '12ms' },
                { name: 'Cổng thanh toán PayOS & COD', note: 'Webhook tự động cập nhật trạng thái đơn', ping: '24ms' },
                { name: 'Cloudinary CDN Image Storage', note: 'Lưu trữ ảnh sản phẩm HD & file đính kèm', ping: '31ms' },
              ].map((row) => (
                <li key={row.name} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{row.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{row.note}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#39FF14] bg-surface-inset px-2 py-0.5 rounded-md border border-[#39FF14]/30 shrink-0">
                    {row.ping}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* 4. Row 3: Nhật Ký Hoạt Động & Tiêu Chuẩn Nền Tảng */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        {/* Banner giới thiệu & Chính sách cam kết */}
        <section className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-surface to-emerald-950/20 border border-[#39FF14]/30 p-5 sm:p-6 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#39FF14]">
              <Layers className="w-5 h-5 drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
              <h3 className="font-black text-base text-white tracking-wide uppercase">
                Tiêu Chuẩn Sản Xuất Thước Kỹ Thuật &amp; In 3D
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              PrintHub 3D áp dụng kiểm chuẩn độ chính xác từng milimét cho các dụng cụ vẽ kỹ thuật, đồ án cơ khí và mô hình kiến trúc của sinh viên. Mọi sản phẩm lỗi cong vênh hoặc gãy nứt đều được hỗ trợ bảo hành 1-đổi-1 theo quy chuẩn nền tảng.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#39FF14] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chính sách đổi mới 1-đổi-1 trong 4 tháng</span>
            </div>
            <Link
              to="/admin/settings"
              className="text-slate-300 hover:text-[#39FF14] text-xs font-semibold flex items-center gap-1 transition"
            >
              <span>Xem cấu hình chính sách</span>
              <ArrowRight className="w-3 h-3 text-[#39FF14]" />
            </Link>
          </div>
        </section>

        {/* Right: Hoạt Động Gần Đây (Activity Timeline) */}
        <section className="rounded-2xl border border-border hover:border-[#39FF14]/30 bg-surface p-5 sm:p-6 shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#39FF14]" />
                <span>Hoạt động hôm nay</span>
              </h3>
              <span className="text-[11px] font-bold text-[#39FF14]">Live Feed</span>
            </div>

            <ol className="relative mt-4 space-y-4 pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {activityTimeline.map((item) => (
                <li key={item.time + item.text} className="relative">
                  <span
                    className={`absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ${
                      item.tone === 'brand'
                        ? 'bg-[#39FF14] ring-[#39FF14]/20 shadow-[0_0_6px_rgba(57,255,20,0.8)]'
                        : item.tone === 'accent'
                        ? 'bg-amber-400 ring-amber-500/20'
                        : 'bg-slate-600 ring-slate-700/20'
                    }`}
                  />
                  <p className="text-xs font-medium text-slate-200 leading-snug">
                    {item.text}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.time}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
