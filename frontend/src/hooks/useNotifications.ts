// ===========================================
// USE NOTIFICATIONS HOOK
// Location: src/hooks/useNotifications.ts
// ===========================================

import { useEffect, useCallback, useRef } from 'react';
import { useNotificationStore, AppNotification } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import notificationService from '@/services/notification';

export function useNotifications() {
  const { notifications, isOpen, setNotifications, toggleOpen, setOpen, markAsRead: storeMarkAsRead, markAllAsRead: storeMarkAllAsRead, clearAll } =
    useNotificationStore();
  const { isAuthenticated } = useAuthStore();
  const fetchedRef = useRef(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      const appNotifications: AppNotification[] = data.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        icon: n.icon,
        read: n.read,
        createdAt: n.createdAt,
      }));
      setNotifications(appNotifications);
    } catch (err) {
      console.error('[Notifications] Failed to fetch:', err);
    }
  }, [isAuthenticated, setNotifications]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchNotifications();
    }
    if (!isAuthenticated) {
      fetchedRef.current = false;
      clearAll();
    }
  }, [isAuthenticated, fetchNotifications, clearAll]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  // Mark as read (optimistic + API)
  const handleMarkAsRead = useCallback(async (id: string) => {
    storeMarkAsRead(id);
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('[Notifications] Failed to mark as read:', err);
    }
  }, [storeMarkAsRead]);

  // Mark all as read (optimistic + API)
  const handleMarkAllAsRead = useCallback(async () => {
    storeMarkAllAsRead();
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read:', err);
    }
  }, [storeMarkAllAsRead]);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearAll,
    refresh: fetchNotifications,
  };
}
