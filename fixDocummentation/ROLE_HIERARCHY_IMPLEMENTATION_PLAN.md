# Role Hierarchy Implementation Plan

**Date:** February 18, 2026  
**Status:** Ready to Implement  
**Priority:** High - Security & Organizational Structure

---

##  Objective

Implement clear role separation according to organizational hierarchy:

1. **DSP**  Patient Care (no management)
2. **Manager**  Staff Supervision (manages DSPs only)
3. **Admin**  Organization Management (manages tenant)
4. **Super Admin**  Platform Management (manages all tenants)

---

##  Current Issues

### Issue 1: Admin & Manager Permission Overlap 
- Both can create/edit/delete clients (should be admin only)
- Routes use `authorize('manager', 'admin')` too broadly
- Manager should only supervise DSPs, not manage organization

### Issue 2: Admin Sees Wrong Navigation 
- Admin sees "Tenants" page (should be super admin only)
- Admin sees "System Overview" (should be super admin only)
- Need clearer separation in UI

### Issue 3: Missing Manager-Specific Features 
- No dedicated manager dashboard
- No centralized approval page
- No team overview page

---

##  Implementation Steps

### Phase 1: Backend Route Fixes

#### Step 1.1: Client Routes (Organization Management)
**File:** `backend/src/routes/client.routes.ts`

**Current:**
```typescript
// Manager can create/edit/delete clients 
router.post('/', authenticate, authorize('admin', 'manager'), createClient);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateClient);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteClient);
```

**Should Be:**
```typescript
// Admin only - Organization management 
router.post('/', authenticate, requireRole('admin'), createClient);
router.put('/:id', authenticate, requireRole('admin'), updateClient);
router.delete('/:id', authenticate, requireRole('admin'), deleteClient);

// All authenticated users can view (filtered by controller)
router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClientById);
```

#### Step 1.2: Progress Note Routes (Staff Supervision)
**File:** `backend/src/routes/progressNote.routes.ts`

**Current:**
```typescript
// Admin can create notes 
router.post('/', authenticate, authorize('dsp', 'admin'), createNote);

// Admin can approve 
router.post('/:id/approve', authenticate, authorize('manager', 'admin'), approveNote);
```

**Should Be:**
```typescript
// DSP only - Create notes 
router.post('/', authenticate, requireRole('dsp'), createNote);
router.put('/:id', authenticate, requireRole('dsp'), updateNote);
router.post('/:id/submit', authenticate, requireRole('dsp'), submitNote);

// Manager only - Approve DSP work 
router.post('/:id/approve', authenticate, requireManager, approveNote);
router.post('/:id/reject', authenticate, requireManager, rejectNote);

// All can view (filtered by controller)
router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNoteById);
```

#### Step 1.3: Session Routes (Patient Care)
**File:** `backend/src/routes/session.routes.ts`

**Should Be:**
```typescript
// DSP only - Clock in/out 
router.post('/clock-in', authenticate, requireRole('dsp'), clockIn);
router.post('/clock-out', authenticate, requireRole('dsp'), clockOut);
router.post('/', authenticate, requireRole('dsp'), createSession);
router.put('/:id', authenticate, requireRole('dsp'), updateSession);

// Manager can approve 
router.post('/:id/approve', authenticate, requireManager, approveSession);

// All can view their own or team's sessions
router.get('/', authenticate, getSessions);
router.get('/:id', authenticate, getSessionById);
```

#### Step 1.4: Task Routes (Task Assignment)
**File:** `backend/src/routes/task.routes.ts`

**Should Be:**
```typescript
// Manager assigns tasks to DSPs 
router.post('/', authenticate, requireManager, createTask);
router.put('/:id', authenticate, requireManager, updateTask);
router.delete('/:id', authenticate, requireManager, deleteTask);

// DSP completes tasks 
router.post('/:id/complete', authenticate, requireRole('dsp'), completeTask);

// All can view tasks
router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
```

#### Step 1.5: Form Template Routes
**File:** `backend/src/routes/formTemplate.routes.ts`

