/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put } from './api';

export const warrantyService = {
  createClaim: async (claimData: any) => {
    const response = await post('/warranty/claim', claimData);
    return response.data;
  },

  getUserClaims: async (userId?: string) => {
    const endpoint = userId ? `/warranty/user/${userId}` : '/warranty/user/me';
    const response = await get(endpoint);
    return response.data;
  },

  getAllClaims: async () => {
    const response = await get('/warranty/admin/claims');
    return response.data;
  },

  updateClaimStatus: async (id: string, status: string) => {
    const response = await put(`/warranty/admin/claim/${id}/status`, { status });
    return response.data;
  },
};
