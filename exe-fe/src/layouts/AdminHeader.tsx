import { Menu, Search, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export default function AdminHeader({
  onToggleSidebar,
  onOpenCommandPalette,
}: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface-inset/95 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Đóng/Mở thanh điều hướng"
          className="p-2 rounded-xl bg-surface hover:bg-surface-raised border border-border text-slate-300 hover:text-white transition active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PORTAL QUẢN TRỊ</span>
          </span>
        </div>
      </div>

      {/* Center: Command Palette Pill (Ctrl + K) */}
      <div className="flex-1 max-w-lg hidden sm:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between gap-2.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border hover:border-slate-600 text-left text-xs text-slate-400 hover:text-slate-200 transition shadow-xs group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span className="truncate">Tìm trang, đơn hàng, tác vụ nhanh...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-surface-inset border border-border text-[10px] font-mono font-semibold text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Admin Profile */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 rounded-xl bg-surface border border-border text-slate-300 hover:text-white"
          aria-label="Tìm nhanh"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Thông báo hệ thống"
          className="relative p-2 rounded-xl bg-surface hover:bg-surface-raised border border-border text-slate-300 hover:text-white transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface-inset" />
        </button>

        <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden md:block leading-tight text-left">
            <p className="text-xs font-bold text-white truncate max-w-[130px]">
              {user?.name || 'Quản trị viên'}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold">Toàn quyền</p>
          </div>
        </div>
      </div>
    </header>
  );
}
