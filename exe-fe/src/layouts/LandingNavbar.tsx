import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function LandingNavbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0c]/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 text-white font-black text-lg tracking-tight group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform font-black">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" x2="12" y1="22.08" y2="12" />
          </svg>
        </div>
        <span className="text-xl font-extrabold tracking-wide">
          PrintHub <span className="text-[#39FF14]">3D</span>
        </span>
      </Link>

      {/* Navigation Links for Visitors */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
        <Link to="/catalog" className="hover:text-[#39FF14] transition">Danh Mục Thước</Link>
        <Link to="/custom" className="hover:text-[#39FF14] transition flex items-center gap-1.5">
          <span>In 3D Tùy Chỉnh</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-[#39FF14] font-bold border border-emerald-800">HOT</span>
        </Link>
        <Link to="/bulk-order" className="hover:text-[#39FF14] transition">Đặt In Số Lượng Lớn</Link>
        <Link to="/ruler-3d" className="hover:text-[#39FF14] transition">Thước Đo 3D</Link>
        <Link to="/warranty" className="hover:text-[#39FF14] transition">Chính Sách Bảo Hành</Link>
      </nav>

      {/* Right Action: Login / Register OR Go to Dashboard */}
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <span>Vào Bảng Điều Khiển</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl border border-border hover:border-[#39FF14] text-xs font-bold text-slate-200 hover:text-[#39FF14] transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/signup"
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
