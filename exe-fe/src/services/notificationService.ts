import { get, put } from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await put('/notifications/read-all');
    return response.data;
  },
};
