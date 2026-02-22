# Frontend Notification System Implementation Plan

## Overview
Build the notification center UI to display in-app notifications, manage preferences, and provide real-time updates.

---

## Components to Build

### 1. NotificationCenter Component
**Location**: `web-dashboard/components/NotificationCenter.tsx`

**Features:**
- Bell icon with unread count badge
- Dropdown panel on click
- List of recent notifications (10 most recent)
- "Mark all as read" button
- "See all notifications" link
- Auto-refresh every 30 seconds

**State:**
- Notifications list
- Unread count
- Open/closed state

### 2. NotificationItem Component
**Location**: `web-dashboard/components/NotificationItem.tsx`

**Features:**
- Icon based on notification type
- Title and message
- Relative timestamp (e.g., "2 minutes ago")
- Action button (if actionUrl exists)
- Mark as read/unread toggle
- Delete button
- Read/unread visual indicator

### 3. Notifications Page
**Location**: `web-dashboard/app/dashboard/notifications/page.tsx`

**Features:**
- Full list of notifications (paginated)
- Filters: All, Unread, By Type, By Priority
- Bulk actions: Mark all as read, Clear all
- Search notifications
- Load more / pagination

### 4. Notification Preferences Page
**Location**: `web-dashboard/app/dashboard/settings/notifications/page.tsx`

**Features:**
- Toggle email notifications
- Toggle in-app notifications
- Event type checkboxes (8 types)
- Quiet hours time pickers
- Digest frequency selector
- Test notification button
- Save button

### 5. NotificationToast Component (Optional - Future)
**Location**: `web-dashboard/components/NotificationToast.tsx`

**Features:**
- Pop-up notification for real-time updates
- Auto-dismiss after 5 seconds
- Click to view details
- Close button

---

## API Integration

### Endpoints to Connect:
```typescript
// Get notifications
GET /api/notifications?limit=10&offset=0&isRead=false

// Get unread count
GET /api/notifications/unread-count

// Mark as read
POST /api/notifications/:id/read

// Mark all as read
POST /api/notifications/read-all

// Delete notification
DELETE /api/notifications/:id

// Clear all read
DELETE /api/notifications/clear-all

// Get preferences
GET /api/notifications/preferences

// Update preferences
PUT /api/notifications/preferences

// Send test notification
POST /api/notifications/test
```

---

## Implementation Steps

### Phase 1: Core Components (2-3 hours)
1.  Create NotificationCenter component with bell icon
2.  Add notification dropdown panel
3.  Create NotificationItem component
4.  Add to dashboard layout header
5.  Implement unread count badge
6.  Add mark as read functionality

### Phase 2: Full Page (1-2 hours)
7.  Create notifications page
8.  Add pagination
9.  Add filters (All, Unread, etc.)
10.  Add bulk actions

### Phase 3: Preferences (1-2 hours)
11.  Create preferences page
12.  Add toggle switches
13.  Add time pickers for quiet hours
14.  Add test notification button
15.  Save preferences functionality

### Phase 4: Polish (1 hour)
16.  Add loading states
17.  Add error handling
18.  Add empty states
19.  Responsive design
20.  Accessibility (ARIA labels)

### Phase 5: Real-time Updates (1 hour)
21.  Implement polling (30-second intervals)
22.  Update badge on new notifications
23.  Play sound on new notification (optional)
24.  Show toast notification (optional)

---

## Styling Guide

### Colors:
- **Unread**: Bold text, blue dot indicator
- **Read**: Normal text, gray
- **Low Priority**: Gray
- **Normal Priority**: Blue
- **High Priority**: Orange
- **Urgent Priority**: Red

### Icons by Type:
- Appointment:  Calendar
- Task:  Check
- Incident:  Warning
- Ticket:  Ticket
- Schedule:  Clock
- System:  Bell
- Violation:  Stop

### Badge:
- Position: Top-right of bell icon
- Color: Red background, white text
- Max display: 99+

---

## Data Flow

```
User Action  Component  API Call  Update State  Re-render

Example:
1. User clicks bell icon
2. NotificationCenter opens dropdown
3. Fetch notifications from API
4. Display in dropdown
5. User clicks "Mark as read"
6. API call to mark as read
7. Update local state
8. Re-render with new state
```

---

## Testing Checklist

- [ ] Bell icon displays correctly
- [ ] Unread count shows accurate number
- [ ] Clicking bell opens/closes dropdown
- [ ] Notifications display with correct data
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Navigate to full page works
- [ ] Preferences save correctly
- [ ] Test notification sends
- [ ] Polling updates unread count
- [ ] Responsive on mobile
- [ ] Accessible with keyboard

---

**Estimated Total Time**: 6-8 hours

**Dependencies**: 
- API client configured (`web-dashboard/lib/api.ts`)
- Auth context for user info
- TailwindCSS for styling

**Priority**: HIGH - Enhances user experience significantly

---

**Next Step**: Create NotificationCenter component
