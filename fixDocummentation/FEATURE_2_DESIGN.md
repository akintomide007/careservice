# Feature 2: Admin Tenant Management Portal - Design

## Overview
A comprehensive super admin interface for managing multiple care organizations (tenants), handling support tickets, monitoring system health, and tracking usage metrics.

---

## User Story

**As a Super Admin**, I want to:
- Onboard new care organizations with a guided wizard
- Manage all tenant accounts and their settings
- Handle support tickets and issues from tenants
- Monitor system usage and health metrics
- Track billing and subscription status
- Deactivate or suspend problematic tenants

---

## Database Schema

### 1. SupportTicket Model
```prisma
model SupportTicket {
  id                String          @id @default(uuid())
  organizationId    String
  title             String
  description       String
  priority          String          // low, medium, high, critical
  status            String          // open, in_progress, resolved, closed
  category          String          // technical, billing, feature_request, other
  reportedBy        String          // User ID
  assignedTo        String?         // Admin user ID
  resolution        String?
  attachments       Json?
  createdAt         DateTime
  updatedAt         DateTime
  resolvedAt        DateTime?
  
  organization      Organization
  reporter          User
  assignee          User?
  comments          TicketComment[]
}

model TicketComment {
  id                String          @id @default(uuid())
  ticketId          String
  userId            String
  comment           String
  isInternal        Boolean         // Only visible to admins
  createdAt         DateTime
  
  ticket            SupportTicket
  user              User
}
```

### 2. UsageMetric Model
```prisma
model UsageMetric {
  id                String          @id @default(uuid())
  organizationId    String
  metricType        String          // users, clients, sessions, storage_mb, api_calls
  value             Int
  recordedAt        DateTime
  
  organization      Organization
}
```

### 3. Update Organization Model
Add fields:
```prisma
model Organization {
  // ... existing fields
  billingStatus     String          @default("active") // active, suspended, cancelled
  billingEmail      String?
  subscriptionStart DateTime?
  subscriptionEnd   DateTime?
  lastActivityAt    DateTime?
  totalUsers        Int             @default(0)
  totalClients      Int             @default(0)
  storageUsedMB     Int             @default(0)
}
```

---

## API Endpoints

### Tenant Management
- `POST /api/admin/organizations` - Create new tenant
- `GET /api/admin/organizations` - List all tenants
- `GET /api/admin/organizations/:id` - Get tenant details
- `PUT /api/admin/organizations/:id` - Update tenant settings
- `POST /api/admin/organizations/:id/suspend` - Suspend tenant
- `POST /api/admin/organizations/:id/activate` - Activate tenant
- `DELETE /api/admin/organizations/:id` - Delete tenant (soft delete)

