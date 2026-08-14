const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.systemSetting.upsert({
      where: { key: 'PLATFORM_BANNER_NOTICE' },
      update: { value: { test: true } },
      create: { key: 'PLATFORM_BANNER_NOTICE', value: { test: true } },
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
