import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Check,
  Building,
  User as UserIcon,
  Phone,
  Sparkles,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../context/AuthContext';
import { useRemote, useAction } from '../../../hooks/useRemote';
import { send } from '../../../services/api';
import { VIETNAM_DIVISIONS, type Province } from '../data/vietnamProvinces';
import type { ShippingAddress } from '../data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: ShippingAddress) => void;
}

export default function AddressModal(props: Props) {
  return props.isOpen ? <AddressBookModalContent {...props} /> : null;
}

function AddressBookModalContent({ onClose, onSelectAddress }: Props) {
  const { user, isAuthenticated } = useAuth();
  const remote = useRemote<ShippingAddress[]>(isAuthenticated ? '/addresses' : null);
  const action = useAction(remote.reload);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedProvinceName, setSelectedProvinceName] = useState('TP. Hồ Chí Minh');
  const [selectedDistrictName, setSelectedDistrictName] = useState('TP. Thủ Đức');
  const [selectedWardName, setSelectedWardName] = useState('Phường Linh Trung');
  const [streetDetail, setStreetDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const nameId = useId();
  const phoneId = useId();
  const provinceId = useId();
  const districtId = useId();
  const wardId = useId();
  const streetId = useId();
  const defaultCheckId = useId();

  const selectedProvince: Province | undefined = VIETNAM_DIVISIONS.find(
    (p) => p.name === selectedProvinceName
  );
  const availableDistricts = selectedProvince?.districts || [];
  const selectedDistrict = availableDistricts.find((d) => d.name === selectedDistrictName);
  const availableWards = selectedDistrict?.wards || [];

  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvinceName(provinceName);
    const prov = VIETNAM_DIVISIONS.find((p) => p.name === provinceName);
    if (prov && prov.districts.length > 0) {
      setSelectedDistrictName(prov.districts[0].name);
      if (prov.districts[0].wards.length > 0) {
        setSelectedWardName(prov.districts[0].wards[0]);
      } else {
        setSelectedWardName('');
      }
    } else {
      setSelectedDistrictName('');
      setSelectedWardName('');
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrictName(districtName);
    const dist = availableDistricts.find((d) => d.name === districtName);
    if (dist && dist.wards.length > 0) {
      setSelectedWardName(dist.wards[0]);
    } else {
      setSelectedWardName('');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !streetDetail.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ chi tiết.');
      return;
    }

    setErrorMsg('');
    const fullAddressLine = [streetDetail.trim(), selectedWardName, selectedDistrictName]
      .filter(Boolean)
      .join(', ');

    const payload = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine: fullAddressLine,
      province: selectedProvinceName,
      isDefault,
    };

    const success = await action.run(async () => {
      const created = await send<ShippingAddress>('/addresses', payload);
      if (created && onSelectAddress) {
        onSelectAddress(created);
      }
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} label="Địa chỉ giao hàng">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#0f0f12] border border-border p-6 space-y-5 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[#39FF14]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Sổ Địa Chỉ Nhận Hàng</h2>
              <p className="text-[11px] text-text-muted">Chọn hoặc thêm địa chỉ giao hàng cho giỏ hàng</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/addresses"
              onClick={onClose}
              className="text-[11px] text-text-muted hover:text-[#39FF14] flex items-center gap-1 transition"
              title="Mở toàn màn hình sổ địa chỉ"
            >
              <span>Trang sổ địa chỉ</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="p-6 text-center text-text-muted space-y-2">
            <p>Vui lòng đăng nhập để lưu và chọn địa chỉ nhận hàng.</p>
            <Link
              to="/login"
              onClick={onClose}
              className="inline-block py-2 px-4 rounded-xl bg-primary text-slate-950 font-bold text-xs"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            {/* Danh sách địa chỉ đã lưu */}
            {!isAddingNew && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    Địa chỉ đã lưu ({remote.data?.length || 0}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="py-1.5 px-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                  </button>
                </div>

                {remote.loading && (
                  <div className="p-6 text-center text-text-muted flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#39FF14]" />
                    <span>Đang tải danh sách địa chỉ...</span>
                  </div>
                )}

                {!remote.loading && (!remote.data || remote.data.length === 0) && (
                  <div className="p-6 rounded-xl bg-surface border border-dashed border-border text-center text-text-muted space-y-2">
                    <p>Chưa có địa chỉ nào được lưu.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="text-xs text-[#39FF14] hover:underline font-bold"
                    >
                      Bấm vào đây để thêm địa chỉ giao hàng đầu tiên &rarr;
                    </button>
                  </div>
                )}

                <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {remote.data?.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        a.isDefault
                          ? 'border-[#39FF14]/60 bg-primary/2'
                          : 'border-border/80 hover:border-border bg-surface'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{a.recipientName}</span>
                          <span className="text-slate-400 font-mono">({a.phone})</span>
                          {a.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/12 text-[#39FF14] border border-[#39FF14]/40">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300">
                          {a.addressLine}, <strong className="text-white">{a.province}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectAddress?.(a);
                          onClose();
                        }}
                        className="py-2 px-3.5 rounded-xl bg-surface-raised hover:bg-surface-inset border border-border hover:border-[#39FF14] text-white hover:text-[#39FF14] font-bold text-xs whitespace-nowrap transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#39FF14]" /> Chọn giao tới đây
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Thêm địa chỉ mới với CASCADING SELECT 63 TỈNH THÀNH */}
            {isAddingNew && (
              <form onSubmit={handleCreateAddress} className="space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#39FF14]" /> Nhập địa chỉ mới (Phân cấp chuẩn)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-[11px] text-text-muted hover:text-white"
                  >
                    Quay lại danh sách
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-rose-400 text-[11px] font-semibold">{errorMsg}</p>
                )}

                {/* Họ tên & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor={nameId} className="font-bold text-slate-300 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-[#39FF14]" /> Người nhận *
                    </label>
                    <input
                      id={nameId}
                      required
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={phoneId} className="font-bold text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#39FF14]" /> Số điện thoại *
                    </label>
                    <input
                      id={phoneId}
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#39FF14]"
                    />
                  </div>
                </div>

                {/* Phân cấp Tỉnh / Quận / Phường (Tracking Cascading Select) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor={provinceId} className="font-bold text-slate-300">
                      Tỉnh / Thành phố *
                    </label>
                    <select
                      id={provinceId}
                      value={selectedProvinceName}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-surface-inset border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14] cursor-pointer"
                    >
                      {VIETNAM_DIVISIONS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={districtId} className="font-bold text-slate-300">
                      Quận / Huyện *
                    </label>
                    <select
                      id={districtId}
                      value={selectedDistrictName}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-surface-inset border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14] cursor-pointer"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={wardId} className="font-bold text-slate-300">
                      Phường / Xã *
                    </label>
                    <select
                      id={wardId}
                      value={selectedWardName}
                      onChange={(e) => setSelectedWardName(e.target.value)}
                      className="w-full bg-surface-inset border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14] cursor-pointer"
                    >
                      {availableWards.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Số nhà, KTX */}
                <div className="space-y-1">
                  <label htmlFor={streetId} className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Số nhà, tên đường, phòng/tòa KTX *</span>
                    <span className="text-[10px] text-[#39FF14]">Ví dụ: KTX Khu B, Tòa B3</span>
                  </label>
                  <input
                    id={streetId}
                    required
                    type="text"
                    value={streetDetail}
                    onChange={(e) => setStreetDetail(e.target.value)}
                    placeholder="Phòng 402, Tòa B3 KTX Khu B ĐHQG..."
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none focus:border-[#39FF14]"
                  />
                </div>

                {/* Ghép nối xem trước */}
                <div className="p-2.5 rounded-xl bg-surface-inset/80 border border-border/80 text-[11px] text-slate-300 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#39FF14] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Xem trước: </span>
                    <span>
                      {streetDetail.trim() ? streetDetail.trim() + ', ' : ''}
                      {selectedWardName ? selectedWardName + ', ' : ''}
                      {selectedDistrictName ? selectedDistrictName + ', ' : ''}
                      <strong className="text-[#39FF14]">{selectedProvinceName}</strong>
                    </span>
                  </div>
                </div>

                {/* Checkbox mặc định */}
                <label htmlFor={defaultCheckId} className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                  <input
                    id={defaultCheckId}
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-border text-[#39FF14] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Đặt làm địa chỉ nhận hàng mặc định</span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="py-2 px-3.5 rounded-xl border border-border hover:bg-surface-inset text-slate-300 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={action.busy}
                    className="py-2 px-5 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold flex items-center gap-1.5 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                  >
                    {action.busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Lưu &amp; Chọn Giao Tới Đây
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
