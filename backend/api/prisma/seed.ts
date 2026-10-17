import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { PrismaClient, Role } from '../src/generated/prisma/client';

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!connectionString || !name || !email || !password) {
    throw new Error(
      'Set DATABASE_URL, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/api/.env before seeding.',
    );
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const passwordHash = await argon2.hash(password);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: Role.ADMIN },
      create: { name, email, passwordHash, role: Role.ADMIN },
    });
    console.info(`Admin account is ready for ${email}.`);
  } finally {
    await prisma.$disconnect();
  }
}

void seed().catch((error: unknown) => {
  console.error('Admin seed failed.', error);
  process.exitCode = 1;
});
