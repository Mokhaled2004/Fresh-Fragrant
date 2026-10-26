import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Usage: npx tsx scripts/create-admin.ts <email>');
  }

  const [{ db }, { users }, { hashPassword }, { eq }] = await Promise.all([
    import('../src/db'),
    import('../src/db/schema'),
    import('../src/lib/auth/password'),
    import('drizzle-orm'),
  ]);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error(`An account already exists for ${email}. Choose a new email address.`);

  const temporaryPassword = randomBytes(24).toString('base64url');
  const [admin] = await db.insert(users).values({
    fullName: 'Store Admin',
    email,
    passwordHash: await hashPassword(temporaryPassword),
    role: 'admin',
    isActive: true,
  }).returning({ email: users.email });

  console.log('Admin account created. Save this temporary password now:');
  console.log(`Email: ${admin.email}`);
  console.log(`Temporary password: ${temporaryPassword}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Could not create admin account.');
  process.exit(1);
});
