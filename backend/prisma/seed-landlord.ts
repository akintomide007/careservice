import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log(' Creating Landlord account...\n');
  
  // Get the demo organization (super admin must belong to an org)
  const demoOrg = await prisma.organization.findUnique({
    where: { subdomain: 'demo' }
  });
  
  if (!demoOrg) {
    console.error(' Demo organization not found. Please run the main seed first.');
    process.exit(1);
  }
  
  // Create/Update Landlord
  const landlord = await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: 'landlord@careservice.com',
        organizationId: demoOrg.id
      }
    },
    update: {
      isLandlord: true,
      role: 'admin',
      isActive: true
    },
    create: {
      organizationId: demoOrg.id,
      email: 'landlord@careservice.com',
      password: await hashPassword('landlord123'),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      azureAdId: `landlord-mock-${demoOrg.id}`,
      isActive: true,
      isLandlord: true  // THIS IS THE KEY!
    }
  });
  
  console.log('');
  console.log(` Landlord account created: ${landlord.email}`);
  console.log('\n');
  
  console.log(' SUPER ADMIN CREDENTIALS:');
  console.log('   Email:    landlord@careservice.com');
  console.log('   Password: landlord123');
  console.log('   Role:     admin (with isLandlord flag)\n');
  
  console.log(' CAPABILITIES:');
  console.log('    Access ALL organizations/tenants');
  console.log('    Create new organizations');
  console.log('    View System Overview page');
  console.log('    View Tenants page');
  console.log('    Suspend/activate organizations');
  console.log('    Override all role permissions\n');
  
  console.log(' LOGIN:');
  console.log('   http://localhost:3010/login');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
