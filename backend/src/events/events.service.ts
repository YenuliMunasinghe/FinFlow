import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  PrismaService,
  SERIALIZABLE_TRANSACTION,
} from '../prisma/prisma.service';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { CreateEventDto } from './dto/create-event.dto';

export interface DefaultEventData {
  id: string;
  title: string;
  code: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  date: string;
  venue?: string | null;
  allocated: number;
  totalAllocated?: number;
  unallocated?: number;
  spent: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
}

const mockEventsData: DefaultEventData[] = [
  {
    id: 'evt-1',
    title: 'Annual Tech Symposium 2024',
    code: 'EVT-2024-01',
    status: 'ACTIVE',
    date: '2024-10-15',
    allocated: 450000,
    spent: 278500,
    categories: [
      { name: 'Logistics & Venue', allocated: 200000, spent: 150000 },
      { name: 'Audio/Visual Hire', allocated: 100000, spent: 78500 },
      { name: 'Food & Refreshments', allocated: 100000, spent: 35000 },
      { name: 'Certificates & Printing', allocated: 50000, spent: 15000 },
    ],
  },
  {
    id: 'evt-2',
    title: 'Robotics & AI Hands-on Workshop',
    code: 'EVT-2024-02',
    status: 'ACTIVE',
    date: '2024-11-02',
    allocated: 120000,
    spent: 42000,
    categories: [
      { name: 'Hardware Kits', allocated: 70000, spent: 28000 },
      { name: 'Refreshments', allocated: 30000, spent: 14000 },
      { name: 'Certificates & Banners', allocated: 20000, spent: 0 },
    ],
  },
  {
    id: 'evt-3',
    title: 'Annual General Meeting & Social 2024',
    code: 'EVT-2024-03',
    status: 'COMPLETED',
    date: '2024-08-20',
    allocated: 180000,
    spent: 175000,
    categories: [
      { name: 'Food & Catering', allocated: 120000, spent: 120000 },
      { name: 'Sound System', allocated: 40000, spent: 38000 },
      { name: 'Decorations', allocated: 20000, spent: 17000 },
    ],
  },
];

const eventWithBudgetInclude = {
  budgetItems: {
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.EventInclude;

type EventWithBudget = Prisma.EventGetPayload<{
  include: typeof eventWithBudgetInclude;
}>;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private localEventsStore: DefaultEventData[] = [...mockEventsData];

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetItemsService: BudgetItemsService,
  ) {}

  async findAll() {
    try {
      if (this.prisma.isDbAvailable()) {
        const events = await this.prisma.event.findMany({
          include: eventWithBudgetInclude,
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (events && events.length > 0) {
          return events.map((e) => this.toResponse(e));
        }
      }
    } catch (error) {
      this.logger.warn(
        `Database query failed, serving memory events fallback: ${error.message}`,
      );
    }

    return this.localEventsStore;
  }

  async findOne(id: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const event = await this.prisma.event.findUnique({
          where: { id },
          include: eventWithBudgetInclude,
        });

        if (event) {
          return this.toResponse(event);
        }
      }
    } catch (error) {
      this.logger.warn(`Database query failed for findOne: ${error.message}`);
    }

    const found = this.localEventsStore.find((e) => e.id === id);
    if (!found) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }
    return found;
  }

  /**
   * Persists an event and (optionally) its initial budget items atomically.
   * Creation requires the database: there is no in-memory fallback, so a
   * successful response always means the budget was actually stored.
   */
  async create(managedById: string, dto: CreateEventDto) {
    if (!this.prisma.isDbAvailable()) {
      throw new ServiceUnavailableException(
        'Events cannot be created while the database is unavailable.',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : startDate;

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    const created = await this.prisma.$transaction(
      async (transaction) => {
        const event = await transaction.event.create({
          data: {
            name: dto.title.trim(),
            description: dto.description?.trim() || null,
            venue: dto.venue?.trim() || null,
            startDate,
            endDate,
            totalBudget: dto.totalBudget.toFixed(2),
            status: 'APPROVED',
            managedById,
          },
          select: { id: true },
        });

        await this.budgetItemsService.createInitialItems(
          transaction,
          event.id,
          dto.totalBudget,
          dto.budgetItems ?? [],
        );

        return transaction.event.findUniqueOrThrow({
          where: { id: event.id },
          include: eventWithBudgetInclude,
        });
      },
      SERIALIZABLE_TRANSACTION,
    );

    return this.toResponse(created);
  }

  private toResponse(event: EventWithBudget): DefaultEventData {
    const allocatedCents = Math.round(Number(event.totalBudget) * 100);
    const totalAllocatedCents = event.budgetItems.reduce(
      (sum, item) => sum + Math.round(Number(item.allocatedAmount) * 100),
      0,
    );

    // Group budget items by category so the shape matches the existing
    // `categories` contract used by the frontend.
    const byCategory = new Map<string, number>();
    for (const item of event.budgetItems) {
      const name = item.category?.name ?? item.itemName;
      byCategory.set(
        name,
        (byCategory.get(name) ?? 0) +
          Math.round(Number(item.allocatedAmount) * 100),
      );
    }

    return {
      id: event.id,
      title: event.name,
      code: `EVT-${event.id.slice(0, 6).toUpperCase()}`,
      status:
        event.status === 'DRAFT' || event.status === 'APPROVED'
          ? 'ACTIVE'
          : (event.status as DefaultEventData['status']),
      date: event.startDate.toISOString().split('T')[0],
      venue: event.venue,
      allocated: allocatedCents / 100,
      totalAllocated: totalAllocatedCents / 100,
      unallocated: (allocatedCents - totalAllocatedCents) / 100,
      spent: 0,
      categories: Array.from(byCategory, ([name, cents]) => ({
        name,
        allocated: cents / 100,
        spent: 0,
      })),
    };
  }
}
