/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put } from './api';

export const quotationService = {
  getQuotations: async () => {
    const response = await get('/quotations');
    return response.data;
  },

  createQuotation: async (data: any) => {
    const response = await post('/quotations', data);
    return response.data;
  },

  acceptQuotation: async (id: string) => {
    const response = await put(`/quotations/${id}/accept`);
    return response.data;
  },

  rejectQuotation: async (id: string, reason?: string) => {
    const response = await put(`/quotations/${id}/reject`, { reason });
    return response.data;
  },
};
