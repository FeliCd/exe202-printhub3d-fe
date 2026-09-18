import { useEffect, useRef, useState } from 'react';
import { Settings, Save, ShieldCheck, Truck, DollarSign, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [shippingFee, setShippingFee] = useState(15000);
  const [commissionRate, setCommissionRate] = useState(5);
  const [bannerText, setBannerText] = useState('Ưu đãi sinh viên: Nhận voucher 15.000đ & Khắc tên/MSSV miễn phí!');
  const [warrantyMonths, setWarrantyMonths] = useState(4);
  const [saved, setSaved] = useState(false);

  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(successTimer.current), []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-purple-400">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Cấu Hình Hệ Thống Platform (System Settings)</h1>
        </div>
        <p className="text-sm text-text-muted">
          Cài đặt cước phí vận chuyển KTX, tỷ lệ chiết khấu sàn %, thông báo banner trang chủ và thời hạn bảo hành sinh viên.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-[#39FF14] text-xs font-bold flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Đã lưu toàn bộ cấu hình hệ thống thành công!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 p-6 rounded-2xl bg-surface border border-border text-xs">
        {/* Shipping Fee */}
        <div className="space-y-1.5">
          <label htmlFor="adminsettingspage-field-1" className="font-bold text-white flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-purple-400" /> Cước Phí Vận Chuyển Đồng Giá KTX (VNĐ)
          </label>
          <input id="adminsettingspage-field-1"
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(Number(e.target.value))}
            className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-purple-400 max-w-md"
          />
          <p className="text-sm text-text-muted">Miễn phí vận chuyển cho đơn hàng sỉ hoặc gói Hội Viên Pro.</p>
        </div>

        {/* Commission Rate */}
        <div className="space-y-1.5 pt-3 border-t border-border">
          <label htmlFor="adminsettingspage-field-2" className="font-bold text-white flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-400" /> Tỷ Lệ Chiết Khấu Sàn Platform (%)
          </label>
          <input id="adminsettingspage-field-2"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-purple-400 max-w-md"
          />
          <p className="text-sm text-text-muted">Phí trích trừ tự động trên mỗi đơn hàng gia công của các Xưởng In.</p>
        </div>

        {/* Banner Text */}
        <div className="space-y-1.5 pt-3 border-t border-border">
          <label htmlFor="adminsettingspage-field-3" className="font-bold text-white flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-purple-400" /> Thông Báo Banner Nổi Trang Chủ
          </label>
          <input id="adminsettingspage-field-3"
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
          />
        </div>

        {/* Warranty Months */}
        <div className="space-y-1.5 pt-3 border-t border-border">
          <label htmlFor="adminsettingspage-field-4" className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Thời Gian Bảo Hành Thước Gãy (Tháng)
          </label>
          <input id="adminsettingspage-field-4"
            type="number"
            value={warrantyMonths}
            onChange={(e) => setWarrantyMonths(Number(e.target.value))}
            className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-purple-400 max-w-md"
          />
          <p className="text-sm text-text-muted">Mặc định 4 tháng tương đương 1 học kỳ sinh viên.</p>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-xs flex items-center gap-2 transition shadow-lg shadow-purple-950/50"
        >
          <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống
        </button>
      </form>
    </div>
  );
}
