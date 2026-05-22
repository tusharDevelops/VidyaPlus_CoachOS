import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique subdomain from an institute name.
 * Format: slugified-name or slugified-name-suffix if taken.
 */
export async function generateSubdomain(name: string): Promise<string> {
  // 1. Basic slugification
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  if (!slug) slug = 'institute';

  // 2. Check for collision
  const existing = await prisma.institute.findUnique({
    where: { subdomain: slug },
  });

  if (!existing) {
    return slug;
  }

  // 3. If taken, append a small random suffix
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${suffix}`;
}
