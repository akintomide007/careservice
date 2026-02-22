# ISP Goals & Activities System Design

## Overview
Enhance the existing `IspOutcome` system with detailed goal tracking, activities, milestones, and progress measurement for compliance and reporting.

---

## Current State

### Existing IspOutcome Model
```prisma
model IspOutcome {
  id                    String          @id @default(uuid())
  clientId              String
  outcomeDescription    String
  category              String?
  targetDate            DateTime?
  status                String          @default("active")
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  client                Client          @relation(...)
  progressNotes         ProgressNote[]
}
```

**Limitations:**
- Single outcome description (no breakdown)
- No measurable goals or milestones
- No activity tracking
- Limited progress measurement
- No detailed compliance reporting

---

## Enhanced Design

### Hierarchical Structure

```
IspOutcome (High-level outcome)
   IspGoal (Specific, measurable goals)
        IspMilestone (Checkpoints with target dates)
        IspActivity (Actions taken toward goal)
             ProgressNote (Documentation)
```

---

## New Database Models

### 1. IspGoal
**Purpose**: Break outcomes into specific, measurable SMART goals

```prisma
model IspGoal {
  id                    String              @id @default(uuid())
  outcomeId             String              @map("outcome_id")
  title                 String              // "Learn to prepare simple meals"
  description           String?
  goalType              String              @map("goal_type") // "skill_building", "behavior", "health", "social"
  measurementCriteria   Json?               @map("measurement_criteria") // How to measure success
  targetDate            DateTime?           @map("target_date")
  frequency             String?             // "daily", "weekly", "monthly"
  status                String              @default("active") // "active", "in_progress", "completed", "discontinued"
  priority              String              @default("medium") // "low", "medium", "high", "critical"
  progressPercentage    Int                 @default(0) @map("progress_percentage") // 0-100
  completedAt           DateTime?           @map("completed_at")
  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")
  
  outcome               IspOutcome          @relation(fields: [outcomeId], references: [id], onDelete: Cascade)
  milestones            IspMilestone[]
  activities            IspActivity[]
  progressNotes         ProgressNote[]      // Link notes to specific goals

  @@index([outcomeId])
  @@index([status])
  @@map("isp_goals")
}
```

### 2. IspMilestone
**Purpose**: Define checkpoints and target dates for goal achievement

```prisma
model IspMilestone {
  id                    String              @id @default(uuid())
  goalId                String              @map("goal_id")
  title                 String              // "Prepare breakfast independently 3x/week"
  description           String?
  targetDate            DateTime            @map("target_date")
  completionCriteria    String              @map("completion_criteria") // What defines completion
  status                String              @default("pending") // "pending", "in_progress", "achieved", "missed"
  achievedDate          DateTime?           @map("achieved_date")
  notes                 String?             // Staff observations
  orderIndex            Int                 @default(1) @map("order_index")
  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")
  
  goal                  IspGoal             @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
  @@index([status])
  @@map("isp_milestones")
}
```

### 3. IspActivity
**Purpose**: Log specific activities and progress toward goals

```prisma
model IspActivity {
  id                    String              @id @default(uuid())
  goalId                String              @map("goal_id")
  progressNoteId        String?             @map("progress_note_id") // Optional link to note
  staffId               String              @map("staff_id")
  activityDate          DateTime            @map("activity_date")
  activityType          String              @map("activity_type") // "practice", "assessment", "coaching", "observation"
  description           String              // What was done
  duration              Int?                // Minutes spent
  prompts               Json?               // Prompt levels used
  successLevel          String?             @map("success_level") // "independent", "minimal_assist", "moderate_assist", "maximum_assist"
  observations          String?             // Staff notes
  barriers              String?             // Any obstacles encountered
  modifications         String?             // Adjustments made
  progressRating        Int?                @map("progress_rating") // 1-5 scale
  createdAt             DateTime            @default(now()) @map("created_at")
  
  goal                  IspGoal             @relation(fields: [goalId], references: [id], onDelete: Cascade)
  progressNote          ProgressNote?       @relation(fields: [progressNoteId], references: [id])
  staff                 User                @relation(fields: [staffId], references: [id])

  @@index([goalId])
  @@index([staffId])
  @@index([activityDate])
  @@map("isp_activities")
}
```

