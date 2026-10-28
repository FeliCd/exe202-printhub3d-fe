import { CustomRequestForm } from '../features/custom/CustomRequests';
import { PageHeader } from '../components/DataUI';
import { Layers, Sparkles, ShieldCheck, Tag } from 'lucide-react';

export default function BulkOrderPage() {
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
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

        <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#39FF14]/50 flex items-center gap-3 shadow-[0_0_25px_rgba(57,255,20,0.15)] group relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#39FF14]/20 border-b border-l border-[#39FF14]/40 text-[9px] font-bold text-[#39FF14] uppercase">
            POPULAR
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/60 flex items-center justify-center text-[#39FF14] font-black shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#39FF14] font-semibold font-sans">Từ 50 - 99 sản phẩm</p>
            <p className="text-base font-black text-white">Giảm 25% + Khắc laser</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#ff9100]/40 flex items-center gap-3 shadow-[0_0_20px_rgba(255,145,0,0.1)] group">
          <div className="w-10 h-10 rounded-xl bg-[#ff9100]/15 border border-[#ff9100]/40 flex items-center justify-center text-[#ff9100] font-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Từ 100+ sản phẩm</p>
            <p className="text-base font-black text-white group-hover:text-[#ff9100] transition">Giảm 35% + Free Ship</p>
          </div>
        </div>
      </div>

      <CustomRequestForm bulk />
    </div>
  );
}
