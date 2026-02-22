import { PrismaClient } from '@prisma/client';
import notificationPreferenceService from './notificationPreference.service';

const prisma = new PrismaClient();

export class NotificationService {
  // Create a new notification
  async createNotification(data: {
    organizationId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    relatedId?: string;
    relatedType?: string;
    priority?: string;
    metadata?: any;
  }) {
    // Check if user wants this type of notification
    const shouldNotify = await notificationPreferenceService.shouldReceiveNotification(
      data.userId,
      data.type
    );

    if (!shouldNotify) {
      return null; // User has disabled this notification type
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        priority: data.priority || 'normal',
        metadata: data.metadata,
        isRead: false,
        isEmailed: false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Check if should send email
    const shouldEmail = await notificationPreferenceService.shouldSendEmail(
      data.userId,
      data.type
    );

    if (shouldEmail) {
      // Send email asynchronously (don't wait)
      this.sendEmailNotification(notification).catch(err => 
        console.error('Failed to send email notification:', err)
      );
    }

    return notification;
  }

  // Get user's notifications
  async getNotifications(userId: string, filters?: {
    isRead?: boolean;
    type?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { userId };

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });
  }

  // Get notification by ID
  async getNotificationById(id: string) {
    return await prisma.notification.findUnique({
      where: { id }
    });
  }

  // Mark notification as read
  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Mark all as read for a user
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Delete notification
  async deleteNotification(id: string) {
    return await prisma.notification.delete({
      where: { id }
    });
  }

