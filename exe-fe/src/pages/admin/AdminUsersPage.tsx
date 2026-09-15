import { useState } from 'react';
import { Users, Lock, Unlock, ShieldAlert, Search } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import type { UserRole } from '../../types';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  university?: string;
  walletBalance: number;
  isLocked: boolean;
  lockReason?: string;
  joinedDate: string;
}

const mockUsers: ManagedUser[] = [
  {
    id: 'USR-001',
    name: 'Nguyễn Văn Anh',
    email: 'vananh.student@hcmut.edu.vn',
    role: 'BUYER',
    studentId: '20210123',
    university: 'Đại Học Quốc Gia TP.HCM',
    walletBalance: 250000,
    isLocked: false,
    joinedDate: '2026-01-15',
  },
  {
    id: 'USR-002',
    name: 'BK-Makerlab Xưởng In 3D',
    email: 'factory.bkmaker@hcmut.edu.vn',
    role: 'FACTORY',
    walletBalance: 14850000,
    isLocked: false,
    joinedDate: '2025-11-10',
  },
  {
    id: 'USR-003',
    name: 'Lê Văn Cường',
    email: 'cuong.student@hust.edu.vn',
    role: 'BUYER',
    studentId: '20224590',
    university: 'ĐH Bách Khoa Hà Nội',
    walletBalance: 45000,
    isLocked: true,
    lockReason: 'Vi phạm chính sách: Tạo khiếu nại ảo đền bù thước gãy.',
    joinedDate: '2026-02-01',
  },
];

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<ManagedUser[]>(mockUsers);
  const [search, setSearch] = useState('');

  const toggleLock = (id: string) => {
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextState = !u.isLocked;
          return {
            ...u,
            isLocked: nextState,
            lockReason: nextState ? 'Khóa tài khoản bởi Admin quản trị.' : undefined,
          };
        }
        return u;
      })
    );
  };

  const changeRole = (id: string, newRole: UserRole) => {
    setUsersList(prev =>
      prev.map(u => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const filteredUsers = usersList.filter(
    u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Người Dùng &amp; Phân Quyền (User Management)</h1>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Xem toàn bộ tài khoản Sinh viên, Xưởng in đối tác. Phân quyền vai trò, khóa/mở khóa tài khoản và theo dõi số dư ví.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#94a3b8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên sinh viên, email, MSSV..."
            className="w-full bg-[#111215] border border-[#272930] rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-400"
          />
        </div>
        <span className="text-xs text-[#94a3b8]">Tổng số: <strong className="text-white">{filteredUsers.length} tài khoản</strong></span>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(u => (
          <div key={u.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-4">
            <div className="flex justify-between items-start border-b border-[#272930] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-sm uppercase">
                  {u.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    {u.name}
                    {u.isLocked && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                        ĐÃ KHÓA
                      </span>
                    )}
                  </h3>
                  <p className="text-[#94a3b8] text-[11px]">{u.email} • {u.university || 'Hệ thống'} {u.studentId ? `(${u.studentId})` : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#94a3b8] text-[11px]">Vai trò:</span>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                  className="bg-[#111215] border border-[#272930] rounded-lg px-2.5 py-1 text-xs text-purple-300 font-bold outline-none"
                >
                  <option value="BUYER">BUYER (Sinh viên)</option>
                  <option value="FACTORY">FACTORY (Xưởng In)</option>
                  <option value="ADMIN">ADMIN (Quản trị)</option>
                </select>
              </div>
            </div>

            {u.lockReason && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{u.lockReason}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-4 text-[#94a3b8] text-[11px]">
                <span>Số dư Ví PrintHub: <strong className="text-[#39FF14] font-mono">{formatPrice(u.walletBalance)}đ</strong></span>
                <span>Ngày tham gia: <strong className="text-white">{u.joinedDate}</strong></span>
              </div>

              <button
                onClick={() => toggleLock(u.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  u.isLocked
                    ? 'bg-emerald-950 text-[#39FF14] border border-emerald-800 hover:bg-emerald-900'
                    : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                }`}
              >
                {u.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {u.isLocked ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
