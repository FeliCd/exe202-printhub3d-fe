import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Gift,
  Plus,
  Edit2,
  Ban,
  X,
  Check,
  Award,
  CreditCard,
  History,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  RefreshCw,
  Percent,
  Truck,
  Zap,
  Info,
} from 'lucide-react';
import { useRemote, useAction } from '../../hooks/useRemote';
import { send, errorText } from '../../services/api';
import { PageHeader, RemoteState, Notice } from '../../components/DataUI';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import SubscriptionPurchaseModal from './SubscriptionPurchaseModal';
import { money } from '../../utils/format';
import { paySubscription } from '../../services/paymentService';
import pointService, {
  type PointWalletResponse,
  type PointTransactionItem,
} from '../../services/pointService';

export interface Plan {
  id: string;
  name: string;
  price: number | null;
  benefits: string;
  description?: string;
  requiredPoints: number | null;
  durationDays?: number;
  planVersion?: number;
  allowMoneyPurchase?: boolean;
  allowPointRedemption?: boolean;
  allowAdminGift?: boolean;
  structuredBenefits?: string;
  isActive: boolean;
  type?: string;
}

export interface StructuredBenefits {
  discount?: {
    percent?: number;
    appliesTo?: string[];
    minEligibleSubtotal?: number;
    maxDiscountAmount?: number;
  };
  shipping?: {
    freeUsesPerTerm?: number;
    maxDiscountAmountPerUse?: number;
    appliesTo?: string[];
  };
  production?: {
    priorityEnabled?: boolean;
    appliesTo?: string[];
  };
}

export function parseBenefits(raw?: string | object | null): StructuredBenefits | null {
  if (!raw) return null;
  if (typeof raw === 'object') return raw as StructuredBenefits;
  try {
    return JSON.parse(raw) as StructuredBenefits;
  } catch {
    return null;
  }
}

export interface PlanFormState {
  name: string;
  type: string;
  description: string;
  durationDays: string;
  allowMoneyPurchase: boolean;
  price: string;
  allowPointRedemption: boolean;
  requiredPoints: string;
  allowAdminGift: boolean;
  discountPercent: string;
  maxDiscountAmount: string;
  freeShippingUses: string;
  maxShippingDiscount: string;
  priorityEnabled: boolean;
  planVersion?: number;
}

const emptyFormState: PlanFormState = {
  name: '',
  type: 'CUSTOMER',
  description: '',
  durationDays: '30',
  allowMoneyPurchase: true,
  price: '99000',
  allowPointRedemption: true,
  requiredPoints: '100',
  allowAdminGift: true,
  discountPercent: '10',
  maxDiscountAmount: '50000',
  freeShippingUses: '2',
  maxShippingDiscount: '30000',
  priorityEnabled: false,
};

export interface Membership {
  points: number;
  subscriptions: {
    id?: string;
    subscriptionId?: string;
    name?: string;
    planName?: string;
    startDate?: string;
    endDate: string;
    isActive?: boolean;
  }[];
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
}

export interface UserSubscriptionResponse {
  subscriptionId: string;
  userId: string;
  username?: string;
  planId: string;
  planName: string;
  planType?: string;
  startDate?: string;
  endDate: string;
  isActive: boolean;
}

