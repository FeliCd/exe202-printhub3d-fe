import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  Box,
  Printer,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  Compass,
  Cpu,
  Award,
  ChevronRight
} from 'lucide-react';
import LandingNavbar from '../layouts/LandingNavbar';
import Footer from '../components/Footer';
import FeaturedReviews from '../features/reviews/FeaturedReviews';

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const landingRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('cancel') || params.has('orderCode') || params.has('status')) {
      navigate('/payment-result' + location.search, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) return;
    const targets = landingRef.current?.querySelectorAll('[data-scroll-reveal]');
    if (!targets?.length) return;

    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        animations.get(entry.target)?.cancel();
        if (!entry.isIntersecting) continue;

        const offset = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? -14 : 14;
        const animation = entry.target.animate(
          [{ translate: `0 ${offset}px`, opacity: 0.84 }, { translate: '0 0', opacity: 1 }],
          { duration: 440, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
        animations.set(entry.target, animation);
      }
    }, { rootMargin: '-80px 0px -40px' });

    targets.forEach(target => observer.observe(target));
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
    };
  }, [reducedMotion]);

  return (
    <div
      ref={landingRef}
      className="landing-page w-full h-full overflow-x-clip bg-theme-canvas text-theme-ink flex flex-col font-sans selection:bg-theme-action selection:text-black"
    >
      {/* 1. MARKETING NAVBAR (Ref Header Pill Layout) */}
      <LandingNavbar />

      {/* 2. MAIN LANDING CONTENT */}
      <main className="flex-1 w-full flex flex-col space-y-20 pb-20">
        {/* ========================================================================= */}
        {/* HERO SECTION — DARK INDUSTRIAL PRECISION (NEON GREEN) */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
          {/* Main Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a0d16] via-[#070910] to-[#040508] border border-white/10 app-light:border-theme-line p-6 sm:p-10 lg:p-14 overflow-hidden shadow-lg app-light:shadow-none app-light:from-white app-light:via-[#f7faf7] app-light:to-[#edf4ee]">
            {/* Ambient Background Glows */}
            <div className="absolute -top-32 right-10 w-[550px] h-[550px] bg-theme-action/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-[450px] h-[450px] bg-theme-action/5 rounded-full blur-[130px] pointer-events-none" />

            {/* Background Engineering Grid Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'linear-gradient(var(--theme-grid, rgba(57,255,20,0.12)) 1px, transparent 1px), linear-gradient(90deg, var(--theme-grid, rgba(57,255,20,0.12)) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-theme-ink tracking-tight leading-[1.06] uppercase">
                    PrintHub 3D <br />
                    <span className="text-emerald-400 app-light:text-theme-accent font-black">
                      Thiết Kế Thước của bạn
                    </span>
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-theme-muted leading-relaxed max-w-2xl font-normal">
                  PrintHub 3D nhận đặt thước in 3D cá nhân hóa cho học sinh, sinh viên. Bạn chọn mẫu thước có sẵn rồi thêm tên, mã số sinh viên hoặc biểu tượng. Nhóm gửi mẫu xem trước, báo giá và hẹn ngày nhận để bạn xác nhận trước khi in.
                </p>

                {/* Hero CTA Buttons (Pixel Contract A) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/custom"
                    className="btn-precision px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-950/40 flex items-center gap-2.5 active:scale-95 group app-light:shadow-none"
                  >
                    <span>Tải Tệp 3D Báo Giá Ngay</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/catalog"
                    className="px-8 py-4 rounded-2xl bg-[#0a0c12] app-light:bg-white hover:bg-[#11141e] app-light:hover:bg-theme-soft text-slate-200 app-light:text-theme-copy font-bold text-sm border border-white/10 app-light:border-theme-line hover:border-theme-accent/40 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>Xem Danh Mục Thước</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero High-Precision Slicer Visualizer */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/15 app-light:border-theme-line shadow-lg shadow-emerald-950/40 bg-[#07090e] app-light:bg-white group app-light:shadow-none">
                  {/* Slicer Chrome Bar */}
                  <div className="h-9 w-full bg-gradient-to-b from-[#131724] to-[#0a0d16] border-b border-white/10 app-light:border-theme-line px-4 flex items-center justify-between app-light:from-[#edf4ee] app-light:to-white">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-theme-marker" />
                    </div>
                    <div className="px-3 py-1 rounded bg-[#040508]/80 app-light:bg-white/90 border border-white/5 app-light:border-theme-line text-[10px] font-mono text-theme-copy flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-theme-accent" />
                      <span>sensor_housing_bracket.step</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-theme-accent">ONLINE</span>
                  </div>

                  {/* 3D Slicing Visual Area */}
                  <div className="relative p-5 h-72 flex flex-col justify-between overflow-hidden bg-radial from-[#0a180f] to-[#05070c] app-light:from-[#e3f2e6] app-light:to-[#f5faf5]">
                    {/* Isometric Grid Lines */}
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage: 'radial-gradient(circle, var(--theme-marker, #39FF14) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />

                    {/* Centered Wireframe Part Simulation */}
                    <div className="relative z-10 my-auto flex justify-center">
                      <div className="w-36 h-36 border border-theme-accent/40 rounded-2xl flex items-center justify-center relative shadow-md shadow-emerald-950/50 bg-[#040508]/60 app-light:bg-white/80 backdrop-blur-sm app-light:shadow-none">
                        <svg className="w-20 h-20 text-theme-accent" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="currentColor" fillOpacity={0.06} />
                          <line x1="50" y1="15" x2="50" y2="55" />
                          <line x1="50" y1="55" x2="85" y2="75" />
                          <line x1="50" y1="55" x2="15" y2="75" />
                          <circle cx="50" cy="55" r="8" fill="currentColor" />
                        </svg>
                        {/* Laser Scan Line */}
                        <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-theme-accent to-transparent ring-2 ring-theme-accent/40 animate-pulse" style={{ top: '65%' }} />
                      </div>
                    </div>

                    {/* Caliper HUD Overlay */}
                    <div className="relative z-10 flex justify-between items-end text-[11px] font-mono bg-[#040508]/85 app-light:bg-white/90 p-3 rounded-xl border border-white/10 app-light:border-theme-line backdrop-blur-md">
                      <div>
                        <div className="text-theme-muted text-[10px]">BOUNDING BOX</div>
                        <div className="font-bold text-theme-ink">142 x 85 x 64 mm</div>
                      </div>
                      <div>
                        <div className="text-theme-muted text-[10px]">MATERIAL</div>
                        <div className="font-bold text-theme-accent">PA12 Carbon-Fiber</div>
                      </div>
                      <div className="text-right">
                        <div className="text-theme-muted text-[10px]">LAYER PROGRESS</div>
                        <div className="font-bold text-theme-accent">705 / 840 (84%)</div>
                      </div>
                    </div>
                  </div>

                  {/* Slicer Bottom Status Strip */}
                  <div className="p-3 bg-[#0a0d14] app-light:bg-[#f5f8f5] border-t border-white/10 app-light:border-theme-line flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-theme-marker animate-ping" />
                      <span className="text-theme-copy">EXTRUDER: 245°C · BED: 110°C</span>
                    </div>
                    <span className="text-theme-accent font-bold">EST. $26.62</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* HERO BOTTOM FEATURE BAR */}
            {/* ========================================================================= */}
            <div className="mt-12 pt-8 border-t border-white/10 app-light:border-theme-line grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0a0c12]/80 app-light:bg-white border border-white/[0.06] app-light:border-theme-line hover:border-theme-accent/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-theme-marker shrink-0 shadow-md shadow-emerald-950/50 app-light:shadow-none" />
                <div>
                  <h2 className="text-sm font-extrabold text-theme-ink">Tung Ra Chuẩn Xác 0.05mm</h2>
                  <p className="text-xs text-theme-muted mt-0.5 leading-snug">
                    May đo kỹ thuật chuẩn cơ khí, vạch khắc dập chìm chống phai suốt quá trình học.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0a0c12]/80 app-light:bg-white border border-white/[0.06] app-light:border-theme-line hover:border-theme-accent/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-theme-marker shrink-0 shadow-md shadow-emerald-950/50 app-light:shadow-none" />
                <div>
                  <h2 className="text-sm font-extrabold text-theme-ink">Tùy Chọn Không Giới Hạn</h2>
                  <p className="text-xs text-theme-muted mt-0.5 leading-snug">
                    Đa dạng vật liệu PLA+, PETG, Resin 8K, khắc laser họ tên &amp; MSSV và các biểu tượng icon.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0a0c12]/80 app-light:bg-white border border-white/[0.06] app-light:border-theme-line hover:border-theme-accent/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-theme-marker shrink-0 shadow-md shadow-emerald-950/50 app-light:shadow-none" />
                <div>
                  <h2 className="text-sm font-extrabold text-theme-ink">Giao Hàng trong khu vực làng đại học TP.HCM</h2>
                  <p className="text-xs text-theme-muted mt-0.5 leading-snug">
                    Giao tận tay học sinh và sinh viên.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0a0c12]/80 app-light:bg-white border border-white/[0.06] app-light:border-theme-line hover:border-theme-accent/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-theme-marker shrink-0 shadow-md shadow-emerald-950/50 app-light:shadow-none" />
                <div>
                  <h2 className="text-sm font-extrabold text-theme-ink">Gửi tệp để báo giá</h2>
                  <p className="text-xs text-theme-muted mt-0.5 leading-snug">
                    Tải lên tệp CAD/STL và mô tả yêu cầu in. PrintHub sẽ liên hệ để xác nhận yêu cầu và báo giá.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: DISCOVER OUR SERVICES (Matches Reference Image 2) */}
        {/* ========================================================================= */}
        <section id="services" aria-labelledby="ruler-intro-title" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
          <div data-scroll-reveal className="grid items-center gap-6 rounded-3xl border border-white/10 app-light:border-theme-line bg-[#0c1017] app-light:bg-white p-6 sm:gap-8 sm:p-10 md:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:gap-12 lg:p-12">
            <div className="min-w-0 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-theme-accent">
                PrintHub 3D
              </p>
              <h2 id="ruler-intro-title" className="text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.1] tracking-[-0.035em] text-theme-ink">
                Thước in 3D<br />
                mang tên bạn
              </h2>
              <p className="max-w-[38ch] text-sm leading-relaxed text-theme-copy sm:text-base">
                Thêm tên, mã số sinh viên hoặc biểu tượng. Xem và xác nhận mẫu trước khi in.
              </p>
              <Link
                to="/catalog"
                className="inline-flex min-h-11 items-center gap-3 rounded-full bg-theme-action px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-theme-action-hover focus-visible:outline-offset-4"
              >
                Xem mẫu thước
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <figure className="min-w-0">
              <img
                src="/images/personalized-ruler.jpg"
                alt="Thước in 3D màu xanh có tên Cánh Cụt và các biểu tượng cá nhân hóa"
                width={950}
                height={521}
                loading="lazy"
                decoding="async"
                className="block aspect-[5/3] w-full rounded-xl object-cover md:aspect-[5/4]"
              />
              <figcaption className="mt-2 text-xs text-theme-copy">Mẫu thước đã in</figcaption>
            </figure>
          </div>

          {/* Detailed Service Grid (Preserves All Existing Landing Features) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Service 1: Ruler Catalog */}
            <div className="p-6 rounded-2xl bg-[#0a0c12] app-light:bg-white border border-white/10 app-light:border-theme-line hover:border-theme-accent/50 transition group flex flex-col justify-between space-y-4 shadow-xl app-light:shadow-none">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-theme-action/10 border border-theme-accent/30 flex items-center justify-center text-theme-accent group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-theme-ink group-hover:text-theme-accent transition">
                  Thước Kỹ Thuật PLA+/PETG
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Các mẫu thước thẳng 20-30cm, thước đo góc chữ T, eke, stencil vẽ mạch in dập chìm chống phai mờ suốt kỳ học.
                </p>
              </div>
              <Link
                to="/catalog"
                className="text-xs font-bold text-theme-accent inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Xem danh mục thước</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 2: Custom 3D Order */}
            <div className="p-6 rounded-2xl bg-[#0a0c12] app-light:bg-white border border-white/10 app-light:border-theme-line hover:border-theme-accent/50 transition group flex flex-col justify-between space-y-4 shadow-xl app-light:shadow-none">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-theme-action/10 border border-theme-accent/30 flex items-center justify-center text-theme-accent group-hover:scale-110 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-theme-ink group-hover:text-theme-accent transition">
                  Báo Giá File 3D Tùy Chỉnh
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Tải lên tệp .STL/.STEP cá nhân, tùy chọn độ mịn, mật độ infill và nhận báo giá trực tiếp từ xưởng trong 15 phút.
                </p>
              </div>
              <Link
                to="/custom"
                className="text-xs font-bold text-theme-accent inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Tải tệp 3D báo giá</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 3: Bulk Order */}
            <div className="p-6 rounded-2xl bg-[#0a0c12] app-light:bg-white border border-white/10 app-light:border-theme-line hover:border-purple-400/50 transition group flex flex-col justify-between space-y-4 shadow-xl app-light:shadow-none">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 app-light:text-purple-700 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-theme-ink group-hover:text-purple-400 app-light:group-hover:text-purple-700 transition">
                  Đặt In Đơn Hàng Lớn <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 app-light:text-amber-800 border border-amber-500/30">Sắp ra mắt</span>
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Hỗ trợ câu lạc bộ, khoa viện đặt thước in hàng loạt với chiết khấu lên đến 35% và ưu tiên tiến độ dàn máy in.
                </p>
              </div>
              <Link
                to="/bulk-order"
                className="text-xs font-bold text-purple-400 app-light:text-purple-700 inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Xem chính sách đặt sỉ (Sắp ra mắt)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 4: 3D Interactive Ruler */}
            <div className="p-6 rounded-2xl bg-[#0a0c12] app-light:bg-white border border-white/10 app-light:border-theme-line hover:border-blue-400/50 transition group flex flex-col justify-between space-y-4 shadow-xl app-light:shadow-none">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 app-light:text-blue-700 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-theme-ink group-hover:text-blue-400 app-light:group-hover:text-blue-700 transition">
                  Công Cụ Thước Đo 3D
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Mô phỏng thước 3D xoay 360 độ trực tiếp trên trình duyệt, kiểm tra vạch đo và tỉ lệ trước khi bấm đặt in.
                </p>
              </div>
              <Link
                to="/custom"
                className="text-xs font-bold text-blue-400 app-light:text-blue-700 inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Mở Studio Tùy Biến Thước</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: WHY CHOOSE PRINTHUB3D? */}
        {/* ========================================================================= */}
        <section id="why-choose" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
          {/* Top Badge */}
          <div className="flex items-center">
            <span className="px-5 py-2 rounded-full bg-white text-slate-950 font-extrabold text-xs tracking-wide shadow-lg uppercase app-light:shadow-none">
              Tại Sao Chọn PrintHub 3D?
            </span>
          </div>

          {/* 2-Column Split Section */}
          <div data-scroll-reveal className="rounded-3xl bg-gradient-to-br from-[#0e121d] via-[#090b12] to-[#040508] border border-white/10 app-light:border-theme-line p-6 sm:p-10 lg:p-14 shadow-lg overflow-hidden app-light:shadow-none app-light:from-white app-light:via-[#f8faf8] app-light:to-[#eff5f0]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: 4 Feature Pillars (Full Tiếng Việt) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Pillar 1: Kỹ Thuật Chế Tác Tiên Tiến */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 app-light:bg-theme-soft border border-white/10 app-light:border-theme-line flex items-center justify-center text-theme-copy">
                    <Cpu className="w-6 h-6 text-blue-400 app-light:text-blue-700" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-ink">
                    Thước in 3D cho học tập
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed font-normal">
                    Thước dành cho học sinh, sinh viên để kẻ dòng, vẽ hình và đo độ dài khi làm bài tập.
                  </p>
                </div>

                {/* Pillar 2: Chất Lượng Hoàn Thiện Vượt Trội */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 app-light:bg-theme-soft border border-white/10 app-light:border-theme-line flex items-center justify-center text-theme-copy">
                    <Box className="w-6 h-6 text-theme-accent" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-ink">
                    Kiểm tra trước khi giao
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed font-normal">
                    Nhóm đối chiếu thước với mẫu bạn đã duyệt và kiểm tra vạch chia, bề mặt trước khi giao.
                  </p>
                </div>

                {/* Pillar 3: Tư Vấn & Cá Nhân Hóa Tận Tâm */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 app-light:bg-theme-soft border border-white/10 app-light:border-theme-line flex items-center justify-center text-theme-copy">
                    <Sparkles className="w-6 h-6 text-theme-accent" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-ink">
                    Tư Vấn &amp; Cá nhân hóa theo ý bạn
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed font-normal">
                    Đồng hành cùng đội ngũ kỹ thuật để tạo nên sản phẩm chuẩn xác theo đúng ý tưởng của bạn.
                  </p>
                </div>

                {/* Pillar 4: Hỗ Trợ Chuyên Môn Tận Tình */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 app-light:bg-theme-soft border border-white/10 app-light:border-theme-line flex items-center justify-center text-theme-copy">
                    <Award className="w-6 h-6 text-purple-400 app-light:text-purple-700" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-ink">
                    Hỗ trợ đặt và nhận thước
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed font-normal">
                    Nhóm hướng dẫn cách đặt, xác nhận giá và hẹn ngày nhận. Nếu thước có lỗi khi nhận, bạn có thể liên hệ PrintHub để được hỗ trợ.</p>
                </div>
              </div>

              {/* Right Column: 3D Robot Figure Print Render */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/15 app-light:border-theme-line bg-[#090b12] app-light:bg-white shadow-lg group app-light:shadow-none">
                  <img
                    src="/images/printer_robot_toy.jpg"
                    alt="3D Extruder Nozzle Printing Model"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040508] via-transparent to-transparent opacity-60" />

                  {/* Floating Micro-Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/80 app-light:bg-white/95 backdrop-blur-md border border-white/10 app-light:border-theme-line flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-theme-marker animate-ping" />
                      <span className="font-bold text-theme-ink text-xs">Độ Phân Giải Siêu Mịn</span>
                    </div>
                    <span className="text-[11px] font-mono text-theme-accent font-bold">
                      0.05mm Layer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeaturedReviews />

        {/* ========================================================================= */}
        {/* SECTION 4: GUARANTEE & QUALITY COMMITMENT */}
        {/* ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-scroll-reveal className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-theme-action/10 via-[#0a0d16] to-[#040508] border border-theme-accent/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg app-light:shadow-none app-light:from-theme-soft app-light:via-[#f2f8f2] app-light:to-white">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-theme-action/15 border border-theme-accent/40 flex items-center justify-center text-theme-accent shrink-0 shadow-lg shadow-[#39FF14]/20 app-light:shadow-none">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-theme-ink">
                  Cam Kết Chất Lượng &amp; Bảo Hành 1-Đổi-1 Suốt 1 Học Kỳ
                </h2>
                <p className="text-xs sm:text-sm text-theme-copy leading-relaxed max-w-2xl font-normal">
                  Tất cả sản phẩm thước in 3D được áp dụng chính sách bảo hành 1-đổi-1 nếu gãy nứt hoặc phai mờ vạch số.
                </p>
              </div>
            </div>

            <Link
              to="/warranty"
              className="btn-precision px-8 py-3.5 rounded-xl text-xs whitespace-nowrap shadow-xl shrink-0 app-light:shadow-none"
            >
              <span>Gửi yêu cầu bảo hành</span>
            </Link>
          </div>
        </section>
      </main>

      {/* 3. SITE FOOTER (Giữ Nguyên Như Yêu Cầu) */}
      <Footer />
    </div>
  );
}

