import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Layers, CheckCircle2, FileText, Trash2, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { formatPrice } from '../utils/format';
import type { BulkOrderItem } from '../types';
import { useAuth } from '../context/AuthContext';

const initialBulkItems: BulkOrderItem[] = [
  {
    id: 'b-1',
    fileName: 'Thuoc_Eke_KyThuat_V2.stl',
    material: 'PLA PRO+ (Green)',
    quantity: 50,
    estimatedVolume: '32.4 cm³ / sản phẩm',
    pricePerUnit: 35000,
  },
  {
    id: 'b-2',
    fileName: 'Stencil_Mach_DienTu_R3.step',
    material: 'PETG Clear (Kháng va đập)',
    quantity: 30,
    estimatedVolume: '18.1 cm³ / sản phẩm',
    pricePerUnit: 42000,
  },
];

export default function BulkOrderPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<BulkOrderItem[]>(initialBulkItems);
  const [submitted, setSubmitted] = useState(false);


  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
  const bulkDiscount = totalPrice * 0.2; // 20% bulk discount
  const finalTotal = totalPrice - bulkDiscount;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BulkOrderItem[] = Array.from(files).map((f, idx) => ({
      id: `b-new-${Date.now()}-${idx}`,
      fileName: f.name,
      material: 'PETG Dẻo (Kháng gãy)',
      quantity: 20,
      estimatedVolume: '24.5 cm³ / sản phẩm',
      pricePerUnit: 38000,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-purple-400">
          <Layers className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Đặt Hàng In 3D Số Lượng Lớn (Bulk Order)</h1>
        </div>
        <p className="text-sm text-text-muted">
          Giải pháp sản xuất hàng loạt cho Câu lạc bộ, Khoa Kỹ Thuật, Doanh nghiệp. Chiết khấu đến 35%.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-surface border border-purple-500/40 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Đã Gửi Đơn Hàng Hàng Loạt!</h2>
          <p className="text-sm text-text-muted">
            Đội ngũ kỹ thuật PrintHub 3D đang kiểm tra file mesh &amp; phân bổ hệ thống in. Chúng tôi sẽ liên hệ trong 30 phút.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {!isAuthenticated && (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Bạn đang duyệt với tư cách Khách. Vui lòng đăng nhập để lưu trữ hồ sơ tệp CAD và nhận báo giá số lượng lớn.</span>
              </div>
              <button
                onClick={() => navigate('/login?redirect=/bulk-order')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload & List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drag & Drop Upload Zone */}
              <div className="p-8 rounded-2xl bg-surface border-2 border-dashed border-border hover:border-purple-400 transition text-center space-y-3 relative group">
                <input
                  aria-label="Chọn tệp CAD cho đơn hàng hàng loạt"
                  type="file"
                  multiple
                  accept=".stl,.obj,.step,.csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Thả tệp .STL / .STEP / .CSV vào đây hoặc bấm để chọn tệp</p>
                  <p className="text-sm text-text-muted mt-1">Hỗ trợ tải lên cùng lúc nhiều tệp CAD 3D hoặc bảng danh mục cần in hàng loạt</p>
                </div>
              </div>

              {/* Uploaded Items Table */}
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Danh Sách Tệp CAD Đã Tải Lên ({items.length})
                </h3>

                {items.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-6">Chưa có tệp nào được chọn</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-xl bg-surface-inset border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400" /> {item.fileName}
                          </p>
                          <p className="text-text-muted">Vật liệu: <span className="text-slate-300">{item.material}</span> • Thể tích: {item.estimatedVolume}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">Số lượng:</span>
                            <input
                              aria-label={`Số lượng ${item.fileName}`}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, parseInt(e.target.value) || 1);
                                setItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: q } : i))
                                );
                              }}
                              className="w-16 bg-surface border border-border rounded-lg px-2 py-1 text-white font-bold text-center outline-none"
                            />
                          </div>
                          <span className="font-black text-white">{formatPrice(item.pricePerUnit * item.quantity)}đ</span>
                          <button aria-label={`Xóa ${item.fileName}`} onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ước Tính Báo Giá Hàng Loạt</h3>

                <div className="space-y-2 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Tổng số lượng thước:</span>
                    <span className="text-white font-bold">{totalQuantity} cái</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đơn giá niêm yết:</span>
                    <span>{formatPrice(totalPrice)}đ</span>
                  </div>
                  <div className="flex justify-between text-purple-400 font-bold">
                    <span>Chiết khấu đơn hàng lớn (20%):</span>
                    <span>-{formatPrice(bulkDiscount)}đ</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between text-sm font-black text-white">
                    <span>Tổng cộng thanh toán:</span>
                    <span className="text-purple-400 text-lg">{formatPrice(finalTotal)}đ</span>
                  </div>
                </div>

                <button
                  disabled={items.length === 0}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/bulk-order');
                      return;
                    }
                    setSubmitted(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-purple-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {!isAuthenticated ? (
                    <>
                      <LogIn className="w-4 h-4" /> Đăng Nhập Để Gửi Đơn Hàng
                    </>
                  ) : (
                    <>
                      Gửi Đơn Hàng Hàng Loạt <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
