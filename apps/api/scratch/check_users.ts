import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'devtesta9211@gmail.com';
  console.log(`Checking accounts for email: ${email}`);
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        equals: email,
        mode: 'insensitive' // case-insensitive search
      }
    },
    include: {
      institute: true
    }
  });

  console.log(`Found ${users.length} user(s):`);
  for (const user of users) {
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      hasPassword: !!user.passwordHash,
      institute: user.institute ? { id: user.institute.id, name: user.institute.name, status: user.institute.status } : null
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
