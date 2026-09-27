import api, { read, send } from './api';

export interface FileDTO {
  id: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
}

export async function uploadFile(file: File | Blob, name?: string): Promise<FileDTO> {
  const data = new FormData();
  data.append('file', file, name || (file instanceof File ? file.name : 'design.stl'));
  return send<FileDTO>('/vault/upload', data);
}

export async function downloadFile(path: string, name: string): Promise<void> {
  const relative = path.replace(/^\/api/, '');
  const response = await api.get(relative, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fileVaultService = {
  getFiles: () => read<FileDTO[]>('/vault/files'),
  uploadFile,
  downloadFile,
  deleteFile: (id: string) => send(`/vault/files/${id}`, undefined, 'delete'),
};

export default fileVaultService;
