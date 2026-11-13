import { read, send } from './api';
import type { CustomDTO } from './quotationService';

export interface BlockedActionDTO {
  action: string;
  reasonCode: string;
  message: string;
}

export interface CheckoutOrderDTO {
  id: string;
  userId: string;
  buyerName?: string;
  recipientName?: string;
  recipientPhone?: string;
  orderType?: 'MARKETPLACE' | 'CUSTOM' | 'MIXED' | string;
  shippingAddress: string;
  shippingMode: 'COMMON' | 'SEPARATE' | string;
  status: string;
  itemsSubtotal?: number;
  totalAmount?: number;
  shippingFee?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  cancelReason?: string;
  summaryVersion: number;
  itemCount?: number;
  createdAt: string;
  updatedAt?: string;
  customOrders?: CustomDTO[];
  customOrderDetails?: CustomDTO[];
  marketplaceOrders?: unknown[];
  allowedActions?: string[];
  blockedActions?: BlockedActionDTO[];
  allCustomQuoted: boolean;
  readyForConfirm: boolean;
  paymentLinkUrl?: string;
  discountAmount?: number;
  shippingDiscountAmount?: number;
  appliedSubscriptionId?: string;
  appliedSubscriptionName?: string;
  priorityProduction?: boolean;
  cancelledByRole?: string;
  cancelledAt?: string;
}

export interface BatchQuoteItemPayload {
  customOrderId: string;
  unitPrice: number;
  note?: string;
}

export const checkoutOrderService = {
  getMyCheckoutOrders: () => read<CheckoutOrderDTO[]>('/checkout-orders/my'),
  getCheckoutOrder: (id: string) => read<CheckoutOrderDTO>(`/checkout-orders/${encodeURIComponent(id)}`),
  confirmCheckoutOrder: (id: string, summaryVersion: number) =>
    send<CheckoutOrderDTO>(`/checkout-orders/${encodeURIComponent(id)}/confirm`, { summaryVersion }),

  // Admin endpoints
  getAdminCheckoutOrders: (params?: { orderType?: string; status?: string; q?: string }) => {
    const sp = new URLSearchParams();
    if (params?.orderType) sp.set('orderType', params.orderType);
    if (params?.status) sp.set('status', params.status);
    if (params?.q) sp.set('q', params.q);
    const qs = sp.toString();
    return read<CheckoutOrderDTO[]>(`/admin/checkout-orders${qs ? `?${qs}` : ''}`);
  },
  getAdminCheckoutOrder: (id: string) => read<CheckoutOrderDTO>(`/admin/checkout-orders/${encodeURIComponent(id)}`),
  batchQuoteCheckoutOrder: (id: string, items: BatchQuoteItemPayload[]) =>
    send<CheckoutOrderDTO>(`/admin/checkout-orders/${encodeURIComponent(id)}/quote`, { items }, 'put'),
  updateAdminCheckoutOrderStatus: (id: string, payload: { status?: string; action?: string; cancelReason?: string }) =>
    send<CheckoutOrderDTO>(`/admin/checkout-orders/${encodeURIComponent(id)}/status`, payload, 'put'),
};

export default checkoutOrderService;
