/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Lock, Mail, ShieldCheck, UserCheck, Factory, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('vananh.student@hcmut.edu.vn');
  const [password, setPassword] = useState('12345678');
  const [role, setSelectedRole] = useState<UserRole>('BUYER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, role, password);
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'FACTORY') {
        navigate('/factory/dashboard');
      } else {
        navigate('/catalog');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err?.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.');
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
          <h2 className="text-2xl font-black text-white">Đăng Nhập PrintHub 3D</h2>
          <p className="text-xs text-[#94a3b8]">Hệ thống dịch vụ in 3D &amp; Thước kỹ thuật sinh viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Chọn Vai Trò Đăng Nhập Demo</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('BUYER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'BUYER'
                    ? 'bg-[#22c55e]/15 border-[#22c55e] text-[#22c55e]'
                    : 'bg-[#111215] border-[#272930] text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Sinh viên (Buyer)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('FACTORY')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'FACTORY'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-[#111215] border-[#272930] text-slate-400 hover:text-white'
                }`}
              >
                <Factory className="w-4 h-4" /> Xưởng in
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'ADMIN'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                    : 'bg-[#111215] border-[#272930] text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Quản trị viên
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Email sinh viên / tài khoản</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                placeholder="nhap.email@sinhvien.edu.vn"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
                className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#94a3b8] pt-2 border-t border-[#272930]">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="text-[#22c55e] font-bold hover:underline">
            Tạo tài khoản sinh viên mới
          </Link>
        </div>
      </div>
    </div>
  );
}
