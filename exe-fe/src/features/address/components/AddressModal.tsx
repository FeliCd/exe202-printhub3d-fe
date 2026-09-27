import { useState } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../context/AuthContext';
import { useRemote, useAction } from '../../../hooks/useRemote';
import { send } from '../../../services/api';
import { button, secondary, field, Notice, RemoteState } from '../../../components/DataUI';
import { emptyAddress, type ShippingAddress } from '../data';
interface Props { isOpen: boolean; onClose: () => void; onSelectAddress?: (address: ShippingAddress) => void }
export default function AddressModal(props: Props) { return props.isOpen ? <AddressBook {...props} /> : null; }
function AddressBook({ onClose, onSelectAddress }: Props) {
  const { isAuthenticated } = useAuth(); const remote = useRemote<ShippingAddress[]>(isAuthenticated ? '/addresses' : null); const action = useAction(remote.reload);
  const [form, setForm] = useState({ recipientName: '', phone: '', addressLine: '', province: '', isDefault: false });
  return <Modal open onClose={onClose} label="Địa chỉ giao hàng"><div className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-2xl bg-surface p-6 space-y-4">
    <h2 className="text-xl font-bold">Sổ địa chỉ</h2><Notice error={action.error} />
    {!isAuthenticated ? <p>Đăng nhập để quản lý địa chỉ giao hàng.</p> : <>
      <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload} />
      {remote.data?.map(a => <div key={a.id} className="p-3 border border-border rounded-xl space-y-2">
        <p>{a.recipientName} · {a.phone} {a.isDefault && '· Mặc định'}</p><p className="text-sm text-slate-400">{a.addressLine}, {a.province}</p>
        <div className="flex gap-2 flex-wrap"><button className={button} onClick={() => { onSelectAddress?.(a); onClose(); }}>Chọn giao tới đây</button>
          <button className={secondary} disabled={action.busy || a.isDefault} onClick={() => void action.run(() => send(`/addresses/${a.id}/default`, {}, 'put'))}>Đặt mặc định</button>
          <button className={secondary} disabled={action.busy} onClick={() => { if (confirm('Xóa địa chỉ này?')) void action.run(async () => { await send(`/addresses/${a.id}`, undefined, 'delete'); onSelectAddress?.(emptyAddress); }); }}>Xóa</button></div>
      </div>)}
      <form className="space-y-3 border-t border-border pt-4" onSubmit={async e => { e.preventDefault(); if (await action.run(() => send('/addresses', form))) setForm({ recipientName: '', phone: '', addressLine: '', province: '', isDefault: false }); }}>
        <h3 className="font-bold">Thêm địa chỉ</h3>
        {([['recipientName','Người nhận'],['phone','Số điện thoại'],['addressLine','Số nhà, đường, phường/xã'],['province','Tỉnh/thành phố']] as const).map(([key,label]) => <label key={key} className="block text-sm">{label}<input className={field} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />Địa chỉ mặc định</label><button className={button} disabled={action.busy}>Lưu địa chỉ</button>
      </form>
    </>}<button className={secondary} onClick={onClose}>Đóng</button>
  </div></Modal>;
}
