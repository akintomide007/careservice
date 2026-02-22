import { PrismaClient } from '@prisma/client';
import notificationService from './notification.service';

const prisma = new PrismaClient();

export const appointmentRequestService = {
  async createRequest(data: {
    organizationId: string;
    clientId: string;
    requestedBy: string;
    appointmentType: string;
    urgency: string;
    reason: string;
    notes?: string;
    preferredDates: string[];
    preferredTimes?: string[];
    location?: string;
    provider?: string;
    providerPhone?: string;
    transportation?: string;
  }) {
    const request = await prisma.appointmentRequest.create({
      data: {
        organizationId: data.organizationId,
        clientId: data.clientId,
        requestedBy: data.requestedBy,
        appointmentType: data.appointmentType,
        urgency: data.urgency,
        reason: data.reason,
        notes: data.notes,
        preferredDates: data.preferredDates,
        preferredTimes: data.preferredTimes,
        location: data.location,
        provider: data.provider,
        providerPhone: data.providerPhone,
        transportation: data.transportation,
        status: 'pending',
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Send notification to managers about new appointment request
    try {
      await notificationService.notifyAppointmentRequest(request);
    } catch (error) {
      console.error('Failed to send appointment request notification:', error);
      // Don't fail the request creation if notification fails
    }

    return request;
  },

  async getRequests(
    organizationId: string,
    filters?: {
      status?: string;
      urgency?: string;
      clientId?: string;
      requestedBy?: string;
      appointmentType?: string;
    }
  ) {
    const where: any = { organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.urgency) {
      where.urgency = filters.urgency;
    }
    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }
    if (filters?.requestedBy) {
      where.requestedBy = filters.requestedBy;
    }
    if (filters?.appointmentType) {
      where.appointmentType = filters.appointmentType;
    }

    return await prisma.appointmentRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
            dateOfBirth: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        schedule: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },

  async getRequestById(id: string, organizationId: string) {
    return await prisma.appointmentRequest.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
            dateOfBirth: true,
            address: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        schedule: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: true,
            notes: true,
            status: true,
          },
        },
      },
    });
  },

  async updateRequest(
    id: string,
    organizationId: string,
    userId: string,
    data: {
      appointmentType?: string;
      urgency?: string;
      reason?: string;
      notes?: string;
      preferredDates?: string[];
      preferredTimes?: string[];
      location?: string;
      provider?: string;
      providerPhone?: string;
      transportation?: string;
    }
  ) {
    const request = await prisma.appointmentRequest.findFirst({
      where: {
        id,
        organizationId,
        requestedBy: userId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new Error('Request not found or cannot be modified');
    }

    return await prisma.appointmentRequest.update({
      where: { id },
      data,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  async approveRequest(
    id: string,
    organizationId: string,
    reviewerId: string,
    data: {
      reviewNotes?: string;
      scheduledDate: string;
      createSchedule: boolean;
      scheduleData?: {
        userId: string;
        title: string;
        location?: string;
        notes?: string;
      };
    }
  ) {
    const request = await prisma.appointmentRequest.findFirst({
      where: {
        id,
        organizationId,
        status: 'pending',
      },
      include: {
        client: true,
      },
    });

    if (!request) {
      throw new Error('Request not found or already processed');
    }

    let scheduleId: string | null = null;

    if (data.createSchedule && data.scheduleData) {
      const schedule = await prisma.schedule.create({
        data: {
          organizationId,
          userId: data.scheduleData.userId || request.requestedBy,
          clientId: request.clientId,
          title: data.scheduleData.title,
          shiftType: 'work',
          startTime: new Date(data.scheduledDate),
          endTime: new Date(new Date(data.scheduledDate).getTime() + 60 * 60 * 1000),
          location: data.scheduleData.location || request.location,
          notes: data.scheduleData.notes || `${request.appointmentType} appointment - ${request.reason}`,
          status: 'scheduled',
          createdBy: reviewerId,
        },
      });
      scheduleId = schedule.id;
    }

    const updatedRequest = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: data.createSchedule ? 'scheduled' : 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: data.reviewNotes,
        scheduledDate: new Date(data.scheduledDate),
        scheduleId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        schedule: true,
      },
    });

    // Send notification to requester about approval
    try {
      await notificationService.notifyAppointmentApproval(updatedRequest, true);
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    return updatedRequest;
  },

  async rejectRequest(
    id: string,
    organizationId: string,
    reviewerId: string,
    reviewNotes: string
  ) {
    const request = await prisma.appointmentRequest.findFirst({
      where: {
        id,
        organizationId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new Error('Request not found or already processed');
    }

    const updatedRequest = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Send notification to requester about rejection
    try {
      await notificationService.notifyAppointmentApproval(updatedRequest, false);
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }

    return updatedRequest;
  },

  async cancelRequest(id: string, organizationId: string, userId: string) {
    const request = await prisma.appointmentRequest.findFirst({
      where: {
        id,
        organizationId,
        requestedBy: userId,
        status: { in: ['pending', 'approved', 'scheduled'] },
      },
    });

    if (!request) {
      throw new Error('Request not found or cannot be cancelled');
    }

    if (request.scheduleId) {
      await prisma.schedule.update({
        where: { id: request.scheduleId },
        data: { status: 'cancelled' },
      });
    }

    return await prisma.appointmentRequest.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  async getStatistics(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'dsp' && userId) {
      where.requestedBy = userId;
    }

    const [total, pending, approved, rejected, scheduled, cancelled, urgent] = await Promise.all([
      prisma.appointmentRequest.count({ where }),
      prisma.appointmentRequest.count({ where: { ...where, status: 'pending' } }),
      prisma.appointmentRequest.count({ where: { ...where, status: 'approved' } }),
      prisma.appointmentRequest.count({ where: { ...where, status: 'rejected' } }),
      prisma.appointmentRequest.count({ where: { ...where, status: 'scheduled' } }),
      prisma.appointmentRequest.count({ where: { ...where, status: 'cancelled' } }),
      prisma.appointmentRequest.count({ where: { ...where, urgency: 'urgent', status: 'pending' } }),
    ]);

    const byType = await prisma.appointmentRequest.groupBy({
      by: ['appointmentType'],
      where,
      _count: true,
    });

    return {
      total,
      pending,
      approved,
      rejected,
      scheduled,
      cancelled,
      urgent,
      byType: byType.map(item => ({
        type: item.appointmentType,
        count: item._count,
      })),
    };
  },
};
