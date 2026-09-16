/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post } from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await get('/categories');
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await post('/categories', data);
    return response.data;
  },
};