### 4. Enhanced IspOutcome
**Add computed fields and summary data**

```prisma
model IspOutcome {
  // ... existing fields ...
  
  // New fields
  overallProgress       Int                 @default(0) @map("overall_progress") // 0-100
  lastReviewDate        DateTime?           @map("last_review_date")
  nextReviewDate        DateTime?           @map("next_review_date")
  reviewFrequency       String?             @map("review_frequency") // "quarterly", "biannually", "annually"
  
  // Enhanced relations
  goals                 IspGoal[]           // New relation
}
```

### 5. Enhanced ProgressNote
**Link to specific goals**

```prisma
model ProgressNote {
  // ... existing fields ...
  
  // Enhanced relations
  ispGoalId             String?             @map("isp_goal_id") // Link to specific goal
  ispGoal               IspGoal?            @relation(fields: [ispGoalId], references: [id])
  ispActivities         IspActivity[]       // Activities logged in this note
}
```

---

## Measurement & Progress Tracking

### Progress Calculation
```typescript
interface ProgressMetrics {
  overallProgress: number;        // 0-100
  milestonesAchieved: number;
  milestones Total: number;
  activitiesCompleted: number;
  avgSuccessLevel: string;
  lastActivityDate: Date;
  daysInProgress: number;
  projectedCompletionDate: Date;
}
```

### Success Levels
```typescript
enum SuccessLevel {
  INDEPENDENT = "independent",           // 100% - No assistance needed
  MINIMAL_ASSIST = "minimal_assist",     // 75% - Verbal prompts only
  MODERATE_ASSIST = "moderate_assist",   // 50% - Physical assistance needed
  MAXIMUM_ASSIST = "maximum_assist",     // 25% - Full support required
  NOT_ATTEMPTED = "not_attempted"        // 0% - Did not attempt
}
```

---

## Goal Types & Categories

### Goal Types
- **skill_building** - Daily living skills, vocational skills
- **behavior** - Behavioral improvements, communication
- **health** - Health management, medication, safety
- **social** - Relationships, community participation
- **independence** - Self-advocacy, decision-making

### Activity Types
- **practice** - Skill practice sessions
- **assessment** - Progress assessments
- **coaching** - Training and guidance
- **observation** - Behavioral observations
- **achievement** - Milestone achievements

---

## API Endpoints

### Goals
- `GET /api/clients/:clientId/isp/goals` - List all goals for client
- `GET /api/isp/goals/:id` - Get goal details with progress
- `POST /api/isp/outcomes/:outcomeId/goals` - Create new goal
- `PUT /api/isp/goals/:id` - Update goal
- `DELETE /api/isp/goals/:id` - Delete goal
- `GET /api/isp/goals/:id/progress` - Get detailed progress metrics

### Milestones
- `GET /api/isp/goals/:goalId/milestones` - List milestones
- `POST /api/isp/goals/:goalId/milestones` - Create milestone
- `PUT /api/isp/milestones/:id` - Update milestone
- `PATCH /api/isp/milestones/:id/achieve` - Mark as achieved
- `DELETE /api/isp/milestones/:id` - Delete milestone

### Activities
- `GET /api/isp/goals/:goalId/activities` - List activities
- `POST /api/isp/goals/:goalId/activities` - Log new activity
- `GET /api/isp/activities/:id` - Get activity details
- `PUT /api/isp/activities/:id` - Update activity
- `DELETE /api/isp/activities/:id` - Delete activity

### Reporting
- `GET /api/clients/:clientId/isp/summary` - Overall ISP summary
- `GET /api/clients/:clientId/isp/progress-report` - Detailed progress report
- `GET /api/isp/goals/:id/timeline` - Goal progress timeline
- `GET /api/analytics/isp-compliance` - Organization-wide compliance

---

## Use Cases

