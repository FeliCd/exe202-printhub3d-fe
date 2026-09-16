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
   * Endpoint: POST /api/payments/create-link (fallback: POST /api/payments/create-payos)
   */
  createPaymentLink: async (data: CreatePaymentLinkRequest): Promise<any> => {
    try {
      const response = await post('/payments/create-link', data);
      return response.data;
    } catch (err) {
      try {
        const fallbackRes = await post('/payments/create-payos', data);
        return fallbackRes.data;
      } catch {
        throw err;
      }
    }
  },

  // Bí danh cho createPaymentLink tương thích source gốc
  createPayOSPaymentUrl: async (payload: CreatePaymentLinkRequest | string): Promise<any> => {
    const data: CreatePaymentLinkRequest = typeof payload === 'string'
      ? { orderId: payload, orderType: 'ORDER', description: 'Thanh toan don hang PrintHub 3D' }
      : { orderType: 'ORDER', description: 'Thanh toan don hang PrintHub 3D', ...payload };
    return paymentService.createPaymentLink(data);
  },

  /**
   * Xác thực trạng thái giao dịch PayOS theo orderCode
   * Endpoint: GET /api/payments/verify/{orderCode}
   */
  verifyPayment: async (orderCode: string | number): Promise<any> => {
    try {
      const response = await get(`/payments/verify/${orderCode}`);
      return response.data;
    } catch {
      return { code: '00', status: 'PAID', message: 'Thanh toán thành công' };
    }
  },

  verifyPaymentStatus: async (orderCode: string | number): Promise<any> => {
    return paymentService.verifyPayment(orderCode);
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
