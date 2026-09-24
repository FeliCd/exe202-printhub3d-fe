import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Printer,
  PackageCheck,
  ShieldAlert,
  MapPin,
  LogOut,
  LogIn,
  Ruler,
  Layers,
  Sparkles,
  Scale,
  User as UserIcon,
  HardDrive,
  History,
  FileText,
  HelpCircle,
  ChevronDown,
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

  const [openGroups, setOpenGroups] = useState({
    shopping: true,
    transactions: false,
    account: false,
  });

  const isActive = (path: string) => location.pathname === path;

  // Tự động mở rộng nhóm accordion chứa route đang active
  useEffect(() => {
    const path = location.pathname;
    if (['/catalog', '/custom', '/bulk-order', '/ruler-3d'].includes(path)) {
      setOpenGroups((prev) => ({ ...prev, shopping: true }));
    } else if (['/orders', '/order-history', '/file-vault', '/quotations', '/subscriptions'].includes(path)) {
      setOpenGroups((prev) => ({ ...prev, transactions: true }));
    } else if (['/profile', '/warranty', '/disputes', '/help-center'].includes(path)) {
      setOpenGroups((prev) => ({ ...prev, account: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (group: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

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
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        {/* User Account Card / Guest Welcome */}
        {user ? (
          <div className="p-4 rounded-2xl bg-surface border border-border/80 flex items-center gap-3.5 shadow-md">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-[#22c55e]/40 flex items-center justify-center text-[#39FF14] font-black text-base uppercase shrink-0">
              {user.name ? user.name.substring(0, 2) : <UserIcon className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs uppercase tracking-wider text-[#39FF14] font-extrabold">
                {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Tài Khoản Sinh Viên'}
              </p>
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
                {user.studentId ? `MSSV: ${user.studentId}` : 'Đã Xác Thực'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">Khách Vãng Lai</p>
                <p className="text-[11px] text-text-muted">Đăng nhập để lưu đơn &amp; file</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" /> Đăng Nhập Ngay
            </Link>
          </div>
        )}

        {/* Custom 3D Ruler CTA (Pinned Outside Groups) */}
        <div className="p-0.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-emerald-400 to-teal-400 shadow-lg">
          <Link
            className="flex flex-col gap-1.5 p-3.5 rounded-[14px] bg-surface-inset hover:bg-surface transition group"
            to="/custom"
            aria-current={isActive('/custom') ? 'page' : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#39FF14] flex items-center gap-1.5">
                <span>📐</span> TỰ CUSTOM THƯỚC 3D
              </span>
              <span className="text-[10px] font-black bg-[#39FF14] text-slate-950 px-2 py-0.5 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Tự tạo thước theo kích thước, font khắc tên/MSSV riêng, xem bản dựng 3D tức thì.
            </p>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: MUA SẮM & DỊCH VỤ (ACCORDION) */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => toggleGroup('shopping')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-[#39FF14] hover:bg-surface/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">🛒 MUA SẮM &amp; DỊCH VỤ</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 text-[#39FF14] ${
                openGroups.shopping ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.shopping && (
            <nav className="space-y-1 mt-1 pl-1">
              <Link
                to="/catalog"
                aria-current={isActive('/catalog') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/catalog')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Box className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Sản phẩm &amp; BST Thước</span>
              </Link>

              <Link
                to="/custom"
                aria-current={isActive('/custom') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/custom')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4 text-text-muted shrink-0" />
                <span>In 3D Theo Yêu Cầu</span>
              </Link>

              <Link
                to="/bulk-order"
                aria-current={isActive('/bulk-order') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/bulk-order')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-text-muted shrink-0" />
                <span>Đặt Hàng Hàng Loạt</span>
              </Link>

              <Link
                to="/ruler-3d"
                aria-current={isActive('/ruler-3d') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/ruler-3d')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Ruler className="w-4 h-4 text-text-muted shrink-0" />
                <span>Công cụ Thước đo 3D</span>
              </Link>
            </nav>
          )}
        </div>

        {/* ========================================================================= */}
        {/* GROUP 2: QUẢN LÝ GIAO DỊCH (ACCORDION) */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => toggleGroup('transactions')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-[#39FF14] hover:bg-surface/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">📦 QUẢN LÝ GIAO DỊCH</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 text-[#39FF14] ${
                openGroups.transactions ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.transactions && (
            <nav className="space-y-1 mt-1 pl-1">
              <Link
                to="/orders"
                aria-current={isActive('/orders') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/orders')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-text-muted shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Theo dõi tiến độ in 3D</span>
                  <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
                </div>
              </Link>

              <Link
                to="/order-history"
                aria-current={isActive('/order-history') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/order-history')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <History className="w-4 h-4 text-text-muted shrink-0" />
                <span>Lịch sử đơn hàng &amp; In lại</span>
              </Link>

              <Link
                to="/file-vault"
                aria-current={isActive('/file-vault') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/file-vault')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <HardDrive className="w-4 h-4 text-text-muted shrink-0" />
                <span>Quản lý File 3D (Vault)</span>
              </Link>

              <Link
                to="/quotations"
                aria-current={isActive('/quotations') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/quotations')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-text-muted shrink-0" />
                <span>Quản lý Báo giá 3D</span>
              </Link>

              <Link
                to="/subscriptions"
                aria-current={isActive('/subscriptions') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/subscriptions')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-text-muted shrink-0" />
                <span>Gói Ưu Đãi Hội Viên</span>
              </Link>
            </nav>
          )}
        </div>

        {/* ========================================================================= */}
        {/* GROUP 3: CÁ NHÂN & HỖ TRỢ (ACCORDION) */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => toggleGroup('account')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-[#39FF14] hover:bg-surface/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">👤 CÁ NHÂN &amp; HỖ TRỢ</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 text-[#39FF14] ${
                openGroups.account ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.account && (
            <nav className="space-y-1 mt-1 pl-1">
              <Link
                to="/profile"
                aria-current={isActive('/profile') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/profile')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4 text-text-muted shrink-0" />
                <span>Trang cá nhân</span>
              </Link>

              <button
                type="button"
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-surface hover:text-white transition cursor-pointer text-left"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAddressModal();
                }}
              >
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span>Sổ địa chỉ nhận hàng</span>
              </button>

              <Link
                to="/warranty"
                aria-current={isActive('/warranty') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/warranty')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-text-muted shrink-0" />
                <span>Bảo hành</span>
              </Link>

              <Link
                to="/disputes"
                aria-current={isActive('/disputes') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/disputes')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4 text-text-muted shrink-0" />
                <span>Khiếu nại &amp; Tranh chấp</span>
              </Link>

              <Link
                to="/help-center"
                aria-current={isActive('/help-center') ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/help-center')
                    ? 'bg-surface text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-surface hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-text-muted shrink-0" />
                <span>Trung tâm Hỗ trợ &amp; FAQ</span>
              </Link>
            </nav>
          )}
        </div>
      </div>

      {/* Bottom Auth Action Button */}
      <div className="p-4 border-t border-border bg-surface-inset">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/40 text-[#39FF14] hover:bg-[#39FF14]/10 font-bold text-xs transition shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập tài khoản</span>
          </Link>
        )}
      </div>
    </aside>
  );
}