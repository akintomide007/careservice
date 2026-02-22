import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const violationService = {
  // Create a new violation
  async createViolation(data: {
    organizationId: string;
    userId: string;
    reportedBy: string;
    violationType: string;
    severity: string;
    incidentDate: Date;
    description: string;
    evidence?: any;
    clientId?: string;
    taskId?: string;
  }) {
    // Calculate points based on severity
    const pointsMap: { [key: string]: number } = {
      minor: 1,
      moderate: 3,
      major: 7,
      critical: 12
    };

    return prisma.violation.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        reportedBy: data.reportedBy,
        violationType: data.violationType,
        severity: data.severity,
        status: 'open',
        incidentDate: data.incidentDate,
        description: data.description,
        evidence: data.evidence,
        clientId: data.clientId,
        taskId: data.taskId,
        points: pointsMap[data.severity] || 0
      },
      include: {
        violator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dddId: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            taskType: true
          }
        }
      }
    });
  },

  // Get violations for an organization
  async getViolations(organizationId: string, filters?: {
    userId?: string;
    status?: string;
    severity?: string;
    violationType?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    return prisma.violation.findMany({
      where: {
        organizationId,
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.violationType && { violationType: filters.violationType }),
        ...(filters?.fromDate && {
          incidentDate: { gte: filters.fromDate }
        }),
        ...(filters?.toDate && {
          incidentDate: { lte: filters.toDate }
        })
      },
      include: {
        violator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        resolver: {
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
        },
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { incidentDate: 'desc' }
      ]
    });
  },

  // Get violations for a specific user
  async getUserViolations(userId: string, organizationId: string, status?: string) {
    return prisma.violation.findMany({
      where: {
        userId,
        organizationId,
        ...(status && { status })
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        resolver: {
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
      },
      orderBy: { incidentDate: 'desc' }
    });
  },

  // Get violation by ID
  async getViolationById(violationId: string, organizationId: string) {
    return prisma.violation.findFirst({
      where: {
        id: violationId,
        organizationId
      },
      include: {
        violator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phone: true
          }
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        resolver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        client: true,
        task: true
      }
    });
  },

  // Update violation
  async updateViolation(violationId: string, data: {
    correctiveAction?: string;
    status?: string;
  }) {
    return prisma.violation.update({
      where: { id: violationId },
      data,
      include: {
        violator: true,
        reporter: true,
        resolver: true
      }
    });
  },

  // Resolve violation
  async resolveViolation(violationId: string, resolverId: string, resolution: string) {
    return prisma.violation.update({
      where: { id: violationId },
      data: {
        status: 'resolved',
        resolution,
        resolvedBy: resolverId,
        resolvedAt: new Date()
      },
      include: {
        violator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        resolver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  // Appeal violation
  async appealViolation(violationId: string, appealNotes: string) {
    return prisma.violation.update({
      where: { id: violationId },
      data: {
        isAppealed: true,
        appealNotes,
        status: 'under_appeal'
      }
    });
  },

  // Resolve appeal
  async resolveAppeal(violationId: string, resolverId: string, approved: boolean, notes?: string) {
    const updateData: any = {
      appealResolvedBy: resolverId,
      appealResolvedAt: new Date()
    };

    if (approved) {
      updateData.status = 'dismissed';
      updateData.points = 0;
    } else {
      updateData.status = 'resolved';
    }

    if (notes) {
      updateData.appealNotes = notes;
    }

    return prisma.violation.update({
      where: { id: violationId },
      data: updateData,
      include: {
        violator: true,
        resolver: true
      }
    });
  },

  // Get user violation summary
  async getUserViolationSummary(userId: string, organizationId: string) {
    const [
      totalViolations,
      openViolations,
      resolvedViolations,
      totalPoints,
      violationsBySeverity,
      violationsByType,
      recentViolations
    ] = await Promise.all([
      prisma.violation.count({
        where: { userId, organizationId }
      }),
      prisma.violation.count({
        where: { userId, organizationId, status: 'open' }
      }),
      prisma.violation.count({
        where: { userId, organizationId, status: 'resolved' }
      }),
      prisma.violation.aggregate({
        where: { 
          userId, 
          organizationId,
          status: { not: 'dismissed' }
        },
        _sum: { points: true }
      }),
      prisma.violation.groupBy({
        by: ['severity'],
        where: { userId, organizationId },
        _count: true
      }),
      prisma.violation.groupBy({
        by: ['violationType'],
        where: { userId, organizationId },
        _count: true
      }),
      prisma.violation.findMany({
        where: { userId, organizationId },
        take: 5,
        orderBy: { incidentDate: 'desc' },
        include: {
          reporter: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    return {
      totalViolations,
      openViolations,
      resolvedViolations,
      totalPoints: totalPoints._sum.points || 0,
      violationsBySeverity,
      violationsByType,
      recentViolations
    };
  },

  // Get organization violation statistics
  async getOrganizationStatistics(organizationId: string) {
    const [
      totalViolations,
      openViolations,
      resolvedViolations,
      violationsBySeverity,
      violationsByType,
      topViolators,
      recentViolations
    ] = await Promise.all([
      prisma.violation.count({ where: { organizationId } }),
      prisma.violation.count({ where: { organizationId, status: 'open' } }),
      prisma.violation.count({ where: { organizationId, status: 'resolved' } }),
      prisma.violation.groupBy({
        by: ['severity'],
        where: { organizationId },
        _count: true,
        _sum: { points: true }
      }),
      prisma.violation.groupBy({
        by: ['violationType'],
        where: { organizationId },
        _count: true
      }),
      prisma.violation.groupBy({
        by: ['userId'],
        where: { organizationId, status: { not: 'dismissed' } },
        _sum: { points: true },
        _count: true,
        orderBy: { _sum: { points: 'desc' } },
        take: 10
      }),
      prisma.violation.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { incidentDate: 'desc' },
        include: {
          violator: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          },
          reporter: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Enrich top violators with user details
    const topViolatorsWithDetails = await Promise.all(
      topViolators.map(async (v) => {
        const user = await prisma.user.findUnique({
          where: { id: v.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        });
        return {
          user,
          totalPoints: v._sum.points || 0,
          violationCount: v._count
        };
      })
    );

    return {
      totalViolations,
      openViolations,
      resolvedViolations,
      violationsBySeverity,
      violationsByType,
      topViolators: topViolatorsWithDetails,
      recentViolations
    };
  },

  // Delete violation (soft delete by marking as dismissed)
  async deleteViolation(violationId: string, userId: string) {
    return prisma.violation.update({
      where: { id: violationId },
      data: {
        status: 'dismissed',
        resolvedBy: userId,
        resolvedAt: new Date(),
        points: 0
      }
    });
  }
};
