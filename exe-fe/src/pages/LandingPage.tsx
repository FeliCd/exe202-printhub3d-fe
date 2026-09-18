import { Link } from 'react-router-dom';
import { Box, Printer, ShieldCheck, Zap, ArrowRight, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12 pb-12 w-full">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#18191d] via-[#111215] to-[#0a0a0c] border border-border p-8 lg:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-[#22c55e] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            Nền tảng In 3D Công Nghiệp &amp; Thiết Bị Kỹ Thuật Sinh Viên
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Chế Tác Mô Hình 3D &amp; Thước Kỹ Thuật <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-emerald-400 to-teal-300">Chuẩn Xác 0.1mm</span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Hệ thống xưởng in 3D công nghiệp FDM/SLA phủ sóng toàn quốc. Nhận in 3D theo yêu cầu, khắc tên/MSSV laser miễn phí, cam kết bảo hành gãy 1-đổi-1 suốt 1 học kỳ.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/catalog"
              className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 active:scale-95"
            >
              Khám Phá Danh Mục Thước <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/custom"
              className="px-6 py-3.5 rounded-xl bg-surface-raised hover:bg-[#272930] text-slate-200 font-bold text-sm border border-border transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#22c55e]" /> Gửi Tệp In 3D Tùy Chỉnh
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-border/80">
          <div className="p-3.5 rounded-xl bg-surface-inset/80 border border-border">
            <p className="text-2xl font-black text-white">15,000+</p>
            <p className="text-sm text-text-muted">Đơn thước in thành công</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-inset/80 border border-border">
            <p className="text-2xl font-black text-[#22c55e]">0.12mm</p>
            <p className="text-sm text-text-muted">Độ mịn lớp in FDM</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-inset/80 border border-border">
            <p className="text-2xl font-black text-white">48+ Máy</p>
            <p className="text-sm text-text-muted">Công suất máy in SLA/FDM</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-inset/80 border border-border">
            <p className="text-2xl font-black text-cyan-400">100%</p>
            <p className="text-sm text-text-muted">Bảo hành 1 học kỳ</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">DỊCH VỤ NỔI BẬT</span>
          <h2 className="text-2xl font-black text-white">Giải Pháp In 3D Toàn Diện Cho Sinh Viên &amp; Kỹ Sư</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#22c55e]/50 transition group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#22c55e] transition">Thước Kỹ Thuật PLA+/PETG</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Các mẫu thước thẳng 20-30cm, thước đo góc chữ T, eke, stencil vẽ mạch in công nghiệp với vạch chia dập chìm chống sờn.
            </p>
            <Link to="/catalog" className="text-xs font-bold text-[#22c55e] inline-flex items-center gap-1 hover:underline">
              Xem sản phẩm <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#22c55e]/50 transition group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">Báo Giá File 3D Tùy Chỉnh</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Tải lên tệp .STL/.STEP cá nhân, tùy chọn độ mịn, màu nhựa và nhận báo giá trực tiếp từ xưởng sản xuất trong 15 phút.
            </p>
            <Link to="/custom" className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1 hover:underline">
              Tải tệp 3D ngay <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#22c55e]/50 transition group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">Đặt In Đơn Hàng Số Lượng Lớn</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Hỗ trợ câu lạc bộ, khoa ngành đặt thước in hàng loạt với chiết khấu lên đến 35% và ưu tiên tiến độ sản xuất hàng chờ.
            </p>
            <Link to="/bulk-order" className="text-xs font-bold text-purple-400 inline-flex items-center gap-1 hover:underline">
              Đặt hàng hàng loạt <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="p-6 rounded-2xl bg-surface border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Cam Kết Chất Lượng &amp; Đổi Trả Miễn Phí</h4>
            <p className="text-sm text-text-muted mt-1">
              Mọi sản phẩm thước in 3D đều được bảo hành 1 đổi 1 nếu gãy hỏng hoặc phai số vạch chia trong suốt kỳ học.
            </p>
          </div>
        </div>
        <Link
          to="/warranty"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs whitespace-nowrap transition"
        >
          Gửi Yêu Cầu Bảo Hành
        </Link>
      </section>
    </div>
  );
}
