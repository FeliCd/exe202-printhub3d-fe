import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, PhoneCall, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'GENERAL' | 'MATERIALS' | 'WARRANTY' | 'SHIPPING';
}

const faqs: FAQItem[] = [
  {
    category: 'GENERAL',
    question: 'Dung sai quang học của thước in 3D PrintHub là bao nhiêu?',
    answer: 'Tất cả các dòng thước kỹ thuật PrintHub đều được cân chỉnh với dung sai sai số chuẩn xác dưới ±0.1mm. Các thước đo góc và thước du xích Vernier được kiểm định bằng kính hiển vi quang học trước khi đóng gói giao cho sinh viên.',
  },
  {
    category: 'MATERIALS',
    question: 'Nên chọn nhựa PLA Pro+, PETG hay Resin UV?',
    answer: '• PLA Pro+: Dẻo dai, chống giòn gãy, bề mặt đẹp, giá tốt nhất cho môn Vẽ Kỹ Thuật.\n• PETG: Chịu nhiệt đến 80°C, cực kỳ bền cho sinh viên làm đồ án Robot/Cơ điện tử hay mang ra công trường.\n• Resin UV: Siêu mịn, độ chi tiết cao, phù hợp thước kẹp Vernier hay bánh răng độ chính xác cao.',
  },
  {
    category: 'GENERAL',
    question: 'Mật độ đặc (Infill density %) nào phù hợp nhất cho thước?',
    answer: 'Đối với thước kỹ thuật 20cm/30cm, mức Infill 30% - 40% (dạng tổ ong Gyroid) là tối ưu nhất, vừa giúp thước nhẹ vừa đảm bảo không bao giờ bị cong vênh theo thời gian.',
  },
  {
    category: 'WARRANTY',
    question: 'Chính sách bảo hành 1-đổi-1 suốt 1 học kỳ hoạt động thế nào?',
    answer: 'Nếu thước của bạn bị gãy, mẻ hay phai vạch chia trong quá trình sử dụng suốt 1 học kỳ (4 tháng), bạn chỉ cần chụp ảnh và gửi yêu cầu tại mục "Bảo hành 1-đổi-1". PrintHub sẽ gửi thước mới hoàn toàn miễn phí về KTX của bạn trong 24h.',
  },
  {
    category: 'SHIPPING',
    question: 'Thời gian giao hàng về KTX ĐHQG / Bách Khoa / Sư Phạm Kỹ Thuật?',
    answer: 'Đối với khu vực KTX ĐHQG TP.HCM (Khu A & Khu B) và các trường Bách Khoa, Sư Phạm Kỹ Thuật, đơn hàng được ship hỏa tốc trong 2-4 giờ từ xưởng in Makerlab gần nhất.',
  },
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(faqs[0].question);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredFaqs = faqs.filter(
    f => activeCategory === 'ALL' || f.category === activeCategory
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#39FF14]">
          <HelpCircle className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Trung Tâm Hỗ Trợ &amp; FAQ Sinh Viên (Help Center)</h1>
        </div>
        <p className="text-sm text-text-muted">
          Giải đáp các thắc mắc kỹ thuật về dung sai 3D, chọn chất liệu nhựa (PLA/PETG/Resin), mật độ đặc infill và quy trình bảo hành 1 học kỳ.
        </p>
      </div>

      {/* Support Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-[#39FF14] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">Chat Trực Tiếp Admin</h3>
            <p className="text-sm text-text-muted">Hỗ trợ 24/7 tư vấn file CAD</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">Bảo Hành 1-Đổi-1</h3>
            <p className="text-sm text-text-muted">Đổi ngay thước mới nếu bị gãy</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">Hotline Kỹ Thuật Xưởng</h3>
            <p className="text-sm text-text-muted">0987.654.321 (Zalo Support)</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: 'Tất Cả Câu Hỏi' },
          { key: 'GENERAL', label: 'Dung Sai & Kỹ Thuật' },
          { key: 'MATERIALS', label: 'So Sánh Nhựa 3D' },
          { key: 'WARRANTY', label: 'Chính Sách Bảo Hành' },
          { key: 'SHIPPING', label: 'Vận Chuyển KTX' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCategory === cat.key
                ? 'bg-[#39FF14] text-slate-950 shadow-md'
                : 'bg-surface text-slate-400 hover:text-white border border-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIndex === faq.question;
          return (
            <div
              key={faq.question}
              className="rounded-2xl bg-surface border border-border overflow-hidden transition"
            >
              <button
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : faq.question)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-white hover:text-[#39FF14] transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[#39FF14]">Q:</span> {faq.question}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#39FF14] shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-300 border-t border-border/60 leading-relaxed whitespace-pre-line bg-surface-inset/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
