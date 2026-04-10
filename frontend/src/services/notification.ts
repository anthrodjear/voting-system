import { api, ApiClientException as ApiException } from './api-client';

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<NotificationData[]> {
  try {
    const data = await api.get<NotificationData[]>('/notifications');
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get notifications');
    }
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const data = await api.get<{ count: number }>('/notifications/unread-count');
    return data?.count || 0;
  } catch (error) {
    if (error instanceof ApiException) {
      return 0;
    }
    throw error;
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to mark as read');
    }
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await api.patch('/notifications/read-all');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to mark all as read');
    }
    throw error;
  }
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
