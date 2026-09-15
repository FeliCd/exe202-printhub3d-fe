import { DollarSign, ArrowUpRight, Download } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function AdminFinancePage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400">
            <DollarSign className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Báo Cáo Tài Chính &amp; Doanh Thu Platform (Finance &amp; Revenue)</h1>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Thống kê tổng giá trị giao dịch (GMV), chiết khấu sàn 5%, dòng tiền Nạp/Rút Ví PrintHub và đối soát thanh toán cho các Xưởng In.
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-[#111215] border border-[#272930] hover:border-purple-400 text-slate-200 font-bold text-xs flex items-center gap-2 transition shadow-lg shrink-0">
          <Download className="w-4 h-4 text-purple-400" /> Xuất Báo Cáo Excel
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Tổng Doanh Số GMV Hệ Thống</p>
          <p className="text-2xl font-black text-white">{formatPrice(128400000)}đ</p>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.5% so với tháng trước
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Lợi Nhuận Chiết Khấu Sàn (5%)</p>
          <p className="text-2xl font-black text-[#39FF14]">{formatPrice(6420000)}đ</p>
          <span className="text-[10px] text-[#94a3b8]">Thu phí sàn duy trì server</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Số Dư Ví PrintHub Sinh Viên</p>
          <p className="text-2xl font-black text-cyan-400">{formatPrice(45200000)}đ</p>
          <span className="text-[10px] text-cyan-400 font-bold">142 tài khoản có dư</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-2">
          <p className="text-xs text-[#94a3b8]">Thanh Toán Cho Các Xưởng In</p>
          <p className="text-2xl font-black text-purple-400">{formatPrice(121980000)}đ</p>
          <span className="text-[10px] text-[#94a3b8]">Đã chi trả 95% giá trị</span>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nhật Ký Giao Dịch Tài Chính Gần Đây</h3>

        <div className="divide-y divide-[#272930]">
          {[
            { id: 'TXN-9021', user: 'Nguyễn Văn Anh', type: 'Nạp tiền VietQR', amount: 500000, status: 'Thành công', date: '2026-09-03 09:12' },
            { id: 'TXN-9020', user: 'BK-Makerlab Xưởng In', type: 'Đối soát chi trả xưởng', amount: 14850000, status: 'Thành công', date: '2026-09-02 18:40' },
            { id: 'TXN-9018', user: 'Lê Văn Cường', type: 'Hoàn tiền hủy đơn', amount: 210000, status: 'Thành công', date: '2026-09-01 11:20' },
          ].map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-purple-400 font-bold">{t.id}</span>
                <h4 className="font-bold text-white text-xs">{t.type} - {t.user}</h4>
                <p className="text-[#94a3b8] text-[11px]">{t.date}</p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-[#39FF14] font-mono block">{formatPrice(t.amount)}đ</span>
                <span className="text-[10px] text-emerald-400 font-bold">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
