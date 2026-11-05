import { Link } from 'react-router-dom';
import { PageHeader } from '../components/DataUI';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Compass,
  Printer,
  ChevronRight,
} from 'lucide-react';

export default function BulkOrderPage() {
  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="Đặt In 3D Số Lượng Lớn (Bulk Order)"
        description="Dịch vụ gia công in FDM & Resin số lượng lớn dành cho lớp học, CLB kỹ thuật, khoa viện hoặc đồ án tốt nghiệp với chiết khấu bậc thang hấp dẫn."
        icon={Layers}
      />

      {/* Discount Tiers Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/10 flex items-center gap-3 shadow-md hover:border-[#39FF14]/40 transition group">
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] font-black shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Từ 10 - 49 sản phẩm</p>
            <p className="text-base font-black text-white group-hover:text-[#39FF14] transition">Giảm 15% trọn gói</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#39FF14]/50 flex items-center gap-3 shadow-md shadow-emerald-950/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#39FF14]/20 border-b border-l border-[#39FF14]/40 text-[9px] font-bold text-[#39FF14] uppercase">
            POPULAR
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/60 flex items-center justify-center text-[#39FF14] font-black shrink-0 shadow-md shadow-emerald-950/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#39FF14] font-semibold font-sans">Từ 50 - 99 sản phẩm</p>
            <p className="text-base font-black text-white">Giảm 25% + Khắc laser</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#ff9100]/40 flex items-center gap-3 shadow-md shadow-amber-950/50 group">
          <div className="w-10 h-10 rounded-xl bg-[#ff9100]/15 border border-[#ff9100]/40 flex items-center justify-center text-[#ff9100] font-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Từ 100+ sản phẩm</p>
            <p className="text-base font-black text-white group-hover:text-[#ff9100] transition">Giảm 35% + Free Ship</p>
          </div>
        </div>
      </div>

      {/* Under Development Hero Card */}
      <section className="relative rounded-3xl bg-[#0a0c12] border border-[#1e2433] p-8 sm:p-10 shadow-2xl overflow-hidden space-y-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>TÍNH NĂNG ĐANG TRONG GIAI ĐOẠN PHÁT TRIỂN</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cổng Đặt In Đơn Hàng Lớn Trực Tuyến Sắp Ra Mắt
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Hệ thống tự động hóa xếp phôi in 3D (3D nesting) và phân bổ tải công suất xưởng theo lô hàng loạt đang được đội ngũ kỹ thuật PrintHub 3D hoàn thiện và kiểm thử nghiêm ngặt.
          </p>
        </div>

        {/* Manual Inquiry Box for Urgent Orders */}
        <div className="relative z-10 rounded-2xl bg-[#040508] border border-white/10 p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Cần đặt số lượng lớn ngay cho CLB, Lớp học hoặc Đồ án?
              </h3>
              <p className="text-xs text-slate-400">
                Kỹ sư PrintHub tiếp nhận file 3D và phản hồi báo giá sỉ thủ công trong vòng 2 giờ làm việc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Email tiếp nhận file CAD/STL:</span>
              </div>
              <a
                href="mailto:support@printhub3d.id.vn"
                className="font-mono text-sm font-bold text-white hover:text-[#39FF14] transition block"
              >
                support@printhub3d.id.vn
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>Hotline / Zalo tư vấn kỹ thuật:</span>
              </div>
              <a
                href="tel:0981234567"
                className="font-mono text-sm font-bold text-white hover:text-[#00e5ff] transition block"
              >
                098.123.4567 (8:00 - 21:00)
              </a>
            </div>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/custom"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <Printer className="w-4 h-4" />
            <span>Gửi Yêu Cầu In Đơn Lẻ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/catalog"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Xem Danh Mục Thước Có Sẵn</span>
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-400 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Về Bảng Điều Khiển</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
