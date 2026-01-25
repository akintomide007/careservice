import { PrismaClient } from '@prisma/client';
import { IncidentReportInput } from '../types';

const prisma = new PrismaClient();

export async function createIncidentReport(staffId: string, data: IncidentReportInput) {
  return prisma.incidentReport.create({
    data: {
      staffId,
      clientId: data.clientId,
      incidentDate: new Date(data.incidentDate),
      incidentTime: new Date(`1970-01-01T${data.incidentTime}`),
      location: data.location,
      locationLat: data.latitude,
      locationLng: data.longitude,
      employeeStatement: data.employeeStatement,
      clientStatement: data.clientStatement,
      actionTaken: data.actionTaken,
      severity: data.severity,
      incidentType: data.incidentType,
      status: 'open'
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
      staff: { select: { firstName: true, lastName: true } }
    }
  });
}

export async function getIncidentReports(filters?: {
  staffId?: string;
  clientId?: string;
  status?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (filters?.staffId) where.staffId = filters.staffId;
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.status) where.status = filters.status;
  if (filters?.severity) where.severity = filters.severity;

  if (filters?.startDate || filters?.endDate) {
    where.incidentDate = {};
    if (filters.startDate) where.incidentDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.incidentDate.lte = new Date(filters.endDate);
  }

  return prisma.incidentReport.findMany({
    where,
    orderBy: { incidentDate: 'desc' },
    include: {
      client: { select: { firstName: true, lastName: true } },
      staff: { select: { firstName: true, lastName: true } },
      reviewer: { select: { firstName: true, lastName: true } }
    }
  });
}

export async function getIncidentReportById(id: string) {
  return prisma.incidentReport.findUnique({
    where: { id },
    include: {
      client: true,
      staff: { select: { id: true, firstName: true, lastName: true } },
      reviewer: { select: { firstName: true, lastName: true } },
      mediaAttachments: true
    }
  });
}

export async function updateIncidentStatus(id: string, reviewerId: string, status: string) {
  return prisma.incidentReport.update({
    where: { id },
    data: {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    },
    include: {
      client: true,
      staff: { select: { firstName: true, lastName: true } },
      reviewer: { select: { firstName: true, lastName: true } }
    }
  });
}
