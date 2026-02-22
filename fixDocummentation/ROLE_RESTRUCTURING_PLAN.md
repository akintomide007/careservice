# Role-Based Access Control Restructuring Plan

## Executive Summary
This document outlines the necessary changes to properly align the Care Provider System's role-based access control with the organizational hierarchy:
- **DSP**: Direct service providers (patient care)
- **Manager**: Staff supervisors (manage DSPs)
- **Admin**: Tenant administrators (manage organization)
- **Super Admin**: Platform administrators (manage multiple tenants)

---

## Current State Analysis

### Role Permission Overlap (Issues Found)

#### Issue #1: Admin & Manager Permissions Too Similar
**Problem:** Many routes allow both admin and manager access, creating confusion about responsibilities.

**Current Code:**
```typescript
// routes/client.routes.ts
router.post('/', authenticate, authorize('admin', 'manager'), createClient);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateClient);
router.delete('/:id', authenticate, authorize('admin'), deleteClient);
```

**Result:** Managers can create/edit clients (should be admin-only function)

---

#### Issue #2: Admin Sees Wrong Dashboard Pages
**Problem:** Admin navigation shows tenant management pages that should be super admin only.

**Current Code:**
```typescript
// web-dashboard/app/dashboard/layout.tsx
const adminNavigation = [
  { name: 'System Overview', href: '/dashboard/admin/overview' },  //  Super admin only
  { name: 'Tenants', href: '/dashboard/admin/tenants' },           //  Super admin only
  { name: 'Support Tickets', href: '/dashboard/admin/tickets' },   //  Correct
];

const isAdminUser = user?.role === 'admin';  // Shows all to admin
```

**Result:** Admins see tenant management (multi-tenant features) when they should only manage their own organization.

---

#### Issue #3: requireAdmin Middleware Allows Managers
**Problem:** The `requireAdmin` middleware also allows managers, not just admins.

**Current Code:**
```typescript
// backend/src/middleware/auth.ts
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && 
      req.user.role !== 'manager' &&  //  Manager shouldn't have admin access
      !req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

**Result:** Managers get admin-level access to some features.

---

#### Issue #4: No Clear Manager-Specific Features
**Problem:** No dedicated manager dashboard or supervision tools.

**Current State:**
- No `/dashboard/manager/` pages
- No "Team Overview" for managers
- No "Pending Approvals" centralized page
- Manager features mixed with admin features

---

## Correct Role Hierarchy

### DSP (Direct Support Professional)
**Primary Function:** Provide direct care to clients

**Permissions:**
-  Clock in/out with clients
-  Create progress notes
-  Create incident reports
-  Fill out forms
-  View assigned clients only
-  View own tasks
-  View own schedule
-  No approval rights
-  Cannot view other DSPs' data
-  No management access

**Dashboard Access:**
- Personal dashboard with own stats
- My Clients (assigned only)
- My Sessions
- Forms
- My Tasks
- My Schedule
- Notifications

---

### Manager
**Primary Function:** Supervise DSP staff and approve their work

**Permissions:**
-  **Approve/reject** progress notes from DSPs
-  **Approve/reject** forms from DSPs
-  **Approve/reject** appointment requests
-  View all DSP sessions
-  Assign tasks to DSPs
-  Manage DSP schedules
-  Review violations
-  View incident reports
-  Team performance reports
-  Cannot create/delete clients
-  Cannot manage organization settings
-  Cannot manage users
-  Cannot access admin features

**Dashboard Access:**
- Team overview dashboard
- Team Members (DSPs)
- Pending Approvals (centralized)
- All Sessions (monitoring)
- Task Assignment
- Team Schedules
- Violations Review
- Team Reports

---

### Admin
**Primary Function:** Manage organization/tenant

**Permissions:**
-  **Create/edit/delete** clients
-  **Manage** users (DSPs and Managers)
-  Configure organization settings
-  Manage support tickets
-  View usage metrics
-  Billing management
-  Organization reports
-  Cannot manage other tenants
-  Cannot create organizations
-  Limited to own organization

**Dashboard Access:**
- Organization overview
- Organization Settings
- User Management
- Client Management
- Support Tickets
- Usage & Billing
- Reports & Analytics

---

### Super Admin
**Primary Function:** Manage multi-tenant platform

**Permissions:**
-  Create/manage organizations (tenants)
-  View all organizations
-  System-wide metrics
-  Platform configuration
-  Cross-tenant access for support

**Dashboard Access:**
- System Overview
- Tenant Management
- Platform Metrics
- All Support Tickets

---

## Implementation Plan

### Phase 1: Backend Route Restructuring

#### 1.1 Update Middleware
**File:** `backend/src/middleware/auth.ts`

**Changes:**
```typescript
// Remove manager from requireAdmin
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && !req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Add new requireManager middleware
export function requireManager(req, res, next) {
  if (req.user.role !== 'manager' && 
      req.user.role !== 'admin' && 
      !req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Manager access required' });
  }
  next();
}

