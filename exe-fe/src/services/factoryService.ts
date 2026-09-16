import { get, put } from './api';

export const factoryService = {
  getGCodes: async () => {
    const response = await get('/factory/gcodes');
    return response.data;
  },

  getInventory: async () => {
    const response = await get('/factory/inventory');
    return response.data;
  },

  getQCItems: async () => {
    const response = await get('/factory/qc');
    return response.data;
  },

  getPackingList: async () => {
    const response = await get('/factory/packing');
    return response.data;
  },

  updateQCStatus: async (id: string, status: string) => {
    const response = await put(`/factory/qc/${id}/status`, { status });
    return response.data;
  },

  updatePackageStatus: async (id: string, status: string) => {
    const response = await put(`/factory/packing/${id}/status`, { status });
    return response.data;
  },
};
