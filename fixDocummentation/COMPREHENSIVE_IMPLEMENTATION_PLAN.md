# Comprehensive Implementation Plan
## All Phases - Complete Feature Implementation

**Created:** 2026-02-21  
**Status:** In Progress  
**Estimated Time:** 4-6 hours of development

---

##  Overview

This document outlines the complete implementation plan for all requested features across 4 phases.

### Requirements Summary:
1. **Fix API Connections** - Audit logs, ISP goals
2. **Role-Based Management** - DSP-Client assignments, Landlord features
3. **Progress Note Printing** - 5 professional templates
4. **Testing & Verification** - End-to-end validation

---

##  PHASE 1: Fix Critical API Connections

### 1.1 Audit Logs API (CRITICAL - Currently Failing)

**Status:**  Not Implemented  
**Priority:** HIGH  
**Location:** `backend/src/routes/admin.routes.ts`

**Current Error:**
```
Request failed
lib/api.ts (45:13) @ ApiClient.request
```

**Implementation:**

**File:** `backend/src/controllers/auditLog.controller.ts`
```typescript
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
```

**Add Routes in** `backend/src/routes/admin.routes.ts`:
```typescript
import { auditLogController } from '../controllers/auditLog.controller';

// Audit Logs (Admin and Manager can view org logs)
router.get('/audit-logs', requireAuth, requireAdminOrManager, 
  auditLogController.getOrganizationAuditLogs);

// Landlord can view all audit logs
router.get('/audit-logs/all', requireAuth, requireLandlord, 
  auditLogController.getAllAuditLogs);
```

---

### 1.2 ISP Goals API Connection (CRITICAL)

**Status:**  Frontend using dummy data  
**Priority:** HIGH  
**Current:** Frontend not connected to backend

**Implementation:**

**File:** `backend/src/controllers/ispGoal.controller.ts`
```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';
import { ispGoalService } from '../services/ispGoal.service';

export const ispGoalController = {
  // Get all goals for organization
  async getGoals(req: AuthRequest, res: Response) {
    try {
      const { clientId, status } = req.query;
      
      // DSPs see only assigned clients' goals
      if (req.user!.role === 'dsp') {
        const assignments = await prisma.clientDspAssignment.findMany({
          where: {
            dspId: req.user!.userId,
            isActive: true
          },
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
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            milestones: true,
            _count: {
              select: { activities: true }
            }
          }
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
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          milestones: true,
          _count: {
            select: { activities: true }
          }
        }
      });
      
      return res.json(goals);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  // Create new goal
  async createGoal(req: AuthRequest, res: Response) {
    try {
      const goal = await ispGoalService.createGoal(req.body);
      return res.status(201).json(goal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  // Update goal
  async updateGoal(req: AuthRequest, res: Response) {
    try {
      const goal = await ispGoalService.updateGoal(req.params.id, req.body);
      return res.json(goal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  // Add activity to goal
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
      
      // Update goal progress
      await ispGoalService.calculateProgress(goalId);
      
      return res.status(201).json(activity);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  // Update milestone
  async updateMilestone(req: AuthRequest, res: Response) {
    try {
      const milestone = await prisma.ispMilestone.update({
        where: { id: req.params.id },
        data: req.body
      });
      
      // Recalculate goal progress
      await ispGoalService.calculateProgress(milestone.goalId);
      
      return res.json(milestone);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
```

**File:** `backend/src/routes/ispGoal.routes.ts` (NEW)
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

**Add to** `backend/src/server.ts`:
```typescript
import ispGoalRoutes from './routes/ispGoal.routes';
app.use('/api/isp', ispGoalRoutes);
```

---

### 1.3 Client-DSP Assignment API

**Status:**  Not Implemented  
**Priority:** HIGH  
**Required for:** DSPs to see only assigned clients

**File:** `backend/src/controllers/clientAssignment.controller.ts` (NEW)
```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clientAssignmentController = {
  // Get all assignments for organization
  async getAssignments(req: AuthRequest, res: Response) {
    try {
      const assignments = await prisma.clientDspAssignment.findMany({
        where: {
          client: {
            organizationId: req.user!.organizationId
          },
          isActive: true
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dddId: true
            }
          }
        }
      });
      
      // Get DSP details
      const dspIds = [...new Set(assignments.map(a => a.dspId))];
      const dsps = await prisma.user.findMany({
        where: { id: { in: dspIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
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
  
  // Create assignment
  async createAssignment(req: AuthRequest, res: Response) {
    try {
      const { clientId, dspId, notes } = req.body;
      
      // Check if assignment already exists
      const existing = await prisma.clientDspAssignment.findFirst({
        where: {
          clientId,
          dspId,
          isActive: true
        }
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
        include: {
          client: true
        }
      });
      
      return res.status(201).json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  // Remove assignment
  async removeAssignment(req: AuthRequest, res: Response) {
    try {
      const assignment = await prisma.clientDspAssignment.update({
        where: { id: req.params.id },
        data: {
          isActive: false,
          endDate: new Date()
        }
      });
      
      return res.json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
  
  // Get DSP's assigned clients
  async getDspClients(req: AuthRequest, res: Response) {
    try {
      const dspId = req.params.dspId || req.user!.userId;
      
      const assignments = await prisma.clientDspAssignment.findMany({
        where: {
          dspId,
          isActive: true
        },
        include: {
          client: true
        }
      });
      
      return res.json(assignments.map(a => a.client));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
```

