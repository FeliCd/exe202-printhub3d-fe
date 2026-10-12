import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  DollarSign,
  Users,
  Package,
  Tag,
  FileEdit,
  PackageCheck,
  Sparkles,
  Scale,
  Settings,
  LogOut,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: typeof BarChart3;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'TỔNG QUAN & TÀI CHÍNH',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard Quản Trị', icon: BarChart3 },
      { path: '/admin/finance', label: 'Tài Chính & Doanh Thu', icon: DollarSign },
    ],
  },
  {
    title: 'NGƯỜI DÙNG & PHÂN QUYỀN',
    items: [
      { path: '/admin/users', label: 'Người Dùng & Phân Quyền', icon: Users },
    ],
  },
  {
    title: 'HÀNG HÓA & ĐƠN HÀNG',
    items: [
      { path: '/admin/products', label: 'Sản Phẩm Trên Sàn', icon: Package },
      { path: '/admin/categories', label: 'Danh Mục Sản Phẩm', icon: Tag },
      {
        path: '/admin/custom-orders',
        label: 'Báo Giá Đơn In Custom',
        icon: FileEdit,
        badge: '1 chờ',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      },
      { path: '/admin/orders', label: 'Quản Lý Đơn Hàng', icon: PackageCheck },
      { path: '/admin/subscriptions', label: 'Cấu Hình Subscriptions', icon: Sparkles },
    ],
  },
  {
    title: 'KIỂM SOÁT & CẤU HÌNH',
    items: [
      { path: '/admin/disputes', label: 'Xử Lý Tranh Chấp', icon: Scale },
      { path: '/admin/settings', label: 'Cấu Hình Nền Tảng', icon: Settings },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
      className={`w-64 bg-surface-inset border-r border-border flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-[#39FF14] flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/60 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <p className="font-bold text-sm text-white tracking-wide">
              PrintHub <span className="text-[#39FF14] font-extrabold drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">3D</span>
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Quản Trị Hệ Thống
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface lg:hidden"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {group.title}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#39FF14]/10 text-[#39FF14] font-extrabold shadow-[0_0_12px_rgba(57,255,20,0.12)] border-l-2 border-[#39FF14] pl-2.5'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-surface/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-3 border-t border-border bg-surface/40 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)] shrink-0" />
            <span className="text-xs text-slate-400 truncate">
              {user?.email || 'admin@printhub3d.com'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
