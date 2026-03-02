# Appointment Scheduling Enhancement - Comprehensive Specification

## Executive Summary
This document outlines the requirements for enhancing the appointment management system to include visual calendar scheduling and DSP assignment capabilities for managers.

## Current State (As-Is)

### Existing Features
✅ Appointment request creation by DSPs
✅ Manager review/approval workflow
✅ Basic date/time picker for scheduling
✅ Automatic calendar event creation option
✅ Email notifications for approval/rejection
✅ Status tracking (pending, approved, rejected, scheduled)

### Current Limitations
❌ No visual calendar interface
❌ No DSP assignment to appointments
❌ No availability checking
❌ No conflict detection
❌ No drag-and-drop scheduling
❌ No recurring appointment support

## Proposed Enhancement (To-Be)

### 1. Visual Calendar Interface

#### Calendar View Types
- **Month View**: Overview of all appointments
- **Week View**: Detailed weekly schedule
- **Day View**: Hour-by-hour breakdown
- **Agenda View**: List view with filters

#### Calendar Features
- **Color Coding**:
  - Blue: Medical appointments
  - Green: Therapy sessions
  - Purple: Dental appointments
  - Orange: Social services
  - Gray: Other
  
- **Visual Elements**:
  - Client names on calendar events
  - Urgency indicators (red dot for urgent/emergency)
  - DSP assignment badges
  - Appointment type icons
  
- **Interactions**:
  - Click event to view details
  - Drag-and-drop to reschedule
  - Double-click empty slot to create appointment
  - Right-click for context menu (Edit, Delete, Duplicate)

### 2. DSP Assignment System

#### Assignment Features
- **Smart Assignment**:
  - Filter DSPs by client assignments
  - Show DSP availability for selected time
  - Highlight conflicts (already scheduled)
  - Display DSP location/distance from appointment
  
- **Assignment UI**:
  ```
  Assign to DSP: [Dropdown]
  ├── John Doe (Available) ✓
  ├── Jane Smith (Already scheduled: 2:00 PM Client X) ⚠️
  ├── Mike Johnson (Off duty) ❌
  └── Sarah Williams (Available)
  ```

- **Automatic Assignment**:
  - Auto-assign based on client-DSP relationships
  - Suggest best match based on:
    - Client preference
    - DSP expertise (medical vs therapy)
    - Geographic proximity
    - Current workload

### 3. Availability Management

#### DSP Availability
- **Work Schedule**:
  - Set regular working hours per DSP
  - Define off days/vacation
  - PTO requests and approval
  
- **Capacity Limits**:
  - Max appointments per day
  - Max appointments per week
  - Buffer time between appointments
  
- **Real-time Updates**:
  - Show available/busy status
  - Display current location (if shared)
  - Estimated travel time to appointment

### 4. Conflict Detection & Resolution

#### Conflict Types
1. **Time Conflicts**:
   - DSP double-booked
   - Client double-booked
   - Facility/room double-booked

2. **Logical Conflicts**:
   - Appointment too far from previous location
   - Insufficient travel time
   - Appointment outside DSP working hours

3. **Policy Conflicts**:
   - Missing required documentation
   - Insurance authorization needed
   - Client restrictions

#### Resolution UI
```
⚠️ Conflicts Detected:
├── DSP John Doe already scheduled at 2:00 PM
│   ├── Suggestion 1: Assign to Jane Smith (Available)
│   ├── Suggestion 2: Reschedule to 3:30 PM
│   └── Override and force schedule
└── Client needs transportation (not arranged)
    ├── Mark as "needs transport"
    └── Assign transport coordinator
```

### 5. Enhanced Appointment Details

