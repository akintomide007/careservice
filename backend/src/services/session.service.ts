import { PrismaClient } from '@prisma/client';
import { ClockInData, ClockOutData } from '../types';

const prisma = new PrismaClient();

export async function clockIn(staffId: string, data: ClockInData) {
  const activeSession = await prisma.serviceSession.findFirst({
    where: {
      staffId,
      status: 'in_progress'
    }
  });
  
  if (activeSession) {
    throw new Error('You already have an active session. Please clock out first.');
  }
  
  return prisma.serviceSession.create({
    data: {
      staffId,
      clientId: data.clientId,
      serviceType: data.serviceType,
      clockInTime: new Date(),
      clockInLat: data.latitude,
      clockInLng: data.longitude,
      locationName: data.locationName,
      status: 'in_progress'
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function clockOut(staffId: string, data: ClockOutData) {
  const session = await prisma.serviceSession.findFirst({
    where: {
      id: data.sessionId,
      staffId,
      status: 'in_progress'
    }
  });
  
  if (!session) {
    throw new Error('Active session not found');
  }
  
  const clockOutTime = new Date();
  const totalHours = (clockOutTime.getTime() - session.clockInTime.getTime()) / (1000 * 60 * 60);
  
  return prisma.serviceSession.update({
    where: { id: session.id },
    data: {
      clockOutTime,
      clockOutLat: data.latitude,
      clockOutLng: data.longitude,
      totalHours: Math.round(totalHours * 100) / 100,
      status: 'completed'
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function getActiveSessions(staffId: string) {
  return prisma.serviceSession.findMany({
    where: {
      staffId,
      status: 'in_progress'
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function getSessionHistory(staffId: string, limit = 20) {
  return prisma.serviceSession.findMany({
    where: {
      staffId,
      status: 'completed'
    },
    orderBy: {
      clockInTime: 'desc'
    },
    take: limit,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function getAllSessions(filters?: {
  staffId?: string;
  clientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};
  
  if (filters?.staffId) where.staffId = filters.staffId;
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.status) where.status = filters.status;
  
  if (filters?.startDate || filters?.endDate) {
    where.clockInTime = {};
    if (filters.startDate) where.clockInTime.gte = new Date(filters.startDate);
    if (filters.endDate) where.clockInTime.lte = new Date(filters.endDate);
  }
  
  return prisma.serviceSession.findMany({
    where,
    orderBy: {
      clockInTime: 'desc'
    },
    include: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true
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
}
