/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, remove } from './api';

export const addressService = {
  getAddresses: async () => {
    const response = await get('/addresses');
    return response.data;
  },

  createAddress: async (data: any) => {
    const response = await post('/addresses', data);
    return response.data;
  },

  setDefaultAddress: async (id: string | number) => {
    const response = await put(`/addresses/${id}/default`);
    return response.data;
  },

  deleteAddress: async (id: string | number) => {
    const response = await remove(`/addresses/${id}`);
    return response.data;
  },
};
