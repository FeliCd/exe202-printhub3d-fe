import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Lock, Mail, ShieldCheck, UserCheck, Factory, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('vananh.student@hcmut.edu.vn');
  const [role, setSelectedRole] = useState<UserRole>('BUYER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'FACTORY') {
      navigate('/factory/dashboard');
    } else {
      navigate('/catalog');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center w-full py-6">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-emerald-900/40">
            3D
          </div>
          <h2 className="text-2xl font-black text-white">─É─âng Nhß║¡p PrintHub 3D</h2>
          <p className="text-sm text-text-muted">Hß╗ç thß╗æng dß╗ïch vß╗Ñ in 3D &amp; Th╞░ß╗¢c kß╗╣ thuß║¡t sinh vi├¬n</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Chß╗ìn Vai Tr├▓ ─É─âng Nhß║¡p Demo</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('BUYER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'BUYER'
                    ? 'bg-primary/15 border-[#22c55e] text-[#22c55e]'
                    : 'bg-surface-inset border-border text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Sinh vi├¬n (Buyer)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('FACTORY')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'FACTORY'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-surface-inset border-border text-slate-400 hover:text-white'
                }`}
              >
                <Factory className="w-4 h-4" /> X╞░ß╗ƒng in
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  role === 'ADMIN'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                    : 'bg-surface-inset border-border text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Quß║ún trß╗ï vi├¬n
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="loginpage-field-1" className="text-xs font-bold text-slate-300">Email sinh vi├¬n / t├ái khoß║ún</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input id="loginpage-field-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
                placeholder="nhap.email@sinhvien.edu.vn"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="loginpage-field-2" className="text-xs font-bold text-slate-300">Mß║¡t khß║⌐u</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input id="loginpage-field-2"
                type="password"
                defaultValue="12345678"
                required
                className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            ─É─âng Nhß║¡p Ngay <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Ch╞░a c├│ t├ái khoß║ún?{' '}
          <Link to="/signup" className="text-[#22c55e] font-bold hover:underline">
            Tß║ío t├ái khoß║ún sinh vi├¬n mß╗¢i
          </Link>
        </div>
      </div>
    </div>
  );
}