import { Response } from 'express';
import notificationService from '../services/notification.service';
import notificationPreferenceService from '../services/notificationPreference.service';
import { AuthRequest } from '../types';

export class NotificationController {
  // Get user's notifications
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { isRead, type, priority, limit, offset } = req.query;

      const notifications = await notificationService.getNotifications(userId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        type: type as string,
        priority: priority as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get unread count
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get notification by ID
  async getNotificationById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const notification = await notificationService.getNotificationById(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Verify ownership
      if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json(notification);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Mark notification as read
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      const notification = await notificationService.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated = await notificationService.markAsRead(id);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Mark all as read
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      await notificationService.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete notification
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      const notification = await notificationService.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await notificationService.deleteNotification(id);
      return res.json({ message: 'Notification deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Clear all read notifications
  async clearReadNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      await notificationService.clearReadNotifications(userId);
      res.json({ message: 'Read notifications cleared' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get notification preferences
  async getPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = await notificationPreferenceService.getPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update notification preferences
  async updatePreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = await notificationPreferenceService.updatePreferences(
        userId,
        req.body
      );
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Send test notification
  async sendTestNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const organizationId = req.user!.organizationId;

      const notification = await notificationService.createNotification({
        organizationId,
        userId,
        type: 'system_announcement',
        title: 'Test Notification',
        message: 'This is a test notification to verify your notification settings are working correctly.',
        priority: 'normal'
      });

      res.json({ message: 'Test notification sent', notification });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Broadcast notification (super admin only)
  async broadcastNotification(req: AuthRequest, res: Response) {
    try {
      const { title, message, priority, userIds, organizationIds } = req.body;

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      const result = await notificationService.broadcastNotification({
        title,
        message,
        priority,
        userIds,
        organizationIds
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Send notification to specific users (admin only)
  async sendNotification(req: AuthRequest, res: Response) {
    try {
      const { userIds, title, message, priority, actionUrl, actionLabel } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'userIds array is required' });
      }

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      const organizationId = req.user!.organizationId;
      const notifications = [];

      for (const userId of userIds) {
        const notification = await notificationService.createNotification({
          organizationId,
          userId,
          type: 'system_announcement',
          title,
          message,
          priority: priority || 'normal',
          actionUrl,
          actionLabel
        });
        notifications.push(notification);
      }

      return res.json({ sent: notifications.length, notifications });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get notification statistics (admin only)
  async getNotificationStats(_req: AuthRequest, res: Response) {
    try {
      // This would need to be implemented in the service
      // For now, return placeholder
      return res.json({
        message: 'Statistics endpoint - to be implemented'
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();
