# Manager Dashboard Usage Example

## Component Created
 `/home/arksystems/Desktop/careService/web-dashboard/components/dashboards/ManagerDashboard.tsx`

## How to Use

### Option 1: In a Dashboard Page
Create or update `/web-dashboard/app/dashboard/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import DspDashboard from '@/components/dashboards/DspDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'manager':
      return <ManagerDashboard />;
    case 'dsp':
      return <DspDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
```

### Option 2: Dedicated Manager Dashboard Page
Create `/web-dashboard/app/dashboard/manager/overview/page.tsx`:

```typescript
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';

export default function ManagerOverviewPage() {
  return <ManagerDashboard />;
}
```

## Features Overview

### 1. **Team Overview Card**
- Shows total count of active DSP staff members
- Quick access to team management page

### 2. **Pending Approvals Card**
- Combined count of pending progress notes and forms
- Breakdown showing notes vs forms

### 3. **Today's Shifts Card**
- Number of scheduled shifts for current day
- Click through to full schedule

### 4. **Pending Tasks Card**
- Count of pending tasks
- Shows overdue task count

### 5. **Task Statistics Section**
- Visual breakdown of all tasks
- Shows: Total, Pending, In Progress, Completed, Overdue
- Color-coded for easy scanning

### 6. **Pending Progress Notes (Left Column)**
- List of submitted progress notes awaiting approval
- Shows client name, submitted by, and timestamp
- Quick approve/reject buttons
- Scrollable if more than a few items

### 7. **Pending Forms (Right Column)**
- List of submitted forms requiring review
- Shows form name, type, submitted by, and timestamp
- Quick approve/reject buttons
- Scrollable if more than a few items

### 8. **Today's Team Schedule**
- Shows all staff schedules for today
- Displays: Staff name, client name, time, service type
- Scrollable if many shifts

### 9. **Recent Incidents**
- Last 5 incidents requiring attention
- Shows severity and status badges
- Client and reporter information
- Timestamp for each incident

## API Endpoints Used

```typescript
// All using the centralized API client from @/lib/api.ts

1. api.getOrganizationUsers('dsp')
   - Fetches all DSP staff members

2. api.getProgressNotes({ status: 'submitted' })
   - Gets pending progress notes

3. api.getSubmittedFormResponses()
   - Gets all submitted form responses

4. api.getOrganizationSchedules({ startDate, endDate })
   - Fetches team schedules

5. api.getTaskStatistics()
   - Gets aggregated task statistics

6. api.getIncidents({ status: 'pending' })
   - Fetches pending incidents

7. api.getAssignedTasks({ status: 'pending' })
   - Gets tasks assigned by the manager

8. api.approveProgressNote(id, action)
   - Approve/reject progress notes

9. api.approveFormResponse(id, action)
   - Approve/reject forms
```

## TypeScript Support

The component includes comprehensive TypeScript interfaces:
- Full type safety for all data structures
- IntelliSense support in VS Code
- Compile-time error checking
- Proper null/undefined handling

## Styling

- Uses Tailwind CSS utility classes
- Fully responsive (mobile, tablet, desktop)
- Consistent with existing DspDashboard design
- Clean, modern UI with:
  - Rounded corners
  - Shadows and hover effects
  - Color-coded status indicators
  - Smooth transitions

## Navigation Integration

Built-in navigation to:
- `/dashboard/manager/team` - Manage Team button
- `/dashboard/manager/schedule` - View Full Schedule
- `/dashboard/tasks` - View All Tasks
- `/dashboard/violations` - View All Incidents

## Error Handling

- All API calls wrapped with try-catch
- Graceful fallbacks (empty arrays) on API failures
- User alerts for approval actions
- Console logging for debugging

## Performance Optimizations

- Batch API calls with Promise.all
- Single data fetch on component mount
- Efficient state management
- Minimal re-renders

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Interactive elements with hover states
- Clear visual feedback for actions