#### Additional Fields
```javascript
{
  // Existing fields
  id, clientId, appointmentType, urgency, reason, notes,
  preferredDates, location, provider, status,
  
  // NEW fields
  assignedDspId: string,          // DSP assigned to appointment
  estimatedDuration: number,       // In minutes
  transportationRequired: boolean,
  transportationAssignedTo: string,
  reminderSent: boolean,
  reminderSentAt: Date,
  checkInTime: Date,              // When DSP checked in
  checkOutTime: Date,             // When DSP checked out
  actualDuration: number,         // Actual time spent
  followUpRequired: boolean,
  followUpNotes: string,
  recurringSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number,
    endDate: Date,
    occurrences: number
  },
  reminderSettings: {
    clientReminder: number,       // Days before
    dspReminder: number,          // Days before
    managerReminder: number       // Days before
  }
}
```

## Technical Implementation

### Frontend Components

#### 1. Calendar Component
**Library**: React Big Calendar or FullCalendar
```typescript
// CalendarView.tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'

interface CalendarViewProps {
  appointments: Appointment[]
  onSelectSlot: (slot: { start: Date; end: Date }) => void
  onSelectEvent: (event: Appointment) => void
  onEventDrop: (event: Appointment, start: Date, end: Date) => void
}
```

#### 2. DSP Selector Component
```typescript
// DspSelector.tsx
interface DspSelectorProps {
  appointmentDate: Date
  appointmentDuration: number
  clientId: string
  onSelect: (dspId: string) => void
}

// Features:
// - Fetch available DSPs
// - Show conflicts
// - Display distance/travel time
// - Filter by expertise
```

#### 3. Appointment Detail Modal
```typescript
// AppointmentDetailModal.tsx
interface AppointmentDetailModalProps {
  appointment: Appointment
  onUpdate: (data: Partial<Appointment>) => void
  onDelete: () => void
  onDuplicate: () => void
}

// Tabs:
// - Details
// - DSP Assignment
// - History/Timeline
// - Documents
```

### Backend Enhancements

#### New API Endpoints

```typescript
// GET /api/appointments/calendar
// Returns appointments for calendar view
{
  start: Date,
  end: Date,
  dspId?: string,  // Filter by DSP
  clientId?: string // Filter by client
}

// POST /api/appointments/check-availability
// Check if DSP is available
{
  dspId: string,
  start: Date,
  end: Date
}
// Response: { available: boolean, conflicts: Conflict[] }

// GET /api/dsps/available
// Get available DSPs for time slot
{
  start: Date,
  duration: number,
  clientId?: string
}
// Response: DSP[] with availability status

// POST /api/appointments/:id/assign-dsp
// Assign DSP to appointment
{
  dspId: string,
  notifyDsp: boolean
}

// GET /api/appointments/:id/conflicts
// Check for conflicts before scheduling

// POST /api/appointments/recurring
// Create recurring appointments
{
  template: AppointmentTemplate,
  recurringSchedule: RecurringSchedule
}
```

#### Database Schema Updates

```prisma
model Appointment {
  // ... existing fields
  
  assignedDspId     String?
  assignedDsp       User?     @relation("AppointmentDSP", fields: [assignedDspId])
  
  estimatedDuration Int       @default(60) // minutes
  actualDuration    Int?
  
  checkInTime       DateTime?
  checkOutTime      DateTime?
  
  transportationRequired Boolean @default(false)
  transportationAssignedTo String?
  
  recurringGroupId  String?   // Link recurring appointments
  isRecurring       Boolean   @default(false)
  recurringRule     Json?     // Store RRULE or custom format
  
  reminders         AppointmentReminder[]
  
  @@index([assignedDspId, scheduledDate])
  @@index([recurringGroupId])
}

model DspAvailability {
  id           String   @id @default(cuid())
  dspId        String
  dsp          User     @relation(fields: [dspId])
  
  dayOfWeek    Int      // 0 = Sunday, 6 = Saturday
  startTime    String   // "09:00"
  endTime      String   // "17:00"
  
  isAvailable  Boolean  @default(true)
  effectiveFrom DateTime?
  effectiveTo   DateTime?
  
  @@index([dspId])
}

model DspTimeOff {
  id       String   @id @default(cuid())
  dspId    String
  dsp      User     @relation(fields: [dspId])
  
  startDate DateTime
  endDate   DateTime
  reason    String?
  approved  Boolean  @default(false)
  
  @@index([dspId, startDate, endDate])
}

model AppointmentReminder {
  id            String   @id @default(cuid())
  appointmentId String
  appointment   Appointment @relation(fields: [appointmentId])
  
  reminderType  String   // 'client', 'dsp', 'manager'
  scheduledFor  DateTime
  sent          Boolean  @default(false)
  sentAt        DateTime?
  
  @@index([scheduledFor, sent])
}
```

