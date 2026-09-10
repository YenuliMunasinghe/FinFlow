import { PrismaClient } from '@prisma/client';
import { Role } from '../src/auth/roles.decorator';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FinFlow database seeding...');

  // 1. Seed Master Budget Categories
  const categories = [
    { name: 'Food & Beverage', description: 'Catering, snacks, drinks, and meals' },
    { name: 'Transport & Logistics', description: 'Vehicle rentals, fuel, travel, and logistics' },
    { name: 'Venue & Equipment', description: 'Hall bookings, sound systems, lights, and staging' },
    { name: 'Printing & Marketing', description: 'Banners, flyers, posters, and promotional merchandise' },
    { name: 'Miscellaneous', description: 'Uncategorized or emergency event expenses' },
  ];

  for (const cat of categories) {
    await prisma.budgetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Master budget categories seeded.');

  // 2. Seed Default Test Users for each Role
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      email: 'admin@finflow.org',
      memberId: 'MEM-001',
      name: 'System Admin',
      passwordHash: hashedPassword,
      role: Role.ADMIN,
    },
    {
      email: 'president@finflow.org',
      memberId: 'MEM-002',
      name: 'Society President',
      passwordHash: hashedPassword,
      role: Role.PRESIDENT,
    },
    {
      email: 'treasurer@finflow.org',
      memberId: 'MEM-003',
      name: 'Society Treasurer',
      passwordHash: hashedPassword,
      role: Role.TREASURER,
    },
    {
      email: 'committee@finflow.org',
      memberId: 'MEM-004',
      name: 'Committee Member',
      passwordHash: hashedPassword,
      role: Role.COMMITTEE_MEMBER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log('✅ Default role users seeded (Password: Password123!).');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
