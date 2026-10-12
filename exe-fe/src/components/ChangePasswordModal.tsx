import { useState, useRef, useEffect } from 'react';
import {
  KeyRound,
  X,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [passwordOtp, setPasswordOtp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otpTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearInterval(otpTimerRef.current);
    };
  }, []);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setEmailInput('');
      setIsOtpSent(false);
      setPasswordOtp('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const normalizedInput = emailInput.trim().toLowerCase();
    const normalizedUserEmail = userEmail.trim().toLowerCase();

    // Kiểm tra match email tài khoản
    if (!normalizedInput) {
      setErrorMsg('Vui lòng nhập địa chỉ email nhận mã OTP.');
      return;
    }

    if (normalizedInput !== normalizedUserEmail) {
      setErrorMsg('Email không trùng khớp với tài khoản hiện tại! Vui lòng kiểm tra lại.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await authService.sendResetPasswordOtp(normalizedUserEmail);
      setIsOtpSent(true);
      setSuccessMsg(`Mã OTP 6 số đã được gửi tới hộp thư: ${userEmail}. Mã có hiệu lực 5 phút.`);
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
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, 'Không thể gửi mã OTP. Vui lòng thử lại sau.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || isSendingOtp) return;
    setErrorMsg('');
    setIsSendingOtp(true);
    try {
      await authService.sendResetPasswordOtp(userEmail);
      setSuccessMsg(`Đã gửi lại mã OTP mới về ${userEmail}.`);
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
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, 'Không thể gửi lại mã OTP. Vui lòng thử lại.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passwordOtp || passwordOtp.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đúng mã OTP xác thực gồm 6 chữ số.');
      return;
    }
    if (!oldPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email: userEmail,
        oldPassword,
        newPassword,
        confirmPassword,
        otpCode: passwordOtp.trim(),
      });
      setSuccessMsg('Chúc mừng! Mật khẩu tài khoản của bạn đã được cập nhật thành công.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ và mã OTP xác thực.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0f0f12] border border-border/90 shadow-2xl overflow-hidden space-y-0"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[#39FF14]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Đổi Mật Khẩu Tài Khoản</h2>
              <p className="text-[11px] text-text-muted font-normal">Xác thực 2 bước an toàn qua Email OTP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Thông báo thành công */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BƯỚC 1: XÁC THỰC EMAIL TÀI KHOẢN (Chưa gửi OTP) */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-surface-inset border border-border/80 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#39FF14]" /> Quy trình bảo mật tài khoản:
                </p>
                <p className="text-text-muted leading-relaxed">
                  Để đảm bảo chính chủ, vui lòng nhập chính xác địa chỉ Email của tài khoản này để nhận mã xác thực OTP 6 số.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#39FF14]" /> Nhập Email tài khoản nhận OTP <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Nhập email của bạn (Ví dụ: student@gmail.com)"
                  className="w-full bg-surface-inset border border-border rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-border hover:bg-surface-inset text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra &amp; gửi OTP...
                    </>
                  ) : (
                    'Gửi Mã OTP Xác Thực'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* BƯỚC 2: NHẬP MÃ OTP & MẬT KHẨU MỚI (Đã gửi OTP) */
            <form onSubmit={handleSubmitNewPassword} className="space-y-4">
              {/* Box OTP */}
              <div className="p-3.5 rounded-xl bg-surface-inset border border-border flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Mã OTP 6 số gửi về:</p>
                  <p className="text-[11px] text-[#39FF14] font-mono truncate max-w-[220px]">{userEmail}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-24 bg-surface border border-[#39FF14]/60 rounded-xl p-2 text-center text-sm font-mono font-bold text-white outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSendingOtp || otpCountdown > 0}
                    onClick={handleResendOtp}
                    className="py-2 px-2.5 rounded-xl border border-border hover:border-[#39FF14] text-[11px] text-slate-300 hover:text-white transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {otpCountdown > 0 ? `Lại sau (${otpCountdown}s)` : 'Gửi lại'}
                  </button>
                </div>
              </div>

              {/* Mật khẩu cũ */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-text-muted" /> Mật khẩu hiện tại <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              {/* Mật khẩu mới & xác nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mật khẩu mới (tối thiểu 8 ký tự) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Xác nhận mật khẩu mới <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
                  />
                </div>
              </div>

              {/* Cụm nút bấm */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-border hover:bg-surface-inset text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    'Xác Nhận Đổi Mật Khẩu'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
