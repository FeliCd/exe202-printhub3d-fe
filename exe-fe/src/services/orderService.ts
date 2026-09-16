/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put } from './api';

export const orderService = {
  getUserOrders: async () => {
    try {
      const response = await get('/orders/my-orders');
      return response.data;
    } catch {
      const response = await get('/orders/me');
      return response.data;
    }
  },

  getOrderHistory: async () => {
    const response = await get('/orders/history');
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: any) => {
    const response = await post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await put(`/orders/${id}/status`, { status });
    return response.data;
  },
};
