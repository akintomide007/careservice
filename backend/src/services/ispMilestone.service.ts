import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ispMilestoneService = {
  // Get milestones for a goal
  async getMilestonesByGoalId(goalId: string) {
    return prisma.ispMilestone.findMany({
      where: { goalId },
      orderBy: { orderIndex: 'asc' }
    });
  },

  // Get milestone by ID
  async getMilestoneById(id: string) {
    return prisma.ispMilestone.findUnique({
      where: { id },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            outcome: {
              select: {
                id: true,
                client: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  },

  // Create milestone
  async createMilestone(data: {
    goalId: string;
    title: string;
    description?: string;
    targetDate: Date;
    completionCriteria: string;
    orderIndex?: number;
  }) {
    // Get existing milestones count for default order
    const existingCount = await prisma.ispMilestone.count({
      where: { goalId: data.goalId }
    });

    return prisma.ispMilestone.create({
      data: {
        goalId: data.goalId,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
        completionCriteria: data.completionCriteria,
        orderIndex: data.orderIndex || existingCount + 1,
        status: 'pending'
      }
    });
  },

  // Update milestone
  async updateMilestone(id: string, data: {
    title?: string;
    description?: string;
    targetDate?: Date;
    completionCriteria?: string;
    status?: string;
    notes?: string;
    orderIndex?: number;
  }) {
    return prisma.ispMilestone.update({
      where: { id },
      data
    });
  },

  // Mark milestone as achieved
  async achieveMilestone(id: string, notes?: string) {
    const milestone = await prisma.ispMilestone.update({
      where: { id },
      data: {
        status: 'achieved',
        achievedDate: new Date(),
        notes
      },
      include: {
        goal: true
      }
    });

    // Recalculate goal progress
    const { ispGoalService } = await import('./ispGoal.service');
    await ispGoalService.calculateProgress(milestone.goalId);

    return milestone;
  },

  // Mark milestone as missed
  async markMilestoneMissed(id: string, notes?: string) {
    return prisma.ispMilestone.update({
      where: { id },
      data: {
        status: 'missed',
        notes
      }
    });
  },

  // Delete milestone
  async deleteMilestone(id: string) {
    return prisma.ispMilestone.delete({
      where: { id }
    });
  },

  // Reorder milestones
  async reorderMilestones(goalId: string, milestoneIds: string[]) {
    // Update order index for each milestone
    const updates = milestoneIds.map((milestoneId, index) =>
      prisma.ispMilestone.update({
        where: { id: milestoneId },
        data: { orderIndex: index + 1 }
      })
    );

    await prisma.$transaction(updates);

    return this.getMilestonesByGoalId(goalId);
  },

  // Get milestone statistics for a goal
  async getMilestoneStats(goalId: string) {
    const milestones = await prisma.ispMilestone.findMany({
      where: { goalId }
    });

    const total = milestones.length;
    const achieved = milestones.filter(m => m.status === 'achieved').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const missed = milestones.filter(m => m.status === 'missed').length;

    const completionRate = total > 0 ? Math.round((achieved / total) * 100) : 0;

    // Check for overdue milestones
    const now = new Date();
    const overdue = milestones.filter(m => 
      m.status !== 'achieved' && m.targetDate < now
    ).length;

    return {
      total,
      achieved,
      inProgress,
      pending,
      missed,
      overdue,
      completionRate
    };
  }
};
