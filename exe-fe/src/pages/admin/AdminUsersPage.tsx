import { useState, useEffect } from 'react';
import { Users, Lock, Unlock, Search, RotateCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/DataUI';

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
          role: u.role === 'ADMIN' ? 'ADMIN' : 'BUYER',
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
      <PageHeader
        title="Quản Lý Người Dùng & Phân Quyền"
        description="Xem toàn bộ tài khoản Sinh viên, Người dùng thật trong cơ sở dữ liệu. Phân quyền vai trò và khóa/mở khóa tài khoản."
        badge={`${filteredUsers.length} tài khoản`}
        icon={Users}
        actions={
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-primary text-slate-200 hover:text-primary text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            aria-label="Tìm tên sinh viên, email, MSSV..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc MSSV..."
            className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-primary transition"
          />
        </div>
        <span className="text-xs text-text-muted">
          Tổng số: <strong className="text-white font-mono">{filteredUsers.length}</strong> tài khoản
        </span>
      </div>

      {loading && usersList.length === 0 && (
        <div className="p-10 text-center text-text-muted text-xs bg-surface rounded-2xl border border-border">
          <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
          Đang tải dữ liệu người dùng từ database...
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <p role="status" className="p-8 text-slate-300 text-xs text-center bg-surface rounded-2xl border border-border">
          Không tìm thấy tài khoản người dùng phù hợp với từ khóa tìm kiếm.
        </p>
      )}

      {filteredUsers.length > 0 && (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-surface-inset text-slate-400 uppercase tracking-wider border-b border-border text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Người Dùng</th>
                    <th className="px-4 py-3.5 font-bold">Email & Học Viện</th>
                    <th className="px-4 py-3.5 font-bold">Vai Trò</th>
                    <th className="px-4 py-3.5 font-bold">Trạng Thái</th>
                    <th className="px-4 py-3.5 font-bold">Ngày Tạo</th>
                    <th className="px-4 py-3.5 font-bold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-inset/50 transition">
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-xs uppercase shrink-0">
                            {u.name ? u.name.substring(0, 2) : 'US'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isLocked && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                                  KHÓA
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {u.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Email & School */}
                      <td className="px-4 py-3.5">
                        <p className="text-white font-medium">{u.email}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {u.university || 'PrintHub'} {u.studentId ? `· MSSV: ${u.studentId}` : ''}
                        </p>
                      </td>

                      {/* Role Selector */}
                      <td className="px-4 py-3.5">
                        <select
                          aria-label={`Vai trò của ${u.name}`}
                          value={u.role === 'ADMIN' ? 'ADMIN' : 'BUYER'}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="bg-surface-inset border border-border rounded-lg px-2.5 py-1 text-xs text-primary font-bold outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="BUYER">BUYER (Khách mua)</option>
                          <option value="ADMIN">ADMIN (Quản trị)</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/60 border border-red-500/40 text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/40 text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Hoạt động
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                        {u.joinedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleLock(u.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                            u.isLocked
                              ? 'bg-emerald-950/80 text-primary border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-red-950/80 text-red-400 border border-red-800 hover:bg-red-900'
                          }`}
                        >
                          {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.isLocked ? 'Mở Khóa' : 'Khóa'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-surface border border-border text-xs space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                      {u.name ? u.name.substring(0, 2) : 'US'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.name}</h4>
                      <p className="text-slate-400 text-[11px]">{u.email}</p>
                    </div>
                  </div>
                  {u.isLocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                      ĐÃ KHÓA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                      HOẠT ĐỘNG
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-inset p-2.5 rounded-xl border border-border/50">
                  <div>
                    <span className="text-slate-400 block">Trường / MSSV:</span>
                    <span className="text-white font-medium">
                      {u.university || 'PrintHub'} {u.studentId ? `(${u.studentId})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ngày tạo:</span>
                    <span className="text-white font-mono">{u.joinedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Vai trò:</span>
                    <select
                      aria-label={`Vai trò của ${u.name}`}
                      value={u.role === 'ADMIN' ? 'ADMIN' : 'BUYER'}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="bg-surface-inset border border-border rounded-lg px-2 py-1 text-xs text-primary font-bold outline-none"
                    >
                      <option value="BUYER">BUYER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <button
                    onClick={() => toggleLock(u.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                      u.isLocked
                        ? 'bg-emerald-950 text-primary border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{u.isLocked ? 'Mở Khóa' : 'Khóa'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
