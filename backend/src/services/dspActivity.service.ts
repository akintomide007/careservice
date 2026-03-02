import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DspActivitySummary {
  dspId: string;
  dspName: string;
  dspEmail: string;
  todayStats: {
    clockedIn: boolean;
    currentSession?: any;
    sessionsCompleted: number;
    totalHours: number;
    clientsServed: number;
  };
  weeklyStats: {
    totalSessions: number;
    totalHours: number;
    clientsServed: number;
    formsSubmitted: number;
    notesSubmitted: number;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    timestamp: Date;
    clientName?: string;
  }>;
}

export async function getDspActivitySummary(
  organizationId: string,
  dspId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<DspActivitySummary[]> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  // Default to current week
  const weekStart = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = endDate || now;

  // Get all DSPs (or specific DSP)
  const dspWhere: any = {
    organizationId,
    role: 'dsp',
    isActive: true
  };

  if (dspId) {
    dspWhere.id = dspId;
  }

  const dsps = await prisma.user.findMany({
    where: dspWhere,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true
    }
  });

  const summaries: DspActivitySummary[] = [];

  for (const dsp of dsps) {
    // Today's sessions
    const todaySessions = await prisma.serviceSession.findMany({
      where: {
        staffId: dsp.id,
        clockInTime: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Weekly sessions
    const weeklySessions = await prisma.serviceSession.findMany({
      where: {
        staffId: dsp.id,
        clockInTime: {
          gte: weekStart,
          lte: weekEnd
        },
        status: 'completed'
      }
    });

    // Weekly forms and notes
    const weeklyForms = await prisma.formResponse.count({
      where: {
        userId: dsp.id,
        submittedAt: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    const weeklyNotes = await prisma.progressNote.count({
      where: {
        staffId: dsp.id,
        serviceDate: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    // Active session
    const activeSession = todaySessions.find(s => s.status === 'in_progress');
    const completedToday = todaySessions.filter(s => s.status === 'completed');

    const todayHours = completedToday.reduce((sum, s) => sum + (s.totalHours || 0), 0);
    const weeklyHours = weeklySessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);

    const todayClients = new Set(completedToday.map(s => s.clientId)).size;
    const weeklyClients = new Set(weeklySessions.map(s => s.clientId)).size;

    // Recent activities
    const recentActivities: Array<{
      type: string;
      description: string;
      timestamp: Date;
      clientName?: string;
    }> = [];

    // Add clock-in/out activities
    for (const session of todaySessions.slice(0, 5)) {
      const clientName = `${session.client.firstName} ${session.client.lastName}`;
      
      if (session.clockOutTime) {
        recentActivities.push({
          type: 'clock_out',
          description: `Clocked out from session with ${clientName}`,
          timestamp: session.clockOutTime,
          clientName
        });
      }
      
      recentActivities.push({
        type: 'clock_in',
        description: `Clocked in with ${clientName}`,
        timestamp: session.clockInTime,
        clientName
      });
    }

    // Add recent notes
    const recentNotes = await prisma.progressNote.findMany({
      where: {
        staffId: dsp.id,
        createdAt: {
          gte: todayStart
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    for (const note of recentNotes) {
      recentActivities.push({
        type: 'progress_note',
        description: `Submitted progress note for ${note.client.firstName} ${note.client.lastName}`,
        timestamp: note.createdAt,
        clientName: `${note.client.firstName} ${note.client.lastName}`
      });
    }

    // Sort activities by timestamp
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    summaries.push({
      dspId: dsp.id,
      dspName: `${dsp.firstName} ${dsp.lastName}`,
      dspEmail: dsp.email,
      todayStats: {
        clockedIn: !!activeSession,
        currentSession: activeSession ? {
          clientName: `${activeSession.client.firstName} ${activeSession.client.lastName}`,
          clockInTime: activeSession.clockInTime,
          serviceType: activeSession.serviceType
        } : undefined,
        sessionsCompleted: completedToday.length,
        totalHours: Math.round(todayHours * 100) / 100,
        clientsServed: todayClients
      },
      weeklyStats: {
        totalSessions: weeklySessions.length,
        totalHours: Math.round(weeklyHours * 100) / 100,
        clientsServed: weeklyClients,
        formsSubmitted: weeklyForms,
        notesSubmitted: weeklyNotes
      },
      recentActivities: recentActivities.slice(0, 10)
    });
  }

  return summaries;
}

export async function getDspDailySummaryReport(
  organizationId: string,
  date?: Date
) {
  const targetDate = date || new Date();
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

  const summaries = await getDspActivitySummary(organizationId, undefined, dayStart, dayEnd);

  return {
    date: targetDate,
    totalDsps: summaries.length,
    activeDsps: summaries.filter(s => s.todayStats.sessionsCompleted > 0 || s.todayStats.clockedIn).length,
    totalSessions: summaries.reduce((sum, s) => sum + s.todayStats.sessionsCompleted, 0),
    totalHours: summaries.reduce((sum, s) => sum + s.todayStats.totalHours, 0),
    dsps: summaries
  };
}
