import { useState, useEffect } from 'react';
import { ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import type { WarrantyClaim } from '../types';
import { warrantyService } from '../services/warrantyService';

const initialClaims: WarrantyClaim[] = [
  {
    id: 'WAR-8901',
    orderId: 'ORD-8710',
    productName: 'Thước Đo Góc Chữ T Kèm Thang Đo Kép',
    issueType: 'BROKEN_RULER',
    description: 'Thước bị mẻ gờ chặn góc trong quá trình di chuyển học xưởng cơ khí',
    status: 'APPROVED',
    createdAt: '2026-08-28 09:15',
    adminResponse: 'Đã chấp nhận bảo hành 1-đổi-1. Thước mới đang được gửi ship lại KTX.',
  },
];

export default function WarrantyPage() {
  const [claims, setClaims] = useState<WarrantyClaim[]>(initialClaims);
  const [orderId, setOrderId] = useState('ORD-9024');
  const [productName, setProductName] = useState('Thước Kỹ Thuật PLA Pro 20cm');
  const [issueType, setIssueType] = useState<WarrantyClaim['issueType']>('BROKEN_RULER');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await warrantyService.getUserClaims();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setClaims(data);
        }
      } catch (error) {
        console.warn('Backend warranty API error, using mock claims:', error);
      }
    };
    fetchClaims();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: WarrantyClaim = {
      id: `WAR-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      productName,
      issueType,
      description: description || 'Yêu cầu bảo hành đổi thước mới theo chính sách 1 học kỳ',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    try {
      await warrantyService.createClaim(newClaim);
    } catch (error) {
      console.warn('Backend createClaim API error, saving to local mock state:', error);
    }

    setClaims((prev) => [newClaim, ...prev]);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Chính Sách Bảo Hành 1-Đổi-1 (1 Học Kỳ)</h1>
        </div>
        <p className="text-sm text-text-muted">
          Gửi yêu cầu đổi mới miễn phí nếu thước in 3D bị gãy, mẻ vạch chia hoặc phai số trong quá trình học tập.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Claim */}
        <div className="lg:col-span-2 space-y-6">
          {submitted ? (
            <div className="p-6 rounded-2xl bg-surface border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto" />
              <h3 className="text-lg font-bold text-white">Yêu Cầu Bảo Hành Đã Được Gửi!</h3>
              <p className="text-sm text-text-muted">
                Bộ phận CSKH PrintHub đang kiểm tra đơn hàng và sẽ xác nhận đổi sản phẩm mới trong 12 giờ.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold"
              >
                Tạo Yêu Cầu Khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-surface border border-border space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gửi Minh Chứng Yêu Cầu Bảo Hành</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label htmlFor="warrantypage-field-1" className="font-bold text-slate-300">Mã đơn hàng liên quan</label>
                  <input id="warrantypage-field-1"
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="warrantypage-field-2" className="font-bold text-slate-300">Tên thước / Sản phẩm bị lỗi</label>
                  <input id="warrantypage-field-2"
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label htmlFor="warrantypage-field-3" className="font-bold text-slate-300">Loại sự cố gặp phải</label>
                <select id="warrantypage-field-3"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as WarrantyClaim['issueType'])}
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="BROKEN_RULER">Thước bị gãy / nứt nhựa va đập</option>
                  <option value="INACCURATE_SCALE">Sai số vạch chia (Quá 0.2mm)</option>
                  <option value="DEFECTIVE_PRINT">Lỗi bavia / cong vênh bề mặt</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label htmlFor="warrantypage-field-4" className="font-bold text-slate-300">Mô tả tình trạng hư hỏng chi tiết</label>
                <textarea id="warrantypage-field-4"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể vị trí nứt gãy hoặc lỗi..."
                  className="w-full bg-surface-inset border border-border rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-inset border-2 border-dashed border-border text-center space-y-1">
                <Upload className="w-5 h-5 text-[#22c55e] mx-auto" />
                <p className="text-sm font-bold text-white">Tải ảnh chụp minh chứng sản phẩm lỗi (Tùy chọn)</p>
                <p className="text-sm text-text-muted">Đính kèm ảnh giúp đẩy nhanh tiến độ phê duyệt 1-đổi-1</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Gửi Yêu Cầu Bảo Hành 1-Đổi-1
              </button>
            </form>
          )}
        </div>

        {/* Existing Claims List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Lịch Sử Bảo Hành Đã Gửi</h3>
          <div className="space-y-3">
            {claims.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-surface border border-border text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#22c55e]">{c.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold">
                    {c.status}
                  </span>
                </div>
                <p className="font-bold text-white">{c.productName}</p>
                <p className="text-text-muted text-sm">{c.description}</p>
                {c.adminResponse && (
                  <div className="p-2.5 bg-surface-inset rounded-lg border border-border text-emerald-400 text-xs">
                    ✓ CSKH: {c.adminResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
