/**
 * Real-database integration test for the event budget → transaction →
 * approval → AI-insight pipeline.
 *
 * It WRITES to the database configured in backend/.env, so it only runs when
 * explicitly enabled:
 *
 *   RUN_DB_E2E=1 npm run test:e2e -- ai-insights
 *
 * Everything it creates (users, events, budget items, transactions) is tagged
 * with a unique run id and deleted afterwards. Budget categories are shared
 * reference data and are only upserted, never deleted.
 *
 * Gemini is disabled by default so the run is deterministic and free. Set
 * RUN_GEMINI_E2E=1 as well to call the real model and validate its output.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const RUN_DB = process.env.RUN_DB_E2E === '1';
const RUN_GEMINI = process.env.RUN_GEMINI_E2E === '1';

if (!RUN_GEMINI) {
  // Read by GeminiNarrativeService at construction; an empty key forces the
  // deterministic fallback narrative. It must be set to '' rather than
  // deleted: PrismaClient reloads .env and would restore a deleted key.
  process.env.GEMINI_API_KEY = '';
}

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  BUDGET_CATEGORIES,
  DEMO_BUDGET_ITEMS,
  DEMO_EVENT,
  DEMO_TOTAL_ALLOCATED,
  DEMO_TRANSACTIONS,
  EXPECTED_ALERTS,
  EXPECTED_BUDGET_STATUS,
  EXPECTED_CATEGORIES,
  EXPECTED_INSIGHTS,
  EXPECTED_METRICS,
  EXPECTED_RISK_LEVEL,
} from '../prisma/fixtures/demo-event.fixture';

const describeDb = RUN_DB ? describe : describe.skip;

jest.setTimeout(180_000);

describeDb('AI insights pipeline against the real database (e2e)', () => {
  const runTag = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const password = `E2e!${Math.random().toString(36).slice(2, 12)}`;

  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;

  const userIds: string[] = [];
  const eventIds: string[] = [];
  const tokens: Record<'treasurer' | 'president' | 'member', string> = {
    treasurer: '',
    president: '',
    member: '',
  };
  const categoryIds = new Map<string, string>();
  const itemIds = new Map<string, string>();
  const transactionIds = new Map<string, string>();
  let eventId: string;

  const auth = (role: keyof typeof tokens) => ({
    Authorization: `Bearer ${tokens[role]}`,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    http = request(app.getHttpServer());
    prisma = app.get(PrismaService);

    if (!prisma.isDbAvailable()) {
      throw new Error(
        'RUN_DB_E2E=1 but the database is unreachable. Check DATABASE_URL in backend/.env.',
      );
    }

    for (const category of BUDGET_CATEGORIES) {
      const row = await prisma.budgetCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
      categoryIds.set(row.name, row.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    for (const role of ['treasurer', 'president', 'member'] as const) {
      const user = await prisma.user.create({
        data: {
          email: `${runTag}-${role}@finflow.test`,
          memberId: `${runTag}-${role}`.toUpperCase(),
          name: `E2E ${role}`,
          passwordHash,
          role: role === 'member' ? 'COMMITTEE_MEMBER' : role.toUpperCase(),
        },
      });
      userIds.push(user.id);

      const login = await http
        .post('/api/auth/login')
        .send({ email: user.email, password })
        .expect(201);
      tokens[role] = login.body.accessToken;
    }
  });

  afterAll(async () => {
    if (prisma && prisma.isDbAvailable()) {
      await prisma.transaction.deleteMany({
        where: { eventId: { in: eventIds } },
      });
      await prisma.budgetItem.deleteMany({
        where: { eventId: { in: eventIds } },
      });
      await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
      await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await app?.close();
  });

  it('creates the event and its budget items atomically', async () => {
    const res = await http
      .post('/api/events')
      .set(auth('treasurer'))
      .send({
        ...DEMO_EVENT,
        title: `${DEMO_EVENT.title} [${runTag}]`,
        budgetItems: DEMO_BUDGET_ITEMS.map((item) => ({
          categoryId: categoryIds.get(item.category),
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })
      .expect(201);

    eventId = res.body.id;
    eventIds.push(eventId);

    expect(res.body).toEqual(
      expect.objectContaining({
        allocated: DEMO_EVENT.totalBudget,
        totalAllocated: DEMO_TOTAL_ALLOCATED,
        unallocated: DEMO_EVENT.totalBudget - DEMO_TOTAL_ALLOCATED,
        venue: DEMO_EVENT.venue,
      }),
    );

    const stored = await prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: { managedById: true },
    });
    expect(stored.managedById).toBe(userIds[0]);

    const items = await http
      .get(`/api/events/${eventId}/budget-items`)
      .set(auth('member'))
      .expect(200);

    expect(items.body).toHaveLength(DEMO_BUDGET_ITEMS.length);
    for (const fixture of DEMO_BUDGET_ITEMS) {
      const match = items.body.find((i: any) => i.itemName === fixture.itemName);
      expect(match).toEqual(
        expect.objectContaining({
          quantity: fixture.quantity,
          unitPrice: fixture.unitPrice,
          allocatedAmount: fixture.quantity * fixture.unitPrice,
          category: expect.objectContaining({ name: fixture.category }),
        }),
      );
      itemIds.set(fixture.key, match.id);
    }
  });

  it('rejects an event whose initial budget plan exceeds the total, saving nothing', async () => {
    const title = `Overplanned event [${runTag}]`;

    await http
      .post('/api/events')
      .set(auth('treasurer'))
      .send({
        title,
        startDate: '2026-12-01',
        totalBudget: 1000,
        budgetItems: [
          {
            categoryId: categoryIds.get('Miscellaneous'),
            itemName: 'Too much',
            quantity: 1,
            unitPrice: 1000.01,
          },
        ],
      })
      .expect(400);

    const leaked = await prisma.event.findMany({ where: { name: title } });
    eventIds.push(...leaked.map((e) => e.id));
    expect(leaked).toHaveLength(0);
  });

  it('does not let a committee member create events', async () => {
    await http
      .post('/api/events')
      .set(auth('member'))
      .send({ title: 'Nope', startDate: '2026-12-01', totalBudget: 10 })
      .expect(403);
  });

  it('enforces transaction-to-budget rules', async () => {
    const base = {
      title: 'Validation probe',
      type: 'EXPENSE',
      amount: 6500,
      eventId,
    };

    await http
      .post('/api/transactions')
      .set(auth('member'))
      .send(base)
      .expect(400);

    const overBudget = await http
      .post('/api/transactions')
      .set(auth('member'))
      .send({ ...base, budgetItemId: itemIds.get('sound'), amount: 60000.01 })
      .expect(400);
    expect(overBudget.body.code).toBe('OVER_BUDGET_JUSTIFICATION_REQUIRED');
    expect(overBudget.body.budgetCheck.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ scope: 'BUDGET_ITEM', overBy: 0.01 }),
      ]),
    );

    await http
      .post('/api/transactions')
      .set(auth('member'))
      .send({
        title: 'Income on a budget item',
        type: 'INCOME',
        amount: 100,
        eventId,
        budgetItemId: itemIds.get('hall'),
      })
      .expect(400);

    const other = await http
      .post('/api/events')
      .set(auth('treasurer'))
      .send({
        title: `Other event [${runTag}]`,
        startDate: '2026-12-01',
        totalBudget: 5000,
        budgetItems: [
          {
            categoryId: categoryIds.get('Miscellaneous'),
            itemName: 'Other item',
            quantity: 1,
            unitPrice: 5000,
          },
        ],
      })
      .expect(201);
    eventIds.push(other.body.id);

    const otherItems = await http
      .get(`/api/events/${other.body.id}/budget-items`)
      .set(auth('member'))
      .expect(200);

    const mismatch = await http
      .post('/api/transactions')
      .set(auth('member'))
      .send({ ...base, amount: 10, budgetItemId: otherItems.body[0].id })
      .expect(400);
    expect(mismatch.body.message).toBe(
      'The budget item does not belong to the selected event.',
    );

    const stored = await prisma.transaction.count({ where: { eventId } });
    expect(stored).toBe(0);
  });

  it('runs the full submit and review workflow', async () => {
    for (const fixture of DEMO_TRANSACTIONS) {
      const res = await http
        .post('/api/transactions')
        .set(auth('member'))
        .send({
          title: fixture.title,
          type: fixture.type,
          amount: fixture.amount,
          eventId,
          ...(fixture.item && { budgetItemId: itemIds.get(fixture.item) }),
          ...(fixture.justification && {
            overrideJustification: fixture.justification,
          }),
        })
        .expect(201);

      expect(res.body.status).toBe('PENDING');
      transactionIds.set(fixture.key, res.body.id);
    }

    await http
      .patch(`/api/transactions/${transactionIds.get('hall')}/approve`)
      .set(auth('member'))
      .expect(403);

    for (const fixture of DEMO_TRANSACTIONS) {
      const id = transactionIds.get(fixture.key);

      if (fixture.finalStatus === 'APPROVED') {
        await http
          .patch(`/api/transactions/${id}/approve`)
          .set(auth('president'))
          .expect(200);
      } else if (fixture.finalStatus === 'REJECTED') {
        await http
          .patch(`/api/transactions/${id}/reject`)
          .set(auth('president'))
          .send({ reason: fixture.reviewNote })
          .expect(200);
      } else if (fixture.finalStatus === 'REVISION_REQUESTED') {
        await http
          .patch(`/api/transactions/${id}/revision`)
          .set(auth('president'))
          .send({ instructions: fixture.reviewNote })
          .expect(200);
      }
    }

    await http
      .patch(`/api/transactions/${transactionIds.get('hall')}/approve`)
      .set(auth('president'))
      .expect(409);

    const rows = await prisma.transaction.findMany({ where: { eventId } });
    for (const fixture of DEMO_TRANSACTIONS) {
      const row = rows.find((r) => r.id === transactionIds.get(fixture.key));
      expect({
        key: fixture.key,
        status: row?.status,
        isOverBudget: row?.isOverBudget,
      }).toEqual({
        key: fixture.key,
        status: fixture.finalStatus,
        isOverBudget: fixture.overBudget,
      });
    }

    const flyers = rows.find((r) => r.id === transactionIds.get('flyers'));
    expect(flyers?.overrideJustification).toBe(
      DEMO_TRANSACTIONS.find((t) => t.key === 'flyers')?.justification,
    );
    expect(flyers?.rejectionReason).toBe(
      DEMO_TRANSACTIONS.find((t) => t.key === 'flyers')?.reviewNote,
    );
  });

  it('returns hand-verified calculations from the insight endpoint', async () => {
    await http.get(`/api/ai-insights/events/${eventId}`).expect(401);

    const res = await http
      .get(`/api/ai-insights/events/${eventId}`)
      .set(auth('member'))
      .expect(200);

    const body = res.body;
    expect(body.status).toBe('generated');
    expect(body.event.id).toBe(eventId);
    expect(body.metrics).toEqual(EXPECTED_METRICS);
    expect(body.budgetStatus).toBe(EXPECTED_BUDGET_STATUS);

    expect(body.categoryBreakdown).toHaveLength(EXPECTED_CATEGORIES.length);
    expect(body.categoryBreakdown).toEqual(
      expect.arrayContaining(EXPECTED_CATEGORIES),
    );

    const pairs = (list: any[]) =>
      list.map((x) => [x.code, x.category]).sort();
    expect(pairs(body.alerts)).toEqual([...EXPECTED_ALERTS].sort());
    expect(pairs(body.insights)).toEqual([...EXPECTED_INSIGHTS].sort());

    const narrative = body.aiNarrative;
    expect(narrative.riskLevel).toBe(EXPECTED_RISK_LEVEL);
    expect(narrative.summary.length).toBeGreaterThan(0);
    expect(narrative.keyFindings.length).toBeGreaterThanOrEqual(1);
    expect(narrative.keyFindings.length).toBeLessThanOrEqual(5);
    expect(narrative.recommendations.length).toBeLessThanOrEqual(5);
    expect(narrative.disclaimer).toMatch(/review before making financial decisions/);

    if (RUN_GEMINI) {
      expect(narrative.source).toBe('gemini');
      expect(narrative.model).toBeTruthy();
      // Printed so a human can review the narrative quality.
      console.log('Gemini narrative:\n' + JSON.stringify(narrative, null, 2));
    } else {
      expect(narrative.source).toBe('deterministic-fallback');
    }
  });

  it('returns 404 for an unknown event', async () => {
    await http
      .get('/api/ai-insights/events/00000000-0000-0000-0000-000000000000')
      .set(auth('member'))
      .expect(404);
  });
});
