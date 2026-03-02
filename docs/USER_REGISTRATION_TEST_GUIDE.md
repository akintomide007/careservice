# User Registration & Testing Guide

Complete guide for testing user registration and workflows across all roles: Landlord, Tenant Admins, Managers, and DSPs.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Testing Workflow Overview](#testing-workflow-overview)
3. [Step 1: Landlord Setup](#step-1-landlord-setup)
4. [Step 2: Create Tenant Organization](#step-2-create-tenant-organization)
5. [Step 3: Admin User Management](#step-3-admin-user-management)
6. [Step 4: Manager Workflows](#step-4-manager-workflows)
7. [Step 5: DSP Workflows](#step-5-dsp-workflows)
8. [Permission Testing](#permission-testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting:
- ✅ Database set up and running (see [Database Setup Guide](./DATABASE_SETUP_GUIDE.md))
- ✅ Backend server running (`npm run dev` in backend directory)
- ✅ Landlord user seeded in database
- ✅ Tool for API testing (curl, Postman, or similar)

**Base URL:** `http://localhost:3001`

---

## Testing Workflow Overview

```
1. Landlord Login
   └─> Create Tenant Organization (with initial admin)
        └─> Admin Login
             ├─> Create additional Admins
             ├─> Create Managers  
             └─> Create DSPs
                  └─> Manager Login
                       ├─> Create DSPs
                       ├─> Assign Clients to DSPs
                       └─> Assign DSPs to themselves
                            └─> DSP Login
                                 ├─> View assigned clients
                                 ├─> Submit progress notes
                                 ├─> Request appointments
                                 └─> Report violations
```

---

## Step 1: Landlord Setup

### 1.1 Login as Landlord

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@careservice.com",
    "password": "landlord123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "landlord@careservice.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin",
    "isLandlord": true,
    "organizationId": "uuid",
    "organizationName": "System Administration"
  }
}
```

**Save the token** - you'll need it for subsequent requests!

```bash
# Export token for easy reuse
export LANDLORD_TOKEN="your-token-here"
```

### 1.2 Verify Landlord Cannot Access Client Data

**Test:** Try to access clients endpoint

```bash
curl -X GET http://localhost:3001/api/clients \
  -H "Authorization: Bearer $LANDLORD_TOKEN"
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Landlords cannot access client data for privacy compliance"
}
```

✅ **PASS** - Landlord is properly restricted from client PHI

---

## Step 2: Create Tenant Organization

### 2.1 Create First Tenant

**Endpoint:** `POST /api/admin/tenants`

**Request:**
```bash
curl -X POST http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer $LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Care Services",
    "subdomain": "sunrise",
    "plan": "professional",
    "maxUsers": 100,
    "maxClients": 500,
    "adminEmail": "admin@sunrisecare.com",
    "adminPassword": "SunriseAdmin123!"
  }'
```

**Expected Response:**
```json
{
  "id": "tenant-uuid",
  "name": "Sunrise Care Services",
  "subdomain": "sunrise",
  "plan": "professional",
  "maxUsers": 100,
  "maxClients": 500,
  "isActive": true,
  "users": [
    {
      "id": "admin-uuid",
      "email": "admin@sunrisecare.com",
      "firstName": "Sunrise Care Services",
      "lastName": "Admin",
      "role": "admin"
    }
  ],
  "initialCredentials": {
    "email": "admin@sunrisecare.com",
    "password": "SunriseAdmin123!",
    "message": "Please save these credentials and share them with the organization admin"
  }
}
```

✅ **SUCCESS** - Tenant created with initial admin!

### 2.2 List All Tenants

```bash
curl -X GET http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer $LANDLORD_TOKEN"
```

### 2.3 View Tenant Details

```bash
curl -X GET http://localhost:3001/api/admin/tenants/{tenant-id} \
  -H "Authorization: Bearer $LANDLORD_TOKEN"
```

---

## Step 3: Admin User Management

### 3.1 Login as Tenant Admin

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sunrisecare.com",
    "password": "SunriseAdmin123!"
  }'
```

**Save admin token:**
```bash
export ADMIN_TOKEN="admin-token-here"
```

### 3.2 Create Additional Admin

**Endpoint:** `POST /api/admin/users`

```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@sunrisecare.com",
    "password": "Admin2Pass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "id": "uuid",
  "email": "admin2@sunrisecare.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "isActive": true
}
```

✅ **SUCCESS** - Multiple admins per tenant supported!

### 3.3 Create Manager

```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@sunrisecare.com",
    "password": "ManagerPass123!",
    "firstName": "John",
    "lastName": "Manager",
    "role": "manager"
  }'
```

### 3.4 Create DSP (by Admin)

```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dsp1@sunrisecare.com",
    "password": "DSP1Pass123!",
    "firstName": "Alice",
    "lastName": "Johnson",
    "role": "dsp"
  }'
```

### 3.5 Create Client

**Endpoint:** `POST /api/clients`

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Michael",
    "lastName": "Client",
    "dateOfBirth": "1985-03-15",
    "address": "123 Care St, City, State 12345",
    "emergencyContactName": "Sarah Client",
    "emergencyContactPhone": "555-0123"
  }'
```

**Save client ID for later use**

### 3.6 List Users in Organization

```bash
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Step 4: Manager Workflows

### 4.1 Login as Manager

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@sunrisecare.com",
    "password": "ManagerPass123!"
  }'
```

```bash
export MANAGER_TOKEN="manager-token-here"
```

### 4.2 Create DSP (Manager Can Only Create DSPs)

```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dsp2@sunrisecare.com",
    "password": "DSP2Pass123!",
    "firstName": "Bob",
    "lastName": "Williams",
    "role": "dsp"
  }'
