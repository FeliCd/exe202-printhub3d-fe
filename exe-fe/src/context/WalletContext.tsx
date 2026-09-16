/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { WalletTransaction } from '../types';

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  deposit: (amount: number, method: string) => Promise<void>;
  pay: (amount: number, description: string) => Promise<boolean>;
  refund: (amount: number, description: string) => void;
}

const initialTransactions: WalletTransaction[] = [
  {
    id: 'TXN-9021',
    type: 'DEPOSIT',
    amount: 300000,
    description: 'Nạp tiền vào ví PrintHub via QR Code Ngân Hàng',
    date: '2026-09-02 14:30',
    status: 'SUCCESS',
    referenceId: 'VNP982172',
  },
  {
    id: 'TXN-9018',
    type: 'PAYMENT',
    amount: 100000,
    description: 'Thanh toán đơn hàng #ORD-8821 (Thước PLA 20cm)',
    date: '2026-09-01 09:15',
    status: 'SUCCESS',
    referenceId: 'ORD-8821',
  },
  {
    id: 'TXN-8990',
    type: 'DEPOSIT',
    amount: 50000,
    description: 'Nạp thử nghiệm ví PrintHub',
    date: '2026-08-28 16:45',
    status: 'SUCCESS',
  },
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(250000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);

  // Không gọi backend cho wallet vì backend không có WalletController (chỉ dùng mock local)
  const deposit = async (amount: number, method: string) => {
    setBalance((prev) => prev + amount);
    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'DEPOSIT',
      amount,
      description: `Nạp tiền vào ví qua ${method}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SUCCESS',
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const pay = async (amount: number, description: string): Promise<boolean> => {
    if (balance < amount) return false;
    setBalance((prev) => prev - amount);
    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'PAYMENT',
      amount,
      description,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SUCCESS',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    return true;
  };

  const refund = (amount: number, description: string) => {
    setBalance((prev) => prev + amount);
    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'REFUND',
      amount,
      description,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SUCCESS',
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        deposit,
        pay,
        refund,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
