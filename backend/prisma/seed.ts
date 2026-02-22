import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database with multi-tenant data...\n');
  
  // Create/Update Demo Organization
  console.log(' Creating/updating organizations...');
  const demoOrg = await prisma.organization.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Care Services',
      subdomain: 'demo',
      plan: 'enterprise',
      maxUsers: 999,
      maxClients: 999,
      isActive: true,
      billingStatus: 'active',
      totalUsers: 0,
      totalClients: 0,
      storageUsedMB: 0,
      settings: {
        features: {
          incidentReporting: true,
          gpsTracking: true,
          digitalSignatures: true,
          formBuilder: true
        },
        compliance: {
          requireDualApproval: false,
          mandatoryGPS: true,
          photoRequirement: 'optional'
        }
      }
    }
  });
  
  // Create/Update second organization for testing multi-tenancy
  const acmeOrg = await prisma.organization.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      name: 'ACME Care Provider',
      subdomain: 'acme',
      plan: 'professional',
      maxUsers: 200,
      maxClients: 500,
      isActive: true,
      billingStatus: 'active',
      totalUsers: 0,
      totalClients: 0,
      storageUsedMB: 0,
      primaryColor: '#10B981',
      settings: {
        features: {
          incidentReporting: true,
          gpsTracking: true,
          digitalSignatures: false,
          formBuilder: true
        }
      }
    }
  });
  
  console.log(` Created: ${demoOrg.name} (${demoOrg.subdomain})`);
  console.log(` Created: ${acmeOrg.name} (${acmeOrg.subdomain})\n`);
  
  // Create users for Demo Org
  console.log(' Creating/updating users...');
  const admin = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'admin@careservice.com',
        organizationId: demoOrg.id
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'admin@careservice.com',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      azureAdId: `admin-mock-${demoOrg.id}`,
      isActive: true,
      isSuperAdmin: false
    }
  });
  
  const manager = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'manager@careservice.com',
        organizationId: demoOrg.id
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'manager@careservice.com',
      password: await hashPassword('manager123'),
      firstName: 'Manager',
      lastName: 'Smith',
      role: 'manager',
      azureAdId: `manager-mock-${demoOrg.id}`,
      isActive: true,
      isSuperAdmin: false
    }
  });
  
  const dsp = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'dsp@careservice.com',
        organizationId: demoOrg.id
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'dsp@careservice.com',
      password: await hashPassword('dsp123'),
      firstName: 'John',
      lastName: 'Doe',
      role: 'dsp',
      phone: '555-0123',
      azureAdId: `dsp-mock-${demoOrg.id}`,
      isActive: true,
      isSuperAdmin: false
    }
  });
  
  // Create users for ACME Org
  const acmeManager = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'manager@acme.com',
        organizationId: acmeOrg.id
      }
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      email: 'manager@acme.com',
      password: await hashPassword('manager123'),
      firstName: 'Alice',
      lastName: 'Brown',
      role: 'manager',
      azureAdId: `manager-mock-${acmeOrg.id}`,
      isActive: true,
      isSuperAdmin: false
    }
  });
  
  const acmeDsp = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'dsp@acme.com',
        organizationId: acmeOrg.id
      }
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      email: 'dsp@acme.com',
      password: await hashPassword('dsp123'),
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'dsp',
      azureAdId: `dsp-mock-${acmeOrg.id}`,
      isActive: true,
      isSuperAdmin: false
    }
  });
  
  console.log(` Demo Org - Admin: ${admin.email}`);
  console.log(` Demo Org - Manager: ${manager.email}`);
  console.log(` Demo Org - DSP: ${dsp.email}`);
  console.log(` ACME Org - Manager: ${acmeManager.email}`);
  console.log(` ACME Org - DSP: ${acmeDsp.email}\n`);
  
  // Create clients for Demo Org
  console.log(' Creating/updating clients...');
  
  // Check if clients already exist
  const existingClient1 = await prisma.client.findFirst({
    where: {
      organizationId: demoOrg.id,
      dddId: 'DDD-2024-001'
    }
  });
  
  const client1 = existingClient1 || await prisma.client.create({
    data: {
      organizationId: demoOrg.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1995-03-15'),
      dddId: 'DDD-2024-001',
      address: '123 Main St, City, State 12345',
      emergencyContactName: 'Mary Johnson',
      emergencyContactPhone: '555-0100',
      isActive: true
    }
  });
  
  const existingClient2 = await prisma.client.findFirst({
    where: {
      organizationId: demoOrg.id,
      dddId: 'DDD-2024-002'
    }
  });
  
  const client2 = existingClient2 || await prisma.client.create({
    data: {
      organizationId: demoOrg.id,
      firstName: 'Michael',
      lastName: 'Williams',
      dateOfBirth: new Date('1988-07-22'),
      dddId: 'DDD-2024-002',
      address: '456 Oak Ave, City, State 12345',
      emergencyContactName: 'Robert Williams',
      emergencyContactPhone: '555-0101',
      isActive: true
    }
  });
  
  // Create clients for ACME Org
  const existingAcmeClient1 = await prisma.client.findFirst({
    where: {
      organizationId: acmeOrg.id,
      dddId: 'ACME-2024-001'
    }
  });
  
  const acmeClient1 = existingAcmeClient1 || await prisma.client.create({
    data: {
      organizationId: acmeOrg.id,
      firstName: 'Emma',
      lastName: 'Davis',
      dateOfBirth: new Date('1992-11-08'),
      dddId: 'ACME-2024-001',
      address: '789 Pine Rd, Town, State 12345',
      emergencyContactName: 'James Davis',
      emergencyContactPhone: '555-0200',
      isActive: true
    }
  });
  
  console.log(` Demo Org - ${client1.firstName} ${client1.lastName} (${client1.dddId})`);
  console.log(` Demo Org - ${client2.firstName} ${client2.lastName} (${client2.dddId})`);
  console.log(` ACME Org - ${acmeClient1.firstName} ${acmeClient1.lastName} (${acmeClient1.dddId})\n`);
  
  // Create ISP outcomes
  console.log(' Creating/updating ISP outcomes...');
  
  // Delete existing ISP outcomes for these clients to avoid duplicates
  await prisma.ispOutcome.deleteMany({
    where: {
      clientId: {
        in: [client1.id, client2.id, acmeClient1.id]
      }
    }
  });
  
  await prisma.ispOutcome.createMany({
    data: [
      {
        clientId: client1.id,
        outcomeDescription: 'Increase community participation by visiting local cafes and parks',
        category: 'community_participation',
        targetDate: new Date('2025-12-31'),
        status: 'active'
      },
      {
        clientId: client1.id,
        outcomeDescription: 'Improve daily living skills - meal preparation',
        category: 'daily_living',
        targetDate: new Date('2025-12-31'),
        status: 'active'
      },
      {
        clientId: client2.id,
        outcomeDescription: 'Develop vocational skills through volunteer work',
        category: 'vocational',
        targetDate: new Date('2025-12-31'),
        status: 'active'
      },
      {
        clientId: client2.id,
        outcomeDescription: 'Enhance social communication skills',
        category: 'behavioral',
        targetDate: new Date('2025-12-31'),
        status: 'active'
      },
      {
        clientId: acmeClient1.id,
        outcomeDescription: 'Build independence in transportation',
        category: 'daily_living',
        targetDate: new Date('2025-12-31'),
        status: 'active'
      }
    ]
  });
  
  console.log(' Created 5 ISP outcomes\n');
  
  console.log('');
  console.log(' Database seeded successfully!');
  console.log('\n');
  
  console.log(' ORGANIZATIONS:');
  console.log(`    ${demoOrg.name} (${demoOrg.subdomain}) - ${demoOrg.plan}`);
  console.log(`    ${acmeOrg.name} (${acmeOrg.subdomain}) - ${acmeOrg.plan}\n`);
  
  console.log(' DEMO ORG TEST ACCOUNTS:');
  console.log('   Admin:   admin@careservice.com / admin123');
  console.log('   Manager: manager@careservice.com / manager123');
  console.log('   DSP:     dsp@careservice.com / dsp123\n');
  
  console.log(' ACME ORG TEST ACCOUNTS:');
  console.log('   Manager: manager@acme.com / manager123');
  console.log('   DSP:     dsp@acme.com / dsp123\n');
  
  console.log(' CLIENTS:');
  console.log(`   Demo: ${client1.firstName} ${client1.lastName} (${client1.dddId})`);
  console.log(`   Demo: ${client2.firstName} ${client2.lastName} (${client2.dddId})`);
  console.log(`   ACME: ${acmeClient1.firstName} ${acmeClient1.lastName} (${acmeClient1.dddId})\n`);
  
  console.log(' Multi-tenancy: ENABLED');
  console.log('   Data is isolated between organizations');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