```

✅ **SUCCESS** - Manager can create DSPs

### 4.3 Try to Create Manager (Should Fail)

```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager2@sunrisecare.com",
    "password": "Pass123!",
    "firstName": "Test",
    "lastName": "Manager",
    "role": "manager"
  }'
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Managers can only create DSP accounts"
}
```

✅ **PASS** - Manager permissions properly restricted

### 4.4 Assign Client to DSP

**Endpoint:** `POST /api/client-assignments`

First, get DSP ID from user list, then:

```bash
curl -X POST http://localhost:3001/api/client-assignments \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "dspId": "dsp-uuid",
    "notes": "Primary caregiver for weekdays"
  }'
```

### 4.5 Assign DSP to Manager

**Endpoint:** `POST /api/admin/dsp-manager-assignments`

```bash
curl -X POST http://localhost:3001/api/admin/dsp-manager-assignments \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dspId": "dsp-uuid",
    "managerId": "manager-uuid",
    "notes": "Assigned to John's team"
  }'
```

### 4.6 View Assigned DSPs

```bash
curl -X GET http://localhost:3001/api/admin/manager/my-dsps \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

---

## Step 5: DSP Workflows

### 5.1 Login as DSP

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dsp1@sunrisecare.com",
    "password": "DSP1Pass123!"
  }'
```

```bash
export DSP_TOKEN="dsp-token-here"
```

### 5.2 View Assigned Clients

```bash
curl -X GET http://localhost:3001/api/clients \
  -H "Authorization: Bearer $DSP_TOKEN"
```

**Expected:** Only clients assigned to this DSP

### 5.3 Submit Progress Note

**Endpoint:** `POST /api/progress-notes`

```bash
curl -X POST http://localhost:3001/api/progress-notes \
  -H "Authorization: Bearer $DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "serviceType": "community_based_support",
    "serviceDate": "2026-02-28",
    "startTime": "09:00:00",
    "endTime": "12:00:00",
    "location": "Client Home",
    "supportsProvided": "Assisted with meal preparation and medication reminders",
    "progressNotes": "Client engaged well, good mood throughout session"
  }'
```

### 5.4 Submit Progress Note for Approval

```bash
curl -X POST http://localhost:3001/api/progress-notes/{note-id}/submit \
  -H "Authorization: Bearer $DSP_TOKEN"
```

### 5.5 Request Appointment

**Endpoint:** `POST /api/appointment-requests`

```bash
curl -X POST http://localhost:3001/api/appointment-requests \
  -H "Authorization: Bearer $DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "appointmentType": "medical",
    "urgency": "routine",
    "reason": "Annual checkup",
    "preferredDates": ["2026-03-15", "2026-03-16"],
    "location": "Downtown Medical Center",
    "provider": "Dr. Smith",
    "transportation": "needs_transport"
  }'
```

### 5.6 Report Violation

**Endpoint:** `POST /api/violations`

```bash
curl -X POST http://localhost:3001/api/violations \
  -H "Authorization: Bearer $DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "dsp-uuid",
    "violationType": "safety",
    "severity": "medium",
    "incidentDate": "2026-02-28",
    "description": "Safety protocol not followed during client transfer"
  }'
```

✅ **SUCCESS** - DSPs can now report violations!

### 5.7 Clock In/Out

**Clock In:**
```bash
curl -X POST http://localhost:3001/api/sessions/clock-in \
  -H "Authorization: Bearer $DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "serviceType": "community_based_support",
    "clockInLat": 40.7128,
    "clockInLng": -74.0060
  }'
```

**Clock Out:**
```bash
curl -X POST http://localhost:3001/api/sessions/clock-out \
  -H "Authorization: Bearer $DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "clockOutLat": 40.7128,
    "clockOutLng": -74.0060
  }'
