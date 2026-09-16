import { get, put } from './api';

export const adminService = {
  getUsers: async () => {
    const response = await get('/admin/users');
    return response.data;
  },

  getGlobalOrders: async () => {
    const response = await get('/admin/orders');
    return response.data;
  },

  getFactories: async () => {
    const response = await get('/admin/factories');
    return response.data;
  },

  getDisputes: async () => {
    const response = await get('/admin/disputes');
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserLock: async (userId: string, isLocked: boolean, reason?: string) => {
    const response = await put(`/admin/users/${userId}/lock`, { isLocked, reason });
    return response.data;
  },
};