### 1. Creating a Goal
```typescript
POST /api/isp/outcomes/:outcomeId/goals
{
  "title": "Prepare breakfast independently",
  "description": "Learn to prepare simple breakfast meals including cereal, toast, and beverages",
  "goalType": "skill_building",
  "targetDate": "2026-12-31",
  "frequency": "daily",
  "measurementCriteria": {
    "criteria": "Complete breakfast preparation with no more than verbal prompts 4 out of 5 days",
    "evidence": ["Staff observation", "Photo documentation", "Self-report"]
  },
  "milestones": [
    {
      "title": "Identify breakfast items",
      "targetDate": "2026-03-31",
      "completionCriteria": "Can identify and gather 5 common breakfast items independently"
    },
    {
      "title": "Use toaster safely",
      "targetDate": "2026-06-30",
      "completionCriteria": "Operates toaster independently with no safety concerns"
    },
    {
      "title": "Prepare complete meal",
      "targetDate": "2026-12-31",
      "completionCriteria": "Prepares entire breakfast with verbal prompts only"
    }
  ]
}
```

### 2. Logging Activity
```typescript
POST /api/isp/goals/:goalId/activities
{
  "activityDate": "2026-02-15T09:00:00Z",
  "activityType": "practice",
  "description": "Practiced making toast and pouring cereal. Client followed steps with visual supports.",
  "duration": 30,
  "successLevel": "moderate_assist",
  "prompts": {
    "verbal": 2,
    "gestural": 1,
    "physical": 0
  },
  "observations": "Client remembered to check toaster setting. Needed reminder about cleanup.",
  "progressRating": 4
}
```

### 3. Progress Report
```typescript
GET /api/clients/:clientId/isp/progress-report?startDate=2026-01-01&endDate=2026-03-31

Response:
{
  "client": {...},
  "reportPeriod": { "start": "2026-01-01", "end": "2026-03-31" },
  "outcomes": [
    {
      "outcome": "Increase community participation",
      "overallProgress": 65,
      "goals": [
        {
          "title": "Prepare breakfast independently",
          "progress": 70,
          "milestonesAchieved": 1,
          "milestonesTotal": 3,
          "activitiesLogged": 45,
          "avgSuccessLevel": "minimal_assist",
          "trend": "improving"
        }
      ]
    }
  ],
  "summary": {
    "totalGoals": 8,
    "goalsCompleted": 2,
    "goalsOnTrack": 5,
    "goalsAtRisk": 1,
    "totalActivities": 156,
    "overallProgress": 62
  }
}
```

---

## Benefits

### For Direct Support Professionals (DSPs)
 Clear, measurable goals to work toward  
 Easy activity logging during sessions  
 Real-time progress visibility  
 Structured documentation  

### For Managers/Care Coordinators
 Progress monitoring across all clients  
 Compliance reporting  
 Identify at-risk goals  
 Resource allocation insights  

### For Clients & Families
 Transparent progress tracking  
 Clear milestones and expectations  
 Evidence of service effectiveness  
 Goal achievement visualization  

### For Regulatory Compliance
 Detailed activity documentation  
 Progress measurement evidence  
 Goal review tracking  
 Outcome reporting  

---

## Implementation Plan

### Phase 1: Database Schema (1-2 hours)
1. Add new models to schema.prisma
2. Create migration
3. Update seed data with examples
4. Generate Prisma client

### Phase 2: Backend Services (2-3 hours)
1. Create ispGoal.service.ts
2. Create ispMilestone.service.ts
3. Create ispActivity.service.ts
4. Progress calculation utilities
5. Reporting services

### Phase 3: API Controllers (1-2 hours)
1. Goal CRUD endpoints
2. Milestone endpoints
3. Activity logging endpoints
4. Progress report endpoints

### Phase 4: Testing (1 hour)
1. Unit tests for services
2. Integration tests
3. Manual API testing
4. Progress calculation validation

**Total Estimated Time**: 5-8 hours

---

## Success Metrics

-  **Goals Per Client**: Average 5-10 active goals
-  **Activity Logging**: 80%+ of sessions documented
-  **Progress Tracking**: Real-time progress percentages
-  **Milestone Achievement**: Track completion rates
-  **Compliance**: 100% goal review compliance

---

## Next Steps

1. Review and approve schema design
2. Implement database changes
3. Create backend services
4. Build API endpoints
5. Update documentation
6. Create UI components (future)

**Status**: Ready for implementation! 
