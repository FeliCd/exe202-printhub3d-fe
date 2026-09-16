/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemNotification } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const initialNotifications: SystemNotification[] = [
  {
    id: 'n-1',
    title: 'Đơn hàng đang được in 3D',
    message: 'Đơn hàng #ORD-8821 của bạn đã được phân bổ tới máy in Bambu Lab X1C.',
    timestamp: '10 phút trước',
    read: false,
    type: 'ORDER',
    link: '/orders',
  },
  {
    id: 'n-2',
    title: 'Biến động số dư ví',
    message: 'Tài khoản của bạn vừa được cộng +50.000đ tiền hoàn bảo hành đơn #ORD-8710.',
    timestamp: '2 giờ trước',
    read: false,
    type: 'WALLET',
    link: '/wallet',
  },
  {
    id: 'n-3',
    title: 'Khuyến mãi Gói Hội Viên Pro',
    message: 'Ưu đãi sinh viên Kỹ thuật: Giảm 20% khi đăng ký gói Maker Student tháng này.',
    timestamp: '1 ngày trước',
    read: true,
    type: 'SYSTEM',
    link: '/subscriptions',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);

  // Thử gọi backend lấy thông báo hệ thống (chỉ khi đã đăng nhập), nếu lỗi dùng mock data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        }
      } catch (error) {
        console.warn('Backend notification API error, falling back to mock notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id).catch((err) => {
      console.warn('Backend markAsRead error:', err);
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead().catch((err) => {
      console.warn('Backend markAllAsRead error:', err);
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      timestamp: 'Vừa xong',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
