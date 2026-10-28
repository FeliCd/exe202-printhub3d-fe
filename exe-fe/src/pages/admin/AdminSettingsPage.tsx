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
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader, Notice } from '../../components/DataUI';

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
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      <PageHeader
        title="CẤU HÌNH HỆ THỐNG & THAM SỐ XƯỞNG IN (PLATFORM CONFIG)"
        description="Quản trị tham số toàn hệ thống, cước phí giao hàng ký túc xá, tỷ lệ hoa hồng chiết khấu sàn và chính sách bảo hành in 3D."
        badge="Platform Telemetry"
        icon={Settings}
        actions={
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#39FF14] ${loading ? 'animate-spin' : ''}`} />
            <span>TẢI LẠI CẤU HÌNH</span>
          </button>
        }
      />

      <Notice
        success={saved ? 'ĐÃ ĐỒNG BỘ VÀ LƯU TOÀN BỘ 7 THAM SỐ HỆ THỐNG VÀO DATABASE THÀNH CÔNG!' : undefined}
        error={error || undefined}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Thông tin thương hiệu & Liên hệ */}
        <div className="p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 transition-all shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                1. THÔNG TIN THƯƠNG HIỆU &amp; KÊNH LIÊN HỆ
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                HIỂN THỊ TRÊN HEADER, HÓA ĐƠN ĐƠN HÀNG VÀ EMAIL PHẢN HỒI SINH VIÊN
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="setting-store-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Store className="w-3.5 h-3.5 text-[#39FF14]" /> TÊN NỀN TẢNG / THƯƠNG HIỆU XƯỞNG
              </label>
              <input
                id="setting-store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="PrintHub 3D..."
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-support-email" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#00e5ff]" /> EMAIL TIẾP NHẬN ĐỐI SOÁT &amp; HỖ TRỢ
              </label>
              <input
                id="setting-support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@printhub3d.com"
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-support-phone" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#00e5ff]" /> HOTLINE ĐIỀU PHỐI KỸ THUẬT &amp; KHIẾU NẠI
              </label>
              <input
                id="setting-support-phone"
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Chính sách vận hành & Dịch vụ in */}
        <div className="p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 transition-all shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e2433]">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                2. THAM SỐ TÀI CHÍNH &amp; CHÍNH SÁCH BẢO HÀNH IN 3D
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                CÁC ĐỊNH MỨC VẬN HÀNH, PHÍ GIAO HÀNG ĐỒNG GIÁ KÝ TÚC XÁ VÀ BẢO HÀNH GÃY PHÔI
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Shipping Fee */}
            <div className="space-y-1.5">
              <label htmlFor="setting-shipping-fee" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Truck className="w-3.5 h-3.5 text-[#39FF14]" /> CƯỚC VẬN CHUYỂN ĐỒNG GIÁ KTX (VNĐ)
              </label>
              <input
                id="setting-shipping-fee"
                type="number"
                min="0"
                step="1000"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400 font-mono">
                Áp dụng giao nhanh nội khu KTX Đại học FPT / ĐHQG (mặc định 15.000đ).
              </p>
            </div>

            {/* Commission Rate */}
            <div className="space-y-1.5">
              <label htmlFor="setting-commission-rate" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" /> TỶ LỆ CHIẾT KHẤU SÀN PLATFORM (%)
              </label>
              <input
                id="setting-commission-rate"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400 font-mono">
                Tỷ lệ khấu trừ trên mỗi đơn gia công của các xưởng in đối tác (mặc định 5%).
              </p>
            </div>

            {/* Warranty Months */}
            <div className="space-y-1.5">
              <label htmlFor="setting-warranty-months" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00e5ff]" /> THỜI HẠN BẢO HÀNH THƯỚC GÃY (THÁNG)
              </label>
              <input
                id="setting-warranty-months"
                type="number"
                min="1"
                max="24"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#39FF14] transition"
              />
              <p className="text-[11px] text-slate-400 font-mono">
                Chính sách 1-đổi-1 cho sinh viên gặp sự cố gãy nứt phôi in 3D (mặc định 4 tháng / 1 học kỳ).
              </p>
            </div>

            {/* Banner Text */}
            <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-[#1e2433]">
              <label htmlFor="setting-banner-text" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Bell className="w-3.5 h-3.5 text-[#ff9100]" /> THÔNG BÁO BANNER NỔI TRANG CHỦ
              </label>
              <textarea
                id="setting-banner-text"
                rows={2}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Thông báo sự kiện hoặc chương trình khuyến mãi..."
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition resize-none"
              />
              <p className="text-[11px] text-slate-400 font-mono">
                Dòng thông báo nổi bật xuất hiện trên thanh thông tin đầu trang web cho toàn bộ người dùng.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-black font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#040508]" />
            ) : (
              <Save className="w-4 h-4 text-[#040508]" />
            )}
            <span>{saving ? 'ĐANG LƯU CẤU HÌNH...' : 'LƯU CẤU HÌNH NỀN TẢNG'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
