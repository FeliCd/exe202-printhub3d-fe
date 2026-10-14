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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border/80 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Từ 10 - 49 sản phẩm</p>
            <p className="text-base font-black text-white">Giảm 15% trọn gói</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-primary/40 flex items-center gap-3 shadow-md shadow-primary/5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-black shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary font-semibold">Từ 50 - 99 sản phẩm</p>
            <p className="text-base font-black text-white">Giảm 25% + Khắc tên</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Từ 100+ sản phẩm</p>
            <p className="text-base font-black text-white">Giảm 35% + Free Ship</p>
          </div>
        </div>
      </div>

      <CustomRequestForm bulk />
    </div>
  );
}
