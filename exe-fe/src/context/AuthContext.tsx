/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, password?: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  verifyPasscode: (passcode: string) => boolean;
  setPasscode: (newPasscode: string) => void;
  updateProfile: (data: Partial<User>) => void;
  lockAccount: (reason: string) => void;
  unlockAccount: () => void;
}

const defaultUser: User = {
  id: 'user-001',
  name: 'Nguyễn Văn Anh',
  email: 'vananh.student@hcmut.edu.vn',
  phone: '0987.654.321',
  role: 'BUYER',
  studentId: '20210123',
  university: 'Đại Học Quốc Gia TP.HCM',
  isVerified: true,
  walletBalance: 250000,
  hasPasscode: true,
  isLocked: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [storedPasscode, setStoredPasscodeState] = useState<string>('123456');

  // Thử gọi backend lấy thông tin user hiện tại nếu có token, nếu lỗi thì giữ mock data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await authService.getCurrentUser();
        const data = res?.result || res?.data || res;
        if (data && (data.email || data.id)) {
          setUser({
            ...defaultUser,
            ...data,
            name: data.fullName || data.name || defaultUser.name,
            role: data.role || defaultUser.role,
          });
        }
      } catch (error) {
        console.warn('Backend getCurrentUser failed, using mock default user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  const login = async (email: string, role: UserRole, password?: string) => {
    try {
      // Ưu tiên gọi API backend đăng nhập
      const res = await authService.login({ userNameOrEmail: email, password: password || '12345678' });
      const data = res?.result || res?.data || res;
      const token = data?.accessToken || data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (data && (token || data.userId || data.fullName)) {
        const backendRole: UserRole = data.role === 'ADMIN' ? 'ADMIN' : data.role === 'MAKER' || data.role === 'FACTORY' ? 'FACTORY' : 'BUYER';
        setUser({
          ...defaultUser,
          id: data.userId ? String(data.userId) : defaultUser.id,
          email: data.email || email,
          role: role || backendRole,
          name: data.fullName || (role === 'ADMIN' ? 'Admin Quản Trị' : role === 'FACTORY' ? 'Xưởng In 3D BK-Maker' : 'Nguyễn Văn Anh'),
        });
        return;
      }
    } catch (error) {
      console.warn('Backend API login error, falling back to mock user data:', error);
    }

    // Fallback Mock Data nếu API thất bại
    setUser({
      ...defaultUser,
      email,
      role,
      name: role === 'ADMIN' ? 'Admin Quản Trị' : role === 'FACTORY' ? 'Xưởng In 3D BK-Maker' : 'Nguyễn Văn Anh',
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser(previous => previous ? { ...previous, role } : previous);
    }
  };

  const verifyPasscode = (passcode: string) => {
    return passcode === storedPasscode;
  };

  const setPasscode = (newPasscode: string) => {
    setStoredPasscodeState(newPasscode);
    if (user) {
      setUser(previous => previous ? { ...previous, hasPasscode: true } : previous);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(previous => previous ? { ...previous, ...data } : previous);
  };

  const lockAccount = (reason: string) => {
    if (user) {
      setUser({ ...user, isLocked: true, lockReason: reason });
    }
  };

  const unlockAccount = () => {
    if (user) {
      setUser({ ...user, isLocked: false, lockReason: undefined });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'BUYER',
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
        verifyPasscode,
        setPasscode,
        updateProfile,
        lockAccount,
        unlockAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
