import RecordList, { RecordDetailHeader } from '../../components/RecordList';
import { Link, useParams } from 'react-router-dom';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  PageHeader,
  Status,
  CopyButton,
  Notice,
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
  const { claimId } = useParams<{ claimId: string }>();
  const detailId = admin ? undefined : claimId;
  const action = useAction(remote.reload);

  const visibleClaim = detailId ? remote.data?.find(claim => claim.id === detailId) : undefined;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {detailId ? (
        <RecordDetailHeader to="/warranty" label="Bảo hành" title="Chi tiết yêu cầu bảo hành" />
      ) : (
        <PageHeader
          title={admin ? 'Xử Lý Yêu Cầu Bảo Hành & Đổi Trả' : 'Bảo hành'}
          description="Chính sách in lại 1-1 đối với mô hình kỹ thuật bị sai lệch kích thước >0.1mm, cong vênh vật liệu hoặc hư hại vận chuyển."
          icon={ShieldCheck}
          actions={
            <div className="flex items-center gap-2">
              {!admin && (
                <Link
                  to="/warranty/create"
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-[#040508] hover:bg-primary-hover flex items-center gap-1.5 transition shadow-sm"
                >
                  + Gửi yêu cầu bảo hành
                </Link>
              )}
              <button
                type="button"
                onClick={remote.reload}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#0a0c12] hover:border-[#39FF14]/50 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-[#39FF14]' : ''}`} />
                Làm mới
              </button>
            </div>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DANH SÁCH YÊU CẦU BẢO HÀNH */}
        <div className="lg:col-span-12 space-y-4">
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

          <Notice error={remote.error} />
          {remote.loading && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
              <p className="text-xs font-mono">Đang tải danh sách bảo hành...</p>
            </div>
          )}

          {!detailId && !remote.loading && !remote.error && !remote.data?.length && (
            <div className="p-12 rounded-2xl bg-[#0a0c12] border border-white/10 text-center text-slate-400 space-y-2 shadow-sm">
              <ShieldCheck className="w-9 h-9 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Chưa có yêu cầu bảo hành nào.</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Khi nhận hàng nếu phát hiện sản phẩm bị lỗi kỹ thuật, hãy gửi yêu cầu để kỹ thuật viên hỗ trợ in đổi mới.
              </p>
            </div>
          )}

          {detailId && !remote.loading && !remote.error && !visibleClaim && (
            <p role="status" className="rounded-xl border border-border bg-surface p-4 text-sm text-theme-muted">
              Không tìm thấy yêu cầu bảo hành này.
            </p>
          )}

          {!admin && !detailId && !!remote.data?.length && (
            <RecordList
              label="Yêu cầu bảo hành"
              entries={remote.data.map((c) => ({
                id: c.id,
                to: `/warranty/${encodeURIComponent(c.id)}`,
                title: c.description || 'Yêu cầu bảo hành',
                meta: `Đơn #${c.orderId.slice(0, 8)}`,
                status: <Status value={c.status} />,
              }))}
            />
          )}

          <div className="space-y-4">
            {(admin ? remote.data ?? [] : visibleClaim ? [visibleClaim] : []).map((c) => (
              <div
                key={c.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0a0c12] border border-white/10 hover:border-[#39FF14]/40 space-y-3.5 transition shadow-lg relative overflow-hidden group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {detailId ? (
                        <Link
                          className="text-sm font-semibold text-theme-accent hover:underline"
                          to={`/orders/${encodeURIComponent(`product:${c.orderId}`)}`}
                        >
                          Xem đơn #{c.orderId.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-xs font-mono font-bold text-white">ĐƠN #{c.orderId.substring(0, 10)}...</span>
                      )}
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

                {c.imageUrl && !admin && (
                  <figure className="space-y-2">
                    <figcaption className="text-sm font-medium text-theme-ink">Ảnh đính kèm</figcaption>
                    <a href={c.imageUrl} target="_blank" rel="noreferrer" className="inline-block rounded-lg" aria-label="Mở ảnh bảo hành gốc">
                      <img
                        src={c.imageUrl}
                        alt="Ảnh sự cố gửi kèm yêu cầu bảo hành"
                        loading="lazy"
                        className="max-h-56 max-w-full rounded-lg border border-border object-contain"
                      />
                    </a>
                  </figure>
                )}
                {c.imageUrl && admin && (
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
