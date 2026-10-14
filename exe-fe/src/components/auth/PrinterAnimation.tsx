import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface PrinterAnimationProps {
  className?: string;
}

export const PrinterAnimation: React.FC<PrinterAnimationProps> = ({
  className = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);

  // Tự động nhận diện chế độ giảm chuyển động của hệ điều hành
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPaused(true);
    }

    const handler = (e: MediaQueryListEvent) => {
      setIsPaused(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className={`relative rounded-2xl bg-[#0D1116] border border-[#232B35] overflow-hidden flex flex-col justify-between select-none ${className}`}
      role="img"
      aria-label="Mô phỏng máy in 3D vận hành tại xưởng PrintHub 3D"
    >
      {/* Thanh Header mô phỏng máy in */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13181F]/90 border-b border-[#232B35] z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75 ${
                isPaused ? 'hidden' : ''
              }`}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF14]" />
          </span>
          <span className="text-[11px] font-mono tracking-wider font-bold text-slate-300 uppercase">
            PRINTHUB CORE-XY // ONLINE
          </span>
        </div>

        {/* Nút Pause/Play chuyển động */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1B222C] hover:bg-[#252E3A] border border-[#2E3845] text-slate-400 hover:text-white text-[11px] font-medium transition cursor-pointer"
          title={isPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
          aria-label={isPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 text-[#39FF14]" />
              <span className="hidden sm:inline">Tiếp tục</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Tạm dừng</span>
            </>
          )}
        </button>
      </div>

      {/* Khung mô phỏng khoang in 3D dạng Vector SVG */}
      <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] flex items-center justify-center p-4 bg-gradient-to-b from-[#0B0E12] via-[#0E1318] to-[#12171E] overflow-hidden">
        {/* Lưới tọa độ bàn in (Grid pattern) */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #39FF14 1px, transparent 1px), linear-gradient(to bottom, #39FF14 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Radial vignette tập trung điểm nhìn vào trung tâm bàn in */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0A0D11_90%)] pointer-events-none" />

        {/* Khung máy in 3D */}
        <div className="relative w-full max-w-[360px] h-[220px] sm:h-[250px] flex items-center justify-center">
          <svg
            viewBox="0 0 400 280"
            className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 1. Khung nhôm định hình 2020 bên ngoài */}
            <rect x="20" y="20" width="12" height="240" rx="2" fill="#1C232B" stroke="#2D3845" strokeWidth="1" />
            <rect x="368" y="20" width="12" height="240" rx="2" fill="#1C232B" stroke="#2D3845" strokeWidth="1" />
            <rect x="20" y="20" width="360" height="12" rx="2" fill="#181F26" stroke="#2D3845" strokeWidth="1" />
            <rect x="20" y="248" width="360" height="12" rx="2" fill="#181F26" stroke="#2D3845" strokeWidth="1" />

            {/* Trục dẫn hướng Z (Smooth Rods) */}
            <line x1="42" y1="32" x2="42" y2="248" stroke="#374352" strokeWidth="3" strokeDasharray="4 2" />
            <line x1="358" y1="32" x2="358" y2="248" stroke="#374352" strokeWidth="3" strokeDasharray="4 2" />

            {/* 2. Bàn in nhiệt (Heated Bed) với lưới tọa độ */}
            <g className="transition-all duration-300">
              {/* Mặt bàn in PEI mờ */}
              <rect x="60" y="205" width="280" height="12" rx="3" fill="#1A212A" stroke="#323E4D" strokeWidth="1.5" />
              <rect x="65" y="207" width="270" height="4" fill="#242E3B" />
              {/* Kẹp bàn in 4 góc */}
              <rect x="70" y="203" width="8" height="6" rx="1" fill="#475569" />
              <rect x="322" y="203" width="8" height="6" rx="1" fill="#475569" />

              {/* Lưới tọa độ bàn in */}
              <line x1="100" y1="205" x2="100" y2="217" stroke="#2A3542" strokeWidth="1" />
              <line x1="140" y1="205" x2="140" y2="217" stroke="#2A3542" strokeWidth="1" />
              <line x1="180" y1="205" x2="180" y2="217" stroke="#2A3542" strokeWidth="1" />
              <line x1="220" y1="205" x2="220" y2="217" stroke="#2A3542" strokeWidth="1" />
              <line x1="260" y1="205" x2="260" y2="217" stroke="#2A3542" strokeWidth="1" />
              <line x1="300" y1="205" x2="300" y2="217" stroke="#2A3542" strokeWidth="1" />
            </g>

            {/* 3. Sản phẩm in 3D đang hình thành (Mô hình khối kỹ thuật PrintHub 3D) */}
            <g transform="translate(150, 140)">
              {/* Lớp đế (Raft / Brim) */}
              <rect x="0" y="60" width="100" height="4" rx="1" fill="#39FF14" fillOpacity="0.3" />
              
              {/* Các lớp đã in (Layers) */}
              <rect x="15" y="52" width="70" height="8" rx="1" fill="#1E2833" stroke="#39FF14" strokeWidth="1" strokeOpacity="0.4" />
              <rect x="20" y="44" width="60" height="8" rx="1" fill="#1E2833" stroke="#39FF14" strokeWidth="1" strokeOpacity="0.6" />
              <rect x="22" y="36" width="56" height="8" rx="1" fill="#243240" stroke="#39FF14" strokeWidth="1" strokeOpacity="0.8" />
              <rect x="25" y="28" width="50" height="8" rx="1" fill="#2A3C4D" stroke="#39FF14" strokeWidth="1.2" />
              
              {/* Lớp trên cùng đang đùn nhựa - có glow neon */}
              <rect
                x="28"
                y="20"
                width="44"
                height="8"
                rx="1"
                fill="#39FF14"
                fillOpacity="0.85"
                className={isPaused ? '' : 'animate-pulse'}
              />
              
              {/* Đường vân in lớp FDM (Layer scanlines) */}
              <line x1="15" y1="56" x2="85" y2="56" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.5" />
              <line x1="20" y1="48" x2="80" y2="48" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.6" />
              <line x1="22" y1="40" x2="78" y2="40" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.7" />
              <line x1="25" y1="32" x2="75" y2="32" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.8" />
            </g>

            {/* 4. Thanh ray ngang trục X (X-Axis Gantry Rail) */}
            <rect x="30" y="115" width="340" height="10" rx="2" fill="#222B36" stroke="#3A4757" strokeWidth="1" />
            {/* Dây đai đồng bộ GT2 (Timing Belt) */}
            <line x1="32" y1="120" x2="368" y2="120" stroke="#161C22" strokeWidth="2" strokeDasharray="2 1" />

            {/* 5. Đầu in chuyển động (Print Head & Extruder Carriage) */}
            <g
              style={{
                transformOrigin: '200px 120px',
                animation: isPaused ? 'none' : 'printerHeadMove 4s ease-in-out infinite alternate',
              }}
            >
              {/* Cụm đầu đùn (Extruder Block) */}
              <rect x="180" y="98" width="40" height="28" rx="4" fill="#181F26" stroke="#39FF14" strokeWidth="1.5" />
              {/* Quạt tản nhiệt hotend */}
              <circle cx="200" cy="112" r="8" fill="#101419" stroke="#334155" strokeWidth="1" />
              <line x1="195" y1="112" x2="205" y2="112" stroke="#39FF14" strokeWidth="1" strokeOpacity="0.8" />
              <line x1="200" y1="107" x2="200" y2="117" stroke="#39FF14" strokeWidth="1" strokeOpacity="0.8" />

              {/* Khối gia nhiệt (Heater Block) & Đầu phun (Brass Nozzle) */}
              <polygon points="196,126 204,126 201,135 199,135" fill="#E2E8F0" />
              <rect x="194" y="123" width="12" height="4" rx="0.5" fill="#94A3B8" />

              {/* Dây dẫn nhựa & dây nguồn (Bowden tube) */}
              <path
                d="M 200 98 C 200 65, 120 40, 50 35"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Tia đùn nhựa / Điểm nóng phát sáng Neon */}
              <circle
                cx="200"
                cy="137"
                r="3"
                fill="#39FF14"
                className={isPaused ? '' : 'animate-ping'}
                opacity="0.8"
              />
              <circle cx="200" cy="137" r="1.5" fill="#FFFFFF" />
            </g>
          </svg>
        </div>

        {/* Gradient bóng phản chiếu dưới đáy bàn in */}
        <div className="absolute bottom-2 w-3/4 h-3 bg-[#39FF14]/5 blur-xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
};
