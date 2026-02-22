import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationPreferenceService {
  // Get user's notification preferences
  async getPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  // Update notification preferences
  async updatePreferences(userId: string, data: {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    appointmentRequests?: boolean;
    appointmentApprovals?: boolean;
    taskAssignments?: boolean;
    scheduleChanges?: boolean;
    incidentReports?: boolean;
    ticketUpdates?: boolean;
    violationAlerts?: boolean;
    systemAnnouncements?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    digestFrequency?: string;
  }) {
    // Ensure preferences exist
    await this.getPreferences(userId);

    return await prisma.notificationPreference.update({
      where: { userId },
      data
    });
  }

  // Create default preferences for a new user
  async createDefaultPreferences(userId: string) {
    return await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        inAppEnabled: true,
        appointmentRequests: true,
        appointmentApprovals: true,
        taskAssignments: true,
        scheduleChanges: true,
        incidentReports: true,
        ticketUpdates: true,
        violationAlerts: true,
        systemAnnouncements: true,
        digestFrequency: 'never'
      }
    });
  }

  // Check if user should receive a notification based on type
  async shouldReceiveNotification(userId: string, notificationType: string): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    if (!preferences.inAppEnabled) {
      return false; // In-app notifications disabled
    }

    // Check if in quiet hours
    if (await this.isInQuietHours(userId)) {
      return false;
    }

    // Map notification types to preference fields
    const typeMap: Record<string, keyof typeof preferences> = {
      'appointment_request_submitted': 'appointmentRequests',
      'appointment_request_approved': 'appointmentApprovals',
      'appointment_request_rejected': 'appointmentApprovals',
      'appointment_scheduled': 'appointmentApprovals',
      'task_assigned': 'taskAssignments',
      'task_due_soon': 'taskAssignments',
      'schedule_changed': 'scheduleChanges',
      'incident_reported': 'incidentReports',
      'ticket_created': 'ticketUpdates',
      'ticket_assigned': 'ticketUpdates',
      'ticket_updated': 'ticketUpdates',
      'ticket_resolved': 'ticketUpdates',
      'violation_recorded': 'violationAlerts',
      'system_announcement': 'systemAnnouncements'
    };

    const preferenceField = typeMap[notificationType];
    if (preferenceField && preferenceField in preferences) {
      return preferences[preferenceField] as boolean;
    }

    // Default to true for unknown types
    return true;
  }

  // Check if should send email notification
  async shouldSendEmail(userId: string, notificationType: string): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    if (!preferences.emailEnabled) {
      return false;
    }

    // Check if in quiet hours
    if (await this.isInQuietHours(userId)) {
      return false;
    }

    // Check if this notification type is enabled
    return await this.shouldReceiveNotification(userId, notificationType);
  }

  // Check if current time is within quiet hours
  async isInQuietHours(userId: string): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false; // No quiet hours set
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;

    // Handle quiet hours that cross midnight
    if (quietStart > quietEnd) {
      return currentTime >= quietStart || currentTime < quietEnd;
    }

    return currentTime >= quietStart && currentTime < quietEnd;
  }

  // Delete preferences (when user is deleted)
  async deletePreferences(userId: string) {
    return await prisma.notificationPreference.delete({
      where: { userId }
    });
  }

  // Get all users with email notifications enabled for a specific type
  async getUsersWithEmailEnabled(notificationType: string): Promise<string[]> {
    const typeMap: Record<string, string> = {
      'appointment_request_submitted': 'appointmentRequests',
      'appointment_request_approved': 'appointmentApprovals',
      'appointment_request_rejected': 'appointmentApprovals',
      'task_assigned': 'taskAssignments',
      'schedule_changed': 'scheduleChanges',
      'incident_reported': 'incidentReports',
      'ticket_created': 'ticketUpdates',
      'ticket_updated': 'ticketUpdates',
      'violation_recorded': 'violationAlerts',
      'system_announcement': 'systemAnnouncements'
    };

    const preferenceField = typeMap[notificationType];
    if (!preferenceField) {
      return [];
    }

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        emailEnabled: true,
        [preferenceField]: true
      },
      select: {
        userId: true
      }
    });

    return preferences.map(p => p.userId);
  }

  // Bulk update preferences for testing
  async updateAllPreferences(data: {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
  }) {
    return await prisma.notificationPreference.updateMany({
      data
    });
  }

  // Get notification preferences statistics
  async getPreferencesStats() {
    const total = await prisma.notificationPreference.count();
    const emailEnabled = await prisma.notificationPreference.count({
      where: { emailEnabled: true }
    });
    const inAppEnabled = await prisma.notificationPreference.count({
      where: { inAppEnabled: true }
    });
    const withQuietHours = await prisma.notificationPreference.count({
      where: {
        quietHoursStart: { not: null },
        quietHoursEnd: { not: null }
      }
    });

    return {
      total,
      emailEnabled,
      inAppEnabled,
      withQuietHours,
      emailEnabledPercentage: total > 0 ? (emailEnabled / total) * 100 : 0,
      inAppEnabledPercentage: total > 0 ? (inAppEnabled / total) * 100 : 0
    };
  }
}

export default new NotificationPreferenceService();
