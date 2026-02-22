import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLogController = {
  // Get all audit logs (landlord only)
  async getAllAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50, action, entityType, userId } = req.query;
      
      const where: any = {};
      if (action) where.action = action as string;
      if (entityType) where.entityType = entityType as string;
      if (userId) where.userId = userId as string;
      
      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });
      
      const total = await prisma.auditLog.count({ where });
      
      return res.json({
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  // Get audit logs for organization (admin/manager)
  async getOrganizationAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const logs = await prisma.auditLog.findMany({
        where: { organizationId: req.user!.organizationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });
      
      const total = await prisma.auditLog.count({
        where: { organizationId: req.user!.organizationId }
      });
      
      return res.json({
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  // Create audit log entry
  async createAuditLog(req: AuthRequest, res: Response) {
    try {
      const { action, entityType, entityId, changes } = req.body;
      
      const log = await prisma.auditLog.create({
        data: {
          organizationId: req.user!.organizationId,
          userId: req.user!.userId,
          action,
          entityType,
          entityId,
          changes,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      return res.status(201).json(log);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
