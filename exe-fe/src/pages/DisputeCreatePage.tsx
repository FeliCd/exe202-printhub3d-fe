import { useState, useRef, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRemote, useAction } from '../hooks/useRemote';
import { send, uploadFormData } from '../services/api';
import type { OrderDTO } from '../services/orderService';
import {
  Scale,
  UploadCloud,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Package,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function DisputeCreatePage() {
  const navigate = useNavigate();
  const orders = useRemote<OrderDTO[]>('/orders/me');
  const action = useAction();

  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderSelectId = useId();
  const descId = useId();
  const fileUploadId = useId();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFormData<{ result: string } | string>('/upload/image', formData);
      const url = typeof res === 'string' ? res : res?.result;
      if (url) {
        setEvidenceUrl(url);
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !description.trim()) return;
    const success = await action.run(() =>
      send('/disputes', {
        orderId,
        description: description.trim(),
        evidenceUrl: evidenceUrl || undefined,
      })
    );
    if (success) {
      navigate('/disputes');
    }
  };

  const completedOrders = orders.data || [];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/disputes"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-[#39FF14] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUAY LẠI DANH SÁCH KHIẾU NẠI</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />

        <div className="border-b border-[#1e2433] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5 font-mono uppercase tracking-wider">
              <Scale className="w-5 h-5 text-[#39FF14]" />
              <span>TẠO YÊU CẦU KHIẾU NẠI & ĐỐI SOÁT</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Chọn đơn hàng cần khiếu nại, mô tả sai sót và đính kèm bằng chứng để xưởng kiểm tra xử lý.
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-mono bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
            FORM #DISPUTE
          </span>
        </div>

        {action.error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{action.error}</span>
          </div>
        )}

        <form onSubmit={handleCreateDispute} className="space-y-5">
          {/* Chọn đơn hàng */}
          <div className="space-y-1.5">
            <label htmlFor={orderSelectId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
              <Package className="w-3.5 h-3.5 text-[#39FF14]" /> CHỌN ĐƠN HÀNG KHIẾU NẠI <span className="text-rose-400">*</span>
            </label>
            <select
              id={orderSelectId}
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#040508] border border-[#1e2433] focus:border-[#39FF14] rounded-xl p-3 text-xs text-white outline-none transition cursor-pointer font-mono"
            >
              <option value="">-- Bấm để chọn mã đơn hàng --</option>
              {completedOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Đơn #{o.id.substring(0, 8)} · {new Date(o.createdAt).toLocaleDateString('vi-VN')} · {o.totalAmount?.toLocaleString('vi-VN')} đ ({o.status})
                </option>
              ))}
            </select>
            {completedOrders.length === 0 && !orders.loading && (
              <p className="text-[11px] text-[#ff9100] font-mono font-medium">
                Bạn chưa có đơn hàng nào trong hệ thống để thực hiện khiếu nại.
              </p>
            )}
          </div>

          {/* Mô tả sự cố */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={descId} className="font-bold text-slate-300 font-mono">
                NỘI DUNG SỰ CỐ / ĐỐI SOÁT <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">{description.length}/4000</span>
            </div>
            <textarea
              id={descId}
              required
              rows={5}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể sai lệch kích thước, gãy lớp, sai màu vật liệu hoặc vấn đề thanh toán..."
              className="w-full bg-[#040508] border border-[#1e2433] focus:border-[#39FF14] rounded-xl p-3.5 text-xs text-white outline-none resize-none transition"
            />
          </div>

          {/* Upload ảnh */}
          <div className="space-y-1.5">
            <label htmlFor={fileUploadId} className="block text-xs font-bold text-slate-300 font-mono">
              ẢNH CHỤP BIÊN LAI / BẰNG CHỨNG LỖI
            </label>

            {evidenceUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-[#39FF14]/50 bg-[#040508] max-w-md">
                <img src={evidenceUrl} alt="Bằng chứng khiếu nại" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a
                    href={evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0a0c12] text-white hover:text-[#39FF14] transition"
                    title="Xem ảnh gốc"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setEvidenceUrl('')}
                    className="p-2 rounded-lg bg-rose-950/80 text-rose-300 hover:text-white transition cursor-pointer"
                    title="Xóa ảnh"
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
                    ? 'border-[#1e2433] bg-[#040508]/80 cursor-wait'
                    : 'border-[#1e2433] hover:border-[#39FF14] bg-[#040508]/40 hover:bg-[#040508]'
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
                    <span className="text-xs text-slate-300 font-bold font-mono">ĐANG TẢI BẰNG CHỨNG LÊN HỆ THỐNG...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">BẤM HOẶC KÉO THẢ ẢNH BẰNG CHỨNG VÀO ĐÂY</span>
                    <span className="text-[11px] text-slate-400 font-mono">Hỗ trợ PNG, JPG, JPEG, WEBP (tối đa 10MB)</span>
                  </>
                )}
              </div>
            )}
            {uploadError && <p className="text-[11px] text-rose-400 font-mono font-semibold">{uploadError}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#1e2433]">
            <Link
              to="/disputes"
              className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-400 hover:text-white transition text-center"
            >
              HỦY BỎ
            </Link>
            <button
              type="submit"
              disabled={action.busy || uploading || !orderId}
              className="flex-1 py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
            >
              {action.busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG GỬI KHIẾU NẠI...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GỬI YÊU CẦU ĐỐI SOÁT & KHIẾU NẠI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

