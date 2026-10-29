import { read, send } from './api';

export interface OrderItemDTO {
  id?: number;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  engravingText?: string;
  reviewId?: number;
  reviewRating?: number;
}

export interface ShippingInfoDTO {
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  trackingNumber?: string;
}

export interface BlockedActionDTO {
  action: string;
  reasonCode: string;
  message: string;
}

export interface OrderDTO {
  id: string;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  orderCode?: string;
  items: OrderItemDTO[];
  shippingInfo?: ShippingInfoDTO;
  paymentDueAt?: string;
  allowedActions?: string[];
  blockedActions?: BlockedActionDTO[];
}

export const orderService = {
  getUserOrders: () => read<OrderDTO[]>('/orders/me'),
  getOrderHistory: () => read<OrderDTO[]>('/orders/me'),
  getOrderById: (id: string) => read<OrderDTO>(`/orders/${id}`),
  createOrder: (data: unknown) => send<OrderDTO[]>('/orders', data),
  updateOrderStatus: (id: string, status: string) => send(`/orders/${id}/status`, { status }, 'put'),
  completeRewards: (id: string) => send(`/orders/${id}/complete-rewards`, undefined, 'post'),
};

export default orderService;
