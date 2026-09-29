import { useState, useEffect } from 'react';
import { Users, Lock, Unlock, ShieldAlert, Search, RotateCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  university?: string;
  isLocked: boolean;
  lockReason?: string;
  joinedDate: string;
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers();
      const rawData = res?.result || res?.data || res;
      if (Array.isArray(rawData)) {
        const mapped: ManagedUser[] = rawData.map((u: any) => ({
          id: String(u.id),
          name: u.name || 'Người dùng',
          email: u.email || 'Chưa cập nhật',
          role: u.role || 'USER',
          studentId: u.studentId,
          university: u.university,
          isLocked: Boolean(u.isLocked),
          lockReason: u.lockReason,
          joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo',
        }));
        setUsersList(mapped);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setError('Không thể kết nối máy chủ để tải danh sách người dùng thực tế.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleLock = async (id: string) => {
    const userToUpdate = usersList.find(u => u.id === id);
    const nextState = userToUpdate ? !userToUpdate.isLocked : true;
    const reason = nextState ? 'Khóa tài khoản bởi Admin quản trị.' : undefined;

    try {
      await adminService.toggleUserLock(id, nextState, reason);
    } catch (error) {
      console.warn('Backend toggleUserLock error:', error);
    }

    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          return {
            ...u,
            isLocked: nextState,
            lockReason: reason,
          };
        }
        return u;
      })
    );
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      await adminService.updateUserRole(id, newRole);
    } catch (error) {
      console.warn('Backend updateUserRole error:', error);
    }

    setUsersList(prev =>
      prev.map(u => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const filteredUsers = usersList.filter(
    u => u.name.toLowerCase().includes(search.toLowerCase()) ||
         u.email.toLowerCase().includes(search.toLowerCase()) ||
         (u.studentId && u.studentId.includes(search.trim()))
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Người Dùng &amp; Phân Quyền (User Management)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Xem toàn bộ tài khoản Sinh viên, Người dùng thật trong cơ sở dữ liệu. Phân quyền vai trò và khóa/mở khóa tài khoản.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-[#39FF14] text-slate-200 hover:text-[#39FF14] text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
          <span>{loading ? 'Đang tải...' : 'Tải lại danh sách'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            aria-label="Tìm tên sinh viên, email, MSSV..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên sinh viên, email, MSSV..."
            className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-400"
          />
        </div>
        <span className="text-xs text-text-muted">
          Tổng số: <strong className="text-white">{filteredUsers.length} tài khoản thật</strong>
        </span>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {loading && usersList.length === 0 && (
          <div className="p-8 text-center text-text-muted text-xs">
            Đang tải dữ liệu người dùng từ database...
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <p role="status" className="p-6 text-slate-300 text-xs text-center bg-surface rounded-2xl border border-border">
            Không tìm thấy tài khoản người dùng phù hợp.
          </p>
        )}

        {filteredUsers.map(u => (
          <div key={u.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-sm uppercase shrink-0">
                  {u.name ? u.name.substring(0, 2) : 'US'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    {u.name}
                    {u.isLocked && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-xs font-bold">
                        ĐÃ KHÓA
                      </span>
                    )}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    {u.email} • {u.university || 'Hệ thống PrintHub'} {u.studentId ? `(${u.studentId})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs">Vai trò:</span>
                <select
                  aria-label={`Vai trò của ${u.name}`}
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="bg-surface-inset border border-border rounded-lg px-2.5 py-1 text-xs text-purple-300 font-bold outline-none"
                >
                  <option value="USER">USER (Khách hàng / Sinh viên)</option>
                  <option value="BUYER">BUYER (Khách mua hàng)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
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
              <div className="flex items-center gap-4 text-text-muted text-xs">
                <span>Mã người dùng: <strong className="font-mono text-slate-300">{u.id}</strong></span>
                <span>• Ngày tham gia: <strong className="text-white">{u.joinedDate}</strong></span>
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
