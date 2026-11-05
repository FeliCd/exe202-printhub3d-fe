import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040508] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#39FF14]/30 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
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
            <BookOpen className="w-4 h-4" />
            <span>Quy chế hoạt động</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Điều Khoản Sử Dụng Dịch Vụ & Đặt In 3D
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Chào mừng bạn đến với xưởng in 3D và thước kỹ thuật PrintHub 3D. Bằng việc truy cập website và tạo đơn hàng, bạn đồng ý với các điều khoản hoạt động rõ ràng và minh bạch dưới đây.
          </p>
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-6 text-sm sm:text-base text-slate-300">
          {/* Section 1 */}
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
              1. Dịch vụ cung ứng
            </h2>
            <p className="text-slate-400 leading-relaxed">
              PrintHub 3D cung cấp: (1) Các sản phẩm thước kỹ thuật, thước vẽ hình học, thước kẹp in 3D chuẩn xác dành cho học sinh, sinh viên; (2) Công cụ Ruler Studio 3D trực tuyến để tùy biến thông số, khắc tên riêng; (3) Dịch vụ gia công in 3D theo yêu cầu bằng các vật liệu PLA Pro, ABS, PETG, Resin chất lượng cao.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <Clock className="w-5 h-5 text-yellow-400" />
              2. Đặt hàng, Thanh toán & Thời hạn giữ đơn
            </h2>
            <div className="space-y-3 text-slate-400 leading-relaxed">
              <p>• <strong className="text-slate-200">Giá bán & Phí vận chuyển:</strong> Giá niêm yết trên website là giá cuối cùng bằng Việt Nam Đồng (VND). Phí vận chuyển được tính minh bạch và hiển thị rõ ràng tại trang Giỏ hàng trước khi xác nhận đặt mua.</p>
              <p>• <strong className="text-slate-200">Thời hạn thanh toán:</strong> Đơn hàng chọn hình thức chuyển khoản qua PayOS sẽ có mã QR và thời hạn thanh toán được hiển thị tại màn hình thanh toán. Nếu quá thời hạn mà chưa thanh toán, hệ thống sẽ tự động hủy giữ kho và chuyển đơn sang trạng thái <em>Hết hạn thanh toán</em>.</p>
              <p>• <strong className="text-slate-200">Đơn đặt in theo file riêng:</strong> Đội ngũ kỹ thuật sẽ kiểm tra độ dày thành in, góc treo và gửi báo giá chính thức trong vòng tối đa 4 giờ làm việc.</p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <RefreshCw className="w-5 h-5 text-[#00e5ff]" />
              3. Chính sách kiểm tra hàng & Bảo hành đổi trả
            </h2>
            <div className="space-y-3 text-slate-400 leading-relaxed">
              <p>• <strong className="text-slate-200">Đồng kiểm khi nhận hàng:</strong> Khách hàng có quyền mở kiện hàng kiểm tra số lượng và tính nguyên vẹn của sản phẩm in trước khi ký nhận với bưu tá.</p>
              <p>• <strong className="text-slate-200">Đổi trả / In lại miễn phí 100%:</strong> Trong vòng 07 ngày kể từ khi nhận hàng, nếu sản phẩm bị lỗi vỡ do vận chuyển, vạch chia bị mờ lem, sai kích thước hoặc lỗi kỹ thuật từ xưởng in, PrintHub 3D sẽ tiến hành in lại và gửi bù hoàn toàn miễn phí.</p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 font-mono">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              4. Giới hạn từ chối in ấn
            </h2>
            <p className="text-slate-400 leading-relaxed">
              PrintHub 3D kiên quyết từ chối tiếp nhận và hủy lập tức mọi yêu cầu in ấn đối với: Các chi tiết vũ khí, công cụ nguy hiểm, linh kiện súng đạn, văn hóa phẩm độc hại hoặc các thiết kế vi phạm pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            </p>
          </div>

          {/* Support Bar */}
          <div className="bg-gradient-to-r from-[#11141e] to-[#0a0c12] border border-[#39FF14]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-white">Cần giải đáp điều khoản đơn hàng?</h3>
              <p className="text-xs text-slate-400 font-mono">Xưởng PrintHub 3D sẵn sàng hỗ trợ giải quyết thỏa đáng mọi vấn đề của bạn.</p>
            </div>
            <Link
              to="/help-center"
              className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold text-xs uppercase tracking-wider font-mono transition shadow-md shadow-emerald-950/50 shrink-0"
            >
              Liên hệ chúng tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

