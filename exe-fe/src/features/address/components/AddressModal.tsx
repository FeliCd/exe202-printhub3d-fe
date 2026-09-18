import Modal from '../../../components/Modal';
import { useState } from 'react';
import { MapPin, Plus, Check, Star, Trash2, X, Building, Phone, User } from 'lucide-react';

import { loadAddresses, type ShippingAddress } from '../data';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: ShippingAddress) => void;
}

export default function AddressModal({ isOpen, onClose, onSelectAddress }: AddressModalProps) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>(loadAddresses);
  const [storageError, setStorageError] = useState('');

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

  const saveAddresses = (next: ShippingAddress[]) => {
    setAddresses(next);
    try {
      localStorage.setItem('printhub_shipping_addresses', JSON.stringify(next));
      setStorageError('');
    } catch { setStorageError('Kh├┤ng thß╗â l╞░u ─æß╗ïa chß╗ë tr├¬n thiß║┐t bß╗ï. Thay ─æß╗òi chß╗ë d├╣ng trong phi├¬n n├áy.'); }
  };

  if (!isOpen) return null;

  const handleAddNewAddress = (e: React.FormEvent) => {
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

    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);

    saveAddresses(updated);
    setSelectedId(newId);

    // Reset form
    setNewRecipientName('');
    setNewPhone('');
    setNewAddressLine('');
    setNewNote('');
    setNewIsDefault(false);
    setShowAddForm(false);
  };

  const handleSetDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert('Bß║ín phß║úi giß╗» lß║íi ├¡t nhß║Ñt 1 ─æß╗ïa chß╗ë giao h├áng!');
      return;
    }
    if (!window.confirm('X├│a ─æß╗ïa chß╗ë giao h├áng n├áy?')) return;
    const updated = addresses.filter((a) => a.id !== id);
    if (!updated.some((a) => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true };
    }
    saveAddresses(updated);
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
    <Modal open={isOpen} onClose={onClose} label="Sß╗ò ─æß╗ïa chß╗ë giao h├áng">
      <div className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-inset">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[#39FF14]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Sß╗ò ─Éß╗ïa Chß╗ë Giao H├áng KTX / Nh├á Ri├¬ng</h3>
              <p className="text-sm text-text-muted">L╞░u nhiß╗üu ─æß╗ïa chß╗ë &amp; chß╗ìn mß║╖c ─æß╗ïnh tiß╗çn lß╗úi</p>
            </div>
          </div>
          <button aria-label="─É├│ng sß╗ò ─æß╗ïa chß╗ë" className="text-slate-400 hover:text-white p-1 rounded-lg" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {storageError && <p role="status" className="p-4 text-sm text-amber-300">{storageError}</p>}
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
                    : 'border-border bg-surface-inset text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-bold text-sm text-white">
                    <input
                      aria-label={`Giao ─æß║┐n ${addr.recipientName}, ${addr.addressLine}`}
                      type="radio"
                      name="shipping_addr"
                      checked={isSelected}
                      onChange={() => setSelectedId(addr.id)}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                    <span>{addr.recipientName}</span>
                    <span className="text-xs text-text-muted font-normal">({addr.phone})</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {addr.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#39FF14] text-slate-950 font-black text-xs uppercase tracking-wider">
                        Mß║╢C ─Éß╗èNH
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSetDefault(addr.id, e)}
                        className="px-2 py-0.5 rounded-full bg-surface border border-border hover:border-[#39FF14] text-slate-400 hover:text-[#39FF14] text-xs font-bold transition flex items-center gap-1"
                        title="─Éß║╖t l├ám mß║╖c ─æß╗ïnh"
                      >
                        <Star className="w-3 h-3" /> ─Éß║╖t mß║╖c ─æß╗ïnh
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(addr.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="X├│a ─æß╗ïa chß╗ë"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-200 pl-6 leading-relaxed">
                  {addr.addressLine}
                </p>

                {addr.note && (
                  <p className="text-sm text-cyan-300 pl-6 italic">
                    Ghi ch├║: {addr.note}
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
              <Plus className="w-4 h-4" /> Th├¬m ─Éß╗ïa Chß╗ë Giao H├áng Mß╗¢i
            </button>
          ) : (
            <form onSubmit={handleAddNewAddress} className="p-4 rounded-2xl bg-surface-inset border border-cyan-800/60 space-y-3">
              <div className="flex items-center justify-between font-bold text-cyan-300 text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> Nhß║¡p Th├┤ng Tin ─Éß╗ïa Chß╗ë Mß╗¢i
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="addressmodal-field-1" className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#39FF14]" /> T├¬n ng╞░ß╗¥i nhß║¡n
                  </label>
                  <input id="addressmodal-field-1"
                    type="text"
                    required
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    placeholder="Nguyß╗àn V─ân Anh"
                    className="w-full bg-surface border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="addressmodal-field-2" className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#39FF14]" /> Sß╗æ ─æiß╗çn thoß║íi
                  </label>
                  <input id="addressmodal-field-2"
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0987.654.321"
                    className="w-full bg-surface border border-border rounded-xl p-2 text-white font-mono outline-none focus:border-[#39FF14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="addressmodal-field-3" className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#39FF14]" /> ─Éß╗ïa chß╗ë chi tiß║┐t (KTX / Giß║úng ─æ╞░ß╗¥ng / Nh├á ri├¬ng)
                </label>
                <textarea id="addressmodal-field-3"
                  rows={2}
                  required
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  placeholder="Ph├▓ng 402, KTX Khu B ─ÉHQG TP.HCM, Ph╞░ß╗¥ng ─É├┤ng H├▓a, D─⌐ An..."
                  className="w-full bg-surface border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="addressmodal-field-4" className="text-xs font-bold text-slate-400">Ghi ch├║ giao h├áng (Kh├┤ng bß║»t buß╗Öc)</label>
                <input id="addressmodal-field-4"
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="VD: Giao sau 17h chiß╗üu hoß║╖c gß╗¡i ch├║ bß║úo vß╗ç KTX"
                  className="w-full bg-surface border border-border rounded-xl p-2 text-white outline-none focus:border-[#39FF14]"
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
                  ─Éß║╖t l├ám ─æß╗ïa chß╗ë giao h├áng mß║╖c ─æß╗ïnh
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl bg-surface text-slate-300 font-bold text-xs"
                >
                  Hß╗ºy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#39FF14] text-slate-950 font-black text-xs uppercase"
                >
                  L╞░u ─Éß╗ïa Chß╗ë Mß╗¢i
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-inset flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-[#272930] text-xs font-bold text-slate-300"
          >
            ─É├│ng
          </button>
          <button
            type="button"
            onClick={handleConfirmSelect}
            className="flex-1 py-2.5 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> X├íc Nhß║¡n Chß╗ìn ─Éß╗ïa Chß╗ë N├áy
          </button>
        </div>
      </div>
    </Modal>
  );
}