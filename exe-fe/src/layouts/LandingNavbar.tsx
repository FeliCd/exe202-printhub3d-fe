import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0e]/85 app-light:bg-white/95 backdrop-blur-xl border-b border-white/[0.08] app-light:border-theme-line transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 xl:gap-4">
        {/* ========================================================================= */}
        {/* BRAND LOGO (Matches Left Side of Reference Header) */}
        {/* ========================================================================= */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <img
            src="/logo-printhub.svg"
            alt="PrintHub 3D Logo"
            className="size-9 sm:size-10 rounded-2xl shadow-lg shadow-[#39FF14]/20 group-hover:scale-105 transition-transform object-contain app-light:shadow-none"
          />
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-black tracking-wider text-theme-ink leading-tight flex items-center gap-1 whitespace-nowrap">
              PRINTHUB <span className="text-theme-accent">3D</span>
            </span>
            <span className="hidden min-[360px]:inline text-[10px] font-semibold tracking-widest text-theme-muted uppercase whitespace-nowrap">
              Precision Additive Farm
            </span>
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* CENTER PILL NAVBAR (Full Tiếng Việt - No Line Break) */}
        {/* ========================================================================= */}
        <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1 bg-[#0a0c12]/90 app-light:bg-white backdrop-blur-md px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full border border-white/10 app-light:border-theme-line shadow-xl shadow-black/60 text-[11px] xl:text-xs font-semibold text-theme-copy shrink-0 app-light:shadow-none">
          <button
            onClick={() => handleNavClick('services')}
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Dịch Vụ
          </button>
          <button
            onClick={() => handleNavClick('why-choose')}
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Về PrintHub
          </button>
          <Link
            to="/catalog"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition whitespace-nowrap shrink-0"
          >
            Danh Mục Thước
          </Link>
          <Link
            to="/custom"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition flex items-center gap-1.5 text-theme-accent whitespace-nowrap shrink-0"
          >
            <span>In Theo Yêu Cầu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-marker animate-pulse shrink-0" />
          </Link>
          <Link
            to="/warranty"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition whitespace-nowrap shrink-0"
          >
            Bảo Hành
          </Link>
          <Link
            to="/help-center"
            className="px-2.5 xl:px-3.5 py-1.5 rounded-full hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition whitespace-nowrap shrink-0"
          >
            Hỗ Trợ
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* RIGHT ACTION: AUTH BUTTONS */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
          <div className="hidden sm:flex items-center">
            {isAuthenticated && user ? (
              <Link
                to="/catalog"
                className="btn-precision px-4 xl:px-5 py-2 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Khám Phá Sản Phẩm</span>
                <ArrowRight className="w-3.5 h-3.5 relative z-10 shrink-0" />
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3 xl:px-4 py-2 rounded-full text-xs font-semibold text-theme-copy hover:text-theme-ink hover:bg-white/5 app-light:hover:bg-theme-soft transition whitespace-nowrap shrink-0"
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
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white/5 app-light:bg-theme-soft border border-white/10 app-light:border-theme-line text-theme-copy hover:text-theme-ink transition xl:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0d0e14]/95 app-light:bg-white/95 border-b border-white/10 app-light:border-theme-line px-4 pt-3 pb-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-theme-copy">
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition"
            >
              Dịch Vụ
            </button>
            <button
              onClick={() => handleNavClick('why-choose')}
              className="text-left px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition"
            >
              Về PrintHub
            </button>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition flex items-center justify-between"
            >
              Danh Mục Thước
            </Link>
            <Link
              to="/custom"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition text-theme-accent flex items-center justify-between"
            >
              <span>In Theo Yêu Cầu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-marker animate-pulse" />
            </Link>
            <Link
              to="/bulk-order"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition flex items-center justify-between"
            >
              <span>Đặt Sỉ CLB (-35%)</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 app-light:text-amber-800 border border-amber-500/30">
                Sắp ra mắt
              </span>
            </Link>
            <Link
              to="/warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition flex items-center justify-between"
            >
              Chính Sách Bảo Hành
            </Link>
            <Link
              to="/help-center"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 app-light:bg-theme-soft hover:bg-white/10 app-light:hover:bg-theme-action transition flex items-center justify-between"
            >
              Hỗ Trợ &amp; FAQ
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10 app-light:border-theme-line flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-theme-action hover:bg-theme-action-hover text-slate-950 font-black text-xs shadow-md shadow-[#39FF14]/20 app-light:shadow-none"
              >
                Khám Phá Sản Phẩm
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl border border-white/15 app-light:border-theme-line text-xs font-semibold text-theme-ink"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-theme-action hover:bg-theme-action-hover text-xs font-black text-slate-950 shadow-md shadow-[#39FF14]/20 app-light:shadow-none"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          data-scroll-progress
          style={{ scaleX: scrollYProgress }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-theme-accent"
        />
      )}
    </header>
  );
}
