import { read, send } from './api';

export interface BenefitPreviewRequest {
  scope: 'MARKETPLACE' | 'CUSTOM' | 'MIXED';
  itemsSubtotal: number;
  baseShippingFee?: number;
  customSubtotal?: number;
  marketplaceSubtotal?: number;
}

export interface BenefitPreviewResponse {
  hasActiveSubscription: boolean;
  userSubscriptionId?: string;
  planName?: string;
  appliedDiscountPlanName?: string;
  appliedShippingPlanName?: string;
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
};

export default subscriptionService;

