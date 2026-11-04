import {
  BadRequestException,
  Injectable,
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
  totalAllocated: number;
  unallocated: number;
  spent: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
}

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetItemsService: BudgetItemsService,
  ) {}

  async findAll() {
    this.ensureDatabaseAvailable();

    const events = await this.prisma.event.findMany({
      include: eventWithBudgetInclude,
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => this.toResponse(event));
  }

  async findOne(id: string) {
    this.ensureDatabaseAvailable();

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventWithBudgetInclude,
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    return this.toResponse(event);
  }

  /**
   * Persists an event and (optionally) its initial budget items atomically.
   * Creation requires the database: there is no in-memory fallback, so a
   * successful response always means the budget was actually stored.
   */
  async create(managedById: string, dto: CreateEventDto) {
    this.ensureDatabaseAvailable();

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

  private ensureDatabaseAvailable() {
    if (!this.prisma.isDbAvailable()) {
      throw new ServiceUnavailableException(
        'Event data is temporarily unavailable. Please try again later.',
      );
    }
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
