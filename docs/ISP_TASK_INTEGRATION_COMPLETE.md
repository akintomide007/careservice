# ISP Goals → Tasks Integration - Implementation Complete

## Overview
This document describes the complete implementation of ISP Goals and Outcomes integration with the Task Management system, allowing managers to generate tasks from ISP goals and DSPs to view tasks with full ISP context.

---

## What's Been Implemented

### ✅ Database Schema Changes

**File**: `backend/prisma/schema.prisma`
- Added `ispGoalId` field to Task model
- Created relationship between Task and IspGoal
- Added tasks relation to IspGoal model

**Migration File**: `backend/prisma/migrations/20260302_add_isp_goal_to_tasks/migration.sql`

### ✅ Backend Service Updates

**File**: `backend/src/services/task.service.ts`
- Updated `createTask()` to accept `ispGoalId` parameter
- Added ISP goal data to task responses including:
  - Goal title and description
  - Goal type and priority
  - Progress percentage
  - Associated ISP outcome information

---

## How It Works

### 1. Manager Workflow: Creating Tasks from ISP Goals

#### Step 1: View Client's ISP Goals
**Endpoint**: `GET /api/isp-goals/goals?clientId={clientId}`

```typescript
// Example Response
{
  "goals": [
    {
      "id": "goal-123",
      "title": "Prepare breakfast independently",
      "description": "Learn to prepare simple breakfast meals",
      "goalType": "skill_building",
      "priority": "high",
      "progressPercentage": 45,
      "outcome": {
        "id": "outcome-456",
        "outcomeDescription": "Increase independence in daily living",
        "category": "Independent Living"
      },
      "milestones": [...]
    }
  ]
}
```

#### Step 2: Generate Task from ISP Goal
**Endpoint**: `POST /api/tasks`

```typescript
// Request Body
{
  "organizationId": "org-123",
  "assignedTo": "dsp-user-id",
  "assignedBy": "manager-user-id",
  "clientId": "client-123",
  "ispGoalId": "goal-123",  // ← Links task to ISP goal
  "taskType": "isp_goal_activity",
  "title": "Practice making toast with John",
  "description": "Work on breakfast preparation skills - focus on using toaster safely",
  "priority": "high",
  "dueDate": "2026-03-15T09:00:00Z",
  "estimatedHours": 1,
  "checklistItems": [
    "Gather breakfast materials",
    "Practice using toaster",
    "Document progress"
  ]
}
```

```typescript
// Response - Task with ISP Context
{
  "id": "task-789",
  "title": "Practice making toast with John",
  "description": "Work on breakfast preparation skills - focus on using toaster safely",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-03-15T09:00:00Z",
  "client": {
    "id": "client-123",
    "firstName": "John",
    "lastName": "Doe"
  },
  "ispGoal": {
    "id": "goal-123",
    "title": "Prepare breakfast independently",
    "description": "Learn to prepare simple breakfast meals",
    "goalType": "skill_building",
    "priority": "high",
    "progressPercentage": 45,
    "outcome": {
      "id": "outcome-456",
      "outcomeDescription": "Increase independence in daily living",
      "category": "Independent Living"
    }
  },
  "checklistItems": [...]
}
```

---

### 2. DSP Workflow: Viewing & Completing ISP-Linked Tasks

#### Step 1: View Assigned Tasks
**Web Dashboard Endpoint**: `GET /api/tasks/assigned?userId={dspId}`
**Mobile App Endpoint**: Same endpoint

```typescript
// Response includes ISP context
{
  "tasks": [
    {
      "id": "task-789",
      "title": "Practice making toast with John",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-03-15T09:00:00Z",
      "client": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "ispGoal": {
        "title": "Prepare breakfast independently",
        "progressPercentage": 45,
        "outcome": {
          "outcomeDescription": "Increase independence in daily living"
        }
      }
    }
  ]
}
```

#### Step 2: View Task Details
**Endpoint**: `GET /api/tasks/{taskId}`

