import RecordList, { RecordDetailHeader } from '../../components/RecordList';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import {
  Scale,
  RefreshCw,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Send,
  DollarSign,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { PageHeader, CopyButton, Notice } from '../../components/DataUI';
import DisputeResolutionModal, { type DisputeResolutionTarget } from './DisputeResolutionModal';

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
          className="px-4 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#38eeff] text-[#040508] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-md shadow-cyan-950/50 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0 shadow-md shadow-emerald-950/50">
          <CheckCircle2 className="w-3 h-3" /> DA GIAI QUYET
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 whitespace-nowrap shrink-0 shadow-md shadow-cyan-950/50">
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#ff9100]/10 text-[#ff9100] border border-[#ff9100]/30 whitespace-nowrap shrink-0 shadow-md shadow-amber-950/50">
          <Clock className="w-3 h-3" /> MO KHIẾU NẠI
        </span>
      );
  }
}

export default function DisputePanel({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<Dispute[]>(admin ? '/admin/disputes' : '/disputes');
  const action = useAction(remote.reload);

  const { disputeId } = useParams<{ disputeId: string }>();
  const detailId = admin ? undefined : disputeId;
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<DisputeResolutionTarget | null>(null);

  const handleAdminResolve = (dispute: Dispute, status: 'RESOLVED' | 'REJECTED') => {
    setResolutionTarget({
      disputeId: dispute.id,
      orderId: dispute.orderId,
      buyerName: dispute.buyerName,
      maxAmount: dispute.amount || 0,
      status,
    });
  };

  const handleResolutionSubmit = async (payload: {
    status: 'RESOLVED' | 'REJECTED';
    resolutionNote: string;
    refundAmount: number;
    refundType: 'FULL' | 'PARTIAL';
  }) => {
    if (!resolutionTarget) return;
    const disputeId = resolutionTarget.disputeId;
    await action.run(() =>
      send(
        `/admin/disputes/${disputeId}/resolution`,
        payload,
        'put'
      )
    );
    setResolutionTarget(null);
  };

  const disputes = remote.data ?? [];
  const visibleDispute = detailId ? disputes.find(d => d.id === detailId) : undefined;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {detailId ? (
        <RecordDetailHeader to="/disputes" label="Khiếu nại" title="Chi tiết khiếu nại" />
      ) : <PageHeader
        title={admin ? 'QUẢN LÝ KHIẾU NẠI & ĐỐI SOÁT (ADMIN TELEMETRY)' : 'Khiếu nại'}
        description="Hệ thống tiếp nhận phản hồi, đối soát thanh toán và giải quyết tranh chấp chất lượng sản phẩm in 3D theo chuẩn ISO/ASTM."
        icon={Scale}
        actions={!admin ? (
          <div className="flex items-center gap-2">
            <Link
              to="/disputes/create"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-[#040508] hover:bg-primary-hover flex items-center gap-1.5 transition shadow-sm"
            >
              + Tạo khiếu nại
            </Link>
            <button
              type="button"
              onClick={remote.reload}
              className="px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-[#39FF14]' : ''}`} />
              <span>SYNC</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={remote.reload}
            className="px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            <span>LÀM MỚI DỮ LIỆU</span>
          </button>
        )}
      />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DANH SÁCH TRANH CHẤP & TRAO ĐỔI */}
        <div className="lg:col-span-12 min-w-0 space-y-4">
          <div className="flex items-center justify-between bg-[#0a0c12] border border-[#1e2433] px-4 py-3 rounded-xl">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] ring-2 ring-[#00e5ff]/40" />
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

          <Notice error={remote.error} />
          {remote.loading && (
            <div className="p-12 text-center text-slate-400 space-y-3 bg-[#0a0c12] border border-[#1e2433] rounded-2xl">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#39FF14]" />
              <p className="text-xs font-mono">ĐANG TẢI DỮ LIỆU ĐỐI SOÁT TRANH CHẤP...</p>
            </div>
          )}

          {!detailId && !remote.loading && !remote.error && !disputes.length && (
            <div className="p-12 rounded-2xl bg-[#0a0c12] border border-[#1e2433] text-center text-slate-400 space-y-2.5">
              <Scale className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white font-mono">CHƯA CÓ YÊU CẦU TRANH CHẤP NÀO</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Nếu bạn gặp bất kỳ vấn đề nào về thanh toán PayOS hoặc độ chính xác của phôi in, hồ sơ sẽ được lưu trữ và đối soát tại đây.
              </p>
            </div>
          )}

          {detailId && !remote.loading && !remote.error && !visibleDispute && (
            <p role="status" className="rounded-xl border border-border bg-surface p-4 text-sm text-theme-muted">Không tìm thấy yêu cầu khiếu nại này.</p>
          )}
          {!admin && !detailId && disputes.length > 0 && (
            <RecordList
              label="Yêu cầu khiếu nại"
              entries={disputes.map(d => ({
                id: d.id,
                to: `/disputes/${encodeURIComponent(d.id)}`,
                title: d.description || 'Khiếu nại đơn hàng',
                meta: `Đơn #${d.orderId.slice(0, 8)}`,
                status: <DisputeStatusBadge status={d.status} />,
              }))}
            />
          )}
          <div className="space-y-4">
            {(admin ? disputes : visibleDispute ? [visibleDispute] : []).map((d) => (
              <div
                key={d.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 space-y-4 transition shadow-xl relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2433] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {admin ? (
                        <span className="text-xs font-mono font-bold text-[#00e5ff]">MÃ ĐƠN #{d.orderId.substring(0, 10)}...</span>
                      ) : (
                        <Link to={`/orders/${encodeURIComponent(`product:${d.orderId}`)}`} className="text-sm font-semibold text-theme-accent hover:underline">
                          Xem đơn #{d.orderId.slice(0, 8)}
                        </Link>
                      )}
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

                {d.evidenceUrl && !admin && (
                  <figure className="space-y-2">
                    <figcaption className="text-sm font-medium text-theme-ink">Ảnh đính kèm</figcaption>
                    <a href={d.evidenceUrl} target="_blank" rel="noreferrer" className="inline-block rounded-lg" aria-label="Mở ảnh khiếu nại gốc">
                      <img src={d.evidenceUrl} alt="Ảnh bằng chứng gửi kèm khiếu nại" loading="lazy" className="max-h-56 max-w-full rounded-lg border border-border object-contain" />
                    </a>
                  </figure>
                )}
                {d.evidenceUrl && admin && (
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
                  {admin && <button
                    type="button"
                    onClick={() => setActiveChatId(activeChatId === d.id ? null : d.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-[#00e5ff] text-slate-200 hover:text-[#00e5ff] text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>{activeChatId === d.id ? 'THU GỌN TRAO ĐỔI' : 'XEM & PHẢN HỒI'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeChatId === d.id ? 'rotate-180' : ''}`} />
                  </button>}

                  {/* Hành động của Admin */}
                  {admin && ['OPEN', 'UNDER_REVIEW'].includes(d.status) && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => handleAdminResolve(d, 'RESOLVED')}
                        className="px-3.5 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-950/50 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
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
                {(!admin || activeChatId === d.id) && <DisputeChat disputeId={d.id} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impeccable P4: Dispute Resolution Modal */}
      <DisputeResolutionModal
        target={resolutionTarget}
        onClose={() => setResolutionTarget(null)}
        onSubmit={handleResolutionSubmit}
        busy={action.busy}
      />
    </div>
  );
}
