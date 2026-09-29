import { get, put, read, send } from './api';

export interface RecentPrintJob {
  id: string;
  item: string;
  factory: string;
  status: string;
  type: string;
  price?: number;
}

export interface AdminDashboardData {
  orderCount: number;
  completedCount: number;
  paidAmount: number;
  customCount: number;
  totalRevenue: number;
  activePrintingOrders: number;
  pendingDisputesCount: number;
  totalUsersCount: number;
  recentJobs: RecentPrintJob[];
}

export interface FinancialTransaction {
  id: string;
  user: string;
  type: string;
  amount: number;
  status: string;
  gateway: string;
  date: string;
}

export interface FinanceSummaryData {
  totalGmv: number;
  platformCommission: number;
  factoryPayout: number;
  studentWalletBalance: number;
  totalOrders: number;
  recentTransactions: FinancialTransaction[];
}

export const adminService = {
  // Users
  getUsers: async () => {
    const response = await get('/admin/users');
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

  // Orders & Disputes
  getGlobalOrders: async () => {
    const response = await get('/admin/orders');
    return response.data;
  },

  getDisputes: async () => {
    const response = await get('/admin/disputes');
    return response.data;
  },

  // Dashboard
  getAdminDashboard: () => read<AdminDashboardData>('/admin/dashboard'),
  getUserDashboard: () => read<Record<string, unknown>>('/dashboard'),

  // 3D Printers
  getPrinters: () => read<unknown[]>('/admin/printers'),
  createPrinter: (data: unknown) => send('/admin/printers', data),
  updatePrinter: (id: string, data: unknown) => send(`/admin/printers/${id}`, data, 'put'),

  // Finance & Analytics
  getFinanceSummary: () => read<FinanceSummaryData>('/admin/finance/summary'),
  getRevenueAnalytics: () => read<Record<string, unknown>>('/admin/analytics/revenue'),
  getCommissionFund: () => read<Record<string, unknown>>('/admin/finance/commission-fund'),

  // Settings
  getStoreSettings: () => read<Record<string, unknown>>('/admin/settings'),
  updateStoreSettings: (data: unknown) => send('/admin/settings', data, 'put'),
};

export default adminService;
