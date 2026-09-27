import { read, send } from './api';

export interface CustomDTO {
  id: string;
  buyerName: string;
  requirements: string;
  quantity: number;
  shippingAddress: string;
  attachmentUrl: string;
  quotedPrice?: number;
  status: string;
  createdAt: string;
  rulerModel?: string;
  customName?: string;
  customStudentId?: string;
  color?: string;
  fontStyle?: string;
  paymentMethod?: string;
  paymentStatus?: string;
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
  acceptQuotation: (id: string, paymentMethod: string = 'COD') =>
    send(`/custom-orders/${id}/status`, { status: 'ACCEPTED', paymentMethod }, 'put'),

  // Admin endpoints
  getAllCustomOrders: () => read<CustomDTO[]>('/admin/custom-orders'),
  quoteCustomOrder: (id: string, price: number) =>
    send(`/admin/custom-orders/${id}/quote`, { price }, 'put'),
};

export default quotationService;
