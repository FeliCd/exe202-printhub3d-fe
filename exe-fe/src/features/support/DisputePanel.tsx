import { useState, useRef, useId } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send, uploadFormData } from '../../services/api';
import type { OrderDTO } from '../../services/orderService';
import {
  Scale,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Package,
  MessageSquare,
  Send,
  DollarSign,
  ChevronDown,
} from 'lucide-react';

interface Dispute {
  id: string;
  orderId: string;
  buyerName: string;
  amount: number;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | string;
  evidenceUrl?: string;
  resolutionNote?: string;
  refundAmount?: number;
}

interface Message {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

function DisputeChat({ disputeId }: { disputeId: string }) {
  const remote = useRemote<Message[]>(`/disputes/${disputeId}/messages`);
  const action = useAction(remote.reload);
  const [content, setContent] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const success = await action.run(() =>
      send(`/disputes/${disputeId}/messages`, { content: content.trim() })
    );
    if (success) setContent('');
  };

  return (
    <div className="p-4 rounded-xl bg-surface-inset border border-border/80 space-y-3 text-xs mt-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-bold text-white flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#39FF14]" /> Trao đổi &amp; Đối soát trực tiếp
        </span>
        <button
          type="button"
          onClick={remote.reload}
          className="text-text-muted hover:text-white flex items-center gap-1 text-[11px]"
        >
          <RefreshCw className="w-3 h-3" /> Làm mới tin nhắn
        </button>
      </div>

      {action.error && (
        <p className="text-rose-400 text-[11px] font-semibold">{action.error}</p>
      )}

      {/* Danh sách tin nhắn */}
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
        {remote.loading && (
          <p className="text-text-muted text-center py-2">Đang tải tin nhắn...</p>
        )}
        {!remote.loading && (!remote.data || remote.data.length === 0) && (
          <p className="text-text-muted text-center py-2 text-[11px]">
            Chưa có phản hồi nào. Hãy gửi tin nhắn để trao đổi cùng hỗ trợ viên.
          </p>
        )}
        {remote.data?.map((m) => (
          <div key={m.id} className="p-2.5 rounded-lg bg-surface border border-border/60 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <strong className="text-[#39FF14]">{m.author}</strong>
              <span className="text-text-muted font-mono">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString('vi-VN') : ''}</span>
            </div>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>

      {/* Ô gửi tin nhắn */}
      <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
        <input
          required
          maxLength={4000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung phản hồi đối soát..."
          className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#39FF14]"
        />
        <button
          type="submit"
          disabled={action.busy || !content.trim()}
          className="py-2 px-3.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
        >
          {action.busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
}

export default function DisputePanel({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<Dispute[]>(admin ? '/admin/disputes' : '/disputes');
  const orders = useRemote<OrderDTO[]>(admin ? null : '/orders/me');
  const action = useAction(remote.reload);

  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
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
    if (!orderId) return;
    const success = await action.run(() =>
      send('/disputes', {
        orderId,
        description: description.trim(),
        evidenceUrl: evidenceUrl || undefined,
      })
    );
    if (success) {
      setOrderId('');
      setDescription('');
      setEvidenceUrl('');
    }
  };

  const handleAdminResolve = async (dispute: Dispute, status: 'RESOLVED' | 'REJECTED') => {
    const resolutionNote = window.prompt(
      status === 'RESOLVED' ? 'Nhập kết luận giải quyết tranh chấp:' : 'Lý do từ chối tranh chấp:'
    );
    if (!resolutionNote) return;

    let refundAmount = 0;
    if (status === 'RESOLVED') {
      const refundInput = window.prompt(
        `Nhập số tiền hoàn lại (Tối đa ${dispute.amount?.toLocaleString()} VNĐ, nhập 0 nếu không hoàn tiền):`,
        '0'
      );
      if (refundInput === null) return;
      refundAmount = Number(refundInput);
      if (!Number.isFinite(refundAmount) || refundAmount < 0 || refundAmount > dispute.amount) {
        alert('Số tiền hoàn trả không hợp lệ.');
        return;
      }
    }

    await action.run(() =>
      send(
        `/admin/disputes/${dispute.id}/resolution`,
        {
          status,
          resolutionNote,
          refundAmount,
          refundType: refundAmount === dispute.amount ? 'FULL' : 'PARTIAL',
        },
        'put'
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Chờ tiếp nhận
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <RefreshCw className="w-3.5 h-3.5" /> Đang đối soát
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã giải quyết
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Từ chối
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const completedOrders = orders.data || [];

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-[#39FF14]">
          <Scale className="w-7 h-7" />
          <h1 className="text-2xl font-black text-white">
            {admin ? 'Quản Lý Khiếu Nại & Tranh Chấp (Admin)' : 'Khiếu Nại & Tranh Chấp Đơn Hàng'}
          </h1>
        </div>
        <p className="text-xs text-text-muted mt-1">
          Hệ thống tiếp nhận phản hồi, đối soát thanh toán và giải quyết khiếu nại chất lượng sản phẩm in 3D.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: FORM TẠO KHIẾU NẠI (Dành cho Buyer) */}
        {!admin && (
          <div className="lg:col-span-5 p-6 rounded-2xl bg-surface border border-border space-y-5 shadow-xl">
            <div className="border-b border-border/80 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>📝</span> Tạo Khiếu Nại Mới
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">Chọn đơn hàng cần đối soát hoặc khiếu nại</p>
            </div>

            {action.error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{action.error}</span>
              </div>
            )}

            <form onSubmit={handleCreateDispute} className="space-y-4">
              {/* Chọn đơn hàng */}
              <div className="space-y-1.5">
                <label htmlFor={orderSelectId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#39FF14]" /> Chọn đơn hàng khiếu nại <span className="text-rose-400">*</span>
                </label>
                <select
                  id={orderSelectId}
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-surface-inset border border-border rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] transition cursor-pointer"
                >
                  <option value="">-- Bấm để chọn đơn hàng --</option>
                  {completedOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Đơn #{o.id.substring(0, 8)} · {o.items.map((i) => i.productTitle).join(', ')} ({o.totalAmount?.toLocaleString()}đ)
                    </option>
                  ))}
                </select>
                {completedOrders.length === 0 && !orders.loading && (
                  <p className="text-[11px] text-amber-400 font-medium">Bạn chưa có đơn hàng nào để khiếu nại.</p>
                )}
              </div>

              {/* Mô tả nội dung khiếu nại */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={descId} className="font-bold text-slate-300">
                    Nội dung phản hồi / sự cố <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">{description.length}/4000</span>
                </div>
                <textarea
                  id={descId}
                  required
                  rows={4}
                  maxLength={4000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể vấn đề thanh toán, giao hàng chậm trễ hoặc chất lượng sản phẩm..."
                  className="w-full bg-surface-inset border border-border rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] resize-none transition"
                />
              </div>

              {/* Tải ảnh chụp bằng chứng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <label htmlFor={fileUploadId} className="flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-[#39FF14]" /> Ảnh chụp biên lai / Bằng chứng lỗi
                  </label>
                  <span className="text-[11px] text-text-muted font-normal">Tối đa 10MB</span>
                </div>

                {evidenceUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#39FF14]/50 bg-surface-inset">
                    <img src={evidenceUrl} alt="Bằng chứng khiếu nại" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-surface text-white hover:text-[#39FF14] transition"
                        title="Xem ảnh gốc toàn màn hình"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setEvidenceUrl('')}
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
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      uploading
                        ? 'border-border bg-surface-inset/50 cursor-wait'
                        : 'border-border hover:border-[#39FF14] bg-surface-inset/30 hover:bg-surface-inset'
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
                        <span className="text-xs text-slate-300 font-bold">Đang tải ảnh bằng chứng...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[#39FF14]">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Bấm để tải ảnh bằng chứng / biên lai</span>
                        <span className="text-[11px] text-text-muted">Hỗ trợ PNG, JPG, JPEG, WEBP</span>
                      </>
                    )}
                  </div>
                )}
                {uploadError && <p className="text-[11px] text-rose-400 font-semibold">{uploadError}</p>}
              </div>

              {/* Nút gửi yêu cầu */}
              <button
                type="submit"
                disabled={action.busy || uploading || !orderId}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer mt-2"
              >
                {action.busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi khiếu nại...
                  </>
                ) : (
                  'Gửi Yêu Cầu Khiếu Nại'
                )}
              </button>
            </form>
          </div>
        )}

        {/* CỘT PHẢI: DANH SÁCH TRANH CHẤP & TRAO ĐỔI */}
        <div className={admin ? 'lg:col-span-12 space-y-4' : 'lg:col-span-7 space-y-4'}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <span>📋</span> Danh Sách Khiếu Nại ({remote.data?.length || 0})
            </h2>
            <button
              type="button"
              onClick={remote.reload}
              className="text-xs text-text-muted hover:text-[#39FF14] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {remote.loading && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
              <p className="text-xs">Đang tải danh sách khiếu nại...</p>
            </div>
          )}

          {!remote.loading && (!remote.data || remote.data.length === 0) && (
            <div className="p-12 rounded-2xl bg-surface border border-border text-center text-text-muted space-y-2 shadow-sm">
              <Scale className="w-9 h-9 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Chưa có yêu cầu khiếu nại nào.</p>
              <p className="text-xs max-w-sm mx-auto">
                Nếu bạn gặp tranh chấp về thanh toán hoặc sản phẩm, các yêu cầu tạo ra sẽ hiển thị tại đây.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {remote.data?.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-surface border border-border/80 hover:border-border space-y-3 transition shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      MÃ ĐƠN: <strong className="text-white font-mono">{d.orderId}</strong>
                    </span>
                    <p className="text-xs text-text-muted mt-0.5">Khách hàng: {d.buyerName}</p>
                  </div>
                  <div>{getStatusBadge(d.status)}</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-inset text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-200">Nội dung khiếu nại: </span>
                  {d.description}
                </div>

                {d.evidenceUrl && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-text-muted">Bằng chứng đính kèm:</span>
                    <a
                      href={d.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#39FF14] hover:underline font-semibold flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Xem ảnh bằng chứng
                    </a>
                  </div>
                )}

                {/* Kết luận & Hoàn tiền */}
                {d.resolutionNote && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/30 text-xs text-primary space-y-1">
                    <p className="font-bold text-primary">Kết luận giải quyết:</p>
                    <p>{d.resolutionNote}</p>
                    {!!d.refundAmount && (
                      <p className="text-xs text-[#39FF14] font-bold flex items-center gap-1 pt-1">
                        <DollarSign className="w-3.5 h-3.5" /> Hoàn trả: {d.refundAmount.toLocaleString()} VNĐ
                      </p>
                    )}
                  </div>
                )}

                {/* Buttons trao đổi & Admin Resolve */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChatId(activeChatId === d.id ? null : d.id)}
                    className="py-1.5 px-3 rounded-lg bg-surface-raised hover:bg-surface-inset border border-border hover:border-[#39FF14] text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>{activeChatId === d.id ? 'Thu gọn phản hồi' : 'Xem & gửi phản hồi'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeChatId === d.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Hành động của Admin */}
                  {admin && ['OPEN', 'UNDER_REVIEW'].includes(d.status) && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => handleAdminResolve(d, 'RESOLVED')}
                        className="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        Giải quyết khiếu nại
                      </button>
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => handleAdminResolve(d, 'REJECTED')}
                        className="py-1.5 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>

                {/* Khung chat trao đổi */}
                {activeChatId === d.id && <DisputeChat disputeId={d.id} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
