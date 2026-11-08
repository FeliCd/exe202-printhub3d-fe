import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040508] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#39FF14]/30 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#39FF14] transition font-mono group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Phiên bản 1.2</span>
            <span className="text-xs font-mono text-[#39FF14]">Hiệu lực: 02/11/2026</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Cam kết minh bạch dữ liệu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Chính Sách Bảo Mật Thông Tin & File Thiết Kế
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            PrintHub 3D hiểu rằng dữ liệu cá nhân và đặc biệt là các mô hình 3D, file đồ án kỹ thuật của sinh viên là tài sản trí tuệ quan trọng nhất. Chúng tôi cam kết tuyệt đối bảo mật và minh bạch trong toàn bộ quá trình vận hành.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="grid items-start gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <nav aria-label="Mục lục" className="rounded-xl border border-border bg-surface p-3 lg:sticky lg:top-4">
            <p className="px-2 pb-1 text-sm font-semibold text-theme-ink">Mục lục</p>
            <ol className="grid">
              <li><a className="block rounded-md px-2 py-2 text-sm text-theme-copy hover:bg-surface-raised hover:text-theme-accent" href="#privacy-1">Dữ liệu cá nhân chúng tôi thu thập</a></li>
              <li><a className="block rounded-md px-2 py-2 text-sm text-theme-copy hover:bg-surface-raised hover:text-theme-accent" href="#privacy-2">Cam kết quyền sở hữu trí tuệ đối với File 3D (.STL, .OBJ, .STEP)</a></li>
              <li><a className="block rounded-md px-2 py-2 text-sm text-theme-copy hover:bg-surface-raised hover:text-theme-accent" href="#privacy-3">Bảo mật thanh toán trực tuyến</a></li>
              <li><a className="block rounded-md px-2 py-2 text-sm text-theme-copy hover:bg-surface-raised hover:text-theme-accent" href="#privacy-4">Quyền kiểm soát dữ liệu của người dùng</a></li>
            </ol>
          </nav>
        <div className="space-y-6 text-sm sm:text-base text-slate-300">
          {/* Section 1 */}
          <div id="privacy-1" className="scroll-mt-4 space-y-3 border-b border-border pb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <Lock className="w-5 h-5 text-[#39FF14]" />
              1. Dữ liệu cá nhân chúng tôi thu thập
            </h2>
            <ul className="space-y-2.5 text-slate-400 list-inside">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-1" />
                <span><strong className="text-slate-200">Thông tin liên lạc & giao hàng:</strong> Họ tên, số điện thoại, địa chỉ nhận hàng (Tỉnh/Thành, Quận/Huyện, Phường/Xã) để bưu tá giao sản phẩm in tới bạn.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-1" />
                <span><strong className="text-slate-200">Tài khoản & Xác thực:</strong> Địa chỉ email để gửi OTP bảo mật, thông báo tiến độ đơn hàng và biên lai thanh toán.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-1" />
                <span><strong className="text-slate-200">Thông tin sinh viên (tùy chọn):</strong> Tên trường đại học và MSSV nếu bạn tham gia chương trình tài trợ in ấn học tập hoặc khắc laser thông tin lên thước kỹ thuật.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div id="privacy-2" className="scroll-mt-4 space-y-3 border-b border-border pb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <FileText className="w-5 h-5 text-[#00e5ff]" />
              2. Cam kết quyền sở hữu trí tuệ đối với File 3D (.STL, .OBJ, .STEP)
            </h2>
            <div className="space-y-3 text-slate-400 leading-relaxed">
              <p>
                Khi bạn tải lên bất kỳ tệp thiết kế nào lên PrintHub 3D (thông qua Ruler Studio hoặc Form yêu cầu báo giá riêng):
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-slate-300">
                <p>• <strong className="text-white">Quyền sở hữu tuyệt đối:</strong> Quyền tác giả và quyền sở hữu file 3D hoàn toàn thuộc về bạn.</p>
                <p>• <strong className="text-white">Mục đích sử dụng duy nhất:</strong> File chỉ được tải về bởi kỹ thuật viên phụ trách cắt lớp (slicing) và điều khiển máy in 3D thực hiện đơn hàng của bạn.</p>
                <p>• <strong className="text-white">Không chia sẻ, không thương mại hóa:</strong> PrintHub 3D tuyệt đối không chia sẻ, bán, tải lên kho dữ liệu công cộng hoặc tái sử dụng file của bạn dưới bất kỳ hình thức nào.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div id="privacy-3" className="scroll-mt-4 space-y-3 border-b border-border pb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              3. Bảo mật thanh toán trực tuyến
            </h2>
            <p className="text-slate-400 leading-relaxed">
              PrintHub 3D tích hợp cổng thanh toán trực tiếp qua <strong className="text-slate-200">PayOS / VietQR</strong> (chuyển khoản ngân hàng chính thống có mã QR tự động xác thực). Chúng tôi không lưu trữ thông tin thẻ tín dụng hay mật khẩu ngân hàng của bạn. Mọi giao dịch đều được mã hóa bằng chuẩn HTTPS/TLS 1.3 an toàn.
            </p>
          </div>

          {/* Section 4 */}
          <div id="privacy-4" className="scroll-mt-4 space-y-3 border-b border-border pb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <Eye className="w-5 h-5 text-emerald-400" />
              4. Quyền kiểm soát dữ liệu của người dùng
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Bạn có toàn quyền truy cập mục <Link to="/profile" className="text-[#39FF14] underline hover:text-white">Hồ sơ cá nhân</Link> để xem, cập nhật hoặc xóa thông tin liên hệ. Nếu bạn muốn xóa toàn bộ lịch sử file đã in sau khi nghiệm thu đơn hàng hoàn tất, hãy gửi yêu cầu tới đội ngũ kỹ thuật của chúng tôi.
            </p>
          </div>

          {/* Section 5: Contact */}
          <div className="bg-gradient-to-r from-[#11141e] to-[#0a0c12] border border-[#39FF14]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-white">Bạn có câu hỏi về quyền riêng tư?</h3>
              <p className="text-xs text-slate-400 font-mono">Hotline hỗ trợ: 0786954657 · Email: support@printhub3d.com</p>
            </div>
            <Link
              to="/help-center"
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold text-xs uppercase tracking-wider font-mono transition shadow-md shadow-emerald-950/50 shrink-0"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

