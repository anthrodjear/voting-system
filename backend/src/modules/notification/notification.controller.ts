import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userRole: string,
  ) {
    const notifications = await this.notificationService.getUserNotifications(userId, userRole);
    return {
      success: true,
      data: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        icon: n.icon,
        read: n.isRead,
        createdAt: n.createdAt,
      })),
    };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userRole: string,
  ) {
    const count = await this.notificationService.getUnreadCount(userId, userRole);
    return { success: true, data: { count } };
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationService.markAsRead(notificationId, userId);
    return { success: true };
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userRole: string,
  ) {
    await this.notificationService.markAllAsRead(userId, userRole);
    return { success: true };
  }
}