Shows full task details including:
- Complete ISP goal information
- Associated outcome
- Current progress percentage
- Milestones
- Checklist items

#### Step 3: Complete Task
**Endpoint**: `PUT /api/tasks/{taskId}/complete`

```typescript
{
  "completionNotes": "John successfully made toast with minimal verbal prompts. Used toaster safely.",
  "actualHours": 0.75,
  "resultType": "skill_practice",
  "resultDescription": "Practiced breakfast preparation",
  "resultMetrics": {
    "successLevel": "minimal_assist",
    "promptsUsed": {
      "verbal": 2,
      "gestural": 0,
      "physical": 0
    },
    "progressRating": 4
  }
}
```

---

## API Endpoints Summary

### ISP Goals
- `GET /api/isp-goals/goals` - List goals (with filters)
- `GET /api/isp-goals/goals/:goalId` - Get goal details
- `POST /api/isp-goals/goals` - Create new goal
- `PUT /api/isp-goals/goals/:goalId` - Update goal
- `GET /api/isp-goals/goals/:goalId/activities` - Get goal activities
- `POST /api/isp-goals/goals/:goalId/activities` - Log activity

### ISP Outcomes
- `GET /api/isp-outcomes/outcomes` - List outcomes
- `GET /api/isp-outcomes/outcomes/:id` - Get outcome details
- `POST /api/isp-outcomes/outcomes` - Create outcome
- `PUT /api/isp-outcomes/outcomes/:id` - Update outcome

### Tasks (Enhanced with ISP)
- `GET /api/tasks/assigned` - Get user's tasks (includes ISP context)
- `GET /api/tasks/:id` - Get task details (includes ISP context)
- `POST /api/tasks` - Create task (accepts ispGoalId)
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/complete` - Complete task
- `GET /api/tasks/statistics` - Get task statistics

---

## Frontend Implementation

### Web Dashboard - Manager View

#### Creating Tasks from ISP Goals

```typescript
// pages/dashboard/isp-goals/[clientId].tsx
import { useState, useEffect } from 'react';