### Business Logic

#### Conflict Detection Algorithm
```typescript
async function detectConflicts(appointment: AppointmentInput): Promise<Conflict[]> {
  const conflicts: Conflict[] = []
  
  // 1. DSP Time Conflicts
  const dspAppointments = await getDS PAppointments(
    appointment.dspId,
    appointment.start,
    appointment.end
  )
  if (dspAppointments.length > 0) {
    conflicts.push({
      type: 'DSP_DOUBLE_BOOKED',
      severity: 'high',
      message: 'DSP already has appointment at this time',
      conflictingAppointments: dspAppointments
    })
  }
  
  // 2. Client Time Conflicts
  const clientAppointments = await getClientAppointments(
    appointment.clientId,
    appointment.start,
    appointment.end
  )
  if (clientAppointments.length > 0) {
    conflicts.push({
      type: 'CLIENT_DOUBLE_BOOKED',
      severity: 'high',
      message: 'Client already has appointment at this time',
      conflictingAppointments: clientAppointments
    })
  }
  
  // 3. Travel Time Check
  const previousAppt = await getPreviousAppointment(appointment.dspId, appointment.start)
  if (previousAppt) {
    const travelTime = calculateTravelTime(previousAppt.location, appointment.location)
    const availableTime = appointment.start.getTime() - previousAppt.end.getTime()
    
    if (travelTime > availableTime) {
      conflicts.push({
        type: 'INSUFFICIENT_TRAVEL_TIME',
        severity: 'medium',
        message: `Need ${travelTime}min travel time, only ${availableTime}min available`
      })
    }
  }
  
  // 4. Availability Check
  const availability = await checkDspAvailability(
    appointment.dspId,
    appointment.start
  )
  if (!availability.available) {
    conflicts.push({
      type: 'DSP_UNAVAILABLE',
      severity: 'high',
      message: availability.reason
    })
  }
  
  return conflicts
}
```

#### Smart Assignment Algorithm
```typescript
async function suggestBestDsp(
  clientId: string,
  appointmentType: string,
  start: Date,
  duration: number
): Promise<DspSuggestion[]> {
  
  // Get all DSPs
  const allDsps = await getDsps()
  
  const suggestions = await Promise.all(
    allDsps.map(async (dsp) => {
      let score = 0
      const reasons: string[] = []
      
      // 1. Client-DSP relationship (+40 points)
      const hasRelationship = await checkClientDspRelationship(clientId, dsp.id)
      if (hasRelationship) {
        score += 40
        reasons.push('Has existing relationship with client')
      }
      
      // 2. Availability (+30 points)
      const isAvailable = await checkAvailability(dsp.id, start, duration)
      if (isAvailable) {
        score += 30
      } else {
        score = 0 // Eliminates if unavailable
        reasons.push('Not available at this time')
      }
      
      // 3. Expertise match (+20 points)
      if (dsp.specializations?.includes(appointmentType)) {
        score += 20
        reasons.push(`Specializes in ${appointmentType}`)
      }
      
      // 4. Workload balance (+10 points)
      const workload = await getDspWorkload(dsp.id, start)
      if (workload < 5) { // Less than 5 appointments that day
        score += 10
        reasons.push('Light schedule')
      }
      
      return {
        dsp,
        score,
        reasons,
        available: isAvailable
      }
    })
  )
  
  // Sort by score descending
  return suggestions
    .filter(s => s.available)
    .sort((a, b) => b.score - a.score)
}
```

