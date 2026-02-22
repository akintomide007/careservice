# Role-Based Access Control Implementation

## Overview
Implemented role-based access control to restrict form approval functionality to managers and admins only, while allowing all users (including DSPs) to see their draft forms.

## Changes Made

### Backend Changes

#### 1. Authorization Middleware (`backend/src/routes/formTemplate.routes.ts`)
- Added `authorize('manager', 'admin')` middleware to the form approval endpoint
- Only managers and admins can approve/reject submitted forms
- DSP users attempting to approve will receive `403 Forbidden` error

```typescript
router.post('/form-responses/:id/approve', authorize('manager', 'admin'), formTemplateController.approveResponse);
```

### Frontend Changes

#### 2. Dashboard UI (`web-dashboard/app/dashboard/page.tsx`)

**Role-Based Button Display:**
- Approve/Reject buttons now only visible to managers and admins
- DSP users can view submitted forms but cannot approve them
- Applied to both new form system and old progress notes system

**My Drafts Section:**
- Added new "My Draft Forms" statistics card showing count of draft forms
- Created dedicated section listing all user's draft forms
- "Continue Editing" button allows users to resume working on drafts
- All users (DSPs, managers, admins) can see and edit their own drafts

**Dashboard Layout:**
```

 Statistics Cards:                                    
 - My Draft Forms (yellow)                           
 - Submitted Forms (purple)                          
 - Open Incidents (red)                              
 - Approved Forms (green)                            



 My Draft Forms Section (if user has drafts)        
 - Lists all draft forms                             
 - "Continue Editing" button for each               



 Submitted Forms - Awaiting Approval                 
 - Approve/Reject buttons (managers/admins only)     



 Pending Progress Notes (Old System)                 
 - Approve/Reject buttons (managers/admins only)     

```

## User Roles & Permissions

### DSP (Direct Support Professional)
-  Can view all forms and statistics
-  Can fill out new forms
-  Can save forms as drafts
-  Can view and edit their own draft forms
-  Can submit forms for approval
-  Can see list of submitted forms (read-only)
-  **Cannot approve or reject forms**

### Manager
-  All DSP permissions
-  **Can approve submitted forms**
-  **Can reject submitted forms**
-  Can view all submitted forms with action buttons

### Admin
-  All Manager permissions
-  Full system access

## API Endpoints

### Protected Endpoints (Managers/Admins Only)
```
POST /api/form-responses/:id/approve
```

### Available to All Authenticated Users
```
GET  /api/form-responses?status=draft    (own drafts only)
GET  /api/form-responses/submitted/all   (read-only for DSPs)
POST /api/form-responses                 (create/save forms)
PUT  /api/form-responses/:id             (update own drafts)
```

## Testing

### Backend Authorization Test
```bash
# DSP user attempting approval (should fail with 403)
curl -X POST http://localhost:3008/api/form-responses/:id/approve \
  -H "Authorization: Bearer DSP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
# Response: 403 - {"error":"Insufficient permissions"}

# Manager user attempting approval (should work)
curl -X POST http://localhost:3008/api/form-responses/:id/approve \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
# Response: 200 - Form approved
```

### Frontend Testing
1. Log in as DSP (`dsp@careservice.com` / `dsp123`)
   - Verify no approve/reject buttons visible
   - Verify "My Drafts" section appears if drafts exist
   - Verify can create and save draft forms

2. Log in as Manager (`manager@careservice.com` / `manager123`)
   - Verify approve/reject buttons ARE visible
   - Verify can approve/reject forms successfully
   - Verify "My Drafts" section works

## Security Considerations

1. **Defense in Depth**: Both frontend (UI) and backend (API) enforce role restrictions
2. **JWT Token Validation**: All requests validated with user role from JWT
3. **Middleware Chain**: Authorization runs after authentication
4. **Clear Error Messages**: 403 Forbidden with "Insufficient permissions" message

## Future Enhancements

- Add audit log for all approval/rejection actions
- Implement notification system when forms are approved/rejected
- Add ability for DSPs to withdraw submitted forms before approval
- Create approval history view showing who approved what and when
