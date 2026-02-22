import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dspManagerAssignmentController = {
  // GET /api/admin/dsp-manager-assignments - Admin only
  async getAssignments(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.user!.organizationId;
      
      const assignments = await prisma.dspManagerAssignment.findMany({
        where: { 
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      // Get DSP and Manager details
      const dspIds = [...new Set(assignments.map(a => a.dspId))];
      const managerIds = [...new Set(assignments.map(a => a.managerId))];
      
      const [dsps, managers] = await Promise.all([
        prisma.user.findMany({
          where: { 
            id: { in: dspIds },
            organizationId
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }),
        prisma.user.findMany({
          where: { 
            id: { in: managerIds },
            organizationId
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        })
      ]);
      
      const dspMap = Object.fromEntries(dsps.map(d => [d.id, d]));
      const managerMap = Object.fromEntries(managers.map(m => [m.id, m]));
      
      // Filter to only same organization and add user details
      const result = assignments
        .filter(a => dspMap[a.dspId] && managerMap[a.managerId])
        .map(assignment => ({
          ...assignment,
          dsp: dspMap[assignment.dspId],
          manager: managerMap[assignment.managerId]
        }));
      
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // POST /api/admin/dsp-manager-assignments - Create assignment
  async createAssignment(req: AuthRequest, res: Response) {
    try {
      const { dspId, managerId, notes } = req.body;
      const assignedBy = req.user!.userId;
      const organizationId = req.user!.organizationId;
      
      if (!dspId || !managerId) {
        return res.status(400).json({ error: 'DSP ID and Manager ID are required' });
      }
      
      // Verify DSP and Manager exist and are in the same organization
      const [dsp, manager] = await Promise.all([
        prisma.user.findFirst({
          where: { 
            id: dspId, 
            organizationId,
            role: 'dsp',
            isActive: true
          }
        }),
        prisma.user.findFirst({
          where: { 
            id: managerId, 
            organizationId,
            role: 'manager',
            isActive: true
          }
        })
      ]);
      
      if (!dsp) {
        return res.status(404).json({ error: 'DSP not found or not in your organization' });
      }
      
      if (!manager) {
        return res.status(404).json({ error: 'Manager not found or not in your organization' });
      }
      
      // Check if assignment already exists
      const existing = await prisma.dspManagerAssignment.findFirst({
        where: {
          dspId,
          managerId,
          isActive: true
        }
      });
      
      if (existing) {
        return res.status(400).json({ error: 'This DSP is already assigned to this manager' });
      }
      
      // Create assignment
      const assignment = await prisma.dspManagerAssignment.create({
        data: {
          dspId,
          managerId,
          assignedBy,
          notes,
          isActive: true
        }
      });
      
      // Return with user details
      const result = {
        ...assignment,
        dsp: {
          id: dsp.id,
          firstName: dsp.firstName,
          lastName: dsp.lastName,
          email: dsp.email
        },
        manager: {
          id: manager.id,
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email
        }
      };
      
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/admin/dsp-manager-assignments/:id - Remove assignment
  async removeAssignment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId;
      
      // Get assignment
      const assignment = await prisma.dspManagerAssignment.findUnique({
        where: { id }
      });
      
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify DSP belongs to the organization
      const dsp = await prisma.user.findFirst({
        where: { 
          id: assignment.dspId,
          organizationId
        }
      });
      
      if (!dsp) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Deactivate assignment
      await prisma.dspManagerAssignment.update({
        where: { id },
        data: { 
          isActive: false,
          endDate: new Date()
        }
      });
      
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/manager/my-dsps - Get manager's assigned DSPs
  async getManagerDsps(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.userId;
      
      const assignments = await prisma.dspManagerAssignment.findMany({
        where: {
          managerId,
          isActive: true
        }
      });
      
      const dspIds = assignments.map(a => a.dspId);
      
      const dsps = await prisma.user.findMany({
        where: {
          id: { in: dspIds },
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true
        },
        orderBy: { lastName: 'asc' }
      });
      
      return res.json(dsps);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
