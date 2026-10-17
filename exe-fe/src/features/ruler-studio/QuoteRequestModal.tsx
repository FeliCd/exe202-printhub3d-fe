import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { send, uploadFormData, errorText } from '../../services/api';
import { buildSTLFromDesign } from './export/buildExport';
import { getRuler } from './library/registry';
import type { Design } from './model';
import Modal from '../../components/Modal';
import {
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Send,
  User,
  Package,
} from 'lucide-react';

interface QuoteRequestModalProps {
  open: boolean;
  onClose: () => void;
  design: Design;
  onSuccess?: () => void;
}

interface CustomOrderApiResult {
  id?: string;
  result?: { id?: string };
  data?: { id?: string; result?: { id?: string } };
}

function QuoteRequestFormContent({
  design,
  onClose,
  onSuccess,
}: {
  design: Design;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const rulerDef = getRuler(design.rulerId);

  // Form State initialized directly from user auth context
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || !/^[0-9]{9,11}$/.test(cleanPhone)) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (9 đến 11 chữ số).');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }
    if (quantity < 1) {
      setErrorMsg('Số lượng tối thiểu là 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Render Solid STL from Design
      setLoadingStep('Đang dựng mô hình 3D thực tế (.STL)...');
      const stlResult = await buildSTLFromDesign(design);

      // 2. Upload STL to CDN Cloudinary
      setLoadingStep('Đang tải tệp STL lên hệ thống xưởng...');
      const formData = new FormData();
      formData.append('file', stlResult.blob, stlResult.fileName);
      formData.append('folder', 'printhub3d/custom_prints');

      const uploadRes = await uploadFormData<string | { result?: string; url?: string }>('/upload/raw', formData);
      const attachmentUrl = typeof uploadRes === 'string' ? uploadRes : (uploadRes?.result || uploadRes?.url || '');

      if (!attachmentUrl) {
        throw new Error('Không thể tải tệp 3D lên máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }

      // 3. Prepare technical requirements description
      const rulerModelName = `${rulerDef?.vietnameseName || rulerDef?.name || 'Thước 3D'} · ${design.length} cm`;
      const technicalRequirements = [
        `Mẫu thước: ${rulerModelName}`,
        `Kích thước: Dài ${design.length}cm`,
        `Vật liệu: ${design.material}`,
        `Độ đặc infill: ${design.infill}%`,
        `Phối màu: Thân (${design.color}) - Mặt biển (${design.tag.color}) - Chữ (${design.tag.textColor})`,
        design.tag.text ? `Khắc tên: ${design.tag.text} (Font: ${design.tag.font})` : '',
        design.layers.length > 0 ? `Số sticker/icon dập nổi: ${design.layers.length}` : '',
        notes.trim() ? `Ghi chú khách: ${notes.trim()}` : '',
      ]
        .filter(Boolean)
        .join('; ');

      const fullShippingAddress = `${recipientName.trim()} · ${cleanPhone} · ${address.trim()}`;

      // 4. Send Custom Order Request
      setLoadingStep('Đang gửi thông tin yêu cầu báo giá đến Admin...');
      const res = await send<CustomOrderApiResult>('/custom-orders', {
        attachmentUrl,
        quantity,
        shippingAddress: fullShippingAddress,
        requirements: technicalRequirements,
        rulerModel: rulerModelName,
        customName: design.tag.text || '',
        customStudentId: '',
        color: `${design.color} / ${design.tag.color}`,
        fontStyle: design.tag.font || 'Modern',
        paymentMethod: 'PAYOS',
      });

      const orderData = res?.data?.result || res?.data || res?.result || res;
      const orderId = orderData?.id || '';

      setCreatedOrderId(orderId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setErrorMsg(errorText(err) || 'Có lỗi xảy ra khi gửi yêu cầu báo giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-surface p-6 shadow-2xl space-y-5 relative max-h-[calc(100dvh-2rem)] overflow-y-auto">
      {!isSubmitting && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Not Authenticated View */}
      {!isAuthenticated ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Yêu cầu đăng nhập</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bạn cần đăng nhập tài khoản PrintHub 3D để gửi file thiết kế 3D và nhận phản hồi báo giá trực tiếp từ xưởng.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs text-slate-300 hover:bg-surface-raised font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => navigate('/login?redirect=/custom')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 text-xs shadow-lg shadow-primary/20"
            >
              Đăng nhập ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : createdOrderId ? (
        /* Success View */
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Đã gửi yêu cầu báo giá thành công!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Tệp mô hình 3D thực tế (.STL) đã được xuất và tải lên hệ thống xưởng. Kỹ thuật viên sẽ kiểm tra độ chi tiết và gửi báo giá trong mục <strong>Báo giá</strong> của bạn.
            </p>
            {createdOrderId && (
              <div className="inline-block px-3 py-1 bg-surface-raised border border-border rounded-lg text-xs font-mono text-primary mt-1">
                Mã yêu cầu: #{createdOrderId.slice(0, 8)}
              </div>
            )}
          </div>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/quotations');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 text-xs shadow-lg shadow-primary/20"
            >
              <Clock className="w-4 h-4" /> Xem tiến độ báo giá
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-xs text-slate-300 hover:bg-surface-raised font-medium"
            >
              Tiếp tục chỉnh sửa
            </button>
          </div>
        </div>
      ) : (
        /* Normal Form View */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary shrink-0">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yêu cầu báo giá in thước 3D</h3>
              <p className="text-xs text-slate-400">
                Xưởng sẽ thẩm định mô hình 3D thực tế và gửi báo giá chi tiết.
              </p>
            </div>
          </div>

          {/* Design Snapshot Pill */}
          <div className="rounded-xl border border-border/80 bg-surface-raised/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                {rulerDef?.vietnameseName || rulerDef?.name || 'Thước 3D'} · {design.length} cm
              </span>
              <span className="font-mono text-primary font-bold">Cần thẩm định</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-border/40">
              <div>Vật liệu: <strong className="text-slate-200">{design.material} ({design.infill}%)</strong></div>
              <div>Khắc tên: <strong className="text-slate-200">{design.tag.text || 'Không có'}</strong></div>
              <div className="flex items-center gap-1.5">
                Màu sắc:
                <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ backgroundColor: design.color }} />
                <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ backgroundColor: design.tag.color }} />
              </div>
              <div>Sticker nổi: <strong className="text-slate-200">{design.layers.length} icon</strong></div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Người nhận <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Số điện thoại <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Địa chỉ nhận hàng chi tiết <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-300">
                  Số lượng in <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2 text-xs text-white font-mono focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  Ghi chú kỹ thuật (tùy chọn)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: cần in bóng, giao gấp trước thứ 6..."
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-surface-inset border border-border px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Note & Action */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Hệ thống sẽ <strong>tự động dựng và gửi file 3D (.STL) chuẩn mm</strong> sang xưởng. Bạn không cần tải hay upload file thủ công.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border text-xs text-slate-300 hover:bg-surface-raised font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition text-xs shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Đang xử lý...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi yêu cầu báo giá cho xưởng ↗</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function QuoteRequestModal({
  open,
  onClose,
  design,
  onSuccess,
}: QuoteRequestModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} label="Yêu cầu báo giá in thước 3D">
      <QuoteRequestFormContent
        key={`${design.rulerId}-${design.length}`}
        design={design}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
