import { useState, useRef, useId } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send, uploadFormData } from '../../services/api';
import type { OrderDTO } from '../../services/orderService';
import {
  ShieldCheck,
  UploadCloud,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Package,
} from 'lucide-react';
import {
  PageHeader,
  Status,
  CopyButton,
} from '../../components/DataUI';

interface Claim {
  id: string;
  orderId: string;
  description: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPLACED' | string;
  buyerName: string;
  createdAt: string;
}

export default function WarrantyPanel({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<Claim[]>(admin ? '/warranty/admin/claims' : '/warranty/user/me');
  const orders = useRemote<OrderDTO[]>(admin ? null : '/orders/me');
  const action = useAction(remote.reload);

  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderSelectId = useId();
  const descriptionId = useId();
  const fileUploadId = useId();

  // Xử lý upload ảnh qua Cloudinary API backend: POST /api/upload/image
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
    if (!orderId) {
      return;
    }
    const success = await action.run(() =>
      send('/warranty/claim', { orderId, description: description.trim(), imageUrl })
    );
    if (success) {
      setOrderId('');
      setDescription('');
      setImageUrl('');
    }
  };

  const completedOrders = orders.data?.filter((o) => o.status === 'COMPLETED') || [];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title={admin ? 'Xử Lý Yêu Cầu Bảo Hành & Đổi Trả' : 'Trung Tâm Bảo Hành & Khiếu Nại Kỹ Thuật'}
        description="Chính sách in lại 1-1 đối với mô hình kỹ thuật bị sai lệch kích thước >0.1mm, cong vênh vật liệu hoặc hư hại vận chuyển."
        icon={ShieldCheck}
        actions={
          <button
            type="button"
            onClick={remote.reload}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:border-[#39FF14]/50 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            Làm mới
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: FORM GỬI YÊU CẦU BẢO HÀNH (Chỉ cho Buyer) */}
        {!admin && (
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff]" />
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" /> Gửi Yêu Cầu Bảo Hành Mới
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Áp dụng cho các đơn hàng đã nhận hoàn tất</p>
            </div>

            {action.error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{action.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4">
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
                  className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] transition cursor-pointer font-mono"
                >
                  <option value="">-- Bấm để chọn đơn hàng gặp lỗi --</option>
                  {completedOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Đơn #{o.id.substring(0, 8)} · {o.items.map((i) => i.productTitle).join(', ')}
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
                  rows={4}
                  maxLength={4000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể: Kích thước sai lệch >0.1mm, ngàm không khớp, nứt vỡ, cong vênh đáy..."
                  className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] resize-none transition"
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
                  /* Khi đã có ảnh: Hiển thị preview */
                  <div className="relative group rounded-xl overflow-hidden border border-[#39FF14]/50 bg-[#040508]">
                    <img src={imageUrl} alt="Bằng chứng lỗi" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-[#0a0c12] text-white hover:text-[#39FF14] transition"
                        title="Xem ảnh gốc toàn màn hình"
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
                  /* Khi chưa có ảnh: Dropzone upload file */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
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
                        <Loader2 className="w-7 h-7 text-[#39FF14] animate-spin" />
                        <span className="text-xs text-slate-300 font-mono font-bold">Đang tải ảnh lên Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Bấm để tải ảnh chụp bằng chứng</span>
                        <span className="text-[11px] text-slate-500 font-mono">PNG, JPG, JPEG, WEBP (Tối đa 10MB)</span>
                      </>
                    )}
                  </div>
                )}
                {uploadError && <p className="text-[11px] text-rose-400 font-semibold">{uploadError}</p>}
              </div>

              {/* Nút gửi yêu cầu bảo hành */}
              <button
                type="submit"
                disabled={action.busy || uploading || !orderId}
                className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#39FF14]/20 disabled:opacity-50 cursor-pointer mt-2 whitespace-nowrap shrink-0"
              >
                {action.busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi yêu cầu...
                  </>
                ) : (
                  'Gửi Yêu Cầu Bảo Hành'
                )}
              </button>
            </form>
          </div>
        )}

        {/* CỘT PHẢI: THEO DÕI CÁC YÊU CẦU BẢO HÀNH ĐÃ GỬI */}
        <div className={admin ? 'lg:col-span-12 space-y-4' : 'lg:col-span-7 space-y-4'}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-[#00e5ff]" /> Danh Sách Yêu Cầu Bảo Hành ({remote.data?.length || 0})
            </h2>
            <button
              type="button"
              onClick={remote.reload}
              className="text-xs text-slate-400 hover:text-[#39FF14] flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {remote.loading && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
              <p className="text-xs font-mono">Đang tải danh sách bảo hành...</p>
            </div>
          )}

          {!remote.loading && (!remote.data || remote.data.length === 0) && (
            <div className="p-12 rounded-2xl bg-[#0a0c12] border border-white/10 text-center text-slate-400 space-y-2 shadow-sm">
              <ShieldCheck className="w-9 h-9 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Chưa có yêu cầu bảo hành nào.</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Khi nhận hàng nếu phát hiện sản phẩm bị lỗi kỹ thuật, hãy gửi yêu cầu để kỹ thuật viên hỗ trợ in đổi mới.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {remote.data?.map((c) => (
              <div
                key={c.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/40 space-y-3.5 transition shadow-lg relative overflow-hidden group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        ĐƠN #{c.orderId.substring(0, 10)}...
                      </span>
                      <CopyButton text={c.orderId} />
                    </div>
                    <p className="text-xs text-slate-400">
                      Khách hàng: <strong className="text-slate-200">{c.buyerName}</strong>
                      {c.createdAt && ` · ${new Date(c.createdAt).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>
                  <div>
                    <Status value={c.status} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040508] text-xs text-slate-300 leading-relaxed border border-white/5 font-mono">
                  <span className="font-bold text-white block mb-1">Mô tả sự cố kỹ thuật:</span>
                  <p className="whitespace-pre-wrap">{c.description}</p>
                </div>

                {c.imageUrl && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400">Bằng chứng lỗi đính kèm:</span>
                    <a
                      href={c.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00e5ff] hover:underline font-semibold flex items-center gap-1.5 font-mono"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Xem ảnh chụp phóng to
                    </a>
                  </div>
                )}

                {/* Hành động duyệt của Admin */}
                {admin && (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                    {c.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              send(`/warranty/admin/claim/${c.id}/status`, { status: 'APPROVED' }, 'put')
                            )
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-[#39FF14] text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 hover:bg-[#32e012] transition"
                        >
                          Duyệt bảo hành
                        </button>
                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              send(`/warranty/admin/claim/${c.id}/status`, { status: 'REJECTED' }, 'put')
                            )
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold text-xs whitespace-nowrap shrink-0 hover:bg-rose-900/60 transition"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {c.status === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() =>
                          void action.run(() =>
                            send(`/warranty/admin/claim/${c.id}/status`, { status: 'REPLACED' }, 'put')
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-[#00e5ff] text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 hover:bg-[#00c8e0] transition"
                      >
                        Xác nhận đã in đổi mới
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