  // Clear all read notifications for a user
  async clearReadNotifications(userId: string) {
    return await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true
      }
    });
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // Send email notification (placeholder - integrate with your email service)
  private async sendEmailNotification(notification: any) {
    // TODO: Integrate with email service
    console.log(`Would send email to ${notification.user.email}:`, {
      subject: notification.title,
      body: notification.message
    });
    
    // Mark as emailed
    await prisma.notification.update({
      where: { id: notification.id },
      data: { isEmailed: true }
    });
  }

  // Cleanup old notifications (older than specified days)
  async cleanupOldNotifications(days: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        isRead: true
      }
    });
  }

  // === Event-Specific Notification Methods ===

  // Notify about new appointment request
  async notifyAppointmentRequest(appointmentRequest: any) {
    // Get all managers in the organization
    const managers = await prisma.user.findMany({
      where: {
        organizationId: appointmentRequest.organizationId,
        role: { in: ['manager', 'admin'] },
        isActive: true
      }
    });

    const client = await prisma.client.findUnique({
      where: { id: appointmentRequest.clientId }
    });

    const requester = await prisma.user.findUnique({
      where: { id: appointmentRequest.requestedBy }
    });

    // Create notification for each manager
    for (const manager of managers) {
      await this.createNotification({
        organizationId: appointmentRequest.organizationId,
        userId: manager.id,
        type: 'appointment_request_submitted',
        title: 'New Appointment Request',
        message: `${requester?.firstName} ${requester?.lastName} requested a ${appointmentRequest.appointmentType} appointment for ${client?.firstName} ${client?.lastName}`,
        actionUrl: `/dashboard/appointments?id=${appointmentRequest.id}`,
        actionLabel: 'Review Request',
        relatedId: appointmentRequest.id,
        relatedType: 'appointment_request',
        priority: appointmentRequest.urgency === 'emergency' ? 'urgent' : 'normal'
      });
    }
  }

  // Notify about appointment approval/rejection
  async notifyAppointmentApproval(appointmentRequest: any, approved: boolean) {
    const client = await prisma.client.findUnique({
      where: { id: appointmentRequest.clientId }
    });

    await this.createNotification({
      organizationId: appointmentRequest.organizationId,
      userId: appointmentRequest.requestedBy,
      type: approved ? 'appointment_request_approved' : 'appointment_request_rejected',
      title: approved ? 'Appointment Request Approved' : 'Appointment Request Rejected',
      message: `Your ${appointmentRequest.appointmentType} appointment request for ${client?.firstName} ${client?.lastName} has been ${approved ? 'approved' : 'rejected'}`,
      actionUrl: `/dashboard/appointments?id=${appointmentRequest.id}`,
      actionLabel: 'View Details',
      relatedId: appointmentRequest.id,
      relatedType: 'appointment_request',
      priority: 'normal'
    });
  }

  // Notify about new support ticket
  async notifyTicketCreated(ticket: any) {
    // Get all super admins
    const admins = await prisma.user.findMany({
      where: {
        isLandlord: true,
        isActive: true
      }
    });

    for (const admin of admins) {
      await this.createNotification({
        organizationId: ticket.organizationId,
        userId: admin.id,
        type: 'ticket_created',
        title: 'New Support Ticket',
        message: `New ${ticket.priority} priority ticket: ${ticket.title}`,
        actionUrl: `/admin/support?id=${ticket.id}`,
        actionLabel: 'View Ticket',
        relatedId: ticket.id,
        relatedType: 'support_ticket',
        priority: ticket.priority === 'critical' ? 'urgent' : 'normal'
      });
    }
  }

  // Notify about ticket assignment
  async notifyTicketAssigned(ticket: any) {
    await this.createNotification({
      organizationId: ticket.organizationId,
      userId: ticket.assignedTo,
      type: 'ticket_assigned',
      title: 'Ticket Assigned to You',
      message: `You've been assigned ticket: ${ticket.title}`,
      actionUrl: `/admin/support?id=${ticket.id}`,
      actionLabel: 'View Ticket',
      relatedId: ticket.id,
      relatedType: 'support_ticket',
      priority: ticket.priority === 'critical' ? 'urgent' : 'normal'
    });
  }

  // Notify about ticket update
  async notifyTicketUpdated(ticket: any) {
    // Notify the reporter
    await this.createNotification({
      organizationId: ticket.organizationId,
      userId: ticket.reportedBy,
      type: 'ticket_updated',
      title: 'Ticket Updated',
      message: `Your ticket "${ticket.title}" status changed to ${ticket.status}`,
      actionUrl: `/admin/support?id=${ticket.id}`,
      actionLabel: 'View Ticket',
      relatedId: ticket.id,
      relatedType: 'support_ticket',
      priority: 'normal'
    });
  }

  // Notify about ticket resolution
  async notifyTicketResolved(ticket: any) {
    // Notify the reporter
    await this.createNotification({
      organizationId: ticket.organizationId,
      userId: ticket.reportedBy,
      type: 'ticket_resolved',
      title: 'Ticket Resolved',
      message: `Your ticket "${ticket.title}" has been resolved`,
      actionUrl: `/admin/support?id=${ticket.id}`,
      actionLabel: 'View Resolution',
      relatedId: ticket.id,
      relatedType: 'support_ticket',
      priority: 'normal'
    });
  }

  // Notify about task assignment
  async notifyTaskAssigned(task: any) {
    await this.createNotification({
      organizationId: task.organizationId,
      userId: task.assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You've been assigned: ${task.title}`,
      actionUrl: `/dashboard/tasks?id=${task.id}`,
      actionLabel: 'View Task',
      relatedId: task.id,
      relatedType: 'task',
      priority: task.priority === 'high' ? 'high' : 'normal'
    });
  }

  // Notify about task due soon
  async notifyTaskDueSoon(task: any) {
    await this.createNotification({
      organizationId: task.organizationId,
      userId: task.assignedTo,
      type: 'task_due_soon',
      title: 'Task Due Soon',
      message: `Task "${task.title}" is due tomorrow`,
      actionUrl: `/dashboard/tasks?id=${task.id}`,
      actionLabel: 'View Task',
      relatedId: task.id,
      relatedType: 'task',
      priority: 'high'
    });
  }

  // Notify about schedule change
  async notifyScheduleChanged(schedule: any) {
    await this.createNotification({
      organizationId: schedule.organizationId,
      userId: schedule.userId,
      type: 'schedule_changed',
      title: 'Schedule Updated',
      message: `Your schedule for ${schedule.title} has been updated`,
      actionUrl: `/dashboard/schedules?id=${schedule.id}`,
      actionLabel: 'View Schedule',
      relatedId: schedule.id,
      relatedType: 'schedule',
      priority: 'normal'
    });
  }

  // Notify about new incident report
  async notifyIncidentReported(incident: any) {
    // Get all managers/admins in the organization
    const managers = await prisma.user.findMany({
      where: {
        organizationId: incident.organizationId,
        role: { in: ['manager', 'admin'] },
        isActive: true
      }
    });

    const client = await prisma.client.findUnique({
      where: { id: incident.clientId }
    });

    for (const manager of managers) {
      await this.createNotification({
        organizationId: incident.organizationId,
        userId: manager.id,
        type: 'incident_reported',
        title: 'New Incident Report',
        message: `${incident.severity} severity incident reported for ${client?.firstName} ${client?.lastName}`,
        actionUrl: `/dashboard/incidents?id=${incident.id}`,
        actionLabel: 'Review Incident',
        relatedId: incident.id,
        relatedType: 'incident',
        priority: incident.severity === 'critical' ? 'urgent' : 'high'
      });
    }
  }

  // Notify about violation recorded
  async notifyViolationRecorded(violation: any) {
    // Notify the user involved
    await this.createNotification({
      organizationId: violation.organizationId,
      userId: violation.userId,
      type: 'violation_recorded',
      title: 'Violation Recorded',
      message: `A ${violation.severity} violation has been recorded: ${violation.violationType}`,
      actionUrl: `/dashboard/violations?id=${violation.id}`,
      actionLabel: 'View Details',
      relatedId: violation.id,
      relatedType: 'violation',
      priority: violation.severity === 'critical' ? 'urgent' : 'high'
    });

    // Also notify managers
    const managers = await prisma.user.findMany({
      where: {
        organizationId: violation.organizationId,
        role: { in: ['manager', 'admin'] },
        isActive: true,
        id: { not: violation.userId } // Don't double-notify if they're a manager
      }
    });

    for (const manager of managers) {
      await this.createNotification({
        organizationId: violation.organizationId,
        userId: manager.id,
        type: 'violation_recorded',
        title: 'Violation Recorded',
        message: `Violation recorded for staff member: ${violation.violationType}`,
        actionUrl: `/dashboard/violations?id=${violation.id}`,
        actionLabel: 'Review Violation',
        relatedId: violation.id,
        relatedType: 'violation',
        priority: 'normal'
      });
    }
  }

  // System announcement to all users in organization
  async notifySystemAnnouncement(organizationId: string, message: string, title: string = 'System Announcement') {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        isActive: true
      }
    });

    for (const user of users) {
      await this.createNotification({
        organizationId,
        userId: user.id,
        type: 'system_announcement',
        title,
        message,
        priority: 'normal'
      });
    }
  }

  // Broadcast to all users (super admin only)
  async broadcastNotification(data: {
    title: string;
    message: string;
    priority?: string;
    userIds?: string[];
    organizationIds?: string[];
  }) {
    let users: any[];

    if (data.userIds) {
      // Specific users
      users = await prisma.user.findMany({
        where: {
          id: { in: data.userIds },
          isActive: true
        }
      });
    } else if (data.organizationIds) {
      // Specific organizations
      users = await prisma.user.findMany({
        where: {
          organizationId: { in: data.organizationIds },
          isActive: true
        }
      });
    } else {
      // All users
      users = await prisma.user.findMany({
        where: { isActive: true }
      });
    }

    for (const user of users) {
      await this.createNotification({
        organizationId: user.organizationId,
        userId: user.id,
        type: 'system_announcement',
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal'
      });
    }

    return { notified: users.length };
  }
}

export default new NotificationService();
