/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { WalletTransaction } from '../types';
import { walletService } from '../services/walletService';

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

  // Thử gọi backend lấy số dư và lịch sử giao dịch, nếu lỗi dùng mock data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [balRes, txnsRes] = await Promise.all([
          walletService.getWalletBalance(),
          walletService.getTransactions(),
        ]);
        const balData = balRes?.result || balRes?.data || balRes;
        const txnsData = txnsRes?.result || txnsRes?.data || txnsRes;

        if (typeof balData?.balance === 'number') {
          setBalance(balData.balance);
        } else if (typeof balData === 'number') {
          setBalance(balData);
        }

        if (Array.isArray(txnsData) && txnsData.length > 0) {
          setTransactions(txnsData);
        }
      } catch (error) {
        console.warn('Backend wallet API error, falling back to mock wallet data:', error);
      }
    };
    fetchWalletData();
  }, []);

  const deposit = async (amount: number, method: string) => {
    try {
      await walletService.deposit(amount, method);
    } catch (error) {
      console.warn('Backend deposit API error, applying mock balance update:', error);
    }
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
    try {
      await walletService.pay(amount, description);
    } catch (error) {
      console.warn('Backend pay API error, applying mock balance deduction:', error);
    }
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