export interface SubscriptionPurchaseResponse {
  purchaseId: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  durationDays: number;
  status: string;
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function SubscriptionPanel({ admin = false }: { admin?: boolean }) {
  const remote = useRemote<Plan[]>(admin ? '/admin/subscriptions' : '/subscriptions/plans');
  const membership = useRemote<Membership>(admin ? null : '/subscriptions/me');
  const users = useRemote<AdminUserItem[]>(admin ? '/admin/users' : null);

  const action = useAction(() => {
    remote.reload();
    membership.reload();
  });

  const [editing, setEditing] = useState('');
  const [form, setForm] = useState<PlanFormState>(emptyFormState);
  const [open, setOpen] = useState(false);
  const [giftUser, setGiftUser] = useState('');

  // Flow feedback states
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  // Flow execution busy states per action/item
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [redeemingPlanId, setRedeemingPlanId] = useState<string | null>(null);
  const [giftingPlanId, setGiftingPlanId] = useState<string | null>(null);
  const [purchaseModalPlan, setPurchaseModalPlan] = useState<Plan | null>(null);
  const [redeemModalPlan, setRedeemModalPlan] = useState<Plan | null>(null);
  const [giftModalPlan, setGiftModalPlan] = useState<Plan | null>(null);
  const [deactivateModalPlan, setDeactivateModalPlan] = useState<Plan | null>(null);

  // Flow 06: Ledger & Wallet Audit states
  const [activeTab, setActiveTab] = useState<'plans' | 'ledger'>('plans');
  const [wallet, setWallet] = useState<PointWalletResponse | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionItem[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const customerUsers = (users.data || []).filter((u) => u.role !== 'ADMIN');

  // Load wallet and ledger for customer view
  const fetchWalletAndLedger = useCallback(async () => {
    if (admin) return;
    try {
      setLoadingLedger(true);
      const [walletData, txList] = await Promise.allSettled([
        pointService.getWallet(),
        pointService.getTransactions(0, 30),
      ]);
      if (walletData.status === 'fulfilled') setWallet(walletData.value);
      if (txList.status === 'fulfilled') setTransactions(txList.value);
    } catch (e) {
      console.warn('Failed to load wallet or ledger', e);
    } finally {
      setLoadingLedger(false);
    }
  }, [admin]);

  useEffect(() => {
    if (!admin) {
      void fetchWalletAndLedger();
    }
  }, [admin, fetchWalletAndLedger]);

  // Available points from wallet or fallback to membership
  const availablePoints = wallet?.availableToSpend ?? membership.data?.points ?? 0;

  // =========================================================================
  // ADMIN: CẤU HÌNH GÓI HỘI VIÊN (Save / Edit Plan - Flow 09)
  // =========================================================================
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessFeedback(null);
    setCustomError(null);

    if (!form.name.trim()) {
      setCustomError('Vui lòng nhập tên gói hội viên.');
      return;
    }

    if (!form.allowMoneyPurchase && !form.allowPointRedemption && !form.allowAdminGift) {
      setCustomError('Gói dịch vụ phải bật ít nhất một phương thức nhận (Tiền mặt, Điểm hoặc Tặng quà).');
      return;
    }

    if (form.allowMoneyPurchase && (Number(form.price) < 0 || isNaN(Number(form.price)))) {
      setCustomError('Vui lòng nhập giá tiền mặt hợp lệ (>= 0 VNĐ) khi bật kênh mua tiền.');
      return;
    }

    if (form.allowPointRedemption && (Number(form.requiredPoints) < 0 || isNaN(Number(form.requiredPoints)))) {
      setCustomError('Vui lòng nhập số điểm thưởng hợp lệ (>= 0 xu) khi bật kênh đổi điểm.');
      return;
    }

    const structuredObj: StructuredBenefits = {
      discount: {
        percent: Math.min(100, Math.max(0, Number(form.discountPercent) || 0)),
        appliesTo: ['MARKETPLACE', 'CUSTOM'],
        minEligibleSubtotal: 0,
        maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
      },
      shipping: {
        freeUsesPerTerm: Math.max(0, Number(form.freeShippingUses) || 0),
        maxDiscountAmountPerUse: Number(form.maxShippingDiscount) || 0,
        appliesTo: ['MARKETPLACE', 'CUSTOM'],
      },
      production: {
        priorityEnabled: form.priorityEnabled,
        appliesTo: ['CUSTOM'],
      },
    };

    const discountSummary = Number(form.discountPercent) > 0
      ? `Giảm ${form.discountPercent}% cho mọi đơn in (tối đa ${money(Number(form.maxDiscountAmount))})`
      : '';
    const shipSummary = Number(form.freeShippingUses) > 0
      ? `Miễn/giảm phí ship ${form.freeShippingUses} lượt/kỳ (tối đa ${money(Number(form.maxShippingDiscount))}/lượt)`
      : '';
    const prioritySummary = form.priorityEnabled ? 'Ưu tiên xếp lịch in sản phẩm 3D' : '';
    const customSummary = [discountSummary, shipSummary, prioritySummary].filter(Boolean).join('. ');
    const benefitsText = customSummary || form.description.trim() || 'Ưu đãi thành viên PrintHub VIP';

    const payload = {
      name: form.name.trim(),
      benefits: benefitsText,
      description: form.description.trim(),
      durationDays: Math.max(1, Number(form.durationDays) || 30),
      allowMoneyPurchase: form.allowMoneyPurchase,
      price: form.allowMoneyPurchase ? Number(form.price) : null,
      allowPointRedemption: form.allowPointRedemption,
      requiredPoints: form.allowPointRedemption ? Number(form.requiredPoints) : null,
      allowAdminGift: form.allowAdminGift,
      planVersion: editing ? form.planVersion : undefined,
      structuredBenefits: JSON.stringify(structuredObj),
    };

    if (
      await action.run(() =>
        send(
          `/admin/subscriptions/customer${editing ? '/' + editing : ''}`,
          payload,
          editing ? 'put' : 'post'
        )
      )
    ) {
      setOpen(false);
      remote.reload();
      setSuccessFeedback(editing ? 'Đã cập nhật cấu hình gói hội viên thành công!' : 'Đã tạo mới gói hội viên thành công!');
    }
  };

  const handleEditClick = (p: Plan) => {
    setEditing(p.id);
    const parsed = parseBenefits(p.structuredBenefits);
    setForm({
      name: p.name || '',
      type: p.type || 'CUSTOMER',
      description: p.description || '',
      durationDays: String(p.durationDays || 30),
      allowMoneyPurchase: p.allowMoneyPurchase !== false,
      price: p.price != null ? String(p.price) : '99000',
      allowPointRedemption: p.allowPointRedemption !== false,
      requiredPoints: p.requiredPoints != null ? String(p.requiredPoints) : '100',
      allowAdminGift: p.allowAdminGift !== false,
      discountPercent: String(parsed?.discount?.percent ?? 10),
      maxDiscountAmount: String(parsed?.discount?.maxDiscountAmount ?? 50000),
      freeShippingUses: String(parsed?.shipping?.freeUsesPerTerm ?? 2),
      maxShippingDiscount: String(parsed?.shipping?.maxDiscountAmountPerUse ?? 30000),
      priorityEnabled: Boolean(parsed?.production?.priorityEnabled),
      planVersion: p.planVersion || 1,
    });
    setOpen(true);
  };

  // =========================================================================
  // FLOW 04: ADMIN TẶNG GÓI CHO NGƯỜI DÙNG (Admin Gift Subscription)
  // =========================================================================
  const handleGiftPlan = (plan: Plan) => {
    setSuccessFeedback(null);
    setCustomError(null);

    if (!giftUser) {
      setCustomError('Vui lòng chọn tài khoản sinh viên/khách hàng nhận gói ở khung phía trên trước khi tặng!');
      return;
    }
    setGiftModalPlan(plan);
  };

  const confirmGiftPlan = async () => {
    if (!giftModalPlan || !giftUser) return;
    const plan = giftModalPlan;
    const targetUser = customerUsers.find((u) => u.id === giftUser);
    const capturedUserId = giftUser;
    const capturedPlanId = plan.id;
    const capturedPlanName = plan.name;
    const capturedUserName = targetUser ? `${targetUser.name} (${targetUser.email})` : 'người dùng đã chọn';
    const duration = plan.durationDays || 30;

    const requestId = generateUUID();
    setGiftingPlanId(plan.id);

    try {
      const res = await send<UserSubscriptionResponse>('/admin/subscriptions/gift', {
        userId: capturedUserId,
        planId: capturedPlanId,
        reason: 'Tặng gói ưu đãi từ quản trị viên PrintHub',
        requestId,
      });

      const endDateStr = res?.endDate ? new Date(res.endDate).toLocaleDateString('vi-VN') : `${duration} ngày`;
      setSuccessFeedback(
        `Đã tặng thành công gói "${res?.planName || capturedPlanName}" cho ${capturedUserName}! Hạn dùng đến: ${endDateStr}.`
      );
      setGiftModalPlan(null);
      remote.reload();
    } catch (err: unknown) {
      setCustomError(errorText(err) || 'Không thể tặng gói quà cho người dùng.');
      setGiftModalPlan(null);
    } finally {
      setGiftingPlanId(null);
    }
  };

  // =========================================================================
  // FLOW 07: USER ĐỔI GÓI HỘI VIÊN BẰNG ĐIỂM THƯỞNG (Point Redemption)
  // =========================================================================
  const handleRedeemPlan = (plan: Plan) => {
    setSuccessFeedback(null);
    setCustomError(null);

    if (availablePoints < (plan.requiredPoints || 0)) {
      setCustomError(
        `Số dư điểm (${availablePoints} xu) không đủ để đổi gói "${plan.name}" (yêu cầu ${plan.requiredPoints} xu).`
      );
      return;
    }
    setRedeemModalPlan(plan);
  };

  const confirmRedeemPlan = async () => {
    if (!redeemModalPlan) return;
    const plan = redeemModalPlan;
    const duration = plan.durationDays || 30;
    const idempotencyKey = generateUUID();
    setRedeemingPlanId(plan.id);

    try {
      const res = await send<UserSubscriptionResponse>(`/subscriptions/redeem/${plan.id}`, {
        idempotencyKey,
      });

      const endDateStr = res?.endDate ? new Date(res.endDate).toLocaleDateString('vi-VN') : `${duration} ngày`;
      setSuccessFeedback(
        `Chúc mừng! Bạn đã đổi thành công gói hội viên "${res?.planName || plan.name}". Hạn sử dụng đến: ${endDateStr}.`
      );
      setRedeemModalPlan(null);
      remote.reload();
      membership.reload();
      void fetchWalletAndLedger();
    } catch (err: unknown) {
      setCustomError(errorText(err) || 'Không thể đổi gói hội viên bằng điểm thưởng.');
      setRedeemModalPlan(null);
    } finally {
      setRedeemingPlanId(null);
    }
  };

  // =========================================================================
  // FLOW 08: USER MUA GÓI HỘI VIÊN BẰNG TIỀN MẶT QUA PAYOS (Cash Purchase)
  // =========================================================================
  const handleCashPurchase = (plan: Plan) => {
    setSuccessFeedback(null);
    setCustomError(null);
    setPurchaseModalPlan(plan);
  };

  const confirmCashPurchase = async () => {
    if (!purchaseModalPlan) return;
    const plan = purchaseModalPlan;
    const idempotencyKey = generateUUID();
    setPurchasingPlanId(plan.id);

    try {
      const purchase = await send<SubscriptionPurchaseResponse>('/subscriptions/purchases', {
        planId: plan.id,
        idempotencyKey,
      });

      if (!purchase?.purchaseId) {
        throw new Error('Máy chủ không trả về mã đơn mua gói hội viên.');
      }

      setPurchaseModalPlan(null);
      // Kích hoạt thanh toán PayOS qua VietQR
      await paySubscription(purchase.purchaseId);
    } catch (err: unknown) {
      setCustomError(errorText(err) || 'Không thể khởi tạo giao dịch thanh toán mua gói hội viên.');
      setPurchaseModalPlan(null);
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const confirmDeactivatePlan = async () => {
    if (!deactivateModalPlan) return;
    const plan = deactivateModalPlan;
    try {
      await action.run(() => send(`/admin/subscriptions/customer/${plan.id}`, undefined, 'delete'));
      setDeactivateModalPlan(null);
    } catch (err) {
      setCustomError(errorText(err) || 'Không thể ngừng áp dụng gói.');
      setDeactivateModalPlan(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={admin ? 'Quản Lý Hội Viên & Gói Subscriptions' : 'Hội Viên VIP & Điểm Thưởng Tích Lũy'}
        description={
          admin
            ? 'Thiết lập quyền lợi giảm giá in 3D, thời hạn gói, giá tiền mặt và tặng gói ưu đãi cho khách hàng.'
            : 'Đổi điểm thưởng tích lũy từ các đơn in 3D hoặc mua gói hội viên VIP để nhận ưu đãi gia công.'
        }
        badge={admin ? 'Admin Panel' : `${availablePoints.toLocaleString()} Điểm`}
        icon={Award}
      />

      {/* Thông báo lỗi & thành công (Flow 04 / Flow 07 / Flow 08 feedback) */}
      <Notice error={action.error} />
      <Notice error={membership.error} />
      {customError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{customError}</span>
          </div>
          <button
            onClick={() => setCustomError(null)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {successFeedback && (
        <div className="p-4 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span className="font-semibold">{successFeedback}</span>
          </div>
          <button
            onClick={() => setSuccessFeedback(null)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER DASHBOARD: SỐ DƯ ĐIỂM + GÓI VIP ĐANG HOẠT ĐỘNG + TAB CHUYỂN ĐỔI      */}
      {/* ========================================================================= */}
      {!admin && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-slate-400 font-mono">
                  Số dư ví điểm thưởng:{' '}
                  <strong className="text-[#39FF14] text-xl font-mono font-black ">
                    {availablePoints.toLocaleString()}
                  </strong>{' '}
                  PrintHub Xu
                </p>

                {/* Danh sách gói VIP đang kích hoạt */}
                <div className="space-y-1.5">
                  {!membership.data?.subscriptions?.length ? (
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      Bạn hiện chưa kích hoạt gói hội viên VIP nào. Hãy đổi điểm hoặc mua gói bên dưới!
                    </p>
                  ) : (
                    membership.data.subscriptions.map((s, idx) => (
                      <div
                        key={s.subscriptionId || s.id || idx}
                        className="flex items-center gap-2 text-xs font-semibold text-white font-mono"
                      >
                        <Sparkles className="w-4 h-4 text-[#39FF14]" />
                        <span>
                          {s.planName || s.name} · Hạn dùng đến: {new Date(s.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation Tabs (Flow 06: Ledger Audit) */}
              <div className="flex items-center gap-2 bg-[#040508] p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'plans'
                      ? 'bg-[#39FF14] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Các Gói Hội Viên VIP
                </button>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'ledger'
                      ? 'bg-[#00e5ff] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Lịch Sử Biến Động Điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN CONTROLS: TẠO GÓI & CARD TẶNG GÓI QUÀ                                */}
      {/* ========================================================================= */}
      {admin && (
        <div className="space-y-4">
          {/* HÀNG 1: Nút thêm gói */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0a0c12] border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                Cấu Hình Các Gói Khách Hàng VIP / Subscriptions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập giá tiền mặt, thời hạn gói (ngày), quyền lợi giảm giá và điểm đổi gói
              </p>
            </div>

            <button
              onClick={() => {
                setOpen(true);
                setEditing('');
                setForm(emptyFormState);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-black text-xs uppercase tracking-tight transition shadow-lg shadow-[#39FF14]/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gói Mới</span>
            </button>
          </div>

          {/* HÀNG 2: Khung tặng gói cho người dùng (Flow 04) */}
          <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00e5ff] font-mono">
              <Gift className="w-4 h-4 text-[#00e5ff]" />
              <span>Người Nhận Gói Quà Tặng (Sinh viên / Khách hàng)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <select
                  className="w-full bg-[#040508] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-[#39FF14] font-mono transition cursor-pointer"
                  value={giftUser}
                  onChange={(e) => setGiftUser(e.target.value)}
                >
                  <option value="">-- Chọn tài khoản người dùng để tặng gói quà --</option>
                  {customerUsers.length === 0 ? (
                    <option value="" disabled>
                      {users.loading ? 'Đang tải người dùng...' : 'Không tìm thấy người dùng'}
                    </option>
                  ) : (
                    customerUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}){u.studentId ? ` - MSSV: ${u.studentId}` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {giftUser && (
                <span className="text-xs text-[#39FF14] font-semibold flex items-center gap-1 shrink-0 font-mono whitespace-nowrap">
                  <Check className="w-3.5 h-3.5" /> Đã chọn người nhận. Nhấn nút "Tặng gói quà" ở thẻ bên dưới.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOW 06: LEDGER AUDIT VIEW (LỊCH SỬ BIẾN ĐỘNG ĐIỂM)                        */}
      {/* ========================================================================= */}
      {!admin && activeTab === 'ledger' && (
        <div className="p-5 rounded-2xl bg-[#0a0c12] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <History className="w-4 h-4 text-[#00e5ff]" />
                Lịch Sử Biến Động Điểm Thưởng (Ledger Audit)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ghi nhận minh bạch mọi giao dịch tích điểm khi hoàn thành đơn in và trừ điểm đổi gói
              </p>
            </div>
            <button
              onClick={() => void fetchWalletAndLedger()}
              className="p-2 rounded-lg bg-[#040508] border border-white/10 text-slate-300 hover:text-white transition"
              title="Làm mới lịch sử"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin text-[#00e5ff]' : ''}`} />
            </button>
          </div>

          {loadingLedger ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">Đang tải lịch sử điểm...</div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              Chưa có giao dịch biến động điểm nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isEarn = tx.type === 'EARN';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#040508] border border-white/5 flex items-center justify-between gap-3 text-xs font-mono hover:border-white/15 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isEarn
                            ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isEarn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">{tx.description}</p>
                        <p className="text-[11px] text-slate-500">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black text-sm ${isEarn ? 'text-[#39FF14]' : 'text-amber-400'}`}>
                        {isEarn ? `+${tx.amount}` : `-${tx.amount}`} xu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA GÓI (Admin)                                         */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA GÓI (Admin - Flow 09)                               */}
      {/* ========================================================================= */}
      <Modal open={open} onClose={() => setOpen(false)} label={editing ? 'Chỉnh Sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}>
        <div className="w-full max-w-xl bg-[#0a0c12] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-[#39FF14]" />
                {editing ? `Chỉnh Sửa Gói Hội Viên (v${form.planVersion || 1})` : 'Tạo Gói Hội Viên Mới'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Cấu hình thời hạn, kênh phân phối và quyền lợi thực thi có cấu trúc máy đọc được
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#040508] transition cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
            {/* NHÓM 1: THÔNG TIN CƠ BẢN & THỜI HẠN */}
            <div className="p-3.5 rounded-xl bg-[#040508] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-[#00e5ff] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> 1. Thông Tin Chung &amp; Thời Hạn Gói
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300 font-mono">Tên gói hội viên *</label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Gói Sinh Viên VIP Silver, Gói Hội Viên 60 Ngày..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 font-mono">Thời hạn gói (ngày) *</label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                    required
                    type="number"
                    min={1}
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    placeholder="VD: 30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 font-mono">Mô tả tiếp thị (Marketing description)</label>
                <input
                  className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="VD: Gói ưu đãi đặc quyền dành cho sinh viên kiến trúc & cơ khí"
                />
              </div>
            </div>

            {/* NHÓM 2: PHƯƠNG THỨC PHÂN PHỐI & GIÁ QUY ĐỔI */}
            <div className="p-3.5 rounded-xl bg-[#040508] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-[#39FF14] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> 2. Kênh Nhận Gói &amp; Đơn Giá Quy Đổi
              </span>

              {/* Kênh 1: Mua tiền mặt PayOS */}
              <div className="space-y-2 p-2.5 rounded-lg bg-[#0a0c12] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.allowMoneyPurchase}
                    onChange={(e) => setForm({ ...form, allowMoneyPurchase: e.target.checked })}
                    className="accent-[#00e5ff] w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Cho phép mua bằng tiền mặt (VietQR PayOS)</span>
                </label>

                {form.allowMoneyPurchase && (
                  <div className="pl-6 pt-1">
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Giá tiền mặt một kỳ (VNĐ) *</label>
                    <input
                      className="w-full bg-[#040508] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#00e5ff] font-mono transition"
                      required={form.allowMoneyPurchase}
                      type="number"
                      min={0}
                      step={1000}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="VD: 99000"
                    />
                  </div>
                )}
              </div>

              {/* Kênh 2: Đổi điểm thưởng */}
              <div className="space-y-2 p-2.5 rounded-lg bg-[#0a0c12] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.allowPointRedemption}
                    onChange={(e) => setForm({ ...form, allowPointRedemption: e.target.checked })}
                    className="accent-[#39FF14] w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Cho phép đổi bằng điểm thưởng PrintHub (Xu)</span>
                </label>

                {form.allowPointRedemption && (
                  <div className="pl-6 pt-1">
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Số điểm thưởng một kỳ (Xu) *</label>
                    <input
                      className="w-full bg-[#040508] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                      required={form.allowPointRedemption}
                      type="number"
                      min={0}
                      value={form.requiredPoints}
                      onChange={(e) => setForm({ ...form, requiredPoints: e.target.value })}
                      placeholder="VD: 100"
                    />
                  </div>
                )}
              </div>

              {/* Kênh 3: Admin tặng */}
              <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.allowAdminGift}
                    onChange={(e) => setForm({ ...form, allowAdminGift: e.target.checked })}
                    className="accent-[#c084fc] w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Cho phép Quản trị viên tặng gói quà (Flow 04)</span>
                </label>
              </div>
            </div>

            {/* NHÓM 3: CẤU HÌNH ĐẶC QUYỀN THỰC THI (STRUCTURED BENEFITS) */}
            <div className="p-3.5 rounded-xl bg-[#040508] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-[#e879f9] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> 3. Đặc Quyền Thực Thi Trên Hệ Thống (Structured Benefits)
              </span>

              {/* Giảm giá đơn hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 font-mono flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#39FF14]" /> % Giảm giá đơn hàng in
                  </label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    placeholder="VD: 10 (%)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 font-mono">Giảm tối đa mỗi đơn (VNĐ)</label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] font-mono transition"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="VD: 50000 (0 nếu không giới hạn)"
                  />
                </div>
              </div>

              {/* Miễn phí / Giảm ship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 font-mono flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#00e5ff]" /> Lượt miễn/giảm ship mỗi kỳ
                  </label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#00e5ff] font-mono transition"
                    type="number"
                    min={0}
                    value={form.freeShippingUses}
                    onChange={(e) => setForm({ ...form, freeShippingUses: e.target.value })}
                    placeholder="VD: 2 (lượt/kỳ)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 font-mono">Mức giảm ship tối đa/lượt (VNĐ)</label>
                  <input
                    className="w-full bg-[#0a0c12] border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#00e5ff] font-mono transition"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.maxShippingDiscount}
                    onChange={(e) => setForm({ ...form, maxShippingDiscount: e.target.value })}
                    placeholder="VD: 30000"
                  />
                </div>
              </div>

              {/* Ưu tiên in 3D */}
              <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.priorityEnabled}
                    onChange={(e) => setForm({ ...form, priorityEnabled: e.target.checked })}
                    className="accent-[#39FF14] w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Ưu tiên xếp lịch in sản phẩm 3D (Priority Production Queue)
                  </span>
                </label>
              </div>
            </div>

            {/* NHÓM 4: BẢN XEM TRƯỚC TRỰC QUAN (LIVE PREVIEW) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0a0c12] to-[#040508] border border-[#39FF14]/30 space-y-2">
              <span className="text-[10px] font-bold text-[#39FF14] font-mono uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bản xem trước thẻ gói khi công bố
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-white text-sm">{form.name || 'Tên Gói Mới'}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#39FF14]/10 text-[#39FF14] font-mono font-bold text-[11px] border border-[#39FF14]/30">
                  {form.durationDays || 30} ngày
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {form.allowMoneyPurchase && (
                  <span className="px-2 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
                    {Number(form.price) > 0 ? money(Number(form.price)) : '0đ'}
                  </span>
                )}
                {form.allowPointRedemption && (
                  <span className="px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
                    {form.requiredPoints || 0} xu
                  </span>
                )}
                {form.allowAdminGift && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Tặng quà Admin
                  </span>
                )}
                {Number(form.discountPercent) > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Giảm {form.discountPercent}%
                  </span>
                )}
                {Number(form.freeShippingUses) > 0 && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    {form.freeShippingUses} lượt freeship
                  </span>
                )}
                {form.priorityEnabled && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Ưu tiên in
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                {editing ? `Đang chỉnh sửa bản v${form.planVersion || 1}` : 'Gói mới v1'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-[#040508] text-slate-300 text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  className="px-5 py-2 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 text-xs font-bold transition shadow-lg shadow-[#39FF14]/20 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  disabled={action.busy}
                >
                  {action.busy ? 'Đang lưu...' : editing ? 'Cập Nhật Gói' : 'Tạo Gói Mới'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* DANH SÁCH CÁC GÓI SUBSCRIPTIONS (Plans Grid - Flow 09)                     */}
      {/* ========================================================================= */}
      {(admin || activeTab === 'plans') && (
        <>
          <RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {remote.data?.map((p) => {
              const duration = p.durationDays || 30;
              const hasCashPrice = p.allowMoneyPurchase !== false && p.price != null && p.price > 0;
              const hasPointPrice = p.allowPointRedemption !== false && p.requiredPoints != null && p.requiredPoints > 0;
              const isGiftOnly = !hasCashPrice && !hasPointPrice && p.allowAdminGift !== false;
              const hasEnoughPoints = availablePoints >= (p.requiredPoints || 0);
              const structured = parseBenefits(p.structuredBenefits);

              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-2xl bg-[#0a0c12] border transition-all space-y-4 shadow-xl relative overflow-hidden group ${
                    p.isActive ? 'border-white/10 hover:border-[#39FF14]/50' : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#39FF14] to-[#00e5ff] opacity-80" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2 tracking-tight">
                        {p.name}
                        {p.planVersion && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-400">
                            v{p.planVersion}
                          </span>
                        )}
                        {!p.isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#040508] border border-white/10 text-slate-500 whitespace-nowrap shrink-0">
                            Ngừng áp dụng
                          </span>
                        )}
                      </h3>

                      {/* Thông tin quy đổi & thời hạn linh hoạt (Flow 07, 08 & 09) */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-xs">
                        {hasPointPrice && (
                          <span className="text-[#39FF14] font-bold">{p.requiredPoints} điểm xu</span>
                        )}
                        {hasPointPrice && hasCashPrice && <span className="text-slate-500">hoặc</span>}
                        {hasCashPrice && (
                          <span className="text-[#00e5ff] font-bold">{money(p.price!)}</span>
                        )}
                        {isGiftOnly && (
                          <span className="text-purple-400 font-bold">Gói quà tặng Admin</span>
                        )}
                        <span className="text-slate-400">· {duration} ngày sử dụng</span>
                      </div>
                    </div>

                    <span className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Structured Benefits Badges (Flow 09) */}
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                    {structured?.discount?.percent && structured.discount.percent > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5" />
                        Giảm {structured.discount.percent}%
                        {structured.discount.maxDiscountAmount ? ` (max ${money(structured.discount.maxDiscountAmount)})` : ''}
                      </span>
                    ) : null}

                    {structured?.shipping?.freeUsesPerTerm && structured.shipping.freeUsesPerTerm > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 font-semibold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        {structured.shipping.freeUsesPerTerm} lượt freeship
                        {structured.shipping.maxDiscountAmountPerUse ? ` (max ${money(structured.shipping.maxDiscountAmountPerUse)})` : ''}
                      </span>
                    ) : null}

                    {structured?.production?.priorityEnabled && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Ưu tiên in 3D
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-[#040508] p-3.5 rounded-xl border border-white/5">
                    {p.benefits || p.description}
                  </p>

                  {/* Actions Section */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    {admin ? (
                      /* Admin Actions */
                      <>
                        <button
                          className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#040508] hover:border-[#39FF14]/50 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
                          onClick={() => handleEditClick(p)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#00e5ff]" /> Sửa
                        </button>

                        <button
                          className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#040508] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
                          disabled={action.busy || !p.isActive}
                          onClick={() => setDeactivateModalPlan(p)}
                        >
                          <Ban className="w-3.5 h-3.5" /> Ngừng áp dụng
                        </button>

                        {/* FLOW 04: NÚT TẶNG GÓI QUÀ */}
                        <button
                          className="px-4 py-1.5 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                          disabled={action.busy || giftingPlanId === p.id || !p.isActive || p.allowAdminGift === false}
                          onClick={() => void handleGiftPlan(p)}
                          title={
                            p.allowAdminGift === false
                              ? 'Gói này không hỗ trợ tặng quà'
                              : !giftUser
                              ? 'Vui lòng chọn người nhận ở khung trên trước'
                              : undefined
                          }
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>{giftingPlanId === p.id ? 'Đang tặng...' : 'Tặng gói quà'}</span>
                        </button>
                      </>
                    ) : (
                      /* User Actions: Mua tiền mặt (Flow 08) & Đổi điểm (Flow 07) */
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Nút thanh toán tiền mặt PayOS */}
                        {hasCashPrice && (
                          <button
                            className="px-4 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-[#00e5ff]/20 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                            disabled={purchasingPlanId === p.id || !p.isActive}
                            onClick={() => void handleCashPurchase(p)}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              {purchasingPlanId === p.id ? 'Đang tạo PayOS...' : `Mua gói — ${money(p.price!)}`}
                            </span>
                          </button>
                        )}

                        {/* Nút đổi điểm */}
                        {hasPointPrice && (
                          <button
                            className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-slate-950 font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 transition shadow-lg shadow-[#39FF14]/20 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                            disabled={redeemingPlanId === p.id || !hasEnoughPoints || !p.isActive}
                            onClick={() => void handleRedeemPlan(p)}
                            title={
                              !hasEnoughPoints
                                ? `Bạn còn thiếu ${(p.requiredPoints || 0) - availablePoints} điểm xu`
                                : undefined
                            }
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {redeemingPlanId === p.id
                                ? 'Đang đổi...'
                                : hasEnoughPoints
                                ? `Đổi gói (${p.requiredPoints} xu)`
                                : `Thiếu ${(p.requiredPoints || 0) - availablePoints} xu`}
                            </span>
                          </button>
                        )}

                        {/* Thông báo nếu gói chỉ tặng */}
                        {isGiftOnly && (
                          <span className="text-xs font-mono text-purple-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Gift className="w-3.5 h-3.5" />
                            Gói quà tặng đặc quyền từ PrintHub Admin
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* P1: Subscription Purchase Modal */}
      <SubscriptionPurchaseModal
        open={!!purchaseModalPlan}
        plan={purchaseModalPlan ? {
          id: purchaseModalPlan.id,
          name: purchaseModalPlan.name,
          price: purchaseModalPlan.price || 0,
          durationDays: purchaseModalPlan.durationDays || 30,
          discountPercent: parseBenefits(purchaseModalPlan.structuredBenefits)?.discount?.percent,
        } : null}
        onClose={() => setPurchaseModalPlan(null)}
        onConfirm={confirmCashPurchase}
        busy={!!purchasingPlanId}
      />

      {/* P1 / P4: Redeem Points ConfirmDialog */}
      <ConfirmDialog
        open={!!redeemModalPlan}
        onClose={() => setRedeemModalPlan(null)}
        onConfirm={confirmRedeemPlan}
        title="Xác nhận đổi gói hội viên"
        description={
          redeemModalPlan ? (
            <span>
              Bạn có chắc muốn dùng <strong className="text-[#39FF14]">{redeemModalPlan.requiredPoints} xu</strong> tích lũy để kích hoạt gói hội viên <strong className="text-white">"{redeemModalPlan.name}"</strong> ({redeemModalPlan.durationDays || 30} ngày sử dụng)?
            </span>
          ) : ''
        }
        confirmText="Đổi ngay"
        variant="primary"
        busy={!!redeemingPlanId}
      />

      {/* P1 / P4: Admin Gift ConfirmDialog */}
      <ConfirmDialog
        open={!!giftModalPlan}
        onClose={() => setGiftModalPlan(null)}
        onConfirm={confirmGiftPlan}
        title="Xác nhận tặng gói hội viên"
        description={
          giftModalPlan ? (
            <span>
              Xác nhận tặng gói <strong className="text-[#00e5ff]">"{giftModalPlan.name}"</strong> ({giftModalPlan.durationDays || 30} ngày) cho tài khoản <strong className="text-white">{customerUsers.find((u) => u.id === giftUser)?.name || 'người dùng đã chọn'}</strong>?
            </span>
          ) : ''
        }
        confirmText="Tặng gói"
        variant="primary"
        busy={!!giftingPlanId}
      />

      {/* P1 / P4: Admin Deactivate ConfirmDialog */}
      <ConfirmDialog
        open={!!deactivateModalPlan}
        onClose={() => setDeactivateModalPlan(null)}
        onConfirm={confirmDeactivatePlan}
        title="Ngừng áp dụng gói hội viên"
        description={
          deactivateModalPlan ? (
            <span>
              Bạn có chắc chắn muốn ngừng áp dụng gói <strong className="text-rose-400">"{deactivateModalPlan.name}"</strong>? Người dùng sẽ không thể tiếp tục đăng ký gói này.
            </span>
          ) : ''
        }
        confirmText="Ngừng áp dụng"
        variant="danger"
        busy={action.busy}
      />
    </div>
  );
}