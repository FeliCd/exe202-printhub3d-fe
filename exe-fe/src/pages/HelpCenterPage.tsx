import { useState } from 'react';
import { ArrowUpRight, HelpCircle, Mail, PhoneCall, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, field, secondary } from '../components/DataUI';
import { useStoreSettings } from '../services/storeSettingsService';

const categories = ['Tất cả', 'In 3D', 'Đơn hàng', 'Thanh toán', 'Bảo hành'] as const;
type Category = typeof categories[number];

const faqs = [
  {
    category: 'In 3D',
    question: 'Làm thế nào để gửi tệp in 3D?',
    answer: 'Mở tab Gửi tệp, chọn tệp STL, OBJ, STEP hoặc STP tối đa 20 MB, rồi điền số lượng và địa chỉ giao hàng. Nếu chưa biết chọn vật liệu nào, bạn có thể nhờ xưởng tư vấn.',
    link: ['/custom?tab=upload', 'Gửi tệp in 3D'],
  },
  {
    category: 'In 3D',
    question: 'Tôi nên chọn vật liệu nào cho mẫu in?',
    answer: 'PLA thường phù hợp với mẫu trưng bày và đồ án. PETG là lựa chọn khi cần độ bền hoặc khả năng chịu nhiệt cao hơn. Nếu chưa chắc, hãy mô tả cách bạn sẽ sử dụng mẫu trong ghi chú để xưởng tư vấn.',
    link: ['/custom?tab=upload', 'Gửi yêu cầu tư vấn'],
  },
  {
    category: 'Đơn hàng',
    question: 'Tôi xem tiến độ đơn hàng ở đâu?',
    answer: 'Vào Theo dõi tiến độ in 3D, chọn đơn cần xem để mở trang chi tiết. Trang này hiển thị trạng thái và thông tin giao hàng của đơn.',
    link: ['/orders', 'Theo dõi đơn hàng'],
  },
  {
    category: 'Đơn hàng',
    question: 'Tôi xem báo giá cho thiết kế của mình ở đâu?',
    answer: 'Vào Yêu cầu & báo giá và chọn yêu cầu đã gửi. Khi xưởng có báo giá, bạn có thể xem và phản hồi ngay trên trang chi tiết.',
    link: ['/quotations', 'Xem yêu cầu và báo giá'],
  },
  {
    category: 'Thanh toán',
    question: 'Tôi thanh toán yêu cầu in 3D như thế nào?',
    answer: 'Khi đã có báo giá, mở yêu cầu để kiểm tra và chấp nhận báo giá. Dùng nút thanh toán trên trang chi tiết để tiếp tục qua PayOS. Nếu trạng thái còn chờ xác nhận, hãy kiểm tra lại đơn trước khi thanh toán lần nữa.',
    link: ['/quotations', 'Xem báo giá'],
  },
  {
    category: 'Bảo hành',
    question: 'Sản phẩm có lỗi thì tôi gửi yêu cầu bảo hành ở đâu?',
    answer: 'Vào Bảo hành, chọn đơn hàng và mô tả vấn đề. Đính kèm ảnh thể hiện lỗi nếu có. Sau khi gửi, mở chi tiết yêu cầu để theo dõi phản hồi.',
    link: ['/warranty', 'Mở mục bảo hành'],
  },
  {
    category: 'Bảo hành',
    question: 'Tôi có thể khiếu nại về một đơn hàng không?',
    answer: 'Mở Khiếu nại & Tranh chấp, chọn đơn liên quan và nêu rõ vấn đề bạn gặp. Bạn có thể theo dõi trao đổi với đội hỗ trợ trong từng yêu cầu.',
    link: ['/disputes', 'Mở mục khiếu nại'],
  },
] as const;

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').trim();

export default function HelpCenterPage() {
  const settings = useStoreSettings();
  const [category, setCategory] = useState<Category>('Tất cả');
  const [search, setSearch] = useState('');
  const query = normalize(search);
  const visibleFaqs = faqs.filter(faq =>
    (category === 'Tất cả' || faq.category === category) &&
    normalize(faq.question + ' ' + faq.answer).includes(query)
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <PageHeader title="Trung tâm trợ giúp" description="Tìm hướng dẫn về thiết kế, đặt in, thanh toán và bảo hành." icon={HelpCircle} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.43fr)]">
        <section aria-label="Câu hỏi thường gặp" className="min-w-0 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-theme-muted" aria-hidden="true" />
            <input type="search" aria-label="Tìm câu hỏi thường gặp" placeholder="Bạn cần giúp gì?" value={search}
              onChange={event => setSearch(event.target.value)} className={field + ' pl-10'} />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Chủ đề hỗ trợ">
            {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}
              className={'rounded-lg border px-3 py-2 text-sm font-medium ' + (category === item
                ? 'border-primary/60 bg-primary/10 text-theme-accent' : 'border-border bg-surface text-theme-copy hover:border-theme-accent')}>
              {item}
            </button>)}
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {visibleFaqs.length ? visibleFaqs.map(faq => (
              <details key={faq.question} className="group px-4 py-3 sm:px-5">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-theme-ink [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="text-lg font-normal text-theme-accent group-open:hidden" aria-hidden="true">+</span>
                  <span className="hidden text-lg font-normal text-theme-accent group-open:inline" aria-hidden="true">−</span>
                </summary>
                <p className="pt-2 text-sm leading-relaxed text-theme-muted">{faq.answer}</p>
                <Link className="my-2 inline-flex items-center gap-1.5 text-sm font-semibold text-theme-accent hover:underline" to={faq.link[0]}>
                  {faq.link[1]} <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </details>
            )) : <div className="space-y-3 p-5" role="status">
              <p className="text-sm text-theme-muted">Chưa tìm thấy câu hỏi. Hãy đổi từ khóa hoặc chọn chủ đề khác.</p>
              <button type="button" className={secondary} onClick={() => { setSearch(''); setCategory('Tất cả'); }}>Xóa bộ lọc</button>
            </div>}
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="space-y-1">
            <h2 className="font-semibold text-theme-ink">Liên hệ hỗ trợ</h2>
            <p className="text-sm text-theme-muted">Chưa tìm thấy câu trả lời? Gửi mã đơn hoặc mã yêu cầu để chúng tôi kiểm tra.</p>
          </div>
          <div className="grid gap-2">
            <a className={secondary + ' justify-start break-all'} href={'tel:' + settings.supportPhone}>
              <PhoneCall className="size-4 shrink-0 text-theme-accent" aria-hidden="true" />{settings.supportPhone}
            </a>
            <a className={secondary + ' justify-start break-all'} href={'mailto:' + settings.supportEmail}>
              <Mail className="size-4 shrink-0 text-theme-accent" aria-hidden="true" />{settings.supportEmail}
            </a>
            <p className="text-xs text-theme-muted">{settings.supportHours}</p>
          </div>
          <div className="grid gap-2 border-t border-border pt-4 text-sm">
            <Link to="/terms" className="text-theme-accent hover:underline">Điều khoản sử dụng</Link>
            <Link to="/privacy-policy" className="text-theme-accent hover:underline">Chính sách bảo mật</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
