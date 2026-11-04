import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { EventsService } from './events.service';

describe('EventsService.create', () => {
  const start = new Date('2026-12-01T00:00:00.000Z');
  const venue = { id: 'cat-venue', name: 'Venue & Equipment' };
  const food = { id: 'cat-food', name: 'Food & Beverage' };

  const transactionClient = {
    event: { create: jest.fn(), findUniqueOrThrow: jest.fn() },
    budgetCategory: { findMany: jest.fn() },
    budgetItem: { createMany: jest.fn() },
  };

  const prisma = {
    isDbAvailable: jest.fn(),
    $transaction: jest.fn(),
  };

  let service: EventsService;

  const baseDto = {
    title: ' Robotics Workshop ',
    startDate: '2026-12-01',
    totalBudget: 50000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.isDbAvailable.mockReturnValue(true);
    prisma.$transaction.mockImplementation((callback: any) =>
      callback(transactionClient),
    );
    transactionClient.event.create.mockResolvedValue({ id: 'abcdef123' });
    transactionClient.budgetCategory.findMany.mockResolvedValue([
      { id: venue.id },
      { id: food.id },
    ]);

    const budgetItems = new BudgetItemsService(
      prisma as unknown as PrismaService,
    );
    service = new EventsService(prisma as unknown as PrismaService, budgetItems);
  });

  it('persists the event under the requesting user with no placeholder categories', async () => {
    transactionClient.event.findUniqueOrThrow.mockResolvedValue({
      id: 'abcdef123',
      name: 'Robotics Workshop',
      status: 'APPROVED',
      venue: null,
      startDate: start,
      totalBudget: '50000.00',
      budgetItems: [],
    });

    const result = await service.create('user-treasurer', baseDto);

    expect(transactionClient.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Robotics Workshop',
          totalBudget: '50000.00',
          managedById: 'user-treasurer',
          endDate: start,
        }),
      }),
    );
    expect(transactionClient.budgetItem.createMany).not.toHaveBeenCalled();
    expect(result.categories).toEqual([]);
    expect(result.totalAllocated).toBe(0);
    expect(result.unallocated).toBe(50000);
  });

  it('creates initial budget items atomically and reports real allocations', async () => {
    transactionClient.event.findUniqueOrThrow.mockResolvedValue({
      id: 'abcdef123',
      name: 'Robotics Workshop',
      status: 'APPROVED',
      venue: 'Lab 3',
      startDate: start,
      totalBudget: '50000.00',
      budgetItems: [
        { itemName: 'Hall', allocatedAmount: '20000.00', category: venue },
        { itemName: 'Mics', allocatedAmount: '4500.50', category: venue },
        { itemName: 'Lunch', allocatedAmount: '15000.00', category: food },
      ],
    });

    const result = await service.create('user-treasurer', {
      ...baseDto,
      venue: 'Lab 3',
      budgetItems: [
        { categoryId: venue.id, itemName: ' Hall ', quantity: 1, unitPrice: 20000 },
        { categoryId: venue.id, itemName: 'Mics', quantity: 3, unitPrice: 1500.17 },
        { categoryId: food.id, itemName: 'Lunch', quantity: 100, unitPrice: 150 },
      ],
    });

    expect(transactionClient.budgetItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          eventId: 'abcdef123',
          itemName: 'Hall',
          unitPrice: '20000.00',
          allocatedAmount: '20000.00',
        }),
        expect.objectContaining({
          unitPrice: '1500.17',
          allocatedAmount: '4500.51',
        }),
        expect.objectContaining({ allocatedAmount: '15000.00' }),
      ],
    });
    expect(result.categories).toEqual([
      { name: 'Venue & Equipment', allocated: 24500.5, spent: 0 },
      { name: 'Food & Beverage', allocated: 15000, spent: 0 },
    ]);
    expect(result.totalAllocated).toBe(39500.5);
    expect(result.unallocated).toBe(10499.5);
  });

  it('rejects an initial budget plan that exceeds the event total', async () => {
    await expect(
      service.create('user-treasurer', {
        ...baseDto,
        budgetItems: [
          { categoryId: venue.id, itemName: 'Hall', quantity: 1, unitPrice: 40000 },
          { categoryId: food.id, itemName: 'Lunch', quantity: 100, unitPrice: 100.01 },
        ],
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Budget allocation exceeds the event budget by 1.00.',
      ),
    );
    expect(transactionClient.budgetItem.createMany).not.toHaveBeenCalled();
  });

  it('rejects unknown budget categories', async () => {
    transactionClient.budgetCategory.findMany.mockResolvedValue([
      { id: venue.id },
    ]);

    await expect(
      service.create('user-treasurer', {
        ...baseDto,
        budgetItems: [
          { categoryId: 'cat-missing', itemName: 'X', quantity: 1, unitPrice: 10 },
        ],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(transactionClient.budgetItem.createMany).not.toHaveBeenCalled();
  });

  it('rejects an end date before the start date', async () => {
    await expect(
      service.create('user-treasurer', { ...baseDto, endDate: '2026-11-30' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('refuses to create events without a database instead of faking success', async () => {
    prisma.isDbAvailable.mockReturnValue(false);

    await expect(service.create('user-treasurer', baseDto)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('EventsService reads', () => {
  const prisma = {
    isDbAvailable: jest.fn(),
    event: { findMany: jest.fn(), findUnique: jest.fn() },
  };

  let service: EventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.isDbAvailable.mockReturnValue(true);
    service = new EventsService(
      prisma as unknown as PrismaService,
      {} as BudgetItemsService,
    );
  });

  it('returns an empty list when there are no events, not sample data', async () => {
    prisma.event.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });

  it('returns 404 for an unknown event, including old sample IDs', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.findOne('evt-1')).rejects.toThrow(NotFoundException);
  });

  it('returns 503 for reads when the database is unavailable', async () => {
    prisma.isDbAvailable.mockReturnValue(false);

    await expect(service.findAll()).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.findOne('any-id')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(prisma.event.findMany).not.toHaveBeenCalled();
    expect(prisma.event.findUnique).not.toHaveBeenCalled();
  });
});
