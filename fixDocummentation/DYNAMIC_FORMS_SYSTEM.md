# Dynamic Forms System Documentation

## Overview

The Care Provider System now includes a comprehensive dynamic forms system that allows staff to fill out survey-style forms based on customizable templates. The system supports both web dashboard and mobile app platforms.

## Features

###  Implemented Features

1. **Dynamic Form Templates**
   - Create reusable form templates via database
   - Support for multiple form types (Progress Notes, Incident Reports, etc.)
   - Service-type specific templates
   - Version control for templates

2. **Form Sections & Fields**
   - Organized into sections with descriptions
   - Repeatable sections (e.g., multiple activities per note)
   - Required vs optional fields
   - Order management

3. **Field Types Supported**
   - Text input
   - Date input
   - Textarea (multi-line text)
   - Select (dropdown)
   - Radio buttons (single choice)
   - Checkboxes (multiple choice)
   - Multi-select

4. **Form Features**
   - Real-time validation
   - Draft saving
   - Submit for approval
   - Repeatable sections (add/remove dynamically)
   - Field-level help text
   - Error messaging

5. **Platform Support**
   -  Web Dashboard (React/Next.js)
   -  Mobile App (React Native)

## Architecture

### Database Schema

```prisma
FormTemplate
 sections (FormSection[])
    fields (FormField[])
 responses (FormResponse[])
```

### Components

#### Web Dashboard
- `/web-dashboard/components/DynamicForm.tsx` - Main form renderer
- `/web-dashboard/app/forms/page.tsx` - Forms selection page
- `/web-dashboard/lib/api.ts` - API client with form methods

#### Mobile App
- `/mobile-app/components/DynamicForm.tsx` - Mobile form renderer
- `/mobile-app/screens/FormsScreen.tsx` - Forms selection screen

### Backend
- `/backend/src/controllers/formTemplate.controller.ts` - Template management
- `/backend/src/services/formTemplate.service.ts` - Business logic
- `/backend/prisma/seed-templates.ts` - Template seeding

## Usage

### For Staff (Filling Out Forms)

#### Web Dashboard
1. Login to dashboard
2. Click "+ Fill Out New Form" button
3. Select a form template
4. Fill out all sections
5. Use "Add Another Activity" for repeatable sections
6. Save as Draft or Submit for Approval

#### Mobile App
1. Login to mobile app
2. Navigate to Forms screen
3. Select a form template
4. Fill out all required fields
5. Submit when complete

### For Administrators (Creating Templates)

Templates are created via the database seeding script:

```bash
cd backend
npx ts-node prisma/seed-templates.ts
```

## Form Templates

### Progress Note Template
Based on the physical forms provided:

**Sections:**
1. **Service Information**
   - Individual name, DOB, DDD ID
   - Date of service, service type
   - Start/end time, location
   - Staff provided
   - ISP Outcomes addressed

2. **Service Strategies** (Checkboxes)
   - Activities of Daily Living
   - Community Participation
   - Increasing Independence
   - On-The-Job Support
   - Learning Activities

3. **Daily Goal and Achievement**
   - Objective/Goal description
   - Achievement status
   - Date

4. **Activity** (Repeatable - up to 5)
   - Task/Goal
   - Supports Provided
   - Prompt Level (Independent, Verbal, Gestural, Model)
   - Objective Observation

5. **Individual Response**
   - Engagement/Compliance level
   - Affect/Mood
   - Communication methods

6. **Progress Assessment**
   - Progress toward outcome (Met/Partially/Not Met/Regression)
   - Detailed progress notes

7. **Safety & Next Steps**
   - Safety and dignity notes
   - Plans for future sessions

### Incident Report Template

**Sections:**
1. **Incident Details**
   - Incident type
   - Severity level
   - Location

2. **Statements**
   - Employee statement
   - Client statement

3. **Response**
   - Actions taken
   - Additional details

## API Endpoints

