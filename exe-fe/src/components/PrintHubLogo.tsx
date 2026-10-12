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
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`bgGlow-${pixelSize}`} cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#0F1F38" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0A0F1D" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#060913" />
            </radialGradient>

            <linearGradient id={`borderGrad-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#39FF14" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id={`rulerBodyGrad-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0B1120" />
            </linearGradient>

            <linearGradient id={`rulerEdgeGrad-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>

            {glow && (
              <filter id={`neonGlow-${pixelSize}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feGaussianBlur stdDeviation="10" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Badge Shell */}
          <rect
            x="20"
            y="20"
            width="472"
            height="472"
            rx="96"
            fill={`url(#bgGlow-${pixelSize})`}
            stroke={`url(#borderGrad-${pixelSize})`}
            strokeWidth="3"
          />

          {/* Inner Grid & Blueprint Lines */}
          <rect
            x="36"
            y="36"
            width="440"
            height="440"
            rx="80"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.15"
            strokeDasharray="8 6"
          />

          {/* 3D Isometric Platform */}
          <g transform="translate(256, 245)">
            {/* Top Plane Grid */}
            <polygon
              points="0,-125 110,-60 0,5 -110,-60"
              fill="#1E293B"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <g stroke="#22D3EE" strokeOpacity="0.25" strokeWidth="1">
              <line x1="-55" y1="-92" x2="55" y2="-28" />
              <line x1="-28" y1="-109" x2="82" y2="-45" />
              <line x1="55" y1="-92" x2="-55" y2="-28" />
              <line x1="28" y1="-109" x2="-82" y2="-45" />
            </g>

            {/* Sliced Layers */}
            <polygon
              points="0,5 110,-60 110,65 0,130"
              fill="#064E3B"
              fillOpacity="0.3"
              stroke="#10B981"
              strokeWidth="1.5"
            />
            <g stroke="#39FF14" strokeOpacity="0.35" strokeWidth="1.2">
              <line x1="0" y1="25" x2="110" y2="-40" />
              <line x1="0" y1="45" x2="110" y2="-20" />
              <line x1="0" y1="65" x2="110" y2="0" />
              <line x1="0" y1="85" x2="110" y2="20" />
              <line x1="0" y1="105" x2="110" y2="40" />
            </g>
          </g>

          {/* Main Diagonal Ruler (CÂY THƯỚC KỸ THUẬT) */}
          <g transform="translate(130, 360) rotate(-42)">
            <rect
              x="-4"
              y="0"
              width="360"
              height="50"
              rx="7"
              fill={`url(#rulerBodyGrad-${pixelSize})`}
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Bevel Highlight */}
            <rect x="-4" y="0" width="360" height="6" rx="3" fill={`url(#rulerEdgeGrad-${pixelSize})`} />

            {/* Hanging Hole */}
            <circle cx="22" cy="25" r="9" fill="#0A0F1D" stroke={`url(#borderGrad-${pixelSize})`} strokeWidth="1.8" />
            <circle cx="22" cy="25" r="5" fill="#060913" />

            {/* Millimeter & Centimeter Graduations */}
            <g stroke="#39FF14" strokeWidth="1.6" strokeLinecap="round">
              {[0, 1, 2, 3, 4, 5, 6].map((cm) => {
                const baseX = 50 + cm * 50;
                return (
                  <React.Fragment key={cm}>
                    {/* Centimeter Tick */}
                    <line x1={baseX} y1={6} x2={baseX} y2={26} strokeWidth={cm === 0 || cm === 6 ? 2.2 : 1.8} stroke={cm === 0 || cm === 6 ? '#38BDF8' : '#39FF14'} />
                    {/* Millimeter Ticks between centimeters */}
                    {cm < 6 && (
                      <>
                        <line x1={baseX + 5} y1={6} x2={baseX + 5} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 10} y1={6} x2={baseX + 10} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 15} y1={6} x2={baseX + 15} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 20} y1={6} x2={baseX + 20} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        {/* 5mm tick */}
                        <line x1={baseX + 25} y1={6} x2={baseX + 25} y2={18} strokeWidth={1.4} />
                        <line x1={baseX + 30} y1={6} x2={baseX + 30} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 35} y1={6} x2={baseX + 35} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 40} y1={6} x2={baseX + 40} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                        <line x1={baseX + 45} y1={6} x2={baseX + 45} y2={12} strokeWidth={1} strokeOpacity={0.7} />
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </g>

            {/* Engraved Numbers */}
            <g fill="#94A3B8" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700">
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <text key={num} x={47 + num * 50} y={39}>
                  {num}
                </text>
              ))}
            </g>
          </g>

          {/* Laser Nozzle Point */}
          <g transform="translate(256, 120)">
            <line x1="0" y1="16" x2="0" y2="128" stroke="#39FF14" strokeWidth="2" {...(glow ? { filter: `url(#neonGlow-${pixelSize})` } : {})} />
            <circle cx="0" cy="128" r="4" fill="#FFFFFF" />
            <circle cx="0" cy="128" r="7" fill="#39FF14" opacity="0.6" />
          </g>

          {/* Bottom Badge Text */}
          {variant === 'badge' && (
            <g transform="translate(256, 440)" textAnchor="middle">
              <text y="0" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="26" letterSpacing="3">
                <tspan fill="#FFFFFF">PRINTHUB </tspan>
                <tspan fill="#39FF14">3D</tspan>
              </text>
              <text y="18" fill="#94A3B8" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700" letterSpacing="3">
                TECHNICAL RULER
              </text>
            </g>
          )}
        </svg>
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
      <div
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 160 160"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`hIconBg-${pixelSize}`} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#13243F" />
              <stop offset="60%" stopColor="#0B111F" />
              <stop offset="100%" stopColor="#060913" />
            </radialGradient>
            <linearGradient id={`hIconBorder-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>
          </defs>

          {/* Background Rounded Squircle */}
          <rect
            x="4"
            y="4"
            width="152"
            height="152"
            rx="36"
            fill={`url(#hIconBg-${pixelSize})`}
            stroke={`url(#hIconBorder-${pixelSize})`}
            strokeWidth="2.5"
          />

          {/* 3D Cube Base */}
          <polygon points="80,30 120,52 80,74 40,52" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
          <polygon points="80,74 120,52 120,96 80,118" fill="#064E3B" fillOpacity="0.4" stroke="#10B981" strokeWidth="1.2" />

          {/* FDM Printing Layer Lines */}
          <line x1="80" y1="85" x2="120" y2="63" stroke="#39FF14" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="80" y1="96" x2="120" y2="74" stroke="#39FF14" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="80" y1="107" x2="120" y2="85" stroke="#39FF14" strokeOpacity="0.4" strokeWidth="1" />

          {/* Diagonal Technical Ruler with Accurate Graduations */}
          <g transform="translate(34, 126) rotate(-42)">
            <rect x="0" y="0" width="134" height="22" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            <rect x="0" y="0" width="134" height="3" rx="1.5" fill="#39FF14" />
            {/* Hanging Hole */}
            <circle cx="10" cy="11" r="4" fill="#060913" stroke="#38BDF8" strokeWidth="1" />

            {/* Ruler Ticks */}
            <g stroke="#39FF14" strokeWidth="1" strokeLinecap="round">
              <line x1="22" y1="3" x2="22" y2="12" stroke="#38BDF8" strokeWidth="1.5" />
              <line x1="26" y1="3" x2="26" y2="6" strokeOpacity="0.7" />
              <line x1="30" y1="3" x2="30" y2="6" strokeOpacity="0.7" />
              <line x1="34" y1="3" x2="34" y2="6" strokeOpacity="0.7" />
              <line x1="38" y1="3" x2="38" y2="9" strokeWidth="1.2" />
              <line x1="42" y1="3" x2="42" y2="6" strokeOpacity="0.7" />
              <line x1="46" y1="3" x2="46" y2="6" strokeOpacity="0.7" />
              <line x1="50" y1="3" x2="50" y2="6" strokeOpacity="0.7" />

              <line x1="54" y1="3" x2="54" y2="12" strokeWidth="1.5" />
              <line x1="58" y1="3" x2="58" y2="6" strokeOpacity="0.7" />
              <line x1="62" y1="3" x2="62" y2="6" strokeOpacity="0.7" />
              <line x1="66" y1="3" x2="66" y2="6" strokeOpacity="0.7" />
              <line x1="70" y1="3" x2="70" y2="9" strokeWidth="1.2" />
              <line x1="74" y1="3" x2="74" y2="6" strokeOpacity="0.7" />
              <line x1="78" y1="3" x2="78" y2="6" strokeOpacity="0.7" />
              <line x1="82" y1="3" x2="82" y2="6" strokeOpacity="0.7" />

              <line x1="86" y1="3" x2="86" y2="12" strokeWidth="1.5" />
              <line x1="90" y1="3" x2="90" y2="6" strokeOpacity="0.7" />
              <line x1="94" y1="3" x2="94" y2="6" strokeOpacity="0.7" />
              <line x1="98" y1="3" x2="98" y2="6" strokeOpacity="0.7" />
              <line x1="102" y1="3" x2="102" y2="9" strokeWidth="1.2" />
              <line x1="106" y1="3" x2="106" y2="6" strokeOpacity="0.7" />
              <line x1="110" y1="3" x2="110" y2="6" strokeOpacity="0.7" />
              <line x1="114" y1="3" x2="114" y2="6" strokeOpacity="0.7" />
              <line x1="118" y1="3" x2="118" y2="12" strokeWidth="1.5" />
            </g>
          </g>

          {/* Central Laser Calibration Point */}
          <circle cx="80" cy="74" r="3" fill="#FFFFFF" />
          <circle cx="80" cy="74" r="6" fill="#39FF14" opacity="0.7" />
        </svg>
      </div>

      {/* Typography Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-white font-black tracking-wider text-base sm:text-lg">
            PRINTHUB
          </span>
          <span className="text-[#39FF14] font-black text-base sm:text-lg drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
            3D
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 ml-1 text-[9px] font-bold tracking-widest text-[#22D3EE] bg-[#0E1726] border border-[#22D3EE]/30 rounded">
            ±0.1mm
          </span>
        </div>

        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-none">
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default PrintHubLogo;
