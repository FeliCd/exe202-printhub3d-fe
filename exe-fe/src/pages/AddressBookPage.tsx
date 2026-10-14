import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  Building,
  Phone,
  User as UserIcon,
  Home,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRemote, useAction } from '../hooks/useRemote';
import { send } from '../services/api';
import { VIETNAM_DIVISIONS, type Province } from '../features/address/data/vietnamProvinces';
import type { ShippingAddress } from '../features/address/data';
import { PageHeader, Notice } from '../components/DataUI';

export default function AddressBookPage() {
  const { user } = useAuth();
  const remote = useRemote<ShippingAddress[]>(user ? '/addresses' : null);
  const action = useAction(remote.reload);

  const [isAdding, setIsAdding] = useState(false);
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedProvinceName, setSelectedProvinceName] = useState('TP. Hồ Chí Minh');
  const [selectedDistrictName, setSelectedDistrictName] = useState('TP. Thủ Đức');
  const [selectedWardName, setSelectedWardName] = useState('Phường Linh Trung');
  const [streetDetail, setStreetDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recipientNameId = useId();
  const phoneId = useId();
  const provinceId = useId();
  const districtId = useId();
  const wardId = useId();
  const streetDetailId = useId();
  const defaultAddressId = useId();

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
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ chi tiết.');
      return;
    }

    setErrorMessage('');
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

    const success = await action.run(() => send('/addresses', payload));
    if (success) {
      setSuccessMessage('Đã thêm địa chỉ giao nhận hàng mới thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setStreetDetail('');
      setIsDefault(false);
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const success = await action.run(() => send(`/addresses/${id}/default`, {}, 'put'));
    if (success) {
      setSuccessMessage('Đã đặt làm địa chỉ giao hàng mặc định.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này khỏi danh bạ?')) return;
    const success = await action.run(() => send(`/addresses/${id}`, undefined, 'delete'));
    if (success) {
      setSuccessMessage('Đã xóa địa chỉ thành công.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-[-12px]">
        <Link to="/profile" className="hover:text-primary transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Trang cá nhân
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">Sổ địa chỉ</span>
      </div>

      <PageHeader
        title="Sổ Địa Chỉ Giao Nhận Hàng"
        description="Quản lý các địa chỉ nhận hàng KTX, nhà riêng và văn phòng của bạn trên toàn quốc."
        icon={MapPin}
        badge={`${remote.data?.length || 0} địa chỉ`}
        actions={
          !isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="py-2.5 px-4 rounded-xl bg-primary hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Địa Chỉ Mới
            </button>
          ) : undefined
        }
      />

      <Notice error={errorMessage || action.error} success={successMessage} />

      {/* Form thêm địa chỉ mới */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-surface border border-[#39FF14]/40 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building className="w-4 h-4 text-[#39FF14]" />
              <span>Thêm Địa Chỉ Nhận Hàng Mới</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-text-muted hover:text-white transition px-2 py-1 rounded-lg hover:bg-surface-inset"
            >
              Đóng form
            </button>
          </div>

          <form onSubmit={handleCreateAddress} className="space-y-4">
            {/* Người nhận & SĐT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor={recipientNameId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#39FF14]" /> Họ và tên người nhận <span className="text-rose-400">*</span>
                </label>
                <input
                  id={recipientNameId}
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={phoneId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#39FF14]" /> Số điện thoại nhận hàng <span className="text-rose-400">*</span>
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
                />
              </div>
            </div>

            {/* Phân cấp Tỉnh / Quận / Phường */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Tỉnh / Thành phố */}
              <div className="space-y-1">
                <label htmlFor={provinceId} className="text-xs font-bold text-slate-300">
                  1. Tỉnh / Thành phố <span className="text-rose-400">*</span>
                </label>
                <select
                  id={provinceId}
                  value={selectedProvinceName}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] cursor-pointer"
                >
                  {VIETNAM_DIVISIONS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div className="space-y-1">
                <label htmlFor={districtId} className="text-xs font-bold text-slate-300">
                  2. Quận / Huyện / Thị xã <span className="text-rose-400">*</span>
                </label>
                <select
                  id={districtId}
                  value={selectedDistrictName}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] cursor-pointer"
                >
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phường / Xã */}
              <div className="space-y-1">
                <label htmlFor={wardId} className="text-xs font-bold text-slate-300">
                  3. Phường / Xã / Thị trấn <span className="text-rose-400">*</span>
                </label>
                <select
                  id={wardId}
                  value={selectedWardName}
                  onChange={(e) => setSelectedWardName(e.target.value)}
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] cursor-pointer"
                >
                  {availableWards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chi tiết số nhà / tên đường / KTX */}
            <div className="space-y-1">
              <label htmlFor={streetDetailId} className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Số nhà, Tên đường, Tòa KTX / Phòng <span className="text-rose-400">*</span></span>
                <span className="text-[11px] text-[#39FF14] font-normal">Ghi rõ số phòng nếu ở KTX</span>
              </label>
              <input
                id={streetDetailId}
                type="text"
                required
                value={streetDetail}
                onChange={(e) => setStreetDetail(e.target.value)}
                placeholder="Ví dụ: Phòng 402, Tòa B3 KTX Khu B ĐHQG hoặc Số 123 Đường Nguyễn Tri Phương"
                className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14]"
              />
            </div>

            {/* Xem trước địa chỉ ghép nối */}
            <div className="p-3 rounded-xl bg-surface-inset/60 border border-border/80 text-xs text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Địa chỉ hoàn chỉnh: </span>
                <span>
                  {streetDetail.trim() ? streetDetail.trim() + ', ' : '... , '}
                  {selectedWardName ? selectedWardName + ', ' : ''}
                  {selectedDistrictName ? selectedDistrictName + ', ' : ''}
                  <strong className="text-[#39FF14]">{selectedProvinceName}</strong>
                </span>
              </div>
            </div>

            {/* Chọn làm mặc định */}
            <label htmlFor={defaultAddressId} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer pt-1">
              <input
                id={defaultAddressId}
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border text-[#39FF14] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Đặt làm địa chỉ nhận hàng mặc định cho các đơn in 3D</span>
            </label>

            {/* Cụm nút bấm */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-2.5 px-4 rounded-xl border border-border hover:bg-surface-inset text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={action.busy}
                className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
              >
                {action.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Lưu Địa Chỉ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách các địa chỉ hiện có */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>DANH SÁCH ĐỊA CHỈ ĐÃ LƯU ({remote.data?.length || 0})</span>
        </div>

        {remote.loading && (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
            <p className="text-xs">Đang tải danh sách địa chỉ...</p>
          </div>
        )}

        {!remote.loading && (!remote.data || remote.data.length === 0) && (
          <div className="p-12 rounded-2xl bg-surface border border-border text-center text-text-muted space-y-3">
            <Home className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
            <p className="text-xs max-w-md mx-auto">
              Thêm địa chỉ KTX hoặc nhà riêng để hệ thống tự động điền khi bạn đặt in 3D và custom thước.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" /> Thêm Địa Chỉ Đầu Tiên
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remote.data?.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl bg-surface border transition shadow-sm space-y-3 flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-[#39FF14]/60 bg-gradient-to-br from-surface to-primary/10 shadow-primary/20'
                  : 'border-border/80 hover:border-border'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/12 text-[#39FF14] border border-[#39FF14]/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Mặc định
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">{addr.phone}</span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed flex items-start gap-2 pt-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{addr.addressLine}</p>
                    <p className="text-text-muted mt-0.5">{addr.province}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                <div>
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      disabled={action.busy}
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-primary hover:text-[#39FF14] font-semibold transition cursor-pointer"
                    >
                      Đặt làm mặc định
                    </button>
                  ) : (
                    <span className="text-[11px] text-text-muted">Địa chỉ nhận hàng chính</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={action.busy}
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Xóa địa chỉ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