### Form Templates
- `GET /api/form-templates` - List all active templates
- `GET /api/form-templates/:id` - Get template with sections/fields
- `GET /api/form-templates/default/:formType` - Get default template
- `POST /api/form-templates` - Create new template (admin)
- `PUT /api/form-templates/:id` - Update template (admin)
- `DELETE /api/form-templates/:id` - Soft delete template (admin)

### Form Responses
- `POST /api/form-responses` - Save form response
- `PUT /api/form-responses/:id` - Update form response
- `GET /api/form-responses` - Get user's responses
- `GET /api/form-responses/:id` - Get specific response

## Data Structure

### Form Response Data
Form responses are stored as JSON with keys in the format:
- Non-repeatable: `{sectionId}_{fieldId}`
- Repeatable: `{sectionId}_{repeatIndex}_{fieldId}`

Example:
```json
{
  "section1_field1": "John Doe",
  "section1_field2": "2026-02-15",
  "section2_0_field1": "Community participation",
  "section2_0_field2": ["Verbal prompting", "Visual cues"],
  "section2_1_field1": "Social skills practice",
  "section2_1_field2": ["Modeling behavior"]
}
```

## Validation

- Required fields must be filled before submission
- Checkbox/multiselect must have at least one option if required
- Real-time validation feedback
- Draft saving bypasses validation
- Submission enforces all validation rules

## Future Enhancements

### Planned Features
- [ ] Digital signature capture
- [ ] Conditional field logic (show/hide based on answers)
- [ ] File upload fields
- [ ] PDF generation from responses
- [ ] Offline form filling (mobile)
- [ ] Form analytics and reporting
- [ ] Template builder UI (no-code)
- [ ] Form versioning and migration
- [ ] Pre-fill from previous responses
- [ ] Form templates marketplace

### Digital Signatures
Will support:
- Staff signature
- Manager/supervisor approval signature
- Client signature (where applicable)
- Timestamp and device info capture
- Signature image storage in Azure Blob

## Testing

### Web Dashboard
1. Start backend: `cd backend && npm run dev`
2. Start web dashboard: `cd web-dashboard && npm run dev`
3. Navigate to http://localhost:3001/forms
4. Select a template and test form filling

### Mobile App
1. Start backend: `cd backend && npm run dev`
2. Start mobile app: `cd mobile-app && npm start`
3. Update API_URL in FormsScreen.tsx if needed
4. Login and navigate to Forms
5. Test form filling and submission

## Customization

### Adding New Field Types

1. Update `FormField.fieldType` enum in schema
2. Add rendering logic in `DynamicForm.tsx` (both web and mobile)
3. Update validation logic if needed
4. Test thoroughly

### Creating Custom Templates

Edit `/backend/prisma/seed-templates.ts`:

```typescript
const myTemplate = await prisma.formTemplate.create({
  data: {
    name: 'My Custom Form',
    formType: 'progress_note',
    serviceType: 'My Service Type',
    isDefault: true,
    sections: {
      create: [
        {
          title: 'My Section',
          orderIndex: 1,
          fields: {
            create: [
              {
                label: 'My Field',
                fieldType: 'text',
                orderIndex: 1,
                isRequired: true
              }
            ]
          }
        }
      ]
    }
  }
});
```

## Troubleshooting

### Forms not loading
- Check backend is running
- Verify database has seeded templates
- Check API_URL configuration
- Check browser/app console for errors

### Validation errors
- Ensure all required fields are filled
- Check checkbox/multiselect has at least one option
- Review field-specific validation rules

### Save/submit not working
- Check authentication token is valid
- Verify API endpoint is accessible
- Check network tab for error responses
- Review backend logs for errors

## Security

- All form operations require authentication
- Form responses are user-scoped
- Templates can only be modified by administrators
- Sensitive data encrypted in transit (HTTPS)
- Input validation on both client and server

## Performance

- Templates cached after first load
- Lazy loading of template details
- Optimistic UI updates
- Debounced auto-save (future)
- Pagination for large form lists (future)

## Compliance

Forms system supports:
- HIPAA compliance requirements
- Audit trail (via AuditLog model)
- Data retention policies
- Export capabilities
- Version control

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0