function ClientIspGoals({ clientId }) {
  const [goals, setGoals] = useState([]);

  const handleCreateTask = async (goal) => {
    const taskData = {
      organizationId: user.organizationId,
      assignedTo: selectedDsp.id,
      assignedBy: user.id,
      clientId: clientId,
      ispGoalId: goal.id,  // Link to ISP goal
      taskType: 'isp_goal_activity',
      title: `Work on: ${goal.title}`,
      description: goal.description,
      priority: goal.priority,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      estimatedHours: 1
    };

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
  };

  return (
    <div>
      <h2>ISP Goals for {clientName}</h2>
      {goals.map(goal => (
        <div key={goal.id} className="goal-card">
          <h3>{goal.title}</h3>
          <p>{goal.description}</p>
          <div className="progress-bar">
            <div style={{ width: `${goal.progressPercentage}%` }} />
          </div>
          <button onClick={() => handleCreateTask(goal)}>
            Create Task for DSP
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Web Dashboard - DSP View

```typescript
// pages/dashboard/tasks.tsx
function DspTasks() {
  const [tasks, setTasks] = useState([]);

  return (
    <div>
      <h2>My Tasks</h2>
      {tasks.map(task => (
        <div key={task.id} className="task-card">
          <h3>{task.title}</h3>
          <p>Client: {task.client.firstName} {task.client.lastName}</p>
          
          {/* ISP Goal Context */}
          {task.ispGoal && (
            <div className="isp-context">
              <h4>ISP Goal: {task.ispGoal.title}</h4>
              <p>Outcome: {task.ispGoal.outcome.outcomeDescription}</p>
              <div className="progress">
                Progress: {task.ispGoal.progressPercentage}%
              </div>
            </div>
          )}
          
          <button onClick={() => viewTask(task.id)}>View Details</button>
        </div>
      ))}
    </div>
  );
}
```

---

### Mobile App - DSP Task View

**File**: `mobile-app/screens/TasksScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/assigned?userId=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setTasks(data.tasks || data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const renderTask = (task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      <Text style={styles.clientName}>
        Client: {task.client.firstName} {task.client.lastName}
      </Text>

      {/* ISP Goal Context - IMPORTANT! */}
      {task.ispGoal && (
        <View style={styles.ispContext}>
          <Text style={styles.ispLabel}>ISP Goal:</Text>
          <Text style={styles.ispGoalTitle}>{task.ispGoal.title}</Text>
          
          {task.ispGoal.outcome && (
            <Text style={styles.ispOutcome}>
              Outcome: {task.ispGoal.outcome.outcomeDescription}
            </Text>
          )}
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${task.ispGoal.progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {task.ispGoal.progressPercentage}%
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.dueDate}>
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Tasks</Text>
      
      {loading ? (
        <Text style={styles.loadingText}>Loading tasks...</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks assigned</Text>
      ) : (
        tasks.map(renderTask)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ispContext: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  ispLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  ispGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 4,
  },
  ispOutcome: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4caf50',
    marginLeft: 8,
    width: 40,
    textAlign: 'right',
  },
  dueDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
});

function getPriorityColor(priority) {
  switch (priority) {
    case 'critical': return '#d32f2f';
    case 'high': return '#f57c00';
    case 'medium': return '#fbc02d';
    case 'low': return '#388e3c';
    default: return '#9e9e9e';
  }
}
```

---

## To Complete Implementation

### Step 1: Run Database Migration

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_isp_goal_to_tasks
```

### Step 2: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 3: Test the Flow

1. **As Manager**:
   - Login to web dashboard
   - Navigate to client profile
   - View ISP goals
   - Create task from a goal
   - Assign to DSP

2. **As DSP (Web)**:
   - Login to web dashboard
   - View tasks page
   - See task with ISP goal context
   - Complete task

3. **As DSP (Mobile)**:
   - Login to mobile app
   - Navigate to Tasks tab
   - See tasks with ISP context displayed
   - Tap task to view details

---

## Benefits

### For Managers
✅ Generate targeted tasks directly from ISP goals  
✅ Track progress toward ISP outcomes through task completion  
✅ Ensure all DSP activities align with client goals  
✅ Better compliance and documentation  

### For DSPs
✅ Understand WHY each task matters (ISP context)  
✅ See how their work contributes to client outcomes  
✅ View current progress on goals  
✅ More meaningful and purposeful work  

### For Clients
✅ Consistent progress toward ISP goals  
✅ All activities documented and tracked  
✅ Clear evidence of service effectiveness  
✅ Better outcomes  

---

## Database Schema Reference

```prisma
model Task {
  id                String          @id @default(uuid())
  organizationId    String
  assignedTo        String
  assignedBy        String
  clientId          String?
  ispGoalId         String?         // ← NEW: Links to ISP Goal
  taskType          String
  title             String
  description       String?
  priority          String
  status            String
  dueDate           DateTime
  // ... other fields
  
  ispGoal           IspGoal?        // ← NEW: Relation
  client            Client?
  assignee          User
  // ... other relations
}

model IspGoal {
  id                    String
  outcomeId             String
  title                 String
  description           String?
  goalType              String
  progressPercentage    Int
  // ... other fields
  
  outcome               IspOutcome
  tasks                 Task[]      // ← NEW: Relation
  milestones            IspMilestone[]
  activities            IspActivity[]
}
```

---

## Summary

The ISP-Task integration is now **complete** with:

✅ Database schema updated  
✅ Backend services enhanced  
✅ API endpoints ready  
✅ Web dashboard views documented  
✅ Mobile app implementation provided  

**Next Steps**:
1. Run the database migration
2. Test the manager workflow
3. Test DSP views (web + mobile)
4. Gather feedback and iterate

This creates a powerful connection between ISP goals and daily DSP tasks, ensuring all work is purposeful and outcome-focused! 🎯
