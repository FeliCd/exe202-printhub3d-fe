import React from 'react';

export interface PrintHubLogoProps {
  /** Variant of the logo to display */
  variant?: 'icon' | 'cube-ruler' | 'horizontal' | 'badge' | 'minimal';
  /** Size in pixels (width or height depending on variant) */
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom extra classes */
  className?: string;
  /** Whether to show glowing neon effects */
  glow?: boolean;
  /** Custom click handler or link behavior */
  onClick?: () => void;
  /** Optional custom text override for brand label */
  subtext?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

/**
 * PrintHub 3D Brand Logo Component
 * Incorporates Cyber-Industrial Navy Black palette with Technical Precision Ruler & 3D Layer elements.
 */
export const PrintHubLogo: React.FC<PrintHubLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  glow = true,
  onClick,
  subtext = 'Dịch vụ in 3D & Thước kỹ thuật',
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 44;

  // 0. CUBE RULER: Modern 3D Corner Ruler measuring floating isometric cube
  if (variant === 'cube-ruler') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        onClick={onClick}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`crBg-${pixelSize}`} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0C1626" />
              <stop offset="55%" stopColor="#070A12" />
              <stop offset="100%" stopColor="#030508" />
            </radialGradient>
            <linearGradient id={`crStroke-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>
            {glow && (
              <filter id={`crGlow-${pixelSize}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>
          <rect width="512" height="512" rx="72" fill={`url(#crBg-${pixelSize})`} stroke="#1E293B" strokeWidth="2" />
          
          {/* Technical Corner Ruler hugging 3D cube */}
          <path
            d="M 256,92 L 156,150 L 156,270 L 256,328 L 356,270 L 356,242 L 256,300 L 184,258 L 184,166 L 256,124 Z"
            fill="#0F172A"
            stroke={`url(#crStroke-${pixelSize})`}
            strokeWidth="3.5"
            strokeLinejoin="round"
            {...(glow ? { filter: `url(#crGlow-${pixelSize})` } : {})}
          />
          {/* Millimeter Ticks */}
          <g stroke="#39FF14" strokeWidth="1.8" strokeLinecap="round">
            {/* Top-Left arm ticks */}
            <line x1="246" y1="118" x2="251" y2="110" stroke="#22D3EE" strokeWidth="2.4" />
            <line x1="228" y1="128" x2="233" y2="120" />
            <line x1="210" y1="139" x2="215" y2="131" />
            <line x1="192" y1="149" x2="197" y2="141" stroke="#22D3EE" strokeWidth="2.4" />
            {/* Vertical arm ticks */}
            <line x1="184" y1="176" x2="170" y2="176" stroke="#22D3EE" strokeWidth="2.4" />
            <line x1="184" y1="198" x2="172" y2="198" />
            <line x1="184" y1="220" x2="172" y2="220" />
            <line x1="184" y1="242" x2="170" y2="242" stroke="#22D3EE" strokeWidth="2.4" />
            {/* Bottom-right arm ticks */}
            <line x1="266" y1="294" x2="271" y2="303" stroke="#22D3EE" strokeWidth="2.4" />
            <line x1="288" y1="281" x2="293" y2="290" />
            <line x1="310" y1="268" x2="315" y2="277" />
            <line x1="332" y1="256" x2="337" y2="265" stroke="#22D3EE" strokeWidth="2.4" />
          </g>

          {/* Floating 3D Cube */}
          <g transform="translate(256, 210)">
            <polygon points="0,-64 56,-32 0,0 -56,-32" fill="#0EA5E9" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="2.5" />
            <polygon points="-56,-32 0,0 0,64 -56,32" fill="#0284C7" fillOpacity="0.2" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="0,0 56,-32 56,32 0,64" fill="#22D3EE" fillOpacity="0.25" stroke="#22D3EE" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="6" fill="#39FF14" opacity="0.8" />
          </g>

          {/* Brand typography */}
          <text x="256" y="420" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="34" letterSpacing="3">
            <tspan fill="#FFFFFF">PRINTHUB </tspan>
            <tspan fill="#39FF14">3D</tspan>
          </text>
          <text x="256" y="445" textAnchor="middle" fill="#94A3B8" fontFamily="'Montserrat', sans-serif" fontSize="11" fontWeight="700" letterSpacing="4">
            PRECISION &amp; 3D PRINTING
          </text>
        </svg>
      </div>
    );
  }

  // 1. MINIMAL / INLINE ICON: For tight spaces like mobile navbar or small buttons
  if (variant === 'minimal') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform hover:scale-105 ${className}`}
        onClick={onClick}
      >
        <rect width="40" height="40" rx="10" fill="#0D111A" stroke="#22c55e" strokeWidth="1.5" />
        {/* Isometric 3D box top */}
        <path d="M20 7L31 13L20 19L9 13Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
        {/* Sliced layers */}
        <path d="M20 19L31 13V23L20 29Z" fill="#064E3B" stroke="#22C55E" strokeWidth="1" />
        {/* Technical Ruler Diagonal */}
        <path d="M8 29L26 11" stroke="#39FF14" strokeWidth="3.5" strokeLinecap="round" />
        {/* Ruler Tick Marks */}
        <line x1="11" y1="26" x2="13" y2="28" stroke="#0D111A" strokeWidth="1" />
        <line x1="14" y1="23" x2="16" y2="25" stroke="#0D111A" strokeWidth="1" />
        <line x1="17" y1="20" x2="19" y2="22" stroke="#0D111A" strokeWidth="1" />
        <line x1="20" y1="17" x2="22" y2="19" stroke="#0D111A" strokeWidth="1" />
        <line x1="23" y1="14" x2="25" y2="16" stroke="#0D111A" strokeWidth="1" />
      </svg>
    );
  }

  // 2. ICON ONLY / BADGE MARK: Square / Rounded Badge for Favicon, Avatar, or Nav Icon
  if (variant === 'icon' || variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        onClick={onClick}
      >
        <img
          src="/logo-printhub.svg"
          alt="PrintHub 3D Logo"
          className="w-full h-full object-contain rounded-2xl shadow-lg shadow-[#39FF14]/20"
        />
      </div>
    );
  }

  // 3. HORIZONTAL FULL LOGO (Mark + Typography)
  return (
    <div
      className={`inline-flex items-center gap-3 group select-none ${className}`}
      onClick={onClick}
    >
      {/* Icon Graphic Container */}
      <img
        src="/logo-printhub.svg"
        alt="PrintHub 3D Logo"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-xl object-contain shadow-md shadow-[#39FF14]/20"
        style={{ width: pixelSize, height: pixelSize }}
      />

      {/* Typography Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-white font-black tracking-wider text-base sm:text-lg">
            PRINTHUB
          </span>
          <span className="text-[#39FF14] font-black text-base sm:text-lg">
            3D
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 ml-1 text-xs font-bold tracking-wide text-slate-300 bg-slate-800/80 border border-slate-700/80 rounded">
            ±0.1mm
          </span>
        </div>

        <span className="text-xs font-medium tracking-wide text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-none">
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default PrintHubLogo;
