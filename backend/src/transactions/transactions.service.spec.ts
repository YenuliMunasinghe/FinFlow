import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService budget validation', () => {
  const now = new Date('2026-11-03T00:00:00.000Z');

  const tx = {
    event: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn() },
    budgetItem: { findUnique: jest.fn() },
    transaction: {
      aggregate: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const prisma = {
    isDbAvailable: jest.fn(),
    $transaction: jest.fn(),
  };

  let service: TransactionsService;

  /** Aggregate results: first call = budget item, second = event. */
  const committed = (itemSum: string | null, eventSum: string | null) => {
    tx.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: itemSum } })
      .mockResolvedValueOnce({ _sum: { amount: eventSum } });
  };

  const expenseDto = {
    title: ' Stage lights ',
    type: TransactionType.EXPENSE,
    amount: 3000,
    eventId: 'event-1',
    budgetItemId: 'item-1',
  };

  const storedRow = (overrides: Record<string, unknown> = {}) => ({
    id: 'trx-abcdef',
    title: 'Stage lights',
    type: 'EXPENSE',
    amount: '3000.00',
    eventId: 'event-1',
    budgetItemId: 'item-1',
    submittedById: 'user-1',
    status: 'PENDING',
    isOverBudget: false,
    overrideJustification: null,
    rejectionReason: null,
    receiptUrl: null,
    createdAt: now,
    event: { id: 'event-1', name: 'Tech Fest' },
    submittedBy: { name: 'Member', memberId: 'MEM-4' },
    budgetItem: { id: 'item-1', itemName: 'Lights', category: { name: 'Venue' } },
    ...overrides,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.isDbAvailable.mockReturnValue(true);
    prisma.$transaction.mockImplementation((callback: any) => callback(tx));
    tx.event.findUnique.mockResolvedValue({
      id: 'event-1',
      status: 'APPROVED',
      totalBudget: '20000.00',
    });
    tx.event.findUniqueOrThrow.mockResolvedValue({ totalBudget: '20000.00' });
    tx.budgetItem.findUnique.mockResolvedValue({
      id: 'item-1',
      eventId: 'event-1',
      allocatedAmount: '5000.00',
    });
    tx.transaction.create.mockImplementation(({ data }: any) =>
      Promise.resolve(storedRow(data)),
    );
    tx.transaction.update.mockImplementation(({ data }: any) =>
      Promise.resolve(storedRow(data)),
    );

    service = new TransactionsService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('accepts a within-budget expense and counts approved + pending against the limits', async () => {
      committed('1500.00', '8000.00');

      const result = await service.create('user-1', expenseDto);

      expect(tx.transaction.aggregate).toHaveBeenNthCalledWith(1, {
        where: {
          type: 'EXPENSE',
          status: { in: ['APPROVED', 'PENDING'] },
          budgetItemId: 'item-1',
        },
        _sum: { amount: true },
      });
      expect(tx.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Stage lights',
            amount: '3000.00',
            isOverBudget: false,
            status: 'PENDING',
            submittedById: 'user-1',
          }),
        }),
      );
      expect(result.budgetCheck).toEqual({
        isOverBudget: false,
        checks: [
          { scope: 'BUDGET_ITEM', allocated: 5000, committed: 1500, projected: 4500, overBy: 0 },
          { scope: 'EVENT', allocated: 20000, committed: 8000, projected: 11000, overBy: 0 },
        ],
      });
    });

    it('requires a budget item for expenses', async () => {
      await expect(
        service.create('user-1', { ...expenseDto, budgetItemId: undefined }),
      ).rejects.toThrow(
        new BadRequestException(
          'Expenses must be assigned to a budget item of the event.',
        ),
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a budget item on income', async () => {
      await expect(
        service.create('user-1', {
          ...expenseDto,
          type: TransactionType.INCOME,
        }),
      ).rejects.toThrow('Income cannot be assigned to a budget item.');
    });

    it('records income without any budget check', async () => {
      const result = await service.create('user-1', {
        ...expenseDto,
        type: TransactionType.INCOME,
        budgetItemId: undefined,
      });

      expect(tx.transaction.aggregate).not.toHaveBeenCalled();
      expect(result.budgetCheck).toBeNull();
    });

    it('rejects a budget item that belongs to a different event', async () => {
      tx.budgetItem.findUnique.mockResolvedValue({
        id: 'item-1',
        eventId: 'event-2',
        allocatedAmount: '5000.00',
      });

      await expect(service.create('user-1', expenseDto)).rejects.toThrow(
        new BadRequestException(
          'The budget item does not belong to the selected event.',
        ),
      );
      expect(tx.transaction.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown budget item', async () => {
      tx.budgetItem.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', expenseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects transactions on a closed event', async () => {
      tx.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'CLOSED',
        totalBudget: '20000.00',
      });

      await expect(service.create('user-1', expenseDto)).rejects.toThrow(
        'Event is CLOSED and no longer accepts transactions.',
      );
    });

    it('requires a justification when the expense exceeds its budget item', async () => {
      committed('4000.00', '8000.00');

      const error = await service
        .create('user-1', expenseDto)
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toEqual(
        expect.objectContaining({
          code: 'OVER_BUDGET_JUSTIFICATION_REQUIRED',
          budgetCheck: expect.objectContaining({
            isOverBudget: true,
            checks: expect.arrayContaining([
              expect.objectContaining({ scope: 'BUDGET_ITEM', overBy: 2000 }),
            ]),
          }),
        }),
      );
      expect(tx.transaction.create).not.toHaveBeenCalled();
    });

    it('detects an event-level overrun even when the item has room', async () => {
      committed('0', '18500.00');

      await expect(
        service.create('user-1', { ...expenseDto, overrideJustification: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('stores a justified over-budget expense with isOverBudget set', async () => {
      committed('4000.00', '8000.00');

      const result = await service.create('user-1', {
        ...expenseDto,
        overrideJustification: '  Vendor raised prices after booking.  ',
      });

      expect(tx.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isOverBudget: true,
            overrideJustification: 'Vendor raised prices after booking.',
          }),
        }),
      );
      expect(result.isOverBudget).toBe(true);
    });

    it('treats an expense that exactly uses the allocation as within budget', async () => {
      committed('2000.00', '8000.00');

      const result = await service.create('user-1', expenseDto);

      expect(result.budgetCheck?.isOverBudget).toBe(false);
    });

    it('refuses to fake a submission when the database is unavailable', async () => {
      prisma.isDbAvailable.mockReturnValue(false);

      await expect(service.create('user-1', expenseDto)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('approveTransaction', () => {
    it('re-checks against approved expenses only, excluding itself', async () => {
      tx.transaction.findUnique.mockResolvedValue(storedRow());
      committed('1000.00', '5000.00');

      const result = await service.approveTransaction('trx-abcdef', 'pres-1');

      expect(tx.transaction.aggregate).toHaveBeenNthCalledWith(1, {
        where: {
          type: 'EXPENSE',
          status: { in: ['APPROVED'] },
          id: { not: 'trx-abcdef' },
          budgetItemId: 'item-1',
        },
        _sum: { amount: true },
      });
      expect(tx.transaction.update).toHaveBeenCalledWith({
        where: { id: 'trx-abcdef' },
        data: { status: 'APPROVED', approvedById: 'pres-1', isOverBudget: false },
      });
      expect(result.status).toBe('APPROVED');
    });

    it('blocks approving an unjustified expense that became over budget', async () => {
      tx.transaction.findUnique.mockResolvedValue(storedRow());
      committed('4500.00', '5000.00');

      await expect(
        service.approveTransaction('trx-abcdef', 'pres-1'),
      ).rejects.toThrow(ConflictException);
      expect(tx.transaction.update).not.toHaveBeenCalled();
    });

    it('approves a justified over-budget expense and keeps the flag', async () => {
      tx.transaction.findUnique.mockResolvedValue(
        storedRow({ overrideJustification: 'Approved by committee vote.' }),
      );
      committed('4500.00', '5000.00');

      const result = await service.approveTransaction('trx-abcdef', 'pres-1');

      expect(result.isOverBudget).toBe(true);
    });

    it('only approves pending transactions', async () => {
      tx.transaction.findUnique.mockResolvedValue(
        storedRow({ status: 'REJECTED' }),
      );

      await expect(
        service.approveTransaction('trx-abcdef', 'pres-1'),
      ).rejects.toThrow(
        'Only pending transactions can be approved; this one is REJECTED.',
      );
    });

    it('returns 404 for an unknown transaction instead of a fake success', async () => {
      tx.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.approveTransaction('missing', 'pres-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestRevision', () => {
    it('stores instructions as reviewer feedback without touching the justification', async () => {
      tx.transaction.findUnique.mockResolvedValue(storedRow());

      await service.requestRevision('trx-abcdef', ' Attach the quotation. ');

      expect(tx.transaction.update).toHaveBeenCalledWith({
        where: { id: 'trx-abcdef' },
        data: {
          status: 'REVISION_REQUESTED',
          rejectionReason: 'Attach the quotation.',
        },
      });
    });
  });

  describe('resubmit', () => {
    const revisionRow = () =>
      storedRow({
        status: 'REVISION_REQUESTED',
        rejectionReason: 'Too expensive',
      });

    it('lets the submitter fix the amount and returns the transaction to PENDING', async () => {
      tx.transaction.findUnique.mockResolvedValue(revisionRow());
      committed('1000.00', '5000.00');

      const result = await service.resubmit('user-1', 'trx-abcdef', {
        amount: 2500,
      });

      expect(tx.transaction.aggregate).toHaveBeenNthCalledWith(1, {
        where: {
          type: 'EXPENSE',
          status: { in: ['APPROVED', 'PENDING'] },
          id: { not: 'trx-abcdef' },
          budgetItemId: 'item-1',
        },
        _sum: { amount: true },
      });
      expect(tx.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: '2500.00',
            status: 'PENDING',
            rejectionReason: null,
            isOverBudget: false,
          }),
        }),
      );
      expect(result.status).toBe('PENDING');
    });

    it('applies the same over-budget justification rule', async () => {
      tx.transaction.findUnique.mockResolvedValue(revisionRow());
      committed('4000.00', '5000.00');

      await expect(
        service.resubmit('user-1', 'trx-abcdef', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('only allows the original submitter', async () => {
      tx.transaction.findUnique.mockResolvedValue(revisionRow());

      await expect(
        service.resubmit('someone-else', 'trx-abcdef', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('only resubmits transactions awaiting revision', async () => {
      tx.transaction.findUnique.mockResolvedValue(storedRow());

      await expect(
        service.resubmit('user-1', 'trx-abcdef', {}),
      ).rejects.toThrow(ConflictException);
    });
  });
});
