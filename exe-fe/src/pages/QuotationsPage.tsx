import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, ArrowRight, MessageSquare, ShieldCheck, Printer } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { quotationService } from '../services/quotationService';

interface QuotationItem {
  id: string;
  fileName: string;
  material: string;
  weightGrams: number;
  printHours: number;
  infill: number;
  layerHeight: string;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED';
  price?: number;
  factoryNotes?: string;
  createdAt: string;
}

const mockQuotes: QuotationItem[] = [
  {
    id: 'QUO-1092',
    fileName: 'Gear_Reducer_Helical_v2.stl',
    material: 'PETG Siêu Dẻo',
    weightGrams: 145,
    printHours: 5.5,
    infill: 40,
    layerHeight: '0.12mm (Chi tiết cao)',
    status: 'QUOTED',
    price: 115000,
    factoryNotes: 'Đã tối ưu góc in 45 độ, bề mặt răng cưa chuẩn dung sai cơ khí ISO 0.1mm.',
    createdAt: '2026-09-02 10:30',
  },
  {
    id: 'QUO-1089',
    fileName: 'Robot_Arm_Base_Clamp.step',
    material: 'ABS Kỹ Thuật (Chịu Nhiệt)',
    weightGrams: 320,
    printHours: 12.0,
    infill: 60,
    layerHeight: '0.20mm',
    status: 'PENDING',
    createdAt: '2026-09-01 16:45',
  },
  {
    id: 'QUO-1081',
    fileName: 'Drone_Frame_Arm_Lightweight.stl',
    material: 'Carbon Fiber PLA',
    weightGrams: 85,
    printHours: 3.0,
    infill: 100,
    layerHeight: '0.05mm (Siêu mịn)',
    status: 'ACCEPTED',
    price: 180000,
    factoryNotes: 'Đã chuyển thành Đơn Hàng ORD-8812.',
    createdAt: '2026-08-25 14:00',
  },
];

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<QuotationItem[]>(mockQuotes);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await quotationService.getQuotations();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setQuotes(data);
        }
      } catch (error) {
        console.warn('Backend quotation API error, using mock quotes:', error);
      }
    };
    fetchQuotes();
  }, []);

  const handleAcceptQuote = async (id: string) => {
    try {
      await quotationService.acceptQuotation(id);
    } catch (error) {
      console.warn('Backend acceptQuotation error, updating locally:', error);
    }
    setQuotes(prev =>
      prev.map(q => (q.id === id ? { ...q, status: 'ACCEPTED' as const } : q))
    );
    alert(`Đã chấp nhận báo giá ${id}! Đang chuyển sang thanh toán...`);
    navigate('/cart');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#39FF14]">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Báo Giá In 3D (Quotation History)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Theo dõi trạng thái báo giá tệp CAD 3D tùy chỉnh. Chấp nhận báo giá để chuyển trực tiếp thành đơn hàng sản xuất.
          </p>
        </div>

        <Link
          to="/custom"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39FF14] text-slate-950 font-black text-xs hover:bg-emerald-400 transition shadow-lg shrink-0"
        >
          <Printer className="w-4 h-4" /> Gửi Yêu Cầu Báo Giá Mới
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {quotes.map(q => (
          <div key={q.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-[#39FF14] font-bold text-sm">{q.id}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{q.fileName}</h3>
                <p className="text-text-muted text-sm">Ngày gửi: {q.createdAt}</p>
              </div>

              <div>
                {q.status === 'PENDING' && (
                  <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Đang chờ xưởng báo giá
                  </span>
                )}
                {q.status === 'QUOTED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã có báo giá
                  </span>
                )}
                {q.status === 'ACCEPTED' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Đã chấp nhận &amp; Đặt hàng
                  </span>
                )}
              </div>
            </div>

            {/* Spec Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-inset rounded-xl border border-border">
              <div>
                <span className="text-text-muted block">Chất liệu:</span>
                <strong className="text-white">{q.material}</strong>
              </div>
              <div>
                <span className="text-text-muted block">Trọng lượng / Giờ in:</span>
                <strong className="text-white">{q.weightGrams}g • {q.printHours}h</strong>
              </div>
              <div>
                <span className="text-text-muted block">Độ đặc Infill:</span>
                <strong className="text-white">{q.infill}%</strong>
              </div>
              <div>
                <span className="text-text-muted block">Độ mịn Layer:</span>
                <strong className="text-[#39FF14] font-mono">{q.layerHeight}</strong>
              </div>
            </div>

            {q.factoryNotes && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-[#39FF14]">Ghi chú từ Đội ngũ kỹ thuật PrintHub 3D:</strong>
                  <p className="text-sm text-slate-200 mt-0.5">{q.factoryNotes}</p>
                </div>
              </div>
            )}

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
              <div>
                {q.price ? (
                  <div>
                    <span className="text-text-muted">Giá gia công đề xuất: </span>
                    <strong className="text-lg font-black text-[#39FF14] font-mono">{formatPrice(q.price)}đ</strong>
                  </div>
                ) : (
                  <span className="text-amber-400 italic">Hệ thống đang tính toán gram nhựa &amp; khấu hao máy...</span>
                )}
              </div>

              {q.status === 'QUOTED' && (
                <button
                  onClick={() => handleAcceptQuote(q.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950/50"
                >
                  Chấp Nhận &amp; Thanh Toán <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
