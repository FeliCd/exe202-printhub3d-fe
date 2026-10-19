import { read, send } from './api';

export interface CustomOrderItemDTO {
  id: string;
  buyerId: string;
  buyerName: string;
  requirements: string;
  attachmentUrl?: string;
  quotedPrice?: number;
  unitPrice?: number;
  quantity?: number;
  priceVersion?: number;
  rulerModel?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceOrderItemDTO {
  id: number;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  color?: string;
  engravingText?: string;
}

export interface MarketplaceOrderDTO {
  id: string;
  sellerId?: string;
  status: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  items: MarketplaceOrderItemDTO[];
}

export interface CheckoutOrderDetailDTO {
  id: string;
  userId: string;
  shippingAddress: string;
  shippingMode: 'COMMON' | 'SEPARATE';
  status: string;
  totalAmount?: number;
  shippingFee?: number;
  marketplaceShippingFee?: number;
  customShippingFee?: number;
  shippingFeeAssignedScope?: 'MARKETPLACE' | 'CUSTOM';
  marketplaceStatus?: string;
  customStatus?: string;
  paymentMethod?: string;
  summaryVersion: number;
  createdAt: string;
  updatedAt?: string;
  customOrders: CustomOrderItemDTO[];
  marketplaceOrders: MarketplaceOrderDTO[];
  allCustomQuoted: boolean;
  readyForConfirm: boolean;
  paymentLinkUrl?: string;
}

export interface ConfirmCheckoutRequest {
  shippingAddress: string;
  summaryVersion?: number;
  idempotencyKey?: string;
}

export const checkoutService = {
  getCheckoutOrder: (id: string) => read<CheckoutOrderDetailDTO>(`/checkout-orders/${encodeURIComponent(id)}`),
  getMyCheckoutOrders: () => read<CheckoutOrderDetailDTO[]>('/checkout-orders/me'),
  confirmCheckoutOrder: (id: string, payload: ConfirmCheckoutRequest) =>
    send<CheckoutOrderDetailDTO>(`/checkout-orders/${encodeURIComponent(id)}/confirm`, payload, 'post'),
};

export default checkoutService;
