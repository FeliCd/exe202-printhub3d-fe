/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userNameOrEmail: string, password?: string) => Promise<UserRole>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  verifyPasscode: (passcode: string) => boolean;
  setPasscode: (newPasscode: string) => void;
  updateProfile: (data: Partial<User>) => Promise<void> | void;
  lockAccount: (reason: string) => void;
  unlockAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [storedPasscode, setStoredPasscodeState] = useState<string>('123456');

  // Lấy thông tin user hiện tại nếu có token trong localStorage
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await authService.getCurrentUser();
        const data = res?.result || res?.data || res;
        if (data && (data.email || data.id || data.userId)) {
          const detectedRole: UserRole = data.role === 'ADMIN' ? 'ADMIN' : 'BUYER';
          setUser({
            id: String(data.id || data.userId || 'usr-1'),
            name: data.fullName || data.name || data.userName || 'Người dùng',
            email: data.email || '',
            phone: data.phone || data.phoneNumber || '',
            address: data.address || '',
            role: detectedRole,
            studentId: data.studentId || '',
            university: data.university || '',
            isVerified: true,
            hasPasscode: true,
            isLocked: false,
          });
        }
      } catch (error) {
        console.warn('Lỗi khi lấy thông tin người dùng từ token:', error);
        setUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const login = async (userNameOrEmail: string, password?: string): Promise<UserRole> => {
    try {
      // Gọi API backend đăng nhập
      const res = await authService.login({ userNameOrEmail, password: password || '12345678' });
      const data = res?.result || res?.data || res;
      const token = data?.accessToken || data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (data && (token || data.userId || data.fullName || data.role)) {
        const detectedRole: UserRole = data.role === 'ADMIN' ? 'ADMIN' : 'BUYER';
        setUser({
          id: data.userId ? String(data.userId) : 'user-logged',
          name: data.fullName || (detectedRole === 'ADMIN' ? 'Quản Trị Viên' : (data.username || userNameOrEmail.split('@')[0])),
          email: data.email || (userNameOrEmail.includes('@') ? userNameOrEmail : `${userNameOrEmail}@printhub3d.com`),
          phone: data.phone || '0987.654.321',
          address: data.address || '',
          role: detectedRole,
          studentId: data.studentId || '',
          university: data.university || '',
          isVerified: true,
          hasPasscode: true,
          isLocked: false,
        });
        return detectedRole;
      }
    } catch (error) {
      console.warn('Backend API login error, falling back to local fallback:', error);
    }

    // Fallback nếu API tạm thời không phản hồi trong môi trường dev
    const fallbackRole: UserRole = userNameOrEmail.toLowerCase().includes('admin') ? 'ADMIN' : 'BUYER';
    setUser({
      id: `usr-${Date.now()}`,
      name: fallbackRole === 'ADMIN' ? 'Quản Trị Viên' : userNameOrEmail.split('@')[0],
      email: userNameOrEmail.includes('@') ? userNameOrEmail : `${userNameOrEmail}@student.edu.vn`,
      phone: '0987.654.321',
      address: '',
      role: fallbackRole,
      isVerified: true,
      hasPasscode: true,
      isLocked: false,
    });
    return fallbackRole;
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

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (localStorage.getItem('token')) {
        await authService.updateProfile({
          fullName: data.name || user?.name,
          email: data.email || user?.email,
          phone: data.phone || user?.phone,
          address: data.address !== undefined ? data.address : user?.address,
        });
      }
    } catch (err) {
      console.warn('Could not sync updateProfile to backend:', err);
    }
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
