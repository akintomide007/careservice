# ISP Goals → Tasks Workflow Guide

## 🎯 Complete Step-by-Step Testing Guide

Your system is working! Now let's create some test data to see the ISP-Task integration in action.

---

## Step 1: Create ISP Outcome (As Manager)

### API Request:
```bash
POST http://localhost:3000/api/isp-outcomes/outcomes
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "clientId": "YOUR_CLIENT_ID",
  "outcomeDescription": "Increase independence in daily living activities",
  "category": "Independent Living",
  "targetDate": "2026-12-31",
  "status": "active"
}
```

### Or using curl:
```bash
curl -X POST http://localhost:3000/api/isp-outcomes/outcomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": "YOUR_CLIENT_ID",
    "outcomeDescription": "Increase independence in daily living activities",
    "category": "Independent Living",
    "targetDate": "2026-12-31",
    "status": "active"
  }'
```

**Save the returned `outcome.id` - you'll need it!**

---

## Step 2: Create ISP Goal (As Manager)

### API Request:
```bash
POST http://localhost:3000/api/isp-goals/goals
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "outcomeId": "OUTCOME_ID_FROM_STEP_1",
  "title": "Prepare breakfast independently",
  "description": "Learn to prepare simple breakfast meals including cereal, toast, and beverages",
  "goalType": "skill_building",
  "priority": "high",
  "targetDate": "2026-06-30",
  "frequency": "daily",
  "status": "active",
  "measurementCriteria": {
    "criteria": "Complete breakfast preparation with no more than verbal prompts 4 out of 5 days",
    "evidence": ["Staff observation", "Photo documentation"]
  }
}
```

**Save the returned `goal.id` - you'll need it!**

---

## Step 3: Create Task from ISP Goal (As Manager)

### API Request:
```bash
POST http://localhost:3000/api/tasks
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "organizationId": "YOUR_ORG_ID",
  "assignedTo": "DSP_USER_ID",
  "assignedBy": "YOUR_MANAGER_ID",
  "clientId": "YOUR_CLIENT_ID",
  "ispGoalId": "GOAL_ID_FROM_STEP_2",
  "taskType": "isp_goal_activity",
  "title": "Practice breakfast preparation with John",
  "description": "Work on making toast and cereal - focus on safe toaster use",
  "priority": "high",
  "dueDate": "2026-03-10T09:00:00Z",
  "estimatedHours": 1,
  "checklistItems": [
    "Gather breakfast materials",
    "Practice using toaster safely",
    "Prepare cereal and beverage",
    "Document progress and observations"
  ]
}
```

---

## Step 4: View Tasks as DSP

### Web Dashboard:
Navigate to: `http://localhost:3000/dashboard/tasks`

You should now see your task with:
- ✅ Task title and description
- ✅ Client information
- ✅ ISP Goal context (title, outcome, progress)
- ✅ Due date and priority

### Mobile App:
Navigate to the Tasks tab

You should see the same task with:
- ✅ Task card with ISP goal highlighted in blue
- ✅ Progress bar showing goal progress
- ✅ ISP outcome description
- ✅ All task details

---

## Quick Test Using Existing Data

If you already have clients in your system, here's a quick test:

### 1. Get Your Client ID:
```bash
curl -X GET "http://localhost:3000/api/clients" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create Test Outcome:
```bash
curl -X POST http://localhost:3000/api/isp-outcomes/outcomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": "CLIENT_ID_HERE",
    "outcomeDescription": "Test Outcome - Increase Daily Living Skills",
    "category": "Daily Living",
    "status": "active"
  }'
```

### 3. Create Test Goal (use outcomeId from step 2):
```bash
curl -X POST http://localhost:3000/api/isp-goals/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "outcomeId": "OUTCOME_ID",
    "title": "Morning Routine Practice",
    "description": "Practice morning hygiene and dressing",
    "goalType": "skill_building",
    "priority": "high",
    "status": "active"
  }'
