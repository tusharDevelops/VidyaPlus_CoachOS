import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CoachOS database...');

  // 1. Create default subscription plans
  const aarambhPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Aarambh (Entry)',
      maxStudents: 40,
      maxStaff: 1,
      maxBatches: 4,
      maxStorageMb: 500,
      priceMonthly: 0,
      dodoProductId: null,
      featuresJson: { 
        description: 'All features included, perfect for a solo tutor.',
        whatsappFree: 0, 
        analytics: 'basic',
        support: 'Help center / AI Bot',
        idealFor: '1-teacher tutor with up to 40 students'
      },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Aarambh (Entry)',
      maxStudents: 40,
      maxStaff: 1,
      maxBatches: 4,
      maxStorageMb: 500,
      priceMonthly: 0,
      dodoProductId: null,
      featuresJson: { 
        description: 'All features included, perfect for a solo tutor.',
        whatsappFree: 0, 
        analytics: 'basic',
        support: 'Help center / AI Bot',
        idealFor: '1-teacher tutor with up to 40 students'
      },
    },
  });

  const pragatiPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      name: 'Pragati (Pro)',
      maxStudents: 100,
      maxStaff: 15,
      maxBatches: 15,
      maxStorageMb: 5000,
      priceMonthly: 199,
      dodoProductId: 'pdt_0NhfE2lTQW2SC6uynTK60',
      featuresJson: { 
        description: 'All features included, extended scale for growing teams.',
        whatsappFree: 500, 
        analytics: 'advanced',
        support: 'Priority WhatsApp'
      },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Pragati (Pro)',
      maxStudents: 100,
      maxStaff: 15,
      maxBatches: 15,
      maxStorageMb: 5000,
      priceMonthly: 199,
      dodoProductId: 'pdt_0NhfE2lTQW2SC6uynTK60',
      featuresJson: { 
        description: 'All features included, extended scale for growing teams.',
        whatsappFree: 500, 
        analytics: 'advanced',
        support: 'Priority WhatsApp'
      },
    },
  });

  const utsavPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {
      name: 'Utsav (Enterprise)',
      maxStudents: 100000, // unlimited-ish
      maxStaff: 1000,
      maxBatches: 1000,
      maxStorageMb: 50000,
      priceMonthly: 999,
      dodoProductId: 'pdt_0NhfEVVechPapJdtovY62',
      featuresJson: { 
        description: 'For large hubs focusing on brand and multi-branch control.',
        whatsappFree: 2000, 
        analytics: 'multi-institute',
        support: 'Dedicated Manager',
        includes: ['Multi-institute dashboard', 'LMS support']
      },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Utsav (Enterprise)',
      maxStudents: 100000,
      maxStaff: 1000,
      maxBatches: 1000,
      maxStorageMb: 50000,
      priceMonthly: 999,
      dodoProductId: 'pdt_0NhfEVVechPapJdtovY62',
      featuresJson: { 
        description: 'For large hubs focusing on brand and multi-branch control.',
        whatsappFree: 2000, 
        analytics: 'multi-institute',
        support: 'Dedicated Manager',
        includes: ['Multi-institute dashboard', 'LMS support']
      },
    },
  });

  console.log('✅ Plans created:', [aarambhPlan.name, pragatiPlan.name, utsavPlan.name].join(', '));

  // 2. Create Super Admin user (instituteId is null — super admin is platform-level)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@vidyaplus.in';
  const superAdminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026', 12);

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: superAdminEmail, role: 'super_admin' },
  });

  let superAdmin;
  if (existingSuperAdmin) {
    superAdmin = existingSuperAdmin;
    console.log(`✅ Super Admin already exists: ${superAdmin.email}`);
  } else {
    superAdmin = await prisma.user.create({
      data: {
        name: 'VidyaPlus Admin',
        phone: '9999999999',
        email: superAdminEmail,
        passwordHash: superAdminPassword,
        role: 'super_admin',
        permissionsJson: [],
        status: 'active',
        // instituteId is null — super admin belongs to no institute
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email} (phone: ${superAdmin.phone})`);
  }

  // 3. Create a demo institute for development (REMOVED - Use self-serve registration)
  /*
  const demoInstitute = await prisma.institute.upsert({
    ...
  });
  */

  console.log('\n🎉 Seed complete! You can now login with:');
  console.log('  Super Admin: admin@vidyaplus.in / Admin@2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
