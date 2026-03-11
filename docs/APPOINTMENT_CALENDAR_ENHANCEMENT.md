# Appointment Calendar with Highlighted Pending Requests

## What You Have
Your appointments page (`/dashboard/appointments/page.tsx`) already has:
- ✅ List view of appointment requests
- ✅ Approve/Deny modal with DSP assignment
- ✅ Filtering by status

## What to Add
Add a calendar view tab that shows:
- 📅 Monthly calendar with highlighted days
- 🟡 Yellow highlight for days with pending requests
- 🟢 Green highlight for approved/scheduled appointments
- Click day to see requests and approve/deny

## Implementation

### Step 1: Add Calendar Tab Toggle

At the top of the appointments page, add view toggle:

```tsx
const [view, setView] = useState<'list' | 'calendar'>('list');

// Add after the filters section:
<div className="mb-4 flex gap-2">
  <button
    onClick={() => setView('list')}
    className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
  >
    List View
  </button>
  <button
    onClick={() => setView('calendar')}
    className={`px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
  >
    Calendar View
  </button>
</div>
```

### Step 2: Create Calendar View Component

```tsx
const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get days in month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };
  
  // Check if date has requests
  const getRequestsForDate = (date: Date) => {
    return requests.filter(req => {
      if (req.scheduledDate) {
        const scheduledDate = new Date(req.scheduledDate);
        return scheduledDate.toDateString() === date.toDateString();
      }
      // Check preferred dates for pending requests
      return req.status === 'pending' && req.preferredDates.some(prefDate => {
        const pDate = new Date(prefDate);
        return pDate.toDateString() === date.toDateString();
      });
    });
  };
  
  const getDayHighlight = (date: Date) => {
    const dayRequests = getRequestsForDate(date);
    if (dayRequests.length === 0) return '';
    
    const hasPending = dayRequests.some(r => r.status === 'pending');
    const hasScheduled = dayRequests.some(r => r.status === 'approved' || r.status === 'scheduled');
    
    if (hasPending) return 'bg-yellow-100 border-2 border-yellow-400';
    if (hasScheduled) return 'bg-green-100 border-2 border-green-400';
    return '';
  };
  
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }
  
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayRequests = getRequestsForDate(date);
    const highlight = getDayHighlight(date);
    const isToday = date.toDateString() === new Date().toDateString();
    
    days.push(
      <div
        key={day}
        onClick={() => {
          if (dayRequests.length > 0) {
            setSelectedDate(date);
          }
        }}
        className={`h-24 border border-gray-200 p-2 ${highlight} ${
          dayRequests.length > 0 ? 'cursor-pointer hover:shadow-lg' : ''
        } ${isToday ? 'ring-2 ring-blue-500' : ''} transition-all`}
      >
        <div className="font-semibold text-sm">{day}</div>
        {dayRequests.length > 0 && (
          <div className="mt-1 space-y-1">
            {dayRequests.slice(0, 2).map(req => (
              <div
                key={req.id}
                className="text-xs p-1 bg-white rounded truncate"
                title={`${req.client.firstName} ${req.client.lastName} - ${req.appointmentType}`}
              >
                {req.client.firstName} - {req.appointmentType}
              </div>
            ))}
            {dayRequests.length > 2 && (
              <div className="text-xs text-gray-600">
                +{dayRequests.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Prev
        </button>
        <h2 className="text-xl font-bold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next →
        </button>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded" />
          <span>Pending Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-blue-500 rounded" />
          <span>Today</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              Appointments for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-3">
              {getRequestsForDate(selectedDate).map(req => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {req.client.firstName} {req.client.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{req.appointmentType}</p>
                      <p className="text-sm mt-1">{req.reason}</p>
                      {req.location && (
                        <p className="text-sm text-gray-600 mt-1">📍 {req.location}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(req.status)}
                      {req.status === 'pending' && (user.role === 'manager' || user.role === 'admin') && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowApprovalModal(true);
                            setSelectedDate(null);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Review & Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Step 3: Use Calendar View

Replace the table section with:

```tsx
{view === 'list' ? (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {/* Existing table code */}
  </div>
) : (
  <CalendarView />
)}
```

## Result

Managers will see:
- **Yellow highlighted days** = Pending appointment requests
- **Green highlighted days** = Approved/scheduled appointments  
- **Click any highlighted day** = See requests for that day
- **Review button** = Opens existing approve/deny modal

The calendar makes it easy to see at a glance which days need attention!
