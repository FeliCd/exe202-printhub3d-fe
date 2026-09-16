import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, Search, Sparkles, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';

interface HeaderProps {
  cartCount: number;
  onToggleSidebar: () => void;
  onOpenCart: () => void;
}

export default function Header({ cartCount, onToggleSidebar, onOpenCart }: HeaderProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#111215]/95 backdrop-blur border-b border-[#272930] px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* ========================================================================= */}
      {/* TOP LEFT: HAMBURGER TOGGLE MENU & PRINTHUB 3D LOGO */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          aria-label="Đóng mở thanh menu"
          className="p-2.5 rounded-xl bg-[#18191d] hover:bg-[#272930] text-slate-300 hover:text-[#39FF14] transition border border-[#272930] focus:outline-none active:scale-95 flex items-center justify-center"
          onClick={onToggleSidebar}
          title="Đóng/Mở Thanh Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link className="flex items-center gap-2 text-white font-bold text-lg tracking-tight group" to="/">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform font-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" x2="12" y1="22.08" y2="12" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-wide hidden xs:inline">
            PrintHub <span className="text-[#39FF14]">3D</span>
          </span>
        </Link>
      </div>

      {/* CENTER: SEARCH BAR & QUICK 3D DESIGN BUTTON */}
      <div className="flex-1 max-w-xl items-center gap-3 hidden md:flex">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94a3b8]">
            <Search className="w-4 h-4" />
          </span>
          <input
            className="w-full bg-[#18191d] border border-[#272930] text-xs rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#39FF14] transition"
            placeholder="Tìm mẫu thước 3D, thước parabol, thước eke..."
            type="search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/catalog');
            }}
          />
        </div>

        {/* Quick Menu Button: Tự Design Thước 3D */}
        <Link
          to="/custom"
          className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-500/50 hover:border-[#39FF14] text-[#39FF14] font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Tự Design Thước 3D</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* TOP RIGHT: PROFILE - GIỎ HÀNG */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Real-time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative w-9 h-9 rounded-xl bg-[#18191d] hover:bg-[#272930] flex items-center justify-center text-slate-400 hover:text-white transition border border-[#272930]"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-[#111215]">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* TOP RIGHT: USER PROFILE BADGE */}
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-xl bg-[#18191d] hover:bg-[#272930] border border-[#272930] transition group"
            title="Trang cá nhân sinh viên"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center font-black text-xs text-white uppercase shrink-0">
              {user.name ? user.name.substring(0, 2) : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden xl:block leading-tight pr-1">
              <p className="text-xs font-bold text-slate-200 group-hover:text-[#39FF14] transition truncate max-w-[100px]">
                {user.name}
              </p>
              <p className="text-[9px] text-[#94a3b8] uppercase font-mono">{user.role}</p>
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-xs font-bold text-[#39FF14] hover:underline px-2 py-1"
          >
            Đăng nhập
          </Link>
        )}

        {/* TOP RIGHT: CART DRAWER BUTTON */}
        <button
          className="flex items-center gap-2 bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-950/60 active:scale-95 transition"
          onClick={onOpenCart}
          title="Xem giỏ hàng"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Giỏ Hàng</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-[#39FF14] font-mono text-[10px]">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