**Should Be:**
```typescript
// Admin creates templates (organization management) 
router.post('/templates', authenticate, requireRole('admin'), createTemplate);
router.put('/templates/:id', authenticate, requireRole('admin'), updateTemplate);
router.delete('/templates/:id', authenticate, requireRole('admin'), deleteTemplate);

// DSP fills out forms 
router.post('/form-responses', authenticate, requireRole('dsp'), createResponse);
router.put('/form-responses/:id', authenticate, requireRole('dsp'), updateResponse);
router.post('/form-responses/:id/submit', authenticate, requireRole('dsp'), submitResponse);

// Manager approves forms (staff supervision) 
router.post('/form-responses/:id/approve', authenticate, requireManager, approveResponse);
router.post('/form-responses/:id/reject', authenticate, requireManager, rejectResponse);

// All can view
router.get('/templates', authenticate, getTemplates);
router.get('/form-responses', authenticate, getResponses);
```

#### Step 1.6: User Management Routes
**File:** `backend/src/routes/auth.routes.ts` or `backend/src/routes/admin.routes.ts`

**Should Be:**
```typescript
// Admin creates users within organization 
router.post('/users', authenticate, requireRole('admin'), createUser);
router.put('/users/:id', authenticate, requireRole('admin'), updateUser);
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);

// All can view users in their organization
router.get('/users', authenticate, getUsers);
router.get('/users/:id', authenticate, getUserById);
```

#### Step 1.7: Organization Routes
**File:** `backend/src/routes/admin.routes.ts`

**Should Be:**
```typescript
// Admin manages their organization 
router.put('/organization', authenticate, requireRole('admin'), updateOrganization);
router.get('/organization', authenticate, requireRole('admin'), getOrganization);

// Super admin manages all organizations 
router.post('/organizations', authenticate, requireSuperAdmin, createOrganization);
router.get('/organizations', authenticate, requireSuperAdmin, getOrganizations);
router.delete('/organizations/:id', authenticate, requireSuperAdmin, deleteOrganization);
```

---

### Phase 2: Frontend Navigation Fixes

#### Step 2.1: Remove Tenants from Admin View
**File:** `web-dashboard/app/dashboard/layout.tsx`

**Already Fixed:**  (per ROLE_RESTRUCTURING_COMPLETE.md)

#### Step 2.2: Add Manager Section (Future Enhancement)
**Future Files:**
- `web-dashboard/app/dashboard/manager/team/page.tsx`
- `web-dashboard/app/dashboard/manager/approvals/page.tsx`
- `web-dashboard/app/dashboard/manager/performance/page.tsx`

---

### Phase 3: Middleware Updates

#### Step 3.1: Add requireSuperAdmin Middleware
**File:** `backend/src/middleware/auth.ts`

**Add:**
```typescript
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}
```

**Already Have:**
-  `requireAdmin()` - Admin only
-  `requireManager()` - Manager, admin, or super admin
-  `requireRole(...roles)` - Flexible role checker

---

##  Permission Matrix (Target State)

| Action | DSP | Manager | Admin | Super Admin |
|--------|-----|---------|-------|-------------|
| **Patient Care** |
| Create progress notes |  |  |  |  (override) |
| Clock in/out |  |  |  |  (override) |
| Fill out forms |  |  |  |  (override) |
| Complete tasks |  |  |  |  (override) |
| Create incidents |  |  |  |  (override) |
| **Staff Supervision (Manager Only)** |
| Approve progress notes |  |  |  |  (override) |
| Approve forms |  |  |  |  (override) |
| Approve sessions |  |  |  |  (override) |
| Assign tasks to DSPs |  |  |  |  (override) |
| View DSP performance |  |  |  |  |
| Manage DSP schedules |  |  |  |  |
| **Organization Management (Admin Only)** |
| Create/edit/delete clients |  |  |  |  (override) |
| Create/edit/delete users |  |  |  |  (override) |
| Create form templates |  |  |  |  (override) |
| Organization settings |  |  |  |  (override) |
| Support tickets |  |  |  |  (override) |
| Usage metrics |  |  |  |  (override) |
| **Platform Management (Super Admin Only)** |
| View all tenants |  |  |  |  |
| Create organizations |  |  |  |  |
| System overview |  |  |  |  |
| Platform metrics |  |  |  |  |

