// Quick script to clean up all active sessions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Delete ALL in_progress sessions to start fresh
    const result = await prisma.serviceSession.deleteMany({
      where: {
        status: 'in_progress'
      }
    });
    
    console.log(`✅ Cleaned up ${result.count} active sessions`);
    console.log('\n✓ You can now test clock-in/clock-out with a clean slate!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
