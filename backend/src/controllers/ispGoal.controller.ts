import { Response } from 'express';
import { AuthRequest } from '../types';
import { ispGoalService } from '../services/ispGoal.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ispGoalController = {
  async getGoals(req: AuthRequest, res: Response) {
    try {
      const { clientId, status } = req.query;
      
      // DSPs see only assigned clients' goals
      if (req.user!.role === 'dsp') {
        const assignments = await prisma.clientDspAssignment.findMany({
          where: { dspId: req.user!.userId, isActive: true },
          select: { clientId: true }
        });
        
        const clientIds = assignments.map(a => a.clientId);
        
        const goals = await prisma.ispGoal.findMany({
          where: {
            outcome: {
              clientId: clientId ? clientId as string : { in: clientIds }
            },
            ...(status && { status: status as string })
          },
          include: {
            outcome: {
              include: {
                client: {
                  select: { id: true, firstName: true, lastName: true }
                }
              }
            },
            milestones: { orderBy: { orderIndex: 'asc' } },
            _count: { select: { activities: true, milestones: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        return res.json(goals);
      }
      
      // Admin/Manager see all org goals
      const clients = await prisma.client.findMany({
        where: { organizationId: req.user!.organizationId },
        select: { id: true }
      });
      
      const clientIds = clients.map(c => c.id);
      
      const goals = await prisma.ispGoal.findMany({
        where: {
          outcome: {
            clientId: clientId ? clientId as string : { in: clientIds }
          },
          ...(status && { status: status as string })
        },
        include: {
          outcome: {
            include: {
              client: {
                select: { id: true, firstName: true, lastName: true }
              }
            }
          },
          milestones: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { activities: true, milestones: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json(goals);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  async createGoal(req: AuthRequest, res: Response) {
    try {
      const goal = await ispGoalService.createGoal(req.body);
      return res.status(201).json(goal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async updateGoal(req: AuthRequest, res: Response) {
    try {
      const goal = await ispGoalService.updateGoal(req.params.id, req.body);
      return res.json(goal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async addActivity(req: AuthRequest, res: Response) {
    try {
      const { goalId } = req.params;
      const activityData = {
        ...req.body,
        goalId,
        staffId: req.user!.userId
      };
      
      const activity = await prisma.ispActivity.create({
        data: activityData
      });
      
      await ispGoalService.calculateProgress(goalId);
      
      return res.status(201).json(activity);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async updateMilestone(req: AuthRequest, res: Response) {
    try {
      const milestone = await prisma.ispMilestone.update({
        where: { id: req.params.id },
        data: req.body
      });
      
      await ispGoalService.calculateProgress(milestone.goalId);
      
      return res.json(milestone);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
