import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllClients(filters?: {
  search?: string;
  isActive?: boolean;
}) {
  const where: any = {};
  
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { dddId: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  
  return prisma.client.findMany({
    where,
    include: {
      ispOutcomes: {
        where: { status: 'active' }
      },
      _count: {
        select: {
          serviceSessions: true,
          progressNotes: true
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      ispOutcomes: true,
      serviceSessions: {
        orderBy: { clockInTime: 'desc' },
        take: 10,
        include: {
          staff: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      },
      progressNotes: {
        orderBy: { serviceDate: 'desc' },
        take: 10,
        include: {
          staff: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }
    }
  });
}

export async function createClient(data: {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  dddId?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}) {
  return prisma.client.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    }
  });
}

export async function updateClient(id: string, data: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  dddId?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isActive?: boolean;
}) {
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    }
  });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({
    where: { id }
  });
}
