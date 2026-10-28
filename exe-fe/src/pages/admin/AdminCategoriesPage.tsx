import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, RotateCcw, X, Layers } from 'lucide-react';
import { get, send } from '../../services/api';
import { PageHeader } from '../../components/DataUI';
import Modal from '../../components/Modal';

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get('/categories');
      const data = (res.data as any)?.result || res.data;
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
      setError('Không thể tải danh sách danh mục từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDesc('');
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.categoryId);
    setName(c.categoryName);
    setDesc(c.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await send(`/categories/${editingId}`, { categoryName: name, description: desc }, 'put');
      } else {
        await send('/categories', { categoryName: name, description: desc }, 'post');
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);
      alert('Không thể lưu danh mục. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) return;
    try {
      await send(`/categories/${id}`, undefined, 'delete');
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);
      alert('Không thể xóa danh mục này (có thể đang có sản phẩm thuộc danh mục).');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      <PageHeader
        title="QUẢN LÝ DANH MỤC SẢN PHẨM &amp; VẬT LIỆU IN"
        description="Quản trị các nhóm danh mục thước in 3D, mô hình kỹ thuật CAD, vật liệu polyme và tệp in chuyên dụng."
        badge={`${categories.length} danh mục`}
        icon={Tag}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14] text-slate-300 hover:text-[#39FF14] text-xs font-mono font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#39FF14]' : ''}`} />
              <span>TẢI LẠI</span>
            </button>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>THÊM DANH MỤC</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono font-medium">
          {error}
        </div>
      )}

      {/* Categories Table Card */}
      <div className="p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between border-b border-[#1e2433] pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#00e5ff]" /> DANH SÁCH DANH MỤC HỆ THỐNG ({categories.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#040508] text-slate-400 uppercase border-b border-[#1e2433] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3.5 font-bold w-20 whitespace-nowrap shrink-0">MÃ ID</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">TÊN DANH MỤC</th>
                <th className="px-4 py-3.5 font-bold">MÔ TẢ CHI TIẾT &amp; ỨNG DỤNG</th>
                <th className="px-4 py-3.5 font-bold text-right w-36 whitespace-nowrap shrink-0">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]/70">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400 font-mono">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#39FF14]" />
                    Đang tải danh mục từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500 font-mono">
                    Chưa có danh mục nào. Bấm "THÊM DANH MỤC" để tạo mới.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.categoryId} className="hover:bg-[#11141e]/60 transition">
                    <td className="px-4 py-3.5 font-mono text-[#00e5ff] font-bold whitespace-nowrap shrink-0">
                      #{c.categoryId}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white text-sm whitespace-nowrap shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 font-mono text-xs">
                        {c.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {c.description || 'Chưa thiết lập mô tả'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap shrink-0">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/10 transition cursor-pointer whitespace-nowrap shrink-0"
                        title="Chỉnh sửa danh mục"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.categoryId, c.categoryName)}
                        className="p-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-rose-500 text-slate-400 hover:text-rose-400 transition cursor-pointer whitespace-nowrap shrink-0"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh Sửa Danh Mục */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} label={editingId ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}>
        <div className="w-full max-w-md bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center justify-between border-b border-[#1e2433] pb-3 shrink-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#39FF14]" />
              {editingId ? 'CHỈNH SỬA DANH MỤC' : 'THÊM MỚI DANH MỤC'}
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-[#11141e] transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 font-mono">TÊN DANH MỤC *</label>
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Thước Đo Kỹ Thuật, Mô Hình 3D PLA..."
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 font-mono">MÔ TẢ DANH MỤC</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả công dụng hoặc đặc điểm kỹ thuật..."
                className="w-full bg-[#040508] border border-[#1e2433] rounded-xl p-3 text-white outline-none focus:border-[#39FF14] text-xs resize-none transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#1e2433] shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 min-h-[38px] rounded-xl bg-[#11141e] border border-[#1e2433] text-slate-300 hover:text-white text-xs font-mono font-bold transition flex items-center justify-center whitespace-nowrap shrink-0 cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 min-h-[38px] rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] text-xs font-mono font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-1.5 justify-center whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {saving && <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#040508]" />}
                <span>{editingId ? 'CẬP NHẬT' : 'TẠO DANH MỤC'}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
