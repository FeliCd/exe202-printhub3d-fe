import { useState, useMemo } from 'react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send, post } from '../../services/api';
import { downloadFile } from '../../services/fileVaultService';
import { payOrder } from '../../services/paymentService';
import type { CustomDTO } from '../../services/quotationService';
import { Notice, money } from '../../components/DataUI';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Ruler,
  Layers,
  Palette,
  User,
  Phone,
  MapPin,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  QrCode,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Box,
  Truck,
  Printer,
  ChevronRight,
  FileCode,
  ShieldCheck,
  Send,
  PlusCircle,
  FileUp,
  ArrowRight,
} from 'lucide-react';

/* ========================================================================= */
/* 1. DATA PARSING HELPERS                                                   */
/* ========================================================================= */
interface ParsedRequirements {
  modelName: string;
  material: string;
  infill: string;
  infillNum: number;
  bodyColor: string;
  plateColor: string;
  textColor: string;
  engraveName?: string;
  studentId?: string;
  fontName?: string;
  stickersCount?: string;
  notes?: string;
  preferredPayment?: string;
}

function parseOrderRequirements(reqText: string, dto: CustomDTO): ParsedRequirements {
  const text = reqText || '';

  // 1. Model name
  let modelName = dto.rulerModel || '';
  if (!modelName) {
    const match = text.match(/Mẫu thước:\s*([^;]+)/i);
    if (match) modelName = match[1].trim();
  }
  if (!modelName) modelName = 'Thước In 3D Kỹ Thuật';

  // 2. Material
  let material = 'PLA Pro+ (Chống cong vênh)';
  const matMatch = text.match(/Vật liệu:\s*([^;]+)/i);
  if (matMatch) material = matMatch[1].trim();

  // 3. Infill
  let infill = '20%';
  let infillNum = 20;
  const infillMatch = text.match(/(?:Độ đặc|infill):\s*([^;]+)/i);
  if (infillMatch) {
    infill = infillMatch[1].trim();
    const num = parseInt(infill.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) infillNum = num;
  }

  // 4. 3-Layer Colors
  const allHex = (text + ' ' + (dto.color || '')).match(/#[0-9a-fA-F]{6}/g) || [];
  const bodyColor = allHex[0] || '#39FF14';
  const plateColor = allHex[1] || '#1C1D22';
  const textColor = allHex[2] || '#FFFFFF';

  // 5. Engraving details
  let engraveName = dto.customName || '';
  let studentId = dto.customStudentId || '';
  let fontName = dto.fontStyle || '';

  if (!engraveName) {
    const nameMatch = text.match(/Khắc tên:\s*([^(;\n]+)/i);
    if (nameMatch) engraveName = nameMatch[1].trim();
  }
  if (!studentId) {
    const idMatch = text.match(/MSSV:\s*([^);]+)/i);
    if (idMatch) studentId = idMatch[1].trim();
  }
  if (!fontName) {
    const fontMatch = text.match(/Font:\s*([^;]+)/i);
    if (fontMatch) fontName = fontMatch[1].trim();
  }

  // 6. Stickers & Notes
  let stickersCount: string | undefined;
  const stickMatch = text.match(/sticker[^:]*:\s*([^;]+)/i);
  if (stickMatch) stickersCount = stickMatch[1].trim();

  let notes: string | undefined;
  const noteMatch = text.match(/Ghi chú[^:]*:\s*([^;]+)/i);
  if (noteMatch) notes = noteMatch[1].trim();

  // 7. Preferred Payment
  let preferredPayment = dto.paymentMethod || '';
  if (!preferredPayment) {
    const payMatch = text.match(/Phương thức[^:]*:\s*([^;]+)/i);
    if (payMatch) preferredPayment = payMatch[1].trim();
  }

  return {
    modelName,
    material,
    infill,
    infillNum,
    bodyColor,
    plateColor,
    textColor,
    engraveName: engraveName || undefined,
    studentId: studentId || undefined,
    fontName: fontName || undefined,
    stickersCount,
    notes,
    preferredPayment: preferredPayment || 'PAYOS',
  };
}

interface ParsedShipping {
  recipient: string;
  phone: string;
  address: string;
}

function parseShippingAddress(addrText: string, buyerName?: string): ParsedShipping {
  if (!addrText) {
    return {
      recipient: buyerName || 'Khách hàng PrintHub',
      phone: '',
      address: 'Chưa có thông tin địa chỉ giao nhận',
    };
  }

  if (addrText.includes('·')) {
    const parts = addrText.split('·').map(p => p.trim());
    return {
      recipient: parts[0] || buyerName || 'Khách hàng',
      phone: parts[1] || '',
      address: parts.slice(2).join(' · ') || addrText,
    };
  }

  return {
    recipient: buyerName || 'Khách hàng PrintHub',
    phone: '',
    address: addrText,
  };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function renderStatusBadge(status?: string) {
  const s = (status || 'REQUESTED').toUpperCase();
  switch (s) {
    case 'REQUESTED':
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/50 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20 shadow-sm">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Chờ báo giá</span>
        </span>
      );
    case 'QUOTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/60 bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Đã có báo giá</span>
        </span>
      );
    case 'ACCEPTED':
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đã chấp nhận</span>
        </span>
      );
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đã thanh toán</span>
        </span>
      );
    case 'PREPARING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/50 bg-indigo-500/15 text-indigo-300 shadow-sm">
          <Box className="w-3.5 h-3.5 text-indigo-400" />
          <span>Chuẩn bị phôi in</span>
        </span>
      );
    case 'PRINTING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/60 bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40 shadow-sm">
          <Printer className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
          <span>Đang in 3D</span>
        </span>
      );
    case 'SHIPPING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/50 bg-blue-500/15 text-blue-300 shadow-sm">
          <Truck className="w-3.5 h-3.5 text-blue-400" />
          <span>Đang giao hàng</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-sm">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hoàn thành</span>
        </span>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Đã hủy</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300">
          <span>{status}</span>
        </span>
      );
  }
}

