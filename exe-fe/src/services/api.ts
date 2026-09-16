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
      }
    }
    return Promise.reject(error);
  }
);

export const get = (endpoint: string, params?: any) => api.get(endpoint, { params });

export const post = (endpoint: string, data?: any) => api.post(endpoint, data);

export const put = (endpoint: string, data?: any, config?: any) => api.put(endpoint, data, config);

export const remove = (endpoint: string) => api.delete(endpoint);

export default api;
