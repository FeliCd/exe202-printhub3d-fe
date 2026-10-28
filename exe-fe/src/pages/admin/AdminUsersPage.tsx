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
        title="QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN HỆ THỐNG"
        description="Quản trị cơ sở dữ liệu người dùng, tài khoản sinh viên kỹ thuật CAD, phân cấp vai trò quản trị (RBAC) và kiểm soát truy cập."
        badge={`${filteredUsers.length} tài khoản`}
        icon={Users}
        actions={
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
            <span>{loading ? 'ĐANG TẢI...' : 'LÀM MỚI'}</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono font-medium">
          {error}
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#1e2433] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            aria-label="Tìm tên sinh viên, email, MSSV..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, trường hoặc MSSV..."
            className="w-full bg-[#040508] border border-[#1e2433] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition font-mono"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          TỔNG SỐ: <strong className="text-[#39FF14] font-mono">{filteredUsers.length}</strong> TÀI KHOẢN
        </span>
      </div>

      {loading && usersList.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-xs font-mono bg-[#0a0c12] rounded-2xl border border-[#1e2433] space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" />
          <p>ĐANG TRUY VẤN DỮ LIỆU NGƯỜI DÙNG TỪ DATABASE...</p>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div role="status" className="p-10 text-slate-400 text-xs text-center bg-[#0a0c12] rounded-2xl border border-[#1e2433] font-mono">
          Không tìm thấy tài khoản người dùng phù hợp với bộ lọc tìm kiếm.
        </div>
      )}

      {filteredUsers.length > 0 && (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block rounded-2xl border border-[#1e2433] bg-[#0a0c12] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#040508] text-slate-400 uppercase tracking-wider border-b border-[#1e2433] text-[11px] font-mono">
                  <tr>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">NGƯỜI DÙNG</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">EMAIL &amp; HỌC VIỆN</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">VAI TRÒ</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">TRẠNG THÁI</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">NGÀY TẠO</th>
                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap shrink-0">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2433]/70">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#11141e]/60 transition">
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] font-black font-mono text-xs uppercase shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
                            {u.name ? u.name.substring(0, 2) : 'US'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isLocked && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800 whitespace-nowrap shrink-0">
                                  KHÓA
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#00e5ff] font-mono">UID: #{u.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email & School */}
                      <td className="px-4 py-3.5">
                        <p className="text-white font-medium">{u.email}</p>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                          {u.university || 'PrintHub3D'} {u.studentId ? `· MSSV: ${u.studentId}` : ''}
                        </p>
                      </td>

                      {/* Role Selector */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        <select
                          aria-label={`Vai trò của ${u.name}`}
                          value={u.role === 'ADMIN' ? 'ADMIN' : 'BUYER'}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="bg-[#040508] border border-[#1e2433] rounded-lg px-2.5 py-1 text-xs text-[#39FF14] font-mono font-bold outline-none focus:border-[#39FF14] cursor-pointer"
                        >
                          <option value="BUYER" className="bg-[#0a0c12] text-white">BUYER (Khách mua)</option>
                          <option value="ADMIN" className="bg-[#0a0c12] text-white">ADMIN (Quản trị)</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        {u.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-400 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            ĐÃ KHÓA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                            HOẠT ĐỘNG
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap shrink-0">
                        {u.joinedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap shrink-0">
                        <button
                          onClick={() => toggleLock(u.id)}
                          className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                            u.isLocked
                              ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 hover:bg-[#39FF14]/25 shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.isLocked ? 'MỞ KHÓA' : 'KHÓA'}</span>
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
              <div key={u.id} className="p-4 rounded-2xl bg-[#0a0c12] border border-[#1e2433] text-xs space-y-3 shadow-xl">
                <div className="flex items-start justify-between gap-2 border-b border-[#1e2433] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] font-bold font-mono text-xs uppercase shrink-0">
                      {u.name ? u.name.substring(0, 2) : 'US'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.name}</h4>
                      <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                    </div>
                  </div>
                  {u.isLocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800 whitespace-nowrap shrink-0">
                      ĐÃ KHÓA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0">
                      HOẠT ĐỘNG
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#040508] p-2.5 rounded-xl border border-[#1e2433]">
                  <div>
                    <span className="text-slate-400 font-mono block">Trường / MSSV:</span>
                    <span className="text-white font-medium">
                      {u.university || 'PrintHub3D'} {u.studentId ? `(${u.studentId})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block">Ngày tạo:</span>
                    <span className="text-white font-mono">{u.joinedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] font-mono">Vai trò:</span>
                    <select
                      aria-label={`Vai trò của ${u.name}`}
                      value={u.role === 'ADMIN' ? 'ADMIN' : 'BUYER'}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="bg-[#040508] border border-[#1e2433] rounded-lg px-2 py-1 text-xs text-[#39FF14] font-mono font-bold outline-none"
                    >
                      <option value="BUYER" className="bg-[#0a0c12] text-white">BUYER</option>
                      <option value="ADMIN" className="bg-[#0a0c12] text-white">ADMIN</option>
                    </select>
                  </div>

                  <button
                    onClick={() => toggleLock(u.id)}
                    className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                      u.isLocked
                        ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{u.isLocked ? 'MỞ KHÓA' : 'KHÓA'}</span>
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
