import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllClients(
  organizationId: string,
  filters?: {
    search?: string;
    isActive?: boolean;
  }
) {
  const where: any = {
    organizationId
  };
  
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

export async function getClientById(id: string, organizationId: string) {
  return prisma.client.findFirst({
    where: {
      id,
      organizationId
    },
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

export async function createClient(
  organizationId: string,
  data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    dddId?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }
) {
  return prisma.client.create({
    data: {
      organizationId,
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    }
  });
}

export async function updateClient(
  id: string,
  organizationId: string,
  data: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    dddId?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    isActive?: boolean;
  }
) {
  return prisma.client.updateMany({
    where: {
      id,
      organizationId
    },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    }
  });
}

export async function deleteClient(id: string, organizationId: string) {
  return prisma.client.deleteMany({
    where: {
      id,
      organizationId
    }
  });
}
