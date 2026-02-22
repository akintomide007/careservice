import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ispGoalService = {
  // Get all goals for a client
  async getGoalsByClientId(clientId: string) {
    return prisma.ispGoal.findMany({
      where: {
        outcome: {
          clientId
        }
      },
      include: {
        outcome: {
          select: {
            id: true,
            outcomeDescription: true,
            category: true
          }
        },
        milestones: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            activities: true,
            milestones: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get goals for an outcome
  async getGoalsByOutcomeId(outcomeId: string) {
    return prisma.ispGoal.findMany({
      where: { outcomeId },
      include: {
        milestones: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            activities: true,
            milestones: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get goal by ID with full details
  async getGoalById(id: string) {
    return prisma.ispGoal.findUnique({
      where: { id },
      include: {
        outcome: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dddId: true
              }
            }
          }
        },
        milestones: {
          orderBy: { orderIndex: 'asc' }
        },
        activities: {
          take: 20,
          orderBy: { activityDate: 'desc' },
          include: {
            staff: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        progressNotes: {
          take: 10,
          orderBy: { serviceDate: 'desc' },
          select: {
            id: true,
            serviceDate: true,
            progressAssessment: true,
            status: true
          }
        }
      }
    });
  },

  // Create new goal
  async createGoal(data: {
    outcomeId: string;
    title: string;
    description?: string;
    goalType: string;
    measurementCriteria?: any;
    targetDate?: Date;
    frequency?: string;
    priority?: string;
    milestones?: Array<{
      title: string;
      description?: string;
      targetDate: Date;
      completionCriteria: string;
      orderIndex?: number;
    }>;
  }) {
    return prisma.ispGoal.create({
      data: {
        outcomeId: data.outcomeId,
        title: data.title,
        description: data.description,
        goalType: data.goalType,
        measurementCriteria: data.measurementCriteria,
        targetDate: data.targetDate,
        frequency: data.frequency,
        priority: data.priority || 'medium',
        status: 'active',
        milestones: data.milestones ? {
          create: data.milestones.map((milestone, index) => ({
            title: milestone.title,
            description: milestone.description,
            targetDate: milestone.targetDate,
            completionCriteria: milestone.completionCriteria,
            orderIndex: milestone.orderIndex || index + 1,
            status: 'pending'
          }))
        } : undefined
      },
      include: {
        milestones: true,
        outcome: true
      }
    });
  },

  // Update goal
  async updateGoal(id: string, data: {
    title?: string;
    description?: string;
    goalType?: string;
    measurementCriteria?: any;
    targetDate?: Date;
    frequency?: string;
    priority?: string;
    status?: string;
    progressPercentage?: number;
  }) {
    return prisma.ispGoal.update({
      where: { id },
      data,
      include: {
        milestones: true,
        _count: {
          select: {
            activities: true
          }
        }
      }
    });
  },

  // Mark goal as completed
  async completeGoal(id: string) {
    return prisma.ispGoal.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        progressPercentage: 100
      }
    });
  },

  // Delete goal
  async deleteGoal(id: string) {
    return prisma.ispGoal.delete({
      where: { id }
    });
  },

  // Calculate and update goal progress
  async calculateProgress(goalId: string) {
    const goal = await prisma.ispGoal.findUnique({
      where: { id: goalId },
      include: {
        milestones: true,
        activities: {
          orderBy: { activityDate: 'desc' },
          take: 10
        }
      }
    });

    if (!goal) return null;

    // Calculate progress based on milestones
    const totalMilestones = goal.milestones.length;
    const achievedMilestones = goal.milestones.filter(m => m.status === 'achieved').length;
    
    let milestoneProgress = totalMilestones > 0 
      ? Math.round((achievedMilestones / totalMilestones) * 100)
      : 0;

    // Factor in recent activity success levels
    const recentActivities = goal.activities.slice(0, 5);
    let activityProgress = 0;
    
    if (recentActivities.length > 0) {
      const successLevelMap: Record<string, number> = {
        'independent': 100,
        'minimal_assist': 75,
        'moderate_assist': 50,
        'maximum_assist': 25,
        'not_attempted': 0
      };
      
      const avgSuccess = recentActivities.reduce((sum, activity) => {
        return sum + (successLevelMap[activity.successLevel || 'not_attempted'] || 0);
      }, 0) / recentActivities.length;
      
      activityProgress = Math.round(avgSuccess);
    }

    // Weighted average: 60% milestones, 40% recent activities
    const overallProgress = totalMilestones > 0
      ? Math.round((milestoneProgress * 0.6) + (activityProgress * 0.4))
      : activityProgress;

    // Update goal progress
    await prisma.ispGoal.update({
      where: { id: goalId },
      data: { progressPercentage: overallProgress }
    });

    // Update outcome progress
    const outcome = await prisma.ispOutcome.findUnique({
      where: { id: goal.outcomeId },
      include: {
        goals: true
      }
    });

    if (outcome) {
      const outcomeProgress = outcome.goals.length > 0
        ? Math.round(
            outcome.goals.reduce((sum, g) => sum + (g.id === goalId ? overallProgress : g.progressPercentage), 0) 
            / outcome.goals.length
          )
        : 0;

      await prisma.ispOutcome.update({
        where: { id: outcome.id },
        data: { overallProgress: outcomeProgress }
      });
    }

    return { overallProgress, milestoneProgress, activityProgress };
  },

  // Get goal progress report
  async getGoalProgressReport(goalId: string) {
    const goal = await this.getGoalById(goalId);
    if (!goal) return null;

    const progress = await this.calculateProgress(goalId);

    const milestonesAchieved = goal.milestones.filter(m => m.status === 'achieved').length;
    const milestonesPending = goal.milestones.filter(m => m.status === 'pending').length;
    const milestonesInProgress = goal.milestones.filter(m => m.status === 'in_progress').length;

    const recentActivities = goal.activities.slice(0, 10);
    const avgProgressRating = recentActivities.length > 0
      ? recentActivities.reduce((sum, a) => sum + (a.progressRating || 0), 0) / recentActivities.length
      : 0;

    return {
      goal: {
        id: goal.id,
        title: goal.title,
        status: goal.status,
        targetDate: goal.targetDate,
        createdAt: goal.createdAt
      },
      progress: progress || {
        overallProgress: goal.progressPercentage,
        milestoneProgress: 0,
        activityProgress: 0
      },
      milestones: {
        total: goal.milestones.length,
        achieved: milestonesAchieved,
        inProgress: milestonesInProgress,
        pending: milestonesPending
      },
      activities: {
        total: goal.activities.length,
        recent: recentActivities.length,
        avgProgressRating: Math.round(avgProgressRating * 10) / 10
      },
      lastActivity: recentActivities[0] || null
    };
  }
};
