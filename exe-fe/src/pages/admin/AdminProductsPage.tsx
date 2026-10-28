import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  X,
  Image as ImageIcon,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { get, send, uploadFormData } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { PageHeader } from '../../components/DataUI';

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

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm:', err);
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
    setUploadError(null);
    setModalOpen(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setUploadError(null);
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

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFormData<string | { result?: string; url?: string }>('/upload/image', formData);
      const uploadedUrl = typeof res === 'string' ? res : (res?.result || res?.url || '');
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      } else {
        setUploadError('Không nhận được URL ảnh phản hồi từ máy chủ');
      }
    } catch (err: unknown) {
      console.error('Lỗi tải ảnh lên Cloudinary:', err);
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Tải ảnh thất bại';
      setUploadError(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      <PageHeader
        title="Quản Lý Sản Phẩm Sàn"
        description="Quản trị thông tin chi tiết từng sản phẩm thước in 3D, mô hình kỹ thuật, giá bán và số lượng tồn kho."
        badge={`${products.length} sản phẩm`}
        icon={Package}
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:brightness-110 text-slate-950 font-bold text-xs transition shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0c12] border border-[#1e2433] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU hoặc phôi in..."
            className="w-full bg-[#040508] border border-[#1e2433] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition font-mono"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="bg-[#040508] border border-[#1e2433] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] transition font-mono cursor-pointer"
          >
            <option value="">Tất cả danh mục CAD</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId} className="bg-[#0a0c12] text-white">
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
            className="bg-[#040508] border border-[#1e2433] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] transition font-mono cursor-pointer"
          >
            <option value="">Tất cả phân loại</option>
            <option value="PHYSICAL" className="bg-[#0a0c12] text-white">Thước 3D Vật lý (In thành phẩm)</option>
            <option value="DIGITAL" className="bg-[#0a0c12] text-white">File Mô hình 3D (.STL / .OBJ)</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedType('');
              setPage(0);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#11141e] hover:bg-[#1e2433] border border-[#1e2433] text-slate-300 hover:text-white transition font-mono whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-[#0a0c12] border border-[#1e2433] rounded-2xl overflow-hidden shadow-2xl p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#040508] text-slate-400 uppercase border-b border-[#1e2433] font-mono text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 font-bold w-16 whitespace-nowrap shrink-0">ẢNH</th>
                <th className="px-4 py-3.5 font-bold min-w-[200px]">TÊN SẢN PHẨM / THƯỚC</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0 min-w-[150px]">DANH MỤC</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">PHÂN LOẠI</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">ĐƠN GIÁ</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">TỒN KHO</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap shrink-0">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 font-bold text-right w-28 whitespace-nowrap shrink-0">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-mono">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#39FF14]" />
                    ĐANG TRUY VẤN DỮ LIỆU TELEMETRY SẢN PHẨM...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 font-mono">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc chỉ định.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imgUrl = p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]);
                  return (
                    <tr key={p.id} className="hover:bg-[#11141e]/60 transition">
                      {/* Image Thumbnail */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-[#040508] border border-[#1e2433] overflow-hidden flex items-center justify-center shrink-0">
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
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                      </td>

                      {/* Product Title & ID */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-[#00e5ff] font-mono mt-0.5 tracking-wide">SKU: #{p.id.substring(0, 8)}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff] font-mono font-semibold border border-[#00e5ff]/30 text-xs whitespace-nowrap shrink-0"
                          title={p.categoryName || 'Mặc định'}
                        >
                          {p.categoryName || 'Mặc định'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {p.type === 'DIGITAL' ? 'File 3D Số (.STL)' : 'Thước In 3D (Vật lý)'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-mono font-black text-[#39FF14] text-sm whitespace-nowrap shrink-0">
                        {formatPrice(p.price)}đ
                      </td>

                      {/* Stock with Warning */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0 font-mono">
                        {p.stock <= 5 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#ff9100] px-2 py-0.5 rounded bg-[#ff9100]/10 border border-[#ff9100]/30 whitespace-nowrap shrink-0">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {p.stock} (Sắp hết)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-300">
                            {p.stock} cái
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(57,255,20,0.15)]">
                          <CheckCircle2 className="w-3 h-3" /> ĐANG BÁN
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap shrink-0">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/10 transition cursor-pointer whitespace-nowrap shrink-0"
                          title="Chỉnh sửa chi tiết"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          className="p-2 rounded-xl bg-[#11141e] border border-[#1e2433] hover:border-rose-500 text-slate-400 hover:text-rose-400 transition cursor-pointer whitespace-nowrap shrink-0"
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
        <div className="flex items-center justify-between p-3.5 border-t border-[#1e2433] text-xs font-mono text-slate-400 bg-[#040508]">
          <span>TRANG {page + 1} / {totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              className="px-3.5 py-1.5 rounded-xl bg-[#11141e] border border-[#1e2433] disabled:opacity-40 text-slate-200 hover:text-white font-bold cursor-pointer transition whitespace-nowrap shrink-0"
            >
              TRƯỚC
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-[#11141e] border border-[#1e2433] disabled:opacity-40 text-slate-200 hover:text-white font-bold cursor-pointer transition whitespace-nowrap shrink-0"
            >
              SAU
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm & Chỉnh Sửa Sản Phẩm */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/50 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#39FF14]/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#39FF14]" />
                {editingId ? 'CHỈNH SỬA SẢN PHẨM IN 3D' : 'THÊM MỚI SẢN PHẨM THƯỚC IN 3D'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#11141e] transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên sản phẩm */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">TÊN SẢN PHẨM THƯỚC / MÔ HÌNH 3D *</label>
                  <input
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Thước Eke Parabol Khắc Tên Sinh Viên Bambu Lab..."
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs transition"
                  />
                </div>

                {/* Danh mục */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">DANH MỤC SẢN PHẨM *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs transition font-mono cursor-pointer"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId} className="bg-[#0a0c12] text-white">
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phân loại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">HÌNH THỨC SẢN PHẨM *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs transition font-mono cursor-pointer"
                  >
                    <option value="PHYSICAL" className="bg-[#0a0c12] text-white">Thước 3D Vật lý (In gia công thành phẩm)</option>
                    <option value="DIGITAL" className="bg-[#0a0c12] text-white">File Mô hình 3D (.STL / .OBJ tải số)</option>
                  </select>
                </div>

                {/* Đơn giá */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">GIÁ BÁN NIÊM YẾT (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="VD: 45000"
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs font-mono transition"
                  />
                </div>

                {/* Số lượng tồn kho */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">SỐ LƯỢNG TỒN KHO (CÁI) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="VD: 100"
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs font-mono transition"
                  />
                </div>

                {/* URL Ảnh đại diện & Tải ảnh từ máy tính lên Cloudinary */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 font-mono">HÌNH ẢNH ĐẠI DIỆN SẢN PHẨM</label>
                    <span className="text-[11px] text-slate-400 font-mono">Tỷ lệ 1:1, dung lượng &lt; 50MB</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="Dán URL ảnh hoặc bấm Tải ảnh từ máy..."
                      className="flex-1 bg-[#040508] border border-[#1e2433] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#39FF14] text-xs transition"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3.5 py-2.5 rounded-xl border border-[#39FF14]/40 hover:border-[#39FF14] bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {uploadingImage ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#39FF14]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#39FF14]" />
                      )}
                      <span>{uploadingImage ? 'Đang tải lên...' : 'Tải ảnh từ máy'}</span>
                    </button>

                    {form.imageUrl && (
                      <div className="w-11 h-11 rounded-xl bg-[#040508] border border-[#39FF14]/40 overflow-hidden shrink-0 shadow-sm">
                        <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-rose-400 font-mono font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>

                {/* Mô tả chi tiết */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300 font-mono">MÔ TẢ THÔNG SỐ KỸ THUẬT &amp; CÔNG NĂNG</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Vật liệu in PLA/PETG, độ dày 2mm, độ chính xác vạch đo 0.1mm..."
                    className="w-full bg-[#040508] border border-[#1e2433] rounded-xl p-3 text-white outline-none focus:border-[#39FF14] text-xs resize-none transition"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#1e2433]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#11141e] border border-[#1e2433] text-slate-300 hover:text-white text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-[#040508] text-xs font-mono font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(57,255,20,0.35)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {saving && <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#040508]" />}
                  <span>{editingId ? 'CẬP NHẬT SẢN PHẨM' : 'LƯU SẢN PHẨM MỚI'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
