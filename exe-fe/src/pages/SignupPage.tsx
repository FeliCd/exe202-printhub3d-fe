/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Lock,
  School,
  Phone,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  KeyRound,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function SignupPage() {
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Registration form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('Đại Học Quốc Gia TP.HCM');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu 8 ký tự.');
      return;
    }
    if (!username.trim() || username.trim().length < 5) {
      setErrorMsg('Tên người dùng phải có độ dài từ 5 ký tự trở lên.');
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API đăng ký backend
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      };
      if (address.trim()) {
        payload.address = address.trim();
      }

      await authService.register(payload);
      setStep('OTP');
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.message;
      // Fallback cho môi trường dev nếu backend chưa bật Redis/MailService
      if (!err?.response || err?.response?.status >= 500) {
        console.warn('Backend API unavailable or error, creating account locally:', err);
        await login(email || username, password);
        updateProfile({
          name: fullName.trim(),
          phone: phone.trim(),
          studentId: studentId.trim(),
          university: university.trim(),
          address: address.trim(),
        });
        navigate('/dashboard');
        return;
      }
      setErrorMsg(backendMessage || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMsg('');
    try {
      await authService.verifyRegisterOtp({
        email: email.trim(),
        otpCode: otpCode.trim(),
      });
      setOtpSuccess(true);
      // Tự động đăng nhập sau khi kích hoạt thành công
      setTimeout(async () => {
        try {
          await login(username || email, password);
          updateProfile({
            name: fullName.trim(),
            phone: phone.trim(),
            studentId: studentId.trim(),
            university: university.trim(),
            address: address.trim(),
          });
          navigate('/dashboard');
        } catch {
          navigate('/login');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center w-full py-6">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">
            {step === 'REGISTER' ? 'Đăng Ký Tài Khoản Sinh Viên' : 'Xác Thực Tài Khoản (OTP)'}
          </h2>
          <p className="text-sm text-text-muted">
            {step === 'REGISTER'
              ? 'Nhận ngay Voucher Tân Sinh Viên 15.000đ & Khắc MSSV miễn phí'
              : `Mã OTP đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư.`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'REGISTER' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên & Tên đăng nhập */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="signuppage-field-1" className="text-xs font-bold text-slate-300">
                  Họ và tên sinh viên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-1"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn Anh"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signuppage-field-username" className="text-xs font-bold text-slate-300">
                  Tên tài khoản (Username) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="nguyenvananh"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email & Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="signuppage-field-2" className="text-xs font-bold text-slate-300">
                  Email trường học / Email cá nhân <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vananh@hcmut.edu.vn"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signuppage-field-phone" className="text-xs font-bold text-slate-300">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    pattern="[0-9]{10}"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ (Tùy chọn - Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="signuppage-field-address" className="text-xs font-bold text-slate-300">
                  Địa chỉ nhận hàng
                </label>
                <span className="text-[11px] text-text-muted font-normal italic">
                  (Tùy chọn - có thể cấu hình sau trong trang cá nhân)
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input
                  id="signuppage-field-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: Phòng 302, KTX Khu B ĐHQG TP.HCM (hoặc để trống)"
                  className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* MSSV & Trường ĐH (Hỗ trợ ưu đãi sinh viên) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="signuppage-field-3" className="text-xs font-bold text-slate-300">
                  Mã số sinh viên (MSSV)
                </label>
                <input
                  id="signuppage-field-3"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="20210123 (để nhận voucher)"
                  className="w-full bg-surface-inset border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="signuppage-field-4" className="text-xs font-bold text-slate-300">
                  Trường Đại học
                </label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-4"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mật khẩu & Xác nhận mật khẩu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="signuppage-field-5" className="text-xs font-bold text-slate-300">
                  Mật khẩu mới <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-5"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signuppage-field-confirm" className="text-xs font-bold text-slate-300">
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    id="signuppage-field-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>Tài khoản tự động kích hoạt gói Bảo Hành 1 Học Kỳ khi đăng ký!</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Tạo Tài Khoản &amp; Tiếp Tục <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Màn hình nhập OTP kích hoạt */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {otpSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-[#22c55e] mx-auto" />
                <p>Tài khoản đã được kích hoạt thành công!</p>
                <p className="text-text-muted font-normal text-[11px]">Đang đăng nhập vào hệ thống...</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label htmlFor="otp-input" className="text-xs font-bold text-slate-300">
                    Nhập mã OTP 6 chữ số
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-center tracking-widest text-lg font-mono text-white focus:border-[#22c55e] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang xác thực...
                    </>
                  ) : (
                    <>
                      Xác Thực Kích Hoạt Tài Khoản <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-text-muted pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('REGISTER')}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Quay lại chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-[#22c55e] font-bold hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        <div className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#22c55e] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}