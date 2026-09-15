/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
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

  const login = (email: string, role: UserRole) => {
    setUser({
      ...defaultUser,
      email,
      role,
      name: role === 'ADMIN' ? 'Admin Quản Trị' : role === 'FACTORY' ? 'Xưởng In 3D BK-Maker' : 'Nguyễn Văn Anh',
    });
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const verifyPasscode = (passcode: string) => {
    return passcode === storedPasscode;
  };

  const setPasscode = (newPasscode: string) => {
    setStoredPasscodeState(newPasscode);
    if (user) {
      setUser({ ...user, hasPasscode: true });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
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