## UI/UX Mockups

### Calendar View Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Appointment Calendar              [Month ▼] [<] February 2026 [>]│
├─────────────────────────────────────────────────────────────────┤
│ Filters: [All DSPs ▼] [All Types ▼] [Search...]                 │
├─────────────────────────────────────────────────────────────────┤
│ Sun    Mon    Tue    Wed    Thu    Fri    Sat                   │
├────────┬────────┬────────┬────────┬────────┬────────┬────────────┤
│        │  1     │  2     │  3     │  4     │  5     │  6         │
│        │ 9:00 AM│        │ 2:00 PM│        │ 10:00  │            │
│        │ Medical│        │ Therapy│        │ Dental │            │
│        │ M.Will │        │ S.John │        │ M.Will │            │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────┤
│  7     │  8     │  9     │  10    │  11    │  12    │  13        │
│ 11:00  │        │ 1:00 PM│        │ 3:00 PM│        │            │
│ Social │        │ Medical│        │ Therapy│        │            │
│ S.John │        │ M.Will │        │ S.John │        │            │
└────────┴────────┴────────┴────────┴────────┴────────┴────────────┘
Legend: 🔵 Medical 🟢 Therapy 🟣 Dental 🟠 Social
```

### Assignment Modal
```
┌─────────────────────────────────────────────────────────┐
│ Schedule Appointment                              [X]   │
├─────────────────────────────────────────────────────────┤
│ Client: Michael Williams (DDD-2024-002)                 │
│ Type: Medical - Follow-up appointment                   │
│ Urgency: URGENT 🔴                                      │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Date & Time                                     │   │
│ │ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │   │
│ │ │ 02/15/2026  │ │ 02:00 PM    │ │  60 min │ │   │
│ │ └──────────────┘ └──────────────┘ └─────────┘ │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Assign DSP                                      │   │
│ │ ┌─────────────────────────────────────────────┐ │   │
│ │ │ ✓ John Doe          Available ⚫          │ │   │
│ │ │   Has relationship with client             │ │   │
│ │ │   Match: 90%                               │ │   │
│ │ ├─────────────────────────────────────────────┤ │   │
│ │ │   Jane Smith        Conflict ⚠️           │ │   │
│ │ │   Already scheduled: 2:00 PM Client X      │ │   │
│ │ │   Match: 75%                               │ │   │
│ │ ├─────────────────────────────────────────────┤ │   │
│ │ │   Mike Johnson      Off Duty ⭕            │ │   │
│ │ │   Vacation: 02/15-02/20                    │ │   │
│ │ └─────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ☐ Send reminder to client (24h before)                │
│ ☐ Send reminder to DSP (2h before)                    │
│ ☐ Create calendar event                               │
│                                                         │
│ [Cancel]                         [Schedule Appointment]│
└─────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Install calendar library (react-big-calendar)
- [ ] Create basic calendar view component
- [ ] Display existing appointments on calendar
- [ ] Add month/week/day view toggle
- [ ] Implement color coding by appointment type

### Phase 2: DSP Assignment (Week 3-4)
- [ ] Add assignedDspId to database schema
- [ ] Create DSP selector component
- [ ] Implement availability checking
- [ ] Add DSP filter to calendar view
- [ ] Create DSP assignment API endpoints

### Phase 3: Conflict Detection (Week 5-6)
- [ ] Implement conflict detection algorithm
- [ ] Add conflict resolution UI
- [ ] Create smart assignment suggestions
- [ ] Add conflict warnings before scheduling

### Phase 4: Advanced Features (Week 7-8)
- [ ] Add drag-and-drop rescheduling
- [ ] Implement recurring appointments
- [ ] Add reminder system
- [ ] Create availability management UI
- [ ] Add check-in/check-out functionality

