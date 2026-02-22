import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clientAssignmentController = {
  async getAssignments(req: AuthRequest, res: Response) {
    try {
      const assignments = await prisma.clientDspAssignment.findMany({
        where: {
          client: { organizationId: req.user!.organizationId },
          isActive: true
        },
        include: {
          client: {
            select: { id: true, firstName: true, lastName: true, dddId: true }
          }
        }
      });
      
      const dspIds = [...new Set(assignments.map(a => a.dspId))];
      const dsps = await prisma.user.findMany({
        where: { id: { in: dspIds } },
        select: { id: true, firstName: true, lastName: true, email: true }
      });
      
      const dspMap = Object.fromEntries(dsps.map(d => [d.id, d]));
      
      const result = assignments.map(a => ({
        ...a,
        dsp: dspMap[a.dspId]
      }));
      
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  async createAssignment(req: AuthRequest, res: Response) {
    try {
      const { clientId, dspId, notes } = req.body;
      
      const existing = await prisma.clientDspAssignment.findFirst({
        where: { clientId, dspId, isActive: true }
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Assignment already exists' });
      }
      
      const assignment = await prisma.clientDspAssignment.create({
        data: {
          clientId,
          dspId,
          assignedBy: req.user!.userId,
          notes,
          isActive: true
        },
        include: { client: true }
      });
      
      return res.status(201).json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async removeAssignment(req: AuthRequest, res: Response) {
    try {
      const assignment = await prisma.clientDspAssignment.update({
        where: { id: req.params.id },
        data: { isActive: false, endDate: new Date() }
      });
      
      return res.json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  async getDspClients(req: AuthRequest, res: Response) {
    try {
      const dspId = req.params.dspId || req.user!.userId;
      
      const assignments = await prisma.clientDspAssignment.findMany({
        where: { dspId, isActive: true },
        include: { client: true }
      });
      
      return res.json(assignments.map(a => a.client));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
