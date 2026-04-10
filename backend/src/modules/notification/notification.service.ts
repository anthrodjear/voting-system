import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create a notification for a specific user
   */
  async create(data: {
    userId: string;
    userRole: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    actionUrl?: string;
    icon?: string;
    relatedResource?: string;
    relatedResourceId?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      userRole: data.userRole,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      icon: data.icon,
      relatedResource: data.relatedResource,
      relatedResourceId: data.relatedResourceId,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Create a notification for all users with a specific role
   */
  async createForRole(data: {
    userRole: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    actionUrl?: string;
    icon?: string;
    relatedResource?: string;
    relatedResourceId?: string;
  }): Promise<void> {
    // Store one notification per role (virtual user), frontend fetches by role
    const notification = this.notificationRepository.create({
      userId: `role:${data.userRole}`,
      userRole: data.userRole,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      icon: data.icon,
      relatedResource: data.relatedResource,
      relatedResourceId: data.relatedResourceId,
    });

    await this.notificationRepository.save(notification);
  }

  /**
   * Get notifications for a specific user (their own + role-wide)
   */
  async getUserNotifications(userId: string, userRole: string, limit: number = 20): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: [
        { userId },
        { userId: `role:${userRole}` },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string, userRole: string): Promise<number> {
    return this.notificationRepository.count({
      where: [
        { userId, isRead: false },
        { userId: `role:${userRole}`, isRead: false },
      ],
    });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, userRole: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false } as any,
      { isRead: true },
    );
    await this.notificationRepository.update(
      { userId: `role:${userRole}`, isRead: false } as any,
      { isRead: true },
    );
  }
}
