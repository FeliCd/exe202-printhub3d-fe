import { read, send } from './api';

export type PaymentOrderType = 'ORDER' | 'CUSTOM_ORDER' | 'CHECKOUT_ORDER' | 'SUBSCRIPTION_PURCHASE' | 'SUBSCRIPTION';

export interface CreatePaymentLinkRequest {
  orderId: string;
  orderType: PaymentOrderType;
  description?: string;
  customAmount?: number;
  paymentOption?: 'FULL' | 'DEPOSIT';
  returnUrl?: string;
  cancelUrl?: string;
}

export interface VerifyPaymentResponse {
  orderCode: string;
  status: string;
  amount: number;
  targetType?: 'ORDER' | 'CUSTOM_ORDER' | 'CHECKOUT_ORDER' | 'SUBSCRIPTION_PURCHASE';
  planName?: string;
}

export async function payOrder(orderId: string, orderType: PaymentOrderType = 'ORDER'): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const data = await send<{ paymentLinkUrl: string }>('/payments/create-link', {
    orderId,
    orderType,
    paymentOption: 'FULL',
    returnUrl: origin ? `${origin}/payment-result` : undefined,
    cancelUrl: origin ? `${origin}/payment-result?cancel=true` : undefined,
  });
  if (!data.paymentLinkUrl) throw new Error('Máy chủ chưa trả liên kết thanh toán.');
  const url = new URL(data.paymentLinkUrl);
  if (url.protocol !== 'https:') throw new Error('Liên kết thanh toán không hợp lệ.');
  window.location.assign(url.href);
}

export async function paySubscription(purchaseId: string): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const data = await send<{ paymentLinkUrl: string }>('/payments/create-link', {
    orderId: purchaseId,
    orderType: 'SUBSCRIPTION_PURCHASE',
    paymentOption: 'FULL',
    returnUrl: origin ? `${origin}/payment-result?type=SUBSCRIPTION_PURCHASE` : undefined,
    cancelUrl: origin ? `${origin}/payment-result?cancel=true&type=SUBSCRIPTION_PURCHASE` : undefined,
  });
  if (!data.paymentLinkUrl) throw new Error('Máy chủ chưa trả liên kết thanh toán.');
  const url = new URL(data.paymentLinkUrl);
  if (url.protocol !== 'https:') throw new Error('Liên kết thanh toán không hợp lệ.');
  window.location.assign(url.href);
}

export const paymentService = {
  createPaymentLink: (data: CreatePaymentLinkRequest) =>
    send<{ paymentLinkUrl: string; orderCode: string }>('/payments/create-link', data),
  verifyPayment: (code: string) =>
    read<VerifyPaymentResponse>(`/payments/verify/${encodeURIComponent(code)}`),
  payOrder,
  paySubscription,
};

export default paymentService;
