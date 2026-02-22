# Feature 3: Notification System - Design

## Overview
A comprehensive notification system that keeps users informed about important events, requests, and system updates through in-app notifications and email alerts.

---

## User Story

**As a User**, I want to receive notifications about important events so that I can stay informed and take timely action.

**As a Manager**, I want to be notified when DSPs submit appointment requests, incident reports, or when approvals are needed.

**As a DSP**, I want to be notified when my appointment requests are approved/rejected, when tasks are assigned, or when there are schedule changes.

**As an Admin**, I want to be notified about system-wide issues, support tickets, and critical events.

---

## Database Schema

### Notification Model
```prisma
model Notification {
  id                String          @id @default(uuid())
  organizationId    String
  userId            String          // Recipient
  type              String          // appointment_request, ticket_update, task_assigned, etc.
  title             String
  message           String
  actionUrl         String?         // Where to navigate when clicked
  actionLabel       String?         // Button text
  relatedId         String?         // ID of related resource (appointmentId, ticketId, etc.)
  relatedType       String?         // Type of related resource
  isRead            Boolean         @default(false)
  isEmailed         Boolean         @default(false)
  priority          String          @default("normal") // low, normal, high, urgent
  metadata          Json?           // Additional context
  createdAt         DateTime        @default(now())
  readAt            DateTime?
  
  organization      Organization    @relation(fields: [organizationId], references: [id])
  user              User            @relation(fields: [userId], references: [id])
  
  @@index([userId, isRead])
  @@index([organizationId])
  @@index([createdAt])
}

model NotificationPreference {
  id                String          @id @default(uuid())
  userId            String          @unique
  
  // Notification channels
  emailEnabled      Boolean         @default(true)
  inAppEnabled      Boolean         @default(true)
  
  // Event types
  appointmentRequests     Boolean   @default(true)
  appointmentApprovals    Boolean   @default(true)
  taskAssignments         Boolean   @default(true)
  scheduleChanges         Boolean   @default(true)
  incidentReports         Boolean   @default(true)
  ticketUpdates           Boolean   @default(true)
  violationAlerts         Boolean   @default(true)
  systemAnnouncements     Boolean   @default(true)
  
  // Timing
  quietHoursStart   String?         // "22:00"
  quietHoursEnd     String?         // "08:00"
  digestFrequency   String          @default("never") // never, daily, weekly
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  user              User            @relation(fields: [userId], references: [id])
}
```

---

## Notification Types

### 1. Appointment Requests
- **`appointment_request_submitted`** - Manager notified when DSP submits request
- **`appointment_request_approved`** - DSP notified when request approved
- **`appointment_request_rejected`** - DSP notified when request rejected
- **`appointment_scheduled`** - DSP notified when appointment is scheduled

### 2. Support Tickets
- **`ticket_created`** - Admin notified of new ticket
- **`ticket_assigned`** - Assigned admin notified
- **`ticket_updated`** - Reporter notified of status changes
- **`ticket_resolved`** - Reporter notified when resolved
- **`ticket_comment_added`** - Participants notified of new comments

### 3. Tasks & Schedules
- **`task_assigned`** - User notified of new task
- **`task_due_soon`** - User notified 24h before due date
- **`schedule_changed`** - User notified of schedule modifications
- **`shift_reminder`** - User notified 1h before shift

### 4. Incidents & Violations
- **`incident_reported`** - Manager notified of new incident
- **`violation_recorded`** - Manager and affected user notified
- **`violation_review_required`** - Manager notified to review

### 5. System Events
- **`system_announcement`** - All users notified of important updates
- **`usage_limit_warning`** - Admin notified at 80%, 90%, 100% limits
- **`subscription_expiring`** - Admin notified 30, 7, 1 days before expiry

---

## API Endpoints

### Notifications
```
GET    /api/notifications              - Get user's notifications
GET    /api/notifications/unread-count - Count unread notifications
GET    /api/notifications/:id          - Get notification details
POST   /api/notifications/:id/read     - Mark notification as read
POST   /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
DELETE /api/notifications/clear-all    - Clear all read notifications
```

### Notification Preferences
```
GET    /api/notifications/preferences      - Get user preferences
PUT    /api/notifications/preferences      - Update preferences
POST   /api/notifications/test             - Send test notification
```

### Admin
```
POST   /api/admin/notifications/broadcast  - Send announcement to all users
POST   /api/admin/notifications/send       - Send notification to specific users
GET    /api/admin/notifications/stats      - Notification statistics
```

---

## Service Methods

### notification.service.ts

