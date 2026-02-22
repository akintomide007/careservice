import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ispActivityService = {
  // Get activities for a goal
  async getActivitiesByGoalId(goalId: string, limit = 50) {
    return prisma.ispActivity.findMany({
      where: { goalId },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        progressNote: {
          select: {
            id: true,
            serviceDate: true,
            status: true
          }
        }
      },
      orderBy: { activityDate: 'desc' },
      take: limit
    });
  },

  // Get activity by ID
  async getActivityById(id: string) {
    return prisma.ispActivity.findUnique({
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
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        progressNote: true
      }
    });
  },

  // Log new activity
  async logActivity(data: {
    goalId: string;
    staffId: string;
    activityDate: Date;
    activityType: string;
    description: string;
    duration?: number;
    successLevel?: string;
    prompts?: any;
    observations?: string;
    barriers?: string;
    modifications?: string;
    progressRating?: number;
    progressNoteId?: string;
  }) {
    const activity = await prisma.ispActivity.create({
      data: {
        goalId: data.goalId,
        staffId: data.staffId,
        activityDate: data.activityDate,
        activityType: data.activityType,
        description: data.description,
        duration: data.duration,
        successLevel: data.successLevel,
        prompts: data.prompts,
        observations: data.observations,
        barriers: data.barriers,
        modifications: data.modifications,
        progressRating: data.progressRating,
        progressNoteId: data.progressNoteId
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Recalculate goal progress after logging activity
    const { ispGoalService } = await import('./ispGoal.service');
    await ispGoalService.calculateProgress(data.goalId);

    return activity;
  },

  // Update activity
  async updateActivity(id: string, data: {
    activityDate?: Date;
    activityType?: string;
    description?: string;
    duration?: number;
    successLevel?: string;
    prompts?: any;
    observations?: string;
    barriers?: string;
    modifications?: string;
    progressRating?: number;
  }) {
    const activity = await prisma.ispActivity.update({
      where: { id },
      data
    });

    // Recalculate goal progress
    const { ispGoalService } = await import('./ispGoal.service');
    await ispGoalService.calculateProgress(activity.goalId);

    return activity;
  },

  // Delete activity
  async deleteActivity(id: string) {
    const activity = await prisma.ispActivity.findUnique({
      where: { id },
      select: { goalId: true }
    });

    await prisma.ispActivity.delete({
      where: { id }
    });

    // Recalculate goal progress after deletion
    if (activity) {
      const { ispGoalService } = await import('./ispGoal.service');
      await ispGoalService.calculateProgress(activity.goalId);
    }
  },

  // Get activity timeline for a goal
  async getActivityTimeline(goalId: string, startDate?: Date, endDate?: Date) {
    const where: any = { goalId };
    
    if (startDate || endDate) {
      where.activityDate = {};
      if (startDate) where.activityDate.gte = startDate;
      if (endDate) where.activityDate.lte = endDate;
    }

    return prisma.ispActivity.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { activityDate: 'asc' }
    });
  },

  // Get activity statistics
  async getActivityStats(goalId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.ispActivity.findMany({
      where: {
        goalId,
        activityDate: {
          gte: startDate
        }
      }
    });

    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const avgDuration = totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0;

    // Success level distribution
    const successLevelCounts = activities.reduce((acc: any, activity) => {
      const level = activity.successLevel || 'not_attempted';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Activity type distribution
    const activityTypeCounts = activities.reduce((acc: any, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {});

    // Average progress rating
    const ratingsArray = activities.filter(a => a.progressRating).map(a => a.progressRating!);
    const avgProgressRating = ratingsArray.length > 0
      ? Math.round((ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length) * 10) / 10
      : 0;

    // Activity frequency (activities per week)
    const weeksDuration = days / 7;
    const activitiesPerWeek = Math.round((totalActivities / weeksDuration) * 10) / 10;

    return {
      period: {
        days,
        startDate,
        endDate: new Date()
      },
      totalActivities,
      activitiesPerWeek,
      totalDuration,
      avgDuration,
      avgProgressRating,
      successLevelDistribution: successLevelCounts,
      activityTypeDistribution: activityTypeCounts
    };
  },

  // Get recent activities across all clients (for staff dashboard)
  async getRecentActivitiesByStaff(staffId: string, limit = 20) {
    return prisma.ispActivity.findMany({
      where: { staffId },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            outcome: {
              select: {
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
      },
      orderBy: { activityDate: 'desc' },
      take: limit
    });
  }
};
