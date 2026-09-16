// Backend không có WalletController (chỉ có FinanceController cho Admin), do đó service này chạy mock in-memory
export const walletService = {
  getWalletBalance: async () => {
    return { code: 200, result: { balance: 250000 } };
  },

  getTransactions: async () => {
    return { code: 200, result: [] };
  },

  deposit: async (amount: number, _method: string) => {
    return { code: 200, result: { amount, status: 'SUCCESS' } };
  },

  pay: async (amount: number, _description: string) => {
    return { code: 200, result: { amount, status: 'SUCCESS' } };
  },
};
