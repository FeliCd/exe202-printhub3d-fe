import { useEffect, useRef, useState } from 'react';
import { User, Lock, CheckCircle2, Save, MapPin, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { user, updateProfile, setPasscode } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [university, setUniversity] = useState(user?.university || 'Đại Học Quốc Gia TP.HCM');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setStudentId(user.studentId || '');
      setUniversity(user.university || 'Đại Học Quốc Gia TP.HCM');
    }
  }, [user]);

  const [newPin, setNewPin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Change Password with OTP State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(successTimer.current);
      clearInterval(otpTimerRef.current);
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, phone, address, studentId, university });
    if (newPin.length === 6) {
      setPasscode(newPin);
      setNewPin('');
    }
    setSavedSuccess(true);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendPasswordOtp = async () => {
    if (!user?.email) {
      setChangePasswordError('Không tìm thấy địa chỉ email tài khoản.');
      return;
    }
    setIsSendingOtp(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');
    try {
      await authService.sendResetPasswordOtp(user.email);
      setChangePasswordSuccess('Mã OTP xác thực 6 số đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.');
      setOtpCountdown(60);
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(otpTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setChangePasswordError(err?.response?.data?.message || err?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword || !passwordOtp) {
      setChangePasswordError('Vui lòng điền đầy đủ mật khẩu cũ, mật khẩu mới và mã OTP.');
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    if (passwordOtp.length !== 6) {
      setChangePasswordError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }

    setIsChangingPassword(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');
    try {
      await authService.resetPassword({
        email: user?.email || '',
        oldPassword,
        newPassword,
        confirmPassword,
        otpCode: passwordOtp.trim(),
      });
      setChangePasswordSuccess('Chúc mừng! Mật khẩu tài khoản của bạn đã được cập nhật thành công.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtp('');
    } catch (err: any) {
      setChangePasswordError(err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ và mã OTP.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-[#22c55e]">
          <User className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Trang Cá Nhân &amp; Sổ Địa Chỉ</h1>
        </div>
        <p className="text-sm text-text-muted">Cập nhật thông tin sinh viên, cài đặt mã Passcode PIN và cấu hình địa chỉ KTX nhận hàng</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> Đã cập nhật thành công thông tin tài khoản, địa chỉ nhận hàng &amp; Mã Passcode!
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Info Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center font-black text-2xl text-white uppercase mx-auto shadow-xl">
            {name.substring(0, 2) || '3D'}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{name || 'Người dùng'}</h3>
            <p className="text-sm text-[#22c55e] font-semibold mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Xác thực B2C Sinh Viên'}
            </span>
          </div>
        </div>

        {/* Right Form Fields */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-surface border border-border space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Thông Tin Cá Nhân &amp; Địa Chỉ Giao Hàng</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="profilepage-field-1" className="font-bold text-slate-300">Họ và tên</label>
              <input id="profilepage-field-1"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="profilepage-field-2" className="font-bold text-slate-300">Số điện thoại liên hệ</label>
              <input id="profilepage-field-2"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="profilepage-field-3" className="font-bold text-slate-300">Mã số sinh viên (MSSV)</label>
              <input id="profilepage-field-3"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="profilepage-field-4" className="font-bold text-slate-300">Trường ĐH / Học viện</label>
              <input id="profilepage-field-4"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          {/* Địa chỉ nhận hàng mặc định */}
          <div className="space-y-1 pt-1">
            <label htmlFor="profilepage-field-address" className="font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#22c55e]" /> Địa chỉ nhận hàng mặc định (KTX / Nhà riêng)
            </label>
            <input
              id="profilepage-field-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ví dụ: Phòng 402, Tòa B3 KTX Khu B ĐHQG TP.HCM, Dĩ An, Bình Dương"
              className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
            />
            <p className="text-[11px] text-text-muted">Địa chỉ này sẽ được ưu tiên tự động điền khi bạn đặt hàng in 3D &amp; thước kỹ thuật.</p>
          </div>

          <div className="pt-3 border-t border-border space-y-2">
            <label htmlFor="profilepage-field-5" className="font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#22c55e]" /> Đổi Mã Passcode PIN 6 Số Cho Ví PrintHub
            </label>
            <input id="profilepage-field-5"
              type="password"
              maxLength={6}
              minLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Nhập 6 số mới (Ví dụ: 123456)"
              className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#22c55e]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
          >
            <Save className="w-4 h-4" /> Lưu Thay Đổi Thông Tin
          </button>
        </div>
      </form>

      {/* Change Password Card with Email OTP */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 text-xs">
        <div className="flex items-center gap-2 text-white">
          <KeyRound className="w-5 h-5 text-[#22c55e]" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Đổi Mật Khẩu Tài Khoản (Xác Thực Email OTP)</h3>
        </div>
        <p className="text-text-muted">
          Để bảo mật tài khoản, mọi thao tác đổi mật khẩu cần xác thực qua mã OTP 6 số được gửi trực tiếp đến hộp thư <strong className="text-white">{user?.email}</strong>.
        </p>

        {changePasswordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
            <span>{changePasswordSuccess}</span>
          </div>
        )}

        {changePasswordError && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{changePasswordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Mật khẩu mới (tối thiểu 8 ký tự)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-inset border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#22c55e]" /> Nhận mã OTP xác nhận về Email:
              </p>
              <p className="text-text-muted text-[11px]">Bấm nút bên cạnh để gửi mã OTP 6 số đến {user?.email}. Mã có hiệu lực 5 phút.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={passwordOtp}
                onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Mã OTP 6 số"
                className="w-28 bg-surface border border-border rounded-xl p-2 text-white font-mono text-center font-bold outline-none focus:border-[#22c55e]"
              />

              <button
                type="button"
                disabled={isSendingOtp || otpCountdown > 0}
                onClick={handleSendPasswordOtp}
                className="py-2.5 px-3 rounded-xl bg-surface-raised border border-border hover:border-[#22c55e] text-white font-bold text-xs whitespace-nowrap transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gửi...
                  </>
                ) : otpCountdown > 0 ? (
                  `Gửi lại sau (${otpCountdown}s)`
                ) : (
                  'Gửi Mã OTP'
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99] disabled:opacity-60"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý đổi mật khẩu...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" /> Xác Nhận Đổi Mật Khẩu
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

