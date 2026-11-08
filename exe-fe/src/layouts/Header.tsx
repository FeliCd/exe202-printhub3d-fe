import { useCallback, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ShoppingBag, Search, Sparkles, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeToggle from '../components/ThemeToggle';

interface HeaderProps {
  sidebarOpen?: boolean;
  cartCount: number;
  onToggleSidebar: () => void;
  onOpenCart: () => void;
}

export default function Header({ sidebarOpen, cartCount, onToggleSidebar, onOpenCart }: HeaderProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [notifOpen, setNotifOpen] = useState(false);

  const closeNotifications = useCallback(() => setNotifOpen(false), []);

  return (
    <header className="sticky top-0 z-40 bg-surface-inset/95 backdrop-blur border-b border-border px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* ========================================================================= */}
      {/* TOP LEFT: HAMBURGER TOGGLE MENU & PRINTHUB 3D LOGO */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <button
          aria-label="Đóng mở thanh menu"
          aria-expanded={sidebarOpen}
          aria-controls={sidebarOpen ? 'app-sidebar' : undefined}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-surface hover:bg-[#272930] text-slate-300 hover:text-[#39FF14] transition border border-border focus:outline-none active:scale-95 flex items-center justify-center cursor-pointer"
          onClick={onToggleSidebar}
          title="Đóng/Mở Thanh Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link aria-label="PrintHub 3D — Trang chủ" className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight group" to="/">
          <img
            src="/logo-printhub.svg"
            alt="PrintHub 3D Logo"
            className="w-9 h-9 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform object-contain"
          />
          <span className="text-lg sm:text-xl font-extrabold tracking-wide hidden sm:inline">
            PrintHub <span className="text-[#39FF14]">3D</span>
          </span>
        </Link>
      </div>

      {/* CENTER: SEARCH BAR & QUICK 3D DESIGN BUTTON */}
      <div className="flex-1 max-w-xl items-center gap-3 hidden lg:flex">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            className="w-full bg-surface border border-border text-xs rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#39FF14] transition"
            placeholder="Tìm mẫu thước 3D, thước parabol, thước eke..."
            aria-label="Tìm sản phẩm"
            type="search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/catalog?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
            }}
          />
        </div>

        {/* Quick Menu Button: Tự Design Thước 3D */}
        {!isAdmin && (
          <Link
            to="/custom"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/10 border border-primary/50 hover:border-[#39FF14] text-[#39FF14] font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Tự Design Thước 3D</span>
          </Link>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TOP RIGHT: PROFILE - GIỎ HÀNG */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <ThemeToggle />
        {/* Real-time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-surface hover:bg-[#272930] flex items-center justify-center text-slate-400 hover:text-white transition border border-border cursor-pointer"
            title="Thông báo"
            aria-label={`Thông báo, ${unreadCount} chưa đọc`}
            aria-expanded={notifOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-xs rounded-full flex items-center justify-center border-2 border-[#111215]">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={notifOpen} onClose={closeNotifications} />
        </div>

        {/* TOP RIGHT: USER PROFILE BADGE OR LOGIN/SIGNUP */}
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 min-h-[44px] rounded-xl bg-surface hover:bg-[#272930] border border-border transition group"
            title="Trang cá nhân"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary flex items-center justify-center font-black text-xs text-slate-950 uppercase shrink-0">
              {user.name ? user.name.substring(0, 2) : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden xl:block leading-tight pr-1">
              <p className="text-sm font-bold text-slate-200 group-hover:text-[#39FF14] transition truncate max-w-[100px]">
                {user.name}
              </p>
              <p className="text-sm text-text-muted uppercase font-mono">{user.role}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              aria-label="Đăng nhập"
              className="min-w-11 min-h-11 px-2 min-[400px]:px-3.5 py-2 rounded-xl border border-border hover:border-[#39FF14] text-xs font-bold text-slate-200 hover:text-[#39FF14] transition flex items-center justify-center"
            >
              <UserIcon className="size-4 min-[400px]:hidden" aria-hidden="true" />
              <span className="hidden min-[400px]:inline">Đăng nhập</span>
            </Link>
            <Link
              to="/signup"
              className="hidden sm:inline-flex px-3.5 py-2 min-h-[44px] rounded-xl bg-primary hover:bg-primary-hover text-slate-950 text-xs font-extrabold transition shadow-md shadow-primary/20 items-center justify-center"
            >
              Đăng ký
            </Link>
          </div>
        )}

        {/* TOP RIGHT: CART DRAWER BUTTON */}
        {!isAdmin && (
          <button
            className="relative min-h-11 min-w-11 flex items-center justify-center gap-2 bg-[#39FF14] hover:bg-primary text-slate-950 font-black min-[400px]:px-2 sm:px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-primary/60 active:scale-95 transition cursor-pointer"
            onClick={onOpenCart}
            title="Xem giỏ hàng"
            aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Giỏ Hàng</span>
            <span className="absolute -top-1 -right-1 min-[400px]:static px-1.5 py-0.5 rounded-md bg-slate-950 text-[#39FF14] font-mono text-xs">
              {cartCount}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
