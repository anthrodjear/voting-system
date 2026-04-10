// ===========================================
// NOTIFICATION STORE
// Location: stores/notification.store.ts
// ===========================================

import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  isOpen: boolean;

  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  addNotifications: (notifications: Omit<AppNotification, 'id' | 'read' | 'createdAt'>[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  isOpen: false,

  setNotifications: (notifications) => {
    set({ notifications });
  },

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
    }));
  },

  addNotifications: (notifications) => {
    const newNotifications: AppNotification[] = notifications.map((n, i) => ({
      ...n,
      id: `notif-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }));

    set((state) => {
      const existingTitles = new Set(state.notifications.map(n => n.title));
      const uniqueNew = newNotifications.filter(n => !existingTitles.has(n.title));
      return {
        notifications: [...uniqueNew, ...state.notifications].slice(0, 50),
      };
    });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  toggleOpen: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setOpen: (open) => {
    set({ isOpen: open });
  },
}));
