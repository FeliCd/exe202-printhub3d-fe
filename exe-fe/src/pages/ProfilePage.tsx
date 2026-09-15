import { useState } from 'react';
import { User, Lock, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, setPasscode } = useAuth();

  const [name, setName] = useState(user?.name || 'Nguyễn Văn Anh');
  const [phone, setPhone] = useState(user?.phone || '0987.654.321');
  const [studentId, setStudentId] = useState(user?.studentId || '20210123');
  const [university, setUniversity] = useState(user?.university || 'Đại Học Quốc Gia TP.HCM');

  const [newPin, setNewPin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, studentId, university });
    if (newPin.length === 6) {
      setPasscode(newPin);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-[#22c55e]">
          <User className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Trang Cá Nhân &amp; Sổ Địa Chỉ</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Cập nhật thông tin sinh viên, cài đặt mã Passcode PIN và địa chỉ KTX nhận hàng</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> Đã cập nhật thành công thông tin tài khoản &amp; Mã Passcode!
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Info Card */}
        <div className="p-6 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center font-black text-2xl text-white uppercase mx-auto shadow-xl">
            {name.substring(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{name}</h3>
            <p className="text-xs text-[#22c55e] font-semibold mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              Xác thực B2C Sinh Viên
            </span>
          </div>
        </div>

        {/* Right Form Fields */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Thông Tin Cá Nhân &amp; Bảo Mật Passcode</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Mã số sinh viên (MSSV)</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Trường ĐH / Học viện</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#272930] space-y-2">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#22c55e]" /> Đổi Mã Passcode PIN 6 Số Cho Ví PrintHub
            </label>
            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Nhập 6 số mới (Ví dụ: 123456)"
              className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu Thay Đổi Thông Tin
          </button>
        </div>
      </form>
    </div>
  );
}