/* ========================================================================= */
/* 2. CUSTOM REQUEST FORM (UPLOAD TAB)                                       */
/* ========================================================================= */
export function CustomRequestForm({
  bulk = false,
  onCreated,
}: {
  bulk?: boolean;
  onCreated?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const action = useAction(onCreated);
  const [files, setFiles] = useState<File[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [requirements, setRequirements] = useState('');
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="p-8 rounded-3xl border border-border bg-surface text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Yêu cầu đăng nhập</h3>
        <p className="text-sm text-slate-400">
          Vui lòng đăng nhập để gửi tệp thiết kế 3D và nhận báo giá từ xưởng PrintHub.
        </p>
        <Link
          to={`/login?redirect=${bulk ? '/bulk-order' : '/custom'}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-primary/20 text-sm"
        >
          Đăng nhập ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex items-center gap-3.5 pb-6 border-b border-border/80">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <FileUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">
            {bulk ? 'Gửi Lô Thiết Kế Nhận Báo Giá Số Lượng Lớn' : 'Gửi Tệp Thiết Kế 3D Yêu Cầu Báo Giá'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tải lên file STL/OBJ/STEP để kỹ thuật viên thẩm định kết cấu in và gửi báo giá chính xác.
          </p>
        </div>
      </div>

      <Notice error={action.error} />
      {success && (
        <div className="my-4 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form
        className="space-y-6 mt-6"
        onSubmit={async e => {
          e.preventDefault();
          setSuccess('');
          let completed = 0;
          const ok = await action.run(async () => {
            if (!files.length) throw new Error('Vui lòng chọn ít nhất một tệp thiết kế 3D.');
            for (const file of files) {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('folder', 'printhub3d/custom_prints');
              const res = await post('/upload/raw', formData);
              const attachmentUrl = res.data?.result || res.data;
              await send('/custom-orders', {
                attachmentUrl,
                requirements,
                quantity,
                shippingAddress: address,
              });
              completed++;
              setFiles(prev => prev.filter(f => f !== file));
            }
          });
          if (ok) {
            setSuccess(`Đã gửi thành công ${completed} yêu cầu in! Hãy chuyển sang tab Báo giá để theo dõi.`);
            setRequirements('');
          } else if (completed) {
            setSuccess(`Đã gửi ${completed} tệp. Các tệp còn lại chưa xong, bạn có thể thử lại.`);
          }
        }}
      >
        {/* File Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            Tệp thiết kế 3D (.STL, .OBJ, .STEP) <span className="text-rose-400">*</span>
          </label>
          <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition rounded-2xl p-6 text-center bg-surface-inset/60">
            <input
              type="file"
              accept=".stl,.obj,.step,.stp"
              multiple={bulk}
              required={!files.length}
              onChange={e => setFiles(Array.from(e.target.files || []))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <Download className="w-8 h-8 text-primary mx-auto opacity-80" />
              <p className="text-sm font-semibold text-white">
                Kéo thả file thiết kế vào đây hoặc <span className="text-primary underline">chọn tệp</span>
              </p>
              <p className="text-xs text-slate-400">
                Hỗ trợ STL, OBJ, STEP (tối đa 20MB mỗi tệp)
              </p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {files.map(f => (
                <span
                  key={f.name}
                  className="px-3 py-1 rounded-xl bg-surface-inset border border-border text-xs text-slate-300 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono">{f.name}</span>
                  <span className="text-[10px] text-slate-500">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Số lượng in (cây / cái) <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            required
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-surface-inset px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Technical Requirements */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-purple-400" />
            Yêu cầu kỹ thuật & Vật liệu <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            maxLength={4000}
            required
            placeholder="Ví dụ: Thước dài 20cm, nhựa PLA Pro+ màu Emerald, độ đặc Infill 20%, khắc tên 'Nguyễn Văn A' laser chìm..."
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-inset p-3 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Shipping Address */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Thông tin người nhận & Địa chỉ giao hàng <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            maxLength={1000}
            required
            placeholder="Ví dụ: Lê Quốc Khánh · 0786954657 · Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-inset p-3 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={action.busy}
            className="w-full py-3.5 rounded-xl bg-primary text-slate-950 font-black hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-primary/20 uppercase tracking-tight cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{action.busy ? 'Đang tải file & gửi yêu cầu...' : 'Gửi Yêu Cầu Báo Giá'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================================= */
/* 3. CUSTOM REQUESTS - BEAUTIFIED LISTING PAGE                              */
/* ========================================================================= */
export function CustomRequests({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<CustomDTO[]>(admin ? '/admin/custom-orders' : '/custom-orders');
  const action = useAction(remote.reload);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const next = (c: CustomDTO) =>
    ({
      ACCEPTED: c.paymentMethod === 'COD' ? 'PRINTING' : '',
      PAID: 'PRINTING',
      PRINTING: 'SHIPPING',
      SHIPPING: 'COMPLETED',
    }[c.status]);

  // Filter tabs logic
  const allOrders = useMemo(() => remote.data || [], [remote.data]);

  const counts = useMemo(() => {
    return {
      ALL: allOrders.length,
      REQUESTED: allOrders.filter(o => ['REQUESTED', 'PENDING'].includes(o.status)).length,
      QUOTED: allOrders.filter(o => o.status === 'QUOTED').length,
      PROCESSING: allOrders.filter(o => ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING'].includes(o.status)).length,
      COMPLETED: allOrders.filter(o => ['SHIPPING', 'COMPLETED'].includes(o.status)).length,
      CANCELLED: allOrders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status)).length,
    };
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'ALL') return allOrders;
    if (activeFilter === 'REQUESTED') return allOrders.filter(o => ['REQUESTED', 'PENDING'].includes(o.status));
    if (activeFilter === 'QUOTED') return allOrders.filter(o => o.status === 'QUOTED');
    if (activeFilter === 'PROCESSING') return allOrders.filter(o => ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING'].includes(o.status));
    if (activeFilter === 'COMPLETED') return allOrders.filter(o => ['SHIPPING', 'COMPLETED'].includes(o.status));
    if (activeFilter === 'CANCELLED') return allOrders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status));
    return allOrders;
  }, [allOrders, activeFilter]);

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* PAGE HEADER & QUICK ACTIONS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-primary/20 border border-primary/40 text-primary">
              <Ruler className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {admin ? 'Quản Trị Báo Giá & Yêu Cầu In 3D' : 'Báo Giá & Tiến Độ Yêu Cầu In 3D'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {admin
                  ? 'Tiếp nhận tệp thiết kế CAD/STL, báo giá đơn hàng và điều phối tiến độ máy in.'
                  : 'Theo dõi trực quan tiến độ thẩm định file 3D, báo giá từ xưởng và quy trình gia công.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => remote.reload()}
            disabled={remote.loading}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-inset text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${remote.loading ? 'animate-spin text-primary' : ''}`} />
            <span>Làm mới</span>
          </button>

          {!admin && (
            <Link
              to="/custom"
              className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 active:scale-[0.98] transition flex items-center gap-2 text-xs shadow-lg shadow-primary/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thiết kế thước mới</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TABS                                                               */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'ALL', label: 'Tất cả', count: counts.ALL },
          { key: 'REQUESTED', label: 'Chờ báo giá', count: counts.REQUESTED, color: 'text-amber-400' },
          { key: 'QUOTED', label: 'Đã báo giá', count: counts.QUOTED, color: 'text-cyan-400' },
          { key: 'PROCESSING', label: 'Đang sản xuất', count: counts.PROCESSING, color: 'text-purple-400' },
          { key: 'COMPLETED', label: 'Đã hoàn thành', count: counts.COMPLETED, color: 'text-emerald-400' },
          { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED, color: 'text-rose-400' },
        ].map(tab => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                  : 'border border-border bg-surface hover:border-slate-600 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-black/30 text-slate-950' : 'bg-surface-inset text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <Notice error={action.error} />

      {/* Loading state */}
      {remote.loading && (
        <div className="p-12 text-center rounded-3xl border border-border bg-surface space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Đang tải danh sách yêu cầu in 3D...</p>
        </div>
      )}

      {/* Empty State */}
      {!remote.loading && filteredOrders.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-border bg-surface space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-surface-inset border border-border flex items-center justify-center text-slate-500 mx-auto">
            <Ruler className="w-8 h-8 opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Chưa có yêu cầu nào trong mục này</h3>
            <p className="text-xs text-slate-400">
              {activeFilter === 'ALL'
                ? 'Bạn chưa gửi yêu cầu gia công thước in 3D nào. Hãy bắt đầu tạo thước ngay!'
                : 'Không có đơn in 3D nào khớp với bộ lọc đã chọn.'}
            </p>
          </div>
          {!admin && (
            <Link
              to="/custom"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-primary/20 text-xs"
            >
              <PlusCircle className="w-4 h-4" /> Mở công cụ thiết kế Thước 3D
            </Link>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIVID & BEAUTIFIED REQUEST CARDS LIST                                      */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {filteredOrders.map(c => {
          const req = parseOrderRequirements(c.requirements, c);
          const ship = parseShippingAddress(c.shippingAddress, c.buyerName);
          const orderMethod = method[c.id] || c.paymentMethod || 'PAYOS';

          return (
            <div
              key={c.id}
              className="rounded-3xl border border-border/80 bg-surface hover:border-slate-600 transition-all duration-300 shadow-xl overflow-hidden relative group"
            >
              {/* Subtle neon gradient top accent line */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 opacity-70 group-hover:opacity-100 transition" />

              <div className="p-5 sm:p-7 space-y-6">
                {/* ------------------------------------------------------------- */}
                {/* A. CARD HEADER: Order ID, Model Name, Time, Status Pill        */}
                {/* ------------------------------------------------------------- */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-border/70">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="p-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary">
                        <Ruler className="w-4 h-4" />
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {req.modelName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-surface-inset border border-border text-xs font-mono font-bold text-primary">
                        Số lượng: x{c.quantity || 1} cây
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <button
                        onClick={() => copyToClipboard(c.id)}
                        className="inline-flex items-center gap-1.5 font-mono text-slate-300 hover:text-white bg-surface-inset px-2.5 py-1 rounded-lg border border-border/60 transition"
                        title="Sao chép mã yêu cầu"
                      >
                        <span className="text-slate-500">Mã đơn:</span>
                        <span>#{c.id.substring(0, 8)}...</span>
                        {copiedId === c.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>

                      {c.createdAt && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDate(c.createdAt)}
                        </span>
                      )}

                      {admin && c.buyerName && (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                          <User className="w-3 h-3 text-primary" /> Khách: {c.buyerName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {renderStatusBadge(c.status)}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* B. STRUCTURED GRID: 3 VIVID MODULES                            */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  {/* MODULE 1: IN ẤN & THÔNG SỐ KỸ THUẬT */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-surface-inset/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                        <Layers className="w-4 h-4" /> Thông Số Kỹ Thuật 3D
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                          <span className="text-slate-400">Vật liệu in:</span>
                          <span className="font-semibold text-white">{req.material}</span>
                        </div>

                        {/* Infill Density Meter */}
                        <div className="space-y-1 pb-1.5 border-b border-border/40">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Độ đặc Infill:</span>
                            <span className="font-mono font-bold text-cyan-300">{req.infill}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(15, req.infillNum))}%` }}
                            />
                          </div>
                        </div>

                        {req.stickersCount && (
                          <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                            <span className="text-slate-400">Sticker trang trí:</span>
                            <span className="font-bold text-purple-300">{req.stickersCount}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Thanh toán dự kiến:</span>
                          <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-border text-[11px]">
                            {req.preferredPayment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Download 3D File Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => {
                          if (c.attachmentUrl?.startsWith('http')) {
                            window.open(c.attachmentUrl, '_blank');
                          } else if (c.attachmentUrl) {
                            void action.run(() => downloadFile(c.attachmentUrl, `design-${c.id}.stl`));
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải file 3D (.STL)</span>
                      </button>
                    </div>
                  </div>

                  {/* MODULE 2: BẢNG PHỐI MÀU 3 LỚP & KHẮC LASER */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-surface-inset/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                        <Palette className="w-4 h-4" /> Bảng Màu & Khắc Laser
                      </div>

                      {/* 3-Layer Color Swatches */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Bảng màu 3 lớp:</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Body Color */}
                          <div className="p-1.5 rounded-lg bg-surface border border-border/80 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.bodyColor }}
                            />
                            <span className="text-[10px] text-slate-400">Thân</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.bodyColor}
                            </span>
                          </div>

                          {/* Plate Color */}
                          <div className="p-1.5 rounded-lg bg-surface border border-border/80 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.plateColor }}
                            />
                            <span className="text-[10px] text-slate-400">Mặt biển</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.plateColor}
                            </span>
                          </div>

                          {/* Text Color */}
                          <div className="p-1.5 rounded-lg bg-surface border border-border/80 flex flex-col items-center gap-1 text-center">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: req.textColor }}
                            />
                            <span className="text-[10px] text-slate-400">Chữ số</span>
                            <span className="font-mono text-[9px] text-white truncate max-w-full font-bold">
                              {req.textColor}
                            </span>
                          </div>
                        </div>

                        {/* Combined color simulation strip */}
                        <div className="h-2 w-full rounded-full overflow-hidden flex border border-white/10 shadow-inner mt-1">
                          <div className="h-full flex-[5]" style={{ backgroundColor: req.bodyColor }} />
                          <div className="h-full flex-[3]" style={{ backgroundColor: req.plateColor }} />
                          <div className="h-full flex-[2]" style={{ backgroundColor: req.textColor }} />
                        </div>
                      </div>

                      {/* Laser Engraving Plate */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Khắc laser cá nhân hóa:</span>
                        {req.engraveName || req.studentId ? (
                          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 font-mono text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 tracking-wide text-sm">
                                {req.engraveName}
                              </span>
                              {req.studentId && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                                  MSSV: {req.studentId}
                                </span>
                              )}
                            </div>
                            {req.fontName && (
                              <p className="text-[10px] text-amber-400/70 font-sans">
                                Kiểu chữ: {req.fontName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl border border-border/60 bg-surface text-slate-500 text-xs italic text-center">
                            Không yêu cầu khắc laser
                          </div>
                        )}
                      </div>
                    </div>

                    {req.notes && (
                      <div className="pt-2 text-[11px] text-slate-300 italic bg-surface p-2 rounded-lg border border-border/60">
                        <strong className="text-slate-400 not-italic">Ghi chú:</strong> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* MODULE 3: ĐỊA CHỈ GIAO HÀNG & TIẾN TRÌNH */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-surface-inset/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <MapPin className="w-4 h-4" /> Địa Chỉ Nhận Hàng
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl border border-border/70 bg-surface space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary" /> {ship.recipient}
                            </span>
                            {ship.phone && (
                              <span className="text-slate-300 font-mono bg-surface-inset px-2 py-0.5 rounded border border-border text-[11px] flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-emerald-400" /> {ship.phone}
                              </span>
                            )}
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed pt-1">
                            {ship.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Checklist */}
                    <div className="space-y-1 text-[11px] text-slate-400 pt-2">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        <span>Chính sách: Miễn phí in lại nếu có lỗi kích thước/gãy vỡ do vận chuyển.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* C. QUOTATION & PAYMENT BANNER (DYNAMIC BY STATUS)              */}
                {/* ------------------------------------------------------------- */}

                {/* 1. STATUS: REQUESTED (Chờ báo giá) */}
                {['REQUESTED', 'PENDING'].includes(c.status) && (
                  <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-surface-inset to-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-300">
                          Xưởng PrintHub 3D đang phân tích file STL & thẩm định báo giá
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                          Kỹ thuật viên đang kiểm tra thông số cắt lớp (slicing), độ mịn lớp in 0.16mm và khối lượng nhựa PLA. Báo giá chính xác kèm thời gian bàn giao sẽ xuất hiện tại đây!
                        </p>
                      </div>
                    </div>

                    {!admin && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt in này?')) {
                            void action.run(() =>
                              send(`/custom-orders/${c.id}/status`, { status: 'CANCELLED' }, 'put')
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 transition text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hủy yêu cầu
                      </button>
                    )}
                  </div>
                )}

                {/* 2. STATUS: QUOTED (Đã có báo giá từ Admin) */}
                {c.status === 'QUOTED' && (
                  <div className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-950/50 via-surface-inset to-cyan-950/40 p-4 sm:p-5 shadow-lg shadow-emerald-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Báo giá trọn gói
                        </span>
                        <span className="text-xs text-slate-400">Cho {c.quantity || 1} sản phẩm hoàn thiện</span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono tracking-tight">
                          {money(c.quotedPrice || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Đã bao gồm: Vật liệu sợi in PLA Pro+, gia công in FDM độ chính xác cao và khắc laser tên/MSSV.
                      </p>
                    </div>

                    {!admin && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-surface-inset border border-border px-3 py-2 rounded-xl">
                          <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                          <select
                            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                            value={orderMethod}
                            onChange={e => setMethod({ ...method, [c.id]: e.target.value })}
                          >
                            <option value="PAYOS" className="bg-[#18191d] text-white">
                              Thanh toán PayOS (VietQR)
                            </option>
                            <option value="COD" className="bg-[#18191d] text-white">
                              Thanh toán khi nhận (COD)
                            </option>
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              send(
                                `/custom-orders/${c.id}/status`,
                                { status: 'ACCEPTED', paymentMethod: orderMethod },
                                'put'
                              )
                            )
                          }
                          className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-black hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 text-xs uppercase tracking-tight shadow-xl shadow-primary/25 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Chấp Nhận & Đặt In</span>
                        </button>

                        <button
                          type="button"
                          disabled={action.busy}
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
                              void action.run(() =>
                                send(`/custom-orders/${c.id}/status`, { status: 'CANCELLED' }, 'put')
                              );
                            }
                          }}
                          className="px-3.5 py-3 rounded-xl border border-border hover:border-rose-500/60 bg-surface-inset text-slate-400 hover:text-rose-300 transition text-xs cursor-pointer"
                          title="Hủy yêu cầu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STATUS: ACCEPTED & PAYOS (Cần thanh toán trước) */}
                {c.status === 'ACCEPTED' && c.paymentMethod === 'PAYOS' && (
                  <div className="rounded-2xl border border-primary/50 bg-primary/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Đơn hàng đã được duyệt — Cần hoàn tất thanh toán VietQR PayOS
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Số tiền: <strong className="text-primary font-mono">{money(c.quotedPrice || 0)}</strong>. Sau khi quét mã QR thanh toán thành công, máy in sẽ được tự động kích hoạt.
                        </p>
                      </div>
                    </div>

                    {!admin && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => void action.run(() => payOrder(c.id, 'CUSTOM_ORDER'))}
                        className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-black hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 text-xs uppercase tracking-tight shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Thanh toán ngay</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 4. STATUS: PRINTING / SHIPPING / COMPLETED (Hiển thị thanh tiến độ sản xuất) */}
                {['PRINTING', 'SHIPPING', 'COMPLETED'].includes(c.status) && (
                  <div className="p-4 rounded-2xl border border-border/80 bg-surface-inset/40 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-2">
                        {c.status === 'PRINTING' && <Printer className="w-4 h-4 text-purple-400 animate-spin-slow" />}
                        {c.status === 'SHIPPING' && <Truck className="w-4 h-4 text-blue-400" />}
                        {c.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        Tiến độ sản xuất & Bàn giao:
                      </span>
                      {c.quotedPrice && (
                        <span className="text-emerald-400 font-mono font-bold">
                          Giá chốt: {money(c.quotedPrice)} ({c.paymentMethod})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-bold">
                        1. Đã duyệt file
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          ['PRINTING', 'SHIPPING', 'COMPLETED'].includes(c.status)
                            ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 ring-1 ring-purple-500/30'
                            : 'bg-surface-inset border-border text-slate-500'
                        }`}
                      >
                        2. Đang in 3D
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          ['SHIPPING', 'COMPLETED'].includes(c.status)
                            ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/30'
                            : 'bg-surface-inset border-border text-slate-500'
                        }`}
                      >
                        3. Đang giao hàng
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                            : 'bg-surface-inset border-border text-slate-500'
                        }`}
                      >
                        4. Hoàn tất
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* D. ADMIN CONTROLS TOOLBAR                                     */}
                {/* ------------------------------------------------------------- */}
                {admin && (
                  <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-4 bg-surface-inset/40 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Bảng điều khiển quản trị viên xưởng:
                    </div>

                    {['REQUESTED', 'QUOTED'].includes(c.status) && (
                      <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const p = Number(prices[c.id]);
                          if (!p || p <= 0) {
                            alert('Vui lòng nhập giá hợp lệ.');
                            return;
                          }
                          void action.run(() =>
                            send(`/admin/custom-orders/${c.id}/quote`, { price: p }, 'put')
                          );
                        }}
                      >
                        <input
                          type="number"
                          min={1}
                          step={1000}
                          required
                          placeholder="Nhập giá trọn gói (VND)"
                          value={prices[c.id] || ''}
                          onChange={e => setPrices({ ...prices, [c.id]: e.target.value })}
                          className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-mono w-44"
                        />
                        <button
                          type="submit"
                          disabled={action.busy}
                          className="px-4 py-1.5 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                        >
                          Gửi báo giá
                        </button>
                      </form>
                    )}

                    {next(c) && (
                      <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => {
                          if (
                            c.paymentMethod === 'COD' &&
                            next(c) === 'COMPLETED' &&
                            !confirm('Bạn đã giao sản phẩm và thu đủ tiền COD từ khách hàng chưa?')
                          ) {
                            return;
                          }
                          void action.run(() =>
                            send(`/custom-orders/${c.id}/status`, { status: next(c) }, 'put')
                          );
                        }}
                        className="px-4 py-1.5 rounded-xl border border-primary/50 bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>Chuyển sang: {next(c)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomRequests;
