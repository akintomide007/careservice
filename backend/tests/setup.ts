import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean up database before each test
beforeEach(async () => {
  // Clean up test data in reverse order of dependencies
  await prisma.ticketComment.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.appointmentReminder.deleteMany({});
  await prisma.appointmentRequest.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.violation.deleteMany({});
  await prisma.taskResult.deleteMany({});
  await prisma.taskChecklist.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.formResponse.deleteMany({});
  await prisma.formField.deleteMany({});
  await prisma.formSection.deleteMany({});
  await prisma.formTemplate.deleteMany({});
  await prisma.ispActivity.deleteMany({});
  await prisma.ispMilestone.deleteMany({});
  await prisma.ispGoal.deleteMany({});
  await prisma.ispOutcome.deleteMany({});
  await prisma.progressNoteActivity.deleteMany({});
  await prisma.digitalSignature.deleteMany({});
  await prisma.mediaAttachment.deleteMany({});
  await prisma.progressNote.deleteMany({});
  await prisma.incidentReport.deleteMany({});
  await prisma.serviceSession.deleteMany({});
  await prisma.clientDspAssignment.deleteMany({});
  await prisma.dspManagerAssignment.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.usageMetric.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(30000);
