import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const taskService = {
  // Create a new task
  async createTask(data: {
    organizationId: string;
    assignedTo: string;
    assignedBy: string;
    clientId?: string;
    taskType: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate: Date;
    estimatedHours?: number;
    checklistItems?: string[];
    reminders?: any;
    recurring?: boolean;
    recurringPattern?: string;
  }) {
    return prisma.task.create({
      data: {
        organizationId: data.organizationId,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        clientId: data.clientId,
        taskType: data.taskType,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        status: 'pending',
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        reminders: data.reminders,
        recurring: data.recurring || false,
        recurringPattern: data.recurringPattern,
        checklistItems: {
          create: data.checklistItems?.map((item, index) => ({
            title: item,
            orderIndex: index + 1
          })) || []
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        assigner: {
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
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  },

  // Get tasks for a user
  async getUserTasks(userId: string, organizationId: string, filters?: {
    status?: string;
    priority?: string;
    taskType?: string;
    clientId?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
  }) {
    return prisma.task.findMany({
      where: {
        assignedTo: userId,
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.taskType && { taskType: filters.taskType }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.dueDateFrom && {
          dueDate: { gte: filters.dueDateFrom }
        }),
        ...(filters?.dueDateTo && {
          dueDate: { lte: filters.dueDateTo }
        })
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assigner: {
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
            lastName: true,
            dddId: true
          }
        },
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            results: true,
            violations: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
  },

  // Get tasks assigned by a manager
  async getAssignedTasks(assignerId: string, organizationId: string, filters?: {
    status?: string;
    assignedTo?: string;
  }) {
    return prisma.task.findMany({
      where: {
        assignedBy: assignerId,
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedTo && { assignedTo: filters.assignedTo })
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        checklistItems: true,
        results: true
      },
      orderBy: { dueDate: 'asc' }
    });
  },

  // Get task by ID
  async getTaskById(taskId: string, organizationId: string) {
    return prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        client: true,
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        },
        results: {
          include: {
            verifier: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        violations: true
      }
    });
  },

  // Update task
  async updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: Date;
    estimatedHours?: number;
  }) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        ...(data.status === 'in_progress' && !data.hasOwnProperty('startedAt') && {
          startedAt: new Date()
        }),
        ...(data.status === 'completed' && {
          completedAt: new Date()
        })
      },
      include: {
        assignee: true,
        client: true,
        checklistItems: true
      }
    });
  },

  // Start task
  async startTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assignedTo !== userId) {
      throw new Error('Not authorized to start this task');
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'in_progress',
        startedAt: new Date()
      }
    });
  },

  // Complete task
  async completeTask(taskId: string, userId: string, data: {
    completionNotes?: string;
    actualHours?: number;
    resultType?: string;
    resultDescription?: string;
    resultMetrics?: any;
    resultEvidence?: any;
  }) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { checklistItems: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assignedTo !== userId) {
      throw new Error('Not authorized to complete this task');
    }

    // Check if all checklist items are completed
    const incompleteItems = task.checklistItems.filter(item => !item.isCompleted);
    if (incompleteItems.length > 0) {
      throw new Error('All checklist items must be completed before completing the task');
    }

    // Update task and create result
    return prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completionNotes: data.completionNotes,
        actualHours: data.actualHours,
        ...(data.resultType && {
          results: {
            create: {
              resultType: data.resultType,
              description: data.resultDescription || '',
              metrics: data.resultMetrics,
              evidence: data.resultEvidence
            }
          }
        })
      },
      include: {
        assignee: true,
        assigner: true,
        client: true,
        results: true
      }
    });
  },

  // Toggle checklist item
  async toggleChecklistItem(itemId: string, isCompleted: boolean) {
    return prisma.taskChecklist.update({
      where: { id: itemId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });
  },

  // Add checklist item
  async addChecklistItem(taskId: string, title: string) {
    const maxOrder = await prisma.taskChecklist.aggregate({
      where: { taskId },
      _max: { orderIndex: true }
    });

    return prisma.taskChecklist.create({
      data: {
        taskId,
        title,
        orderIndex: (maxOrder._max.orderIndex || 0) + 1
      }
    });
  },

  // Delete checklist item
  async deleteChecklistItem(itemId: string) {
    return prisma.taskChecklist.delete({
      where: { id: itemId }
    });
  },

  // Add task result
  async addTaskResult(taskId: string, data: {
    resultType: string;
    description: string;
    metrics?: any;
    evidence?: any;
    verifiedBy?: string;
    notes?: string;
  }) {
    return prisma.taskResult.create({
      data: {
        taskId,
        resultType: data.resultType,
        description: data.description,
        metrics: data.metrics,
        evidence: data.evidence,
        verifiedBy: data.verifiedBy,
        notes: data.notes
      },
      include: {
        verifier: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  // Verify task result
  async verifyTaskResult(resultId: string, verifierId: string, notes?: string) {
    return prisma.taskResult.update({
      where: { id: resultId },
      data: {
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        notes
      }
    });
  },

  // Get task statistics
  async getTaskStatistics(organizationId: string, userId?: string, role?: string) {
    const whereClause: any = { organizationId };
    
    if (role === 'dsp' && userId) {
      whereClause.assignedTo = userId;
    } else if (role === 'manager' && userId) {
      whereClause.assignedBy = userId;
    }

    const [
      total,
      pending,
      inProgress,
      completed,
      overdue
    ] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.count({ where: { ...whereClause, status: 'pending' } }),
      prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
      prisma.task.count({ where: { ...whereClause, status: 'completed' } }),
      prisma.task.count({
        where: {
          ...whereClause,
          status: { in: ['pending', 'in_progress'] },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue
    };
  },

  // Get overdue tasks
  async getOverdueTasks(organizationId: string, userId?: string) {
    return prisma.task.findMany({
      where: {
        organizationId,
        ...(userId && { assignedTo: userId }),
        status: { in: ['pending', 'in_progress'] },
        dueDate: { lt: new Date() }
      },
      include: {
        assignee: {
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
            lastName: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  },

  // Delete task
  async deleteTask(taskId: string) {
    return prisma.task.delete({
      where: { id: taskId }
    });
  }
};