```

---

## Permission Testing

### Test Matrix

| Action | Landlord | Admin | Manager | DSP | Expected Result |
|--------|----------|-------|---------|-----|-----------------|
| Create Tenant | ✅ | ❌ | ❌ | ❌ | Landlord only |
| View Tenants | ✅ | ❌ | ❌ | ❌ | Landlord only |
| Create Admin | ❌ | ✅ | ❌ | ❌ | Admin only |
| Create Manager | ❌ | ✅ | ❌ | ❌ | Admin only |
| Create DSP | ❌ | ✅ | ✅ | ❌ | Admin & Manager |
| Create Client | ❌ | ✅ | ✅ | ❌ | Admin & Manager |
| View Clients | ❌ | ✅ | ✅ | ✅* | *DSP: assigned only |
| Submit Progress Note | ❌ | ❌ | ❌ | ✅ | DSP only |
| Approve Progress Note | ❌ | ❌ | ✅ | ❌ | Manager only |
| Report Violation | ❌ | ❌ | ✅ | ✅ | Manager & DSP |
| Request Appointment | ❌ | ❌ | ❌ | ✅ | DSP only |

### Run Test Scripts

```bash
# Test landlord restrictions
curl -X GET http://localhost:3001/api/clients \
  -H "Authorization: Bearer $LANDLORD_TOKEN"
# Expected: 403 Forbidden

# Test manager cannot create admin
curl -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!","firstName":"Test","lastName":"User","role":"admin"}'
# Expected: 403 Forbidden

# Test DSP cannot approve own note
curl -X POST http://localhost:3001/api/progress-notes/{note-id}/approve \
  -H "Authorization: Bearer $DSP_TOKEN"
# Expected: 403 Forbidden
```

---

## Troubleshooting

### Login Fails

**Issue:** `401 Unauthorized`

**Solutions:**
1. Check email/password are correct
2. Verify user exists in database:
   ```bash
   npm run db:studio
   # Check Users table
   ```
3. Ensure organization is active

### Token Expired

**Issue:** `401 Invalid token`

**Solution:** Login again to get new token

### Permission Denied

**Issue:** `403 Forbidden`

**Solution:** Verify user role has permission for that action (see Test Matrix above)

### Client Not Found

**Issue:** `404 Not found`

**Solutions:**
1. Verify client exists
2. Check DSP is assigned to client
3. Ensure correct organizationId

### Cannot Create User

**Issue:** `400 Bad Request`

**Common Causes:**
1. Email already exists
2. Missing required fields
3. Invalid password (too short)

**Check:**
```bash
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Complete Test Scenario

Here's a full end-to-end test you can run:

```bash
#!/bin/bash

# 1. Login as Landlord
LANDLORD_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"landlord@careservice.com","password":"landlord123"}' \
  | jq -r '.token')

echo "✓ Landlord logged in"

# 2. Create Tenant
TENANT=$(curl -s -X POST http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer $LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org","subdomain":"testorg","adminEmail":"admin@test.com","adminPassword":"TestPass123!"}')

echo "✓ Tenant created"

# 3. Login as Admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPass123!"}' \
  | jq -r '.token')

echo "✓ Admin logged in"

# 4. Create Manager
curl -s -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"Pass123!","firstName":"Test","lastName":"Manager","role":"manager"}' > /dev/null

echo "✓ Manager created"

# 5. Create DSP
curl -s -X POST http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"dsp@test.com","password":"Pass123!","firstName":"Test","lastName":"DSP","role":"dsp"}' > /dev/null

echo "✓ DSP created"

echo ""
echo "✅ All tests passed!"
```

---

## API Quick Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Tenant Management (Landlord)
- `GET /api/admin/tenants` - List tenants
- `POST /api/admin/tenants` - Create tenant
- `GET /api/admin/tenants/:id` - Get tenant
- `PUT /api/admin/tenants/:id` - Update tenant

### User Management
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user

### Client Management
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client
- `PUT /api/clients/:id` - Update client

### Progress Notes
- `POST /api/progress-notes` - Create note
- `POST /api/progress-notes/:id/submit` - Submit for approval
- `POST /api/progress-notes/:id/approve` - Approve (manager)

### Appointments
- `POST /api/appointment-requests` - Request appointment
- `GET /api/appointment-requests` - List requests
- `POST /api/appointment-requests/:id/approve` - Approve (manager)

### Violations
- `POST /api/violations` - Report violation
- `GET /api/violations` - List violations

---

## Next Steps

After completing these tests:

1. ✅ All user roles created and tested
2. ✅ Permissions verified
3. ✅ Workflows tested
4. → Start using the system!
5. → See [Role-Based Access Implementation](./ROLE_BASED_ACCESS_IMPLEMENTATION_COMPLETE.md) for details

---

**Last Updated:** February 28, 2026
