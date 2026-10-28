import { useState, useRef, useId } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send, uploadFormData } from '../../services/api';
import type { OrderDTO } from '../../services/orderService';
import {
  Scale,
  UploadCloud,
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
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  PageHeader,
  CopyButton,
} from '../../components/DataUI';

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
    <div className="p-4 rounded-xl bg-[#040508] border border-[#1e2433] space-y-3 text-xs mt-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#00e5ff]/5 blur-2xl pointer-events-none rounded-full" />
      <div className="flex items-center justify-between border-b border-[#1e2433] pb-2.5">
        <span className="font-bold text-white flex items-center gap-2 font-mono tracking-wide">
          <MessageSquare className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>KENH TRAO DOI TRUC TIEP</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">COMMS LOG</span>
        </span>
        <button
          type="button"
          onClick={remote.reload}
          className="text-slate-400 hover:text-[#00e5ff] flex items-center gap-1.5 text-[11px] font-mono transition whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${remote.loading ? 'animate-spin text-[#00e5ff]' : ''}`} />
          <span>LAM MOI</span>
        </button>
      </div>

      {action.error && (
        <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{action.error}</span>
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {remote.loading && (
          <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#00e5ff]" />
            <span className="text-[11px] font-mono">DANG TAI DU LIEU TELEMETRY...</span>
          </div>
        )}
        {!remote.loading && (!remote.data || remote.data.length === 0) && (
          <div className="text-center py-4 text-[11px] text-slate-500 font-mono bg-[#0a0c12] border border-[#1e2433] rounded-lg">
            CHUA CO PHAN HOI DOI SOAT. HAY GUI TIN NHAN DE TRAO DOI VOI KY THUAT VIEN.
          </div>
        )}
        {remote.data?.map((m) => (
          <div key={m.id} className="p-3 rounded-lg bg-[#0a0c12] border border-[#1e2433] hover:border-[#1e2433]/80 space-y-1.5 transition">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#39FF14] font-bold font-mono tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                {m.author}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-xs">{m.content}</p>
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
          placeholder="Nhap noi dung phan hoi doi soat..."
          className="flex-1 bg-[#0a0c12] border border-[#1e2433] focus:border-[#00e5ff] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none text-xs transition"
        />
        <button
          type="submit"
          disabled={action.busy || !content.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#38eeff] text-[#040508] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,229,255,0.25)] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          {action.busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>GUI</span>
        </button>
      </form>
    </div>
  );
}

function DisputeStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
          <CheckCircle2 className="w-3 h-3" /> DA GIAI QUYET
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
          <Clock className="w-3 h-3 animate-spin" /> DANG DOI SOAT
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap shrink-0">
          <XCircle className="w-3 h-3" /> TU CHOI
        </span>
      );
    case 'OPEN':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#ff9100]/10 text-[#ff9100] border border-[#ff9100]/30 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(255,145,0,0.15)]">
          <Clock className="w-3 h-3" /> MO KHIẾU NẠI
        </span>
      );
  }
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

  const completedOrders = orders.data || [];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title={admin ? 'QUẢN LÝ KHIẾU NẠI & ĐỐI SOÁT (ADMIN TELEMETRY)' : 'KHIẾU NẠI & ĐỐI SOÁT ĐƠN HÀNG'}
        description="Hệ thống tiếp nhận phản hồi, đối soát thanh toán và giải quyết tranh chấp chất lượng sản phẩm in 3D theo chuẩn ISO/ASTM."
        icon={Scale}
        actions={
          <button
            type="button"
            onClick={remote.reload}
            className="px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            <span>LÀM MỚI DỮ LIỆU</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: FORM TẠO KHIẾU NẠI (Dành cho Buyer) */}
        {!admin && (
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
            <div className="border-b border-[#1e2433] pb-3.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
                  TẠO KHIẾU NẠI MỚI
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">CHỌN ĐƠN CẦN ĐỐI SOÁT CHẤT LƯỢNG</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#11141e] text-[#00e5ff] border border-[#1e2433]">
                FORM #DISPUTE
              </span>
            </div>

            {action.error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{action.error}</span>
              </div>
            )}

            <form onSubmit={handleCreateDispute} className="space-y-4">
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
                  className="w-full bg-[#040508] border border-[#1e2433] rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] transition cursor-pointer font-mono"
                >
                  <option value="">-- Bấm để chọn mã đơn hàng --</option>
                  {completedOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Đơn #{o.id.substring(0, 8)} · {o.items.map((i) => i.productTitle).join(', ')} ({o.totalAmount?.toLocaleString()}đ)
                    </option>
                  ))}
                </select>
                {completedOrders.length === 0 && !orders.loading && (
                  <p className="text-[11px] text-[#ff9100] font-mono">Chưa có đơn hàng nào để khởi tạo khiếu nại.</p>
                )}
              </div>

              {/* Mô tả nội dung khiếu nại */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={descId} className="font-bold text-slate-300 font-mono">
                    NỘI DUNG SỰ CỐ / ĐỐI SOÁT <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{description.length}/4000</span>
                </div>
                <textarea
                  id={descId}
                  required
                  rows={4}
                  maxLength={4000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể sai lệch kích thước, gãy lớp, sai màu vật liệu hoặc vấn đề thanh toán..."
                  className="w-full bg-[#040508] border border-[#1e2433] rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14] resize-none transition"
                />
              </div>

              {/* Tải ảnh chụp bằng chứng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-mono">
                  <label htmlFor={fileUploadId} className="flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-[#00e5ff]" /> ẢNH CHỤP BIÊN LAI / BẰNG CHỨNG LỖI
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">Tối đa 10MB</span>
                </div>

                {evidenceUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#39FF14]/50 bg-[#040508]">
                    <img src={evidenceUrl} alt="Bằng chứng khiếu nại" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] text-white hover:text-[#00e5ff] transition"
                        title="Xem ảnh gốc toàn màn hình"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setEvidenceUrl('')}
                        className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 hover:text-white transition cursor-pointer"
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
                        <Loader2 className="w-7 h-7 text-[#39FF14] animate-spin" />
                        <span className="text-xs text-slate-300 font-bold font-mono">ĐANG TẢI BẰNG CHỨNG LÊN VAULT...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white font-mono">BẤM HOẶC KÉO THẢ ẢNH BẰNG CHỨNG</span>
                        <span className="text-[11px] text-slate-400 font-mono">PNG, JPG, JPEG, WEBP (MAX 10MB)</span>
                      </>
                    )}
                  </div>
                )}
                {uploadError && <p className="text-[11px] text-rose-400 font-mono font-semibold">{uploadError}</p>}
              </div>

              {/* Nút gửi yêu cầu */}
              <button
                type="submit"
                disabled={action.busy || uploading || !orderId}
                className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(57,255,20,0.25)] disabled:opacity-50 cursor-pointer mt-2 whitespace-nowrap shrink-0"
              >
                {action.busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG GỬI KHIẾU NẠI...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>GỬI YÊU CẦU ĐỐI SOÁT & KHIẾU NẠI</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* CỘT PHẢI: DANH SÁCH TRANH CHẤP & TRAO ĐỔI */}
        <div className={admin ? 'lg:col-span-12 space-y-4' : 'lg:col-span-7 space-y-4'}>
          <div className="flex items-center justify-between bg-[#0a0c12] border border-[#1e2433] px-4 py-3 rounded-xl">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
              DANH SÁCH HỒ SƠ TRANH CHẤP ({remote.data?.length || 0})
            </h2>
            <button
              type="button"
              onClick={remote.reload}
              className="text-xs text-slate-400 hover:text-[#39FF14] flex items-center gap-1.5 transition cursor-pointer font-mono whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SYNC</span>
            </button>
          </div>

          {remote.loading && (
            <div className="p-12 text-center text-slate-400 space-y-3 bg-[#0a0c12] border border-[#1e2433] rounded-2xl">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#39FF14]" />
              <p className="text-xs font-mono">ĐANG TẢI DỮ LIỆU ĐỐI SOÁT TRANH CHẤP...</p>
            </div>
          )}

          {!remote.loading && (!remote.data || remote.data.length === 0) && (
            <div className="p-12 rounded-2xl bg-[#0a0c12] border border-[#1e2433] text-center text-slate-400 space-y-2.5">
              <Scale className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white font-mono">CHƯA CÓ YÊU CẦU TRANH CHẤP NÀO</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Nếu bạn gặp bất kỳ vấn đề nào về thanh toán PayOS hoặc độ chính xác của phôi in, hồ sơ sẽ được lưu trữ và đối soát tại đây.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {remote.data?.map((d) => (
              <div
                key={d.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 space-y-4 transition shadow-xl relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2433] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#00e5ff]">
                        MÃ ĐƠN #{d.orderId.substring(0, 10)}...
                      </span>
                      <CopyButton text={d.orderId} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Khách hàng: <strong className="text-white">{d.buyerName}</strong>
                    </p>
                  </div>
                  <div>
                    <DisputeStatusBadge status={d.status} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040508] text-xs text-slate-300 leading-relaxed border border-[#1e2433]">
                  <span className="font-bold text-[#39FF14] block mb-1 font-mono text-[11px]">NỘI DUNG KHIẾU NẠI:</span>
                  <p className="whitespace-pre-wrap">{d.description}</p>
                </div>

                {d.evidenceUrl && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400 font-mono">Bằng chứng:</span>
                    <a
                      href={d.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00e5ff] hover:underline font-mono font-semibold flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Xem ảnh bằng chứng gốc
                    </a>
                  </div>
                )}

                {/* Kết luận & Hoàn tiền */}
                {d.resolutionNote && (
                  <div className="p-3.5 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/30 text-xs text-slate-200 space-y-1.5">
                    <p className="font-bold text-[#39FF14] font-mono text-[11px] uppercase tracking-wide">KẾT LUẬN GIẢI QUYẾT TỪ HỆ THỐNG:</p>
                    <p>{d.resolutionNote}</p>
                    {!!d.refundAmount && (
                      <p className="text-xs text-[#39FF14] font-bold flex items-center gap-1.5 pt-1 font-mono">
                        <DollarSign className="w-3.5 h-3.5" /> SỐ TIỀN HOÀN TRẢ: {d.refundAmount.toLocaleString()} VNĐ
                      </p>
                    )}
                  </div>
                )}

                {/* Buttons trao đổi & Admin Resolve */}
                <div className="pt-3 border-t border-[#1e2433] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveChatId(activeChatId === d.id ? null : d.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-[#00e5ff] text-slate-200 hover:text-[#00e5ff] text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>{activeChatId === d.id ? 'THU GỌN TRAO ĐỔI' : 'XEM & PHẢN HỒI'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeChatId === d.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Hành động của Admin */}
                  {admin && ['OPEN', 'UNDER_REVIEW'].includes(d.status) && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => handleAdminResolve(d, 'RESOLVED')}
                        className="px-3.5 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(57,255,20,0.2)] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        GIẢI QUYẾT KHIẾU NẠI
                      </button>
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => handleAdminResolve(d, 'REJECTED')}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        TỪ CHỐI
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

