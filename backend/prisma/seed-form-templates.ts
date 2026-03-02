import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFormTemplatesForOrg(org: any) {
  console.log(`📋 Creating form templates for: ${org.name}...`);

  // 1. Incident Report Form
  const existingIncident = await prisma.formTemplate.findFirst({
    where: {
      name: 'Incident Report Form',
      organizationId: org.id
    }
  });

  const incidentReport = existingIncident || await prisma.formTemplate.create({
    data: {
      name: 'Incident Report Form',
      description: 'Standard incident report form for documenting any incidents during service',
      formType: 'incident_report',
      organizationId: org.id,
      isActive: true,
      sections: {
        create: [
          {
            title: 'Employee Information',
            orderIndex: 0,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Employee Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Enter your full name'
                },
                {
                  label: 'Date of Incident',
                  fieldType: 'date',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Time of Incident',
                  fieldType: 'text',
                  orderIndex: 2,
                  isRequired: true,
                  placeholder: 'e.g., 2:30 PM'
                }
              ]
            }
          },
          {
            title: 'Incident Details',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Employee Statement of Incident',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Describe what happened in detail...'
                },
                {
                  label: 'Client Name',
                  fieldType: 'text',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Client Statement of Incident',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: false,
                  placeholder: 'If applicable, describe client\'s account of the incident'
                },
                {
                  label: 'What action has been taken to resolve this matter?',
                  fieldType: 'textarea',
                  orderIndex: 3,
                  isRequired: true,
                  placeholder: 'Describe actions taken...'
                }
              ]
            }
          },
          {
            title: 'Signatures',
            orderIndex: 2,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Employee Signature',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Type your full name'
                },
                {
                  label: 'Date',
                  fieldType: 'date',
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

  // 2. Progress Note - Service Strategies
  const existingProgress = await prisma.formTemplate.findFirst({
    where: {
      name: 'Progress Note - Service Strategies',
      organizationId: org.id
    }
  });

  const progressNoteServiceStrategies = existingProgress || await prisma.formTemplate.create({
    data: {
      name: 'Progress Note - Service Strategies',
      description: 'Standard progress note with service strategies checklist',
      formType: 'progress_note',
      organizationId: org.id,
      isActive: true,
      sections: {
        create: [
          {
            title: 'Service Information',
            orderIndex: 0,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Consumer Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Date',
                  fieldType: 'date',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Intervention Used During Service Today',
                  fieldType: 'select',
                  orderIndex: 2,
                  isRequired: true,
                  options: JSON.stringify([
                    'Community-Based Support',
                    'Individual Support - Daily Living',
                    'Respite',
                    'Behavioral Support',
                    'Career Planning/Vocational'
                  ])
                }
              ]
            }
          },
          {
            title: 'Service Strategies (Check at least one, and check all that apply)',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Service Strategies Used',
                  fieldType: 'checkbox',
                  orderIndex: 0,
                  isRequired: true,
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
            }
          },
          {
            title: 'Daily Objectives',
            orderIndex: 2,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'What is your Objective/Goal for today? Was this goal achieved?',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Describe today\'s goal and whether it was achieved...'
                },
                {
                  label: 'List the activities that were completed during service today',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true,
                  placeholder: 'List all completed activities...'
                }
              ]
            }
          },
          {
            title: 'Intervention Used During Service',
            description: '(check at least one; and check all that apply)',
            orderIndex: 3,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Prompts/Interventions',
                  fieldType: 'checkbox',
                  orderIndex: 0,
                  isRequired: true,
                  options: JSON.stringify([
                    'Verbal prompt/Reminders',
                    'Verbal direction',
                    'Modeling',
                    'Physical Assistance',
                    'Hand over hand assistance',
                    'Gestural prompt',
                    'Visual schedule/cue',
                    'Encouraged Problem Solving',
                    'Reflective supportive listening'
                  ])
                }
              ]
            }
          },
          {
            title: 'Consumer Response',
            description: '(Include the consumer\'s response by checking the following. Check at least one; and check all that apply)',
            orderIndex: 4,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Response',
                  fieldType: 'checkbox',
                  orderIndex: 0,
                  isRequired: true,
                  options: JSON.stringify([
                    'Refused',
                    'Successful Response to Staff\'s Support',
                    'Unsuccessful Response to Staff\'s Support'
                  ])
                }
              ]
            }
          },
          {
            title: 'Signature',
            orderIndex: 5,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Employee\'s Signature',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Type your full name'
                },
                {
                  label: 'Date',
                  fieldType: 'date',
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

  // 3. Community-Based Support (CBS) Progress Note - Detailed
  const existingCBS = await prisma.formTemplate.findFirst({
    where: {
      name: 'CBS Progress Note - Detailed',
      organizationId: org.id
    }
  });

  const cbsProgressNote = existingCBS || await prisma.formTemplate.create({
    data: {
      name: 'CBS Progress Note - Detailed',
      description: 'Comprehensive Community-Based Support progress note with multiple activities',
      formType: 'progress_note',
      organizationId: org.id,
      isActive: true,
      sections: {
        create: [
          {
            title: 'Service Information',
            orderIndex: 0,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Individual Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'DOB',
                  fieldType: 'date',
                  orderIndex: 1,
                  isRequired: false
                },
                {
                  label: 'DDD ID',
                  fieldType: 'text',
                  orderIndex: 2,
                  isRequired: false
                },
                {
                  label: 'Date of Service',
                  fieldType: 'date',
                  orderIndex: 3,
                  isRequired: true
                },
                {
                  label: 'Service Type',
                  fieldType: 'select',
                  orderIndex: 4,
                  isRequired: true,
                  options: JSON.stringify([
                    'Community-Based Support',
                    'Individual Support - Daily Living',
                    'Respite',
                    'Behavioral Support',
                    'Career Planning/Vocational'
                  ])
                },
                {
                  label: 'Start Time',
                  fieldType: 'text',
                  orderIndex: 5,
                  isRequired: true,
                  placeholder: 'e.g., 9:30 AM'
                },
                {
                  label: 'End Time',
                  fieldType: 'text',
                  orderIndex: 6,
                  isRequired: true,
                  placeholder: 'e.g., 11:30 AM'
                },
                {
                  label: 'Location of Service',
                  fieldType: 'text',
                  orderIndex: 7,
                  isRequired: true,
                  placeholder: 'e.g., Local Café and Grocery Store'
                },
                {
                  label: 'Staff Provided',
                  fieldType: 'text',
                  orderIndex: 8,
                  isRequired: true,
                  placeholder: 'Your name and title'
                },
                {
                  label: 'ISP Outcome(s) Addressed',
                  fieldType: 'textarea',
                  orderIndex: 9,
                  isRequired: true,
                  placeholder: 'e.g., Increase independence in community participation'
                }
              ]
            }
          },
          {
            title: '1. Reason for Service',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Reason for Service',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Explain why service was provided today and how it relates to ISP goals...'
                }
              ]
            }
          },
          {
            title: '2. Objective Description of Activities',
            description: 'You can add multiple activities',
            orderIndex: 2,
            isRequired: true,
            isRepeatable: true,
            maxRepeat: 5,
            fields: {
              create: [
                {
                  label: 'Activity Title',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'e.g., Ordering Snack at Café'
                },
                {
                  label: 'Task/Goal',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true,
                  placeholder: 'What was the specific goal for this activity?'
                },
                {
                  label: 'Supports Provided',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: true,
                  placeholder: 'List all supports (visual cues, modeling, prompting, etc.)'
                },
                {
                  label: 'Prompt Level Used',
                  fieldType: 'checkbox',
                  orderIndex: 3,
                  isRequired: true,
                  options: JSON.stringify([
                    'Independent',
                    'Verbal',
                    'Gestural',
                    'Model'
                  ])
                },
                {
                  label: 'Objective Observation',
                  fieldType: 'textarea',
                  orderIndex: 4,
                  isRequired: true,
                  placeholder: 'Describe exactly what happened, what the individual did...'
                }
              ]
            }
          },
          {
            title: '3. Supports and Prompting Provided',
            orderIndex: 3,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'List all supports and prompting strategies used',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'e.g., Task analysis, visual cards, prompting hierarchy, wait time, reinforcement...'
                }
              ]
            }
          },
          {
            title: '4. Individual Response',
            orderIndex: 4,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Engagement/Compliance',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'How engaged was the individual? Did they follow instructions?'
                },
                {
                  label: 'Affect/Mood',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true,
                  placeholder: 'Describe the individual\'s mood and emotional state'
                },
                {
                  label: 'Communication',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: true,
                  placeholder: 'How did the individual communicate? Verbal, gestural, etc.'
                },
                {
                  label: 'Observed Examples',
                  fieldType: 'textarea',
                  orderIndex: 3,
                  isRequired: true,
                  placeholder: 'Provide specific examples of behaviors observed'
                }
              ]
            }
          },
          {
            title: '5. Progress Toward Outcome',
            orderIndex: 5,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Progress Summary',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Was the outcome met? Provide details...'
                },
                {
                  label: 'Status',
                  fieldType: 'radio',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify(['Met', 'Partially Met', 'Not Met'])
                }
              ]
            }
          },
          {
            title: '6. Safety and Dignity',
            orderIndex: 6,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Safety and dignity notes',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'Describe how safety and dignity were maintained...'
                }
              ]
            }
          },
          {
            title: '7. Next Steps',
            orderIndex: 7,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Next steps and recommendations',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'What should be done in the next session?'
                }
              ]
            }
          },
          {
            title: 'Staff Signature',
            orderIndex: 8,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Staff Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Title',
                  fieldType: 'text',
                  orderIndex: 1,
                  isRequired: true,
                  defaultValue: 'DSP'
                },
                {
                  label: 'Date',
                  fieldType: 'date',
                  orderIndex: 2,
                  isRequired: true
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 4. Individual Support (Daily Living Skills) Progress Note
  const existingDaily = await prisma.formTemplate.findFirst({
    where: {
      name: 'Individual Support - Daily Living',
      organizationId: org.id
    }
  });

  const dailyLivingNote = existingDaily || await prisma.formTemplate.create({
    data: {
      name: 'Individual Support - Daily Living',
      description: 'Progress note for daily living skills support',
      formType: 'progress_note',
      organizationId: org.id,
      isActive: true,
      sections: {
        create: [
          {
            title: 'Service Information',
            orderIndex: 0,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Individual Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Date of Service',
                  fieldType: 'date',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Start/End Time',
                  fieldType: 'text',
                  orderIndex: 2,
                  isRequired: true,
                  placeholder: 'e.g., 1:00 PM – 2:30 PM'
                },
                {
                  label: 'Location of Service',
                  fieldType: 'text',
                  orderIndex: 3,
                  isRequired: true
                },
                {
                  label: 'ISP Outcome(s) Addressed',
                  fieldType: 'textarea',
                  orderIndex: 4,
                  isRequired: true
                }
              ]
            }
          },
          {
            title: 'Reason for Service',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Reason',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true
                }
              ]
            }
          },
          {
            title: 'Activities',
            orderIndex: 2,
            isRequired: true,
            isRepeatable: true,
            maxRepeat: 5,
            fields: {
              create: [
                {
                  label: 'Activity Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true,
                  placeholder: 'e.g., Brushing Teeth'
                },
                {
                  label: 'Task/Goal',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Supports Provided',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: true
                },
                {
                  label: 'Prompt Level',
                  fieldType: 'checkbox',
                  orderIndex: 3,
                  isRequired: true,
                  options: JSON.stringify(['Independent', 'Verbal', 'Gestural', 'Model'])
                },
                {
                  label: 'Observation',
                  fieldType: 'textarea',
                  orderIndex: 4,
                  isRequired: true
                }
              ]
            }
          },
          {
            title: 'Individual Response',
            orderIndex: 3,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Engagement/Compliance',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Affect/Mood',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true
                },
                {
                  label: 'Communication',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: true
                }
              ]
            }
          },
          {
            title: 'Progress & Next Steps',
            orderIndex: 4,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Progress Toward Outcome',
                  fieldType: 'textarea',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Next Steps',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true
                }
              ]
            }
          },
          {
            title: 'Signature',
            orderIndex: 5,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Staff Name',
                  fieldType: 'text',
                  orderIndex: 0,
                  isRequired: true
                },
                {
                  label: 'Date',
                  fieldType: 'date',
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

  console.log('✅ Form templates created for organization!');
  console.log(`   - ${incidentReport.name}`);
  console.log(`   - ${progressNoteServiceStrategies.name}`);
  console.log(`   - ${cbsProgressNote.name}`);
  console.log(`   - ${dailyLivingNote.name}`);
}

async function seedFormTemplates() {
  console.log('🔄 Seeding form templates for ALL organizations...');

  // Get all organizations
  const orgs = await prisma.organization.findMany();
  
  if (orgs.length === 0) {
    console.log('⚠️  No organizations found. Please run main seed first.');
    return;
  }

  console.log(`Found ${orgs.length} organization(s). Creating form templates...`);

  // Create form templates for each organization
  for (const org of orgs) {
    await createFormTemplatesForOrg(org);
  }

  console.log('\n✅ All form templates seeded successfully!');
}

async function main() {
  try {
    await seedFormTemplates();
  } catch (error) {
    console.error('Error seeding form templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
