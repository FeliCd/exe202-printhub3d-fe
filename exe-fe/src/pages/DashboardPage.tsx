import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PackageCheck,
  Printer,
  ShieldCheck,
  HardDrive,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-10 w-full animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-[#14171c] to-[#0f1115] border border-border p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[#39FF14] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Bảng Điều Khiển Sinh Viên &amp; Maker
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xin chào, <span className="text-[#39FF14]">{user?.name || 'Bạn'}</span> 👋
          </h1>

          <p className="text-sm text-text-muted leading-relaxed">
            Theo dõi tiến độ máy in 3D thời gian thực, quản lý kho file mô hình STL/STEP và gửi yêu cầu bảo hành 1 học kỳ nhanh chóng.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/custom"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/orders"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-[#39FF14]/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Đang In 3D</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#39FF14] flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-[#39FF14] transition">1 Đơn Hàng</p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Dự kiến giao hôm nay
          </p>
        </Link>

        <Link
          to="/file-vault"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-cyan-400/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">File 3D Trong Kho</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-cyan-400 transition">3 Tệp STL</p>
          <p className="text-[11px] text-text-muted">Sẵn sàng in lại tức thì</p>
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
          <p className="text-2xl font-black text-white group-hover:text-purple-400 transition">4 Món Thước</p>
          <p className="text-[11px] text-text-muted">Xem lịch sử đặt hàng</p>
        </Link>

        <Link
          to="/warranty"
          className="p-5 rounded-2xl bg-surface border border-border hover:border-amber-400/50 transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Bảo Hành 1 Kỳ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white group-hover:text-amber-400 transition">Đang Bảo Vệ</p>
          <p className="text-[11px] text-emerald-400 font-medium">Bảo hành 1-đổi-1</p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK SHORTCUTS & PROMOTIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-[#22c55e]/30 flex items-center justify-center text-[#39FF14]">
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Đặt In Số Lượng Lớn</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Ưu đãi giảm giá lên tới 35% cho các đơn hàng theo lớp, khoa viện hoặc đồ án tốt nghiệp kỹ thuật.
          </p>
          <Link to="/bulk-order" className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1 hover:underline pt-1">
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
