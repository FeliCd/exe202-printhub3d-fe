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
  createCustomOrder: (data: CustomOrderCreateRequest | unknown) => send<CustomDTO>('/custom-orders', data),
  updateCustomOrderStatus: (id: string, status: string, paymentMethod?: string) =>
    send(`/custom-orders/${id}/status`, { status, paymentMethod }, 'put'),
  cancelCustomOrder: (id: string) =>
    send(`/custom-orders/${id}/status`, { status: 'CANCELLED' }, 'put'),
  acceptQuotation: (id: string, paymentMethod: string = 'PAYOS') =>
    send(`/custom-orders/${id}/status`, { status: 'ACCEPTED', paymentMethod }, 'put'),

  // Admin endpoints
  getAllCustomOrders: () => read<CustomDTO[]>('/admin/custom-orders'),
  quoteCustomOrder: (id: string, unitPrice: number, note?: string) =>
    send(`/admin/custom-orders/${id}/quote`, { unitPrice, price: unitPrice, note: note?.trim() ? note.trim() : undefined }, 'put'),
};

export default quotationService;
