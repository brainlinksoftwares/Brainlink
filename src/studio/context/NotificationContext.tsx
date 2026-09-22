import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { storageEngine } from '../services/storageEngine';
import { useAuth } from './AuthContext';

const NOTIFICATIONS_KEY = 'notifications';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const load = () => {
      const all = storageEngine.get<NotificationItem>(NOTIFICATIONS_KEY);
      if (user) {
        // Filter notifications for current user or all team
        const userNotifs = all.filter((n) => !n.userId || n.userId === user.id || n.userId === 'all');
        setNotifications(userNotifs);
      } else {
        setNotifications([]);
      }
    };

    load();
    const unsub = storageEngine.subscribe(NOTIFICATIONS_KEY, load);
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const all = storageEngine.get<NotificationItem>(NOTIFICATIONS_KEY);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    storageEngine.set(NOTIFICATIONS_KEY, updated);
  };

  const markAllAsRead = () => {
    const all = storageEngine.get<NotificationItem>(NOTIFICATIONS_KEY);
    const updated = all.map((n) => ({ ...n, read: true }));
    storageEngine.set(NOTIFICATIONS_KEY, updated);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const all = storageEngine.get<NotificationItem>(NOTIFICATIONS_KEY);
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    storageEngine.set(NOTIFICATIONS_KEY, [newNotif, ...all]);
  };

  const clearNotifications = () => {
    storageEngine.set(NOTIFICATIONS_KEY, []);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