---

##  PHASE 2: Role-Based Management Features

### 2.1 Update Client Routes for DSP Filtering

**File:** `backend/src/routes/client.routes.ts`

Add filtering logic:
```typescript
// In GET /clients endpoint
if (req.user!.role === 'dsp') {
  // Get only assigned clients
  const assignments = await prisma.clientDspAssignment.findMany({
    where: {
      dspId: req.user!.userId,
      isActive: true
    },
    select: { clientId: true }
  });
  
  where.id = { in: assignments.map(a => a.clientId) };
}
```

### 2.2 Landlord Features - Assign DSPs to Managers

**Add to** `backend/src/routes/admin.routes.ts`:
```typescript
// Landlord: Get all DSPs across organizations
router.get('/all-dsps', requireAuth, requireLandlord, async (req, res) => {
  const dsps = await prisma.user.findMany({
    where: { role: 'dsp' },
    include: {
      organization: {
        select: { id: true, name: true }
      }
    }
  });
  return res.json(dsps);
});

// Landlord: Assign DSP to manager
router.post('/assign-dsp-to-manager', requireAuth, requireLandlord, async (req, res) => {
  const { dspId, managerId } = req.body;
  // Implementation for assignment logic
});
```

---

##  PHASE 3: Progress Note Printing System

### 3.1 Progress Note Print Templates

Create 5 professional templates based on the provided document.

**File:** `web-dashboard/components/print/ProgressNotePrintTemplate.tsx` (NEW)

```typescript
'use client';

interface ProgressNotePrintProps {
  note: any;
  templateType: 'cbs' | 'individual' | 'respite' | 'behavioral' | 'vocational';
}

export default function ProgressNotePrintTemplate({ note, templateType }: ProgressNotePrintProps) {
  return (
    <div className="print:block hidden">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white p-8 text-black">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center">
            {templateType === 'cbs' && 'Community-Based Support (CBS) Progress Note'}
            {templateType === 'individual' && 'Individual Support (Daily Living Skills) Progress Note'}
            {templateType === 'respite' && 'Respite Progress Note'}
            {templateType === 'behavioral' && 'Behavioral Support Progress Note'}
            {templateType === 'vocational' && 'Career Planning / Vocational Support Progress Note'}
          </h1>
        </div>
        
        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><strong>Individual:</strong> {note.client.firstName} {note.client.lastName}</div>
          <div><strong>DOB:</strong> {note.client.dateOfBirth}</div>
          <div><strong>DDD ID:</strong> {note.client.dddId}</div>
          <div><strong>Date of Service:</strong> {note.serviceDate}</div>
          <div><strong>Service Type:</strong> {note.serviceType}</div>
          <div><strong>Start/End Time:</strong> {note.startTime}  {note.endTime}</div>
          <div className="col-span-2"><strong>Location of Service:</strong> {note.location}</div>
          <div className="col-span-2"><strong>Staff Provided:</strong> {note.staff.firstName} {note.staff.lastName}, DSP</div>
          <div className="col-span-2"><strong>ISP Outcome(s) Addressed:</strong> {note.ispOutcome?.outcomeDescription}</div>
        </div>
        
        {/* Section 1: Reason for Service */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">1. Reason for Service</h2>
          <p className="text-sm">{note.reasonForService}</p>
        </div>
        
        {/* Section 2: Objective Description of Activities */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">2. Objective Description of Activities</h2>
          
          {note.activities?.map((activity: any, index: number) => (
            <div key={index} className="mb-4 border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-sm mb-2">Activity {index + 1}  {activity.taskGoal}</h3>
              
              <div className="text-sm space-y-1">
                <p><strong>Task/Goal:</strong> {activity.taskGoal}</p>
                <p><strong>Supports Provided:</strong> {activity.supportsProvided}</p>
                
                <div>
                  <strong>Prompt Level Used:</strong>
                  <div className="flex gap-4 ml-4">
                    {['Independent', 'Verbal', 'Gestural', 'Model'].map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activity.promptLevel?.includes(level)}
                          readOnly
                          className="mr-1"
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
                
                <p><strong>Objective Observation:</strong> {activity.objectiveObservation}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Section 3: Supports and Prompting Provided */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">3. Supports and Prompting Provided</h2>
          <p className="text-sm whitespace-pre-wrap">{note.supportsProvided}</p>
        </div>
        
        {/* Section 4: Individual Response */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">4. Individual Response</h2>
          <div className="text-sm space-y-1">
            <p><strong>Engagement/Compliance:</strong> {note.individualResponse?.engagement}</p>
            <p><strong>Affect/Mood:</strong> {note.individualResponse?.mood}</p>
            <p><strong>Communication:</strong> {note.individualResponse?.communication}</p>
            <p><strong>Observed Examples:</strong> {note.individualResponse?.examples}</p>
          </div>
        </div>
        
        {/* Section 5: Progress Toward Outcome */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">5. Progress Toward Outcome</h2>
          <p className="text-sm">{note.progressAssessment}</p>
        </div>
        
        {/* Section 6: Safety and Dignity */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">6. Safety and Dignity</h2>
          <p className="text-sm">{note.safetyDignityNotes}</p>
        </div>
        
        {/* Section 7: Next Steps */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 bg-gray-200 p-2">7. Next Steps</h2>
          <p className="text-sm">{note.nextSteps}</p>
        </div>
        
        {/* Signature */}
        <div className="mt-8 pt-4 border-t-2 border-black">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Staff Signature:</strong></p>
              <div className="border-b border-black mt-4 pb-2">{note.staff.firstName} {note.staff.lastName}</div>
            </div>
            <div>
              <p><strong>Title:</strong></p>
              <div className="border-b border-black mt-4 pb-2">DSP</div>
            </div>
            <div>
              <p><strong>Date:</strong></p>
              <div className="border-b border-black mt-4 pb-2">{new Date(note.serviceDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Print Button Component

**File:** `web-dashboard/components/print/PrintButton.tsx` (NEW)
```typescript
'use client';

