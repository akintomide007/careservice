import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createDefaultFormTemplates(organizationId: string) {
  console.log(`Creating default form templates for organization: ${organizationId}`);

  const formTemplates = [
    {
      name: 'Incident Report Form',
      description: 'Standard incident report form for documenting any incidents during service',
      formType: 'incident_report',
      sections: [
        {
          title: 'Employee Information',
          orderIndex: 0,
          isRequired: true,
          fields: [
            { label: 'Employee Name', fieldType: 'text', orderIndex: 0, isRequired: true, placeholder: 'Enter your full name' },
            { label: 'Date of Incident', fieldType: 'date', orderIndex: 1, isRequired: true },
            { label: 'Time of Incident', fieldType: 'text', orderIndex: 2, isRequired: true, placeholder: 'e.g., 2:30 PM' }
          ]
        },
        {
          title: 'Incident Details',
          orderIndex: 1,
          isRequired: true,
          fields: [
            { label: 'Employee Statement of Incident', fieldType: 'textarea', orderIndex: 0, isRequired: true, placeholder: 'Describe what happened in detail...' },
            { label: 'Client Name', fieldType: 'text', orderIndex: 1, isRequired: true },
            { label: 'Client Statement of Incident', fieldType: 'textarea', orderIndex: 2, isRequired: false, placeholder: 'If applicable, describe client\'s account of the incident' },
            { label: 'What action has been taken to resolve this matter?', fieldType: 'textarea', orderIndex: 3, isRequired: true, placeholder: 'Describe actions taken...' }
          ]
        },
        {
          title: 'Signatures',
          orderIndex: 2,
          isRequired: true,
          fields: [
            { label: 'Employee Signature', fieldType: 'text', orderIndex: 0, isRequired: true, placeholder: 'Type your full name' },
            { label: 'Date', fieldType: 'date', orderIndex: 1, isRequired: true }
          ]
        }
      ]
    },
    {
      name: 'Progress Note - Service Strategies',
      description: 'Standard progress note with service strategies checklist',
      formType: 'progress_note',
      sections: [
        {
          title: 'Service Information',
          orderIndex: 0,
          isRequired: true,
          fields: [
            { label: 'Consumer Name', fieldType: 'text', orderIndex: 0, isRequired: true },
            { label: 'Date', fieldType: 'date', orderIndex: 1, isRequired: true },
            { label: 'Intervention Used During Service Today', fieldType: 'select', orderIndex: 2, isRequired: true, 
              options: JSON.stringify(['Community-Based Support', 'Individual Support - Daily Living', 'Respite', 'Behavioral Support', 'Career Planning/Vocational']) }
          ]
        },
        {
          title: 'Service Strategies (Check at least one, and check all that apply)',
          orderIndex: 1,
          isRequired: true,
          fields: [
            { label: 'Service Strategies Used', fieldType: 'checkbox', orderIndex: 0, isRequired: true,
              options: JSON.stringify([
                'Assistance with Activities of Daily Living (such as getting dressed, eating, personal hygiene, etc.)',
                'Assistance with Increasing Community Participation (such as daily errands, grocery shopping, restaurant, purchasing items, travel training, etc.)',
                'Assistance with Increasing Independence (such as helping the individual learn to do laundry, cook, clean, dress, grocery shop, pay for items, etc.)',
                'Assistance with On-The-Job Support (such as safety awareness, using bus passes, meal preparation, doing the task, etc.)',
                'Assistance with Learning Activities (such as basic tutoring – math, reading, writing, support in attending a class, etc.)'
              ]),
              helpText: 'Check all that apply'
            }
          ]
        },
        {
          title: 'Daily Objectives',
          orderIndex: 2,
          isRequired: true,
          fields: [
            { label: 'What is your Objective/Goal for today? Was this goal achieved?', fieldType: 'textarea', orderIndex: 0, isRequired: true, placeholder: 'Describe today\'s goal and whether it was achieved...' },
            { label: 'List the activities that were completed during service today', fieldType: 'textarea', orderIndex: 1, isRequired: true, placeholder: 'List all completed activities...' }
          ]
        },
        {
          title: 'Intervention Used During Service',
          description: '(check at least one; and check all that apply)',
          orderIndex: 3,
          isRequired: true,
          fields: [
            { label: 'Prompts/Interventions', fieldType: 'checkbox', orderIndex: 0, isRequired: true,
              options: JSON.stringify(['Verbal prompt/Reminders', 'Verbal direction', 'Modeling', 'Physical Assistance', 'Hand over hand assistance', 'Gestural prompt', 'Visual schedule/cue', 'Encouraged Problem Solving', 'Reflective supportive listening']) }
          ]
        },
        {
          title: 'Consumer Response',
          description: '(Include the consumer\'s response by checking the following. Check at least one; and check all that apply)',
          orderIndex: 4,
          isRequired: true,
          fields: [
            { label: 'Response', fieldType: 'checkbox', orderIndex: 0, isRequired: true,
              options: JSON.stringify(['Refused', 'Successful Response to Staff\'s Support', 'Unsuccessful Response to Staff\'s Support']) }
          ]
        },
        {
          title: 'Signature',
          orderIndex: 5,
          isRequired: true,
          fields: [
            { label: 'Employee\'s Signature', fieldType: 'text', orderIndex: 0, isRequired: true, placeholder: 'Type your full name' },
            { label: 'Date', fieldType: 'date', orderIndex: 1, isRequired: true }
          ]
        }
      ]
    }
  ];

  // Create each template
  for (const template of formTemplates) {
    await prisma.formTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        formType: template.formType as any,
        organizationId,
        isActive: true,
        sections: {
          create: template.sections.map((section: any) => ({
            title: section.title,
            description: section.description,
            orderIndex: section.orderIndex,
            isRequired: section.isRequired,
            isRepeatable: section.isRepeatable,
            maxRepeat: section.maxRepeat,
            fields: {
              create: section.fields.map((field: any) => ({
                label: field.label,
                fieldType: field.fieldType,
                orderIndex: field.orderIndex,
                isRequired: field.isRequired,
                placeholder: field.placeholder,
                helpText: field.helpText,
                defaultValue: field.defaultValue,
                options: field.options
              }))
            }
          }))
        }
      }
    });
  }

  console.log(`✅ Created ${formTemplates.length} default form templates`);
}
