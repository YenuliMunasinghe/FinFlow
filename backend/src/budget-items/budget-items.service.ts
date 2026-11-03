import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';

@Injectable()
export class BudgetItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories() {
    this.ensureDatabaseAvailable();

    return this.prisma.budgetCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(eventId: string) {
    this.ensureDatabaseAvailable();
    await this.ensureEventExists(this.prisma, eventId);

    const items = await this.prisma.budgetItem.findMany({
      where: { eventId },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async findOne(eventId: string, budgetItemId: string) {
    this.ensureDatabaseAvailable();

    const item = await this.prisma.budgetItem.findFirst({
      where: { id: budgetItemId, eventId },
      include: { category: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Budget item with ID "${budgetItemId}" was not found for this event.`,
      );
    }

    return this.toResponse(item);
  }

  async create(eventId: string, dto: CreateBudgetItemDto) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(
      async (transaction) => {
        const event = await this.ensureEventExists(transaction, eventId);
        await this.ensureCategoryExists(transaction, dto.categoryId);

        const allocatedAmount = this.calculateAllocatedAmount(
          dto.quantity,
          dto.unitPrice,
        );
        const currentAllocation = await this.getEventAllocation(
          transaction,
          eventId,
        );

        this.ensureWithinEventBudget(
          event.totalBudget,
          currentAllocation + allocatedAmount,
        );

        const item = await transaction.budgetItem.create({
          data: {
            eventId,
            categoryId: dto.categoryId,
            itemName: dto.itemName.trim(),
            quantity: dto.quantity,
            unitPrice: this.toMoney(dto.unitPrice),
            allocatedAmount: this.toMoney(allocatedAmount),
          },
          include: { category: true },
        });

        return this.toResponse(item);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Creates an event's initial budget items inside a caller-owned Prisma
   * transaction, applying the same rules as `create` (known categories,
   * quantity × unit price, total allocation within the event budget).
   */
  async createInitialItems(
    transaction: Prisma.TransactionClient,
    eventId: string,
    totalBudget: number,
    items: CreateBudgetItemDto[],
  ) {
    if (items.length === 0) {
      return;
    }

    const categoryIds = Array.from(new Set(items.map((i) => i.categoryId)));
    const categories = await transaction.budgetCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    const knownIds = new Set(categories.map((c) => c.id));
    const missing = categoryIds.find((id) => !knownIds.has(id));

    if (missing) {
      throw new NotFoundException(
        `Budget category with ID "${missing}" not found.`,
      );
    }

    const rows = items.map((item) => ({
      item,
      allocatedAmount: this.calculateAllocatedAmount(
        item.quantity,
        item.unitPrice,
      ),
    }));
    const totalAllocation = rows.reduce(
      (sum, row) => sum + Math.round(row.allocatedAmount * 100),
      0,
    );

    this.ensureWithinEventBudget(
      new Prisma.Decimal(totalBudget),
      totalAllocation / 100,
    );

    await transaction.budgetItem.createMany({
      data: rows.map(({ item, allocatedAmount }) => ({
        eventId,
        categoryId: item.categoryId,
        itemName: item.itemName.trim(),
        quantity: item.quantity,
        unitPrice: this.toMoney(item.unitPrice),
        allocatedAmount: this.toMoney(allocatedAmount),
      })),
    });
  }

  async update(
    eventId: string,
    budgetItemId: string,
    dto: UpdateBudgetItemDto,
  ) {
    this.ensureDatabaseAvailable();

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided.');
    }

    return this.prisma.$transaction(
      async (transaction) => {
        const event = await this.ensureEventExists(transaction, eventId);
        const existing = await transaction.budgetItem.findFirst({
          where: { id: budgetItemId, eventId },
        });

        if (!existing) {
          throw new NotFoundException(
            `Budget item with ID "${budgetItemId}" was not found for this event.`,
          );
        }

        if (dto.categoryId) {
          await this.ensureCategoryExists(transaction, dto.categoryId);
        }

        const quantity = dto.quantity ?? existing.quantity;
        const unitPrice = dto.unitPrice ?? Number(existing.unitPrice);
        const allocatedAmount = this.calculateAllocatedAmount(
          quantity,
          unitPrice,
        );
        const otherItemsAllocation = await this.getEventAllocation(
          transaction,
          eventId,
          budgetItemId,
        );

        this.ensureWithinEventBudget(
          event.totalBudget,
          otherItemsAllocation + allocatedAmount,
        );

        const item = await transaction.budgetItem.update({
          where: { id: budgetItemId },
          data: {
            ...(dto.categoryId && { categoryId: dto.categoryId }),
            ...(dto.itemName && { itemName: dto.itemName.trim() }),
            quantity,
            unitPrice: this.toMoney(unitPrice),
            allocatedAmount: this.toMoney(allocatedAmount),
          },
          include: { category: true },
        });

        return this.toResponse(item);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async remove(eventId: string, budgetItemId: string) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(async (transaction) => {
      const item = await transaction.budgetItem.findFirst({
        where: { id: budgetItemId, eventId },
        select: { id: true },
      });

      if (!item) {
        throw new NotFoundException(
          `Budget item with ID "${budgetItemId}" was not found for this event.`,
        );
      }

      const linkedTransactions = await transaction.transaction.count({
        where: { budgetItemId },
      });

      if (linkedTransactions > 0) {
        throw new ConflictException(
          'This budget item cannot be deleted because transactions reference it.',
        );
      }

      await transaction.budgetItem.delete({ where: { id: budgetItemId } });

      return { message: 'Budget item deleted successfully.', id: budgetItemId };
    });
  }

  private ensureDatabaseAvailable() {
    if (!this.prisma.isDbAvailable()) {
      throw new ServiceUnavailableException(
        'Financial data is temporarily unavailable. Please try again later.',
      );
    }
  }

  private async ensureEventExists(
    client: PrismaService | Prisma.TransactionClient,
    eventId: string,
  ) {
    const event = await client.event.findUnique({
      where: { id: eventId },
      select: { id: true, totalBudget: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found.`);
    }

    return event;
  }

  private async ensureCategoryExists(
    client: PrismaService | Prisma.TransactionClient,
    categoryId: string,
  ) {
    const category = await client.budgetCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(
        `Budget category with ID "${categoryId}" not found.`,
      );
    }
  }

  private async getEventAllocation(
    client: PrismaService | Prisma.TransactionClient,
    eventId: string,
    excludedItemId?: string,
  ) {
    const result = await client.budgetItem.aggregate({
      where: {
        eventId,
        ...(excludedItemId && { id: { not: excludedItemId } }),
      },
      _sum: { allocatedAmount: true },
    });

    return Number(result._sum.allocatedAmount ?? 0);
  }

  private calculateAllocatedAmount(quantity: number, unitPrice: number) {
    const amountInCents = quantity * Math.round(unitPrice * 100);
    return amountInCents / 100;
  }

  private ensureWithinEventBudget(
    totalBudget: Prisma.Decimal,
    proposedAllocation: number,
  ) {
    const totalBudgetInCents = Math.round(Number(totalBudget) * 100);
    const proposedAllocationInCents = Math.round(proposedAllocation * 100);

    if (proposedAllocationInCents > totalBudgetInCents) {
      const excess = (proposedAllocationInCents - totalBudgetInCents) / 100;
      throw new BadRequestException(
        `Budget allocation exceeds the event budget by ${excess.toFixed(2)}.`,
      );
    }
  }

  private toMoney(value: number) {
    return value.toFixed(2);
  }

  private toResponse(item: any) {
    return {
      id: item.id,
      eventId: item.eventId,
      category: {
        id: item.category.id,
        name: item.category.name,
      },
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      allocatedAmount: Number(item.allocatedAmount),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
