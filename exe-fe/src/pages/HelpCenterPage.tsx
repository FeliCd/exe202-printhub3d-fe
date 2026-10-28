import { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Search,
  Layers,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/DataUI';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: 'GENERAL' | 'MATERIALS' | 'WARRANTY' | 'SHIPPING';
  badge: string;
}

const faqs: FAQItem[] = [
  {
    category: 'GENERAL',
    badge: 'Dung Sai CAD',
    question: 'Dung sai quang học của thước in 3D PrintHub là bao nhiêu?',
    answer: 'Tất cả các dòng thước kỹ thuật PrintHub đều được cân chỉnh với dung sai sai số chuẩn xác dưới ±0.1mm. Các thước đo góc và thước du xích Vernier được kiểm định bằng kính hiển vi quang học trước khi đóng gói giao cho sinh viên.',
  },
  {
    category: 'MATERIALS',
    badge: 'Vật Liệu Sợi',
    question: 'Nên chọn nhựa PLA Pro+, PETG hay Resin UV?',
    answer: '• PLA Pro+: Dẻo dai, chống giòn gãy, bề mặt đẹp, giá tốt nhất cho môn Vẽ Kỹ Thuật.\n• PETG: Chịu nhiệt đến 80°C, cực kỳ bền cho sinh viên làm đồ án Robot/Cơ điện tử hay mang ra công trường.\n• Resin UV: Siêu mịn, độ chi tiết cao, phù hợp thước kẹp Vernier hay bánh răng độ chính xác cao.',
  },
  {
    category: 'GENERAL',
    badge: 'Thông Số In',
    question: 'Mật độ đặc (Infill density %) nào phù hợp nhất cho thước?',
    answer: 'Đối với thước kỹ thuật 20cm/30cm, mức Infill 30% - 40% (dạng tổ ong Gyroid) là tối ưu nhất, vừa giúp thước nhẹ vừa đảm bảo không bao giờ bị cong vênh theo thời gian.',
  },
  {
    category: 'WARRANTY',
    badge: 'Cam Kết Xưởng',
    question: 'Chính sách bảo hành 1-đổi-1 suốt 1 học kỳ hoạt động thế nào?',
    answer: 'Nếu thước của bạn bị gãy, mẻ hay phai vạch chia trong quá trình sử dụng suốt 1 học kỳ (4 tháng), bạn chỉ cần chụp ảnh và gửi yêu cầu tại mục "Bảo hành 1-đổi-1". PrintHub sẽ gửi thước mới hoàn toàn miễn phí về KTX của bạn trong 24h.',
  },
  {
    category: 'SHIPPING',
    badge: 'Vận Chuyển Hỏa Tốc',
    question: 'Thời gian giao hàng về KTX ĐHQG / Bách Khoa / Sư Phạm Kỹ Thuật?',
    answer: 'Đối với khu vực KTX ĐHQG TP.HCM (Khu A & Khu B) và các trường Bách Khoa, Sư Phạm Kỹ Thuật, đơn hàng được ship hỏa tốc trong 2-4 giờ từ xưởng in PrintHub Lab gần nhất.',
  },
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(faqs[0].question);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchCategory = activeCategory === 'ALL' || f.category === activeCategory;
      const matchSearch =
        searchQuery === '' ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Trung Tâm Hỗ Trợ &amp; FAQ Kỹ Thuật"
        description="Giải đáp các thắc mắc kỹ thuật về dung sai 3D, lựa chọn chất liệu sợi in (PLA Pro+ / PETG / Resin UV), mật độ đặc infill và quy trình bảo hành 1-đổi-1 suốt học kỳ."
        badge="CSKH 24/7"
        icon={HelpCircle}
      />

      {/* Support Quick Cockpit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Chat Admin */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#39FF14]/40 flex items-center gap-3.5 transition shadow-lg group">
          <div className="w-11 h-11 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs truncate">Tư Vấn File CAD Trực Tiếp</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Hỗ trợ 24/7 kiểm định file STL/STEP</p>
          </div>
        </div>

        {/* Card 2: Bảo Hành */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-amber-500/40 flex items-center gap-3.5 transition shadow-lg group">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs truncate">Bảo Hành 1-Đổi-1 (4 Tháng)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Đổi ngay thước mới nếu lỗi vạch chia</p>
          </div>
        </div>

        {/* Card 3: Hotline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-[#1e2433] hover:border-[#00e5ff]/40 flex items-center gap-3.5 transition shadow-lg group">
          <div className="w-11 h-11 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs truncate">Hotline Kỹ Thuật Xưởng</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">0987.654.321 (Zalo Lab)</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi theo từ khóa: dung sai, infill, PLA, bảo hành, KTX..."
            className="w-full bg-[#0a0c12] border border-[#1e2433] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#39FF14] transition font-sans"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-[#1e2433] pb-3 overflow-x-auto scrollbar-thin">
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
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeCategory === cat.key
                  ? 'bg-[#39FF14] text-slate-950 shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'bg-[#0a0c12] text-slate-400 hover:text-white border border-[#1e2433]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0a0c12] border border-[#1e2433] space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">Không tìm thấy câu trả lời phù hợp</p>
            <p className="text-xs text-slate-400">Vui lòng thử tìm kiếm với từ khóa khác hoặc liên hệ hotline xưởng.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIndex === faq.question;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition overflow-hidden ${
                  isOpen
                    ? 'bg-[#0a0c12] border-[#39FF14]/50 shadow-[0_0_20px_rgba(57,255,20,0.06)]'
                    : 'bg-[#0a0c12] border-[#1e2433] hover:border-[#39FF14]/30'
                }`}
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : faq.question)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-[#39FF14] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#11141e] border border-[#1e2433] text-[#00e5ff] whitespace-nowrap shrink-0">
                      {faq.badge}
                    </span>
                    <span className="truncate">
                      <span className="text-[#39FF14] mr-1 font-mono">Q:</span> {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#39FF14] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-300 border-t border-[#1e2433] leading-relaxed whitespace-pre-line bg-[#040508]/60 font-sans">
                    <div className="p-3.5 rounded-xl bg-[#040508] border border-[#1e2433] mt-2 text-slate-300">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Action Footer Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0a0c12] via-[#0e1420] to-[#0a0c12] border border-[#39FF14]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#39FF14]">
            <Gauge className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">Cam Kết Chuẩn Cơ Khí</span>
          </div>
          <h4 className="text-sm font-bold text-white">Bạn đang cần thiết kế thước đo có thông số đặc thù cho đồ án?</h4>
          <p className="text-xs text-slate-400">Trải nghiệm ngay bộ công cụ mô phỏng 3D Slicer trực quan với độ chính xác đến từng milimét.</p>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <Link
            to="/custom-order"
            className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e010] text-slate-950 font-black text-xs transition shadow-[0_0_12px_rgba(57,255,20,0.3)] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Mở 3D Slicer Studio</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
