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
    <div className="space-y-6 w-full">
      <PageHeader
        title="Quản Lý Danh Mục Sản Phẩm"
        description="Quản lý các nhóm danh mục thước 3D, mô hình kỹ thuật và tệp in chuyên dụng."
        badge={`${categories.length} danh mục`}
        icon={Tag}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-primary text-slate-200 hover:text-primary text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
              <span>Tải lại</span>
            </button>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:brightness-110 text-slate-950 font-bold text-xs transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm Danh Mục</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Categories Table Card */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Danh Sách Danh Mục ({categories.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface-inset text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold w-16">ID</th>
                <th className="px-4 py-3 font-bold">Tên Danh Mục</th>
                <th className="px-4 py-3 font-bold">Mô Tả Chi Tiết</th>
                <th className="px-4 py-3 font-bold text-right w-36">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272930]">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    Đang tải danh mục từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    Chưa có danh mục nào. Nhấn "Thêm Danh Mục" để tạo mới.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.categoryId} className="hover:bg-surface-inset/60 transition">
                    <td className="px-4 py-3.5 font-mono text-purple-400 font-bold">
                      #{c.categoryId}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white text-sm">
                      {c.categoryName}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {c.description || 'Không có mô tả'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg bg-surface border border-border hover:border-purple-400 text-purple-300 hover:text-white transition"
                        title="Sửa danh mục"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.categoryId, c.categoryName)}
                        className="p-1.5 rounded-lg bg-surface border border-border hover:border-red-500 text-red-400 hover:text-white transition"
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
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              {editingId ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Tên danh mục *</label>
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Thước Đo Kỹ Thuật, Mô Hình 3D..."
                className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Mô tả danh mục</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả công dụng hoặc đặc điểm của danh mục..."
                className="w-full bg-surface-inset border border-border rounded-xl p-3 text-white outline-none focus:border-purple-400 text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 min-h-[38px] rounded-xl bg-surface-inset border border-border text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 min-h-[38px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-900/30 flex items-center gap-1.5 justify-center"
              >
                {saving && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingId ? 'Cập Nhật' : 'Tạo Danh Mục'}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
