import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0c] border-t border-border mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ================================================================= */}
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU & LIÊN HỆ */}
          {/* ================================================================= */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white font-black text-lg tracking-tight group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#39FF14] to-primary flex items-center justify-center text-slate-950 shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform font-black">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" x2="12" y1="22.08" y2="12" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-wide">
                PrintHub <span className="text-[#39FF14]">3D</span>
              </span>
            </Link>

            <p className="text-slate-300 leading-relaxed text-xs font-normal">
              Nền tảng chế tác mô hình 3D công nghiệp &amp; thiết bị kỹ thuật chuẩn xác 0.1mm dành riêng cho học sinh, sinh viên và kỹ sư trẻ.
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Hotline: <strong className="text-white font-mono">0786954657</strong> (Hỗ trợ 8h - 22h)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Email: <a href="mailto:support@inbound.printhub3d.vn" className="text-white hover:text-[#39FF14] transition">support@inbound.printhub3d.vn</a></span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <span>Địa chỉ: Làng đại học, đại học Quốc Gia TP. Hồ Chí Minh.</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61594639307920"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook PrintHub 3D"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-border flex items-center justify-center text-slate-300 hover:text-[#39FF14] hover:border-[#39FF14]/60 transition"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@3d_printingcustom"
                target="_blank"
                rel="noreferrer"
                aria-label="Tiktok PrintHub 3D"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-border flex items-center justify-center text-slate-300 hover:text-[#39FF14] hover:border-[#39FF14]/60 transition"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub PrintHub 3D"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-border flex items-center justify-center text-slate-300 hover:text-[#39FF14] hover:border-[#39FF14]/60 transition"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CỘT 2: SẢN PHẨM & DỊCH VỤ */}
          {/* ================================================================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
              Sản Phẩm &amp; Dịch Vụ
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/catalog" className="text-slate-300 hover:text-[#39FF14] transition flex items-center justify-between group">
                  <span>Sản phẩm &amp; BST Thước</span>
                  <span className="text-[10px] text-text-muted group-hover:text-[#39FF14]">FDM / PETG &rarr;</span>
                </Link>
              </li>
              <li>
                <Link to="/custom" className="text-slate-300 hover:text-[#39FF14] transition flex items-center justify-between group">
                  <span>In 3D Theo Yêu Cầu</span>
                  <span className="text-[10px] text-text-muted group-hover:text-[#39FF14]">Báo giá 15p &rarr;</span>
                </Link>
              </li>
              <li>
                <Link to="/bulk-order" className="text-slate-300 hover:text-[#39FF14] transition flex items-center justify-between group">
                  <span>Đặt Hàng Hàng Loạt</span>
                  <span className="text-[10px] text-primary">Giảm 35% &rarr;</span>
                </Link>
              </li>
              <li>
                <Link to="/custom" className="text-[#39FF14] font-bold hover:underline flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tự Custom Thước 3D (Xem 3D ngay)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ================================================================= */}
          {/* CỘT 3: TRANG HỆ THỐNG */}
          {/* ================================================================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Trang Hệ Thống
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/help-center" className="text-slate-300 hover:text-[#39FF14] transition flex items-center justify-between">
                  <span>Trung tâm trợ giúp</span>
                  <span className="text-[10px] text-primary">Hỗ trợ 24/7</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@3d_printingcustom/video/7697579795567136007"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-[#39FF14] transition flex items-center justify-between group"
                >
                  <span>Hướng dẫn sử dụng</span>
                  <span className="text-[10px] text-primary group-hover:text-[#39FF14] flex items-center gap-1">
                    Video TikTok
                    <ExternalLink className="w-3 h-3 inline-block" />
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Về PrintHub 3D</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-400">
                    Sắp ra mắt
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Chính sách bảo mật</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-400">
                    Sắp ra mắt
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Điều khoản dịch vụ</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-400">
                    Sắp ra mắt
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ================================================================= */}
        {/* DÒNG CUỐI: COPYRIGHT */}
        {/* ================================================================= */}
        <div className="mt-10 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-400">
          <p className="text-xs">
            &copy; {currentYear} <span className="text-white font-bold">PrintHub 3D</span>. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