### Phase 5: Polish & Testing (Week 9-10)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] User training documentation
- [ ] Deploy to production

## Success Metrics

### User Experience
- Scheduling time reduced by 70% (from 5 min to 90 sec)
- DSP assignment conflict rate < 5%
- User satisfaction rating > 4.5/5

### System Performance
- Calendar load time < 1 second
- Conflict detection response < 500ms
- Support 1000+ appointments per month

### Business Impact
- Reduce no-show rate by 30% (with reminders)
- Increase DSP utilization by 20%
- Reduce scheduling errors by 80%

## Dependencies

### NPM Packages
```json
{
  "react-big-calendar": "^1.8.5",
  "date-fns": "^2.30.0",
  "@fullcalendar/react": "^6.1.0", // Alternative
  "@fullcalendar/daygrid": "^6.1.0",
  "@fullcalendar/timegrid": "^6.1.0",
  "@fullcalendar/interaction": "^6.1.0"
}
```

### External APIs (Optional)
- Google Maps API (travel time calculation)
- Twilio (SMS reminders)
- SendGrid (email reminders)

## Security & Compliance

### Access Control
- Only managers/admins can assign DSPs
- DSPs can only view their own schedule
- Clients cannot see DSP schedules

### HIPAA Compliance
- Encrypted calendar data
- Audit log for all scheduling changes
- Automatic session timeout (15 min)
- No PHI in calendar event titles

### Data Privacy
- Hide client details in shared calendars
- Configurable visibility settings
- Export restrictions

## Migration Strategy

### Data Migration
```typescript
// Migration script to populate assignedDspId
async function migrateExistingAppointments() {
  const appointments = await prisma.appointment.findMany({
    where: { assignedDspId: null, status: 'scheduled' }
  })
  
  for (const appt of appointments) {
    // Auto-assign to requester if they're a DSP
    if (appt.requester.role === 'dsp') {
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { assignedDspId: appt.requesterId }
      })
    }
  }
}
```

### Backward Compatibility
- Keep existing appointment creation flow
- Calendar view is additive (doesn't break existing features)
- Gradual rollout: managers first, then DSPs

## Training & Documentation

### User Training
- 15-minute video tutorial for managers
- Interactive walkthrough in app (first-time use)
- Quick reference PDF with screenshots

### Developer Documentation
- API documentation with examples
- Component documentation (Storybook)
- Architecture decision records (ADRs)

## Future Enhancements (Post-MVP)

### Version 2.0
- Mobile calendar view (responsive)
- Offline scheduling support
- AI-powered scheduling suggestions
- Integration with external calendars (Google, Outlook)

### Version 3.0
- Video call integration for telehealth
- Real-time location tracking for DSPs
- Automated appointment matching
- Predictive analytics for no-shows

## Cost Estimate

### Development Time
- **Phase 1-2**: 80 hours ($8,000 @ $100/hr)
- **Phase 3-4**: 80 hours ($8,000)
- **Phase 5**: 40 hours ($4,000)
- **Total**: 200 hours ($20,000)

### Infrastructure
- Calendar library: Free (open source)
- Additional API calls: ~$50/month
- Storage (calendar events): ~$10/month

### Maintenance
- Bug fixes & updates: 10 hours/month ($1,000/month)

## Risk Assessment

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Calendar performance issues | Medium | High | Implement pagination, caching |
| Complex conflict logic bugs | High | Medium | Comprehensive unit tests |
| Third-party library limitations | Low | Medium | Evaluate multiple options |

### Business Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User adoption resistance | Medium | High | Training, gradual rollout |
| Integration complexity | High | Medium | Phased implementation |
| Scope creep | High | Medium | Strict phase boundaries |

## Approval & Sign-off

This specification requires approval from:
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Manager/Supervisor (end user representative)
- [ ] Compliance Officer (HIPAA review)

---

**Document Version**: 1.0  
**Last Updated**: February 25, 2026  
**Next Review**: March 25, 2026
