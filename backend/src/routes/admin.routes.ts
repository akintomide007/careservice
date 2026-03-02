import { Router, Request, Response } from 'express';
import organizationAdminController from '../controllers/organizationAdmin.controller';
import { auditLogController } from '../controllers/auditLog.controller';
import { dspManagerAssignmentController } from '../controllers/dspManagerAssignment.controller';
import { requireAuth, requireLandlord, requireAdminOrManager } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const router = Router();

// Audit Logs Routes
router.get('/audit-logs', requireAuth, requireAdminOrManager, auditLogController.getOrganizationAuditLogs);
router.get('/audit-logs/all', requireAuth, requireLandlord, auditLogController.getAllAuditLogs);
router.post('/audit-logs', requireAuth, auditLogController.createAuditLog);

// DSP-Manager Assignment Routes (Admin only)
router.get('/dsp-manager-assignments', requireAuth, requireAdminOrManager, dspManagerAssignmentController.getAssignments);
router.post('/dsp-manager-assignments', requireAuth, requireAdminOrManager, dspManagerAssignmentController.createAssignment);
router.delete('/dsp-manager-assignments/:id', requireAuth, requireAdminOrManager, dspManagerAssignmentController.removeAssignment);

// Manager Routes
router.get('/manager/my-dsps', requireAuth, dspManagerAssignmentController.getManagerDsps);

// Super Admin routes
router.use('/tenants', requireAuth, requireLandlord);
router.get('/tenants', organizationAdminController.getAllOrganizations);
router.get('/tenants/:id', organizationAdminController.getOrganizationById);
router.post('/tenants', organizationAdminController.createOrganization);
router.put('/tenants/:id', organizationAdminController.updateOrganization);
router.get('/tenants/:id/metrics', organizationAdminController.getOrganizationStats);

// Usage Metrics (Super Admin only)
router.get('/usage-metrics', requireAuth, requireLandlord, async (_req, res) => {
  try {
    const metrics = await prisma.usageMetric.findMany({
      include: { organization: true },
      orderBy: { recordedAt: 'desc' }
    });
    return res.json(metrics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/usage-metrics/:organizationId', requireAuth, requireLandlord, async (req, res) => {
  try {
    const metrics = await prisma.usageMetric.findMany({
      where: { organizationId: req.params.organizationId },
      orderBy: { recordedAt: 'desc' }
    });
    return res.json(metrics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// User Management (Admin and Manager can access)
router.get('/users', requireAuth, requireAdminOrManager, async (req: any, res) => {
  try {
    const { role } = req.query;
    const where: any = { organizationId: req.user.organizationId };
    
    if (role) {
      where.role = role;
    }
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/users', requireAuth, requireAdminOrManager, async (req: any, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Admins can create any role (admin, manager, dsp) - supports multiple admins per tenant
    // Managers can only create DSPs
    if (req.user.role === 'manager' && role !== 'dsp') {
      return res.status(403).json({ error: 'Managers can only create DSP accounts' });
    }
    
    // Additional validation: only admins can create other admins
    if (role === 'admin' && req.user.role !== 'admin' && !req.user.isLandlord) {
      return res.status(403).json({ error: 'Only admins can create other admin accounts' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique azureAdId for non-SSO users (email-based)
    const azureAdId = `local_${email.replace('@', '_at_')}`;
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        azureAdId,
        organization: {
          connect: { id: req.user.organizationId }
        },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.put('/users/:id', requireAuth, requireAdminOrManager, async (req: any, res) => {
  try {
    const { firstName, lastName, isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// System Overview (Super Admin only)
router.get('/overview', requireAuth, requireLandlord, organizationAdminController.getSystemOverview);

// System Statistics (Super Admin only)
router.get('/stats', requireAuth, requireLandlord, async (_req: Request, res: Response) => {
  try {
    // Get organization stats
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        _count: {
          select: {
            users: true,
            clients: true
          }
        }
      }
    });

    const orgStats = {
      total: organizations.length,
      active: organizations.filter(o => o.isActive).length,
      suspended: organizations.filter(o => !o.isActive).length
    };

    // Get total users and breakdown by org
    const totalUsers = organizations.reduce((sum, org) => sum + org._count.users, 0);
    const usersByOrg = organizations
      .map(org => ({
        org: org.name,
        count: org._count.users
      }))
      .sort((a, b) => b.count - a.count);

    // Get total clients
    const totalClients = organizations.reduce((sum, org) => sum + org._count.clients, 0);

    // Get ticket stats
    const tickets = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: true
    });

    const ticketStats = {
      total: tickets.reduce((sum, t) => sum + t._count, 0),
      open: tickets.find(t => t.status === 'open')?._count || 0,
      inProgress: tickets.find(t => t.status === 'in_progress')?._count || 0,
      resolved: tickets.find(t => t.status === 'resolved')?._count || 0
    };

    // Mock storage stats (you can replace with real data)
    const storageStats = {
      used: 45,
      total: 1000
    };

    return res.json({
      organizations: orgStats,
      users: {
        total: totalUsers,
        byOrg: usersByOrg
      },
      clients: {
        total: totalClients
      },
      tickets: ticketStats,
      storage: storageStats
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Organizations alias for frontend compatibility
router.get('/organizations', requireAuth, requireLandlord, organizationAdminController.getAllOrganizations);
router.get('/organizations/:id', requireAuth, requireLandlord, organizationAdminController.getOrganizationById);

export default router;