import { Printer } from 'lucide-react';

export default function PrintButton({ onClick }: { onClick: () => void }) {
  const handlePrint = () => {
    window.print();
    if (onClick) onClick();
  };
  
  return (
    <button
      onClick={handlePrint}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <Printer className="w-4 h-4" />
      <span>Print Progress Note</span>
    </button>
  );
}
```

---

##  PHASE 4: Testing & Verification

### 4.1 Frontend API Connection Tests

Create test checklist:
- [ ] Audit logs page loads without errors
- [ ] ISP goals display real data from API
- [ ] DSPs see only assigned clients
- [ ] Client assignment page works
- [ ] Progress notes can be printed
- [ ] All 5 print templates render correctly
- [ ] Landlord can view all organizations
- [ ] Admin can allocate clients to DSPs
- [ ] Managers can assign tasks to DSPs

### 4.2 API Endpoint Tests

```bash
# Test audit logs
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/audit-logs

# Test ISP goals
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/isp/goals

# Test client assignments
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/assignments
```

---

##  Implementation Order

1. **IMMEDIATE (Critical Fixes):**
   -  Client-DSP assignment table (DONE)
   -  Migration applied (DONE)
   -  Audit logs controller & routes
   -  ISP goals controller & routes
   -  Client assignment controller & routes

2. **SHORT-TERM (Connect Frontend):**
   - Update ISP goals page to use real API
   - Update audit logs page to use real API
   - Add client assignment UI

3. **MEDIUM-TERM (Features):**
   - Implement DSP filtering in client routes
   - Add landlord features
   - Create print templates

4. **FINAL (Testing):**
   - Test all API endpoints
   - Test all frontend pages
   - Test print functionality
   - User acceptance testing

---

##  Success Criteria

-  No "Request failed" errors on any page
-  ISP goals show real data (not dummy data)
-  DSPs see only their assigned clients
-  Admin/Managers can allocate clients to DSPs
-  Landlord can manage cross-organization DSPs
-  All 5 progress note templates print correctly
-  Professional formatting matches provided document

---

##  Progress Tracking

**Phase 1:**  30% Complete (2/6 items done)  
**Phase 2:**  0% Complete  
**Phase 3:**  0% Complete  
**Phase 4:**  0% Complete  

**Overall:**  7.5% Complete

---

##  Next Steps

After reviewing this plan:
1. Confirm priorities
2. Implement Phase 1 critical fixes
3. Test each component before moving to next
4. Deploy incrementally

**Estimated Development Time:** 4-6 hours  
**Estimated Testing Time:** 1-2 hours  
**Total:** 5-8 hours of focused development
