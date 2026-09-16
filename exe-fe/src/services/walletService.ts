import { get, post } from './api';

export const walletService = {
  getWalletBalance: async () => {
    const response = await get('/wallet/balance');
    return response.data;
  },

  getTransactions: async () => {
    const response = await get('/wallet/transactions');
    return response.data;
  },

  deposit: async (amount: number, method: string) => {
    const response = await post('/wallet/deposit', { amount, method });
    return response.data;
  },

  pay: async (amount: number, description: string) => {
    const response = await post('/wallet/pay', { amount, description });
    return response.data;
  },
};
