# Multi-Tenant Architecture Design

## Overview
This document outlines the multi-tenant architecture for the Care Provider System, enabling multiple independent care organizations to use the system with complete data isolation.

## Architecture Approach: **Row-Level Tenancy**

We're using a **single database, row-level isolation** approach where:
- One shared database for all tenants
- Each table has an `organizationId` foreign key
- All queries automatically filter by tenant
- Complete data isolation between organizations
- Cost-effective and scalable

### Alternative Approaches (Not Chosen)
-  **Database per Tenant**: Too expensive, hard to maintain
-  **Schema per Tenant**: Complex migrations, limited scalability

---

## Database Schema Changes

### New Tables

#### 1. Organization (Tenant)
```prisma
model Organization {
  id                String    @id @default(uuid())
  name              String
  subdomain         String    @unique  // e.g., "acme-care"
  domain            String?              // Custom domain e.g., "care.acme.com"
  logo              String?
  primaryColor      String?   @default("#3B82F6")
  isActive          Boolean   @default(true)
  plan              String    @default("basic") // "basic", "professional", "enterprise"
  maxUsers          Int       @default(50)
  maxClients        Int       @default(100)
  settings          Json?     // Organization-specific settings
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  users             User[]
  clients           Client[]
  // ... all other tenant-scoped entities
}
```

### Modified Tables

All major tables will get:
```prisma
organizationId    String              @map("organization_id")
organization      Organization        @relation(fields: [organizationId], references: [id])

@@index([organizationId])
```

#### Tables Requiring organizationId:
-  User
-  Client
-  IspOutcome (via Client)
-  ServiceSession (via Client)
-  ProgressNote (via Client)
-  IncidentReport (via Client)
-  FormTemplate
-  FormResponse (via User)
-  AuditLog (via User)

#### Tables NOT Requiring organizationId:
-  FormSection (child of FormTemplate)
-  FormField (child of FormSection)
-  ProgressNoteActivity (child of ProgressNote)
-  MediaAttachment (child of ProgressNote/Incident)
-  DigitalSignature (child of ProgressNote/Incident)
-  TeamsNotification (child of ProgressNote/Incident)

---

## Authentication Flow

### 1. Organization Resolution
```typescript
// Resolve tenant from:
1. Subdomain: acme-care.careservice.com
2. Custom domain: care.acme.com
3. Header: X-Organization-ID
4. JWT claim: organizationId
```

### 2. Enhanced JWT Payload
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;      // NEW
  organizationName: string;    // NEW
}
```

### 3. Login Process
```
1. User provides: email + password + organizationId (or subdomain)
2. System validates credentials within organization scope
3. JWT includes organizationId
4. All subsequent requests use this organizationId
```

---

## Middleware Implementation

### Tenant Context Middleware
```typescript
// Adds tenant context to every request
export async function tenantContext(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Get organizationId from JWT (after authentication)
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      return res.status(403).json({ error: 'No organization context' });
    }
    
    // 2. Verify organization is active
    const org = await prisma.organization.findUnique({
      where: { id: organizationId, isActive: true }
    });
    
    if (!org) {
      return res.status(403).json({ error: 'Organization not found or inactive' });
    }
    
    // 3. Attach to request
    req.organization = org;
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve organization' });
  }
}
```

---

## Service Layer Updates

### Example: Client Service with Tenant Filtering

#### Before (Single Tenant)
```typescript
export async function getAllClients(filters?: {
  search?: string;
  isActive?: boolean;
}) {
  return prisma.client.findMany({
    where: {
      isActive: filters?.isActive,
      // ...
    }
  });
}
```

#### After (Multi-Tenant)
```typescript
export async function getAllClients(
  organizationId: string,  // NEW: Required parameter
  filters?: {
    search?: string;
    isActive?: boolean;
  }
) {
  return prisma.client.findMany({
    where: {
      organizationId,        // NEW: Tenant isolation
      isActive: filters?.isActive,
      // ...
    }
  });
}
```

### Tenant Isolation Pattern
**Every service function must:**
1. Accept `organizationId` as the first parameter
2. Include `organizationId` in all `where` clauses
3. Never allow cross-tenant data access

---

## Controller Layer Updates

### Example: Updated Controller
```typescript
export async function getClients(req: AuthRequest, res: Response) {
  try {
    // Extract organizationId from authenticated user
    const organizationId = req.user!.organizationId;
    
    // Pass to service
    const clients = await getAllClients(organizationId, {
      search: req.query.search as string,
      isActive: req.query.isActive === 'true'
    });
    
    res.json(clients);
  } catch (error) {
    next(error);
  }
}
```

---

## Security Measures

### 1. Automatic Tenant Filtering
- All Prisma queries include `organizationId`
- No direct access to entities without tenant context
- Middleware enforces tenant context on all protected routes

### 2. Prisma Middleware (Additional Safety)
```typescript
// Global middleware to prevent accidental cross-tenant queries
prisma.$use(async (params, next) => {
  if (params.model && TENANT_SCOPED_MODELS.includes(params.model)) {
    if (!params.args.where?.organizationId) {
      throw new Error(`Query on ${params.model} missing organizationId`);
    }
  }
  return next(params);
});
```

### 3. Unique Constraints
```prisma
// Ensure unique values are scoped to organization
model User {
  // ...
  @@unique([email, organizationId])
}

