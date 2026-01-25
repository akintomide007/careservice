# CARE PROVIDER SYSTEM - DEVELOPMENT PROMPT FOR CLINE

## PROJECT OVERVIEW
Build a comprehensive care provider management system using a hybrid architecture that replaces handwritten documentation with a digital solution integrated with Microsoft 365.

**Architecture Choice: Hybrid Approach (Option 3)**
- Custom React Native mobile app for field staff (DSPs)
- Custom Node.js/Express backend API
- PostgreSQL primary database
- Microsoft 365 integration via Graph API
- Power Apps administrative portal
- Microsoft Dataverse for Power Platform data
- Power Automate for workflows
- Teams for approvals and notifications
- SharePoint for document storage
- Power BI for analytics

---

## PHASE 1: MVP (Start Here)

### OBJECTIVE
Build the core system with time tracking, digital progress notes, incident reporting, and Teams approval workflow.

### 1.1 BACKEND SETUP

**Technology Stack:**
- Node.js with Express.js
- PostgreSQL database
- TypeScript
- Azure AD authentication (MSAL)
- Microsoft Graph SDK
- JWT for session management
- Prisma ORM

**Database Schema (PostgreSQL):**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    azure_ad_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL, -- 'dsp', 'behavior_specialist', 'manager', 'admin'
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    ddd_id VARCHAR(50) UNIQUE,
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISP Outcomes table
CREATE TABLE isp_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    outcome_description TEXT NOT NULL,
    category VARCHAR(100), -- 'community_participation', 'daily_living', 'behavioral', 'vocational', etc.
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'achieved', 'discontinued'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service sessions (Clock in/out)
CREATE TABLE service_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    service_type VARCHAR(100) NOT NULL, -- 'community_based_support', 'individual_support', 'respite', 'behavioral_support', 'vocational_support'
    clock_in_time TIMESTAMP NOT NULL,
    clock_in_location GEOGRAPHY(POINT, 4326), -- GPS coordinates
    clock_out_time TIMESTAMP,
    clock_out_location GEOGRAPHY(POINT, 4326),
    total_hours DECIMAL(5, 2),
    location_name VARCHAR(255), -- 'Home', 'Community', 'Café', etc.
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress notes
CREATE TABLE progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES service_sessions(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    staff_id UUID REFERENCES users(id),
    service_type VARCHAR(100) NOT NULL,
    service_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    isp_outcome_id UUID REFERENCES isp_outcomes(id),
    reason_for_service TEXT,
    supports_provided TEXT,
    individual_response JSONB, -- {engagement: '', affect: '', communication: '', examples: ''}
    progress_assessment VARCHAR(50), -- 'met', 'partially_met', 'not_met'
    progress_notes TEXT,
    safety_dignity_notes TEXT,
    next_steps TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected', 'revisions_requested'
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    sharepoint_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities (within progress notes)
CREATE TABLE progress_note_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_note_id UUID REFERENCES progress_notes(id) ON DELETE CASCADE,
    activity_number INTEGER NOT NULL,
    task_goal TEXT NOT NULL,
    supports_provided TEXT,
    prompt_level VARCHAR(50)[], -- Array: ['independent', 'verbal', 'gestural', 'model']
    objective_observation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media attachments
CREATE TABLE media_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_note_id UUID REFERENCES progress_notes(id) ON DELETE CASCADE,
    incident_report_id UUID REFERENCES incident_reports(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'audio'
    file_url TEXT NOT NULL,
    azure_blob_path TEXT,
    thumbnail_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds INTEGER, -- for video/audio
    transcription TEXT, -- for audio files
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incident reports
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    staff_id UUID REFERENCES users(id),
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    location VARCHAR(255),
    location_gps GEOGRAPHY(POINT, 4326),
    employee_statement TEXT,
    client_statement TEXT,
    action_taken TEXT,
    severity VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    incident_type VARCHAR(100), -- 'fall', 'behavioral', 'medical', 'safety', 'other'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'under_review', 'resolved', 'escalated'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    sharepoint_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signatures
CREATE TABLE digital_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_note_id UUID REFERENCES progress_notes(id) ON DELETE CASCADE,
    incident_report_id UUID REFERENCES incident_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    signature_type VARCHAR(50), -- 'staff', 'manager', 'supervisor', 'office_staff'
    signature_data TEXT, -- Base64 signature image or typed name
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info TEXT
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'clock_in', 'clock_out'
    entity_type VARCHAR(100), -- 'progress_note', 'incident_report', 'service_session'
    entity_id UUID,
    changes JSONB, -- Store before/after values
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams notifications log
CREATE TABLE teams_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_note_id UUID REFERENCES progress_notes(id),
    incident_report_id UUID REFERENCES incident_reports(id),
    recipient_user_id UUID REFERENCES users(id),
    notification_type VARCHAR(100), -- 'approval_request', 'incident_alert', 'reminder'
    teams_message_id VARCHAR(255),
    adaptive_card_json JSONB,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_taken VARCHAR(50), -- 'approved', 'rejected', 'changes_requested', 'pending'
    action_taken_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_progress_notes_status ON progress_notes(status);
CREATE INDEX idx_progress_notes_client ON progress_notes(client_id);
CREATE INDEX idx_progress_notes_staff ON progress_notes(staff_id);
CREATE INDEX idx_service_sessions_staff ON service_sessions(staff_id);
CREATE INDEX idx_service_sessions_client ON service_sessions(client_id);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);
```

**Backend API Endpoints:**

```
Authentication:
POST   /api/auth/login              - Azure AD OAuth login
POST   /api/auth/refresh            - Refresh JWT token
POST   /api/auth/logout             - Logout user

Users:
GET    /api/users                   - List all users (admin only)
GET    /api/users/:id               - Get user details
PUT    /api/users/:id               - Update user
POST   /api/users                   - Create user (admin only)

Clients:
GET    /api/clients                 - List all clients
GET    /api/clients/:id             - Get client details
POST   /api/clients                 - Create client
PUT    /api/clients/:id             - Update client
GET    /api/clients/:id/isp-outcomes - Get client's ISP outcomes

Service Sessions:
POST   /api/sessions/clock-in       - Clock in (create session)
PUT    /api/sessions/:id/clock-out  - Clock out (end session)
GET    /api/sessions/my-sessions    - Get current user's sessions
GET    /api/sessions/active         - Get active sessions

Progress Notes:
GET    /api/progress-notes          - List progress notes (with filters)
GET    /api/progress-notes/:id      - Get progress note details
POST   /api/progress-notes          - Create progress note
PUT    /api/progress-notes/:id      - Update progress note
POST   /api/progress-notes/:id/submit - Submit for approval
POST   /api/progress-notes/:id/approve - Approve note (manager only)
POST   /api/progress-notes/:id/reject  - Reject note (manager only)
POST   /api/progress-notes/:id/request-changes - Request changes
GET    /api/progress-notes/:id/pdf - Generate and download PDF

Incident Reports:
GET    /api/incidents               - List incidents (with filters)
GET    /api/incidents/:id           - Get incident details
POST   /api/incidents               - Create incident report
PUT    /api/incidents/:id           - Update incident
POST   /api/incidents/:id/submit    - Submit incident

Media:
POST   /api/media/upload            - Upload photo/video/audio
GET    /api/media/:id               - Get media file
DELETE /api/media/:id               - Delete media file

Dashboard:
GET    /api/dashboard/stats         - Get dashboard statistics
GET    /api/dashboard/pending-approvals - Get pending approvals for manager

Microsoft Graph Integration:
POST   /api/graph/send-teams-card   - Send adaptive card to Teams
POST   /api/graph/upload-to-sharepoint - Upload document to SharePoint
GET    /api/graph/user-presence     - Get user presence status
```

**Environment Variables (.env):**
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/care_provider_db

# Azure AD
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback

# Microsoft Graph API
GRAPH_API_SCOPE=https://graph.microsoft.com/.default

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=care-provider-media

# SharePoint
SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/CareProvider
SHAREPOINT_DOCUMENT_LIBRARY=ProgressNotes

# Server
PORT=3001
NODE_ENV=development

# Power Automate
POWER_AUTOMATE_WEBHOOK_URL=your_webhook_url
```

**Key Backend Implementations:**

1. **Microsoft Graph Integration Service** (`src/services/graphService.ts`):
```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

export class GraphService {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.AZURE_AD_TENANT_ID!,
      process.env.AZURE_AD_CLIENT_ID!,
      process.env.AZURE_AD_CLIENT_SECRET!
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        }
      }
    });
  }

  // Send adaptive card to Teams
  async sendTeamsApprovalCard(managerId: string, progressNote: any) {
    const adaptiveCard = this.buildApprovalCard(progressNote);
    
    const chatMessage = {
      body: {
        contentType: 'html',
        content: adaptiveCard
      }
    };

    await this.client
      .api(`/users/${managerId}/chats`)
      .post(chatMessage);
  }

  // Upload to SharePoint
  async uploadToSharePoint(fileName: string, fileBuffer: Buffer, metadata: any) {
    const driveItem = await this.client
      .api(`/sites/${process.env.SHAREPOINT_SITE_ID}/drive/root:/${fileName}:/content`)
      .put(fileBuffer);

    // Add metadata
    await this.client
      .api(`/sites/${process.env.SHAREPOINT_SITE_ID}/drive/items/${driveItem.id}/listItem/fields`)
      .update(metadata);

    return driveItem.webUrl;
  }

  private buildApprovalCard(note: any) {
    return {
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        {
          type: "TextBlock",
          text: "Progress Note Approval Request",
          weight: "Bolder",
          size: "Large"
        },
        {
          type: "FactSet",
          facts: [
            { title: "Client:", value: note.clientName },
            { title: "Service Type:", value: note.serviceType },
            { title: "Date:", value: note.serviceDate },
            { title: "Staff:", value: note.staffName }
          ]
        },
        {
          type: "TextBlock",
          text: note.summary,
          wrap: true
        }
      ],
      actions: [
        {
          type: "Action.Http",
          title: "Approve",
          method: "POST",
          url: `${process.env.API_BASE_URL}/api/progress-notes/${note.id}/approve`,
          style: "positive"
        },
        {
          type: "Action.Http",
          title: "Request Changes",
          method: "POST",
          url: `${process.env.API_BASE_URL}/api/progress-notes/${note.id}/request-changes`,
          style: "default"
        },
        {
          type: "Action.Http",
          title: "Reject",
          method: "POST",
          url: `${process.env.API_BASE_URL}/api/progress-notes/${note.id}/reject`,
          style: "destructive"
        }
      ]
    };
  }
}
```

### 1.2 MOBILE APP (React Native)

**Technology Stack:**
- React Native (Expo framework recommended for easier development)
- TypeScript
- React Navigation for routing
- Axios for API calls
- React Native Paper or NativeBase for UI components
- React Native Async Storage for offline data
- React Native Camera for photo/video
- Expo Location for GPS
- Expo Audio for voice recording
- React Native Voice for speech-to-text

**App Structure:**
```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── clock/
│   │   │   ├── ClockInScreen.tsx
│   │   │   └── ClockOutScreen.tsx
│   │   ├── progressNotes/
│   │   │   ├── ProgressNoteListScreen.tsx
│   │   │   ├── CreateProgressNoteScreen.tsx
│   │   │   ├── ActivityFormScreen.tsx
│   │   │   └── ProgressNoteDetailScreen.tsx
│   │   ├── incidents/
│   │   │   ├── IncidentReportScreen.tsx
│   │   │   └── IncidentListScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── PromptLevelPicker.tsx
│   │   ├── VoiceRecorder.tsx
│   │   ├── PhotoCapture.tsx
│   │   ├── SignaturePad.tsx
│   │   └── ClientSelector.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   └── location.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   └── useOfflineSync.ts
│   ├── store/
│   │   ├── authSlice.ts
│   │   ├── notesSlice.ts
│   │   └── store.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── validation.ts
│       └── formatting.ts
├── App.tsx
└── package.json
```

**Key Mobile App Screens:**

1. **Clock In Screen:**
- Client selector dropdown
- Service type selector (CBS, Individual Support, Respite, Behavioral, Vocational)
- GPS location capture (automatic)
- Location name input (manual override)
- Start time (auto-populated, editable)
- "Clock In" button

2. **Progress Note Creation Screen:**
- Auto-populated from clock-in data
- ISP outcome selector
- Reason for service (text area)
- Activity section (repeatable):
  - Task/Goal input
  - Supports provided input
  - Prompt level checkboxes (Independent, Verbal, Gestural, Model)
  - Objective observation (text + voice-to-text button)
  - Photo/video capture button
- Individual Response section:
  - Engagement/Compliance dropdown
  - Affect/Mood dropdown
  - Communication notes
  - Observed examples
- Progress assessment (Met, Partially Met, Not Met)
- Safety & dignity notes
- Next steps
- Digital signature
- Save as draft / Submit for approval buttons

3. **Incident Report Screen:**
- Date/time pickers
- Location input + GPS capture
- Employee statement (text + voice-to-text)
- Client statement (text + voice-to-text)
- Action taken
- Severity selector
- Incident type selector
- Photo/video capture
- Submit button

**Sample React Native Component (PromptLevelPicker):**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface PromptLevelPickerProps {
  selected: string[];
  onChange: (levels: string[]) => void;
}

const PROMPT_LEVELS = [
  { id: 'independent', label: 'Independent', color: '#10b981' },
  { id: 'verbal', label: 'Verbal', color: '#3b82f6' },
  { id: 'gestural', label: 'Gestural', color: '#f59e0b' },
  { id: 'model', label: 'Model', color: '#ef4444' }
];

export const PromptLevelPicker: React.FC<PromptLevelPickerProps> = ({ selected, onChange }) => {
  const toggleLevel = (levelId: string) => {
    if (selected.includes(levelId)) {
      onChange(selected.filter(id => id !== levelId));
    } else {
      onChange([...selected, levelId]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Prompt Level Used</Text>
      <View style={styles.checkboxContainer}>
        {PROMPT_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.checkboxItem,
              selected.includes(level.id) && { backgroundColor: `${level.color}15` }
            ]}
            onPress={() => toggleLevel(level.id)}
          >
            <Checkbox
              status={selected.includes(level.id) ? 'checked' : 'unchecked'}
              color={level.color}
            />
            <Text style={[styles.checkboxLabel, { color: level.color }]}>
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  }
});
```

### 1.3 POWER AUTOMATE WORKFLOWS

**Create these flows in Power Automate:**

**Flow 1: Progress Note Approval Request**
- Trigger: When a new record is created in Dataverse (Progress Notes table with status = 'pending_approval')
- Action 1: Get manager details from Users table
- Action 2: Compose adaptive card JSON
- Action 3: Post adaptive card to Teams channel/chat
- Action 4: Log notification in Teams Notifications table

**Flow 2: Approval Action Handler**
- Trigger: When adaptive card action is submitted
- Condition: Check which button was clicked (Approve/Reject/Request Changes)
- If Approve:
  - Action 1: HTTP call to Backend API to approve note
  - Action 2: Update card to show approved status
  - Action 3: Send notification to DSP
- If Reject:
  - Action 1: HTTP call to Backend API to reject note
  - Action 2: Update card to show rejected status
  - Action 3: Send notification to DSP and supervisor
- If Request Changes:
  - Action 1: HTTP call to Backend API to request changes
  - Action 2: Update card to show changes requested
  - Action 3: Send notification to DSP

**Flow 3: Incident Alert**
- Trigger: When incident report is created with severity = 'high' or 'critical'
- Action 1: Post urgent message to Teams incident channel
- Action 2: Send email to supervisor
- Action 3: Create task in Microsoft Planner for follow-up
- Action 4: Send push notification to on-call manager

**Flow 4: Daily Summary Report**
- Trigger: Recurrence (Daily at 5:00 PM)
- Action 1: Query Dataverse for today's approved notes
- Action 2: Compose summary report
- Action 3: Send email to managers
- Action 4: Post to Teams channel

### 1.4 SHAREPOINT SETUP

**Site Structure:**
```
Care Provider Portal (SharePoint Site)
├── Progress Notes (Document Library)
│   ├── Columns (Metadata):
│   │   - ClientName (Text)
│   │   - ServiceType (Choice)
│   │   - ServiceDate (Date)
│   │   - StaffName (Text)
│   │   - Status (Choice)
│   │   - ApprovedBy (Person)
│   │   - ApprovedDate (Date)
│   └── Folders (organized by Client Name)
├── Incident Reports (Document Library)
│   └── Similar metadata structure
├── ISP Plans (Document Library)
└── Training Materials (Document Library)
```

**Permissions:**
- DSPs: Read access to their own notes
- Managers: Read/Write to all notes, Approve permissions
- Admins: Full control

---

## DEVELOPMENT TASKS FOR CLINE - PHASE 1

### Task 1: Setup Project Structure
```bash
# Create project directories
mkdir care-provider-system
cd care-provider-system

# Backend setup
mkdir backend
cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install pg @prisma/client
npm install @azure/identity @microsoft/microsoft-graph-client
npm install jsonwebtoken bcrypt dotenv cors helmet
npm install --save-dev @types/jsonwebtoken @types/bcrypt @types/cors
npx tsc --init

# Initialize Prisma
npx prisma init

# Mobile app setup
cd ..
npx create-expo-app mobile-app --template typescript
cd mobile-app
npm install @react-navigation/native @react-navigation/stack
npm install axios react-native-paper
npm install @react-native-async-storage/async-storage
npm install expo-location expo-camera expo-av
```

### Task 2: Implement Backend API
1. Set up PostgreSQL database with schema provided above
2. Configure Prisma schema
3. Implement authentication endpoints with Azure AD
4. Implement CRUD endpoints for:
   - Service sessions (clock in/out)
   - Progress notes
   - Incident reports
   - Clients
5. Implement Microsoft Graph integration service
6. Set up file upload to Azure Blob Storage
7. Implement PDF generation for progress notes
8. Set up audit logging

### Task 3: Implement Mobile App
1. Set up authentication flow with Azure AD
2. Implement home screen with daily client list
3. Implement clock in/out screens with GPS
4. Implement progress note creation flow:
   - Client selection
   - Service type selection
   - Activity forms (repeatable)
   - Prompt level pickers
   - Photo/video capture
   - Voice-to-text for observations
   - Digital signature
5. Implement incident report form
6. Implement offline storage and sync
7. Set up push notifications

### Task 4: Configure Power Automate
1. Create Dataverse tables mirroring PostgreSQL schema
2. Set up data sync from PostgreSQL to Dataverse
3. Create approval workflow with adaptive cards
4. Create incident alert workflow
5. Set up daily summary report workflow

### Task 5: Configure SharePoint
1. Create site collection
2. Set up document libraries
3. Configure metadata columns
4. Set up permissions
5. Create folder structure

### Task 6: Testing & Integration
1. Test end-to-end flow:
   - DSP clocks in → Creates note → Submits
   - Manager receives Teams card → Approves
   - Note saved to SharePoint → DSP notified
2. Test incident reporting flow
3. Test offline functionality
4. Test GPS accuracy
5. Performance testing

---

## ACCEPTANCE CRITERIA FOR PHASE 1

✅ DSP can clock in/out with GPS verification
✅ DSP can create all 5 types of progress notes offline
✅ DSP can attach photos and use voice-to-text
✅ Notes automatically submit to manager via Teams
✅ Manager receives adaptive card in Teams
✅ Manager can approve/reject from Teams
✅ Approved notes auto-save to SharePoint as PDF
✅ DSP receives approval notification
✅ Incident reports send immediate alerts
✅ All data syncs to Dataverse for Power Apps
✅ Audit trail logs all actions
✅ System works offline with sync on reconnect

---

## PHASE 2 & 3 PREVIEW (Future Development)

**Phase 2:**
- Enhanced voice-to-text with speaker identification
- Advanced photo/video capabilities
- ISP outcome tracking dashboard
- Prompt level analytics
- Power BI embedded reports
- Rights documentation forms
- Family portal (view-only access)

**Phase 3:**
- AI-assisted note completion
- Fall detection via audio analysis
- Camera integration for incident detection
- Predictive analytics for ISP outcomes
- Advanced workflow automation
- Integration with electronic health records

---

## TECHNICAL NOTES

**Security:**
- All API endpoints require Azure AD authentication
- Use HTTPS only
- Implement rate limiting
- Encrypt sensitive data at rest
- Use parameterized queries to prevent SQL injection
- Implement CORS properly
- Regular security audits

**Performance:**
- Use database indexes on frequently queried columns
- Implement caching for reference data
- Optimize image uploads (compress before upload)
- Use pagination for list views
- Implement lazy loading in mobile app

**Compliance:**
- HIPAA compliance for data handling
- Audit logs for all data access and modifications
- Data retention policies (7 years for care records)
- User consent for photo/video capture
- Regular compliance reviews

---

## CLINE DEVELOPMENT CHECKLIST

When you start development with Cline, follow this order:

1. ✅ Set up PostgreSQL database with schema
2. ✅ Initialize backend project with Express + TypeScript
3. ✅ Set up Prisma ORM and run migrations
4. ✅ Implement Azure AD authentication
5. ✅ Implement service session endpoints (clock in/out)
6. ✅ Implement progress note CRUD endpoints
7. ✅ Implement Microsoft Graph integration
8. ✅ Set up Azure Blob Storage for media
9. ✅ Initialize React Native app
10. ✅ Implement authentication in mobile app
11. ✅ Implement clock in/out screens
12. ✅ Implement progress note forms
13. ✅ Implement photo/video capture
14. ✅ Implement voice-to-text
15. ✅ Set up offline storage
16. ✅ Configure Power Automate workflows
17. ✅ Set up SharePoint document libraries
18. ✅ Test end-to-end approval workflow
19. ✅ Test incident reporting
20. ✅ Deploy to staging environment

---

## HELPFUL RESOURCES

**Microsoft Graph API:**
- https://learn.microsoft.com/en-us/graph/overview
- https://learn.microsoft.com/en-us/graph/api/channel-post-messages

**Adaptive Cards:**
- https://adaptivecards.io/
- https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-reference#adaptive-card

**React Native:**
- https://reactnative.dev/docs/getting-started
- https://docs.expo.dev/

**Power Automate:**
- https://learn.microsoft.com/en-us/power-automate/

**Prisma ORM:**
- https://www.prisma.io/docs/

---

## ADDITIONAL INSTRUCTIONS FOR CLINE

- Write clean, well-documented TypeScript code
- Follow REST API best practices
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch
- Add input validation for all API endpoints
- Write unit tests for critical functions
- Use environment variables for all configuration
- Follow mobile app best practices (responsive design, accessibility)
- Optimize for performance (lazy loading, caching)
- Follow security best practices (sanitize inputs, use HTTPS, etc.)
- Create a comprehensive README.md with setup instructions
- Document all API endpoints in a separate API.md file
- Create a DEPLOYMENT.md with deployment instructions

Good luck! Start with Task 1 and work through systematically.
