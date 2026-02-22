# Role Hierarchy Fix - Implementation Plan

**Date:** 2026-02-21
**Status:** In Progress

##  Goal
Implement proper role separation with correct management hierarchy:

```
Landlord  Only manages Tenants (Organizations), Audit Logs, Records
Admin  Assigns DSPs to Managers
Manager  Assigns Clients to DSPs
DSP  Works with assigned clients only
```

##  Completed

1. **Database Schema**
   -  Added `DspManagerAssignment` table
   -  Migration successful: `20260221224547_add_dsp_manager_assignments`
   -  `ClientDspAssignment` table already exists (from earlier)

##  In Progress

### Backend Tasks

1. **DSP-Manager Assignment API** (NEW)
   - Create `backend/src/controllers/dspManagerAssignment.controller.ts`
   - Endpoints needed:
     - `GET /api/admin/dsp-manager-assignments` - List all (Admin only)
     - `POST /api/admin/dsp-manager-assignments` - Assign DSP to Manager (Admin)
     - `DELETE /api/admin/dsp-manager-assignments/:id` - Remove assignment (Admin)
     - `GET /api/manager/my-dsps` - Get manager's assigned DSPs
   - Add routes to `backend/src/routes/admin.routes.ts`

2. **Update Manager's Client Assignment**
   - Modify `/api/assignments` to only show DSPs assigned to the manager
   - Manager should only see their own DSPs when assigning clients

### Frontend Tasks

1. **Simplify Landlord Dashboard**
   - File: `web-dashboard/components/dashboards/LandlordDashboard.tsx`
   - Remove: Support tickets section
   - Remove: Usage metrics (too detailed)
   - Keep only:
     - Organizations list (with manage button)
     - Audit logs summary
     - Records/Reports access
     - Platform health
   
2. **Update Admin Dashboard**
   - File: `web-dashboard/components/dashboards/AdminDashboard.tsx`
   - Add new section: "DSP Allocation to Managers"
   - Shows table of DSPs and their assigned managers
   - Add/Remove DSP-Manager assignments
   - Keep existing "DSP Allocation" (for client assignments)

3. **Update Manager Dashboard**
   - File: `web-dashboard/components/dashboards/ManagerDashboard.tsx`
   - When assigning clients, only show DSPs assigned to this manager
   - Filter DSP list by manager assignment

##  Implementation Steps

### Step 1: Create DSP-Manager Assignment Controller

```typescript
// backend/src/controllers/dspManagerAssignment.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dspManagerAssignmentController = {
  // GET /api/admin/dsp-manager-assignments
  async getAssignments(req: AuthRequest, res: Response) {
    const organizationId = req.user!.organizationId;
    
    const assignments = await prisma.dspManagerAssignment.findMany({
      where: { isActive: true },
      include: {
        // Get DSP and Manager details
      }
    });
    
    // Filter by organization
    return res.json(assignments);
  },

  // POST /api/admin/dsp-manager-assignments
  async createAssignment(req: AuthRequest, res: Response) {
    const { dspId, managerId, notes } = req.body;
    const assignedBy = req.user!.userId;
    
    // Verify DSP and Manager are in same organization
    // Create assignment
    
    return res.status(201).json(assignment);
  },

  // DELETE /api/admin/dsp-manager-assignments/:id
  async removeAssignment(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    // Set isActive to false
    
    return res.status(204).send();
  },

  // GET /api/manager/my-dsps
  async getManagerDsps(req: AuthRequest, res: Response) {
    const managerId = req.user!.userId;
    
    const assignments = await prisma.dspManagerAssignment.findMany({
      where: {
        managerId,
        isActive: true
      }
    });
    
    return res.json(dsps);
  }
};
```

### Step 2: Add Routes

```typescript
// In backend/src/routes/admin.routes.ts
import { dspManagerAssignmentController } from '../controllers/dspManagerAssignment.controller';

router.get('/dsp-manager-assignments', requireAuth, requireRole('admin'), 
  dspManagerAssignmentController.getAssignments);
router.post('/dsp-manager-assignments', requireAuth, requireRole('admin'),
  dspManagerAssignmentController.createAssignment);
router.delete('/dsp-manager-assignments/:id', requireAuth, requireRole('admin'),
  dspManagerAssignmentController.removeAssignment);

// In a manager routes file or admin routes
router.get('/manager/my-dsps', requireAuth, requireRole('manager'),
  dspManagerAssignmentController.getManagerDsps);
```

### Step 3: Update Frontend Dashboards

**Landlord Dashboard - Simplified:**
- Platform Health Status
- Total Organizations Count
- Tenants List with Search/Filter
- Quick Links: Audit Logs, Records, Tickets

**Admin Dashboard - Add DSP Management:**
```tsx
// New section
<div className="bg-white rounded-xl shadow-md p-6">
  <h2>DSP to Manager Assignments</h2>
  <table>
    <thead>
      <tr>
        <th>DSP Name</th>
        <th>Assigned Manager</th>
        <th>Start Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {assignments.map(assignment => (
        <tr key={assignment.id}>
          <td>{assignment.dsp.name}</td>
          <td>{assignment.manager.name}</td>
          <td>{assignment.startDate}</td>
          <td>
            <button onClick={() => removeAssignment(assignment.id)}>
              Remove
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <button onClick={() => setShowAssignModal(true)}>
    + Assign DSP to Manager
  </button>
</div>
```

**Manager Dashboard - Filter DSPs:**
```tsx
// When showing client assignment modal
const { data: availableDsps } = useSWR('/api/manager/my-dsps');

// Only show DSPs assigned to this manager
```

##  Key Points

1. **Admin assigns DSPs to Managers** - New functionality
2. **Manager assigns Clients to DSPs** - Already exists, just filter by assigned DSPs
3. **Landlord only manages organizations** - Simplified dashboard
4. **DSP sees only assigned clients** - Already implemented

##  Testing Checklist

- [ ] Admin can assign DSP to Manager
- [ ] Admin can remove DSP from Manager
- [ ] Manager can see their assigned DSPs
- [ ] Manager can only assign clients to their DSPs
- [ ] Manager cannot assign clients to unassigned DSPs
- [ ] Landlord dashboard shows only tenants/audit/records
- [ ] DSP still only sees assigned clients

##  Current Status

- [x] Schema updated
- [x] Migration complete  
- [ ] Backend API (in progress)
- [ ] Frontend updates (pending)
- [ ] Testing (pending)

---

**Next immediate task:** Create `dspManagerAssignment.controller.ts`
