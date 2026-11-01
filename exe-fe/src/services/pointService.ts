import { read } from './api';

export interface PointWalletResponse {
  userId: string;
  balance: number;
  availableToSpend: number;
  updatedAt?: string;
}

export interface PointTransactionItem {
  id: number | string;
  amount: number;
  type: 'EARN' | 'REDEEM';
  description: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const pointService = {
  getWallet: () => read<PointWalletResponse>('/points/me'),
  getTransactions: async (page = 0, size = 20): Promise<PointTransactionItem[]> => {
    const res = await read<PageResponse<PointTransactionItem> | PointTransactionItem[]>(
      `/points/me/transactions?page=${page}&size=${size}&sort=createdAt,desc`
    );
    if (res && 'content' in res && Array.isArray((res as PageResponse<PointTransactionItem>).content)) {
      return (res as PageResponse<PointTransactionItem>).content;
    }
    return Array.isArray(res) ? (res as PointTransactionItem[]) : [];
  },
};

export default pointService;

