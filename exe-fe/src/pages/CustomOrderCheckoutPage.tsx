import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { send, errorText } from '../services/api';
import { payOrder } from '../services/paymentService';
import { formatPrice } from '../utils/format';
import type { ShippingAddress } from '../features/address/data';
import {
  MapPin,
  Ruler,
  Layers,
  Sparkles,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  QrCode,
  X,
  RotateCcw,
  Check,
  ShoppingBag,
} from 'lucide-react';

export interface CustomRulerOrderConfig {
  selectedModel: {
    id: string;
    name: string;
    category: string;
    length: number;
    width: number;
    thickness: number;
    basePrice: number;
  };
  studentName: string;
  studentId: string;
  university?: string;
  fontId: string;
  fontName: string;
  baseColor: string;
  plateColor: string;
  textColor: string;
  materialType: string;
  infillDensity: number;
  stickersCount: number;
  estimatedPrice: number;
  attachmentUrl?: string;
  fileName?: string;
}

interface CustomOrderCheckoutPageProps {
  shippingAddress?: ShippingAddress;
  onOpenAddressModal?: () => void;
}

const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Hải Phòng',
  'Bà Rịa - Vũng Tàu',
  'Thừa Thiên Huế',
  'Khánh Hòa',
  'Lâm Đồng',
  'Quảng Nam',
  'Tỉnh / Thành phố khác',
];

