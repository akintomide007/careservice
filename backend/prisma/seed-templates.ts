import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFormTemplates() {
  console.log('Seeding form templates...');

  // Community-Based Support Progress Note Template
  const cbsTemplate = await prisma.formTemplate.create({
    data: {
      name: 'Community-Based Support Progress Note',
      description: 'Standard template for community-based support documentation',
      formType: 'progress_note',
      serviceType: 'Community-Based Support',
      isActive: true,
      isDefault: true,
      sections: {
        create: [
          {
            title: 'Service Information',
            description: 'Basic service details',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Service Type',
                  fieldType: 'select',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify([
                    'Community-Based Support',
                    'Individual Support - Daily Living',
                    'Respite',
                    'Behavioral Support',
                    'Career Planning / Vocational'
                  ])
                },
                {
                  label: 'Reason for Service',
                  fieldType: 'select',
                  orderIndex: 2,
                  isRequired: true,
                  options: JSON.stringify([
                    'ISP goal support',
                    'Community participation',
                    'Social skills development',
                    'Daily living skills',
                    'Behavioral support',
                    'Recreation/leisure'
                  ]),
                  helpText: 'Select the primary reason for today\'s service'
                }
              ]
            }
          },
          {
            title: 'Activity',
            description: 'Document service activities',
            orderIndex: 2,
            isRepeatable: true,
            maxRepeat: 5,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Task/Goal',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true,
                  placeholder: 'What was the activity or goal?',
                  helpText: 'Describe the specific task or goal for this activity'
                },
                {
                  label: 'Supports Provided',
                  fieldType: 'multiselect',
                  orderIndex: 2,
                  isRequired: true,
                  options: JSON.stringify([
                    'Verbal prompting',
                    'Visual cues/aids',
                    'Modeling behavior',
                    'Gestural prompts',
                    'Physical guidance',
                    'Task analysis/breakdown',
                    'Positive reinforcement',
                    'Environmental modification'
                  ])
                },
                {
                  label: 'Prompt Level',
                  fieldType: 'checkbox',
                  orderIndex: 3,
                  isRequired: true,
                  options: JSON.stringify([
                    'Independent',
                    'Verbal',
                    'Gestural',
                    'Model'
                  ]),
                  helpText: 'Select all prompt levels used'
                },
                {
                  label: 'Objective Observation',
                  fieldType: 'textarea',
                  orderIndex: 4,
                  isRequired: true,
                  placeholder: 'What did you observe?',
                  helpText: 'Objectively describe what happened'
                }
              ]
            }
          },
          {
            title: 'Individual Response',
            description: 'Document the individual\'s response to service',
            orderIndex: 3,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Engagement/Compliance',
                  fieldType: 'select',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify([
                    'Fully engaged, cooperative',
                    'Mostly engaged, some redirection needed',
                    'Partially engaged',
                    'Minimal engagement',
                    'Required significant support'
                  ])
                },
                {
                  label: 'Affect/Mood',
                  fieldType: 'select',
                  orderIndex: 2,
                  isRequired: true,
                  options: JSON.stringify([
                    'Happy, positive',
                    'Calm, neutral',
                    'Anxious',
                    'Frustrated',
                    'Agitated',
                    'Withdrawn'
                  ])
                },
                {
                  label: 'Communication',
                  fieldType: 'textarea',
                  orderIndex: 3,
                  isRequired: false,
                  placeholder: 'How did the individual communicate?',
                  helpText: 'Describe communication methods used'
                }
              ]
            }
          },
          {
            title: 'Progress Assessment',
            description: 'Assess progress toward goals',
            orderIndex: 4,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Progress Toward Outcome',
                  fieldType: 'radio',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify([
                    'Met - Goal achieved',
                    'Partially met - Progress made',
                    'Not met - No progress',
                    'Regression - Step backward'
                  ])
                },
                {
                  label: 'Progress Notes',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: true,
                  placeholder: 'Document overall progress and observations...',
                  helpText: 'Provide detailed notes on progress'
                }
              ]
            }
          },
          {
            title: 'Safety & Next Steps',
            description: 'Safety notes and future planning',
            orderIndex: 5,
            isRequired: false,
            fields: {
              create: [
                {
                  label: 'Safety and Dignity Notes',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: false,
                  placeholder: 'Any safety or dignity concerns?'
                },
                {
                  label: 'Next Steps',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: false,
                  placeholder: 'What should be done in future sessions?',
                  helpText: 'Plans for continuing progress'
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Incident Report Template
  const incidentTemplate = await prisma.formTemplate.create({
    data: {
      name: 'Standard Incident Report',
      description: 'Template for reporting incidents',
      formType: 'incident_report',
      isActive: true,
      isDefault: true,
      sections: {
        create: [
          {
            title: 'Incident Details',
            description: 'Basic incident information',
            orderIndex: 1,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Incident Type',
                  fieldType: 'select',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify([
                    'Behavioral',
                    'Medical',
                    'Safety',
                    'Medication Error',
                    'Fall/Injury',
                    'Property Damage',
                    'Other'
                  ])
                },
                {
                  label: 'Severity Level',
                  fieldType: 'radio',
                  orderIndex: 2,
                  isRequired: true,
                  options: JSON.stringify([
                    'Low',
                    'Medium',
                    'High',
                    'Critical'
                  ])
                },
                {
                  label: 'Location',
                  fieldType: 'text',
                  orderIndex: 3,
                  isRequired: false,
                  placeholder: 'Where did the incident occur?'
                }
              ]
            }
          },
          {
            title: 'Statements',
            description: 'Incident descriptions',
            orderIndex: 2,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Employee Statement',
                  fieldType: 'textarea',
                  orderIndex: 1,
                  isRequired: true,
                  placeholder: 'Describe what happened from your perspective...',
                  helpText: 'Provide a detailed account of the incident'
                },
                {
                  label: 'Client Statement (if applicable)',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: false,
                  placeholder: 'Document the client\'s account of the incident...'
                }
              ]
            }
          },
          {
            title: 'Response',
            description: 'Actions taken',
            orderIndex: 3,
            isRequired: true,
            fields: {
              create: [
                {
                  label: 'Action Taken',
                  fieldType: 'multiselect',
                  orderIndex: 1,
                  isRequired: true,
                  options: JSON.stringify([
                    'Redirected to appropriate behavior',
                    'Provided calming strategies',
                    'Contacted supervisor',
                    'Called emergency services',
                    'Documented and monitored',
                    'Modified environment',
                    'Administered first aid',
                    'Notified family/guardian'
                  ])
                },
                {
                  label: 'Additional Details',
                  fieldType: 'textarea',
                  orderIndex: 2,
                  isRequired: false,
                  placeholder: 'Any additional information about actions taken...'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Form templates seeded successfully!');
  console.log(`- Progress Note Template: ${cbsTemplate.id}`);
  console.log(`- Incident Report Template: ${incidentTemplate.id}`);
}

seedFormTemplates()
  .catch((e) => {
    console.error('Error seeding form templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
