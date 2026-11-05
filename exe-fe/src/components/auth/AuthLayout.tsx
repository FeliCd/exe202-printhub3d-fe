import React from 'react';
import { Link } from 'react-router-dom';
import { PrintHubLogo } from '../PrintHubLogo';
import { PrinterAnimation } from './PrinterAnimation';
import { ShieldCheck, Cpu, Ruler } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  children: React.ReactNode;
  footerLink: {
    prompt: string;
    actionText: string;
    to: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  badgeText = 'Xưởng chế tác 3D // FDM & Resin',
  children,
  footerLink,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#040508] text-[#F1F5F9] relative overflow-x-hidden selection:bg-[#39FF14] selection:text-black">
      {/* Background Ambient Depth */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#040508] to-[#040508]" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0a0c12] border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 transition">
        
        {/* LEFT COLUMN: 3D PRINTER VISUALS & STUDIO ATTRIBUTES */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-8 bg-gradient-to-b from-[#07090e] to-[#040508] border-b lg:border-b-0 lg:border-r border-[#1e2433] flex flex-col justify-between gap-6">
          {/* Logo & Brand Header */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition">
              <PrintHubLogo variant="horizontal" size="md" />
            </Link>

            <div className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 text-xs font-mono leading-relaxed text-emerald-400">
              <span aria-hidden="true" className="w-2 h-2 shrink-0 rounded-full bg-emerald-400" />
              <span>{badgeText}</span>
            </div>
          </div>

          {/* 3D Printer Interactive Simulation */}
          <div className="my-auto py-2">
            <PrinterAnimation />
          </div>

          {/* Studio Key Attributes */}
          <div className="space-y-3 pt-3 border-t border-slate-800 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2.5">
              <Ruler className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thước kỹ thuật &amp; mô hình in 3D độ chính xác 0.12mm</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Chế tác FDM/Resin công nghiệp trực tiếp tại PrintHub Lab</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bảo mật dữ liệu tài khoản &amp; mã hóa OTP xác thực</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FORM & ACTIONS */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#0a0c12] space-y-6">
          <div className="space-y-6">
            {/* Form Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {title}
              </h1>
              <p className="max-w-[65ch] text-sm text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Form Content (Passed as children) */}
            <div className="space-y-4">
              {children}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#1e2433] text-center text-xs text-slate-400">
            {footerLink.prompt}{' '}
            <Link
              to={footerLink.to}
              className="text-[#39FF14] font-bold hover:underline ml-1 inline-flex items-center gap-1 transition whitespace-nowrap shrink-0"
            >
              {footerLink.actionText}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
