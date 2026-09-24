import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Modal from '../components/Modal';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, KeyRound, CheckCircle2, X } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [userNameOrEmail, setUserNameOrEmail] = useState('buyer1@printhub3d.com');
  const [password, setPassword] = useState('123456@Abc');
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
      if (redirectPath) {
        navigate(redirectPath);
      } else if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
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
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || err?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.');
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
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || err?.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.');
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
    <div className="min-h-[75vh] flex items-center justify-center w-full py-6">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-emerald-900/40">
            3D
          </div>
          <h2 className="text-2xl font-black text-white">Đăng Nhập PrintHub 3D</h2>
          <p className="text-sm text-text-muted">Hệ thống dịch vụ in 3D &amp; Thước kỹ thuật sinh viên</p>
          {redirectPath && (
            <p className="text-xs text-[#22c55e] font-semibold bg-primary/10 border border-[#22c55e]/30 p-2 rounded-xl">
              Vui lòng đăng nhập để tiếp tục thao tác đặt hàng của bạn.
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="loginpage-field-1" className="text-xs font-bold text-slate-300">
              Email hoặc Tên đăng nhập
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input
                id="loginpage-field-1"
                type="text"
                value={userNameOrEmail}
                onChange={(e) => setUserNameOrEmail(e.target.value)}
                required
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                placeholder="vananh@student.edu.vn hoặc tên đăng nhập"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="loginpage-field-2" className="text-xs font-bold text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs text-[#22c55e] hover:underline font-semibold"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input
                id="loginpage-field-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng Nhập Ngay <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="text-[#22c55e] font-bold hover:underline">
            Tạo tài khoản sinh viên mới
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal with OTP Flow */}
      {showForgotModal && (
        <Modal open={showForgotModal} onClose={() => setShowForgotModal(false)} label="Quên mật khẩu">
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-md w-full text-xs space-y-4 shadow-2xl relative">
            <button
              aria-label="Đóng"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-[#22c55e] border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Quên Mật Khẩu Tài Khoản</h3>
              <p className="text-sm text-text-muted">
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Địa chỉ Email tài khoản:</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi mã OTP...
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Mã OTP 6 số (đã gửi đến mail):</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white font-mono text-center text-base tracking-widest outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Mật khẩu mới (tối thiểu 8 ký tự):</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới gồm hoa, thường, số..."
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Xác nhận lại mật khẩu mới:</label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#22c55e]"
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
                    className="text-[#22c55e] hover:underline font-semibold"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    'Xác Nhận Đặt Lại Mật Khẩu'
                  )}
                </button>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[#22c55e] mx-auto">
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
                  className="w-full py-3 rounded-xl bg-primary text-slate-950 font-black text-xs transition"
                >
                  Đăng Nhập Ngay Với Mật Khẩu Mới
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}