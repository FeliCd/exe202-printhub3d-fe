import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0e]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 xl:gap-4">
        {/* ========================================================================= */}
        {/* BRAND LOGO (Matches Left Side of Reference Header) */}
        {/* ========================================================================= */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#39FF14] to-emerald-400 p-[1px] shadow-lg shadow-[#39FF14]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-2xl bg-[#040508] flex items-center justify-center text-[#39FF14]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" x2="12" y1="22.08" y2="12" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-wider text-white leading-tight flex items-center gap-1 whitespace-nowrap">
              PRINTHUB <span className="text-[#39FF14]">3D</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase whitespace-nowrap">
              Precision Additive Farm
            </span>
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* CENTER PILL NAVBAR (Full Tiếng Việt - No Line Break) */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#0a0c12]/90 backdrop-blur-md px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full border border-white/10 shadow-2xl shadow-black/60 text-[11px] xl:text-xs font-semibold text-slate-300 shrink-0">
          <button
            onClick={() => handleNavClick('services')}
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Dịch Vụ
          </button>
          <button
            onClick={() => handleNavClick('why-choose')}
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Về PrintHub
          </button>
          <Link
            to="/catalog"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition whitespace-nowrap shrink-0"
          >
            Danh Mục Thước
          </Link>
          <Link
            to="/custom"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 text-[#39FF14] whitespace-nowrap shrink-0"
          >
            <span>In Theo Yêu Cầu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse shrink-0" />
          </Link>
          <Link
            to="/warranty"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition whitespace-nowrap shrink-0"
          >
            Bảo Hành
          </Link>
          <Link
            to="/help-center"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition whitespace-nowrap shrink-0"
          >
            Hỗ Trợ
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* RIGHT ACTION: AUTH BUTTONS */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
          {isAuthenticated && user ? (
            <Link
              to="/dashboard"
              className="btn-precision px-4 xl:px-5 py-2 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Vào Bảng Điều Khiển</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 shrink-0" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              <Link
                to="/login"
                className="px-3 xl:px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition whitespace-nowrap shrink-0"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="btn-precision px-4 xl:px-5 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 inline-flex items-center justify-center"
              >
                <span className="whitespace-nowrap">Bắt đầu ngay</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0e14]/95 border-b border-white/10 px-4 pt-3 pb-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Dịch Vụ
            </button>
            <button
              onClick={() => handleNavClick('why-choose')}
              className="text-left px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Về PrintHub
            </button>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Danh Mục Thước
            </Link>
            <Link
              to="/custom"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-[#39FF14] flex items-center justify-between"
            >
              <span>In Theo Yêu Cầu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
            </Link>
            <Link
              to="/bulk-order"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Đặt Sỉ CLB (-35%)
            </Link>
            <Link
              to="/warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Chính Sách Bảo Hành
            </Link>
            <Link
              to="/help-center"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              Hỗ Trợ &amp; FAQ
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs shadow-md shadow-[#39FF14]/20"
              >
                Vào Bảng Điều Khiển
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl border border-white/15 text-xs font-semibold text-white"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-xs font-black text-slate-950 shadow-md shadow-[#39FF14]/20"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
