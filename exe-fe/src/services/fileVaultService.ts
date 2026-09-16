/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, remove } from './api';

export const fileVaultService = {
  getFiles: async () => {
    const response = await get('/vault/files');
    return response.data;
  },

  uploadFile: async (fileData: any) => {
    const response = await post('/vault/upload', fileData);
    return response.data;
  },

  deleteFile: async (id: string) => {
    const response = await remove(`/vault/files/${id}`);
    return response.data;
  },
};
