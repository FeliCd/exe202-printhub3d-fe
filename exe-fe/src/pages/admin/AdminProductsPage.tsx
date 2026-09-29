import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit3, EyeOff, CheckCircle2, RotateCcw, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { get, send } from '../../services/api';
import { formatPrice } from '../../utils/format';

interface Category {
  categoryId: number;
  categoryName: string;
}

interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName?: string;
  type: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  status?: string;
}

const emptyForm = {
  title: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  type: 'PHYSICAL',
  imageUrl: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await get('/categories');
      const data = (res.data as any)?.result || res.data;
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/marketplace/product?page=${page}&size=12`;
      if (search.trim()) url += `&keyword=${encodeURIComponent(search.trim())}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (selectedType) url += `&type=${selectedType}`;

      const res = await get(url);
      const data = (res.data as any)?.result || res.data;
      if (data?.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      categoryId: String(p.categoryId || ''),
      type: p.type || 'PHYSICAL',
      imageUrl: p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]) || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        type: form.type,
        imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      };

      if (editingId) {
        await send(`/marketplace/product/${editingId}`, payload, 'put');
      } else {
        await send('/marketplace/product', payload, 'post');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi lưu sản phẩm:', err);
      alert('Không thể lưu sản phẩm. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p: ProductItem) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái kinh doanh của sản phẩm "${p.title}"?`)) return;
    try {
      await send(`/marketplace/product/${p.id}`, undefined, 'delete');
      fetchProducts();
    } catch (err) {
      console.error('Lỗi thao tác sản phẩm:', err);
      alert('Thao tác thất bại.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <Package className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Sản Phẩm Sàn (Product Catalog)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Quản trị thông tin chi tiết từng sản phẩm thước in 3D, mô hình kỹ thuật, giá bán và số lượng tồn kho
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-purple-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên sản phẩm, mã SKU..."
            className="w-full bg-surface-inset border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="bg-surface-inset border border-border rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-400"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(0);
            }}
            className="bg-surface-inset border border-border rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-400"
          >
            <option value="">Tất cả phân loại</option>
            <option value="PHYSICAL">Thước 3D Vật lý (In thành phẩm)</option>
            <option value="DIGITAL">File Mô hình 3D (Tải số)</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedType('');
              setPage(0);
              fetchProducts();
            }}
            title="Làm mới bộ lọc"
            className="p-2.5 rounded-xl bg-surface-inset border border-border hover:border-purple-400 text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Danh Sách Sản Phẩm Trong Kho ({products.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface-inset text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold w-16 whitespace-nowrap">Ảnh</th>
                <th className="px-4 py-3 font-bold min-w-[200px]">Tên Sản Phẩm</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[150px]">Danh Mục</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Phân Loại</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Đơn Giá</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Tồn Kho</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Trạng Thái</th>
                <th className="px-4 py-3 font-bold text-right w-28 whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272930]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-text-muted">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                    Đang tải dữ liệu sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-text-muted">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imgUrl = p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]);
                  return (
                    <tr key={p.id} className="hover:bg-surface-inset/60 transition">
                      {/* Image Thumbnail */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-xl bg-surface-inset border border-border overflow-hidden flex items-center justify-center shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </td>

                      {/* Product Title & ID */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                        <p className="text-xs text-text-muted font-mono mt-0.5">#{p.id.substring(0, 8)}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-950/80 text-purple-300 font-semibold border border-purple-800/80 text-xs whitespace-nowrap shadow-sm"
                          title={p.categoryName || 'Mặc định'}
                        >
                          {p.categoryName || 'Mặc định'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-300">
                          {p.type === 'DIGITAL' ? 'File 3D Số' : 'Thước Vật Lý'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-mono font-bold text-[#39FF14] text-sm whitespace-nowrap">
                        {formatPrice(p.price)}đ
                      </td>

                      {/* Stock with Warning */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.stock <= 5 ? (
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {p.stock} (Sắp hết)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-300 font-mono">
                            {p.stock} cái
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Đang bán
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg bg-surface border border-border hover:border-purple-400 text-purple-300 hover:text-white transition"
                          title="Chỉnh sửa chi tiết"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          className="p-2 rounded-lg bg-surface border border-border hover:border-red-500 text-slate-400 hover:text-red-400 transition"
                          title="Ngừng bán / Ẩn sản phẩm"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-slate-400">
          <span>Trang {page + 1} / {totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-surface-inset border border-border disabled:opacity-40 text-slate-200 hover:text-white font-bold"
            >
              Trước
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-surface-inset border border-border disabled:opacity-40 text-slate-200 hover:text-white font-bold"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm & Chỉnh Sửa Sản Phẩm (Form 2 Cột Cao Cấp) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                {editingId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-inset transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên sản phẩm */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300">Tên sản phẩm thước / mô hình 3D *</label>
                  <input
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Thước Eke Parabol Khắc Tên Sinh Viên Bambu Lab..."
                    className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs"
                  />
                </div>

                {/* Danh mục */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Danh mục sản phẩm *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phân loại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Hình thức sản phẩm *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="PHYSICAL">Thước 3D Vật lý (In gia công thành phẩm)</option>
                    <option value="DIGITAL">File Mô hình 3D (.STL / .OBJ tải số)</option>
                  </select>
                </div>

                {/* Đơn giá */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Giá bán niêm yết (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="VD: 45000"
                    className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs font-mono"
                  />
                </div>

                {/* Số lượng tồn kho */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Số lượng tồn kho (cái) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="VD: 100"
                    className="w-full bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs font-mono"
                  />
                </div>

                {/* URL Ảnh đại diện & Preview */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="font-bold text-slate-300">Đường dẫn hình ảnh đại diện (URL)</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1 bg-surface-inset border border-border rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400 text-xs"
                    />
                    {form.imageUrl && (
                      <div className="w-11 h-11 rounded-xl bg-surface-inset border border-border overflow-hidden shrink-0">
                        <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mô tả chi tiết */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300">Mô tả thông số kỹ thuật &amp; công năng</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Vật liệu in PLA/PETG, độ dày 2mm, độ chính xác vạch đo 0.1mm..."
                    className="w-full bg-surface-inset border border-border rounded-xl p-3 text-white outline-none focus:border-purple-400 text-xs resize-none"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-inset border border-border text-slate-300 hover:text-white text-xs font-bold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-900/30 flex items-center gap-1.5"
                >
                  {saving && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
