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
              T├ái khoß║ún Sinh Vi├¬n
            </p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Kh├ích h├áng'}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
              Kh├ích h├áng B2C
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
                <span>≡ƒôÉ</span> Tß╗░ CUSTOM TH╞»ß╗ÜC 3D
              </span>
              <span className="text-xs font-black bg-[#39FF14] text-slate-950 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                HOT
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Tß╗▒ tß║ío th╞░ß╗¢c theo k├¡ch th╞░ß╗¢c, font khß║»c t├¬n/MSSV ri├¬ng, xem bß║ún dß╗▒ng 3D tß╗⌐c th├¼.
            </p>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 1: MUA Sß║«M & Dß╗èCH Vß╗ñ */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-2 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            ≡ƒ¢ì∩╕Å MUA Sß║«M &amp; Dß╗èCH Vß╗ñ
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
            <span>Sß║ún phß║⌐m &amp; BST Th╞░ß╗¢c</span>
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
            <span>In 3D Theo Y├¬u Cß║ºu</span>
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
            <span>─Éß║╖t H├áng H├áng Loß║ít</span>
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
            <span>C├┤ng cß╗Ñ Th╞░ß╗¢c ─æo 3D</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 2: QUß║óN L├¥ GIAO Dß╗èCH */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            ≡ƒôè QUß║óN L├¥ GIAO Dß╗èCH
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
              <span>Theo d├╡i tiß║┐n ─æß╗Ö in 3D</span>
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
            <span>Lß╗ïch sß╗¡ ─æ╞ín h├áng &amp; In lß║íi</span>
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
            <span>Quß║ún l├╜ File 3D (Vault)</span>
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
            <span>Quß║ún l├╜ B├ío gi├í 3D</span>
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
            <span>V├¡ ─æiß╗çn tß╗¡ PrintHub</span>
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
            <span>G├│i ╞»u ─É├úi Hß╗Öi Vi├¬n</span>
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* GROUP 3: C├ü NH├éN & Hß╗û TRß╗ó */}
        {/* ========================================================================= */}
        <nav className="space-y-2 pt-3 border-t border-border">
          <p className="px-3 text-sm font-black uppercase tracking-widest text-[#39FF14] mb-2">
            ≡ƒæñ C├ü NH├éN &amp; Hß╗û TRß╗ó
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
            <span>Trang C├í Nh├ón &amp; Passcode</span>
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
            <span>Sß╗ò ─æß╗ïa chß╗ë nhß║¡n h├áng</span>
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
            <span>Bß║úo h├ánh 1-─æß╗òi-1 (1 kß╗│)</span>
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
            <span>Khiß║┐u nß║íi &amp; Tranh chß║Ñp</span>
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
            <span>Trung t├óm Hß╗ù trß╗ú &amp; FAQ</span>
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
          <span>─É─âng xuß║Ñt</span>
        </button>
      </div>
    </aside>
  );
}