```

### 4. Create Test Task (use goalId from step 3):
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "YOUR_ORG_ID",
    "assignedTo": "DSP_USER_ID",
    "assignedBy": "MANAGER_USER_ID",
    "clientId": "CLIENT_ID",
    "ispGoalId": "GOAL_ID",
    "taskType": "isp_goal_activity",
    "title": "Morning Routine Practice Session",
    "description": "Work on morning routine skills",
    "priority": "high",
    "dueDate": "2026-03-10T09:00:00Z"
  }'
```

---

## Using Postman or Thunder Client

1. **Import Collection**: Create requests for each endpoint above
2. **Set Environment Variables**:
   - `BASE_URL`: http://localhost:3000
   - `TOKEN`: Your authentication token
   - `ORG_ID`: Your organization ID
   - `CLIENT_ID`: Test client ID
   - `DSP_USER_ID`: DSP user ID
   - `MANAGER_USER_ID`: Manager user ID

3. **Run in Sequence**:
   - Create Outcome → Save ID
   - Create Goal → Save ID  
   - Create Task with Goal ID
   - View tasks as DSP

---

## Troubleshooting

### "No tasks found" in Web Dashboard:
✅ **Expected** if no tasks have been created yet
- Create a task using the API above
- Refresh the page

### "All tasks completed" in Mobile App:
✅ **Expected** if no pending tasks exist
- Create a task and assign it to your DSP user
- Pull to refresh in the app

### Task doesn't show ISP context:
- Verify the task has `ispGoalId` set
- Check the goal exists in database
- Ensure goal has associated outcome

### API Errors:
- Check authentication token is valid
- Verify all IDs (clientId, outcomeId, goalId) exist
- Ensure user has proper permissions

---

## What You Should See

### Web Dashboard - Task with ISP Context:
```
┌─────────────────────────────────────────────┐
│ Practice breakfast preparation with John     │
│ Priority: High | Due: Mar 10, 2026          │
│                                              │
│ Client: John Doe                             │
│                                              │
│ ISP Goal: Prepare breakfast independently   │
│ Outcome: Increase independence in daily liv..│
│ Progress: 45% ████████░░░░░░░░░░░           │
│                                              │
│ ☐ Gather breakfast materials                │
│ ☐ Practice using toaster safely             │
│ ☐ Document progress                         │
└─────────────────────────────────────────────┘
```

### Mobile App - Task Card:
```
┌─────────────────────────────────────────────┐
│ Practice breakfast preparation  │ HIGH      │
│ Client: John Doe                            │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ ISP Goal:                               │ │
│ │ Prepare breakfast independently         │ │
│ │ Outcome: Increase independence in...    │ │
│ │ Progress: ████████░░░░░░░░░░░ 45%      │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Due: Mar 10, 2026                           │
└─────────────────────────────────────────────┘
```

---

## Manager UI Views (Future Enhancement)

The backend is ready! Consider creating these UI pages:

### 1. ISP Goals Page (`/dashboard/isp-goals`)
- List all client ISP outcomes and goals
- Visual progress indicators
- "Create Task" button on each goal
- Quick task assignment to DSPs

### 2. Client Profile Enhancement
- ISP tab showing outcomes and goals
- Progress timeline
- Quick actions to generate tasks

### 3. Task Creation Modal
- Dropdown to select ISP goal (auto-populated)
- Goal context displayed
- Pre-fill task details from goal

---

## Summary

✅ **Backend**: Fully implemented and working  
✅ **Database**: Schema updated with ISP-Task relations  
✅ **API**: All endpoints support ISP context  
✅ **Mobile App**: Displays ISP information  
✅ **Web Dashboard**: Ready to display ISP tasks  

**Next Step**: Create test data using the APIs above, then you'll see the ISP context in both web and mobile! 🎯

---

## Need Help?

If you need help creating test data, let me know and I can:
1. Create a seed script with sample ISP data
2. Build a simple UI for creating ISP goals
3. Add bulk task generation from goals
