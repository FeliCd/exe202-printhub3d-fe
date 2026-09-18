import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, School, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('Đại Học Quốc Gia TP.HCM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'newstudent@hcmut.edu.vn', 'BUYER');
    updateProfile({ name: name.trim(), studentId: studentId.trim(), university: university.trim() });
    navigate('/catalog');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center w-full py-6">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Đăng Ký Tài Khoản Sinh Viên</h2>
          <p className="text-sm text-text-muted">Nhận ngay Voucher Tân Sinh Viên 15.000đ &amp; Khắc MSSV miễn phí</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="signuppage-field-1" className="text-xs font-bold text-slate-300">Họ và tên sinh viên</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input id="signuppage-field-1"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn Anh"
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="signuppage-field-2" className="text-xs font-bold text-slate-300">Email trường học / Email cá nhân</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input id="signuppage-field-2"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vananh@hcmut.edu.vn"
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="signuppage-field-3" className="text-xs font-bold text-slate-300">Mã số sinh viên (MSSV)</label>
              <input id="signuppage-field-3"
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="20210123"
                className="w-full bg-surface-inset border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="signuppage-field-4" className="text-xs font-bold text-slate-300">Trường Đại học</label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input id="signuppage-field-4"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="signuppage-field-5" className="text-xs font-bold text-slate-300">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input id="signuppage-field-5"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Tài khoản tự động kích hoạt gói Bảo Hành 1 Học Kỳ khi đăng ký!</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            Tạo Tài Khoản &amp; Đặt Hàng <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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