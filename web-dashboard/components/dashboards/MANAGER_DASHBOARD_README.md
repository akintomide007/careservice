# Manager Dashboard Component

## Overview
The ManagerDashboard component provides a comprehensive overview for managers to oversee their team, handle approvals, and monitor key metrics.

## File Location
`/home/arksystems/Desktop/careService/web-dashboard/components/dashboards/ManagerDashboard.tsx`

## Features

### 1. Team Overview
- **Staff Count**: Displays the total number of active DSP (Direct Support Professional) team members
- Real-time count from the backend API

### 2. Pending Approvals
- **Progress Notes**: Shows submitted progress notes awaiting manager approval
- **Forms**: Displays submitted forms requiring review
- **Quick Actions**: Approve or reject directly from the dashboard
- Total count visible in the summary card

### 3. Schedule Overview
- **Today's Team Schedule**: View all scheduled shifts for the current day
- Shows staff member assignments with clients
- Displays shift times and service types
- Direct link to full schedule management

### 4. Task Assignment Statistics
- **Total Tasks**: Overview of all tasks
- **Pending**: Tasks not yet started
- **In Progress**: Currently active tasks
- **Completed**: Successfully finished tasks
- **Overdue**: Tasks past their due date
- Visual breakdown with color-coded metrics

### 5. Recent Incidents
- Displays the 5 most recent incidents requiring attention
- Shows severity levels (critical, high, medium, low)
- Status tracking (pending, investigating, resolved)
- Client and reporter information
- Direct link to full incident management

## API Integration

All data is fetched using the centralized API client from `@/lib/api.ts`:

```typescript
// Staff data
api.getOrganizationUsers('dsp')

// Progress notes
api.getProgressNotes({ status: 'submitted' })

// Forms
api.getSubmittedFormResponses()

// Schedules
api.getOrganizationSchedules({ startDate: today, endDate: today })

// Task statistics
api.getTaskStatistics()

// Incidents
api.getIncidents({ status: 'pending' })

// Assigned tasks
api.getAssignedTasks({ status: 'pending' })
```

## TypeScript Types

The component includes comprehensive TypeScript interfaces:

- `User`: Staff member information
- `ProgressNote`: Progress note details
- `FormResponse`: Form submission data
- `Schedule`: Shift schedule information
- `Task`: Task assignment data
- `Incident`: Incident report details
- `TaskStatistics`: Aggregated task metrics
- `DashboardStats`: Complete dashboard state

## Usage

### Import the component:
```typescript
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
```

### Use in a page:
```typescript
export default function ManagerDashboardPage() {
  return <ManagerDashboard />;
}
```

## Key Functions

### `loadDashboardData()`
Fetches all dashboard data from the backend using Promise.all for optimal performance. Includes error handling with fallbacks.

### `handleApproveProgressNote(id, action)`
Approves or rejects a progress note and refreshes the dashboard.

### `handleApproveForm(id, action)`
Approves or rejects a form submission and refreshes the dashboard.

## Design Features

- **Clean Layout**: Organized in logical sections with clear visual hierarchy
- **Responsive**: Grid layout adapts to mobile, tablet, and desktop
- **Loading State**: Spinner animation while data loads
- **Empty States**: Friendly messages when no data is available
- **Interactive Cards**: Hover effects and smooth transitions
- **Color Coding**: Different colors for different priorities and statuses
- **Icon Support**: Lucide React icons for visual clarity

## Navigation Links

The dashboard includes quick navigation to:
- `/dashboard/manager/team` - Team management
- `/dashboard/manager/schedule` - Full schedule view
- `/dashboard/tasks` - Task management
- `/dashboard/violations` - Incident/violation management

## Error Handling

- All API calls wrapped in try-catch blocks
- Graceful fallbacks to empty arrays for failed requests
- User-friendly error alerts for critical actions
- Console logging for debugging

## Performance

- Single useEffect on mount
- Batch API calls with Promise.all
- Minimal re-renders with proper state management
- Loading state prevents layout shift

## Future Enhancements

Potential additions:
- Export dashboard data to PDF/Excel
- Date range filters for historical data
- Team performance charts
- Real-time notifications with WebSocket
- Customizable dashboard widgets
- Advanced filtering and sorting
