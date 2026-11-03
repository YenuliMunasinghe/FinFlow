import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetItemsService } from './budget-items.service';

describe('BudgetItemsService', () => {
  const now = new Date('2026-10-24T00:00:00.000Z');
  const category = {
    id: 'category-1',
    name: 'Venue',
    description: null,
  };
  const storedItem = {
    id: 'item-1',
    eventId: 'event-1',
    categoryId: category.id,
    category,
    itemName: 'Main hall',
    quantity: 2,
    unitPrice: '1000.00',
    allocatedAmount: '2000.00',
    createdAt: now,
    updatedAt: now,
  };

  const transactionClient = {
    event: { findUnique: jest.fn() },
    budgetCategory: { findUnique: jest.fn() },
    budgetItem: {
      aggregate: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: { count: jest.fn() },
  };

  const prisma = {
    isDbAvailable: jest.fn(),
    budgetCategory: {
      findMany: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    budgetItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(transactionClient)),
  };

  let service: BudgetItemsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.isDbAvailable.mockReturnValue(true);
    prisma.$transaction.mockImplementation((callback: any) =>
      callback(transactionClient),
    );
    transactionClient.event.findUnique.mockResolvedValue({
      id: 'event-1',
      totalBudget: '10000.00',
    });
    transactionClient.budgetCategory.findUnique.mockResolvedValue({
      id: category.id,
    });
    transactionClient.budgetItem.aggregate.mockResolvedValue({
      _sum: { allocatedAmount: '3000.00' },
    });

    service = new BudgetItemsService(prisma as unknown as PrismaService);
  });

  it('lists the configured budget categories', async () => {
    prisma.budgetCategory.findMany.mockResolvedValue([category]);

    await expect(service.findCategories()).resolves.toEqual([category]);
    expect(prisma.budgetCategory.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
  });

  it('creates an item and calculates its allocation from quantity and price', async () => {
    transactionClient.budgetItem.create.mockResolvedValue(storedItem);

    const result = await service.create('event-1', {
      categoryId: category.id,
      itemName: ' Main hall ',
      quantity: 2,
      unitPrice: 1000,
    });

    expect(transactionClient.budgetItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventId: 'event-1',
          itemName: 'Main hall',
          quantity: 2,
          unitPrice: '1000.00',
          allocatedAmount: '2000.00',
        }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'item-1',
        unitPrice: 1000,
        allocatedAmount: 2000,
      }),
    );
  });

  it('rejects a new allocation that exceeds the event total budget', async () => {
    transactionClient.budgetItem.aggregate.mockResolvedValue({
      _sum: { allocatedAmount: '9000.00' },
    });

    await expect(
      service.create('event-1', {
        categoryId: category.id,
        itemName: 'Extra equipment',
        quantity: 2,
        unitPrice: 750,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Budget allocation exceeds the event budget by 500.00.',
      ),
    );
    expect(transactionClient.budgetItem.create).not.toHaveBeenCalled();
  });

  it('recalculates allocated amount when quantity is updated', async () => {
    transactionClient.budgetItem.findFirst.mockResolvedValue(storedItem);
    transactionClient.budgetItem.update.mockResolvedValue({
      ...storedItem,
      quantity: 3,
      allocatedAmount: '3000.00',
    });

    const result = await service.update('event-1', 'item-1', { quantity: 3 });

    expect(transactionClient.budgetItem.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'event-1', id: { not: 'item-1' } },
      }),
    );
    expect(transactionClient.budgetItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quantity: 3,
          unitPrice: '1000.00',
          allocatedAmount: '3000.00',
        }),
      }),
    );
    expect(result.allocatedAmount).toBe(3000);
  });

  it('rejects an empty update', async () => {
    await expect(service.update('event-1', 'item-1', {})).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not expose a budget item through a different event', async () => {
    prisma.budgetItem.findFirst.mockResolvedValue(null);

    await expect(service.findOne('event-2', 'item-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.budgetItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1', eventId: 'event-2' },
      }),
    );
  });

  it('prevents deletion when transactions reference the item', async () => {
    transactionClient.budgetItem.findFirst.mockResolvedValue({ id: 'item-1' });
    transactionClient.transaction.count.mockResolvedValue(1);

    await expect(service.remove('event-1', 'item-1')).rejects.toThrow(
      ConflictException,
    );
    expect(transactionClient.budgetItem.delete).not.toHaveBeenCalled();
  });

  it('deletes an unreferenced item', async () => {
    transactionClient.budgetItem.findFirst.mockResolvedValue({ id: 'item-1' });
    transactionClient.transaction.count.mockResolvedValue(0);
    transactionClient.budgetItem.delete.mockResolvedValue(storedItem);

    await expect(service.remove('event-1', 'item-1')).resolves.toEqual({
      message: 'Budget item deleted successfully.',
      id: 'item-1',
    });
  });

  it('fails explicitly when the database is unavailable', async () => {
    prisma.isDbAvailable.mockReturnValue(false);

    await expect(service.findAll('event-1')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(prisma.event.findUnique).not.toHaveBeenCalled();
  });
});