---

##  Navigation Structure (Target)

### DSP Dashboard
```typescript
[
  'Dashboard',           // Own stats
  'My Clients',          // Assigned clients
  'My Sessions',         // Clock in/out
  'Forms',               // Fill out forms
  'My Tasks',            // Assigned tasks
  'My Schedule',         // Own schedule
  'Notifications'
]
```

### Manager Dashboard
```typescript
[
  'Dashboard',           // Team overview
  'My Team',             // Supervised DSPs
  'Pending Approvals',   // Notes/forms to review
  'All Sessions',        // Monitor DSP sessions
  'Task Management',     // Assign tasks
  'Team Schedules',      // DSP schedules
  'Violations',          // DSP violations
  'Performance Reports'
]
```

### Admin Dashboard
```typescript
[
  'Dashboard',           // Org overview
  'Organization',
     'Settings',       // Org config
     'Users',          // User management
     'Clients',        // Client management
     'Form Templates', // Template builder
  'Support Tickets',     // Org support
  'Usage & Billing',     // Metrics
  'Reports'              // Org analytics
]
```

### Super Admin Dashboard
```typescript
[
  'Dashboard',           // Platform overview
  'Platform Admin',
     'Tenants',        // All organizations
     'System Overview',// Platform metrics
     'Platform Settings'
]
```

---

##  Implementation Checklist

### Backend Routes
- [ ] Fix client routes (admin only)
- [ ] Fix progress note routes (dsp create, manager approve)
- [ ] Fix session routes (dsp clock, manager approve)
- [ ] Fix task routes (manager assigns)
- [ ] Fix form routes (admin template, dsp fill, manager approve)
- [ ] Fix user routes (admin manages)
- [ ] Fix organization routes (admin their org, super admin all)
- [ ] Add requireSuperAdmin middleware

### Frontend UI
- [x] Remove Tenants from admin nav (already done)
- [x] Add super admin section (already done)
- [x] Add isSuperAdmin to User type (already done)
- [ ] Create manager dashboard pages (future)
- [ ] Add admin settings page (future)
- [ ] Add user management page (future)

### Testing
- [ ] Test DSP cannot approve
- [ ] Test DSP cannot create clients
- [ ] Test Manager can approve notes
- [ ] Test Manager cannot create clients
- [ ] Test Admin can create clients
- [ ] Test Admin cannot see Tenants
- [ ] Test Super admin can see everything

---

##  Execution Order

1. **Add requireSuperAdmin middleware** (safety first)
2. **Fix client routes** (highest risk - organization management)
3. **Fix progress note routes** (core workflow)
4. **Fix session routes** (patient care)
5. **Fix task routes** (task management)
6. **Fix form routes** (approval workflow)
7. **Fix user/org routes** (admin features)
8. **Test all role boundaries**

---

##  Files to Modify

### Backend (7 files):
1. `backend/src/middleware/auth.ts` - Add requireSuperAdmin
2. `backend/src/routes/client.routes.ts` - Admin only
3. `backend/src/routes/progressNote.routes.ts` - DSP/Manager separation
4. `backend/src/routes/session.routes.ts` - DSP/Manager separation
5. `backend/src/routes/task.routes.ts` - Manager assigns
6. `backend/src/routes/formTemplate.routes.ts` - Clear role separation
7. `backend/src/routes/admin.routes.ts` - Admin vs Super Admin

### Frontend (Already Fixed):
1.  `web-dashboard/app/dashboard/layout.tsx` - Navigation separation
2.  `web-dashboard/contexts/AuthContext.tsx` - isSuperAdmin type

---

##  Breaking Changes

**None** - These changes only restrict permissions, they don't break existing functionality. Users with proper permissions will continue to work as expected.

---

##  Expected Outcome

After implementation:
-  DSPs focus only on patient care
-  Managers focus only on supervising DSPs
-  Admins focus only on managing their organization
-  Super admins focus on platform management
-  Zero permission overlap
-  Clear, intuitive role boundaries
-  Enhanced security posture

---

*Ready to implement - All changes planned and documented*
