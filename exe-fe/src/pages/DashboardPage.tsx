import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRemote } from '../hooks/useRemote';
import { RemoteState, Notice } from '../components/DataUI';
import { summarizeOrders } from '../features/orders/summary';
import type { OrderDTO } from '../services/orderService';
import {
  PackageCheck,
  Printer,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const orders = useRemote<OrderDTO[]>(user ? '/orders/me' : null, user?.id);
  const summary = orders.data === null ? null : summarizeOrders(orders.data);
  const orderCount = (count: number | undefined) => orders.loading ? 'Đang tải…' : count === undefined ? 'Chưa có dữ liệu' : `${count} đơn hàng`;

  return (
    <div className="space-y-8 pb-10 w-full animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-[#14171c] to-[#0f1115] border border-border p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/7 border border-primary/50 text-[#39FF14] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Bảng Điều Khiển Sinh Viên
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xin chào, <span className="text-[#39FF14]">{user?.name || 'Bạn'}</span> 👋
          </h1>

          <p className="text-sm text-text-muted leading-relaxed">
            Xem trạng thái đơn hàng, quản lý yêu cầu in và gửi yêu cầu bảo hành của bạn.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/custom"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition"
            >
              <Printer className="w-4 h-4" /> Báo Giá File 3D Mới
            </Link>
            <Link
              to="/catalog"
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-[#272930] text-slate-200 font-bold text-xs border border-border transition flex items-center gap-1.5"
            >
              Xem Danh Mục Thước
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OVERVIEW STATS CARDS */}
      {/* ========================================================================= */}
      <RemoteState loading={orders.loading} error={orders.error} retry={orders.reload} />
      <Notice error={orders.data !== null && !summary ? 'Chưa đọc được dữ liệu đơn hàng. Vui lòng thử tải lại.' : undefined} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-busy={orders.loading}>
        <Link
          to="/orders"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-[#39FF14]/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Đang In 3D</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-[#39FF14] flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-[#39FF14] transition">{orderCount(summary?.printing)}</p>
          <p className="text-[11px] text-primary font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Xem tiến độ đơn hàng
          </p>
        </Link>

        <Link
          to="/quotations"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Báo Giá In Theo Yêu Cầu</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-primary transition">Tiến Trình In</p>
          <p className="text-[11px] text-text-muted">Kiểm tra báo giá &amp; duyệt in</p>
        </Link>

        <Link
          to="/order-history"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-purple-400/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Đã Hoàn Thành</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-purple-400 transition">{orderCount(summary?.completed)}</p>
          <p className="text-[11px] text-text-muted">Xem lịch sử đặt hàng</p>
        </Link>

        <Link
          to="/warranty"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-amber-400/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Hỗ trợ bảo hành</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white group-hover:text-amber-400 transition">Gửi yêu cầu</p>
          <p className="text-xs text-text-muted">Kiểm tra điều kiện theo đơn hàng</p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK SHORTCUTS & PROMOTIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Tự Custom Khắc Tên</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Khắc tên, MSSV, logo CLB lên thân thước kỹ thuật bằng tia Laser CNC độ nét cao hoàn toàn miễn phí.
          </p>
          <Link to="/custom" className="text-xs font-bold text-[#39FF14] inline-flex items-center gap-1 hover:underline pt-1">
            Bắt đầu tạo mẫu <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Đặt In Số Lượng Lớn</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Ưu đãi giảm giá lên tới 35% cho các đơn hàng theo lớp, khoa viện hoặc đồ án tốt nghiệp kỹ thuật.
          </p>
          <Link to="/bulk-order" className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline pt-1">
            Đặt in số lượng lớn <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Chính Sách Đổi Trả</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Nếu thước bị nứt gãy trong quá trình thực hành xưởng, gửi ảnh chụp để nhận ngay thước mới trong 24h.
          </p>
          <Link to="/warranty" className="text-xs font-bold text-purple-400 inline-flex items-center gap-1 hover:underline pt-1">
            Gửi yêu cầu bảo hành <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
