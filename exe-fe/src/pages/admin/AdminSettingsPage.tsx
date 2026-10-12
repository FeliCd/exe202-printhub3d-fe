import { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  Truck,
  DollarSign,
  Bell,
  Store,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('PrintHub 3D - Dịch vụ In 3D & Thước Kỹ Thuật');
  const [supportEmail, setSupportEmail] = useState('support@printhub3d.com');
  const [supportPhone, setSupportPhone] = useState('0987654321');
  const [shippingFee, setShippingFee] = useState(15000);
  const [commissionRate, setCommissionRate] = useState(5);
  const [bannerText, setBannerText] = useState('Ưu đãi sinh viên: Nhận voucher 15.000đ & Khắc tên/MSSV miễn phí!');
  const [warrantyMonths, setWarrantyMonths] = useState(4);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(successTimer.current);
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await adminService.getStoreSettings()) as Record<string, string> | undefined;
      if (data) {
        if (data.storeName !== undefined) setStoreName(data.storeName);
        if (data.supportEmail !== undefined) setSupportEmail(data.supportEmail);
        if (data.supportPhone !== undefined) setSupportPhone(data.supportPhone);
        if (data.shippingFee !== undefined) setShippingFee(Number(data.shippingFee) || 15000);
        if (data.commissionRate !== undefined) setCommissionRate(Number(data.commissionRate) || 5);
        if (data.bannerText !== undefined) setBannerText(data.bannerText);
        if (data.warrantyMonths !== undefined) setWarrantyMonths(Number(data.warrantyMonths) || 4);
      }
    } catch (err: unknown) {
      console.warn('Không thể tải store settings từ backend, dùng cấu hình hiện tại:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, string> = {
      storeName: storeName.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      shippingFee: String(shippingFee),
      commissionRate: String(commissionRate),
      bannerText: bannerText.trim(),
      warrantyMonths: String(warrantyMonths),
    };

    try {
      await adminService.updateStoreSettings(payload);
      setSaved(true);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSaved(false), 3500);
    } catch (err: unknown) {
      console.error('Lỗi lưu store settings:', err);
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Không thể lưu cài đặt hệ thống';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#39FF14]">
            <Settings className="w-6 h-6 drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cấu Hình Nền Tảng (Platform Settings)
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Quản trị thông tin sàn, cước vận chuyển ký túc xá, chiết khấu và chính sách bảo hành sinh viên.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-[#39FF14]/50 text-slate-300 hover:text-white text-xs font-semibold transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#39FF14] ${loading ? 'animate-spin' : ''}`} />
          <span>Tải lại cấu hình</span>
        </button>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-[#39FF14]/50 text-[#39FF14] text-xs font-bold flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(57,255,20,0.2)] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#39FF14] shrink-0" />
            <span>Đã đồng bộ và lưu toàn bộ 7 cấu hình hệ thống vào cơ sở dữ liệu thành công!</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Thông tin thương hiệu & Liên hệ */}
        <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#39FF14]/30 transition-all shadow-md space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Thông Tin Thương Hiệu &amp; Liên Hệ
              </h2>
              <p className="text-[11px] text-slate-400">
                Hiển thị trên header trang chủ, hóa đơn đơn hàng và email phản hồi
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="setting-store-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#39FF14]" /> Tên Nền Tảng / Thương Hiệu
              </label>
              <input
                id="setting-store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="PrintHub 3D..."
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-support-email" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#39FF14]" /> Email Hỗ Trợ Khách Hàng
              </label>
              <input
                id="setting-support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@printhub3d.com"
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-support-phone" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#39FF14]" /> Hotline Kỹ Thuật &amp; Khiếu Nại
              </label>
              <input
                id="setting-support-phone"
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Chính sách vận hành & Dịch vụ in */}
        <div className="p-6 rounded-2xl bg-surface border border-border hover:border-[#39FF14]/30 transition-all shadow-md space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Chính Sách Vận Hành &amp; Dịch Vụ In 3D
              </h2>
              <p className="text-[11px] text-slate-400">
                Các thông số tài chính, phí giao hàng nội khu sinh viên và bảo hành kỹ thuật
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Shipping Fee */}
            <div className="space-y-1.5">
              <label htmlFor="setting-shipping-fee" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#39FF14]" /> Cước Phí Vận Chuyển Đồng Giá KTX (VNĐ)
              </label>
              <input
                id="setting-shipping-fee"
                type="number"
                min="0"
                step="1000"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400">
                Áp dụng giao nhanh nội khu KTX Đại học FPT / ĐHQG (mặc định 15.000đ).
              </p>
            </div>

            {/* Commission Rate */}
            <div className="space-y-1.5">
              <label htmlFor="setting-commission-rate" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" /> Tỷ Lệ Chiết Khấu Sàn Platform (%)
              </label>
              <input
                id="setting-commission-rate"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400">
                Tỷ lệ trích trừ trên mỗi đơn gia công của các xưởng in đối tác (mặc định 5%).
              </p>
            </div>

            {/* Warranty Months */}
            <div className="space-y-1.5">
              <label htmlFor="setting-warranty-months" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" /> Thời Gian Bảo Hành Thước Gãy (Tháng)
              </label>
              <input
                id="setting-warranty-months"
                type="number"
                min="1"
                max="24"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400">
                Chính sách đổi mới 1-đổi-1 cho sinh viên gặp sự cố gãy thước in 3D (mặc định 4 tháng / 1 học kỳ).
              </p>
            </div>

            {/* Banner Text */}
            <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-border">
              <label htmlFor="setting-banner-text" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#39FF14]" /> Thông Báo Banner Nổi Trang Chủ
              </label>
              <textarea
                id="setting-banner-text"
                rows={2}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Thông báo sự kiện hoặc chương trình khuyến mãi..."
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Dòng chữ chạy marquee hoặc banner nổi bật xuất hiện trên đỉnh trang chủ cho toàn bộ sinh viên.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-slate-950 font-black text-xs flex items-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{saving ? 'Đang lưu cài đặt...' : 'Lưu Cấu Hình Nền Tảng'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
