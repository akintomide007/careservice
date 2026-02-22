# Immediate Fixes Needed

## Issues Identified

### 1.  Frontend Not Seeing Backend Changes
**Problem:** Frontend still using old code (no rebuild needed, but React needs HMR)
**Solution:** The backend changes are live, but frontend dashboards need to be updated per `FINAL_ROLE_HIERARCHY_STATUS.md`

### 2.  Notifications API Missing (404 Error)
```
GET http://localhost:3000/api/notifications/unread-count
[HTTP/1.1 404 Not Found]
```
**Problem:** Frontend calling `/api/notifications/unread-count` but backend route doesn't exist
**Solution:** Need to add the endpoint or remove the frontend call

### 3.  Audit Logs Error
```
Error loading audit logs: Error: Request failed
```
**Problem:** Likely permission or API endpoint issue
**Solution:** Check if audit log API is accessible to current user role

### 4.  Logout Not Working for All Users
**Problem:** Logout doesn't always clear session
**Solution:** Need to check logout implementation in AuthContext

---

## Quick Fixes

### Fix 1: Add Missing Notifications Endpoint
**File:** `backend/src/routes/notification.routes.ts` or `backend/src/server.ts`

Add:
```typescript
router.get('/notifications/unread-count', requireAuth, async (req: any, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        isRead: false
      }
    });
    return res.json({ count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
```

### Fix 2: Fix Logout in AuthContext
**File:** `web-dashboard/contexts/AuthContext.tsx`

Update logout:
```typescript
const logout = async () => {
  try {
    // Clear auth token
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Clear user state
    setUser(null);
    
    // Force redirect
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout anyway
    setUser(null);
    window.location.href = '/login';
  }
};
```

### Fix 3: Handle Missing Audit Logs Permission
**File:** `web-dashboard/app/dashboard/admin/audit/page.tsx` or similar

Add error handling:
```typescript
const { data: auditLogs, error } = useSWR('/api/admin/audit-logs', {
  onError: (err) => {
    if (err.status === 403) {
      toast.error('You do not have permission to view audit logs');
    }
  }
});

if (error && error.status === 403) {
  return <div>Access Denied: Insufficient permissions</div>;
}
```

---

## Current System State

**Backend:**  All changes applied and running
- Landlord endpoints removed 
- DSP-Manager API added 
- Server running 

**Frontend:**  Still using old code
- No rebuild needed (React uses HMR)
- Dashboards need manual updates per `FINAL_ROLE_HIERARCHY_STATUS.md`
- Missing notification endpoint causing 404s
- Logout needs improvement

**Immediate Actions:**
1. Add notifications/unread-count endpoint
2. Fix logout in AuthContext
3. Add audit log permission handling
4. Then update dashboards per documentation

---

## Priority Order

**High Priority (Fix Now):**
1.  Backend role hierarchy - DONE
2.  Add notifications endpoint - NEEDED
3.  Fix logout issue - NEEDED

**Medium Priority (Next):**
4.  Update Landlord dashboard
5.  Update Admin dashboard  
6.  Update Manager dashboard

**Low Priority (Future):**
7.  Add DSP selection to client creation
8.  Enhance DSP dashboard