#### Core Methods
- `createNotification(data)` - Create new notification
- `getNotifications(userId, filters)` - Get user's notifications
- `getNotificationById(id)` - Get notification details
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead(userId)` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `clearReadNotifications(userId)` - Clear all read

#### Helper Methods
- `sendEmail(notification)` - Send email if enabled
- `checkPreferences(userId, type)` - Check if user wants notification
- `getUnreadCount(userId)` - Count unread notifications
- `cleanupOldNotifications(days)` - Delete old notifications

#### Event-Specific Methods
- `notifyAppointmentRequest(appointmentRequest)` - Notify managers
- `notifyAppointmentApproval(appointmentRequest)` - Notify DSP
- `notifyTicketCreated(ticket)` - Notify admins
- `notifyTicketAssigned(ticket)` - Notify assigned admin
- `notifyTaskAssigned(task)` - Notify user
- `notifyIncidentReported(incident)` - Notify managers
- `notifySystemAnnouncement(message, users)` - Broadcast to users

### notificationPreference.service.ts
- `getPreferences(userId)` - Get user preferences
- `updatePreferences(userId, data)` - Update preferences
- `createDefaultPreferences(userId)` - Create defaults for new user
- `isInQuietHours(userId)` - Check if in quiet hours
- `shouldSendEmail(userId, type)` - Check if email should be sent

---

## Frontend Components

### 1. Notification Center (`NotificationCenter.tsx`)
- Bell icon with unread count badge
- Dropdown panel with notification list
- Mark as read/unread
- Clear all button
- "See all" link

### 2. Notification Item (`NotificationItem.tsx`)
- Icon based on notification type
- Title and message
- Timestamp (relative time)
- Action button
- Mark as read/unread
- Delete

### 3. Notification Preferences (`NotificationPreferences.tsx`)
- Toggle email/in-app notifications
- Event type checkboxes
- Quiet hours time pickers
- Digest frequency selector
- Test notification button

### 4. Notification Toast (`NotificationToast.tsx`)
- Pop-up for real-time notifications
- Auto-dismiss after 5s
- Click to view details
- Close button

---

## Integration Points

### When to Trigger Notifications

#### Appointment Request Flow
```typescript
// When DSP creates request
await appointmentRequestService.create(data);
await notificationService.notifyAppointmentRequest(request);

// When manager approves
await appointmentRequestService.approve(id);
await notificationService.notifyAppointmentApproval(request);
```

#### Support Ticket Flow
```typescript
// When ticket created
await supportTicketService.createTicket(data);
await notificationService.notifyTicketCreated(ticket);

// When ticket assigned
await supportTicketService.assignTicket(id, userId);
await notificationService.notifyTicketAssigned(ticket);
```

#### Task Assignment
```typescript
// When task assigned
await taskService.create(data);
await notificationService.notifyTaskAssigned(task);
```

---

## Email Templates

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline styles for email clients */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logoUrl}}" alt="Logo" />
      <h1>{{title}}</h1>
    </div>
    <div class="content">
      {{message}}
    </div>
    <div class="action">
      <a href="{{actionUrl}}" class="button">{{actionLabel}}</a>
    </div>
    <div class="footer">
      <p>Manage your notification preferences: <a href="{{preferencesUrl}}">Click here</a></p>
    </div>
  </div>
</body>
</html>
```

### Email Types
- Appointment request notification
- Approval/rejection notification
- Task assignment notification
- Incident alert
- Support ticket update
- System announcement

---

## Real-Time Updates (Future Enhancement)

For real-time notifications without page refresh:
1. **WebSockets** (using Socket.io)
2. **Server-Sent Events** (SSE)
3. **Polling** (simple but less efficient)

Initial implementation will use polling (check every 30s), with WebSocket upgrade in future.

---

## Notification Priority & Styling

### Priority Levels
- **Low**: Gray icon, no sound
- **Normal**: Blue icon, gentle sound
- **High**: Orange icon, attention sound
- **Urgent**: Red icon, alert sound, persistent

### Icons by Type
- Appointment:  Calendar
- Task:  Check
- Incident:  Warning
- Ticket:  Ticket
- Schedule:  Clock
- System:  Bell
- Violation:  Stop

---

## Performance Considerations

1. **Indexing**: Add indexes on userId + isRead for fast queries
2. **Pagination**: Limit to 50 notifications per page
3. **Cleanup**: Delete notifications older than 90 days (automated job)
4. **Caching**: Cache unread count in Redis (future)
5. **Batch Operations**: Mark multiple as read in single query

---

## Security & Privacy

1. **Organization Isolation**: Users only see their org's notifications
2. **Role-Based**: Only relevant notifications for user role
3. **No Sensitive Data**: Don't include passwords, tokens in notifications
4. **Audit Trail**: Log who sent what to whom
5. **Opt-Out**: Users can disable notification types

---

## Implementation Timeline

### Phase 1: Core Notification System (4-6 hours)
- Database schema
- Backend services
- API endpoints
- Basic email integration

### Phase 2: Frontend Components (4-6 hours)
- Notification center component
- Notification list
- Preferences page
- Toast notifications

### Phase 3: Integration (2-3 hours)
- Hook into appointment requests
- Hook into support tickets
- Hook into task assignments
- Hook into incidents

### Phase 4: Enhancement (Future)
- WebSocket real-time updates
- Push notifications (mobile)
- Notification digest emails
- Advanced filtering

**Total Estimated Time**: 10-15 hours

---

## Success Criteria

 Users receive in-app notifications for important events
 Email notifications sent based on preferences
 Notification center shows unread count
 Users can mark as read/unread
 Users can configure notification preferences
 Quiet hours respected
 Notifications are organization-scoped
 Old notifications automatically cleaned up

---

**Status**: Design Complete - Ready for Implementation  
**Priority**: HIGH  
**Dependencies**: Email service (already exists), User authentication  
**Next Step**: Implement database schema and backend services
