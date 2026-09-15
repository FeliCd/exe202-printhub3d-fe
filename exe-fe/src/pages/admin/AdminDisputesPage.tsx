import { useState } from 'react';
import { Scale, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import type { Dispute } from '../../types';
import { useWallet } from '../../context/WalletContext';

const sampleAdminDisputes: Dispute[] = [
  {
    id: 'DISP-4012',
    orderId: 'ORD-8821',
    buyerName: 'Nguyễn Văn Anh',
    factoryName: 'Xưởng In Bách Khoa Makerlab',
    amount: 55000,
    reason: 'Thước giao sai kích thước 25cm thay vì 30cm như mô tả đặt in',
    status: 'OPEN',
    createdAt: '2026-09-02 16:30',
  },
  {
    id: 'DISP-3990',
    orderId: 'ORD-8710',
    buyerName: 'Trần Minh Đức',
    factoryName: 'Xưởng In SLA Formlabs Q10',
    amount: 120000,
    reason: 'Bề mặt nhựa resin bị nổi bọt khí và cong vênh cữ lắp ghép',
    status: 'UNDER_REVIEW',
    createdAt: '2026-08-29 11:10',
  },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(sampleAdminDisputes);
  const { refund } = useWallet();

  const handleResolve = (id: string, action: 'FULL' | 'PARTIAL' | 'REJECT') => {
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          if (action === 'FULL') {
            refund(d.amount, `Hoàn tiền 100% khiếu nại ca ${d.id}`);
            return { ...d, status: 'RESOLVED_REFUND_FULL', adminDecisionNotes: 'Admin duyệt hoàn tiền 100% vào Ví Khách Hàng.' };
          } else if (action === 'PARTIAL') {
            refund(d.amount * 0.5, `Hoàn tiền 50% khiếu nại ca ${d.id}`);
            return { ...d, status: 'RESOLVED_REFUND_PARTIAL', adminDecisionNotes: 'Admin duyệt đền bù 50% giá trị đơn.' };
          } else {
            return { ...d, status: 'REJECTED', adminDecisionNotes: 'Admin từ chối khiếu nại do minh chứng chưa đủ căn cứ.' };
          }
        }
        return d;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-red-400">
          <Scale className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Quản Lý Phê Duyệt Tranh Chấp Admin (Dispute Resolution)</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">Xem xét minh chứng từ Khách hàng &amp; Xưởng sản xuất để đưa ra phán quyết hoàn tiền đền bù</p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#272930] pb-3">
              <div>
                <span className="font-mono text-red-400 font-bold">{d.id}</span>
                <span className="text-white font-bold ml-3">Đơn hàng: {d.orderId}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-[10px]">
                {d.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#111215] p-3 rounded-xl border border-[#272930]">
              <div>Khách hàng khiếu nại: <strong className="text-white">{d.buyerName}</strong></div>
              <div>Xưởng in bị tố cáo: <strong className="text-white">{d.factoryName}</strong></div>
              <div>Số tiền khiếu nại: <strong className="text-[#22c55e]">{formatPrice(d.amount)}đ</strong></div>
            </div>

            <p className="text-slate-300">Nội dung: {d.reason}</p>

            {d.adminDecisionNotes ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl font-semibold">
                Phán quyết Admin: {d.adminDecisionNotes}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#272930]">
                <button
                  onClick={() => handleResolve(d.id, 'FULL')}
                  className="px-4 py-2 rounded-xl bg-[#22c55e] text-slate-950 font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Hoàn Tiền 100% Ví Khách
                </button>
                <button
                  onClick={() => handleResolve(d.id, 'PARTIAL')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-1"
                >
                  <DollarSign className="w-4 h-4" /> Đền Bù 50% Giá Trị
                </button>
                <button
                  onClick={() => handleResolve(d.id, 'REJECT')}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Từ Chối Khiếu Nại
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
