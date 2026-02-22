import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SupportTicketService {
  // Create support ticket
  async createTicket(data: {
    organizationId: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'technical' | 'billing' | 'feature_request' | 'other';
    reportedBy: string;
    attachments?: any[];
  }) {
    return await prisma.supportTicket.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        reportedBy: data.reportedBy,
        status: 'open',
        attachments: data.attachments || []
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  // Get tickets with filters
  async getTickets(filters?: {
    organizationId?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    reportedBy?: string;
  }) {
    const where: any = {};

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters?.reportedBy) {
      where.reportedBy = filters.reportedBy;
    }

    return await prisma.supportTicket.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Get ticket by ID
  async getTicketById(id: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  // Update ticket
  async updateTicket(id: string, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    category?: string;
  }) {
    return await prisma.supportTicket.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  // Assign ticket to admin
  async assignTicket(id: string, assignedTo: string) {
    // Verify assignee is a super admin or admin
    const user = await prisma.user.findUnique({
      where: { id: assignedTo },
      select: { role: true, isLandlord: true }
    });

    if (!user || (user.role !== 'admin' && !user.isLandlord)) {
      throw new Error('Can only assign tickets to admin users');
    }

    return await prisma.supportTicket.update({
      where: { id },
      data: {
        assignedTo,
        status: 'in_progress',
        updatedAt: new Date()
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  // Resolve ticket
  async resolveTicket(id: string, data: {
    resolution: string;
    resolvedBy: string;
  }) {
    return await prisma.supportTicket.update({
      where: { id },
      data: {
        status: 'resolved',
        resolution: data.resolution,
        resolvedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  // Close ticket
  async closeTicket(id: string) {
    return await prisma.supportTicket.update({
      where: { id },
      data: {
        status: 'closed',
        updatedAt: new Date()
      }
    });
  }

  // Add comment to ticket
  async addComment(data: {
    ticketId: string;
    userId: string;
    comment: string;
    isInternal?: boolean;
  }) {
    // Get ticket to ensure it exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: data.ticketId }
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: data.ticketId,
        userId: data.userId,
        comment: data.comment,
        isInternal: data.isInternal || false
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Update ticket's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id: data.ticketId },
      data: { updatedAt: new Date() }
    });

    return comment;
  }

  // Get ticket statistics
  async getTicketStats(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};

    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.count({ where: { ...where, status: 'open' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'resolved' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'closed' } })
    ]);

    // Get average resolution time
    const resolvedTickets = await prisma.supportTicket.findMany({
      where: {
        ...where,
        status: 'resolved',
        resolvedAt: { not: null }
      },
      select: {
        createdAt: true,
        resolvedAt: true
      }
    });

    let avgResolutionTimeHours = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        if (ticket.resolvedAt) {
          return sum + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime());
        }
        return sum;
      }, 0);
      avgResolutionTimeHours = totalTime / resolvedTickets.length / (1000 * 60 * 60);
    }

    // Count by priority
    const [lowPriority, mediumPriority, highPriority, criticalPriority] = await Promise.all([
      prisma.supportTicket.count({ where: { ...where, priority: 'low' } }),
      prisma.supportTicket.count({ where: { ...where, priority: 'medium' } }),
      prisma.supportTicket.count({ where: { ...where, priority: 'high' } }),
      prisma.supportTicket.count({ where: { ...where, priority: 'critical' } })
    ]);

    // Count by category
    const [technical, billing, featureRequest, other] = await Promise.all([
      prisma.supportTicket.count({ where: { ...where, category: 'technical' } }),
      prisma.supportTicket.count({ where: { ...where, category: 'billing' } }),
      prisma.supportTicket.count({ where: { ...where, category: 'feature_request' } }),
      prisma.supportTicket.count({ where: { ...where, category: 'other' } })
    ]);

    return {
      total,
      byStatus: {
        open,
        inProgress,
        resolved,
        closed
      },
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority,
        critical: criticalPriority
      },
      byCategory: {
        technical,
        billing,
        featureRequest,
        other
      },
      avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10
    };
  }

  // Get user's tickets
  async getUserTickets(userId: string) {
    return await prisma.supportTicket.findMany({
      where: {
        OR: [
          { reportedBy: userId },
          { assignedTo: userId }
        ]
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}

export default new SupportTicketService();
