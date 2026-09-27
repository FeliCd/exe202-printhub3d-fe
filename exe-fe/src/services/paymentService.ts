import { read, send } from './api';

export interface CreatePaymentLinkRequest {
  orderId: string;
  orderType: 'ORDER' | 'CUSTOM_ORDER';
  description?: string;
  customAmount?: number;
  paymentOption?: 'FULL' | 'DEPOSIT';
}

export async function payOrder(orderId: string, orderType: 'ORDER' | 'CUSTOM_ORDER' = 'ORDER'): Promise<void> {
  const data = await send<{ paymentLinkUrl: string }>('/payments/create-link', {
    orderId,
    orderType,
    paymentOption: 'FULL',
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
    read<{ status: string; amount: number }>(`/payments/verify/${encodeURIComponent(code)}`),
  payOrder,
};

export default paymentService;
