import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/auth/AuthLayout';
import {
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

type StepNumber = 1 | 2 | 3;

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);

  // Form Fields - Step 1: Account Identification
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  // Form Fields - Step 2: Information & Security
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields - Step 3: Verification (OTP)
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Global UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Validation Helpers
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isUsernameValid = (val: string) => /^[a-zA-Z0-9_]{5,30}$/.test(val.trim());
  const isPhoneValid = (val: string) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(val.trim());

  // Password requirement checks
  const passwordChecks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const isPasswordSecure = Object.values(passwordChecks).every(Boolean);

  // Handle Step 1 -> Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!isEmailValid(email)) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: student@domain.com).');
      return;
    }

    if (!isUsernameValid(username)) {
      setErrorMsg('Tên đăng nhập phải từ 5-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới.');
      return;
    }

    setCurrentStep(2);
  };

  // Handle Step 2 -> Submit Registration to Backend -> Advance to Step 3
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Vui lòng nhập đầy đủ họ và tên của bạn.');
      return;
    }

    if (!isPhoneValid(phone)) {
      setErrorMsg('Số điện thoại không hợp lệ (phải gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    if (!isPasswordSecure) {
      setErrorMsg('Mật khẩu chưa đáp ứng đầy đủ tiêu chuẩn bảo mật.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      };

      await authService.register(payload);
      setResendCooldown(60);
      setInfoMsg(`Mã OTP xác thực đã được gửi tới email ${email.trim()}.`);
      setCurrentStep(3);
    } catch (err: any) {
      const errResponse = err?.response?.data;
      if (errResponse?.errors) {
        const errorDetails = Object.values(errResponse.errors).join('. ');
        setErrorMsg(errorDetails);
      } else {
        const backendMessage = errResponse?.message || err?.message;
        setErrorMsg(backendMessage || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã OTP gồm đúng 6 chữ số.');
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

      // Tự động đăng nhập bằng mật khẩu đã nhập trong phiên
      setTimeout(async () => {
        try {
          await login(username || email, password);
          navigate('/dashboard');
        } catch {
          navigate('/login');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.'
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResendingOtp) return;
    setErrorMsg('');
    setInfoMsg('');
    setIsResendingOtp(true);
    try {
      await authService.resendRegisterOtp(email.trim());
      setInfoMsg('Mã OTP mới đã được gửi lại vào email của bạn.');
      setResendCooldown(60);
      setOtpCode('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
      setErrorMsg(msg);
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <AuthLayout
      title={
        currentStep === 1
          ? 'Tạo Tài Khoản PrintHub'
          : currentStep === 2
          ? 'Thông Tin & Bảo Mật'
          : 'Xác Thực Tài Khoản (OTP)'
      }
      subtitle={
        currentStep === 1
          ? 'Bước 1/3: Thiết lập email và tên đăng nhập định danh của bạn.'
          : currentStep === 2
          ? 'Bước 2/3: Cung cấp thông tin liên hệ và mật khẩu an toàn.'
          : `Bước 3/3: Nhập mã xác nhận 6 chữ số được gửi tới ${email}.`
      }
      badgeText="ĐĂNG KÝ HỆ THỐNG // 3 BƯỚC AN TOÀN"
      footerLink={{
        prompt: 'Đã có tài khoản PrintHub 3D?',
        actionText: 'Đăng nhập ngay',
        to: '/login',
      }}
    >
      {/* STEPPER PROGRESS INDICATOR */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232B35]">
        {[
          { step: 1, label: 'Tài khoản' },
          { step: 2, label: 'Thông tin' },
          { step: 3, label: 'Xác thực' },
        ].map((item, idx) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isDone
                      ? 'bg-[#39FF14] text-slate-950 shadow-sm shadow-[#39FF14]/30'
                      : isActive
                      ? 'bg-[#18231C] text-[#39FF14] border border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                      : 'bg-[#182028] text-slate-500 border border-[#2B3542]'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.step}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isActive ? 'text-[#39FF14] font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {idx < 2 && (
                <div
                  className={`flex-1 h-[2px] mx-3 rounded transition-all ${
                    currentStep > idx + 1 ? 'bg-[#39FF14]' : 'bg-[#232B35]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ERROR ALERT BANNER */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* INFO ALERT BANNER */}
      {infoMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#39FF14]" />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* STEP 1: ACCOUNT IDENTIFICATION */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToStep2} className="space-y-4 pt-1">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-bold text-slate-300 block">
              Địa chỉ Email <span className="text-[#39FF14]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@domain.com"
                className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Mã OTP xác thực sẽ được gửi đến hòm thư này.
            </p>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="reg-username" className="text-xs font-bold text-slate-300 block">
              Tên người dùng (Username) <span className="text-[#39FF14]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="reg-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="nguyenvananh"
                className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Tối thiểu 5 ký tự chữ cái, số hoặc dấu gạch dưới.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-[#39FF14]/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Tiếp Tục Bước 2</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: PROFILE & SECURITY */}
      {currentStep === 2 && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-1">
          {/* Họ và tên & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-fullname" className="text-xs font-bold text-slate-300 block">
                Họ và tên <span className="text-[#39FF14]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn Anh"
                  className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="text-xs font-bold text-slate-300 block">
                Số điện thoại <span className="text-[#39FF14]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="0912345678"
                  className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Mật khẩu mới & Xác nhận mật khẩu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-bold text-slate-300 block">
                Mật khẩu mới <span className="text-[#39FF14]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-9 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white p-0.5"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-xs font-bold text-slate-300 block">
                Xác nhận lại <span className="text-[#39FF14]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-9 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white p-0.5"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Tiêu chuẩn mật khẩu Checklist */}
          {password && (
            <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-[#141B22] border border-[#242F3C] text-[11px]">
              <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-[#39FF14]' : 'text-slate-400'}`}>
                <span>{passwordChecks.length ? '✓' : '•'}</span> Tối thiểu 8 ký tự
              </div>
              <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-[#39FF14]' : 'text-slate-400'}`}>
                <span>{passwordChecks.hasUpper ? '✓' : '•'}</span> Có chữ hoa (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-[#39FF14]' : 'text-slate-400'}`}>
                <span>{passwordChecks.hasNumber ? '✓' : '•'}</span> Có chữ số (0-9)
              </div>
              <div className={`flex items-center gap-1.5 ${passwordChecks.hasSpecial ? 'text-[#39FF14]' : 'text-slate-400'}`}>
                <span>{passwordChecks.hasSpecial ? '✓' : '•'}</span> Ký tự đặc biệt (!@#$)
              </div>
            </div>
          )}

          {/* Navigation Buttons for Step 2 */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setCurrentStep(1);
              }}
              className="px-4 py-3 rounded-xl bg-[#182028] hover:bg-[#222C38] border border-[#2B3542] text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-[#39FF14]/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng Ký &amp; Nhận Mã OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: OTP VERIFICATION */}
      {currentStep === 3 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
          {otpSuccess ? (
            <div className="p-6 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-[#39FF14] mx-auto" />
              <p className="text-base text-white">Tài khoản đã được kích hoạt thành công!</p>
              <p className="text-slate-400 font-normal text-xs">
                Đang tự động chuyển hướng vào hệ thống...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="otp-input" className="text-xs font-bold text-slate-300 block text-center">
                  Nhập mã OTP 6 chữ số từ email
                </label>
                <div className="relative max-w-[260px] mx-auto">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-9 pr-4 py-3 text-center tracking-[8px] text-xl font-mono font-black text-white focus:border-[#39FF14] outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Mã có hiệu lực trong 5 phút. Vui lòng kiểm tra cả hòm thư Spam nếu chưa thấy.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-[#39FF14]/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang kích hoạt tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Xác Thực Kích Hoạt Tài Khoản</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-[#232B35]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setInfoMsg('');
                    setCurrentStep(2);
                  }}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isResendingOtp}
                  onClick={handleResendOtp}
                  className="text-[#39FF14] font-bold hover:underline disabled:text-slate-600 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
                >
                  {isResendingOtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gửi...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Gửi lại sau (${resendCooldown}s)`
                  ) : (
                    'Gửi lại mã OTP'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </AuthLayout>
  );
}