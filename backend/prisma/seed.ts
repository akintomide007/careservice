import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@careservice.com',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      azureAdId: 'admin-mock-id',
      isActive: true
    }
  });
  
  const manager = await prisma.user.create({
    data: {
      email: 'manager@careservice.com',
      password: await hashPassword('manager123'),
      firstName: 'Manager',
      lastName: 'Smith',
      role: 'manager',
      azureAdId: 'manager-mock-id',
      isActive: true
    }
  });
  
  const dsp = await prisma.user.create({
    data: {
      email: 'dsp@careservice.com',
      password: await hashPassword('dsp123'),
      firstName: 'John',
      lastName: 'Doe',
      role: 'dsp',
      phone: '555-0123',
      azureAdId: 'dsp-mock-id',
      isActive: true
    }
  });
  
  const client1 = await prisma.client.create({
    data: {
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
  
  const client2 = await prisma.client.create({
    data: {
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
      }
    ]
  });
  
  console.log('Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('Admin: admin@careservice.com / admin123');
  console.log('Manager: manager@careservice.com / manager123');
  console.log('DSP: dsp@careservice.com / dsp123');
  console.log('\nClients:');
  console.log(`- ${client1.firstName} ${client1.lastName} (${client1.dddId})`);
  console.log(`- ${client2.firstName} ${client2.lastName} (${client2.dddId})`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
