// ===========================================
// USE NOTIFICATIONS HOOK
// Location: src/hooks/useNotifications.ts
// ===========================================

import { useEffect, useCallback } from 'react';
import { useNotificationStore, AppNotification } from '@/stores/notification.store';
import { api } from '@/services/api-client';

interface DashboardStats {
  totalVoters: number;
  totalVotes: number;
  activeElections: number;
  pendingROApplications: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface ROApplication {
  id: string;
  applicantName: string;
  email: string;
  status: string;
  createdAt: string;
}

export function useNotifications() {
  const { notifications, isOpen, addNotifications, toggleOpen, setOpen, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    const generatedNotifications: Omit<AppNotification, 'id' | 'read' | 'createdAt'>[] = [];

    try {
      // 1. Check dashboard stats for pending items
      try {
        const stats = await api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard/stats');
        if (stats.data) {
          const s = stats.data;
          if (s.pendingROApplications > 0) {
            generatedNotifications.push({
              type: 'warning',
              title: 'Pending RO Applications',
              message: `${s.pendingROApplications} returning officer application(s) awaiting review.`,
              actionUrl: '/admin/returning-officers',
              icon: 'users',
            });
          }
          if (s.totalVoters > 0 && s.totalVotes === 0) {
            generatedNotifications.push({
              type: 'info',
              title: 'Voting Not Started',
              message: `${s.totalVoters.toLocaleString()} voters registered but no votes cast yet.`,
              actionUrl: '/admin/dashboard',
              icon: 'chart',
            });
          }
          if (s.systemHealth === 'warning') {
            generatedNotifications.push({
              type: 'warning',
              title: 'System Health Warning',
              message: 'One or more system services are experiencing issues.',
              actionUrl: '/admin/dashboard',
              icon: 'alert',
            });
          }
          if (s.systemHealth === 'critical') {
            generatedNotifications.push({
              type: 'error',
              title: 'Critical System Alert',
              message: 'System services require immediate attention.',
              actionUrl: '/admin/dashboard',
              icon: 'alert',
            });
          }
        }
      } catch {
        // Stats endpoint may not be available
      }

      // 2. Check pending RO applications
      try {
        const roResponse = await api.get<{ success: boolean; data: { data: ROApplication[]; total: number } }>(
          '/admin/ro/applications?status=pending&pageSize=5'
        );
        if (roResponse.data?.data) {
          const pendingApps = roResponse.data.data;
          if (pendingApps.length > 0) {
            pendingApps.slice(0, 3).forEach((app) => {
              generatedNotifications.push({
                type: 'info',
                title: 'New RO Application',
                message: `${app.applicantName} applied for Returning Officer position.`,
                actionUrl: '/admin/returning-officers',
                icon: 'user-plus',
              });
            });
          }
        }
      } catch {
        // RO endpoint may not be available
      }

      // 3. Add system notifications
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 9 && hour <= 17) {
        generatedNotifications.push({
          type: 'info',
          title: 'System Status',
          message: `All services operational. Last checked at ${now.toLocaleTimeString()}.`,
          icon: 'check',
        });
      }

      // 4. Check for election-related notifications
      try {
        const elections = await api.get<{ success: boolean; data: any[] }>('/elections/upcoming');
        if (elections.data && elections.data.length > 0) {
          generatedNotifications.push({
            type: 'success',
            title: 'Upcoming Election',
            message: `${elections.data.length} election(s) scheduled. Ensure all preparations are complete.`,
            actionUrl: '/admin/elections',
            icon: 'calendar',
          });
        }
      } catch {
        // Elections endpoint may not be available
      }

      if (generatedNotifications.length > 0) {
        addNotifications(generatedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [addNotifications]);

  // Load notifications on mount and periodically
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh: loadNotifications,
  };
}