export default function CustomOrderCheckoutPage({
  shippingAddress,
  onOpenAddressModal,
}: CustomOrderCheckoutPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // 1. Load Custom Ruler Configuration from location.state or sessionStorage
  const [orderConfig] = useState<CustomRulerOrderConfig | null>(() => {
    if (location.state && (location.state as any).orderConfig) {
      return (location.state as any).orderConfig;
    }
    const saved = sessionStorage.getItem('printhub_custom_ruler_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Current Step in 4-Step Stepper (1 -> 2 -> 3 -> 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Shipping Details
  const [recipientName, setRecipientName] = useState(
    shippingAddress?.recipientName || user?.name || 'Lê Quốc Khánh'
  );
  const [phone, setPhone] = useState(
    shippingAddress?.phone || user?.phone || '0786954657'
  );
  const [province, setProvince] = useState(
    shippingAddress?.province || 'TP. Hồ Chí Minh'
  );
  const [addressLine, setAddressLine] = useState(
    shippingAddress?.addressLine || user?.address || 'Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức'
  );
  const [addressError, setAddressError] = useState('');

  // Update from external shippingAddress if updated via modal
  useEffect(() => {
    if (shippingAddress && shippingAddress.recipientName) {
      setRecipientName(shippingAddress.recipientName);
      setPhone(shippingAddress.phone);
      if (shippingAddress.province) setProvince(shippingAddress.province);
      if (shippingAddress.addressLine) setAddressLine(shippingAddress.addressLine);
    }
  }, [shippingAddress]);

  // Step 3: Production Specs
  const [quantity, setQuantity] = useState<number>(1);
  const [infillDensity, setInfillDensity] = useState<number>(orderConfig?.infillDensity || 30);
  const [notes, setNotes] = useState<string>('');

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<'PAYOS' | 'COD'>('PAYOS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPayOSConfirmModal, setShowPayOSConfirmModal] = useState(false);

  // Pricing Calculation
  const unitPrice = orderConfig?.estimatedPrice || 45000;
  const subtotal = unitPrice * quantity;
  // If user has VIP, grant 15% discount
  const isVip = user?.role === 'ADMIN' || (user as any)?.subscriptionType === 'CUSTOMER_VIP';
  const vipDiscount = isVip ? Math.round(subtotal * 0.15) : 0;
  const shippingFee = subtotal >= 100000 || isVip ? 0 : 15000;
  const totalAmount = Math.max(0, subtotal - vipDiscount + shippingFee);

  // Validation Step 1
  const handleNextFromStep1 = () => {
    setAddressError('');
    if (!recipientName.trim()) {
      setAddressError('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || !/^[0-9]{9,11}$/.test(cleanPhone)) {
      setAddressError('Vui lòng nhập số điện thoại hợp lệ (9 đến 11 chữ số).');
      return;
    }
    if (!province.trim()) {
      setAddressError('Vui lòng chọn Tỉnh / Thành phố.');
      return;
    }
    if (!addressLine.trim()) {
      setAddressError('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }
    setCurrentStep(2);
  };

  // Submit Final Custom Order
  const handleFinalSubmit = async () => {
    if (!orderConfig) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const fullShippingAddress = `${recipientName.trim()} · ${phone.trim()} · ${addressLine.trim()}, ${province.trim()}`;
      const technicalRequirements = [
        `Mẫu thước: ${orderConfig.selectedModel.name}`,
        `Vật liệu: ${orderConfig.materialType}`,
        `Độ đặc infill: ${infillDensity}%`,
        `Phối màu: Thân (${orderConfig.baseColor}) - Mặt biển (${orderConfig.plateColor}) - Chữ (${orderConfig.textColor})`,
        `Khắc tên: ${orderConfig.studentName} (MSSV: ${orderConfig.studentId}) - Font: ${orderConfig.fontName}`,
        orderConfig.stickersCount > 0 ? `Số sticker 3D: ${orderConfig.stickersCount}` : '',
        notes.trim() ? `Ghi chú khách: ${notes.trim()}` : '',
        `Phương thức thanh toán mong muốn: ${paymentMethod}`,
      ]
        .filter(Boolean)
        .join('; ');

      // Post custom order to backend
      const res = await send<any>('/custom-orders', {
        attachmentUrl: orderConfig.attachmentUrl,
        quantity,
        shippingAddress: fullShippingAddress,
        requirements: technicalRequirements,
        rulerModel: orderConfig.selectedModel.name,
        customName: orderConfig.studentName,
        customStudentId: orderConfig.studentId,
        color: `${orderConfig.baseColor} / ${orderConfig.plateColor}`,
        fontStyle: orderConfig.fontName,
        paymentMethod,
      });

      const createdOrder = res?.data?.result || res?.data || res?.result || res;
      const orderId = createdOrder?.id;

      // Clean up session storage
      sessionStorage.removeItem('printhub_custom_ruler_order');

      // If PAYOS and orderId exists, trigger payOrder directly or redirect
      if (paymentMethod === 'PAYOS' && orderId) {
        try {
          await payOrder(orderId, 'CUSTOM_ORDER');
          return;
        } catch (paymentErr) {
          console.warn('Chưa mở được PayOS trực tiếp, chuyển hướng về /quotations:', paymentErr);
          navigate('/quotations?status=PENDING_PAYMENT');
          return;
        }
      }

      // If COD or other, navigate to quotations list
      navigate('/quotations?created=true');
    } catch (err) {
      setSubmitError(errorText(err));
    } finally {
      setIsSubmitting(false);
      setShowPayOSConfirmModal(false);
    }
  };

  // If no design configuration exists
  if (!orderConfig) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          <Ruler className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Chưa có thiết kế thước 3D nào</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Bạn chưa chọn hoặc tùy biến mẫu thước nào trong công cụ 3D. Vui lòng mở công cụ để tạo thước trước khi tiến hành đặt in.
          </p>
        </div>
        <Link
          to="/custom"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-primary/20 text-sm"
        >
          <Ruler className="w-4 h-4" /> Mở công cụ thiết kế Thước 3D
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. HEADER & TOP STEPPER INDICATOR */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary/20 border border-primary/40 text-primary">
                <Ruler className="w-6 h-6" />
              </span>
              Xác Nhận Đặt In Thước 3D
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Quy trình 4 bước kiểm tra thông tin và đặt sản xuất thước in 3D cá nhân hóa.
            </p>
          </div>
          <Link
            to="/custom"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-inset text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Chỉnh sửa lại 3D
          </Link>
        </div>

        {/* STEPPER PROGRESS BAR (4 Steps) */}
        <div className="relative rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-lg">
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Step Items */}
            {[
              { num: 1, title: 'Địa chỉ nhận', icon: MapPin },
              { num: 2, title: 'Mẫu thước 3D', icon: Ruler },
              { num: 3, title: 'Số lượng & Ghi chú', icon: Layers },
              { num: 4, title: 'Thanh toán', icon: CreditCard },
            ].map(step => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              const Icon = step.icon;

              return (
                <div
                  key={step.num}
                  className={`flex flex-col items-center text-center space-y-1.5 cursor-pointer transition ${
                    isCurrent
                      ? 'text-primary'
                      : isPassed
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                  onClick={() => {
                    // Only allow clicking back to previous steps, or current
                    if (step.num < currentStep) {
                      setCurrentStep(step.num);
                    }
                  }}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-md ${
                      isCurrent
                        ? 'bg-primary text-slate-950 ring-4 ring-primary/20 scale-105'
                        : isPassed
                        ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-400'
                        : 'bg-surface-inset border border-border text-slate-500'
                    }`}
                  >
                    {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold truncate max-w-[85px] sm:max-w-none">
                    {step.num}. {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: 📍 THÔNG TIN GIAO HÀNG & NGƯỜI NHẬN */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Bước 1: Thông tin người nhận & Địa chỉ giao hàng</h2>
                  <p className="text-xs text-slate-400">PrintHub sẽ đóng gói và giao thước đến tận địa chỉ này.</p>
                </div>
              </div>

              {onOpenAddressModal && (
                <button
                  type="button"
                  onClick={onOpenAddressModal}
                  className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" /> Sổ địa chỉ đã lưu
                </button>
              )}
            </div>

            {addressError && (
              <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs">
                ⚠️ {addressError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Họ và tên người nhận (*)</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Ví dụ: Lê Quốc Khánh"
                  className="w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Số điện thoại liên hệ (*)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0786954657"
                  className="w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tỉnh / Thành phố (*)</label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
              >
                {VIETNAM_PROVINCES.map(p => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Địa chỉ chi tiết nhận hàng (*)</label>
              <input
                type="text"
                value={addressLine}
                onChange={e => setAddressLine(e.target.value)}
                placeholder="Số nhà, tên đường, KTX, toà nhà, phòng..."
                className="w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Gợi ý: Nếu ở KTX hoặc trường đại học, hãy ghi rõ số phòng và toà nhà để shipper giao nhanh nhất.
              </p>
            </div>

            {/* BUTTON BAR STEP 1 */}
            <div className="flex justify-end pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
              >
                <span>Tiếp tục: Kiểm tra thiết kế 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: 📐 KIỂM TRA THÔNG SỐ MẪU THƯỚC 3D */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Bước 2: Đối chiếu thông số mẫu thước 3D</h2>
                <p className="text-xs text-slate-400">Kiểm tra lại toàn bộ chi tiết cá nhân hóa trước khi lên lệnh in.</p>
              </div>
            </div>

            {/* 4 Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Ruler Model Info */}
              <div className="p-4 rounded-xl border border-border bg-surface-inset space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Ruler className="w-4 h-4" /> Mẫu thước &amp; Kích thước
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{orderConfig.selectedModel.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{orderConfig.selectedModel.category}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chiều dài:</span>
                    <strong className="text-white font-mono">{orderConfig.selectedModel.length} cm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chiều rộng:</span>
                    <strong className="text-white font-mono">{orderConfig.selectedModel.width} cm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Độ dày:</span>
                    <strong className="text-white font-mono">{orderConfig.selectedModel.thickness} cm</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Materials & Colors */}
              <div className="p-4 rounded-xl border border-border bg-surface-inset space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Vật liệu &amp; Phối màu
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Vật liệu in 3D:</span>
                  <strong className="text-white text-sm">{orderConfig.materialType}</strong>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
                  <span className="text-slate-400 block text-[10px]">Phối màu các lớp:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: orderConfig.baseColor }} />
                      <span className="text-[11px] text-slate-300">Thân thước</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: orderConfig.plateColor }} />
                      <span className="text-[11px] text-slate-300">Mặt bảng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: orderConfig.textColor }} />
                      <span className="text-[11px] text-slate-300">Chữ số</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Custom Laser Engraving */}
              <div className="p-4 rounded-xl border border-border bg-surface-inset space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" /> Nội dung khắc laser
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                    <span className="text-slate-400">Tên dập nổi:</span>
                    <strong className="text-primary text-sm font-bold">{orderConfig.studentName}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                    <span className="text-slate-400">Mã số sinh viên:</span>
                    <strong className="text-cyan-300 font-mono text-sm">{orderConfig.studentId || 'Chưa điền'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kiểu Font chữ:</span>
                    <span className="text-white font-medium">{orderConfig.fontName}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Stickers & 3D File */}
              <div className="p-4 rounded-xl border border-border bg-surface-inset space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Download className="w-4 h-4" /> Tệp thiết kế &amp; Sticker 3D
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                    <span className="text-slate-400">Sticker 3D đã dán:</span>
                    <strong className="text-purple-300">{orderConfig.stickersCount} icon dập nổi</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tệp mô hình STL:</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Đã tạo và mã hoá</span>
                  </div>
                  {orderConfig.attachmentUrl && (
                    <div className="pt-1">
                      <a
                        href={orderConfig.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Xem hoặc tải tệp STL trên CDN
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BUTTON BAR STEP 2 */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại: Địa chỉ</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
              >
                <span>Tiếp tục: Số lượng &amp; Yêu cầu in</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ⚙️ SỐ LƯỢNG IN & GHI CHÚ KỸ THUẬT */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Bước 3: Số lượng in &amp; Ghi chú kỹ thuật xưởng</h2>
                <p className="text-xs text-slate-400">Chọn số lượng sản phẩm cần in và lưu ý riêng cho thợ máy.</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Số lượng cần in:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-border bg-surface-inset p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-lg bg-surface border border-border hover:bg-slate-800 text-white font-bold flex items-center justify-center disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-14 text-center font-mono font-black text-lg text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(50, quantity + 1))}
                    disabled={quantity >= 50}
                    className="w-9 h-9 rounded-lg bg-surface border border-border hover:bg-slate-800 text-white font-bold flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white">{formatPrice(unitPrice * quantity)}đ</span> (Đơn giá: {formatPrice(unitPrice)}đ/cây)
                </div>
              </div>
            </div>

            {/* Infill Density Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Mật độ ruột in (Infill Density):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 20, title: '20% - Tiêu chuẩn', desc: 'Nhẹ, tối ưu chi phí, hoàn hảo cho đồ án học tập' },
                  { value: 50, title: '50% - Chắc chắn', desc: 'Gia cường chịu lực, chống gập bẻ khi di chuyển' },
                  { value: 100, title: '100% - Đúc đặc', desc: 'Đúc đặc nguyên khối, siêu cứng cáp kháng va đập' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInfillDensity(opt.value)}
                    className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                      infillDensity === opt.value
                        ? 'border-primary bg-primary/10 text-white ring-2 ring-primary/20'
                        : 'border-border bg-surface-inset text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{opt.title}</span>
                      {infillDensity === opt.value && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes for Technicians */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Ghi chú dặn dò riêng cho kỹ thuật viên in:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Cần gấp trước thứ Sáu để nộp đồ án, đóng gói kỹ bọc chống sốc giúp mình..."
                className="w-full rounded-xl border border-border bg-surface-inset p-3 text-sm text-white focus:border-primary focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {/* BUTTON BAR STEP 3 */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại: Thiết kế 3D</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
              >
                <span>Tiếp tục: Phương thức thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: 💳 PHƯƠNG THỨC THANH TOÁN & XÁC NHẬN TẠO ĐƠN */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Bước 4: Chọn phương thức thanh toán &amp; Báo giá chi tiết</h2>
                <p className="text-xs text-slate-400">Kiểm tra chiết tính chi phí và gửi lệnh sản xuất đến xưởng PrintHub.</p>
              </div>
            </div>

            {/* Payment Method Radio Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Hình thức thanh toán:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PayOS Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PAYOS')}
                  className={`p-4 rounded-xl border text-left space-y-2 transition relative ${
                    paymentMethod === 'PAYOS'
                      ? 'border-primary bg-primary/10 text-white ring-2 ring-primary/20 shadow-lg shadow-primary/10'
                      : 'border-border bg-surface-inset text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
                    Khuyên dùng
                  </span>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-bold text-sm">Cổng PayOS (VietQR)</p>
                      <p className="text-[11px] text-slate-400">Quét mã QR chuyển khoản tự động 100%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    ⚡ Xưởng tự động nhận lệnh và lên máy in 3D ngay sau khi quét mã thành công.
                  </p>
                </button>

                {/* COD Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    paymentMethod === 'COD'
                      ? 'border-primary bg-primary/10 text-white ring-2 ring-primary/20'
                      : 'border-border bg-surface-inset text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-[11px] text-slate-400">Nhận thước, kiểm tra rồi thanh toán tiền mặt</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    📦 Nhân viên bưu tá giao hàng tận nơi thu tiền trực tiếp.
                  </p>
                </button>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="rounded-xl border border-border/80 bg-surface-inset p-5 space-y-3 text-sm">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300 border-b border-border/40 pb-2">
                Chi tiết bảng tính chi phí
              </h3>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Đơn giá thước in 3D:</span>
                <span className="text-white font-mono">{formatPrice(unitPrice)}đ</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Số lượng đặt:</span>
                <span className="text-white font-mono">× {quantity} cây</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tạm tính:</span>
                <span className="text-white font-mono font-bold">{formatPrice(subtotal)}đ</span>
              </div>

              {vipDiscount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400">
                  <span>Ưu đãi gói hội viên VIP (-15%):</span>
                  <span className="font-mono font-bold">-{formatPrice(vipDiscount)}đ</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Phí giao hàng:</span>
                <span className="text-white font-mono">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">Miễn phí</span>
                  ) : (
                    `${formatPrice(shippingFee)}đ`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border text-base">
                <span className="font-bold text-white">TỔNG TIỀN THANH TOÁN:</span>
                <span className="text-2xl font-black text-primary font-mono">
                  {formatPrice(totalAmount)}đ
                </span>
              </div>
            </div>

            {/* Summary of Recipient */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-surface-inset/50 text-xs text-slate-300 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Giao đến:</strong> {recipientName} ({phone}) — {addressLine}, {province}
              </div>
            </div>

            {/* BUTTON BAR STEP 4 */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại: Số lượng</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (paymentMethod === 'PAYOS') {
                    setShowPayOSConfirmModal(true);
                  } else {
                    handleFinalSubmit();
                  }
                }}
                className="px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-black hover:brightness-110 active:scale-[0.99] transition flex items-center gap-2 text-sm shadow-xl shadow-primary/20 uppercase tracking-tight cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Đang tạo đơn hàng...'
                    : paymentMethod === 'PAYOS'
                    ? `Thanh toán PayOS (${formatPrice(totalAmount)}đ)`
                    : 'Xác nhận đặt hàng (COD)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP XÁC NHẬN THANH TOÁN TRƯỚC 100% QUA PAYOS */}
      {/* ========================================================================= */}
      {showPayOSConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-primary/50 bg-[#12141a] p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowPayOSConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Xác nhận thanh toán đơn in 3D</h3>
                <p className="text-xs text-slate-400">Cổng thanh toán tự động VietQR PayOS</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-surface-inset p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-slate-400">Mẫu thước:</span>
                <span className="font-bold text-white">{orderConfig.selectedModel.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-slate-400">Số lượng:</span>
                <span className="font-mono text-white">{quantity} cây</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-slate-300 font-medium">Số tiền thanh toán:</span>
                <span className="text-2xl font-black text-primary font-mono">
                  {formatPrice(totalAmount)}đ
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Bạn có xác nhận muốn <strong>thanh toán trước 100% số tiền ({formatPrice(totalAmount)}đ)</strong> để xưởng <strong>PrintHub 3D</strong> tiếp nhận tệp thiết kế và bắt đầu quy trình in 3D ngay không?
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
              >
                <CreditCard className="w-4 h-4" />
                {isSubmitting ? 'Đang mở cổng PayOS...' : 'Xác nhận & Mở cổng PayOS'}
              </button>
              <button
                type="button"
                onClick={() => setShowPayOSConfirmModal(false)}
                className="py-3 px-4 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white transition text-sm"
              >
                Để thanh toán sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
