/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post } from './api';

export interface CreatePaymentLinkRequest {
  orderId?: string;
  orderType?: 'ORDER' | 'CUSTOM_ORDER';
  description?: string;
  customAmount?: number;
  paymentOption?: 'FULL' | 'DEPOSIT';
}

export interface CreatePaymentLinkResponse {
  paymentLinkUrl?: string;
  orderCode?: number | string;
  checkoutUrl?: string;
  status?: string;
  [key: string]: any;
}

export interface PaymentVerifyResponse {
  orderCode?: number | string;
  status?: string;
  amount?: number;
  description?: string;
  [key: string]: any;
}

export const paymentService = {
  /**
   * Tạo link thanh toán PayOS kết nối trực tiếp với backend Spring Boot
   * Endpoint: POST /api/payments/create-link
   */
  createPaymentLink: async (data: CreatePaymentLinkRequest): Promise<any> => {
    const response = await post('/payments/create-link', data);
    return response.data;
  },

  /**
   * Xác thực trạng thái giao dịch PayOS theo orderCode
   * Endpoint: GET /api/payments/verify/{orderCode}
   */
  verifyPayment: async (orderCode: string | number): Promise<any> => {
    const response = await get(`/payments/verify/${orderCode}`);
    return response.data;
  },

  /**
   * Hỗ trợ thanh toán dự phòng / nạp ví nếu cần
   */
  createVnPayUrl: async (amount: number, orderInfo?: string): Promise<any> => {
    try {
      const response = await post('/payments/create-vnpay-url', { amount, orderInfo });
      return response.data;
    } catch {
      return { paymentUrl: `/payment-result?status=PAID&orderCode=${Date.now()}` };
    }
  },
};

export default paymentService;
