import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Branding Header */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto py-2">
        <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-lg">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22c55e] to-emerald-400 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-emerald-900/40">
            3D
          </div>
          <span className="text-xl font-extrabold tracking-wide">
            PrintHub <span className="text-[#39FF14]">3D</span>
          </span>
        </Link>
        <Link to="/catalog-preview" className="text-xs text-[#39FF14] hover:underline font-bold">
          Xem trước danh mục →
        </Link>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center w-full py-6">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-[#94a3b8] py-2 border-t border-[#272930]/60 max-w-6xl mx-auto w-full">
        © 2026 PrintHub 3D Industrial Platform. Hệ thống in 3D công nghiệp &amp; thiết bị kỹ thuật sinh viên.
      </footer>
    </div>
  );
}
