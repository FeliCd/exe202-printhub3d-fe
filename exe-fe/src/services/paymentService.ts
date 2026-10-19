import { read, send } from './api';

export interface CreatePaymentLinkRequest {
  orderId: string;
  orderType: 'ORDER' | 'CUSTOM_ORDER' | 'CHECKOUT_ORDER';
  description?: string;
  customAmount?: number;
  paymentOption?: 'FULL' | 'DEPOSIT';
  returnUrl?: string;
  cancelUrl?: string;
  scope?: 'ALL' | 'MARKETPLACE' | 'CUSTOM';
}

export interface PaymentAttemptStatusResponse {
  attemptId: string;
  providerCode: number;
  status: 'INITIALIZING' | 'READY' | 'SUCCESS' | 'FAILED' | 'PENDING_VERIFY' | 'RECONCILIATION_REQUIRED' | 'CANCELLED' | 'EXPIRED';
  scope: string;
  amount: number;
  checkoutUrl?: string;
  qrCode?: string;
  expiresAt?: string;
  retryAfterSeconds?: number;
  message?: string;
}

export interface CreatePaymentLinkResponse {
  paymentLinkUrl?: string;
  qrCodeUrl?: string;
  amount?: number;
  orderCode?: string;
  expiredAt?: string;
  attemptId?: string;
  status?: string;
  retryAfterSeconds?: number;
}

/**
 * Polling trạng thái khởi tạo PayOS attempt khi nhận HTTP 202 hoặc status INITIALIZING
 * Tối đa 30 giây (mỗi lần 2 giây).
 */
export async function pollPaymentAttempt(attemptId: string, maxDurationMs: number = 30000): Promise<PaymentAttemptStatusResponse> {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < maxDurationMs) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    try {
      const statusRes = await read<PaymentAttemptStatusResponse>(`/payments/attempts/${attemptId}/status`);
      if (statusRes.status === 'READY' || statusRes.status === 'SUCCESS') {
        return statusRes;
      }
      if (['FAILED', 'CANCELLED', 'EXPIRED', 'RECONCILIATION_REQUIRED'].includes(statusRes.status)) {
        throw new Error(statusRes.message || `Phiên thanh toán đã kết thúc với trạng thái: ${statusRes.status}`);
      }
    } catch (err: any) {
      if (err?.message && err.message.includes('Phiên thanh toán đã kết thúc')) {
        throw err;
      }
      const st = err?.response?.data?.result?.status;
      if (['FAILED', 'CANCELLED', 'EXPIRED', 'RECONCILIATION_REQUIRED'].includes(st)) {
        throw new Error(err.response.data.result.message || `Phiên thanh toán đã kết thúc: ${st}`);
      }
    }
  }
  throw new Error('Hệ thống đang khởi tạo cổng thanh toán. Vui lòng bấm "Kiểm tra lại" để tiếp tục.');
}

export async function payOrder(
  orderId: string,
  orderType: 'ORDER' | 'CUSTOM_ORDER' | 'CHECKOUT_ORDER' = 'ORDER',
  scope?: 'ALL' | 'MARKETPLACE' | 'CUSTOM',
  autoRedirect: boolean = true
): Promise<string> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const data = await send<CreatePaymentLinkResponse>('/payments/create-link', {
    orderId,
    orderType,
    scope,
    paymentOption: 'FULL',
    returnUrl: origin ? `${origin}/payment-result` : undefined,
    cancelUrl: origin ? `${origin}/payment-result?cancel=true` : undefined,
  });

  let checkoutUrl = data.paymentLinkUrl;

  // Nếu server báo đơn đã thanh toán thành công (do đã hoàn tất hoặc settle trước đó)
  if (data.status === 'SUCCESS') {
    const successUrl = origin ? `${origin}/payment-result?orderCode=${data.orderCode}&status=PAID` : '/payment-result';
    if (autoRedirect) window.location.assign(successUrl);
    return successUrl;
  }

  // Nếu server trả 202 hoặc status INITIALIZING kèm attemptId, tiến hành polling
  if ((!checkoutUrl || data.status === 'INITIALIZING') && data.attemptId) {
    const polled = await pollPaymentAttempt(data.attemptId);
    // Ưu tiên kiểm tra SUCCESS trước: nếu đã thành công thì vào thẳng kết quả, không mở lại link thanh toán
    if (polled.status === 'SUCCESS') {
      const successUrl = origin ? `${origin}/payment-result?orderCode=${polled.providerCode}&status=PAID` : '/payment-result';
      if (autoRedirect) window.location.assign(successUrl);
      return successUrl;
    }
    checkoutUrl = polled.checkoutUrl;
  }

  if (!checkoutUrl) throw new Error('Máy chủ chưa trả liên kết thanh toán.');
  const url = new URL(checkoutUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Liên kết thanh toán không hợp lệ.');
  if (autoRedirect) {
    window.location.assign(url.href);
  }
  return checkoutUrl;
}

export const paymentService = {
  createPaymentLink: (data: CreatePaymentLinkRequest) =>
    send<CreatePaymentLinkResponse>('/payments/create-link', data),
  getAttemptStatus: (attemptId: string) =>
    read<PaymentAttemptStatusResponse>(`/payments/attempts/${attemptId}/status`),
  verifyPayment: (code: string) =>
    read<{ status: string; amount: number }>(`/payments/verify/${encodeURIComponent(code)}`),
  pollPaymentAttempt,
  payOrder,
};

export default paymentService;
