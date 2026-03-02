import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CalendarFilters {
  start: Date;
  end: Date;
  dspId?: string;
  clientId?: string;
  appointmentType?: string;
}

interface AvailabilityCheck {
  dspId: string;
  start: Date;
  end: Date;
}

interface ConflictDetails {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  conflictingAppointments?: any[];
  details?: any;
}

interface DspSuggestion {
  dsp: any;
  score: number;
  reasons: string[];
  available: boolean;
  conflicts?: any[];
}

export const appointmentCalendarService = {
  /**
   * Get appointments for calendar view with filters
   */
  async getCalendarAppointments(organizationId: string, filters: CalendarFilters) {
    const where: any = {
      organizationId,
      scheduledDate: {
        gte: filters.start,
        lte: filters.end,
      },
      status: { in: ['scheduled', 'approved'] },
    };

    if (filters.dspId) {
      where.assignedDspId = filters.dspId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.appointmentType) {
      where.appointmentType = filters.appointmentType;
    }

    const appointments = await prisma.appointmentRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true,
          },
        },
        assignedDsp: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Transform to calendar event format
    return appointments.map((appt) => ({
      id: appt.id,
      title: `${appt.appointmentType} - ${appt.client.firstName} ${appt.client.lastName}`,
      start: appt.scheduledDate,
      end: appt.scheduledDate
        ? new Date(appt.scheduledDate.getTime() + appt.estimatedDuration * 60000)
        : null,
      resource: {
        appointmentId: appt.id,
        clientId: appt.clientId,
        clientName: `${appt.client.firstName} ${appt.client.lastName}`,
        dspId: appt.assignedDspId,
        dspName: appt.assignedDsp
          ? `${appt.assignedDsp.firstName} ${appt.assignedDsp.lastName}`
          : 'Unassigned',
        type: appt.appointmentType,
        urgency: appt.urgency,
        location: appt.location,
        duration: appt.estimatedDuration,
        status: appt.status,
      },
    }));
  },

  /**
   * Check if DSP is available at a given time
   */
  async checkDspAvailability(check: AvailabilityCheck): Promise<{
    available: boolean;
    conflicts: ConflictDetails[];
  }> {
    const conflicts: ConflictDetails[] = [];

    // 1. Check for existing appointments
    const existingAppointments = await prisma.appointmentRequest.findMany({
      where: {
        assignedDspId: check.dspId,
        status: { in: ['scheduled', 'approved'] },
        scheduledDate: {
          gte: new Date(check.start.getTime() - 2 * 60 * 60 * 1000), // 2 hours buffer
          lte: new Date(check.end.getTime() + 2 * 60 * 60 * 1000),
        },
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
      },
    });

    for (const appt of existingAppointments) {
      if (!appt.scheduledDate) continue;
      
      const apptEnd = new Date(
        appt.scheduledDate.getTime() + appt.estimatedDuration * 60000
      );

      // Check for time overlap
      if (
        (check.start >= appt.scheduledDate && check.start < apptEnd) ||
        (check.end > appt.scheduledDate && check.end <= apptEnd) ||
        (check.start <= appt.scheduledDate && check.end >= apptEnd)
      ) {
        conflicts.push({
          type: 'DSP_DOUBLE_BOOKED',
          severity: 'high',
          message: `DSP already has appointment from ${appt.scheduledDate.toLocaleTimeString()} to ${apptEnd.toLocaleTimeString()}`,
          conflictingAppointments: [appt],
        });
      }
    }

    // 2. Check DSP working hours
    const dayOfWeek = check.start.getDay();
    const availability = await prisma.dspAvailability.findFirst({
      where: {
        dspId: check.dspId,
        dayOfWeek,
        isAvailable: true,
        OR: [
          { effectiveFrom: null, effectiveTo: null },
          {
            effectiveFrom: { lte: check.start },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: check.start } }],
          },
        ],
      },
    });

    if (availability) {
      const [startHour, startMin] = availability.startTime.split(':').map(Number);
      const [endHour, endMin] = availability.endTime.split(':').map(Number);

      const workStart = new Date(check.start);
      workStart.setHours(startHour, startMin, 0, 0);

      const workEnd = new Date(check.start);
      workEnd.setHours(endHour, endMin, 0, 0);

      if (check.start < workStart || check.end > workEnd) {
        conflicts.push({
          type: 'OUTSIDE_WORK_HOURS',
          severity: 'medium',
          message: `Appointment outside DSP work hours (${availability.startTime} - ${availability.endTime})`,
        });
      }
    }

    // 3. Check for time off
    const timeOff = await prisma.dspTimeOff.findFirst({
      where: {
        dspId: check.dspId,
        approved: true,
        startDate: { lte: check.start },
        endDate: { gte: check.start },
      },
    });

    if (timeOff) {
      conflicts.push({
        type: 'DSP_TIME_OFF',
        severity: 'high',
        message: `DSP has approved time off: ${timeOff.reason || 'Vacation'}`,
        details: timeOff,
      });
    }

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  },

  /**
   * Get available DSPs for a given time slot
   */
  async getAvailableDsps(
    organizationId: string,
    start: Date,
    duration: number,
    clientId?: string
  ): Promise<DspSuggestion[]> {
    const end = new Date(start.getTime() + duration * 60000);

    // Get all DSPs in organization
    const dsps = await prisma.user.findMany({
      where: {
        organizationId,
        role: 'dsp',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    const suggestions: DspSuggestion[] = [];

    for (const dsp of dsps) {
      let score = 0;
      const reasons: string[] = [];

      // Check availability
      const availabilityCheck = await this.checkDspAvailability({
        dspId: dsp.id,
        start,
        end,
      });

      if (!availabilityCheck.available) {
        suggestions.push({
          dsp,
          score: 0,
          reasons: availabilityCheck.conflicts.map((c) => c.message),
          available: false,
          conflicts: availabilityCheck.conflicts,
        });
        continue;
      }

      score += 30; // Base score for being available

      // Check client-DSP relationship
      if (clientId) {
        const relationship = await prisma.clientDspAssignment.findFirst({
          where: {
            clientId,
            dspId: dsp.id,
            isActive: true,
          },
        });

        if (relationship) {
          score += 40;
          reasons.push('Has existing relationship with client');
        }
      }

      // Check workload for the day
      const dayStart = new Date(start);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(start);
      dayEnd.setHours(23, 59, 59, 999);

      const dayAppointments = await prisma.appointmentRequest.count({
        where: {
          assignedDspId: dsp.id,
          status: { in: ['scheduled', 'approved'] },
          scheduledDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (dayAppointments < 3) {
        score += 20;
        reasons.push('Light schedule for the day');
      } else if (dayAppointments < 5) {
        score += 10;
        reasons.push('Moderate schedule');
      } else {
        reasons.push('Heavy schedule - may be overloaded');
      }

      // Check recent performance (appointments completed on time)
      const recentAppointments = await prisma.appointmentRequest.count({
        where: {
          assignedDspId: dsp.id,
          status: 'scheduled',
          checkInTime: { not: null },
          checkOutTime: { not: null },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      if (recentAppointments > 10) {
        score += 10;
        reasons.push('Experienced with appointments');
      }

      suggestions.push({
        dsp,
        score,
        reasons,
        available: true,
      });
    }

    // Sort by score descending
    return suggestions
      .sort((a, b) => b.score - a.score);
  },

  /**
   * Detect conflicts for an appointment
   */
  async detectConflicts(
    _organizationId: string,
    appointmentData: {
      clientId: string;
      dspId?: string;
      start: Date;
      duration: number;
      location?: string;
    }
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const end = new Date(appointmentData.start.getTime() + appointmentData.duration * 60000);

    // 1. Check client conflicts
    const clientAppointments = await prisma.appointmentRequest.findMany({
      where: {
        clientId: appointmentData.clientId,
        status: { in: ['scheduled', 'approved'] },
        scheduledDate: {
          gte: new Date(appointmentData.start.getTime() - 2 * 60 * 60 * 1000),
          lte: new Date(end.getTime() + 2 * 60 * 60 * 1000),
        },
      },
    });

    for (const appt of clientAppointments) {
      if (!appt.scheduledDate) continue;
      
      const apptEnd = new Date(
        appt.scheduledDate.getTime() + appt.estimatedDuration * 60000
      );

      if (
        (appointmentData.start >= appt.scheduledDate && appointmentData.start < apptEnd) ||
        (end > appt.scheduledDate && end <= apptEnd) ||
        (appointmentData.start <= appt.scheduledDate && end >= apptEnd)
      ) {
        conflicts.push({
          type: 'CLIENT_DOUBLE_BOOKED',
          severity: 'high',
          message: 'Client already has appointment at this time',
          conflictingAppointments: [appt],
        });
      }
    }

    // 2. Check DSP conflicts if DSP is assigned
    if (appointmentData.dspId) {
      const dspCheck = await this.checkDspAvailability({
        dspId: appointmentData.dspId,
        start: appointmentData.start,
        end,
      });

      conflicts.push(...dspCheck.conflicts);

      // 3. Check travel time from previous appointment
      const previousAppt = await prisma.appointmentRequest.findFirst({
        where: {
          assignedDspId: appointmentData.dspId,
          status: { in: ['scheduled', 'approved'] },
          scheduledDate: { lt: appointmentData.start },
        },
        orderBy: { scheduledDate: 'desc' },
      });

      if (previousAppt && previousAppt.scheduledDate) {
        const prevEnd = new Date(
          previousAppt.scheduledDate.getTime() + previousAppt.estimatedDuration * 60000
        );
        const timeBetween = (appointmentData.start.getTime() - prevEnd.getTime()) / (1000 * 60);

        if (timeBetween < 30) {
          conflicts.push({
            type: 'INSUFFICIENT_TRAVEL_TIME',
            severity: 'medium',
            message: `Only ${timeBetween} minutes between appointments. Recommend at least 30 minutes for travel.`,
          });
        }
      }
    }

    return conflicts;
  },

  /**
   * Assign DSP to appointment
   */
  async assignDsp(
    appointmentId: string,
    dspId: string,
    organizationId: string,
    _assignedBy: string
  ) {
    const appointment = await prisma.appointmentRequest.findFirst({
      where: { id: appointmentId, organizationId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (!appointment.scheduledDate) {
      throw new Error('Appointment must be scheduled before assigning DSP');
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts(organizationId, {
      clientId: appointment.clientId,
      dspId,
      start: appointment.scheduledDate,
      duration: appointment.estimatedDuration,
      location: appointment.location || undefined,
    });

    const highSeverityConflicts = conflicts.filter((c) => c.severity === 'high');

    if (highSeverityConflicts.length > 0) {
      throw new Error(
        `Cannot assign DSP: ${highSeverityConflicts.map((c) => c.message).join(', ')}`
      );
    }

    return await prisma.appointmentRequest.update({
      where: { id: appointmentId },
      data: { assignedDspId: dspId },
      include: {
        client: { select: { firstName: true, lastName: true, dddId: true } },
        assignedDsp: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  },

  /**
   * Create recurring appointments
   */
  async createRecurringAppointments(
    baseData: any,
    recurringRule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      occurrences: number;
    }
  ) {
    const appointments = [];
    const groupId = `recurring-${Date.now()}`;

    for (let i = 0; i < recurringRule.occurrences; i++) {
      const scheduledDate = new Date(baseData.scheduledDate);

      if (recurringRule.frequency === 'daily') {
        scheduledDate.setDate(scheduledDate.getDate() + i * recurringRule.interval);
      } else if (recurringRule.frequency === 'weekly') {
        scheduledDate.setDate(scheduledDate.getDate() + i * recurringRule.interval * 7);
      } else if (recurringRule.frequency === 'monthly') {
        scheduledDate.setMonth(scheduledDate.getMonth() + i * recurringRule.interval);
      }

      const appointment = await prisma.appointmentRequest.create({
        data: {
          ...baseData,
          scheduledDate,
          isRecurring: true,
          recurringGroupId: groupId,
          recurringRule,
          status: 'scheduled',
        },
        include: {
          client: true,
          assignedDsp: true,
        },
      });

      appointments.push(appointment);
    }

    return appointments;
  },
};
