import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Save,
  MapPin,
  KeyRound,
  Coins,
  Edit3,
  X,
  Phone,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorText, send } from '../services/api';
import { useRemote } from '../hooks/useRemote';
import type { ShippingAddress } from '../features/address/data';
import { validatePhoneMessage, normalizeVietnamesePhone } from '../utils/phoneValidator';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { PageHeader, Notice } from '../components/DataUI';

export default function ProfilePage() {
  const { user } = useAuth();
  return <ProfilePageContent key={user?.id ?? 'guest'} />;
}

function ProfilePageContent() {
  const { user, updateProfile } = useAuth();

  // Mode: View vs Edit
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [university, setUniversity] = useState(user?.university || '');

  const [profileError, setProfileError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Addresses
  const addressesRemote = useRemote<ShippingAddress[]>(user ? '/addresses' : null);
  const [isChangingDefaultAddr, setIsChangingDefaultAddr] = useState(false);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(successTimer.current);
    };
  }, []);

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setStudentId(user?.studentId || '');
    setUniversity(user?.university || '');
    setIsEditing(false);
    setProfileError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setSavedSuccess(false);

    if (phone.trim()) {
      const phoneErr = validatePhoneMessage(phone);
      if (phoneErr) {
        setProfileError(phoneErr);
        setSaving(false);
        return;
      }
    }

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() ? normalizeVietnamesePhone(phone) : '',
        studentId: studentId.trim(),
        university: university.trim(),
      });
      setSavedSuccess(true);
      setIsEditing(false);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSavedSuccess(false), 3500);
    } catch (e) {
      setProfileError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDefaultAddress = async (addrId: string) => {
    try {
      await send(`/addresses/${addrId}/default`, {}, 'put');
      addressesRemote.reload();
      setIsChangingDefaultAddr(false);
    } catch {
      // ignore
    }
  };

  const savedAddresses = addressesRemote.data || [];
  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Hồ sơ của bạn"
        description="Xem và cập nhật thông tin tài khoản, tích lũy điểm thưởng và cấu hình địa chỉ nhận hàng."
      />

      <Notice error={profileError} success={savedSuccess ? 'Đã cập nhật thành công thông tin tài khoản!' : undefined} />

      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full border border-border bg-surface-raised text-xl font-bold uppercase text-theme-ink">
          {name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('') || '3D'}
        </span>
        <div className="min-w-0 space-y-1">
          <h2 className="break-words text-xl font-bold text-theme-ink">{name || 'Người dùng'}</h2>
          <p className="break-words text-sm text-theme-muted">{user?.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-theme-muted">
            <ShieldCheck className="size-3.5 text-theme-accent" aria-hidden="true" />
            {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Tài khoản sinh viên'}
          </span>
        </div>
      </div>

      <nav aria-label="Các phần trong hồ sơ" className="flex flex-wrap gap-2 border-b border-border pb-3 text-sm">
        <a href="#profile-contact" className="rounded-md px-3 py-2 font-medium text-theme-muted hover:bg-surface hover:text-theme-accent">Thông tin cá nhân</a>
        <a href="#profile-security" className="rounded-md px-3 py-2 font-medium text-theme-muted hover:bg-surface hover:text-theme-accent">Bảo mật</a>
        <a href="#profile-rewards" className="rounded-md px-3 py-2 font-medium text-theme-muted hover:bg-surface hover:text-theme-accent">Điểm thưởng</a>
        <Link to="/addresses" className="rounded-md px-3 py-2 font-medium text-theme-muted hover:bg-surface hover:text-theme-accent">Sổ địa chỉ</Link>
      </nav>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
        <div className="min-w-0 space-y-4">
          {/* Thông tin liên hệ: VIEW MODE / EDIT MODE */}
          <div id="profile-contact" className="scroll-mt-4 p-5 rounded-xl bg-surface border border-border space-y-5 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <User className="w-4 h-4 text-[#39FF14]" /> Thông tin liên hệ
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditing ? 'Đang ở chế độ chỉnh sửa thông tin tài khoản' : 'Thông tin đăng ký của bạn trên nền tảng'}
                </p>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="py-2 px-3.5 rounded-xl bg-[#040508] hover:bg-[#11141e] border border-white/10 hover:border-[#39FF14] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#39FF14]" /> Chỉnh Sửa Thông Tin
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2 px-3 rounded-xl border border-white/10 hover:bg-[#040508] text-slate-300 text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="py-2 px-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-[#39FF14]/20 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              )}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#040508] border border-[#39FF14]/60 rounded-xl p-3 text-white outline-none focus:border-[#39FF14] font-mono transition"
                    />
                  ) : (
                    <div className="w-full bg-[#040508]/80 border border-white/10 rounded-xl p-3 text-white font-semibold font-mono">
                      {name || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#39FF14]" /> Số điện thoại liên hệ
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#040508] border border-[#39FF14]/60 rounded-xl p-3 text-white outline-none focus:border-[#39FF14] font-mono transition"
                    />
                  ) : (
                    <div className="w-full bg-[#040508]/80 border border-white/10 rounded-xl p-3 text-white font-mono">
                      {phone || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                {/* Mã số sinh viên */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">Mã số sinh viên (MSSV)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Ví dụ: 21127000"
                      className="w-full bg-[#040508] border border-[#39FF14]/60 rounded-xl p-3 text-white font-mono outline-none focus:border-[#39FF14] transition"
                    />
                  ) : (
                    <div className="w-full bg-[#040508]/80 border border-white/10 rounded-xl p-3 text-white font-mono">
                      {studentId || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                {/* Trường Đại học */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">Trường ĐH / Học viện</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Ví dụ: Đại Học Bách Khoa ĐHQG TP.HCM"
                      className="w-full bg-[#040508] border border-[#39FF14]/60 rounded-xl p-3 text-white outline-none focus:border-[#39FF14] transition"
                    />
                  ) : (
                    <div className="w-full bg-[#040508]/80 border border-white/10 rounded-xl p-3 text-white">
                      {university || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <section id="profile-security" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
            <div>
              <h2 className="font-semibold text-theme-ink">Bảo mật</h2>
              <p className="mt-1 text-xs text-theme-muted">Quản lý mật khẩu tài khoản</p>
            </div>
            <button type="button" onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-2 text-sm text-theme-ink hover:border-theme-accent">
              <KeyRound className="size-4 text-theme-accent" aria-hidden="true" /> Đổi mật khẩu
            </button>
          </section>
        </div>
        <aside className="min-w-0 space-y-4" aria-label="Điểm thưởng và hồ sơ sinh viên">
          {/* Card Điểm thưởng PrintHub Xu */}
          <div id="profile-rewards" className="scroll-mt-4 p-5 rounded-xl bg-surface border border-border space-y-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <Coins className="w-4 h-4 text-[#39FF14]" /> Điểm Thưởng Tích Lũy
                </span>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0">
                  Xu Tích Lũy
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-white font-mono ">
                  {(user?.rewardPoints ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#39FF14] font-mono">PrintHub Xu</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tích lũy từ mỗi đơn in 3D &amp; custom thước kỹ thuật. Dùng xu để đổi voucher giảm giá hoặc nâng cấp gói hội viên.
              </p>
            </div>

            <Link
              to="/subscriptions"
              className="py-2.5 px-4 rounded-xl bg-[#040508] hover:bg-[#11141e] border border-white/10 hover:border-[#39FF14] text-xs font-mono font-bold text-white flex items-center justify-between transition whitespace-nowrap shrink-0 group"
            >
              <span>Xem ưu đãi &amp; Đổi gói hội viên</span>
              <ArrowRight className="w-4 h-4 text-[#39FF14] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card Ưu đãi Sinh viên / Đại học */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <GraduationCap className="w-4 h-4 text-[#00e5ff]" /> Hồ Sơ Sinh Viên
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#040508] border border-white/10 text-slate-300 whitespace-nowrap shrink-0">
                  {studentId ? 'Đã liên kết' : 'Chưa cập nhật'}
                </span>
              </div>
              <div className="space-y-1 pt-1 text-xs">
                <p className="text-slate-400">MSSV: <strong className="text-white font-mono">{studentId || 'Chưa có'}</strong></p>
                <p className="text-slate-400">Trường: <strong className="text-white">{university || 'Chưa cập nhật'}</strong></p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sinh viên thuộc hệ thống ĐHQG TP.HCM được hỗ trợ giao nhận trực tiếp tại KTX Khu A &amp; Khu B trong ngày.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#39FF14] font-semibold">
              <Sparkles className="w-4 h-4 shrink-0 text-[#39FF14]" />
              <span>Miễn phí giao hàng nội khu ĐHQG TP.HCM</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Địa Chỉ Nhận Hàng Mặc Định & Chuyển Đổi Địa Chỉ Đã Lưu */}
      <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <MapPin className="w-4 h-4 text-[#39FF14]" /> Địa Chỉ Nhận Hàng Mặc Định
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Địa chỉ ưu tiên tự động điền khi bạn đặt hàng in 3D &amp; custom thước kỹ thuật
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {savedAddresses.length > 1 && (
              <button
                type="button"
                onClick={() => setIsChangingDefaultAddr(!isChangingDefaultAddr)}
                className="py-1.5 px-3 rounded-xl bg-[#040508] border border-white/10 hover:border-[#39FF14] text-xs font-mono font-semibold text-white flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Đổi địa chỉ</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isChangingDefaultAddr ? 'rotate-180' : ''}`} />
              </button>
            )}
            <Link
              to="/addresses"
              className="py-1.5 px-3.5 rounded-xl bg-[#040508] hover:bg-[#11141e] border border-white/10 hover:border-[#39FF14] text-xs font-mono font-bold text-[#39FF14] flex items-center gap-1 transition whitespace-nowrap shrink-0"
            >
              <span>Quản lý sổ địa chỉ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Khung hiển thị địa chỉ mặc định */}
        {defaultAddress ? (
          <div className="p-4 rounded-xl bg-[#040508] border border-[#39FF14]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{defaultAddress.recipientName}</span>
                <span className="font-mono text-slate-400">({defaultAddress.phone})</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 whitespace-nowrap shrink-0">
                  Mặc định
                </span>
              </div>
              <p className="text-slate-300 font-medium">
                {defaultAddress.addressLine}, <strong className="text-white">{defaultAddress.province}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#040508] border border-dashed border-white/20 text-center text-xs text-slate-400 space-y-2">
            <p>Bạn chưa thiết lập địa chỉ nhận hàng nào trong sổ địa chỉ.</p>
            <Link
              to="/addresses"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#39FF14] hover:underline whitespace-nowrap shrink-0"
            >
              Bấm vào đây để thêm địa chỉ giao hàng ngay &rarr;
            </Link>
          </div>
        )}

        {/* Dropdown / Danh sách đổi nhanh các địa chỉ đã lưu */}
        {isChangingDefaultAddr && savedAddresses.length > 1 && (
          <div className="p-4 rounded-xl bg-[#040508] border border-white/10 space-y-2.5 animate-in fade-in duration-150">
            <p className="text-xs font-mono font-bold text-slate-300">Chọn một địa chỉ đã lưu để đặt làm mặc định:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectDefaultAddress(addr.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                    addr.isDefault
                      ? 'border-[#39FF14] bg-[#39FF14]/10 text-white font-bold'
                      : 'border-white/10 hover:border-[#39FF14]/60 bg-[#0a0c12] hover:bg-[#11141e] text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white font-mono">{addr.recipientName} - {addr.phone}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                      {addr.addressLine}, {addr.province}
                    </p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[#39FF14] text-[11px] font-mono font-bold shrink-0 whitespace-nowrap">✓ Đang chọn</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pop-up Đổi Mật Khẩu với 2 Bước OTP Email */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={user?.email || ''}
      />
    </div>
  );
}
