import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed...');

  // Create 10 Organizations
  const organizations = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      return prisma.organization.create({
        data: {
          name: `Care Organization ${i + 1}`,
          subdomain: `org${i + 1}`,
          domain: `org${i + 1}.careservice.com`,
          logo: `/logos/org${i + 1}.png`,
          primaryColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
          plan: i < 3 ? 'enterprise' : i < 7 ? 'professional' : 'basic',
          maxUsers: i < 3 ? 200 : i < 7 ? 100 : 50,
          maxClients: i < 3 ? 500 : i < 7 ? 200 : 100
        }
      });
    })
  );

  console.log(`Created ${organizations.length} organizations`);

  // Create Users (Admin, Managers, DSPs) for each organization
  const allUsers = [];
  for (const org of organizations) {
    // 1 Admin
    const admin = await prisma.user.create({
      data: {
        organizationId: org.id,
        azureAdId: `azure-admin-${org.subdomain}`,
        email: `admin@${org.subdomain}.com`,
        password: await hashPassword('Admin123!'),
        firstName: 'Admin',
        lastName: org.name.split(' ')[2],
        role: 'admin',
        phone: '555-0100',
        isActive: true
      }
    });
    allUsers.push(admin);

    // 2 Managers
    for (let m = 0; m < 2; m++) {
      const manager = await prisma.user.create({
        data: {
          organizationId: org.id,
          azureAdId: `azure-mgr-${org.subdomain}-${m}`,
          email: `manager${m + 1}@${org.subdomain}.com`,
          password: await hashPassword('Manager123!'),
          firstName: `Manager${m + 1}`,
          lastName: org.name.split(' ')[2],
          role: 'manager',
          phone: `555-02${m}0`,
          isActive: true
        }
      });
      allUsers.push(manager);
    }

    // 2 DSPs per organization
    for (let d = 0; d < 2; d++) {
      const dsp = await prisma.user.create({
        data: {
          organizationId: org.id,
          azureAdId: `azure-dsp-${org.subdomain}-${d}`,
          email: `dsp${d + 1}@${org.subdomain}.com`,
          password: await hashPassword('Dsp123!'),
          firstName: `DSP${d + 1}`,
          lastName: org.name.split(' ')[2],
          role: 'dsp',
          phone: `555-03${d}0`,
          isActive: true
        }
      });
      allUsers.push(dsp);
    }
  }

  console.log(`Created ${allUsers.length} users`);

  // Create Clients (3 per organization)
  const allClients = [];
  for (const org of organizations) {
    for (let c = 0; c < 3; c++) {
      const client = await prisma.client.create({
        data: {
          organizationId: org.id,
          firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'][c % 6],
          lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][c % 5],
          dateOfBirth: new Date(1990 + c, c % 12, (c * 3) % 28 + 1),
          dddId: `DDD-${org.subdomain.toUpperCase()}-${String(c + 1).padStart(3, '0')}`,
          address: `${100 + c * 50} Main Street, City, State 12345`,
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '555-9999',
          isActive: true
        }
      });
      allClients.push(client);
    }
  }

  console.log(`Created ${allClients.length} clients`);

  // Seed Service Strategies for each organization
  for (const org of organizations) {
    const strategies = [
      // Behavioral Support
      { category: 'behavioral_support', name: 'Positive Reinforcement', description: 'Use positive reinforcement techniques' },
      { category: 'behavioral_support', name: 'Redirection', description: 'Redirect attention to appropriate activity' },
      { category: 'behavioral_support', name: 'Choice Offering', description: 'Offer choices to increase autonomy' },
      { category: 'behavioral_support', name: 'Environmental Modification', description: 'Modify environment to reduce triggers' },
      
      // Communication
      { category: 'communication', name: 'Visual Supports', description: 'Use visual aids and schedules' },
      { category: 'communication', name: 'Simple Language', description: 'Use clear, simple language' },
      { category: 'communication', name: 'Active Listening', description: 'Practice active listening techniques' },
      
      // Social Skills
      { category: 'social_skills', name: 'Modeling', description: 'Model appropriate social behavior' },
      { category: 'social_skills', name: 'Role Playing', description: 'Practice through role-play scenarios' },
      
      // Daily Living
      { category: 'daily_living', name: 'Task Analysis', description: 'Break tasks into smaller steps' },
      { category: 'daily_living', name: 'Hand-over-Hand', description: 'Provide physical guidance' },
      
      // Vocational
      { category: 'vocational', name: 'Job Coaching', description: 'Provide on-site job coaching' },
      
      // Health & Wellness
      { category: 'health_wellness', name: 'Exercise Program', description: 'Implement exercise activities' },
      
      // Community Integration
      { category: 'community_integration', name: 'Community Outings', description: 'Facilitate community activities' }
    ];

    await prisma.serviceStrategy.createMany({
      data: strategies.map((s, idx) => ({
        organizationId: org.id,
        category: s.category,
        name: s.name,
        description: s.description,
        orderIndex: idx + 1,
        isActive: true
      }))
    });
  }

  console.log('Created service strategies for all organizations');

  // Create ISP Outcomes and Goals for clients
  for (const client of allClients) {
    const outcome = await prisma.ispOutcome.create({
      data: {
        clientId: client.id,
        outcomeDescription: 'Increase independence in daily living activities',
        category: 'daily_living',
        status: 'active',
        overallProgress: Math.floor(Math.random() * 60) + 20,
        reviewFrequency: 'quarterly'
      }
    });

    // Create 2 goals per outcome
    for (let g = 0; g < 2; g++) {
      await prisma.ispGoal.create({
        data: {
          outcomeId: outcome.id,
          title: g === 0 ? 'Meal Preparation Skills' : 'Personal Hygiene',
          description: `Develop ${g === 0 ? 'meal preparation' : 'hygiene'} skills with minimal support`,
          goalType: 'skill_development',
          status: 'active',
          priority: 'high',
          progressPercentage: Math.floor(Math.random() * 50) + 25,
          frequency: 'daily'
        }
      });
    }
  }

  console.log('Created ISP outcomes and goals');

  // Create Tasks
  const taskTypes = ['progress_note', 'incident_report', 'training', 'audit', 'documentation'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (const org of organizations) {
    const orgUsers = allUsers.filter(u => u.organizationId === org.id);
    const managers = orgUsers.filter(u => u.role === 'manager');
    const dsps = orgUsers.filter(u => u.role === 'dsp');
    const orgClients = allClients.filter(c => c.organizationId === org.id);

    // Create 5 tasks per DSP
    for (const dsp of dsps) {
      for (let t = 0; t < 5; t++) {
        const manager = managers[t % managers.length];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (t - 2)); // Some overdue, some upcoming

        await prisma.task.create({
          data: {
            organizationId: org.id,
            assignedTo: dsp.id,
            assignedBy: manager.id,
            clientId: t < 3 ? orgClients[t % orgClients.length].id : undefined,
            taskType: taskTypes[t % taskTypes.length],
            title: `${taskTypes[t % taskTypes.length].replace('_', ' ').toUpperCase()} - ${t + 1}`,
            description: `Complete ${taskTypes[t % taskTypes.length]} for assigned client`,
            priority: priorities[t % priorities.length],
            status: t === 0 ? 'completed' : t === 1 ? 'in_progress' : 'pending',
            dueDate,
            estimatedHours: 2 + (t % 3),
            startedAt: t === 1 ? new Date() : t === 0 ? new Date(Date.now() - 86400000) : undefined,
            completedAt: t === 0 ? new Date() : undefined,
            actualHours: t === 0 ? 2.5 : undefined
          }
        });
      }
    }
  }

  console.log('Created tasks');

  // Create Violations
  const violationTypes = ['attendance', 'documentation', 'client_care', 'conduct', 'compliance'];
  const severities = ['minor', 'moderate', 'major', 'critical'];
  
  for (const org of organizations) {
    const orgUsers = allUsers.filter(u => u.organizationId === org.id);
    const managers = orgUsers.filter(u => u.role === 'manager');
    const dsps = orgUsers.filter(u => u.role === 'dsp');
    
    // Create 3 violations per organization
    for (let v = 0; v < 3; v++) {
      const dsp = dsps[v % dsps.length];
      const manager = managers[v % managers.length];
      const severity = severities[v % severities.length];
      const points = { minor: 1, moderate: 3, major: 7, critical: 12 }[severity];

      await prisma.violation.create({
        data: {
          organizationId: org.id,
          userId: dsp.id,
          reportedBy: manager.id,
          violationType: violationTypes[v % violationTypes.length],
          severity,
          status: v === 0 ? 'resolved' : 'open',
          incidentDate: new Date(Date.now() - v * 86400000 * 7),
          description: `${violationTypes[v % violationTypes.length]} violation - needs attention`,
          points,
          resolvedBy: v === 0 ? manager.id : undefined,
          resolvedAt: v === 0 ? new Date() : undefined,
          resolution: v === 0 ? 'Violation addressed through coaching' : undefined
        }
      });
    }
  }

  console.log('Created violations');

  console.log('Comprehensive seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