// Add requireRole helper
export function requireRole(...roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

#### 1.2 Update Client Routes
**File:** `backend/src/routes/client.routes.ts`

**Current:**
```typescript
router.post('/', authenticate, authorize('admin', 'manager'), createClient);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateClient);
router.delete('/:id', authenticate, authorize('admin'), deleteClient);
```

**Fixed:**
```typescript
// Admin only - client management is org administration
router.post('/', authenticate, requireRole('admin'), createClient);
router.put('/:id', authenticate, requireRole('admin'), updateClient);
router.delete('/:id', authenticate, requireRole('admin'), deleteClient);

// All authenticated users can view
router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClient);
```

#### 1.3 Update Progress Note Routes
**File:** `backend/src/routes/progressNote.routes.ts`

**Current:**
```typescript
router.post('/', authenticate, authorize('dsp', 'admin'), createNote);
router.post('/:id/approve', authenticate, authorize('manager', 'admin'), approveNote);
```

**Fixed:**
```typescript
// DSP creates notes
router.post('/', authenticate, requireRole('dsp'), createNote);
router.put('/:id', authenticate, requireRole('dsp'), updateNote);
router.post('/:id/submit', authenticate, requireRole('dsp'), submitNote);

// Manager approves (not admin - admin manages org, not staff)
router.post('/:id/approve', authenticate, requireRole('manager'), approveNote);

// Managers and admins can view all
router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNote);
```

#### 1.4 Update Form Routes  
**File:** `backend/src/routes/formTemplate.routes.ts`

**Current:**
```typescript
router.post('/form-responses/:id/approve', authorize('manager', 'admin'), approveResponse);
```

**Fixed:**
```typescript
// Manager approves DSP work
router.post('/form-responses/:id/approve', authenticate, requireRole('manager'), approveResponse);
```

#### 1.5 Update Session Routes
**File:** `backend/src/routes/session.routes.ts`

**Current:**
```typescript
router.post('/clock-in', authenticate, authorize('dsp', 'admin'), clockIn);
router.post('/clock-out', authenticate, authorize('dsp', 'admin'), clockOut);
router.get('/all', authenticate, authorize('manager', 'admin'), getAllSessions);
```

**Fixed:**
```typescript
// Only DSP clocks in/out (frontline staff)
router.post('/clock-in', authenticate, requireRole('dsp'), clockIn);
router.post('/clock-out', authenticate, requireRole('dsp'), clockOut);

// DSP views own sessions
router.get('/active', authenticate, requireRole('dsp'), getActive);
router.get('/history', authenticate, requireRole('dsp'), getHistory);

// Manager monitors all sessions
router.get('/all', authenticate, requireRole('manager'), getAllSessions);
```

#### 1.6 Update Support Routes
**File:** `backend/src/routes/support.routes.ts`

**Current:**
```typescript
router.put('/tickets/:id', requireAdmin, updateTicket);  // Allows managers
```

**Fixed:**
```typescript
// Admin manages org support tickets
router.put('/tickets/:id', requireAuth, requireRole('admin'), updateTicket);
router.post('/tickets/:id/assign', requireAuth, requireRole('admin'), assignTicket);
router.post('/tickets/:id/resolve', requireAuth, requireRole('admin'), resolveTicket);
```

---

### Phase 2: Frontend UI Restructuring

#### 2.1 Update Dashboard Layout
**File:** `web-dashboard/app/dashboard/layout.tsx`

**Current:**
```typescript
const isAdminUser = user?.role === 'admin';

{isAdminUser && (
  <>
    <div>Administration</div>
    {adminNavigation.map(...)}  // Shows Tenants, System Overview
  </>
)}
```

**Fixed:**
```typescript
const isManager = user?.role === 'manager';
const isAdmin = user?.role === 'admin';
const isSuperAdmin = user?.isSuperAdmin;

// Manager Section
{isManager && (
  <>
    <div>Team Management</div>
    {managerNavigation.map(...)}
  </>
)}

// Admin Section
{isAdmin && (
  <>
    <div>Organization</div>
    {adminNavigation.map(...)}
  </>
)}

// Super Admin Section
{isSuperAdmin && (
  <>
    <div>Platform Admin</div>
    {superAdminNavigation.map(...)}
  </>
)}
```

#### 2.2 Define New Navigation Arrays
```typescript
// DSP Navigation (default for all users)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarCheck },
  { name: 'Forms', href: '/forms', icon: ClipboardList },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'My Schedule', href: '/dashboard/schedules', icon: Calendar },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

// Manager-specific navigation
const managerNavigation = [
  { name: 'Team Overview', href: '/dashboard/manager/team', icon: Users },
  { name: 'Pending Approvals', href: '/dashboard/manager/approvals', icon: CheckSquare },
  { name: 'Task Assignment', href: '/dashboard/manager/tasks', icon: ClipboardList },
  { name: 'Team Schedules', href: '/dashboard/manager/schedules', icon: Calendar },
  { name: 'Performance', href: '/dashboard/manager/performance', icon: BarChart3 },
];

// Admin-specific navigation
const adminNavigation = [
  { name: 'Organization', href: '/dashboard/admin/settings', icon: Building2 },
  { name: 'Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'Clients', href: '/dashboard/admin/clients', icon: Users },
  { name: 'Support', href: '/dashboard/admin/tickets', icon: Ticket },
  { name: 'Usage', href: '/dashboard/admin/usage', icon: Activity },
];

// Super Admin navigation
const superAdminNavigation = [
  { name: 'System Overview', href: '/dashboard/admin/overview', icon: Shield },
  { name: 'Tenants', href: '/dashboard/admin/tenants', icon: Building2 },
  { name: 'Platform Metrics', href: '/dashboard/admin/metrics', icon: BarChart3 },
];
```

#### 2.3 Create Manager Pages
**New Pages Needed:**
- `/web-dashboard/app/dashboard/manager/team/page.tsx` - Team overview
- `/web-dashboard/app/dashboard/manager/approvals/page.tsx` - Centralized approval queue
- `/web-dashboard/app/dashboard/manager/tasks/page.tsx` - Task assignment
- `/web-dashboard/app/dashboard/manager/schedules/page.tsx` - Team schedule management
- `/web-dashboard/app/dashboard/manager/performance/page.tsx` - Team performance reports

#### 2.4 Update Dashboard Main Page
**File:** `web-dashboard/app/dashboard/page.tsx`

**Add Role-Specific Views:**
```typescript
// Show different dashboard based on role
{user?.role === 'dsp' && <DSPDashboard />}
{user?.role === 'manager' && <ManagerDashboard />}
{user?.role === 'admin' && <AdminDashboard />}
{user?.isSuperAdmin && <SuperAdminDashboard />}
```

---

### Phase 3: Database & Seeding Updates

#### 3.1 Update Seed Data
**File:** `backend/prisma/seed.ts`

Ensure test accounts reflect correct roles:
```typescript
// Demo Organization Users
- admin@careservice.com    // Admin (org management)
- manager@careservice.com  // Manager (supervise DSPs)
- dsp@careservice.com      // DSP (direct care)

// Note: Super admin created separately
- superadmin@platform.com  // Super Admin (platform level)
```

---

### Phase 4: Documentation Updates

#### 4.1 Update ROLE_BASED_ACCESS_CONTROL.md
- Clarify manager vs admin distinction
- Add manager-specific features
- Update permission matrix

#### 4.2 Create New Documentation
- **MANAGER_GUIDE.md** - Guide for managers on supervising DSPs
- **ADMIN_GUIDE.md** - Guide for admins on managing organization

---

## Priority Changes (Quick Wins)

### High Priority (Implement First):
1.  Remove "Tenants" from admin navigation (show only to super admin)
2.  Update requireAdmin to not allow managers
3.  Fix client creation routes (admin only)
4.  Fix approval routes (manager only, not admin)

### Medium Priority:
5. Create manager approval dashboard
6. Add requireManager middleware
7. Update all route authorizations
8. Create manager-specific pages

### Low Priority:
9. Separate manager/admin dashboards completely
10. Add team performance metrics
11. Enhanced reporting per role

---

## Testing Checklist

### Backend Testing:
- [ ] DSP cannot approve forms (403 Forbidden)
- [ ] DSP cannot create clients (403 Forbidden)
- [ ] Manager can approve forms (200 OK)
- [ ] Manager cannot create clients (403 Forbidden)
- [ ] Admin can create clients (200 OK)
- [ ] Admin cannot manage tenants (403 Forbidden)
- [ ] Super admin can manage tenants (200 OK)

### Frontend Testing:
- [ ] DSP sees only DSP navigation
- [ ] Manager sees team management section
- [ ] Admin sees organization section (no Tenants)
- [ ] Super admin sees platform section (with Tenants)
- [ ] Approve buttons only visible to managers
- [ ] Client management only visible to admins

---

## Migration Strategy

### Step 1: Backend (No Breaking Changes)
1. Add new middleware functions
2. Update route authorizations
3. Deploy backend
4. Test with existing frontend

### Step 2: Frontend Quick Fixes
1. Hide "Tenants" from admin view
2. Show to super admin only
3. Deploy frontend

### Step 3: Manager Features
1. Create manager pages
2. Add manager navigation
3. Deploy incrementally

### Step 4: Polish
1. Separate dashboards
2. Add analytics
3. Documentation

---

## Rollback Plan

If issues occur:
1. Middleware changes are backward compatible
2. Frontend can be rolled back independently
3. Route changes preserve existing functionality
4. No database changes required

---

## Timeline Estimate

- **Phase 1 (Backend)**: 4-6 hours
- **Phase 2 (Frontend Quick Fixes)**: 2-3 hours
- **Phase 3 (Manager Pages)**: 6-8 hours
- **Phase 4 (Documentation)**: 2 hours

**Total**: 2-3 days for complete implementation

---

## Success Metrics

### Clarity:
-  Each role has distinct, non-overlapping permissions
-  UI clearly shows what each role can do
-  No confusion about admin vs manager

### Security:
-  DSPs cannot approve anything
-  Managers cannot manage organization
-  Admins cannot manage other tenants
-  All actions properly authorized

### Usability:
-  Managers have efficient supervision tools
-  Admins have clear org management interface
-  DSPs have simple, focused UI

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize changes** (high/medium/low)
3. **Begin implementation** with Phase 1
4. **Test thoroughly** at each phase
5. **Deploy incrementally** to minimize risk

---

*Document created: February 18, 2026*
*Status: Awaiting approval for implementation*