model Client {
  // ...
  @@unique([dddId, organizationId])
}
```

---

## Migration Strategy

### Phase 1: Schema Update
```bash
1. Add Organization table
2. Add organizationId to all relevant tables
3. Create default organization for existing data
4. Migrate existing data to default organization
```

### Phase 2: Code Update
```bash
1. Update middleware (auth, tenant context)
2. Update all services (add organizationId parameter)
3. Update all controllers (pass organizationId)
4. Update types (add organization to AuthRequest)
```

### Phase 3: Testing
```bash
1. Test tenant isolation
2. Test cross-tenant access prevention
3. Test organization CRUD
4. Test user registration per org
```

---

## API Changes

### New Endpoints
- `POST /api/organizations` - Create organization (super admin)
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization
- `GET /api/organizations/:id/stats` - Organization statistics

### Modified Endpoints
All existing endpoints remain the same but automatically filter by tenant:
- No API breaking changes
- Client code doesn't need updates
- Transparent tenant isolation

---

## Organization Features

### Settings per Organization
```typescript
interface OrganizationSettings {
  features: {
    incidentReporting: boolean;
    gpsTracking: boolean;
    digitalSignatures: boolean;
    formBuilder: boolean;
  };
  compliance: {
    requireDualApproval: boolean;
    mandatoryGPS: boolean;
    photoRequirement: 'optional' | 'required' | 'disabled';
  };
  branding: {
    primaryColor: string;
    logo: string;
    emailFooter: string;
  };
  limits: {
    maxStorageMB: number;
    maxUsersPerClient: number;
  };
}
```

---

## Subscription Plans

### Basic ($99/month)
- Up to 50 users
- Up to 100 clients
- 10GB storage
- Basic features

### Professional ($299/month)
- Up to 200 users
- Unlimited clients
- 50GB storage
- All features
- Priority support

### Enterprise (Custom)
- Unlimited users
- Unlimited clients
- Unlimited storage
- Custom features
- Dedicated support
- SLA guarantees

---

## Super Admin Features

### Organization Management
- Create/update/delete organizations
- View all organizations
- Impersonate organization (for support)
- Global analytics across all tenants

### Monitoring
- Track organization usage
- Monitor storage per org
- Alert on limit breaches
- Billing integration

---

## Benefits

### For Business
 **SaaS Revenue Model**: Multiple paying customers  
 **Scalability**: Easy to onboard new organizations  
 **Cost Efficiency**: Shared infrastructure  
 **Easier Maintenance**: Single codebase, centralized updates  

### For Customers
 **Data Isolation**: Complete privacy between organizations  
 **Custom Branding**: White-label appearance  
 **Flexible Plans**: Pay for what you need  
 **Quick Setup**: Instant provisioning  

### For Developers
 **Clean Architecture**: Consistent tenant filtering  
 **Type Safety**: TypeScript enforces organizationId  
 **Test Isolation**: Easy to create test organizations  
 **Bug Prevention**: Middleware prevents cross-tenant leaks  

---

## Testing Strategy

### Unit Tests
```typescript
describe('Tenant Isolation', () => {
  it('should not allow cross-tenant data access', async () => {
    const org1Client = await createClient(org1.id, { name: 'Client A' });
    const org2Clients = await getAllClients(org2.id);
    
    expect(org2Clients).not.toContainEqual(org1Client);
  });
});
```

### Integration Tests
- Test organization creation
- Test user assignment to org
- Test data isolation
- Test subdomain routing

---

## Implementation Checklist

### Database
- [ ] Create Organization model
- [ ] Add organizationId to all tables
- [ ] Add indexes on organizationId
- [ ] Add unique constraints with org scope
- [ ] Create migration scripts
- [ ] Seed default organization

### Backend
- [ ] Update AuthRequest type
- [ ] Add tenant context middleware
- [ ] Update authentication middleware
- [ ] Update JWT to include organizationId
- [ ] Update all services
- [ ] Update all controllers
- [ ] Add Prisma safety middleware
- [ ] Create organization service
- [ ] Add organization routes

### Testing
- [ ] Test tenant isolation
- [ ] Test organization CRUD
- [ ] Test authentication flow
- [ ] Test data access patterns

### Frontend
- [ ] Add organization selector on login
- [ ] Display organization name in UI
- [ ] Add organization settings page
- [ ] Update API calls (transparent)

---

## Timeline

- **Schema Design**:  Complete (this document)
- **Database Migration**: 4 hours
- **Backend Updates**: 8 hours
- **Testing**: 4 hours
- **Documentation**: 2 hours

**Total Estimated Time**: 2-3 days

---

## Next Steps

1. Review and approve this design
2. Create Prisma schema updates
3. Generate and run migrations
4. Update backend code
5. Test thoroughly
6. Update documentation
7. Deploy to staging

---

## Notes

- This is a **non-breaking change** for existing functionality
- All existing test accounts will be migrated to a default "Demo Organization"
- API endpoints remain the same (transparent tenant filtering)
- No changes needed to frontend API calls initially
- Organization selection can be added to login UI later
