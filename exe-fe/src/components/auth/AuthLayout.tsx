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
  badgeText = 'XƯỞNG CHẾ TÁC 3D // FDM & RESIN',
  children,
  footerLink,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#040508] text-[#F1F5F9] relative overflow-x-hidden selection:bg-[#39FF14] selection:text-black">
      {/* Background Ambient Cyber Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(57,255,20,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,255,20,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle Glow Points */}
      <div className="fixed top-1/4 -left-48 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-48 w-96 h-96 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 transition">
        
        {/* LEFT COLUMN: 3D PRINTER VISUALS & STUDIO ATTRIBUTES */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-8 bg-gradient-to-b from-[#07090e] to-[#040508] border-b lg:border-b-0 lg:border-r border-[#1e2433] flex flex-col justify-between gap-6">
          {/* Logo & Brand Header */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition">
              <PrintHubLogo variant="horizontal" size="md" />
            </Link>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#11141e] border border-[#1e2433] text-[10px] font-mono tracking-wider text-[#39FF14] uppercase whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              {badgeText}
            </div>
          </div>

          {/* 3D Printer Interactive Simulation */}
          <div className="my-auto py-2">
            <PrinterAnimation />
          </div>

          {/* Studio Key Attributes */}
          <div className="space-y-2.5 pt-2 border-t border-[#1e2433] text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
              <span>Thước kỹ thuật &amp; mô hình in 3D độ chính xác 0.12mm</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
              <span>Chế tác FDM/Resin công nghiệp trực tiếp tại PrintHub Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
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
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
