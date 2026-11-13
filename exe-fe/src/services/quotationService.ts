import { read, send } from './api';

export interface CustomDTO {
  id: string;
  buyerName: string;
  requirements: string;
  quantity: number;
  shippingAddress: string;
  attachmentUrl: string;
  unitQuotedPrice?: number;
  quotedPrice?: number;
  quoteNote?: string;
  quotedAt?: string;
  checkoutOrderId?: string;
  status: string;
  createdAt: string;
  rulerModel?: string;
  customName?: string;
  customStudentId?: string;
  color?: string;
  fontStyle?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  allowedActions?: string[];
  blockedActions?: { action: string; reasonCode: string; message: string }[];
  subtotalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
  shippingDiscountAmount?: number;
  appliedSubscriptionId?: string;
  appliedSubscriptionName?: string;
  priorityProduction?: boolean;
  cancelReason?: string;
  cancelledByRole?: string;
  cancelledAt?: string;
}

export interface CustomOrderCreateRequest {
  fileId: string;
  requirements: string;
  quantity: number;
  shippingAddress: string;
  rulerModel?: string;
  customName?: string;
  customStudentId?: string;
  color?: string;
  fontStyle?: string;
}

export const quotationService = {
  // User endpoints
  getMyCustomOrders: () => read<CustomDTO[]>('/custom-orders'),
  getCustomOrder: (id: string) => read<CustomDTO>(`/custom-orders/${encodeURIComponent(id)}`),
  createCustomOrder: (data: CustomOrderCreateRequest | unknown) => send<CustomDTO>('/custom-orders', data),
  updateCustomOrderStatus: (id: string, status: string, paymentMethod?: string) =>
    send(`/custom-orders/${id}/status`, { status, paymentMethod }, 'put'),
  cancelCustomOrder: (id: string, cancelReason?: string) =>
    send(
      `/custom-orders/${id}/status`,
      { status: 'CANCELLED', action: 'CANCEL', ...(cancelReason ? { cancelReason } : {}) },
      'put'
    ),
  acceptQuotation: (id: string, paymentMethod: string = 'PAYOS') =>
    send(`/custom-orders/${id}/status`, { status: 'ACCEPTED', paymentMethod }, 'put'),

  // Admin endpoints
  getAllCustomOrders: () => read<CustomDTO[]>('/admin/custom-orders'),
  getAdminCustomOrder: (id: string) => read<CustomDTO>(`/admin/custom-orders/${encodeURIComponent(id)}`),
  adminCancelCustomOrder: (id: string, cancelReason: string) =>
    send(`/admin/custom-orders/${id}/status`, { status: 'CANCELLED', action: 'CANCEL', cancelReason }, 'put'),
  quoteCustomOrder: (id: string, unitPrice: number, note?: string) =>
    send(`/admin/custom-orders/${id}/quote`, { unitPrice, price: unitPrice, note: note?.trim() ? note.trim() : undefined }, 'put'),
};

export default quotationService;
