/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { read, send, unwrap } from '../services/api';
interface Profile { id: string; fullName: string; email: string; phone: string; address: string; role: 'USER' | 'ADMIN'; studentId?: string; university?: string }
function mapUser(p: Profile): User { return { id: p.id, name: p.fullName, email: p.email, phone: p.phone || '', address: p.address || '', role: p.role === 'ADMIN' ? 'ADMIN' : 'BUYER', studentId: p.studentId, university: p.university, isVerified: true, hasPasscode: false, isLocked: false }; }
interface AuthContextType {
  user: User | null; role: UserRole; isAuthenticated: boolean; isLoading: boolean;
  login: (name: string, password?: string) => Promise<UserRole>; logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  verifyPasscode: (pin: string) => Promise<boolean>; setPasscode: (pin: string) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem('token');
      const cached = localStorage.getItem('printhub_cached_user');
      if (token && cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setLoading] = useState<boolean>(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const cached = typeof window !== 'undefined' ? localStorage.getItem('printhub_cached_user') : null;
    return !!token && !cached;
  });

  useEffect(() => {
    let active = true;
    const expired = () => {
      localStorage.removeItem('printhub_cached_user');
      setUser(null);
    };
    window.addEventListener('auth:expired', expired);

    (async () => {
      try {
        if (localStorage.getItem('token')) {
          const p = await read<Profile>('/auth/profile');
          if (active) {
            const next = mapUser(p);
            setUser(next);
            localStorage.setItem('printhub_cached_user', JSON.stringify(next));
          }
        } else {
          if (active) setUser(null);
        }
      } catch {
        // If error is not 401, keep cached user so transient network drops / cold starts don't log the user out
        if (active && !localStorage.getItem('token')) {
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      window.removeEventListener('auth:expired', expired);
    };
  }, []);

  const login = async (name: string, password?: string): Promise<UserRole> => {
    const res = unwrap<{ accessToken: string }>(await authService.login({ userNameOrEmail: name, password }));
    if (!res.accessToken) throw new Error('Máy chủ chưa cấp phiên đăng nhập.');
    localStorage.setItem('token', res.accessToken);
    try {
      const p = await read<Profile>('/auth/profile');
      const next = mapUser(p);
      setUser(next);
      localStorage.setItem('printhub_cached_user', JSON.stringify(next));
      return next.role;
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('printhub_cached_user');
      throw e;
    }
  };

  const logout = async () => {
    try {
      await send('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('printhub_cached_user');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Vui lòng đăng nhập.');
    await send(
      '/auth/profile',
      {
        fullName: data.name ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone ?? user.phone,
        address: data.address ?? user.address,
        studentId: data.studentId ?? user.studentId,
        university: data.university ?? user.university,
      },
      'put'
    );
    const updated = mapUser(await read<Profile>('/auth/profile'));
    setUser(updated);
    localStorage.setItem('printhub_cached_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'BUYER',
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        verifyPasscode: pin => send<{ valid: boolean }>('/account/passcode/verify', { pin }).then(r => r.valid),
        setPasscode: pin => send('/account/passcode', { pin }, 'put'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('Missing AuthProvider'); return context; }
