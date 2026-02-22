# Role Separation Implementation Plan

## Overview
Implementing proper role separation based on user feedback to ensure clear responsibilities for each role level.

## Role Definitions and Responsibilities

### 1. Super Admin
**Primary Focus:** Platform-level management and oversight
- **Tenant Management:** Create, edit, and manage all tenant organizations
- **Support Tickets:** Handle system-wide support requests from all organizations
- **Auditing:** View system-wide logs and audit trails across all tenants
- **Records Management:** Access to all platform-level records and metrics
- **Usage Metrics:** Monitor resource usage across all tenants
- **NO ACCESS TO:** Day-to-day operations, client care, schedules

**Pages:**
- `/dashboard/admin/overview` - System overview and metrics
- `/dashboard/admin/tenants` - Tenant management
- `/dashboard/admin/tickets` - Support ticket system
- `/dashboard/admin/audit` - System audit logs (to be created)
- `/dashboard/admin/records` - Platform-wide records (to be created)

### 2. Admin (Organization Admin)
**Primary Focus:** Organizational management and oversight
- **Auditing:** View organization-specific logs and audit trails
- **Records Management:** Manage organization documents and compliance records
- **Manager Setup:** Create and manage manager accounts
- **DSP Allocation:** Assign DSPs to managers  
- **Resource Management:** Manage organizational resources and settings
- **Reports:** Generate compliance and operational reports
- **NO ACCESS TO:** Direct schedule creation, direct client goal setting

**Pages:**
- `/dashboard/admin/audit` - Organization audit logs
- `/dashboard/admin/managers` - Manager management
- `/dashboard/admin/dsps` - DSP allocation and management
- `/dashboard/admin/resources` - Resource management
- `/dashboard/admin/records` - Records management
- `/dashboard/admin/compliance` - Compliance reporting

### 3. Manager
**Primary Focus:** Team and client service coordination
- **Schedule Management:** Create and assign schedules to DSPs (with calendar interface)
- **Goal Assignment:** Assign ISP goals and activities to clients
- **DSP Supervision:** Monitor DSP performance and tasks
- **Activity Management:** Assign and track client activities
- **Client Oversight:** Monitor client progress and service delivery
- **Reports:** Generate team performance reports
- **NO ACCESS TO:** Platform administration, tenant management

**Pages:**
- `/dashboard/manager/schedule` - Interactive calendar for DSP scheduling
- `/dashboard/manager/goals` - Assign goals and activities to clients
- `/dashboard/manager/team` - DSP team management
- `/dashboard/manager/clients` - Client oversight
- `/dashboard/manager/activities` - Activity assignment and tracking
- `/dashboard/manager/reports` - Team performance reports

### 4. DSP (Direct Support Professional)
**Primary Focus:** Direct client care and service delivery
- **My Schedule:** View assigned schedules
- **Tasks:** View and complete assigned tasks
- **Clients:** Access assigned client information
- **Forms:** Complete progress notes and incident reports
- **Sessions:** Document service sessions
- **NO ACCESS TO:** Creating schedules, managing other staff, administrative functions

**Pages:**
- `/dashboard` - Personal dashboard
- `/dashboard/schedules` - View only
- `/dashboard/tasks` - Task management
- `/dashboard/clients` - Assigned clients only
- `/forms` - Form submissions
- `/dashboard/sessions` - Session documentation

## Implementation Steps

### Phase 1: Manager Pages (IN PROGRESS)
- [x] Create `/dashboard/manager/schedule` with calendar functionality
- [x] Add API methods for user management
- [ ] Create `/dashboard/manager/goals` for goal assignment
- [ ] Create `/dashboard/manager/team` for DSP management
- [ ] Update navigation to show manager-specific menu items

### Phase 2: Admin Pages Enhancement
- [ ] Update admin pages to remove direct operations
- [ ] Create manager management page
- [ ] Create DSP allocation page
- [ ] Create resource management page
- [ ] Create audit log viewer

### Phase 3: Super Admin Pages Refinement
- [ ] Limit super admin to platform-level only
- [ ] Remove operational access
- [ ] Enhance tenant metrics and monitoring
- [ ] Add platform-wide audit capabilities

### Phase 4: Backend Access Control
- [ ] Update middleware to enforce role-based route access
- [ ] Add role checks to controllers
- [ ] Create admin/users routes for user management
- [ ] Test all permission boundaries

### Phase 5: Testing
- [ ] Test manager schedule creation
- [ ] Test goal assignment workflow
- [ ] Test admin cannot create schedules directly
- [ ] Test super admin isolation from operations
- [ ] Test DSP view-only access

## Key Features

### Manager Schedule Calendar
- Interactive month view calendar
- Click on any day to assign schedule
- Select DSP from dropdown
- Optional client assignment
- Set shift type (work, training, meeting, time_off)
- Set time range
- Add location and notes

### Manager Goal Assignment
- Select client
- Create ISP goals
- Add activities under each goal
- Assign DSPs to activities
- Set target dates and milestones
- Track progress

### Admin Manager Setup
- Create manager accounts
- Assign managers to teams
- Allocate DSPs to managers
- Set permissions and access levels

## Database Considerations
- Schedule table: Links users (DSPs) to shifts
- ISP Goals: Links to clients with activities
- User management: Proper role hierarchies
- Audit logs: Track all administrative actions

## Security & Access Control
- Middleware enforces role-based access
- Controllers validate user permissions
- Frontend hides unauthorized UI elements
- Backend rejects unauthorized API calls

## Status
- **Manager Schedule Page:**  Created with calendar interface
- **API Methods:**  Added to api.ts
- **Goal Assignment:**  In Progress
- **Admin Updates:**  Pending
- **Backend Routes:**  Pending
