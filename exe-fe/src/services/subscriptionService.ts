import { read, send } from './api';

export interface BenefitPreviewRequest {
  scope: 'MARKETPLACE' | 'CUSTOM' | 'MIXED';
  itemsSubtotal: number;
  baseShippingFee?: number;
  customSubtotal?: number;
  marketplaceSubtotal?: number;
}

export type BenefitStatus = 'NO_SUBSCRIPTION' | 'CONFIG_REQUIRED' | 'INELIGIBLE' | 'QUOTA_EXHAUSTED' | 'APPLIED';

export interface BenefitPreviewResponse {
  hasActiveSubscription: boolean;
  userSubscriptionId?: string;
  planName?: string;
  appliedDiscountPlanName?: string;
  appliedShippingPlanName?: string;
  benefitStatus?: BenefitStatus;
  discountPercent: number;
  itemsSubtotal: number;
  discountAmount: number;
  baseShippingFee: number;
  shippingDiscountAmount: number;
  finalShippingFee: number;
  freeShippingUsesLimit?: number | null;
  freeShippingUsesUsed: number;
  remainingFreeShippingUses?: number | null;
  priorityProduction: boolean;
  finalTotal: number;
  ineligibleReason?: string | null;
}

export type AdminSubscriptionHistoryMethod = 'CASH' | 'POINTS_REDEEM';

export type AdminSubscriptionHistoryStatus =
  | 'PAID'
  | 'PENDING'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PENDING_RECONCILIATION'
  | 'REDEEMED';

export interface AdminSubscriptionHistorySummary {
  subscriptionCashVnd: number;
  cashCount: number;
  pointsRedeemCount: number;
}

export interface AdminSubscriptionHistoryItem {
  id: string;
  userId?: string | null;
  buyerName: string;
  buyerEmail?: string | null;
  planId?: string | null;
  planName: string;
  planVerified: boolean;
  method: AdminSubscriptionHistoryMethod;
  status: AdminSubscriptionHistoryStatus;
  purchaseStatus?: string | null;
  transactionAt: string;
  legacyTimestamp: boolean;
  amountVnd: number;
  purchaseAmountVnd?: number | null;
  pointsSpent: number;
  referenceId?: string | null;
  subscriptionId?: string | null;
  paymentId?: string | null;
  payosOrderCode?: string | null;
  description?: string | null;
  reconciliationReason?: string | null;
}

export interface AdminSubscriptionHistoryResponse {
  items: AdminSubscriptionHistoryItem[];
  totalElements: number;
  page: number;
  size: number;
  summary: AdminSubscriptionHistorySummary;
}

export interface AdminSubscriptionHistoryParams {
  q?: string;
  userId?: string;
  planId?: string;
  method?: AdminSubscriptionHistoryMethod | '';
  status?: AdminSubscriptionHistoryStatus | '';
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface UserSubscriptionQuotaDTO {
  subscriptionId: string;
  userId: string;
  username: string;
  planId: string;
  planName: string;
  planType: string;
  startDate?: string;
  endDate: string;
  benefits?: string;
  structuredBenefits?: string;
  isActive: boolean;
  freeShippingUsesLimit?: number | null;
  freeShippingUsesUsed?: number | null;
  remainingFreeShippingUses?: number | null;
}

export interface UserSubscriptionSummaryResponse {
  points: number;
  subscriptions: UserSubscriptionQuotaDTO[];
}

export const subscriptionService = {
  getMySubscriptionSummary: () => read<UserSubscriptionSummaryResponse>('/subscriptions/me/summary'),
  getMySubscriptions: () => read<UserSubscriptionQuotaDTO[]>('/subscriptions/me'),
  previewBenefits: (payload: BenefitPreviewRequest) =>
    send<BenefitPreviewResponse>('/subscriptions/preview-benefits', payload),
  getAdminSubscriptionTransactions: (params?: AdminSubscriptionHistoryParams) => {
    const sp = new URLSearchParams();
    if (params?.q?.trim()) sp.set('q', params.q.trim());
    if (params?.userId) sp.set('userId', params.userId);
    if (params?.planId) sp.set('planId', params.planId);
    if (params?.method) sp.set('method', params.method);
    if (params?.status) sp.set('status', params.status);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.size != null) sp.set('size', String(params.size));
    const qs = sp.toString();
    return read<AdminSubscriptionHistoryResponse>(`/admin/subscriptions/transactions${qs ? `?${qs}` : ''}`);
  },
};

export default subscriptionService;

