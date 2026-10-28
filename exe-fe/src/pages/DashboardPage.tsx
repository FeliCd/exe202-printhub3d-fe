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
  Cpu,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const orders = useRemote<OrderDTO[]>(user ? '/orders/me' : null, user?.id);
  const summary = orders.data === null ? null : summarizeOrders(orders.data);
  const orderCount = (count: number | undefined) =>
    orders.loading ? 'Đang tải…' : count === undefined ? 'Chưa có' : `${count}`;

  return (
    <div className="space-y-8 pb-10 w-full animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER (DARK INDUSTRIAL PRECISION)                              */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-[#0a0c12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl group">
        {/* Neon top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] via-[#00e5ff] to-[#ff9100]" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[11px] font-mono font-bold whitespace-nowrap shrink-0">
              <Cpu className="w-3.5 h-3.5" />
              CAD WORKSTATION PORTAL
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#040508] px-2.5 py-1 rounded-full border border-white/10 whitespace-nowrap shrink-0">
              <Activity className="w-3 h-3 text-[#39FF14] animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Xin chào, <span className="text-[#39FF14] font-mono">{user?.name || 'Kỹ Sư PrintHub'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1.5">
              Trung tâm điều phối gia công 3D cá nhân: Theo dõi trạng thái đùn nhựa, tiến độ báo giá CAD/STL và yêu cầu bảo hành kỹ thuật.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/custom"
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs uppercase tracking-tight flex items-center gap-2 shadow-lg shadow-[#39FF14]/20 active:scale-95 transition whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" /> Báo Giá File 3D Mới
            </Link>
            <Link
              to="/catalog"
              className="px-4 py-2.5 rounded-xl bg-[#040508] hover:bg-[#11141e] text-slate-300 font-bold text-xs border border-white/10 transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              Xem Danh Mục Thước
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OVERVIEW STATS CARDS                                                    */}
      {/* ========================================================================= */}
      <RemoteState loading={orders.loading} error={orders.error} retry={orders.reload} />
      <Notice error={orders.data !== null && !summary ? 'Chưa đọc được dữ liệu đơn hàng. Vui lòng thử tải lại.' : undefined} />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-busy={orders.loading}>
        {/* CARD 1: Đang In 3D */}
        <Link
          to="/orders"
          className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#00e5ff]/50 transition-all duration-200 group space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">Đang In 3D</span>
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 flex items-center justify-center">
              <Printer className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono group-hover:text-[#00e5ff] transition">
            {orderCount(summary?.printing)}
          </p>
          <p className="text-[11px] text-[#00e5ff] font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Xem tiến độ đơn hàng
          </p>
        </Link>

        {/* CARD 2: Báo Giá In Theo Yêu Cầu */}
        <Link
          to="/quotations"
          className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/50 transition-all duration-200 group space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">Báo Giá CAD/STL</span>
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-[#39FF14] transition">
            Tiến Trình
          </p>
          <p className="text-[11px] text-[#39FF14] font-medium flex items-center gap-1">
            Kiểm tra báo giá &amp; duyệt in
          </p>
        </Link>

        {/* CARD 3: Đã Hoàn Thành */}
        <Link
          to="/order-history"
          className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/40 transition-all duration-200 group space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">Đã Hoàn Thành</span>
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono group-hover:text-[#39FF14] transition">
            {orderCount(summary?.completed)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-[#39FF14]" /> Xem lịch sử đặt hàng
          </p>
        </Link>

        {/* CARD 4: Hỗ trợ bảo hành */}
        <Link
          to="/warranty"
          className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#ff9100]/50 transition-all duration-200 group space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">Bảo Hành Kỹ Thuật</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff9100]/10 text-[#ff9100] border border-[#ff9100]/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-[#ff9100] transition">
            Đổi Mới 1-1
          </p>
          <p className="text-[11px] text-[#ff9100] font-medium flex items-center gap-1">
            Kiểm tra sai số &amp; nứt vỡ
          </p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK SHORTCUTS & PROMOTIONS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/40 transition space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Khắc Laser Kỹ Thuật Số</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Khắc tên, MSSV, logo CLB kỹ thuật lên bề mặt thước bằng tia Laser CNC độ nét cao dung sai &lt;0.05mm hoàn toàn miễn phí.
          </p>
          <Link to="/custom" className="text-xs font-bold font-mono text-[#39FF14] inline-flex items-center gap-1 hover:underline pt-1 whitespace-nowrap shrink-0">
            Bắt đầu tạo mẫu <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#00e5ff]/40 transition space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Sản Xuất Đợt Lớn (Batch FDM)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hỗ trợ chiết khấu lên tới 35% cho các đơn hàng theo lớp học, lab nghiên cứu hoặc đồ án tốt nghiệp kỹ thuật chuyên sâu.
          </p>
          <Link to="/bulk-order" className="text-xs font-bold font-mono text-[#00e5ff] inline-flex items-center gap-1 hover:underline pt-1 whitespace-nowrap shrink-0">
            Đặt in số lượng lớn <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#ff9100]/40 transition space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-[#ff9100]/10 border border-[#ff9100]/30 flex items-center justify-center text-[#ff9100]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Chính Sách Bảo Hành &amp; Đổi Trả</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nếu mô hình thước bị cong vênh hoặc sai lệch độ dày trong quá trình vận chuyển, gửi ảnh để nhận phôi in mới trong 24h.
          </p>
          <Link to="/warranty" className="text-xs font-bold font-mono text-[#ff9100] inline-flex items-center gap-1 hover:underline pt-1 whitespace-nowrap shrink-0">
            Gửi yêu cầu bảo hành <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
