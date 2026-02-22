import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const scheduleService = {
  // Create schedule
  async createSchedule(data: {
    organizationId: string;
    userId: string;
    clientId?: string;
    title: string;
    shiftType: string;
    startTime: Date;
    endTime: Date;
    isAllDay?: boolean;
    location?: string;
    notes?: string;
    recurrence?: string;
    recurrenceEnd?: Date;
    color?: string;
    createdBy: string;
  }) {
    return prisma.schedule.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  // Get user schedules
  async getUserSchedules(userId: string, organizationId: string, startDate?: Date, endDate?: Date) {
    return prisma.schedule.findMany({
      where: {
        userId,
        organizationId,
        ...(startDate && {
          startTime: { gte: startDate }
        }),
        ...(endDate && {
          endTime: { lte: endDate }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  },

  // Get organization schedules (for managers)
  async getOrganizationSchedules(organizationId: string, filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    shiftType?: string;
    status?: string;
  }) {
    return prisma.schedule.findMany({
      where: {
        organizationId,
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.shiftType && { shiftType: filters.shiftType }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          startTime: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          endTime: { lte: filters.endDate }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { userId: 'asc' },
        { startTime: 'asc' }
      ]
    });
  },

  // Get schedule by ID
  async getScheduleById(id: string, organizationId: string) {
    return prisma.schedule.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        user: true,
        client: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  // Update schedule
  async updateSchedule(id: string, data: {
    title?: string;
    shiftType?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
    notes?: string;
    status?: string;
    color?: string;
  }) {
    return prisma.schedule.update({
      where: { id },
      data,
      include: {
        user: true,
        client: true
      }
    });
  },

  // Delete schedule
  async deleteSchedule(id: string) {
    return prisma.schedule.delete({
      where: { id }
    });
  },

  // Get schedules by date range for calendar view
  async getCalendarSchedules(organizationId: string, userId: string, role: string, startDate: Date, endDate: Date) {
    const whereClause: any = {
      organizationId,
      startTime: { gte: startDate },
      endTime: { lte: endDate }
    };

    // DSPs only see their own schedules
    if (role === 'dsp') {
      whereClause.userId = userId;
    }

    return prisma.schedule.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }
};