### Support Tickets
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets` - List tickets (filtered)
- `GET /api/support/tickets/:id` - Get ticket details
- `PUT /api/support/tickets/:id` - Update ticket
- `POST /api/support/tickets/:id/assign` - Assign to admin
- `POST /api/support/tickets/:id/resolve` - Mark resolved
- `POST /api/support/tickets/:id/comments` - Add comment

### Usage Metrics
- `GET /api/admin/metrics/overview` - System-wide metrics
- `GET /api/admin/metrics/:orgId` - Organization metrics
- `POST /api/admin/metrics/record` - Record metric (automated)

---

## Frontend Pages

### 1. Admin Dashboard (`/admin`)
- Total tenants overview
- Active/suspended/cancelled breakdown
- Recent support tickets
- System health indicators
- Revenue metrics

### 2. Tenants List (`/admin/tenants`)
- Searchable/filterable table
- Tenant status indicators
- Quick actions (suspend, view, edit)
- Usage summaries
- Onboard new tenant button

### 3. Tenant Detail (`/admin/tenants/:id`)
- Organization info
- Users list
- Clients list
- Subscription details
- Usage charts
- Support tickets
- Activity log
- Settings panel

### 4. Tenant Onboarding (`/admin/tenants/new`)
**Step 1: Organization Info**
- Organization name
- Subdomain (auto-validate availability)
- Primary contact name/email
- Phone number

**Step 2: Subscription Plan**
- Basic / Professional / Enterprise
- User limits
- Client limits
- Storage limits
- Feature toggles

**Step 3: Branding**
- Upload logo
- Primary color
- Custom domain (optional)

**Step 4: Initial Admin**
- Create first admin user
- Set password
- Send welcome email

**Step 5: Confirmation**
- Review all settings
- Create organization
- Redirect to tenant dashboard

### 5. Support Tickets (`/admin/support`)
- All tickets list
- Filter by status/priority/category
- Assign tickets to admins
- Add internal notes
- Resolve tickets

---

## Security & Access Control

### Super Admin Role
- Add `isSuperAdmin` boolean to User model
- Only super admins can access `/admin/*` routes
- Separate middleware: `requireSuperAdmin()`

### Tenant Isolation
- Super admins can impersonate tenants for support
- Audit trail for all admin actions
- Separate admin auth context

---

## Implementation Tasks

1. **Database Updates**
   - Add SupportTicket model
   - Add TicketComment model
   - Add UsageMetric model
   - Update Organization model
   - Add isSuperAdmin to User model
   - Run migrations

2. **Backend Services**
   - organizationAdmin.service.ts
   - supportTicket.service.ts
   - usageMetric.service.ts

3. **Backend Controllers**
   - organizationAdmin.controller.ts
   - supportTicket.controller.ts
   - usageMetric.controller.ts

4. **Backend Routes**
   - admin.routes.ts
   - support.routes.ts

5. **Frontend Pages**
   - /admin/page.tsx (dashboard)
   - /admin/tenants/page.tsx (list)
   - /admin/tenants/new/page.tsx (onboarding wizard)
   - /admin/tenants/[id]/page.tsx (detail)
   - /admin/support/page.tsx (tickets)

6. **Frontend Components**
   - TenantCard
   - OnboardingWizard
   - TicketList
   - MetricsChart
   - UsageGauge

---

## Metrics to Track

### Per Organization:
- Total users (active/inactive)
- Total clients (active/inactive)
- Storage used (MB)
- API calls (last 30 days)
- Active sessions
- Progress notes submitted
- Incidents reported
- Last activity timestamp

### System-Wide:
- Total organizations
- Total users across all orgs
- Total clients across all orgs
- Total storage used
- API calls (daily/monthly)
- Error rate
- Average response time

---

## Billing Integration (Future)

### Subscription Plans
```typescript
interface SubscriptionPlan {
  name: 'basic' | 'professional' | 'enterprise';
  price: number;
  interval: 'monthly' | 'yearly';
  limits: {
    maxUsers: number;
    maxClients: number;
    storageMB: number;
    features: string[];
  };
}
```

### Payment Processing (Placeholder)
- Stripe integration (future)
- Invoice generation
- Payment history
- Automatic suspension on failed payment

---

## Notifications

### For Tenants:
- Welcome email on onboarding
- Subscription renewal reminders
- Usage limit warnings (80%, 90%, 100%)
- Support ticket updates

### For Admins:
- New tenant signups
- Critical support tickets
- System health alerts
- Usage anomalies

---

## Timeline Estimate

- **Database Schema**: 2 hours
- **Backend Implementation**: 6 hours
- **Frontend Pages**: 8 hours
- **Testing**: 2 hours
- **Total**: 18-20 hours

---

## Success Criteria

 Super admins can onboard new tenants via wizard
 Super admins can view all tenants with metrics
 Super admins can suspend/activate tenants
 Support ticket system works end-to-end
 Usage metrics are tracked and displayed
 Tenant isolation remains intact
 Audit trail for admin actions

---

**Status**: Design Complete - Ready for Implementation
**Next Step**: Update database schema and create models
