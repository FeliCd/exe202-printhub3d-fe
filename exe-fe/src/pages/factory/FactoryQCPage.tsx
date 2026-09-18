import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { factoryService } from '../../services/factoryService';

interface QCItem {
  id: string;
  orderId: string;
  productName: string;
  printedQty: number;
  postProcessSteps: string[];
  qcStatus: 'PENDING_QC' | 'PASS' | 'FAIL';
  defectReason?: string;
  inspectedBy?: string;
}

const mockQCs: QCItem[] = [
  {
    id: 'QC-101',
    orderId: 'ORD-9024',
    productName: 'Thước Kỹ Thuật PLA Pro 20cm (Khắc MSSV 20210123)',
    printedQty: 1,
    postProcessSteps: ['Gọt ba-via viền mép', 'Kiểm tra độ thẳng cữ 0.1mm', 'Xử lý nhiệt nhẹ mặt vạch số'],
    qcStatus: 'PENDING_QC',
  },
  {
    id: 'QC-102',
    orderId: 'ORD-8812',
    productName: 'Thước Vuông Chữ T Đồ Án Kiến Trúc 30cm (PETG)',
    printedQty: 3,
    postProcessSteps: ['Đo góc vuông 90° bằng thước eke chuẩn', 'Vát cạnh trượt chì kỹ thuật'],
    qcStatus: 'PASS',
    inspectedBy: 'KTV. Nguyễn Văn A',
  },
  {
    id: 'QC-098',
    orderId: 'ORD-7510',
    productName: 'Thước Kẹp Vernier 150mm Resin UV',
    printedQty: 1,
    postProcessSteps: ['Rửa Isopropyl Alcohol 99%', 'Chiếu tia UV 405nm'],
    qcStatus: 'FAIL',
    defectReason: 'Bị cong vênh bề mặt do quá nhiệt tia UV.',
    inspectedBy: 'KTV. Trần Văn B',
  },
];

export default function FactoryQCPage() {
  const [qcs, setQcs] = useState<QCItem[]>(mockQCs);

  useEffect(() => {
    const fetchQC = async () => {
      try {
        const res = await factoryService.getQCItems();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setQcs(data);
        }
      } catch (error) {
        console.warn('Backend QC API error, using mock QC data:', error);
      }
    };
    fetchQC();
  }, []);

  const handleSetStatus = async (id: string, status: 'PASS' | 'FAIL') => {
    try {
      await factoryService.updateQCStatus(id, status);
    } catch (error) {
      console.warn('Backend updateQCStatus error, updating locally:', error);
    }

    setQcs(prev =>
      prev.map(q =>
        q.id === id
          ? {
              ...q,
              qcStatus: status,
              inspectedBy: 'KTV. Nguyễn Văn A',
              defectReason: status === 'FAIL' ? 'Phát hiện mẻ vạch chia số góc 45°' : undefined,
            }
          : q
      )
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="flex items-center gap-2 text-cyan-400">
          <ShieldCheck className="w-6 h-6" />
          <h1 className="text-2xl font-black text-white">Kiểm Soát Chất Lượng (QC) &amp; Xử Lý Sau In</h1>
        </div>
        <p className="text-sm text-text-muted">
          Tách support, chà nhám, đo kính hiển vi dung sai và đánh giá Đạt (Pass) / Lỗi (Fail) trước khi xuất kho.
        </p>
      </div>

      <div className="space-y-4">
        {qcs.map(q => (
          <div key={q.id} className="p-5 rounded-2xl bg-surface border border-border text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{q.id} • Đơn {q.orderId}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{q.productName}</h3>
                <p className="text-text-muted text-sm">Số lượng hoàn thiện: {q.printedQty} cái</p>
              </div>

              <div>
                {q.qcStatus === 'PENDING_QC' && (
                  <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" /> Đang xử lý sau in (QC)
                  </span>
                )}
                {q.qcStatus === 'PASS' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT CHUẨN QC (PASS)
                  </span>
                )}
                {q.qcStatus === 'FAIL' && (
                  <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-xs flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> LỖI SẢN XUẤT (FAIL)
                  </span>
                )}
              </div>
            </div>

            {/* Steps Checklist */}
            <div className="p-3 bg-surface-inset rounded-xl border border-border space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">Quy trình xử lý sau in bắt buộc:</span>
              <div className="flex flex-wrap gap-2">
                {q.postProcessSteps.map((step, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface border border-border text-slate-300 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> {step}
                  </span>
                ))}
              </div>
            </div>

            {q.defectReason && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
                <strong>Lý do loại bỏ:</strong> {q.defectReason}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
              <span className="text-text-muted text-xs">Kỹ thuật viên QC: <strong className="text-white">{q.inspectedBy || 'Chờ nghiệm thu'}</strong></span>

              {q.qcStatus === 'PENDING_QC' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetStatus(q.id, 'FAIL')}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <XCircle className="w-4 h-4" /> Báo Lỗi (Fail)
                  </button>
                  <button
                    onClick={() => handleSetStatus(q.id, 'PASS')}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs flex items-center gap-1 transition shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Xác Nhận Đạt (Pass)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
