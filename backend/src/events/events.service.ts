import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

export interface DefaultEventData {
  id: string;
  title: string;
  code: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  date: string;
  allocated: number;
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

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private localEventsStore: DefaultEventData[] = [...mockEventsData];

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      if (this.prisma.isDbAvailable()) {
        const events = await this.prisma.event.findMany({
          include: {
            budgetItems: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (events && events.length > 0) {
          return events.map((e) => ({
            id: e.id,
            title: e.name,
            code: `EVT-${e.id.slice(0, 6).toUpperCase()}`,
            status:
              e.status === 'DRAFT' || e.status === 'APPROVED'
                ? 'ACTIVE'
                : (e.status as any),
            date: e.startDate
              ? e.startDate.toISOString().split('T')[0]
              : '2024-10-15',
            allocated: Number(e.totalBudget),
            spent: 0,
            categories: e.budgetItems.map((b) => ({
              name: b.category ? b.category.name : b.itemName,
              allocated: Number(b.allocatedAmount),
              spent: 0,
            })),
          }));
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
          include: {
            budgetItems: {
              include: {
                category: true,
              },
            },
          },
        });

        if (event) {
          return {
            id: event.id,
            title: event.name,
            code: `EVT-${event.id.slice(0, 6).toUpperCase()}`,
            status:
              event.status === 'DRAFT' || event.status === 'APPROVED'
                ? 'ACTIVE'
                : (event.status as any),
            date: event.startDate
              ? event.startDate.toISOString().split('T')[0]
              : '2024-10-15',
            allocated: Number(event.totalBudget),
            spent: 0,
            categories: event.budgetItems.map((b) => ({
              name: b.category ? b.category.name : b.itemName,
              allocated: Number(b.allocatedAmount),
              spent: 0,
            })),
          };
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

  async create(createEventDto: CreateEventDto) {
    const { title, description, startDate, endDate, totalBudget } =
      createEventDto;

    try {
      if (this.prisma.isDbAvailable()) {
        const defaultUser = await this.prisma.user.findFirst();
        if (defaultUser) {
          const createdEvent = await this.prisma.event.create({
            data: {
              name: title,
              description: description || title,
              startDate: new Date(startDate),
              endDate: endDate ? new Date(endDate) : new Date(startDate),
              totalBudget: Number(totalBudget),
              status: 'APPROVED',
              managedById: defaultUser.id,
            },
          });

          return {
            id: createdEvent.id,
            title: createdEvent.name,
            code: `EVT-${createdEvent.id.slice(0, 6).toUpperCase()}`,
            status: 'ACTIVE' as const,
            date: createdEvent.startDate.toISOString().split('T')[0],
            allocated: Number(createdEvent.totalBudget),
            spent: 0,
            categories: [
              {
                name: 'Logistics & Venue',
                allocated: Number(totalBudget) * 0.5,
                spent: 0,
              },
              {
                name: 'Marketing & Catering',
                allocated: Number(totalBudget) * 0.5,
                spent: 0,
              },
            ],
          };
        }
      }
    } catch (error) {
      this.logger.warn(
        `Database create failed, using local store: ${error.message}`,
      );
    }

    const newLocalEvent: DefaultEventData = {
      id: `evt-${Date.now()}`,
      title,
      code: `EVT-2024-${String(this.localEventsStore.length + 1).padStart(2, '0')}`,
      status: 'ACTIVE',
      date: startDate || new Date().toISOString().split('T')[0],
      allocated: Number(totalBudget),
      spent: 0,
      categories: [
        {
          name: 'Logistics & Venue',
          allocated: Number(totalBudget) * 0.5,
          spent: 0,
        },
        {
          name: 'Marketing & Catering',
          allocated: Number(totalBudget) * 0.5,
          spent: 0,
        },
      ],
    };

    this.localEventsStore.unshift(newLocalEvent);
    return newLocalEvent;
  }
}
