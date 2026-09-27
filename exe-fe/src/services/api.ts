/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const getBaseUrl = (): string => {
  let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  // Bỏ dấu gạch chéo cuối
  url = url.trim().replace(/\/+$/, '');
  // Nếu chưa có đuôi /api thì tự động thêm vào để khớp với backend Spring Boot
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

// Interceptor automatically attaches token if available (except for auth endpoints)
api.interceptors.request.use((config: any) => {
  const isPublicAuthUrl = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  const token = localStorage.getItem('token');
  if (token && config.headers && !isPublicAuthUrl) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: automatically clear expired token from localStorage if 401
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error?.response?.status === 401) {
      const isAuthLogin = error?.config?.url?.includes('/auth/login');
      if (!isAuthLogin) {
        console.warn('JWT token expired or invalid, clearing localStorage token');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const get = (endpoint: string, params?: any) => api.get(endpoint, { params });

export const post = (endpoint: string, data?: any) => api.post(endpoint, data);

export const put = (endpoint: string, data?: any, config?: any) => api.put(endpoint, data, config);

export const remove = (endpoint: string) => api.delete(endpoint);

export function unwrap<T>(value: T | { result: T }): T {
  return value && typeof value === 'object' && 'result' in value ? (value as { result: T }).result : (value as T);
}

export async function read<T>(path: string): Promise<T> {
  return unwrap<T>((await api.get(path)).data);
}

export async function send<T = void>(path: string, data?: unknown, method: 'post' | 'put' | 'delete' = 'post'): Promise<T> {
  return unwrap<T>((await api.request({ url: path, method, data })).data);
}

export function errorText(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body?.errors) return Object.values(body.errors).join('. ');
    return body?.message || body?.detail || (error.response?.status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Không thể kết nối máy chủ. Vui lòng thử lại.');
  }
  return error instanceof Error ? error.message : 'Thao tác không thành công.';
}

export default api;
