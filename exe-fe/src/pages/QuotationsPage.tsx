import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, ArrowRight, MessageSquare, ShieldCheck, Printer } from 'lucide-react';
import { formatPrice } from '../utils/format';

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
    id: 'QUOTE-1092',
    fileName: 'Khung_Robot_Mechatronics_Cap_Do_An.stl',
    material: 'PETG Chịu Nhiệt',
    weightGrams: 210,
    printHours: 8.5,
    infill: 40,
    layerHeight: '0.16mm',
    status: 'QUOTED',
    price: 320000,
    factoryNotes: 'BK-Makerlab đã duyệt file mesh. Đã tối ưu hướng in chống cong vênh bàn nhiệt.',
    createdAt: '2026-09-02 10:15',
  },
  {
    id: 'QUOTE-1088',
    fileName: 'Thuoc_Ke_Multi_Angle_Custom.obj',
    material: 'PLA Pro (Black)',
    weightGrams: 65,
    printHours: 2.2,
    infill: 25,
    layerHeight: '0.20mm',
    status: 'PENDING',
    createdAt: '2026-09-03 08:30',
  },
  {
    id: 'QUOTE-0995',
    fileName: 'Banh_Rang_Modulo2_SLA.step',
    material: 'Resin UV Quang Học',
    weightGrams: 32,
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

  const handleAcceptQuote = (id: string) => {
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
          <p className="text-xs text-[#94a3b8]">
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
          <div key={q.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#272930] pb-3">
              <div>
                <span className="font-mono text-[#39FF14] font-bold text-sm">{q.id}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{q.fileName}</h3>
                <p className="text-[#94a3b8] text-[11px]">Ngày gửi: {q.createdAt}</p>
              </div>

              <div>
                {q.status === 'PENDING' && (
                  <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Đang chờ xưởng báo giá
                  </span>
                )}
                {q.status === 'QUOTED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã có báo giá
                  </span>
                )}
                {q.status === 'ACCEPTED' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Đã chấp nhận &amp; Đặt hàng
                  </span>
                )}
              </div>
            </div>

            {/* Spec Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#111215] rounded-xl border border-[#272930]">
              <div>
                <span className="text-[#94a3b8] block">Chất liệu:</span>
                <strong className="text-white">{q.material}</strong>
              </div>
              <div>
                <span className="text-[#94a3b8] block">Trọng lượng / Giờ in:</span>
                <strong className="text-white">{q.weightGrams}g • {q.printHours}h</strong>
              </div>
              <div>
                <span className="text-[#94a3b8] block">Độ đặc Infill:</span>
                <strong className="text-white">{q.infill}%</strong>
              </div>
              <div>
                <span className="text-[#94a3b8] block">Độ mịn Layer:</span>
                <strong className="text-[#39FF14] font-mono">{q.layerHeight}</strong>
              </div>
            </div>

            {q.factoryNotes && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-[#39FF14]">Ghi chú từ Xưởng In BK-Makerlab:</strong>
                  <p className="text-[11px] text-slate-200 mt-0.5">{q.factoryNotes}</p>
                </div>
              </div>
            )}

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#272930]">
              <div>
                {q.price ? (
                  <div>
                    <span className="text-[#94a3b8]">Giá gia công đề xuất: </span>
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
