import { PrismaClient } from '@prisma/client';
import { ProgressNoteInput, ApprovalAction } from '../types';

const prisma = new PrismaClient();

export async function createProgressNote(staffId: string, data: ProgressNoteInput) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.progressNote.create({
      data: {
        staffId,
        clientId: data.clientId,
        serviceType: data.serviceType,
        serviceDate: new Date(data.serviceDate),
        startTime: new Date(`1970-01-01T${data.startTime}`),
        endTime: new Date(`1970-01-01T${data.endTime}`),
        location: data.location,
        ispOutcomeId: data.ispOutcomeId,
        reasonForService: data.reasonForService,
        supportsProvided: data.supportsProvided,
        individualResponse: data.individualResponse,
        progressAssessment: data.progressAssessment,
        progressNotes: data.progressNotes,
        safetyDignityNotes: data.safetyDignityNotes,
        nextSteps: data.nextSteps,
        status: 'draft',
        sessionId: data.sessionId
      }
    });

    if (data.activities && data.activities.length > 0) {
      await tx.progressNoteActivity.createMany({
        data: data.activities.map(activity => ({
          progressNoteId: note.id,
          activityNumber: activity.activityNumber,
          taskGoal: activity.taskGoal,
          supportsProvided: activity.supportsProvided,
          promptLevel: activity.promptLevel,
          objectiveObservation: activity.objectiveObservation
        }))
      });
    }

    return tx.progressNote.findUnique({
      where: { id: note.id },
      include: {
        activities: true,
        client: { select: { firstName: true, lastName: true } },
        staff: { select: { firstName: true, lastName: true } }
      }
    });
  });
}

export async function submitProgressNote(noteId: string, staffId: string) {
  const note = await prisma.progressNote.findFirst({
    where: { id: noteId, staffId }
  });

  if (!note) {
    throw new Error('Progress note not found');
  }

  if (note.status !== 'draft') {
    throw new Error('Only draft notes can be submitted');
  }

  return prisma.progressNote.update({
    where: { id: noteId },
    data: {
      status: 'pending_approval',
      submittedAt: new Date()
    },
    include: {
      activities: true,
      client: true,
      staff: { select: { firstName: true, lastName: true } }
    }
  });
}

export async function approveProgressNote(noteId: string, managerId: string, action: ApprovalAction) {
  const note = await prisma.progressNote.findUnique({
    where: { id: noteId }
  });

  if (!note) {
    throw new Error('Progress note not found');
  }

  if (note.status !== 'pending_approval') {
    throw new Error('Only pending notes can be approved');
  }

  const updateData: any = {
    approvedBy: managerId,
    approvedAt: new Date()
  };

  if (action.action === 'approve') {
    updateData.status = 'approved';
  } else if (action.action === 'reject') {
    updateData.status = 'rejected';
    updateData.rejectionReason = action.comment;
  } else if (action.action === 'request_changes') {
    updateData.status = 'revisions_requested';
    updateData.rejectionReason = action.comment;
  }

  return prisma.progressNote.update({
    where: { id: noteId },
    data: updateData,
    include: {
      activities: true,
      client: true,
      staff: { select: { firstName: true, lastName: true } },
      approver: { select: { firstName: true, lastName: true } }
    }
  });
}

export async function getProgressNotes(filters?: {
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
    where.serviceDate = {};
    if (filters.startDate) where.serviceDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.serviceDate.lte = new Date(filters.endDate);
  }

  return prisma.progressNote.findMany({
    where,
    orderBy: { serviceDate: 'desc' },
    include: {
      client: { select: { firstName: true, lastName: true } },
      staff: { select: { firstName: true, lastName: true } },
      activities: true
    }
  });
}

export async function getProgressNoteById(id: string) {
  return prisma.progressNote.findUnique({
    where: { id },
    include: {
      activities: true,
      client: true,
      staff: { select: { id: true, firstName: true, lastName: true } },
      ispOutcome: true,
      approver: { select: { firstName: true, lastName: true } },
      mediaAttachments: true
    }
  });
}

export async function updateProgressNote(noteId: string, staffId: string, data: Partial<ProgressNoteInput>) {
  const note = await prisma.progressNote.findFirst({
    where: { id: noteId, staffId }
  });

  if (!note) {
    throw new Error('Progress note not found');
  }

  if (note.status !== 'draft' && note.status !== 'revisions_requested') {
    throw new Error('Only draft or revision-requested notes can be updated');
  }

  const updateData: any = {};
  
  if (data.serviceDate) updateData.serviceDate = new Date(data.serviceDate);
  if (data.startTime) updateData.startTime = new Date(`1970-01-01T${data.startTime}`);
  if (data.endTime) updateData.endTime = new Date(`1970-01-01T${data.endTime}`);
  if (data.location !== undefined) updateData.location = data.location;
  if (data.reasonForService !== undefined) updateData.reasonForService = data.reasonForService;
  if (data.supportsProvided !== undefined) updateData.supportsProvided = data.supportsProvided;
  if (data.individualResponse !== undefined) updateData.individualResponse = data.individualResponse;
  if (data.progressAssessment !== undefined) updateData.progressAssessment = data.progressAssessment;
  if (data.progressNotes !== undefined) updateData.progressNotes = data.progressNotes;
  if (data.safetyDignityNotes !== undefined) updateData.safetyDignityNotes = data.safetyDignityNotes;
  if (data.nextSteps !== undefined) updateData.nextSteps = data.nextSteps;

  return prisma.progressNote.update({
    where: { id: noteId },
    data: updateData,
    include: {
      activities: true,
      client: true,
      staff: { select: { firstName: true, lastName: true } }
    }
  });
}
