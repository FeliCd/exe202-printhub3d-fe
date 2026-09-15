import { useState } from 'react';
import { AlertTriangle, MessageSquare, Send, Scale } from 'lucide-react';
import type { Dispute } from '../types';
import { formatPrice } from '../utils/format';

const sampleDisputes: Dispute[] = [
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
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(sampleDisputes);
  const [orderId, setOrderId] = useState('ORD-8821');
  const [amount, setAmount] = useState(55000);
  const [reason, setReason] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'Khách hàng', text: 'Tôi nhận thước 25cm thay vì 30cm như đơn hàng.', time: '16:30' },
    { sender: 'Xưởng in', text: 'Xưởng xin lỗi vì nhầm lẫn cữ cắt, đang kiểm tra lại camera khâu đóng gói.', time: '16:45' },
    { sender: 'Admin PrintHub', text: 'Admin đã ghi nhận minh chứng. Đang xem xét hoàn tiền 100% vào Ví PrintHub.', time: '17:00' },
  ]);

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    const newDisp: Dispute = {
      id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      buyerName: 'Nguyễn Văn Anh',
      factoryName: 'Xưởng In Bách Khoa Makerlab',
      amount,
      reason: reason || 'Khiếu nại chất lượng sản phẩm thước in 3D',
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setDisputes((prev) => [newDisp, ...prev]);
    setReason('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatLog((prev) => [...prev, { sender: 'Khách hàng', text: newMsg, time: 'Vừa xong' }]);
    setNewMsg('');
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-red-400">
          <Scale className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Trung Tâm Giải Quyết Tranh Chấp &amp; Khiếu Nại</h1>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Gửi khiếu nại, làm việc trực tiếp với Quản trị viên Admin &amp; Xưởng sản xuất để nhận bồi hoàn tiền vào Ví.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCreateDispute} className="p-6 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Mở Khiếu Nại Đơn Hàng Mới
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Mã đơn hàng khiếu nại</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Số tiền yêu cầu đền bù (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-300">Lý do khiếu nại &amp; Minh chứng chi tiết</label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nêu rõ sai sót của xưởng in (sai kích thước, cong vênh, giao thiếu...)"
                className="w-full bg-[#111215] border border-[#272930] rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-950/40"
            >
              Gửi Khiếu Nại Yêu Cầu Bồi Hoàn
            </button>
          </form>

          {/* Interactive Chat Box */}
          <div className="p-5 rounded-2xl bg-[#18191d] border border-[#272930] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#22c55e]" /> Trao Đổi Minh Chứng Trực Tiếp (Tri-party Chat)
            </h3>

            <div className="p-4 rounded-xl bg-[#111215] border border-[#272930] max-h-56 overflow-y-auto space-y-3 text-xs">
              {chatLog.map((c, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    c.sender === 'Khách hàng'
                      ? 'bg-[#22c55e]/15 border border-[#22c55e]/30 text-emerald-300 ml-auto'
                      : c.sender === 'Admin PrintHub'
                      ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                      : 'bg-[#1e2025] border border-[#272930] text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-80 mb-0.5">
                    <span>{c.sender}</span>
                    <span>{c.time}</span>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 text-xs">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Gửi phản hồi / hình ảnh chứng cứ..."
                className="flex-1 bg-[#111215] border border-[#272930] rounded-xl px-3 py-2.5 text-white outline-none"
              />
              <button type="submit" className="px-4 py-2.5 bg-[#22c55e] text-slate-950 font-bold rounded-xl flex items-center gap-1">
                <Send className="w-4 h-4" /> Gửi
              </button>
            </form>
          </div>
        </div>

        {/* Existing Disputes */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Danh Sách Khiếu Nại ({disputes.length})</h3>
          <div className="space-y-3">
            {disputes.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-[#18191d] border border-[#272930] text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-red-400">{d.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 text-[10px] font-bold">
                    {d.status}
                  </span>
                </div>
                <p className="font-bold text-white">Đơn hàng: {d.orderId}</p>
                <p className="text-emerald-400 font-bold">Số tiền: {formatPrice(d.amount)}đ</p>
                <p className="text-[#94a3b8] text-[11px]">{d.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
