import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying Pricing & Limits Implementation...');

  // 1. Check Plans
  const plans = await prisma.plan.findMany({
    where: { name: { contains: 'Aarambh' } }
  });
  
  if (plans.length > 0) {
    console.log('✅ Aarambh Plan found with limits:', {
      maxStudents: plans[0].maxStudents,
      maxBatches: plans[0].maxBatches,
      maxStorageMb: plans[0].maxStorageMb
    });
  } else {
    console.log('❌ Aarambh Plan not found!');
  }

  // 2. Check Demo Institute
  const demo = await prisma.institute.findUnique({
    where: { subdomain: 'demo' },
    include: { plan: true }
  });

  if (demo) {
    console.log('✅ Demo Institute found on plan:', demo.plan?.name);
  } else {
    console.log('❌ Demo Institute not found!');
  }

  // 3. Test Batch Limit Logic (Simulation)
  const batchCount = await prisma.batch.count({
    where: { instituteId: demo?.id }
  });
  console.log(`ℹ️ Current batch count for demo: ${batchCount}`);
  
  if (demo?.plan && batchCount >= demo.plan.maxBatches) {
    console.log(`✅ Batch limit logic would trigger (Limit: ${demo.plan.maxBatches})`);
  } else {
    console.log(`ℹ️ Batch limit logic would NOT trigger yet (Limit: ${demo?.plan?.maxBatches})`);
  }

  await prisma.$disconnect();
}

verify().catch(console.error);
