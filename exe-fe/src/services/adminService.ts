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
  customRequestedCount?: number;
  customQuotedCount?: number;
  customInProductionCount?: number;
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

export interface FinancialReconciliationItem {
  paymentId: string;
  orderCode?: string | null;
  sourceType: string;
  sourceId?: string | null;
  reason: string;
  amountVnd?: number | null;
  receivedAt?: string | null;
}

export interface FinancialCompletionIssue {
  sourceType: string;
  sourceId: string;
  reason: string;
  completedAt?: string | null;
}

export interface FinancialReportDTO {
  period?: { from?: string | null; to?: string | null } | null;
  timeZone?: string;
  generatedAt?: string;
  orderCashVnd: number;
  subscriptionCashVnd: number;
  totalCashVnd: number;
  shippingCashVnd: number;
  completedGoodsValueVnd: number;
  pendingReconciliationVnd: number;
  reconciliationItems: FinancialReconciliationItem[];
  completionIssues: FinancialCompletionIssue[];
}

export interface FinanceSummaryData {
  totalGmv: number;
  platformCommission: number;
  factoryPayout: number;
  studentWalletBalance: number;
  totalOrders: number;
  recentTransactions: FinancialTransaction[];
  financialSummary?: FinancialReportDTO;
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
  getFinanceSummary: (params?: { from?: string; to?: string }) => {
    const sp = new URLSearchParams();
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const qs = sp.toString();
    return read<FinanceSummaryData>(`/admin/finance/summary${qs ? `?${qs}` : ''}`);
  },
  getRevenueAnalytics: () => read<Record<string, unknown>>('/admin/analytics/revenue'),
  getCommissionFund: () => read<Record<string, unknown>>('/admin/finance/commission-fund'),

  // Settings
  getStoreSettings: () => read<Record<string, unknown>>('/admin/settings'),
  updateStoreSettings: (data: unknown) => send('/admin/settings', data, 'put'),
};

export default adminService;
