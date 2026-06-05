import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'devtesta9211@gmail.com';
  
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive'
      },
      role: 'owner'
    }
  });

  if (!user) {
    console.log('User not found.');
    return;
  }

  console.log(`Checking user: ${user.name} (${user.email})`);
  console.log(`Password Hash in DB: ${user.passwordHash}`);

  // Test some common/expected passwords
  const testPasswords = ['Admin@2026', 'admin123', 'password', '12345678', 'password123'];
  for (const pw of testPasswords) {
    if (user.passwordHash) {
      const match = await bcrypt.compare(pw, user.passwordHash);
      console.log(`Comparing with "${pw}": ${match ? 'MATCH' : 'NO MATCH'}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
