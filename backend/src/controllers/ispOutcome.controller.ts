import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ispOutcomeController = {
  async getOutcomes(req: AuthRequest, res: Response) {
    try {
      const { clientId } = req.query;
      
      const where: any = {};
      
      // Build filter based on role
      if (req.user!.role === 'dsp') {
        // DSPs see only assigned clients' outcomes
        const assignments = await prisma.clientDspAssignment.findMany({
          where: { dspId: req.user!.userId, isActive: true },
          select: { clientId: true }
        });
        
        const clientIds = assignments.map(a => a.clientId);
        where.clientId = clientId ? clientId as string : { in: clientIds };
      } else {
        // Managers/Admins see all org outcomes
        const clients = await prisma.client.findMany({
          where: { organizationId: req.user!.organizationId },
          select: { id: true }
        });
        
        const clientIds = clients.map(c => c.id);
        where.clientId = clientId ? clientId as string : { in: clientIds };
      }
      
      const outcomes = await prisma.ispOutcome.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dddId: true
            }
          },
          goals: {
            select: {
              id: true,
              title: true,
              status: true,
              progressPercentage: true
            }
          },
          _count: {
            select: { goals: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json(outcomes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  async getOutcome(req: AuthRequest, res: Response) {
    try {
      const outcome = await prisma.ispOutcome.findUnique({
        where: { id: req.params.id },
        include: {
          client: true,
          goals: {
            include: {
              milestones: true,
              _count: {
                select: { activities: true }
              }
            }
          }
        }
      });
      
      if (!outcome) {
        return res.status(404).json({ error: 'Outcome not found' });
      }
      
      return res.json(outcome);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  async createOutcome(req: AuthRequest, res: Response) {
    try {
      const {
        clientId,
        outcomeDescription,
        category,
        targetDate,
        reviewFrequency,
        nextReviewDate
      } = req.body;
      
      // Verify client belongs to user's organization
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          organizationId: req.user!.organizationId
        }
      });
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found or access denied' });
      }
      
      const outcome = await prisma.ispOutcome.create({
        data: {
          clientId,
          outcomeDescription,
          category,
          targetDate: targetDate ? new Date(targetDate) : null,
          reviewFrequency,
          nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
          status: 'active',
          overallProgress: 0
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      return res.status(201).json(outcome);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async updateOutcome(req: AuthRequest, res: Response) {
    try {
      const {
        outcomeDescription,
        category,
        targetDate,
        reviewFrequency,
        nextReviewDate,
        status
      } = req.body;
      
      const outcome = await prisma.ispOutcome.update({
        where: { id: req.params.id },
        data: {
          outcomeDescription,
          category,
          targetDate: targetDate ? new Date(targetDate) : undefined,
          reviewFrequency,
          nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
          status,
          lastReviewDate: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      return res.json(outcome);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async deleteOutcome(req: AuthRequest, res: Response) {
    try {
      // This will cascade delete all goals and their milestones/activities
      await prisma.ispOutcome.delete({
        where: { id: req.params.id }
      });
      
      return res.json({ message: 'Outcome deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
