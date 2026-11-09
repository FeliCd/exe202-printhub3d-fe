import { useState, useRef, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRemote, useAction } from '../hooks/useRemote';
import { send, uploadFormData } from '../services/api';
import type { OrderDTO } from '../services/orderService';
import {
  ShieldCheck,
  UploadCloud,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Package,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

export default function WarrantyCreatePage() {
  const navigate = useNavigate();
  const orders = useRemote<OrderDTO[]>('/orders/me');
  const action = useAction();

  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderSelectId = useId();
  const descriptionId = useId();
  const fileUploadId = useId();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn định dạng file ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dung lượng file ảnh quá lớn (tối đa 10MB).');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFormData<{ result: string } | string>('/upload/image', formData);
      const uploadedUrl = typeof res === 'string' ? res : res?.result;
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh lên thất bại. Vui lòng thử lại.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !description.trim() || uploading || action.busy) return;
    if (!reviewing) {
      setReviewing(true);
      return;
    }
    const success = await action.run(() =>
      send('/warranty/claim', { orderId, description: description.trim(), imageUrl })
    );
    if (success) {
      navigate('/warranty');
    }
  };

  const completedOrders = orders.data?.filter((o) => o.status === 'COMPLETED') || [];
  const chosenOrder = completedOrders.find(order => order.id === orderId);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/warranty"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-[#39FF14] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUAY LẠI DANH SÁCH BẢO HÀNH</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff]" />

        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
              <span>GỬI YÊU CẦU BẢO HÀNH & ĐỔI TRẢ MỚI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Chính sách in lại 1-1 đối với mô hình kỹ thuật bị sai lệch kích thước &gt;0.1mm, cong vênh vật liệu hoặc hư hại vận chuyển.
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-mono bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
            WARRANTY #1-1
          </span>
        </div>

        {action.error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{action.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitClaim} className="space-y-5">
          {/* Progress Steps */}
          <ol aria-label="Tiến trình yêu cầu bảo hành" className="flex flex-wrap gap-2 text-xs font-mono">
            {['1. Chọn đơn hàng', '2. Mô tả lỗi kỹ thuật & Ảnh', '3. Xác nhận & Gửi'].map((step, index) => {
              const current = reviewing ? 2 : orderId ? 1 : 0;
              return (
                <li
                  key={step}
                  aria-current={current === index ? 'step' : undefined}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    current === index
                      ? 'bg-primary/20 text-[#39FF14] border border-[#39FF14]/40 shadow-sm'
                      : current > index
                        ? 'text-slate-300 bg-surface'
                        : 'text-slate-500'
                  }`}
                >
                  {step}
                </li>
              );
            })}
          </ol>

          <fieldset hidden={reviewing} disabled={reviewing} className="min-w-0 space-y-5">
            {/* Chọn đơn hàng */}
            <div className="space-y-1.5">
              <label htmlFor={orderSelectId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Package className="w-3.5 h-3.5 text-[#39FF14]" /> CHỌN ĐƠN HÀNG HOÀN TẤT <span className="text-rose-400">*</span>
              </label>
              <select
                id={orderSelectId}
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#39FF14] transition cursor-pointer font-mono"
              >
                <option value="">-- Bấm để chọn đơn hàng gặp lỗi --</option>
                {completedOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    Đơn #{o.id.substring(0, 8)} · {o.items.map((i) => i.productTitle).join(', ')} ({new Date(o.createdAt).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
              {completedOrders.length === 0 && !orders.loading && (
                <p className="text-[11px] text-[#ff9100] font-mono font-medium">
                  Bạn hiện chưa có đơn hàng nào ở trạng thái đã hoàn thành (COMPLETED).
                </p>
              )}
            </div>

            {/* Mô tả chi tiết lỗi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={descriptionId} className="font-bold text-slate-300 font-mono">
                  MÔ TẢ CHI TIẾT LỖI KỸ THUẬT <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">{description.length}/4000</span>
              </div>
              <textarea
                id={descriptionId}
                required
                rows={5}
                maxLength={4000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể: Kích thước sai lệch >0.1mm, ngàm không khớp, nứt vỡ, cong vênh đáy..."
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#39FF14] resize-none transition"
              />
            </div>

            {/* Tải ảnh chụp bằng chứng lỗi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-mono">
                <label htmlFor={fileUploadId} className="flex items-center gap-1.5 cursor-pointer">
                  <ImageIcon className="w-3.5 h-3.5 text-[#00e5ff]" /> ẢNH CHỤP BẰNG CHỨNG LỖI
                </label>
                <span className="text-[11px] text-slate-500 font-normal">Tối đa 10MB</span>
              </div>

              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#39FF14]/50 bg-[#040508] max-w-md">
                  <img src={imageUrl} alt="Bằng chứng lỗi" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-[#0a0c12] text-white hover:text-[#39FF14] transition"
                      title="Xem ảnh gốc"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-2 rounded-lg bg-rose-950/80 text-rose-300 hover:text-white transition cursor-pointer"
                      title="Xóa ảnh để chọn lại"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                    uploading
                      ? 'border-white/10 bg-[#040508]/50 cursor-wait'
                      : 'border-white/20 hover:border-[#39FF14] bg-[#040508]/40 hover:bg-[#040508]'
                  }`}
                >
                  <input
                    id={fileUploadId}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
                      <span className="text-xs text-slate-300 font-mono font-bold">Đang tải ảnh lên Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">BẤM HOẶC KÉO THẢ ẢNH BẰNG CHỨNG LỖI VÀO ĐÂY</span>
                      <span className="text-[11px] text-slate-400 font-mono">Hỗ trợ PNG, JPG, JPEG, WEBP (tối đa 10MB)</span>
                    </>
                  )}
                </div>
              )}
              {uploadError && <p className="text-[11px] text-rose-400 font-mono font-semibold">{uploadError}</p>}
            </div>
          </fieldset>

          {/* Review Panel */}
          {reviewing && (
            <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5 text-xs">
              <h2 className="font-bold text-theme-ink uppercase font-mono text-sm flex items-center gap-2 text-[#39FF14]">
                <CheckCircle2 className="w-4 h-4" /> XÁC NHẬN YÊU CẦU BẢO HÀNH
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 rounded-lg bg-[#040508] border border-white/5">
                  <dt className="text-theme-muted font-mono text-[11px]">MÃ ĐƠN HÀNG</dt>
                  <dd className="font-semibold text-white mt-1">#{orderId.substring(0, 12)}</dd>
                </div>
                <div className="p-3 rounded-lg bg-[#040508] border border-white/5">
                  <dt className="text-theme-muted font-mono text-[11px]">SẢN PHẨM ÁP DỤNG</dt>
                  <dd className="font-semibold text-white mt-1 truncate">{chosenOrder?.items.map(i => i.productTitle).join(', ') || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-2 p-3 rounded-lg bg-[#040508] border border-white/5">
                  <dt className="text-theme-muted font-mono text-[11px]">MÔ TẢ SỰ CỐ</dt>
                  <dd className="whitespace-pre-wrap mt-1 text-slate-200">{description}</dd>
                </div>
                {imageUrl && (
                  <div className="sm:col-span-2 p-3 rounded-lg bg-[#040508] border border-white/5">
                    <dt className="text-theme-muted font-mono text-[11px] mb-2">ẢNH BẰNG CHỨNG</dt>
                    <dd>
                      <img src={imageUrl} alt="Ảnh bằng chứng lỗi" className="h-40 w-auto rounded-lg object-cover border border-white/10" />
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            {reviewing ? (
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                QUAY LẠI CHỈNH SỬA
              </button>
            ) : (
              <Link
                to="/warranty"
                className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-400 hover:text-white transition text-center"
              >
                HỦY BỎ
              </Link>
            )}

            <button
              type="submit"
              disabled={action.busy || uploading || !orderId || !description.trim()}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#39FF14] to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
            >
              {action.busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG GỬI HỒ SƠ BẢO HÀNH...</span>
                </>
              ) : reviewing ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN GỬI YÊU CẦU BẢO HÀNH</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>TIẾP TỤC: XEM LẠI & GỬI YÊU CẦU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

