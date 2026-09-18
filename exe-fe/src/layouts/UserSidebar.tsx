import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Printer,
  PackageCheck,
  ShieldAlert,
  MapPin,
  LogOut,
  Ruler,
  Layers,
  Wallet,
  Sparkles,
  Scale,
  User as UserIcon,
  HardDrive,
  History,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserSidebarProps {
  isOpen: boolean;
  onOpenAddressModal: () => void;
}

export default function UserSidebar({ isOpen, onOpenAddressModal }: UserSidebarProps) {
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
        {/* User Welcome Card */}
        <div className="p-4 rounded-2xl bg-surface border border-border/80 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-[#22c55e]/40 flex items-center justify-center text-[#39FF14] font-black text-base uppercase shrink-0">
            {user?.name ? user.name.substring(0, 2) : 'KH'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm uppercase tracking-wider text-[#39FF14] font-extrabold">
              Tài khoản Sinh Viên
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Khách hàng'}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
              Khách hàng B2C
            </span>
          </div>
        </div>

        {/* Custom 3D Ruler CTA */}
        <div className="p-0.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-emerald-400 to-teal-400 shadow-lg">
          <Link
            className="flex flex-col gap-1.5 p-4 rounded-[14px] bg-surface-inset hover:bg-surface transition group"
            to="/custom"
            aria-current={isActive('/custom') ? 'page' : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#39FF14] flex items-center gap-1.5">
                <span>📐</span> TỰ CUSTOM THƯỚC 3D
              </span>
              <span className="text-xs font-black bg-[#39FF14] text-slate-950 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Tự tạo thước theo kích thước, font khắc tên/MSSV riêng, xem bản dựng 3D tức thì.
            </p>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: MUA SẮM & DỊCH VỤ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            🛒 MUA SẮM &amp; DỊCH VỤ
          </p>

          <Link
            to="/catalog"
            aria-current={isActive('/catalog') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/catalog')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Box className="w-5 h-5 text-[#39FF14] shrink-0" />
            <span>Sản phẩm &amp; BST Thước</span>
          </Link>

          <Link
            to="/custom"
            aria-current={isActive('/custom') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/custom')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Printer className="w-5 h-5 text-text-muted shrink-0" />
            <span>In 3D Theo Yêu Cầu</span>
          </Link>

          <Link
            to="/bulk-order"
            aria-current={isActive('/bulk-order') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/bulk-order')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 text-text-muted shrink-0" />
            <span>Đặt Hàng Hàng Loạt</span>
          </Link>

          <Link
            to="/ruler-3d"
            aria-current={isActive('/ruler-3d') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/ruler-3d')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Ruler className="w-5 h-5 text-text-muted shrink-0" />
            <span>Công cụ Thước đo 3D</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: QUẢN LÝ GIAO DỊCH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            📦 QUẢN LÝ GIAO DỊCH
          </p>

          <Link
            to="/orders"
            aria-current={isActive('/orders') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/orders')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-text-muted shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span>Theo dõi tiến độ in 3D</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
            </div>
          </Link>

          <Link
            to="/order-history"
            aria-current={isActive('/order-history') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/order-history')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <History className="w-5 h-5 text-text-muted shrink-0" />
            <span>Lịch sử đơn hàng &amp; In lại</span>
          </Link>

          <Link
            to="/file-vault"
            aria-current={isActive('/file-vault') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/file-vault')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <HardDrive className="w-5 h-5 text-text-muted shrink-0" />
            <span>Quản lý File 3D (Vault)</span>
          </Link>

          <Link
            to="/quotations"
            aria-current={isActive('/quotations') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/quotations')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 text-text-muted shrink-0" />
            <span>Quản lý Báo giá 3D</span>
          </Link>

          <Link
            to="/wallet"
            aria-current={isActive('/wallet') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/wallet')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5 text-text-muted shrink-0" />
            <span>Ví điện tử PrintHub</span>
          </Link>

          <Link
            to="/subscriptions"
            aria-current={isActive('/subscriptions') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/subscriptions')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 text-text-muted shrink-0" />
            <span>Gói Ưu Đãi Hội Viên</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: CÁ NHÂN & HỖ TRỢ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            👤 CÁ NHÂN &amp; HỖ TRỢ
          </p>

          <Link
            to="/profile"
            aria-current={isActive('/profile') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/profile')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <UserIcon className="w-5 h-5 text-text-muted shrink-0" />
            <span>Trang Cá Nhân &amp; Passcode</span>
          </Link>

          <button
            type="button"
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-surface hover:text-white transition cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onOpenAddressModal();
            }}
          >
            <MapPin className="w-5 h-5 text-text-muted shrink-0" />
            <span>Sổ địa chỉ nhận hàng</span>
          </button>

          <Link
            to="/warranty"
            aria-current={isActive('/warranty') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/warranty')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-text-muted shrink-0" />
            <span>Bảo hành 1-đổi-1 (1 kỳ)</span>
          </Link>

          <Link
            to="/disputes"
            aria-current={isActive('/disputes') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/disputes')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <Scale className="w-5 h-5 text-text-muted shrink-0" />
            <span>Khiếu nại &amp; Tranh chấp</span>
          </Link>

          <Link
            to="/help-center"
            aria-current={isActive('/help-center') ? 'page' : undefined}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/help-center')
                ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-surface hover:text-white'
            }`}
          >
            <HelpCircle className="w-5 h-5 text-text-muted shrink-0" />
            <span>Trung tâm Hỗ trợ &amp; FAQ</span>
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
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}