import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFormResponses() {
  console.log('🌱 Seeding form responses...');

  try {
    // Get the first organization
    const org = await prisma.organization.findFirst();
    if (!org) {
      console.log('❌ No organization found. Please run main seed first.');
      return;
    }

    // Get users
    const dsp = await prisma.user.findFirst({
      where: { organizationId: org.id, role: 'dsp' }
    });
    
    const manager = await prisma.user.findFirst({
      where: { organizationId: org.id, role: 'manager' }
    });

    if (!dsp || !manager) {
      console.log('❌ No DSP or Manager found. Please run main seed first.');
      return;
    }

    // Get form templates
    const templates = await prisma.formTemplate.findMany({
      where: { organizationId: org.id },
      take: 4
    });

    if (templates.length === 0) {
      console.log('❌ No form templates found. Please run form template seed first.');
      return;
    }

    console.log(`✅ Found ${templates.length} templates`);

    // Create submitted form responses (pending review)
    const submittedResponses = [];
    for (let i = 0; i < 3; i++) {
      const template = templates[i % templates.length];
      const response = await prisma.formResponse.create({
        data: {
          templateId: template.id,
          userId: dsp.id,
          status: 'submitted',
          submittedAt: new Date(Date.now() - i * 86400000), // Stagger dates
          responseData: {
            'Client Name': `Test Client ${i + 1}`,
            'Service Date': new Date().toISOString().split('T')[0],
            'Start Time': '09:00 AM',
            'End Time': '11:00 AM',
            'Activities': `Completed activity session ${i + 1}. Client participated actively and showed good progress.`,
            'Observations': `Client demonstrated improved social skills and communication during today's session.`,
            'Goals Addressed': ['Independence', 'Social Skills', 'Communication'],
            'Staff Signature': `${dsp.firstName} ${dsp.lastName}`,
            'Notes': `Session ${i + 1} completed successfully. Client is making steady progress toward their ISP goals.`
          }
        }
      });
      submittedResponses.push(response);
    }

    console.log(`✅ Created ${submittedResponses.length} submitted form responses`);

    // Create approved form responses
    const approvedResponses = [];
    for (let i = 0; i < 4; i++) {
      const template = templates[i % templates.length];
      const response = await prisma.formResponse.create({
        data: {
          templateId: template.id,
          userId: dsp.id,
          status: 'approved',
          submittedAt: new Date(Date.now() - (i + 5) * 86400000),
          responseData: {
            'Client Name': `Test Client ${i + 10}`,
            'Service Date': new Date(Date.now() - (i + 5) * 86400000).toISOString().split('T')[0],
            'Start Time': '10:00 AM',
            'End Time': '12:00 PM',
            'Activities': `Completed approved activity ${i + 1}. All goals were met during this session.`,
            'Observations': `Client showed excellent engagement and participation throughout the session.`,
            'Goals Addressed': ['Daily Living Skills', 'Self-Care', 'Independence'],
            'Staff Signature': `${dsp.firstName} ${dsp.lastName}`,
            'Notes': `Approved session ${i + 1}. Client continues to make excellent progress.`,
            '_approval': {
              action: 'approve',
              approverId: manager.id,
              approverName: `${manager.firstName} ${manager.lastName}`,
              approvedAt: new Date(Date.now() - (i + 4) * 86400000).toISOString(),
              comment: 'Excellent documentation. Approved.'
            }
          }
        }
      });
      approvedResponses.push(response);
    }

    console.log(`✅ Created ${approvedResponses.length} approved form responses`);

    // Create rejected form responses
    const rejectedResponses = [];
    for (let i = 0; i < 2; i++) {
      const template = templates[i % templates.length];
      const response = await prisma.formResponse.create({
        data: {
          templateId: template.id,
          userId: dsp.id,
          status: 'rejected',
          submittedAt: new Date(Date.now() - (i + 10) * 86400000),
          responseData: {
            'Client Name': `Test Client ${i + 20}`,
            'Service Date': new Date(Date.now() - (i + 10) * 86400000).toISOString().split('T')[0],
            'Start Time': '02:00 PM',
            'End Time': '04:00 PM',
            'Activities': `Activity ${i + 1} needs more detail.`,
            'Observations': `Additional observations needed.`,
            'Goals Addressed': ['Communication'],
            'Staff Signature': `${dsp.firstName} ${dsp.lastName}`,
            'Notes': `Session ${i + 1} documentation incomplete.`,
            '_approval': {
              action: 'reject',
              approverId: manager.id,
              approverName: `${manager.firstName} ${manager.lastName}`,
              approvedAt: new Date(Date.now() - (i + 9) * 86400000).toISOString(),
              comment: 'Please provide more detailed observations and activities. Resubmit with complete information.'
            }
          }
        }
      });
      rejectedResponses.push(response);
    }

    console.log(`✅ Created ${rejectedResponses.length} rejected form responses`);

    // Summary
    console.log('\n📊 Form Response Seed Summary:');
    console.log(`   Total: ${submittedResponses.length + approvedResponses.length + rejectedResponses.length} responses`);
    console.log(`   - Submitted (Pending): ${submittedResponses.length}`);
    console.log(`   - Approved: ${approvedResponses.length}`);
    console.log(`   - Rejected: ${rejectedResponses.length}`);
    console.log('✅ Form responses seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding form responses:', error);
    throw error;
  }
}

seedFormResponses()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
