import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';
import Modal from '../components/Modal';
import { AuthLayout } from '../components/auth/AuthLayout';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameOrEmail.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const userRole = await login(userNameOrEmail.trim(), password);
      if (redirectPath?.startsWith('/') && !redirectPath.startsWith('//')) {
        navigate(redirectPath);
      } else if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Vui lòng nhập địa chỉ email.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.sendForgotPasswordOtp(forgotEmail.trim());
      setForgotStep('otp');
    } catch (err: unknown) {
      setForgotError(
        getApiErrorMessage(err, 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.')
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length !== 6) {
      setForgotError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.forgotPassword({
        email: forgotEmail.trim(),
        otpCode: forgotOtp.trim(),
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
      });
      setForgotStep('success');
    } catch (err: unknown) {
      setForgotError(
        getApiErrorMessage(err, 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.')
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(userNameOrEmail.includes('@') ? userNameOrEmail : '');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotStep('email');
    setShowForgotModal(true);
  };

  return (
    <AuthLayout
      title="Đăng Nhập Tài Khoản"
      subtitle="Đăng nhập để đặt in 3D, tùy biến thước đo kỹ thuật và theo dõi tiến độ đơn hàng."
      badgeText="XƯỞNG CHẾ TÁC 3D // TRUY CẬP HỆ THỐNG"
      footerLink={{
        prompt: 'Chưa có tài khoản PrintHub?',
        actionText: 'Tạo tài khoản mới ngay',
        to: '/signup',
      }}
    >
      {/* Notice nếu có redirect từ đơn hàng */}
      {redirectPath && (
        <div className="p-3 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-medium flex items-center gap-2">
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>Vui lòng đăng nhập để tiếp tục thao tác đơn hàng của bạn.</span>
        </div>
      )}

      {/* Thông báo lỗi đăng nhập */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Trường 1: Email hoặc Tên đăng nhập */}
        <div className="space-y-1.5">
          <label htmlFor="login-username" className="text-xs font-bold text-slate-300 block">
            Email hoặc Tên đăng nhập
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              id="login-username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              type="text"
              required
              value={userNameOrEmail}
              onChange={(e) => setUserNameOrEmail(e.target.value)}
              placeholder="tennguoidung hoặc email@domain.com"
              className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
            />
          </div>
        </div>

        {/* Trường 2: Mật khẩu & Hiện/Ẩn mật khẩu */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-300">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={openForgotModal}
              className="text-xs text-[#39FF14] hover:underline font-semibold transition cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              id="login-password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full bg-[#182028] border border-[#2B3542] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nút Đăng nhập */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-[#39FF14]/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Đang đăng nhập vào xưởng...</span>
            </>
          ) : (
            <>
              <span>Đăng Nhập Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Forgot Password Modal with OTP Flow */}
      {showForgotModal && (
        <Modal open={showForgotModal} onClose={() => setShowForgotModal(false)} label="Quên mật khẩu">
          <div className="bg-[#11161C] border border-[#28323E] rounded-3xl p-6 sm:p-7 max-w-md w-full text-xs space-y-4 shadow-2xl relative text-[#F1F5F9]">
            <button
              aria-label="Đóng"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1A222B] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Quên Mật Khẩu Tài Khoản</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {forgotStep === 'email' && 'Nhập email đã đăng ký để nhận mã xác thực OTP (6 chữ số).'}
                {forgotStep === 'otp' && `Nhập mã OTP đã gửi đến ${forgotEmail} và thiết lập mật khẩu mới.`}
                {forgotStep === 'success' && 'Mật khẩu của bạn đã được cập nhật thành công!'}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'email' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Địa chỉ Email tài khoản:</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[#182028] border border-[#2B3542] rounded-xl p-3 text-white outline-none focus:border-[#39FF14] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Đang gửi mã OTP...
                    </>
                  ) : (
                    <>
                      Gửi Mã OTP Về Email <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Mã OTP 6 số (đã gửi đến mail):</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#182028] border border-[#2B3542] rounded-xl p-3 text-white font-mono text-center text-lg tracking-widest outline-none focus:border-[#39FF14] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Mật khẩu mới (tối thiểu 8 ký tự):</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới gồm hoa, thường, số..."
                    className="w-full bg-[#182028] border border-[#2B3542] rounded-xl p-3 text-white outline-none focus:border-[#39FF14] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Xác nhận lại mật khẩu mới:</label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-[#182028] border border-[#2B3542] rounded-xl p-3 text-white outline-none focus:border-[#39FF14] transition"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Đổi Email khác
                  </button>
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    disabled={forgotLoading}
                    className="text-[#39FF14] hover:underline font-semibold"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Đang cập nhật...
                    </>
                  ) : (
                    'Xác Nhận Đặt Lại Mật Khẩu'
                  )}
                </button>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-300">
                  Mật khẩu tài khoản của bạn đã được thay đổi thành công. Bạn có thể đăng nhập ngay với mật khẩu mới.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(forgotNewPassword);
                    setUserNameOrEmail(forgotEmail);
                    setShowForgotModal(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#39FF14] text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  Đăng Nhập Ngay Với Mật Khẩu Mới
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AuthLayout>
  );
}
