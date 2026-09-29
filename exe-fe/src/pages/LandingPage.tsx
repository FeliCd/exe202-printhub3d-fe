import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('cancel') || params.has('orderCode') || params.has('status')) {
      navigate('/payment-result' + location.search, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#090a0d] text-white flex flex-col font-sans selection:bg-[#39FF14] selection:text-black">
      {/* 1. MARKETING NAVBAR (Ref Header Pill Layout) */}
      <LandingNavbar />

      {/* 2. MAIN LANDING CONTENT */}
      <main className="flex-1 w-full flex flex-col space-y-20 pb-20">
        {/* ========================================================================= */}
        {/* HERO SECTION (Matches Reference Image 1) */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Main Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#14161d] via-[#0f1015] to-[#0a0b0e] border border-white/10 p-6 sm:p-10 lg:p-14 overflow-hidden shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-32 right-10 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
                    Bring Your 3D <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                      Visions to Life
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl font-medium text-slate-300">
                    Custom 3D Styles Just for You
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-normal">
                  Hệ thống kết nối xưởng in 3D công nghiệp FDM / SLA phủ sóng toàn quốc. Nhận in 3D theo yêu cầu, chế tác thước kỹ thuật chuẩn xác 0.1mm, khắc tên/MSSV laser miễn phí và cam kết bảo hành gãy 1-đổi-1 suốt 1 học kỳ.
                </p>

                {/* Hero CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/custom"
                    className="px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2.5 active:scale-95 group"
                  >
                    <span>Design your style</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/catalog"
                    className="px-8 py-4 rounded-full bg-[#181a22] hover:bg-[#222530] text-slate-200 font-bold text-sm border border-slate-700/70 hover:border-slate-500 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>Explore Our Styles</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero 3D Printer Showcase (Image 1 Visual) */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-blue-950/40 bg-[#0d0e14] group">
                  <img
                    src="/images/hero_3d_printer.jpg"
                    alt="Industrial Enclosed 3D Printer Printing High Precision Model"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Lighting Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-transparent to-transparent opacity-60" />

                  {/* Floating Micro-Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-ping" />
                      <div>
                        <p className="font-bold text-white text-xs">Máy FDM Công Nghiệp X1</p>
                        <p className="text-[10px] text-slate-400">Độ phân giải 0.12mm • Sợi PLA+ Pro</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60">
                      84% In
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* HERO BOTTOM FEATURE BAR (Matches Reference Image 1 Bottom Dock) */}
            {/* ========================================================================= */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#12141c]/70 border border-white/[0.06] hover:border-emerald-500/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-[#39FF14] shrink-0 shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Tailored Designs</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    May đo chuẩn xác 0.1mm, vạch khắc kỹ thuật dập chìm chống phai.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#12141c]/70 border border-white/[0.06] hover:border-emerald-500/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-[#39FF14] shrink-0 shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Unlimited Customization</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    Tùy chọn PLA+/PETG, khắc laser họ tên &amp; MSSV đồ án miễn phí.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#12141c]/70 border border-white/[0.06] hover:border-emerald-500/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-[#39FF14] shrink-0 shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Available Worldwide</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    Giao tận tay sinh viên tại hơn 20+ trường đại học toàn quốc.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#12141c]/70 border border-white/[0.06] hover:border-emerald-500/40 transition">
                <div className="w-1.5 h-10 rounded-full bg-[#39FF14] shrink-0 shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Expert 3D Designers</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    Kiểm duyệt lỗi mesh tệp CAD/STL và tư vấn in tối ưu giá sinh viên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: DISCOVER OUR SERVICES (Matches Reference Image 2) */}
        {/* ========================================================================= */}
        <section id="services" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
          {/* Top Badge (White Pill Tab in Reference) */}
          <div className="flex items-center">
            <span className="px-5 py-2 rounded-full bg-white text-slate-950 font-extrabold text-xs tracking-wide shadow-lg uppercase">
              Discover Our Services
            </span>
          </div>

          {/* Statement Hero Card with Delta Printer Background (Ref Image 2) */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0d0e14] shadow-2xl p-8 sm:p-12 lg:p-16 min-h-[460px] flex flex-col justify-center">
            {/* Background Image of 3D Delta Printer */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/delta_printer_dark.jpg"
                alt="Precision Delta 3D Printer Background"
                className="w-full h-full object-cover object-right opacity-35 filter brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090a0d] via-[#090a0d]/90 to-transparent" />
            </div>

            {/* Content Foreground */}
            <div className="relative z-10 max-w-2xl space-y-6">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                At Printhub3D, we specialize in turning your ideas into stunning 3D designs. From custom models to unique artworks, we cater to all your creative needs.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Tại PrintHub 3D, chúng tôi mang công nghệ in 3D công nghiệp đến gần hơn với sinh viên kỹ thuật và kiến trúc. Dù là mô hình chi tiết máy, đồ án tốt nghiệp hay bộ thước kỹ thuật vạch chia chính xác, bạn đều nhận được sự chăm chút tuyệt đối.
              </p>

              <div>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition active:scale-95"
                >
                  <span>Find Out More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Service Grid (Preserves All Existing Landing Features) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Service 1: Ruler Catalog */}
            <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 hover:border-emerald-500/50 transition group flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-[#22c55e]/30 flex items-center justify-center text-[#39FF14] group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#39FF14] transition">
                  Thước Kỹ Thuật PLA+/PETG
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Các mẫu thước thẳng 20-30cm, thước đo góc chữ T, eke, stencil vẽ mạch in dập chìm chống phai mờ suốt kỳ học.
                </p>
              </div>
              <Link
                to="/catalog"
                className="text-xs font-bold text-[#39FF14] inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Xem danh mục thước</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 2: Custom 3D Order */}
            <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 hover:border-cyan-400/50 transition group flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                  Báo Giá File 3D Tùy Chỉnh
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tải lên tệp .STL/.STEP cá nhân, tùy chọn độ mịn, mật độ infill và nhận báo giá trực tiếp từ xưởng trong 15 phút.
                </p>
              </div>
              <Link
                to="/custom"
                className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Tải tệp 3D báo giá</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 3: Bulk Order */}
            <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 hover:border-purple-400/50 transition group flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
                  Đặt In Đơn Hàng Lớn
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hỗ trợ câu lạc bộ, khoa viện đặt thước in hàng loạt với chiết khấu lên đến 35% và ưu tiên tiến độ dàn máy in.
                </p>
              </div>
              <Link
                to="/bulk-order"
                className="text-xs font-bold text-purple-400 inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Đặt hàng số lượng lớn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 4: 3D Interactive Ruler */}
            <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 hover:border-blue-400/50 transition group flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                  Công Cụ Thước Đo 3D
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mô phỏng thước 3D xoay 360 độ trực tiếp trên trình duyệt, kiểm tra vạch đo và tỉ lệ trước khi bấm đặt in.
                </p>
              </div>
              <Link
                to="/ruler-3d"
                className="text-xs font-bold text-blue-400 inline-flex items-center gap-1.5 hover:underline pt-2"
              >
                <span>Mở công cụ 3D Ruler</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: WHY CHOOSE PRINTHUB3D? (Matches Reference Image 3) */}
        {/* ========================================================================= */}
        <section id="why-choose" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
          {/* Top Badge (White Pill Tab in Reference) */}
          <div className="flex items-center">
            <span className="px-5 py-2 rounded-full bg-white text-slate-950 font-extrabold text-xs tracking-wide shadow-lg uppercase">
              Tại Sao Chọn PrintHub 3D?
            </span>
          </div>

          {/* 2-Column Split Section Matching Reference Image 3 */}
          <div className="rounded-3xl bg-gradient-to-br from-[#121522] via-[#0f111a] to-[#0a0b10] border border-white/10 p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: 4 Feature Pillars (Full Tiếng Việt) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Pillar 1: Kỹ Thuật Chế Tác Tiên Tiến */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Cpu className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Kỹ Thuật Chế Tác Tiên Tiến
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Quy trình thiết kế và xử lý cắt lớp hiện đại đảm bảo từng sản phẩm có độ tinh xảo vượt trội. Vạch chia kỹ thuật dập chìm chuẩn xác 0.1mm, đáp ứng hoàn hảo tiêu chuẩn đồ án cơ khí và kiến trúc.
                  </p>
                </div>

                {/* Pillar 2: Chất Lượng Hoàn Thiện Vượt Trội */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Box className="w-6 h-6 text-[#39FF14]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Chất Lượng Hoàn Thiện Vượt Trội
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Mọi sản phẩm đều được chế tác từ sợi nhựa nguyên sinh PLA+ và PETG công nghiệp cao cấp, đảm bảo độ bền bỉ, dẻo dai và khả năng chịu lực tối ưu trong môi trường xưởng máy.
                  </p>
                </div>

                {/* Pillar 3: Tư Vấn & Cá Nhân Hóa Tận Tâm */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Tư Vấn &amp; Cá Nhân Hóa Tận Tâm
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Đồng hành cùng đội ngũ kỹ thuật để tạo nên sản phẩm chuẩn xác theo đúng ý tưởng của bạn. Hỗ trợ khắc laser họ tên và mã số sinh viên (MSSV) hoàn toàn miễn phí, đánh dấu chủ quyền đồ án.
                  </p>
                </div>

                {/* Pillar 4: Hỗ Trợ Chuyên Môn Tận Tình */}
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Hỗ Trợ Chuyên Môn Tận Tình
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Đội ngũ kỹ sư giàu kinh nghiệm sẵn sàng hỗ trợ kiểm tra lỗi tệp CAD/mesh, tư vấn tối ưu hướng in và mật độ infill từ bản vẽ thiết kế đến sản phẩm hoàn thiện với chi phí tiết kiệm nhất.
                  </p>
                </div>
              </div>

              {/* Right Column: 3D Robot Figure Print Render (Ref Image 3 Visual) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/15 bg-[#090b12] shadow-2xl group">
                  <img
                    src="/images/printer_robot_toy.jpg"
                    alt="3D Extruder Nozzle Printing Green Robot Model"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-transparent to-transparent opacity-40" />

                  {/* Floating Micro-Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      <span className="font-bold text-white text-xs">Độ Phân Giải Siêu Mịn</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#39FF14] font-bold">
                      0.12mm Layer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: GUARANTEE & QUALITY COMMITMENT */}
        {/* ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#11141d] to-[#0a0b10] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/40 flex items-center justify-center text-[#39FF14] shrink-0 shadow-lg shadow-emerald-900/30">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Cam Kết Chất Lượng &amp; Bảo Hành 1-Đổi-1 Suốt 1 Học Kỳ
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                  Tất cả sản phẩm thước in 3D và mô hình kỹ thuật đều được áp dụng chính sách bảo hành 1-đổi-1 nếu gãy nứt hoặc phai mờ vạch số.
                </p>
              </div>
            </div>

            <Link
              to="/warranty"
              className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs whitespace-nowrap transition shadow-xl shadow-emerald-500/25 active:scale-95 shrink-0"
            >
              Gửi yêu cầu bảo hành
            </Link>
          </div>
        </section>
      </main>

      {/* 3. SITE FOOTER (Giữ Nguyên Như Yêu Cầu) */}
      <Footer />
    </div>
  );
}

