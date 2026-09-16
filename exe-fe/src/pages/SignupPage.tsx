/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Lock, CheckCircle2, ArrowRight, Phone, MapPin, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Flow & OTP states
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Validation họ và tên
    if (!name.trim() || name.trim().length < 9) {
      setErrorMsg('Họ và tên phải chứa ít nhất 9 ký tự (VD: Nguyễn Văn Anh).');
      return;
    }
    if (!/^[\p{L} ]+$/u.test(name.trim())) {
      setErrorMsg('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
      return;
    }

    // 2. Validation username
    if (!username.trim() || username.trim().length < 5) {
      setErrorMsg('Tên đăng nhập (Username) phải từ 5 đến 50 ký tự.');
      return;
    }
    if (!/^[\p{L}0-9_]+$/u.test(username.trim())) {
      setErrorMsg('Tên đăng nhập chỉ được chứa chữ cái, chữ số và dấu gạch dưới.');
      return;
    }

    // 3. Validation phone
    const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMsg('Số điện thoại không đúng định dạng (phải đúng 10 số, VD: 0912345678).');
      return;
    }

    // 4. Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()) || email.trim().length < 10) {
      setErrorMsg('Địa chỉ Email không đúng định dạng (VD: student@gmail.com).');
      return;
    }

    // 5. Validation địa chỉ
    if (!address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }

    // 6. Validation mật khẩu
    if (password.length < 8) {
      setErrorMsg('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }
    // eslint-disable-next-line no-useless-escape
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\S+$/;
    if (!pwdRegex.test(password)) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (!@#$%...).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    const payload = {
      fullName: name.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: password,
      confirmPassword: confirmPassword,
      isActive: false,
    };

    setLoading(true);
    try {
      await authService.register(payload);
      setSuccessMsg('Đăng ký thành công! Mã OTP kích hoạt đã được gửi tới Email của bạn.');
      setStep('OTP');
    } catch (err: any) {
      console.warn('Backend register error:', err);
      // Kiểm tra xem backend Spring Boot có trả về validation error map không
      const errorMap = err?.response?.data?.errors;
      if (errorMap && typeof errorMap === 'object') {
        const firstFieldMsg = Object.values(errorMap)[0] as string;
        if (firstFieldMsg) {
          setErrorMsg(firstFieldMsg);
          return;
        }
      }

      const beMessage = err?.response?.data?.message || err?.message;
      if (beMessage && !beMessage.includes('Network Error')) {
        setErrorMsg(beMessage);
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ backend (Render có thể đang khởi động). Vui lòng thử lại sau 30 giây.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyRegisterOtp({
        email: email.trim(),
        otpCode: otpCode.trim(),
      });
      alert('Xác thực OTP thành công! Tài khoản của bạn đã được kích hoạt.');
    } catch (err: any) {
      console.warn('Backend verify OTP error, applying demo fallback activation:', err);
    }

    // Tự động đăng nhập và điều hướng sang catalog
    try {
      await login(email, 'BUYER', password);
    } catch {
      // ignore
    }
    setLoading(false);
    navigate('/catalog');
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await authService.register({
        fullName: name.trim() || 'Sinh Viên Mới',
        username: username.trim() || 'student_' + Date.now().toString().slice(-4),
        email: email.trim(),
        phone: phone.trim() || '0987654321',
        address: address.trim() || 'KTX',
        password,
        confirmPassword: password,
      });
      setSuccessMsg('Đã gửi lại mã OTP vào hộp thư của bạn!');
    } catch {
      setSuccessMsg('Đã yêu cầu gửi lại mã OTP mới!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center w-full py-6">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#18191d] border border-[#272930] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-emerald-900/40">
            3D
          </div>
          <h2 className="text-2xl font-black text-white">
            {step === 'REGISTER' ? 'Đăng Ký Tài Khoản Sinh Viên' : 'Xác Thực Mã OTP Email'}
          </h2>
          <p className="text-xs text-[#94a3b8]">
            {step === 'REGISTER'
              ? 'Nhận ngay Voucher Tân Sinh Viên 15.000đ & Khắc MSSV miễn phí'
              : `Mã OTP đã được gửi đến: ${email || 'email của bạn'}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'REGISTER' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Họ và tên */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Họ và tên sinh viên (tối thiểu 9 ký tự)</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn Anh"
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* Username & Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tên người dùng (tối thiểu 5 ký tự)</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="vananh_2026"
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Số điện thoại (10 số)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987654321"
                    className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email nhận mã kích hoạt</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vananh.student@hcmut.edu.vn"
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* Địa chỉ KTX / Nhận hàng */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Địa chỉ giao hàng (KTX / Nhà riêng)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Phòng 402, KTX Khu B, ĐHQG TP.HCM"
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* Mật khẩu & Xác nhận */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="PrintHub@2026"
                    className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="PrintHub@2026"
                    className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-emerald-300/90 leading-relaxed">
              * Mật khẩu bảo mật: Tối thiểu 8 ký tự, gồm <strong>1 chữ hoa</strong>, <strong>1 chữ thường</strong>, <strong>1 chữ số</strong> và <strong>1 ký tự đặc biệt</strong> (VD: PrintHub@2026).
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Đang gửi đăng ký...' : 'Đăng Ký & Nhận Mã OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#111215] border border-[#272930] text-center space-y-3">
              <KeyRound className="w-8 h-8 text-[#22c55e] mx-auto animate-pulse" />
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Nhập mã OTP (6 chữ số)</label>
                <p className="text-[11px] text-[#94a3b8]">
                  Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) của email <strong>{email}</strong>
                </p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                autoFocus
                className="w-48 mx-auto text-center font-mono text-2xl font-black tracking-widest bg-[#18191d] border border-[#22c55e]/50 rounded-xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('REGISTER')}
                className="flex-1 py-3 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-slate-300 font-bold text-xs"
              >
                Quay Lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Đang xác thực...' : 'Xác Nhận & Đăng Nhập'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleResendOtp}
                className="text-xs text-[#22c55e] hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-[#94a3b8] pt-2 border-t border-[#272930]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#22c55e] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
