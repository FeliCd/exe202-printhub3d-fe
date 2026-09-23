import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Printer,
  PackageCheck,
  ShieldAlert,
  MapPin,
  LogOut,
  Ruler,
  Layers,
  Sparkles,
  Scale,
  BarChart3,
  Cpu,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onOpenAddressModal: () => void;
}

export default function Sidebar({ isOpen, onOpenAddressModal }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`w-72 bg-surface-inset border-r border-border flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
        isOpen ? '' : '-translate-x-full hidden'
      }`}
    >
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        {/* User Welcome Card */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] font-black uppercase">
            {user?.name ? user.name.substring(0, 2) : 'KH'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm uppercase tracking-wider text-text-muted font-medium">
              Tài khoản {role}
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Khách truy cập'}</p>
            <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
              Đã xác thực B2C
            </span>
          </div>
        </div>

        {/* Custom 3D Ruler CTA */}
        <div className="p-0.5 rounded-xl bg-gradient-to-r from-[#22c55e] via-emerald-400 to-teal-400">
          <Link
            className="flex flex-col gap-1 p-3.5 rounded-[10px] bg-surface-inset hover:bg-surface transition group"
            to="/custom"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#22c55e] flex items-center gap-1.5">
                <span>📐</span> TỰ CUSTOM THƯỚC 3D
              </span>
              <span className="text-xs font-extrabold bg-primary text-slate-950 px-2 py-0.5 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              Tự tạo thước theo kích thước, font khắc tên/MSSV riêng, xem bản dựng 3D tức thì.
            </p>
          </Link>
        </div>

        {/* Admin Navigation Section */}
        {(role === 'ADMIN' || role === 'FACTORY') && (
          <div className="space-y-1 text-xs font-semibold pt-2 border-t border-border">
            <p className="px-3 text-sm font-extrabold uppercase tracking-widest text-purple-400 mb-1">
              ⚙️ QUẢN TRỊ &amp; SẢN XUẤT
            </p>
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
                isActive('/admin/dashboard')
                  ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-400 font-bold'
                  : 'text-slate-300 hover:bg-surface'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Dashboard Quản Trị</span>
            </Link>

            <Link
              to="/admin/production"
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
                isActive('/admin/production')
                  ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-400 font-bold'
                  : 'text-slate-300 hover:bg-surface'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Quản Lý Sản Xuất Máy In</span>
            </Link>

            <Link
              to="/admin/subscriptions"
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
                isActive('/admin/subscriptions')
                  ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-400 font-bold'
                  : 'text-slate-300 hover:bg-surface'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Cấu Hình Subscriptions</span>
            </Link>

            <Link
              to="/admin/disputes"
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
                isActive('/admin/disputes')
                  ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-400 font-bold'
                  : 'text-slate-300 hover:bg-surface'
              }`}
            >
              <Scale className="w-4 h-4 text-red-400" />
              <span>Xử Lý Tranh Chấp Admin</span>
            </Link>
          </div>
        )}

        {/* Buyer & Navigation Menu */}
        <nav className="space-y-1 text-xs font-semibold pt-2 border-t border-border">
          <p className="px-3 text-sm font-extrabold uppercase tracking-widest text-[#22c55e] mb-1">
            🛒 KHÁCH HÀNG &amp; DỊCH VỤ
          </p>

          <Link
            to="/catalog"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/catalog')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Box className="w-4 h-4 text-[#22c55e]" />
            <span>Sản phẩm &amp; BST Thước</span>
          </Link>

          <Link
            to="/catalog-preview"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/catalog-preview')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 text-text-muted" />
            <span>Xem trước Danh mục (Guest)</span>
          </Link>

          <Link
            to="/custom"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/custom')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4 text-text-muted" />
            <span>In 3D Theo Yêu Cầu</span>
          </Link>

          <Link
            to="/bulk-order"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/bulk-order')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-text-muted" />
            <span>Đặt Hàng Hàng Loạt</span>
          </Link>

          <Link
            to="/orders"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/orders')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-text-muted" />
            <div className="flex-1 flex items-center justify-between">
              <span>Theo dõi tiến độ in 3D</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </Link>

          <Link
            to="/ruler-3d"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/ruler-3d')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4 text-text-muted" />
            <span>Công cụ Thước đo 3D</span>
          </Link>

          <Link
            to="/subscriptions"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/subscriptions')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-text-muted" />
            <span>Gói Ưu Đãi Hội Viên</span>
          </Link>

          <Link
            to="/warranty"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/warranty')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-text-muted" />
            <span>Bảo hành</span>
          </Link>

          <Link
            to="/disputes"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition ${
              isActive('/disputes')
                ? 'bg-surface text-[#22c55e] border-l-4 border-[#22c55e] font-bold'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-text-muted" />
            <span>Khiếu nại &amp; Tranh chấp</span>
          </Link>

          <a
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-300 hover:bg-surface hover:text-white transition cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onOpenAddressModal();
            }}
          >
            <MapPin className="w-4 h-4 text-text-muted" />
            <span>Sổ địa chỉ nhận hàng</span>
          </a>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-medium text-sm transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
