import { useState, useEffect } from 'react';
import { MapPin, Plus, Check, Star, Trash2, X, Building, Phone, User } from 'lucide-react';
import { addressService } from '../../../services/addressService';

export interface ShippingAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  note?: string;
  isDefault: boolean;
}

const DEFAULT_ADDRESSES: ShippingAddress[] = [
  {
    id: 'addr-1',
    recipientName: 'Nguyễn Văn Anh',
    phone: '0987.654.321',
    addressLine: 'Phòng 402, KTX Khu B Đại Học Quốc Gia TP.HCM, Phường Đông Hòa, Dĩ An, Bình Dương',
    note: 'Giao giờ hành chính hoặc tối',
    isDefault: true,
  },
  {
    id: 'addr-2',
    recipientName: 'Nguyễn Văn Anh (Nhà Riêng)',
    phone: '0987.654.321',
    addressLine: 'Số 124/8 Đường Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
    note: 'Nhà riêng gần ĐH Bách Khoa',
    isDefault: false,
  },
];

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: ShippingAddress) => void;
}

export default function AddressModal({ isOpen, onClose, onSelectAddress }: AddressModalProps) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => {
    const saved = localStorage.getItem('printhub_shipping_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADDRESSES;
      }
    }
    return DEFAULT_ADDRESSES;
  });

  const [selectedId, setSelectedId] = useState<string>(() => {
    const def = addresses.find((a) => a.isDefault);
    return def ? def.id : addresses[0]?.id || 'addr-1';
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Thử gọi backend lấy danh sách địa chỉ nếu có (chỉ khi đã đăng nhập), lỗi thì fallback localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchBackendAddresses = async () => {
      try {
        const res = await addressService.getAddresses();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setAddresses(data);
        }
      } catch (error) {
        console.warn('Backend address API error, using local/mock addresses:', error);
      }
    };
    fetchBackendAddresses();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('printhub_shipping_addresses', JSON.stringify(addresses));
  }, [addresses]);

  if (!isOpen) return null;

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName.trim() || !newPhone.trim() || !newAddressLine.trim()) return;

    const newId = `addr-${Date.now()}`;
    const newAddr: ShippingAddress = {
      id: newId,
      recipientName: newRecipientName.trim(),
      phone: newPhone.trim(),
      addressLine: newAddressLine.trim(),
      note: newNote.trim(),
      isDefault: newIsDefault || addresses.length === 0,
    };

    try {
      await addressService.createAddress(newAddr);
    } catch (error) {
      console.warn('Backend createAddress error, saving to local storage:', error);
    }

    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);

    setAddresses(updated);
    setSelectedId(newId);

    // Reset form
    setNewRecipientName('');
    setNewPhone('');
    setNewAddressLine('');
    setNewNote('');
    setNewIsDefault(false);
    setShowAddForm(false);
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addressService.setDefaultAddress(id);
    } catch (error) {
      console.warn('Backend setDefaultAddress error, updating locally:', error);
    }
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 địa chỉ giao hàng!');
      return;
    }
    try {
      await addressService.deleteAddress(id);
    } catch (error) {
      console.warn('Backend deleteAddress error, deleting locally:', error);
    }
    const updated = addresses.filter((a) => a.id !== id);
    if (!updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    if (selectedId === id) {
      setSelectedId(updated[0].id);
    }
  };

  const handleConfirmSelect = () => {
    const chosen = addresses.find((a) => a.id === selectedId);
    if (chosen && onSelectAddress) {
      onSelectAddress(chosen);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18191d] border border-[#272930] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#272930] flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[#39FF14]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Sổ Địa Chỉ Giao Hàng KTX / Nhà Riêng</h3>
              <p className="text-[10px] text-[#94a3b8]">Lưu nhiều địa chỉ &amp; chọn mặc định tiện lợi</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1 rounded-lg" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address List Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {addresses.map((addr) => {
            const isSelected = selectedId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedId(addr.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer relative space-y-2 ${
                  isSelected
                    ? 'border-[#39FF14] bg-emerald-950/20 text-white'
                    : 'border-[#272930] bg-[#111215] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <input
                      type="radio"
                      name="shipping_addr"
                      checked={isSelected}
                      onChange={() => setSelectedId(addr.id)}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                    <span>{addr.recipientName}</span>
                    <span className="text-xs text-[#94a3b8] font-normal">({addr.phone})</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {addr.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#39FF14] text-slate-950 font-black text-[9px] uppercase tracking-wider">
                        MẶC ĐỊNH
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSetDefault(addr.id, e)}
                        className="px-2 py-0.5 rounded-full bg-[#18191d] border border-[#272930] hover:border-[#39FF14] text-slate-400 hover:text-[#39FF14] text-[9px] font-bold transition flex items-center gap-1"
                        title="Đặt làm mặc định"
                      >
                        <Star className="w-3 h-3" /> Đặt mặc định
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(addr.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 pl-6 leading-relaxed">
                  {addr.addressLine}
                </p>

                {addr.note && (
                  <p className="text-[10px] text-cyan-300 pl-6 italic">
                    Ghi chú: {addr.note}
                  </p>
                )}
              </div>
            );
          })}

          {/* Add New Address Toggle / Form */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-[#39FF14]/50 hover:border-[#39FF14] text-[#39FF14] font-bold text-xs flex items-center justify-center gap-2 bg-emerald-950/20 transition active:scale-98"
            >
              <Plus className="w-4 h-4" /> Thêm Địa Chỉ Giao Hàng Mới
            </button>
          ) : (
            <form onSubmit={handleAddNewAddress} className="p-4 rounded-2xl bg-[#111215] border border-cyan-800/60 space-y-3">
              <div className="flex items-center justify-between font-bold text-cyan-300 text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> Nhập Thông Tin Địa Chỉ Mới
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#39FF14]" /> Tên người nhận
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    placeholder="Nguyễn Văn Anh"
                    className="w-full bg-[#18191d] border border-[#272930] rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#39FF14]" /> Số điện thoại
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0987.654.321"
                    className="w-full bg-[#18191d] border border-[#272930] rounded-xl p-2 text-white font-mono outline-none focus:border-[#39FF14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#39FF14]" /> Địa chỉ chi tiết (KTX / Giảng đường / Nhà riêng)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  placeholder="Phòng 402, KTX Khu B ĐHQG TP.HCM, Phường Đông Hòa, Dĩ An..."
                  className="w-full bg-[#18191d] border border-[#272930] rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Ghi chú giao hàng (Không bắt buộc)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="VD: Giao sau 17h chiều hoặc gửi chú bảo vệ KTX"
                  className="w-full bg-[#18191d] border border-[#272930] rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_default"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="chk_default" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Đặt làm địa chỉ giao hàng mặc định
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl bg-[#18191d] text-slate-300 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#39FF14] text-slate-950 font-black text-xs uppercase"
                >
                  Lưu Địa Chỉ Mới
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#272930] bg-[#111215] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#18191d] hover:bg-[#272930] text-xs font-bold text-slate-300"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmSelect}
            className="flex-1 py-2.5 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Xác Nhận Chọn Địa Chỉ Này
          </button>
        </div>
      </div>
    </div>
  );
}
