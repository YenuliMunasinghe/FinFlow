import { PrismaClient } from '@prisma/client';
import { Role } from '../src/auth/roles.decorator';
import * as bcrypt from 'bcrypt';
import {
  BUDGET_CATEGORIES,
  DEMO_BUDGET_ITEMS,
  DEMO_EVENT,
  DEMO_TRANSACTIONS,
} from './fixtures/demo-event.fixture';

const prisma = new PrismaClient();

const DEMO_EVENT_NAME = `[Demo] ${DEMO_EVENT.title}`;

/**
 * Seeds the realistic demo event from the shared fixture. Idempotent: any
 * previous copy of the demo event (matched by its exact name) is replaced.
 * The same data is driven through the real API, with hand-verified expected
 * insight results, by test/ai-insights.e2e-spec.ts.
 */
async function seedDemoEvent() {
  const [treasurer, president, member] = await Promise.all(
    ['treasurer@finflow.org', 'president@finflow.org', 'committee@finflow.org'].map(
      (email) => prisma.user.findUniqueOrThrow({ where: { email } }),
    ),
  );
  const categories = await prisma.budgetCategory.findMany();
  const categoryId = (name: string) => {
    const match = categories.find((c) => c.name === name);
    if (!match) throw new Error(`Missing budget category "${name}"`);
    return match.id;
  };

  await prisma.$transaction(async (tx) => {
    const previous = await tx.event.findMany({
      where: { name: DEMO_EVENT_NAME },
      select: { id: true },
    });
    const previousIds = previous.map((e) => e.id);
    if (previousIds.length > 0) {
      await tx.transaction.deleteMany({ where: { eventId: { in: previousIds } } });
      await tx.budgetItem.deleteMany({ where: { eventId: { in: previousIds } } });
      await tx.event.deleteMany({ where: { id: { in: previousIds } } });
    }

    const event = await tx.event.create({
      data: {
        name: DEMO_EVENT_NAME,
        venue: DEMO_EVENT.venue,
        description: DEMO_EVENT.description,
        startDate: new Date(DEMO_EVENT.startDate),
        endDate: new Date(DEMO_EVENT.endDate),
        totalBudget: DEMO_EVENT.totalBudget.toFixed(2),
        status: 'APPROVED',
        managedById: treasurer.id,
      },
    });

    const itemIds = new Map<string, string>();
    for (const item of DEMO_BUDGET_ITEMS) {
      const created = await tx.budgetItem.create({
        data: {
          eventId: event.id,
          categoryId: categoryId(item.category),
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          allocatedAmount: (item.quantity * item.unitPrice).toFixed(2),
        },
      });
      itemIds.set(item.key, created.id);
    }

    for (const t of DEMO_TRANSACTIONS) {
      await tx.transaction.create({
        data: {
          title: t.title,
          type: t.type,
          amount: t.amount.toFixed(2),
          status: t.finalStatus,
          isOverBudget: t.overBudget,
          overrideJustification: t.justification ?? null,
          rejectionReason: t.reviewNote ?? null,
          eventId: event.id,
          budgetItemId: t.item ? itemIds.get(t.item) : null,
          submittedById: member.id,
          approvedById: t.finalStatus === 'APPROVED' ? president.id : null,
        },
      });
    }
  });
}

async function main() {
  console.log('🌱 Starting FinFlow database seeding...');

  // 1. Seed Master Budget Categories
  for (const cat of BUDGET_CATEGORIES) {
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

  // 3. Seed the realistic demo event (budget items + mixed-status transactions)
  await seedDemoEvent();
  console.log(`✅ Demo event "${DEMO_EVENT_NAME}" seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
