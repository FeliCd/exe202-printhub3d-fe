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
      className={`w-72 bg-[#111215] border-r border-[#272930] flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
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
            <p className="text-xs uppercase tracking-wider text-purple-400 font-extrabold">
              ADMIN QUẢN TRỊ
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin PrintHub'}</p>
            <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-md bg-purple-900 text-purple-200 border border-purple-700 font-bold">
              Toàn quyền quản trị
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: TỔNG QUAN & TÀI CHÍNH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
            📊 TỔNG QUAN &amp; TÀI CHÍNH
          </p>

          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/dashboard')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Dashboard Quản Trị</span>
          </Link>

          <Link
            to="/admin/finance"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/finance')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <DollarSign className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Báo Cáo Tài Chính &amp; Doanh Thu</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: ĐỐI TÁC & NGƯỜI DÙNG */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
            👥 ĐỐI TÁC &amp; NGƯỜI DÙNG
          </p>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/users')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Người Dùng &amp; Phân Quyền</span>
          </Link>

          <Link
            to="/admin/factories"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/factories')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Factory className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Xưởng In Đối Tác</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: HÀNG HÓA & ĐƠN HÀNG */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
            📦 HÀNG HÓA &amp; ĐƠN HÀNG
          </p>

          <Link
            to="/admin/products"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/products')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Package className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Sản Phẩm &amp; Danh Mục</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/orders')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Quản Lý Đơn Hàng Hệ Thống</span>
          </Link>

          <Link
            to="/admin/subscriptions"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/subscriptions')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Cấu Hình Subscriptions</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 4: KIỂM SOÁT & CẤU HÌNH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
            🛡️ KIỂM SOÁT &amp; CẤU HÌNH
          </p>

          <Link
            to="/admin/disputes"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/disputes')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Scale className="w-5 h-5 text-red-400 shrink-0" />
            <span>Xử Lý Tranh Chấp Admin</span>
          </Link>

          <Link
            to="/admin/settings"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive('/admin/settings')
                ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-400 font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d]'
            }`}
          >
            <Settings className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Cấu Hình Hệ Thống Platform</span>
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#272930] bg-[#111215]">
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
