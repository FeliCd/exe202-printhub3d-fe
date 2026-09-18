import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Factory,
  Cpu,
  PackageCheck,
  LogOut,
  Package,
  FileCode,
  ShieldCheck,
  Wrench,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FactorySidebarProps {
  isOpen: boolean;
}

export default function FactorySidebar({ isOpen }: FactorySidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`w-72 bg-surface-inset border-r border-border flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
        isOpen ? '' : '-translate-x-full hidden'
      }`}
    >
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Factory Info Card */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-base uppercase shrink-0">
            FC
          </div>
          <div className="overflow-hidden">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-extrabold">
              XƯỞNG IN SẢN XUẤT
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'BK-Makerlab'}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-md bg-cyan-900 text-cyan-200 border border-cyan-700 font-bold">
              Maker / Factory Hub
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: NHÓM SẢN XUẤT */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-cyan-400 mb-2">
            🏭 NHÓM SẢN XUẤT
          </p>

          <Link
            to="/factory/dashboard"
            aria-current={isActive('/factory/dashboard') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/dashboard')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Factory className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Dashboard Xưởng In</span>
          </Link>

          <Link
            to="/factory/orders"
            aria-current={isActive('/factory/orders') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/orders')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Quản Lý Đơn In &amp; Tiếp Nhận</span>
          </Link>

          <Link
            to="/factory/packing"
            aria-current={isActive('/factory/packing') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/packing')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Truck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Đóng Gói &amp; Bàn Giao</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: NHÓM THIẾT BỊ & KỸ THUẬT */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-cyan-400 mb-2">
            ⚙️ THIẾT BỊ &amp; KỸ THUẬT
          </p>

          <Link
            to="/factory/printers"
            aria-current={isActive('/factory/printers') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/printers')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Trạng Thái Máy In Xưởng</span>
          </Link>

          <Link
            to="/factory/gcode"
            aria-current={isActive('/factory/gcode') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/gcode')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Thư Viện G-code / Slicing</span>
          </Link>

          <Link
            to="/factory/qc"
            aria-current={isActive('/factory/qc') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/qc')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>QC &amp; Xử Lý Sau In</span>
          </Link>

          <Link
            to="/factory/maintenance"
            aria-current={isActive('/factory/maintenance') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/maintenance')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Wrench className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Nhật Ký Bảo Trì Máy In</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: NHÓM VẬT TƯ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-cyan-400 mb-2">
            📦 NHÓM VẬT TƯ
          </p>

          <Link
            to="/factory/inventory"
            aria-current={isActive('/factory/inventory') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/factory/inventory')
                ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Package className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Kho Nhựa &amp; Vật Tư</span>
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-border bg-surface-inset">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-bold text-sm transition shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất Xưởng</span>
        </button>
      </div>
    </aside>
  );
}
