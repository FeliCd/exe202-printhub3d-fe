/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put } from './api';

export const authService = {
  login: async (credentials: { userNameOrEmail?: string; username?: string; password?: string }) => {
    const payload = {
      userNameOrEmail: credentials.userNameOrEmail || credentials.username,
      password: credentials.password,
    };
    const response = await post('/auth/login', payload);
    const result = response.data?.result || response.data;
    const token = result?.accessToken || result?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await post('/auth/register', userData);
    return response.data;
  },

  verifyRegisterOtp: async (data: { email: string; otpCode: string }) => {
    const response = await post('/auth/verify-register-otp', data);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await get('/auth/profile');
      return response.data;
    } catch {
      const response = await get('/auth/me');
      return response.data;
    }
  },

  updateProfile: async (profileData: any) => {
    const response = await put('/auth/profile', profileData);
    return response.data;
  },

  sendForgotPasswordOtp: async (email: string) => {
    const response = await post(`/auth/forgot-password/send-otp?email=${encodeURIComponent(email)}`, {});
    return response.data;
  },

  forgotPassword: async (data: { email: string; otpCode: string; newPassword: string; confirmPassword: string }) => {
    const response = await post('/auth/forgot-password', data);
    return response.data;
  },

  sendResetPasswordOtp: async (email?: string) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const response = await post(`/auth/reset-password/send-otp${query}`, {});
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    otpCode: string;
  }) => {
    const response = await post('/auth/reset-password', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

