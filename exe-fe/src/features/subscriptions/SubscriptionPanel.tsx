import { useState } from 'react';
import { Sparkles, Gift, Plus, Edit2, Ban, X, Check } from 'lucide-react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send } from '../../services/api';
import { Panel, RemoteState, Notice, button, secondary, field } from '../../components/DataUI';

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
  subscriptions: { id: string; name: string; endDate: string }[];
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
    <Panel title={admin ? 'Quản lý hội viên & Gói Subscriptions (Admin)' : 'Hội viên và điểm thưởng'}>
      <Notice error={action.error} />
      <Notice error={membership.error} />

      {/* Membership Card (User view) */}
      {membership.data && (
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
          <p className="text-sm text-text-muted">
            Điểm tích lũy hiện có:{' '}
            <strong className="text-[#39FF14] text-lg font-mono">{membership.data.points}</strong> điểm
          </p>
          <div className="space-y-1">
            {membership.data.subscriptions.length === 0 ? (
              <p className="text-xs text-text-muted">Bạn chưa kích hoạt gói hội viên nào.</p>
            ) : (
              membership.data.subscriptions.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>
                    {s.name} · Hạn dùng đến: {new Date(s.endDate).toLocaleDateString('vi-VN')}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Cấu Hình Các Gói Khách Hàng VIP / Subscriptions
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Thiết lập quyền lợi giảm giá in 3D, ưu tiên gia công và điểm đổi gói
              </p>
            </div>

            <button
              onClick={() => {
                setOpen(true);
                setEditing('');
                setForm(empty);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-purple-900/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gói Mới</span>
            </button>
          </div>

          {/* HÀNG 2: Khung tặng gói cho người dùng nằm ở dưới ô thêm gói */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Người Nhận Gói Quà Tặng (Sinh viên / Khách hàng)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <select
                  className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-400 transition"
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
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" /> Đã chọn người nhận. Nhấn nút "Tặng gói" ở bên dưới.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Gói */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {editing ? 'Chỉnh Sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Tên gói hội viên *</label>
                <input
                  className={field}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Gói Khách Hàng VIP Gold, Gói Hội Viên Pro..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Quyền lợi &amp; Ưu đãi *</label>
                <textarea
                  className={field}
                  required
                  rows={3}
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  placeholder="Giảm 15% cho mọi đơn in thước, miễn phí giao hàng KTX, ưu tiên máy in..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Số điểm thưởng để đổi gói (Points) *</label>
                <input
                  className={field}
                  required
                  type="number"
                  min={1}
                  value={form.requiredPoints}
                  onChange={(e) => setForm({ ...form, requiredPoints: e.target.value })}
                  placeholder="VD: 100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button type="button" className={secondary} onClick={() => setOpen(false)}>
                  Hủy bỏ
                </button>
                <button className={button} disabled={action.busy}>
                  {action.busy ? 'Đang lưu...' : 'Lưu Gói'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách các gói Subscriptions */}
      <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remote.data?.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl bg-surface border transition-all space-y-4 ${
              p.isActive ? 'border-border hover:border-purple-500/50 shadow-md' : 'border-border/40 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  {p.name}
                  {!p.isActive && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400">
                      Ngừng áp dụng
                    </span>
                  )}
                </h3>
                <span className="inline-block mt-1 font-mono font-bold text-sm text-[#39FF14]">
                  {p.requiredPoints || 0} điểm · 30 ngày sử dụng
                </span>
              </div>

              <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line bg-surface-inset p-3 rounded-xl border border-border/50">
              {p.benefits}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
              {admin ? (
                <>
                  <button
                    className={`${secondary} flex items-center gap-1.5`}
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
                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                  </button>

                  <button
                    className={`${secondary} text-slate-400 hover:text-red-400 flex items-center gap-1.5`}
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
                    className={`${button} flex items-center gap-1.5`}
                    disabled={action.busy || !p.isActive}
                    onClick={() => handleGiftPlan(p)}
                    title={!giftUser ? 'Vui lòng chọn người nhận ở khung trên trước' : undefined}
                  >
                    <Gift className="w-3.5 h-3.5" /> Tặng gói quà
                  </button>
                </>
              ) : (
                <button
                  className={`${button} flex items-center gap-1.5`}
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
    </Panel>
  );
}
