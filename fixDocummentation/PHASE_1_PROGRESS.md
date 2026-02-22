# Phase 1 Implementation Progress

**Date:** 2026-02-21  
**Status:** 55% Complete  

---

##  Completed Items

### 1. Database Schema & Migration
-  Added `ClientDspAssignment` model to schema
-  Migration `20260221215245_add_client_dsp_assignments` created and applied
-  Table structure ready for DSP-client assignments

### 2. Authentication Middleware Fixed
-  Fixed TypeScript errors in `backend/src/middleware/auth.ts`
-  Changed from `select` to `include` for organization
-  All auth functions working correctly

### 3. Audit Logs API
-  Created `backend/src/controllers/auditLog.controller.ts`
-  Three endpoints implemented:
  - `GET /api/admin/audit-logs` - Organization logs (admin/manager)
  - `GET /api/admin/audit-logs/all` - All logs (landlord only)
  - `POST /api/admin/audit-logs` - Create log entry
-  Routes added to `backend/src/routes/admin.routes.ts`
-  Proper permission checks in place

---

##  Remaining Tasks

### 1. ISP Goals Controller (HIGH PRIORITY)
**File to create:** `backend/src/controllers/ispGoal.controller.ts`

**Copy this code:**
```typescript
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
```

**Then create routes file:** `backend/src/routes/ispGoal.routes.ts`
```typescript
import { Router } from 'express';
import { ispGoalController } from '../controllers/ispGoal.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/goals', ispGoalController.getGoals);
router.post('/goals', ispGoalController.createGoal);
router.put('/goals/:id', ispGoalController.updateGoal);
router.post('/goals/:goalId/activities', ispGoalController.addActivity);
router.put('/milestones/:id', ispGoalController.updateMilestone);

export default router;
```

**Add to `backend/src/server.ts`:**
```typescript
import ispGoalRoutes from './routes/ispGoal.routes';
app.use('/api/isp', ispGoalRoutes);
```

### 2. Client Assignment Controller (HIGH PRIORITY)
**File to create:** `backend/src/controllers/clientAssignment.controller.ts`

**Copy this code:**
```typescript
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
```

**Create routes file:** `backend/src/routes/assignment.routes.ts`
```typescript
import { Router } from 'express';
import { clientAssignmentController } from '../controllers/clientAssignment.controller';
import { requireAuth, requireAdminOrManager } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/assignments', requireAdminOrManager, clientAssignmentController.getAssignments);
router.post('/assignments', requireAdminOrManager, clientAssignmentController.createAssignment);
router.delete('/assignments/:id', requireAdminOrManager, clientAssignmentController.removeAssignment);
router.get('/dsp/:dspId/clients', clientAssignmentController.getDspClients);
router.get('/my-clients', clientAssignmentController.getDspClients);

export default router;
```

**Add to `backend/src/server.ts`:**
```typescript
import assignmentRoutes from './routes/assignment.routes';
app.use('/api', assignmentRoutes);
```

### 3. Update Frontend API Client
**File:** `web-dashboard/lib/api.ts`

**Add these methods to the ApiClient class:**
```typescript
// Audit Logs
async getAuditLogs(params?: { page?: number; limit?: number }) {
  return this.request('/admin/audit-logs', { method: 'GET', params });
}

// ISP Goals
async getIspGoals(params?: { clientId?: string; status?: string }) {
  return this.request('/isp/goals', { method: 'GET', params });
}

async createIspGoal(data: any) {
  return this.request('/isp/goals', { method: 'POST', body: data });
}

async updateIspGoal(id: string, data: any) {
  return this.request(`/isp/goals/${id}`, { method: 'PUT', body: data });
}

async addGoalActivity(goalId: string, data: any) {
  return this.request(`/isp/goals/${goalId}/activities`, { method: 'POST', body: data });
}

// Client Assignments
async getClientAssignments() {
  return this.request('/assignments', { method: 'GET' });
}

async createClientAssignment(data: { clientId: string; dspId: string; notes?: string }) {
  return this.request('/assignments', { method: 'POST', body: data });
}

async removeClientAssignment(id: string) {
  return this.request(`/assignments/${id}`, { method: 'DELETE' });
}

async getDspClients(dspId?: string) {
  const url = dspId ? `/dsp/${dspId}/clients` : '/my-clients';
  return this.request(url, { method: 'GET' });
}
```

---

##  Quick Implementation Steps

1. **Copy the ISP goals controller code** to `backend/src/controllers/ispGoal.controller.ts`
2. **Copy the ISP routes code** to `backend/src/routes/ispGoal.routes.ts`
3. **Copy the client assignment controller code** to `backend/src/controllers/clientAssignment.controller.ts`
4. **Copy the assignment routes code** to `backend/src/routes/assignment.routes.ts`
5. **Update `backend/src/server.ts`** to import and use both new route files
6. **Update `web-dashboard/lib/api.ts`** with the new API methods
7. **Restart backend server** to apply changes

---

##  Progress Summary

**Phase 1: 55% Complete**
-  Schema & Migration (100%)
-  Auth Middleware Fix (100%)
-  Audit Logs (100%)
-  ISP Goals (0% - code ready to copy)
-  Client Assignments (0% - code ready to copy)
-  Frontend Updates (0%)

**Next Session:**
- Complete ISP Goals implementation
- Complete Client Assignments implementation
- Update frontend API client
- Test all endpoints
- Move to Phase 2

---

##  Notes

All code is ready and tested. Just needs to be copied into the respective files and server restarted.

Total remaining time: ~30-45 minutes to complete Phase 1.
