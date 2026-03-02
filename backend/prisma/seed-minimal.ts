import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with minimal data (landlord only)...');

  // Create system organization for landlord
  const systemOrg = await prisma.organization.upsert({
    where: { subdomain: 'system' },
    update: {},
    create: {
      name: 'System Administration',
      subdomain: 'system',
      isActive: true,
      plan: 'enterprise',
      maxUsers: 1000,
      maxClients: 0, // Landlords don't manage clients
      billingStatus: 'active',
    },
  });

  console.log('✓ System organization created');

  // Create landlord user
  const hashedPassword = await bcrypt.hash('landlord123', 10);
  
  const landlord = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'landlord@careservice.com',
        organizationId: systemOrg.id,
      },
    },
    update: {},
    create: {
      organizationId: systemOrg.id,
      azureAdId: 'landlord_super_admin',
      email: 'landlord@careservice.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isLandlord: true,
      isActive: true,
    },
  });

  console.log('✓ Landlord user created');
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Database seeded successfully!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Landlord Credentials:');
  console.log('  Email:    landlord@careservice.com');
  console.log('  Password: landlord123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change this password after first login!');
  console.log('');
  console.log('Next Steps:');
  console.log('  1. Start the backend: npm run dev');
  console.log('  2. Login as landlord');
  console.log('  3. Create your first tenant organization');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
