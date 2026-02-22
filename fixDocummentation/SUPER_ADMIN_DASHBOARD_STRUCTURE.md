# SuperAdminDashboard Component Structure

## Visual Layout

```

  Super Admin Dashboard                            [Refresh Button]  
  Platform-wide monitoring and management                            



  Platform Status: Healthy                                           
  All systems operational                                            
                                                                      
  Uptime: 99.9%  |  Active Tenants: 12  |  Response Time: 234ms    



 Total Orgs       Total Users      Total Clients    Open Tickets 
 15               247              1,234            8            
 12 Active                                                       
 2 Suspended                                                     



  System-wide Usage Metrics                                          
           
   Users     Clients   Sessions  Storage   API Calls         
   247       1,234     5,678     12,345MB  234.5K            
           



  Organizations (15)                              [Manage All >]     
   
   [Search...]                  [Filter: All Status ]           
   
   
   Acme Care Services                          [active]           
   Subdomain: acme-care  Users: 45  Clients: 234  Storage: 456MB 
                                            [View Details]        
   
   HealthFirst Solutions                       [trial]            
   Subdomain: healthfirst Users: 12  Clients: 67  Storage: 123MB 
                                            [View Details]        
   



  Recent Support Tickets                          [View All >]       
   
   [high] [technical]                                             
   Database connection issues                                     
   Users unable to log in since this morning...                   
   Acme Care | John Doe | 2024-02-21                             
   
   [critical] [billing]                                           
   Payment processing failed                                      
   Customer's credit card was declined multiple times...          
   HealthFirst | Jane Smith | 2024-02-20                         
   

```

## Component Hierarchy

```
SuperAdminDashboard
 Header Section
    Title with Building2 Icon
    Refresh Button

 Platform Health Status Card
    Health Indicator (CheckCircle/AlertCircle)
    Status Message
    Metrics (Uptime, Active Tenants, Response Time)

 Statistics Grid (4 cards)
    Total Organizations Card
    Total Users Card
    Total Clients Card
    Open Tickets Card

 System-wide Usage Metrics Card
    Metrics Grid (5 metrics)
        Total Users
        Total Clients
        Total Sessions
        Storage (MB)
        API Calls

 Organizations List Card
    Header with Search & Filter
       Search Input
       Status Filter Dropdown
    Tenant List (scrollable)
        Tenant Items (map)
            Name & Status Badge
            Metrics (Users, Clients, Storage)
            View Details Button

 Support Tickets Card
     Header with View All Link
     Ticket List (scrollable, max 10)
         Ticket Items (map)
             Priority & Category Badges
             Title & Description
             Metadata (Org, Reporter, Date)
```

## State Management

```typescript
// UI State
- loading: boolean          // Initial data load
- refreshing: boolean       // Manual refresh
- searchTerm: string        // Organization search
- statusFilter: string      // Status filter

// Data State
- overview: SystemOverview | null
- tenants: TenantMetrics[]
- tickets: SupportTicket[]
- usageMetrics: UsageMetrics | null
- platformHealth: PlatformHealth
```

## Data Flow

```
Component Mount
    
loadDashboardData()
    
Promise.all([
    api.request('/api/admin/overview'),
    api.getTenants(),
    api.getSupportTickets({ status: 'open' }),
    api.request('/api/support/metrics/system')
])
    
Calculate Platform Health
    
Update State
    
Render UI

User Interaction (Search/Filter)
    
Update State
    
filteredTenants recalculated
    
Re-render filtered list
```

## Color Scheme

### Status Colors
- **Green** (`green-600`, `green-100`): Healthy, Active, Success
- **Yellow** (`yellow-600`, `yellow-100`): Warning, Medium Priority, Degraded
- **Orange** (`orange-600`, `orange-100`): High Priority, Needs Attention
- **Red** (`red-600`, `red-100`): Critical, Suspended, Error
- **Blue** (`blue-600`, `blue-100`): Information, Trial, Primary Actions
- **Gray** (`gray-600`, `gray-100`): Cancelled, Inactive, Neutral
- **Purple** (`purple-600`): Users metric

### Priority Badge Colors
```typescript
getPriorityColor(priority: string) {
  'critical'  'text-red-600 bg-red-100'
  'high'      'text-orange-600 bg-orange-100'
  'medium'    'text-yellow-600 bg-yellow-100'
  'low'       'text-blue-600 bg-blue-100'
}
```

### Status Badge Colors
```typescript
getStatusColor(status: string) {
  'active'     'text-green-600 bg-green-100'
  'suspended'  'text-red-600 bg-red-100'
  'trial'      'text-blue-600 bg-blue-100'
  'cancelled'  'text-gray-600 bg-gray-100'
}
```

## Responsive Breakpoints

```css
/* Mobile First */
default: 1 column

/* Tablet */
md: (min-width: 768px)
  - Statistics Grid: 2 columns
  - Metrics Grid: 2 columns
  - Tenant Search/Filter: Row layout

/* Desktop */
lg: (min-width: 1024px)
  - Statistics Grid: 4 columns
  - Metrics Grid: 5 columns

/* Wide Desktop */
max-width: 1600px (container)
```

## Key Functions

```typescript
loadDashboardData()
  - Fetches all dashboard data
  - Calculates platform health
  - Updates state
  - Handles errors

handleRefresh()
  - Sets refreshing state
  - Calls loadDashboardData()
  - Clears refreshing state

filteredTenants (computed)
  - Filters by search term
  - Filters by status
  - Returns matching tenants

getPriorityColor(priority)
  - Returns Tailwind classes for priority badges

getStatusColor(status)
  - Returns Tailwind classes for status badges
```

## Navigation Routes

```typescript
/dashboard/admin/tenants              // All tenants
/dashboard/admin/tenants/:id          // Tenant details
/dashboard/admin/tickets              // All tickets
/dashboard/admin/tickets/:id          // Ticket details
```

## Accessibility Features

1. **Semantic HTML**: Proper heading hierarchy (h1, h2, h3)
2. **ARIA Labels**: Buttons with descriptive text
3. **Keyboard Navigation**: All interactive elements focusable
4. **Visual Indicators**: Icons paired with text
5. **Color Contrast**: WCAG AA compliant
6. **Loading States**: Clear feedback during operations
7. **Empty States**: Informative messages when no data

---

**Component Size**: 514 lines
**Complexity**: Medium-High
**Maintainability**: High (well-structured, typed, documented)
