import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Sparkles,
  Scale,
  LogOut,
  Users,
  Package,
  PackageCheck,
  DollarSign,
  Factory,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
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
        {/* Admin Info Card */}
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-base uppercase shrink-0">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm uppercase tracking-wider text-purple-400 font-extrabold">
              ADMIN QUẢN TRỊ
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin PrintHub'}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-md bg-purple-900 text-purple-200 border border-purple-700 font-bold">
              Toàn quyền quản trị
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: TỔNG QUAN & TÀI CHÍNH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-purple-400 mb-2">
            📊 TỔNG QUAN &amp; TÀI CHÍNH
          </p>

          <Link
            to="/admin/dashboard"
            aria-current={isActive('/admin/dashboard') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/dashboard')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Dashboard Quản Trị</span>
          </Link>

          <Link
            to="/admin/finance"
            aria-current={isActive('/admin/finance') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/finance')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <DollarSign className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Báo Cáo Tài Chính &amp; Doanh Thu</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: NGƯỜI DÙNG & PHÂN QUYỀN */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-purple-400 mb-2">
            👥 NGƯỜI DÙNG &amp; PHÂN QUYỀN
          </p>

          <Link
            to="/admin/users"
            aria-current={isActive('/admin/users') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/users')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Người Dùng &amp; Phân Quyền</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: HÀNG HÓA & ĐƠN HÀNG */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-purple-400 mb-2">
            📦 HÀNG HÓA &amp; ĐƠN HÀNG
          </p>

          <Link
            to="/admin/products"
            aria-current={isActive('/admin/products') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/products')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Package className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Sản Phẩm &amp; Danh Mục</span>
          </Link>

          <Link
            to="/admin/orders"
            aria-current={isActive('/admin/orders') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/orders')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Đơn Hàng Hệ Thống</span>
          </Link>

          <Link
            to="/admin/subscriptions"
            aria-current={isActive('/admin/subscriptions') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/subscriptions')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Cấu Hình Subscriptions</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 4: KIỂM SOÁT & CẤU HÌNH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-purple-400 mb-2">
            🛡️ KIỂM SOÁT &amp; CẤU HÌNH
          </p>

          <Link
            to="/admin/disputes"
            aria-current={isActive('/admin/disputes') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/disputes')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Scale className="w-5 h-5 text-red-400 shrink-0" />
            <span>Xử Lý Tranh Chấp Admin</span>
          </Link>

          <Link to="/admin/production" aria-current={isActive('/admin/production') ? 'page' : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive('/admin/production') ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400' : 'text-slate-300 hover:bg-surface'}`}>
            <Factory className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Sản Xuất &amp; Máy In</span>
          </Link>

          <Link
            to="/admin/settings"
            aria-current={isActive('/admin/settings') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/settings')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface'
            }`}
          >
            <Settings className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Cấu Hình Hệ Thống Platform</span>
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
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  );
}
