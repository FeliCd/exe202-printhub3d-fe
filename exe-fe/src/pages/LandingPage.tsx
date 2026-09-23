import { Link } from 'react-router-dom';
import { Box, Printer, ShieldCheck, Zap, ArrowRight, Layers, Sparkles, CheckCircle2, Award } from 'lucide-react';
import LandingNavbar from '../layouts/LandingNavbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#0a0a0c] text-white flex flex-col font-sans selection:bg-[#39FF14] selection:text-black">
      {/* 1. MARKETING NAVBAR */}
      <LandingNavbar />

      {/* 2. MAIN LANDING CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#18191d] via-[#111215] to-[#0a0a0c] border border-border p-8 lg:p-14 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-[#39FF14] text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              Nền Tảng In 3D &amp; Thiết Bị Kỹ Thuật Dành Cho Sinh Viên
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Chế Tác Mô Hình 3D &amp; Thước Kỹ Thuật{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-emerald-400 to-teal-300">
                Chuẩn Xác 0.1mm
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Hệ thống kết nối xưởng in 3D công nghiệp FDM / SLA phủ sóng toàn quốc. Nhận in 3D theo yêu cầu, khắc tên/MSSV laser miễn phí, cam kết bảo hành gãy 1-đổi-1 suốt 1 học kỳ.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/catalog"
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 active:scale-95"
              >
                Khám Phá Danh Mục Thước <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/custom"
                className="px-6 py-3.5 rounded-xl bg-surface hover:bg-[#272930] text-slate-200 font-bold text-sm border border-border transition flex items-center gap-2 active:scale-95"
              >
                <Printer className="w-4 h-4 text-[#39FF14]" /> Gửi Tệp In 3D Báo Giá
              </Link>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/80">
            <div className="p-4 rounded-xl bg-surface-inset/80 border border-border">
              <p className="text-2xl sm:text-3xl font-black text-white">15,000+</p>
              <p className="text-xs text-text-muted mt-1">Đơn thước in thành công</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-inset/80 border border-border">
              <p className="text-2xl sm:text-3xl font-black text-[#39FF14]">0.12mm</p>
              <p className="text-xs text-text-muted mt-1">Độ mịn lớp in FDM</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-inset/80 border border-border">
              <p className="text-2xl sm:text-3xl font-black text-white">48+ Máy</p>
              <p className="text-xs text-text-muted mt-1">Công suất máy in SLA/FDM</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-inset/80 border border-border">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">100%</p>
              <p className="text-xs text-text-muted mt-1">Bảo hành gãy 1 học kỳ</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SERVICES GRID */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#39FF14]">DỊCH VỤ NỔI BẬT</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Giải Pháp In 3D Toàn Diện</h2>
            <p className="text-xs text-text-muted">Được thiết kế tối ưu cho sinh viên kỹ thuật, kiến trúc và câu lạc bộ nghiên cứu khoa học</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#39FF14]/50 transition group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-[#22c55e]/30 flex items-center justify-center text-[#39FF14]">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#39FF14] transition">Thước Kỹ Thuật PLA+/PETG</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Các mẫu thước thẳng 20-30cm, thước đo góc chữ T, eke, stencil vẽ mạch in công nghiệp với vạch chia dập chìm chống phai mờ.
              </p>
              <Link to="/catalog" className="text-xs font-bold text-[#39FF14] inline-flex items-center gap-1 hover:underline">
                Xem danh mục <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-cyan-400/50 transition group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">Báo Giá File 3D Tùy Chỉnh</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Tải lên tệp .STL/.STEP cá nhân, tùy chọn độ mịn, mật độ infill và nhận báo giá trực tiếp từ xưởng sản xuất trong 15 phút.
              </p>
              <Link to="/custom" className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1 hover:underline">
                Tải tệp 3D ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-400/50 transition group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">Đặt In Đơn Hàng Lớn</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Hỗ trợ câu lạc bộ, khoa ngành đặt thước in hàng loạt với chiết khấu lên đến 35% và ưu tiên tiến độ máy in nhanh chóng.
              </p>
              <Link to="/bulk-order" className="text-xs font-bold text-purple-400 inline-flex items-center gap-1 hover:underline">
                Đặt hàng số lượng lớn <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHY CHOOSE PRINTHUB 3D */}
        {/* ========================================================================= */}
        <section className="p-8 sm:p-10 rounded-3xl bg-surface-inset border border-border space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">Tại Sao Sinh Viên Chọn PrintHub 3D?</h2>
            <p className="text-xs text-text-muted">Được tin dùng tại hơn 20 trường đại học khối kỹ thuật và công nghệ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#39FF14] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Độ chính xác chuẩn xác 0.1mm</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Vạch chia tỉ lệ được hiệu chỉnh quang học, đạt chuẩn vẽ kỹ thuật cơ khí &amp; kiến trúc.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khắc Laser tên &amp; MSSV miễn phí</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Đánh dấu chủ quyền thước vẽ, không lo bị nhầm lẫn trong phòng thí nghiệm hoặc xưởng máy.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bảo hành 1-đổi-1 suốt 1 học kỳ</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Gãy hoặc nứt thước khi làm đồ án? Chỉ cần gửi ảnh xác nhận là có ngay thước mới gửi về KTX.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* GUARANTEE SECTION */}
        {/* ========================================================================= */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-surface to-surface-inset border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-[#22c55e]/40 flex items-center justify-center text-[#39FF14] shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">Cam Kết Chất Lượng &amp; Bảo Hành 1 Học Kỳ</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl">
                Tất cả sản phẩm thước in 3D đều được bảo hành 1 đổi 1 nếu gãy hỏng hoặc phai số vạch chia trong suốt kỳ học của sinh viên.
              </p>
            </div>
          </div>
          <Link
            to="/warranty"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs whitespace-nowrap transition shadow-md shadow-emerald-500/20 active:scale-95"
          >
            Gửi yêu cầu bảo hành
          </Link>
        </section>
      </main>

      {/* 3. SITE FOOTER */}
      <Footer />
    </div>
  );
}
