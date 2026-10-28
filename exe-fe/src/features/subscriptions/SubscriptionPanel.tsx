import { useState } from 'react';
import { Sparkles, Gift, Plus, Edit2, Ban, X, Check, Award } from 'lucide-react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { PageHeader, RemoteState, Notice } from '../../components/DataUI';
import Modal from '../../components/Modal';

interface Plan {
  id: string;
  name: string;
  price: number;
  benefits: string;
  requiredPoints: number;
  isActive: boolean;
  type: string;
}

interface Membership {
  points: number;
  subscriptions: { id?: string; subscriptionId?: string; name?: string; planName?: string; endDate: string }[];
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
}

const empty = { name: '', price: '0', benefits: '', requiredPoints: '100' };

export default function SubscriptionPanel({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<Plan[]>(admin ? '/admin/subscriptions' : '/subscriptions/plans');
  const membership = useRemote<Membership>(admin ? null : '/subscriptions/me');
  const users = useRemote<AdminUserItem[]>(admin ? '/admin/users' : null);

  const action = useAction(() => {
    remote.reload();
    membership.reload();
  });

  const [editing, setEditing] = useState('');
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [giftUser, setGiftUser] = useState('');

  // Lấy danh sách người dùng khách hàng (không phải ADMIN)
  const customerUsers = (users.data || []).filter(u => u.role !== 'ADMIN');

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      requiredPoints: Number(form.requiredPoints),
    };
    if (await action.run(() => send(`/admin/subscriptions/customer${editing ? '/' + editing : ''}`, payload, editing ? 'put' : 'post'))) {
      setOpen(false);
      remote.reload();
    }
  };

  const handleGiftPlan = async (plan: Plan) => {
    if (!giftUser) {
      alert('Vui lòng chọn người dùng nhận gói tặng ở khung phía trên trước khi tặng!');
      return;
    }
    const targetUser = customerUsers.find(u => u.id === giftUser);
    const userName = targetUser ? targetUser.name : 'người dùng đã chọn';

    if (!confirm(`Xác nhận tặng gói "${plan.name}" cho ${userName}?`)) return;

    await action.run(() =>
      send('/admin/subscriptions/gift', {
        userId: giftUser,
        planId: plan.id,
        reason: 'Tặng gói từ quản trị viên PrintHub',
      })
    );
    alert(`Đã tặng gói "${plan.name}" thành công!`);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={admin ? 'Quản Lý Hội Viên & Gói Subscriptions' : 'Hội Viên & Điểm Thưởng Tích Lũy'}
        description={
          admin
            ? 'Thiết lập quyền lợi giảm giá in 3D, ưu tiên gia công và tặng gói ưu đãi cho khách hàng.'
            : 'Đổi điểm thưởng tích lũy từ các đơn in 3D lấy gói hội viên VIP và voucher giảm giá.'
        }
        badge={admin ? 'Admin Panel' : `${membership.data?.points ?? 0} Điểm`}
        icon={Award}
      />
      <Notice error={action.error} />
      <Notice error={membership.error} />

      {/* Membership Card (User view) */}
      {membership.data && (
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-3 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff]" />
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Điểm tích lũy hiện có:{' '}
            <strong className="text-[#39FF14] text-xl font-mono font-black drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
              {membership.data.points.toLocaleString()}
            </strong>{' '}
            PrintHub Xu
          </p>
          <div className="space-y-1.5 pt-1">
            {membership.data.subscriptions.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">Bạn hiện chưa kích hoạt gói hội viên VIP nào.</p>
            ) : (
              membership.data.subscriptions.map((s, idx) => (
                <div key={s.subscriptionId || s.id || idx} className="flex items-center gap-2 text-xs font-semibold text-white font-mono">
                  <Sparkles className="w-4 h-4 text-[#39FF14]" />
                  <span>
                    {s.planName || s.name} · Hạn dùng đến: {new Date(s.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN CONTROLS: ĐƯA THÊM GÓI LÊN TRÊN, TÁCH CARD TẶNG GÓI RÕ RÀNG */}
      {/* ========================================================================= */}
      {admin && (
        <div className="space-y-4">
          {/* HÀNG 1: Nút thêm gói nằm trên cùng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0a0c12] border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                Cấu Hình Các Gói Khách Hàng VIP / Subscriptions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập quyền lợi giảm giá in 3D, ưu tiên gia công và điểm đổi gói
              </p>
            </div>

            <button
              onClick={() => {
                setOpen(true);
                setEditing('');
                setForm(empty);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs uppercase tracking-tight transition shadow-lg shadow-[#39FF14]/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gói Mới</span>
            </button>
          </div>

          {/* HÀNG 2: Khung tặng gói cho người dùng nằm ở dưới ô thêm gói */}
          <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00e5ff] font-mono">
              <Gift className="w-4 h-4 text-[#00e5ff]" />
              <span>Người Nhận Gói Quà Tặng (Sinh viên / Khách hàng)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <select
                  className="w-full bg-[#040508] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] font-mono transition cursor-pointer"
                  value={giftUser}
                  onChange={(e) => setGiftUser(e.target.value)}
                >
                  <option value="">-- Chọn tài khoản người dùng để tặng gói quà --</option>
                  {customerUsers.length === 0 ? (
                    <option value="" disabled>
                      {users.loading ? 'Đang tải người dùng...' : 'Không tìm thấy người dùng'}
                    </option>
                  ) : (
                    customerUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}){u.studentId ? ` - MSSV: ${u.studentId}` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {giftUser && (
                <span className="text-xs text-[#39FF14] font-semibold flex items-center gap-1 shrink-0 font-mono whitespace-nowrap">
                  <Check className="w-3.5 h-3.5" /> Đã chọn người nhận. Nhấn nút "Tặng gói" ở bên dưới.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Gói */}
      <Modal open={open} onClose={() => setOpen(false)} label={editing ? 'Chỉnh Sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}>
        <div className="w-full max-w-md bg-[#0a0c12] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-[#39FF14]" />
              {editing ? 'Chỉnh Sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#040508] transition cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 font-mono">Tên gói hội viên *</label>
              <input
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Gói Khách Hàng VIP Gold, Gói Hội Viên Pro..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 font-mono">Quyền lợi &amp; Ưu đãi *</label>
              <textarea
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition resize-none"
                required
                rows={3}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                placeholder="Giảm 15% cho mọi đơn in thước, miễn phí giao hàng KTX, ưu tiên máy in..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 font-mono">Số điểm thưởng để đổi gói (Points) *</label>
              <input
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                required
                type="number"
                min={1}
                value={form.requiredPoints}
                onChange={(e) => setForm({ ...form, requiredPoints: e.target.value })}
                placeholder="VD: 100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-[#040508] text-slate-300 text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="px-5 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 text-xs font-bold transition shadow-lg shadow-[#39FF14]/20 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                disabled={action.busy}
              >
                {action.busy ? 'Đang lưu...' : 'Lưu Gói'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Danh sách các gói Subscriptions */}
      <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remote.data?.map((p) => (
          <div
            key={p.id}
            className={`p-6 rounded-2xl bg-[#0a0c12] border transition-all space-y-4 shadow-xl relative overflow-hidden group ${
              p.isActive ? 'border-white/10 hover:border-[#39FF14]/50' : 'border-white/5 opacity-60'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff] opacity-80" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2 tracking-tight">
                  {p.name}
                  {!p.isActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#040508] border border-white/10 text-slate-500 whitespace-nowrap shrink-0">
                      Ngừng áp dụng
                    </span>
                  )}
                </h3>
                <span className="inline-block mt-1 font-mono font-bold text-sm text-[#39FF14]">
                  {p.requiredPoints || 0} điểm · 30 ngày sử dụng
                </span>
              </div>

              <span className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-[#040508] p-3.5 rounded-xl border border-white/5">
              {p.benefits}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
              {admin ? (
                <>
                  <button
                    className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#040508] hover:border-[#39FF14]/50 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
                    onClick={() => {
                      setEditing(p.id);
                      setForm({
                        name: p.name,
                        price: String(p.price),
                        benefits: p.benefits,
                        requiredPoints: String(p.requiredPoints || 0),
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#00e5ff]" /> Sửa
                  </button>

                  <button
                    className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#040508] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
                    disabled={action.busy || !p.isActive}
                    onClick={() => {
                      if (confirm(`Ngừng áp dụng gói "${p.name}"?`)) {
                        void action.run(() => send(`/admin/subscriptions/customer/${p.id}`, undefined, 'delete'));
                      }
                    }}
                  >
                    <Ban className="w-3.5 h-3.5" /> Ngừng áp dụng
                  </button>

                  <button
                    className="px-4 py-1.5 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                    disabled={action.busy || !p.isActive}
                    onClick={() => handleGiftPlan(p)}
                    title={!giftUser ? 'Vui lòng chọn người nhận ở khung trên trước' : undefined}
                  >
                    <Gift className="w-3.5 h-3.5" /> Tặng gói quà
                  </button>
                </>
              ) : (
                <button
                  className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 transition shadow-lg shadow-[#39FF14]/20 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  disabled={action.busy || !p.requiredPoints || (membership.data?.points || 0) < p.requiredPoints}
                  onClick={() => {
                    if (confirm(`Dùng ${p.requiredPoints} điểm để đổi gói ${p.name}?`)) {
                      void action.run(() => send(`/subscriptions/redeem/${p.id}`));
                    }
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Đổi điểm lấy gói
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
