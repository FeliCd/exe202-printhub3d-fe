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
      className={`w-72 bg-[#111215] border-r border-[#272930] flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
        isOpen ? '' : '-translate-x-full hidden'
      }`}
    >
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* User Welcome Card */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930]/80 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-[#22c55e]/40 flex items-center justify-center text-[#39FF14] font-black text-base uppercase shrink-0">
            {user?.name ? user.name.substring(0, 2) : 'KH'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs uppercase tracking-wider text-[#39FF14] font-extrabold">
              Tài khoản Sinh Viên
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Khách hàng'}</p>
            <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
              Khách hàng B2C
            </span>
          </div>
        </div>

        {/* Custom 3D Ruler CTA */}
        <div className="p-0.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-emerald-400 to-teal-400 shadow-lg">
          <Link
            className="flex flex-col gap-1.5 p-4 rounded-[14px] bg-[#111215] hover:bg-[#18191d] transition group"
            to="/custom"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#39FF14] flex items-center gap-1.5">
                <span>📐</span> TỰ CUSTOM THƯỚC 3D
              </span>
              <span className="text-[10px] font-black bg-[#39FF14] text-slate-950 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Tự tạo thước theo kích thước, font khắc tên/MSSV riêng, xem bản dựng 3D tức thì.
            </p>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: MUA SẮM & DỊCH VỤ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-[#39FF14] mb-2">
            🛍️ MUA SẮM &amp; DỊCH VỤ
          </p>

          <Link
            to="/catalog"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/catalog')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Box className="w-5 h-5 text-[#39FF14] shrink-0" />
            <span>Sản phẩm &amp; BST Thước</span>
          </Link>

          <Link
            to="/custom"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/custom')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Printer className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>In 3D Theo Yêu Cầu</span>
          </Link>

          <Link
            to="/bulk-order"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/bulk-order')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Đặt Hàng Hàng Loạt</span>
          </Link>

          <Link
            to="/ruler-3d"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/ruler-3d')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Ruler className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Công cụ Thước đo 3D</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: QUẢN LÝ GIAO DỊCH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-[#39FF14] mb-2">
            📊 QUẢN LÝ GIAO DỊCH
          </p>

          <Link
            to="/orders"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/orders')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span>Theo dõi tiến độ in 3D</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
            </div>
          </Link>

          <Link
            to="/order-history"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/order-history')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <History className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Lịch sử đơn hàng &amp; In lại</span>
          </Link>

          <Link
            to="/file-vault"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/file-vault')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <HardDrive className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Quản lý File 3D (Vault)</span>
          </Link>

          <Link
            to="/quotations"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/quotations')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Quản lý Báo giá 3D</span>
          </Link>

          <Link
            to="/wallet"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/wallet')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Ví điện tử PrintHub</span>
          </Link>

          <Link
            to="/subscriptions"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/subscriptions')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Gói Ưu Đãi Hội Viên</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: CÁ NHÂN & HỖ TRỢ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-[#272930]">
          <p className="px-3 text-xs font-black uppercase tracking-widest text-[#39FF14] mb-2">
            👤 CÁ NHÂN &amp; HỖ TRỢ
          </p>

          <Link
            to="/profile"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/profile')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <UserIcon className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Trang Cá Nhân &amp; Passcode</span>
          </Link>

          <a
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-[#18191d] hover:text-white transition cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onOpenAddressModal();
            }}
          >
            <MapPin className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Sổ địa chỉ nhận hàng</span>
          </a>

          <Link
            to="/warranty"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/warranty')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Bảo hành 1-đổi-1 (1 kỳ)</span>
          </Link>

          <Link
            to="/disputes"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/disputes')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <Scale className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Khiếu nại &amp; Tranh chấp</span>
          </Link>

          <Link
            to="/help-center"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/help-center')
                ? 'bg-[#18191d] text-[#39FF14] border-l-4 border-[#39FF14] font-bold shadow-md'
                : 'text-slate-300 hover:bg-[#18191d] hover:text-white'
            }`}
          >
            <HelpCircle className="w-5 h-5 text-[#94a3b8] shrink-0" />
            <span>Trung tâm Hỗ trợ &amp; FAQ</span>
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
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
