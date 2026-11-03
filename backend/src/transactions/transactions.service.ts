import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  PrismaService,
  SERIALIZABLE_TRANSACTION,
  TRANSACTION_TIMEOUTS,
} from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ResubmitTransactionDto } from './dto/resubmit-transaction.dto';

export interface DefaultTransactionData {
  id: string;
  refNo: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  event: string;
  eventId?: string;
  budgetItemId?: string | null;
  vendorOrSource?: string;
  submitter: string;
  submitterRole?: string;
  category: string;
  amount: number;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISION_REQUESTED';
  receiptUrl?: string;
  isOverBudget?: boolean;
  overrideJustification?: string | null;
  budgetAllocated?: number;
  budgetSpent?: number;
  rejectionReason?: string;
  revisionInstructions?: string;
}

/** One budget limit (a budget item or the whole event) evaluated for an expense. */
export interface BudgetLimitCheck {
  scope: 'BUDGET_ITEM' | 'EVENT';
  allocated: number;
  /** Other expenses already counted against this limit. */
  committed: number;
  /** committed + this expense. */
  projected: number;
  /** projected - allocated, or 0 when within the limit. */
  overBy: number;
}

export interface BudgetAssessment {
  isOverBudget: boolean;
  checks: BudgetLimitCheck[];
}

type TransactionStatus = DefaultTransactionData['status'];
type Tx = Prisma.TransactionClient;

/** Expenses that count against a budget when an expense is submitted. */
const SUBMISSION_COMMITTED_STATUSES: TransactionStatus[] = [
  'APPROVED',
  'PENDING',
];
/** Expenses that count against a budget when an expense is approved. */
const APPROVAL_COMMITTED_STATUSES: TransactionStatus[] = ['APPROVED'];
/** Events in these states no longer accept transactions. */
const CLOSED_EVENT_STATUSES = ['CLOSED', 'REJECTED'];
const MIN_JUSTIFICATION_LENGTH = 10;

const transactionInclude = {
  event: { select: { id: true, name: true } },
  submittedBy: { select: { name: true, memberId: true } },
  budgetItem: {
    select: { id: true, itemName: true, category: { select: { name: true } } },
  },
} satisfies Prisma.TransactionInclude;

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

const mockTransactionsData: DefaultTransactionData[] = [
  {
    id: 'trx-104',
    refNo: 'EXP-2024-104',
    type: 'EXPENSE',
    title: 'Sound Equipment & Mic Rental for Annual Tech Fest',
    event: 'Annual Tech Symposium 2024',
    vendorOrSource: 'Sonic Pro Audio (Pvt) Ltd',
    submitter: 'Sandun Bandara (EG/2021/045)',
    submitterRole: 'Assistant Treasurer',
    category: 'Audio & Visual Hire',
    amount: 28500,
    budgetAllocated: 40000,
    budgetSpent: 28500,
    date: 'Today, 04:30 PM',
    status: 'PENDING',
  },
  {
    id: 'trx-105',
    refNo: 'EXP-2024-105',
    type: 'EXPENSE',
    title: 'Refreshments & Catering for Workshop Attendees',
    event: 'Robotics & AI Workshop',
    vendorOrSource: 'Premier Caterers Ltd',
    submitter: 'Dinithi Silva (EG/2021/112)',
    submitterRole: 'Committee Member',
    category: 'Food & Catering',
    amount: 24000,
    budgetAllocated: 30000,
    budgetSpent: 24000,
    date: 'Today, 02:15 PM',
    status: 'PENDING',
  },
  {
    id: 'trx-041',
    refNo: 'INC-2024-041',
    type: 'INCOME',
    title: 'IFS Corporate Sponsorship Milestone Deposit',
    event: 'Annual Tech Symposium 2024',
    vendorOrSource: 'IFS R&D Sri Lanka',
    submitter: 'Kavindu Ratnayake (EG/2022/089)',
    submitterRole: 'Treasurer',
    category: 'Corporate Sponsorship',
    amount: 100000,
    budgetAllocated: 150000,
    budgetSpent: 100000,
    date: 'Yesterday, 05:40 PM',
    status: 'PENDING',
  },
];

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private localStore: DefaultTransactionData[] = [...mockTransactionsData];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(statusFilter?: string, typeFilter?: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const where: Prisma.TransactionWhereInput = {};
        if (statusFilter && statusFilter !== 'ALL') {
          where.status = statusFilter;
        }
        if (typeFilter && typeFilter !== 'ALL') {
          where.type = typeFilter;
        }

        const transactions = await this.prisma.transaction.findMany({
          where,
          include: transactionInclude,
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (transactions && transactions.length > 0) {
          return transactions.map((tx) => this.toResponse(tx));
        }
      }
    } catch (error: any) {
      this.logger.warn(
        `Database transaction list query failed: ${error.message}`,
      );
    }

    return this.localStore.filter((tx) => {
      const matchStatus =
        !statusFilter || statusFilter === 'ALL' || tx.status === statusFilter;
      const matchType =
        !typeFilter || typeFilter === 'ALL' || tx.type === typeFilter;
      return matchStatus && matchType;
    });
  }

  async findOne(id: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const tx = await this.prisma.transaction.findUnique({
          where: { id },
          include: transactionInclude,
        });
        if (tx) {
          return this.toResponse(tx);
        }
      }
    } catch (error: any) {
      this.logger.warn(
        `Database transaction findOne query failed: ${error.message}`,
      );
    }

    const found = this.localStore.find((tx) => tx.id === id);
    if (!found) {
      throw new NotFoundException(`Transaction with ID "${id}" not found.`);
    }
    return found;
  }

  /**
   * Submits a transaction as PENDING. Expenses must target a budget item of
   * the same event; if the expense (plus approved and pending expenses) would
   * exceed the item allocation or the event budget, it is flagged
   * `isOverBudget` and requires an override justification.
   */
  async create(userId: string, dto: CreateTransactionDto) {
    this.ensureDatabaseAvailable();
    this.ensureBudgetItemAssignment(dto.type, dto.budgetItemId);

    const amountCents = this.toCents(dto.amount);

    return this.prisma.$transaction(
      async (tx) => {
        const event = await this.getOpenEvent(tx, dto.eventId);
        let assessment: BudgetAssessment | null = null;

        if (dto.type === 'EXPENSE') {
          assessment = await this.assessExpense(tx, {
            eventId: event.id,
            eventBudget: event.totalBudget,
            budgetItemId: dto.budgetItemId!,
            amountCents,
            committedStatuses: SUBMISSION_COMMITTED_STATUSES,
          });
        }

        const justification = this.resolveJustification(
          assessment,
          dto.overrideJustification,
        );

        const created = await tx.transaction.create({
          data: {
            title: dto.title.trim(),
            type: dto.type,
            amount: this.toMoney(amountCents),
            eventId: event.id,
            budgetItemId: dto.budgetItemId ?? null,
            submittedById: userId,
            receiptUrl: dto.receiptUrl,
            overrideJustification: justification,
            isOverBudget: assessment?.isOverBudget ?? false,
            status: 'PENDING',
          },
          include: transactionInclude,
        });

        return { ...this.toResponse(created), budgetCheck: assessment };
      },
      SERIALIZABLE_TRANSACTION,
    );
  }

  /**
   * Approves a PENDING transaction. Expenses are re-checked against already
   * approved expenses; an over-budget expense cannot be approved without the
   * submitter's override justification.
   */
  async approveTransaction(id: string, approverId: string) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(
      async (tx) => {
        const existing = await this.getPendingTransaction(tx, id, 'approved');
        let assessment: BudgetAssessment | null = null;

        if (existing.type === 'EXPENSE') {
          const event = await tx.event.findUniqueOrThrow({
            where: { id: existing.eventId },
            select: { totalBudget: true },
          });

          assessment = await this.assessExpense(tx, {
            eventId: existing.eventId,
            eventBudget: event.totalBudget,
            budgetItemId: existing.budgetItemId,
            amountCents: this.toCents(existing.amount),
            committedStatuses: APPROVAL_COMMITTED_STATUSES,
            excludeTransactionId: existing.id,
          });

          if (
            assessment.isOverBudget &&
            !this.hasValidJustification(existing.overrideJustification)
          ) {
            throw new ConflictException({
              code: 'OVER_BUDGET_JUSTIFICATION_REQUIRED',
              message:
                'Approving this expense would exceed the budget and it has no override justification. Request a revision so the submitter can justify or adjust it.',
              budgetCheck: assessment,
            });
          }
        }

        const updated = await tx.transaction.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: approverId,
            isOverBudget: assessment?.isOverBudget ?? false,
          },
        });

        return {
          message: 'Transaction approved',
          id: updated.id,
          status: updated.status,
          isOverBudget: updated.isOverBudget,
          budgetCheck: assessment,
        };
      },
      SERIALIZABLE_TRANSACTION,
    );
  }

  async rejectTransaction(id: string, rejectionReason?: string) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(async (tx) => {
      await this.getPendingTransaction(tx, id, 'rejected');

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason?.trim() || null,
        },
      });

      return {
        message: 'Transaction rejected',
        id: updated.id,
        status: updated.status,
      };
    }, TRANSACTION_TIMEOUTS);
  }

  /**
   * Sends a PENDING transaction back to its submitter. The reviewer's
   * instructions are stored in `rejectionReason` (the reviewer-feedback
   * field) so they never overwrite the submitter's override justification.
   */
  async requestRevision(id: string, instructions?: string) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(async (tx) => {
      await this.getPendingTransaction(tx, id, 'sent for revision');

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: 'REVISION_REQUESTED',
          rejectionReason: instructions?.trim() || null,
        },
      });

      return {
        message: 'Revision requested',
        id: updated.id,
        status: updated.status,
      };
    }, TRANSACTION_TIMEOUTS);
  }

  /**
   * Lets the original submitter answer a revision request. The updated
   * transaction goes through the same budget validation as a new submission
   * and returns to PENDING.
   */
  async resubmit(userId: string, id: string, dto: ResubmitTransactionDto) {
    this.ensureDatabaseAvailable();

    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.transaction.findUnique({ where: { id } });

        if (!existing) {
          throw new NotFoundException(`Transaction with ID "${id}" not found.`);
        }
        if (existing.submittedById !== userId) {
          throw new ForbiddenException(
            'Only the original submitter can resubmit this transaction.',
          );
        }
        if (existing.status !== 'REVISION_REQUESTED') {
          throw new ConflictException(
            `Only transactions awaiting revision can be resubmitted; this one is ${existing.status}.`,
          );
        }

        const type = existing.type as CreateTransactionDto['type'];
        const budgetItemId =
          dto.budgetItemId !== undefined
            ? dto.budgetItemId
            : existing.budgetItemId;
        this.ensureBudgetItemAssignment(type, budgetItemId ?? undefined);

        const amountCents =
          dto.amount !== undefined
            ? this.toCents(dto.amount)
            : this.toCents(existing.amount);
        const event = await this.getOpenEvent(tx, existing.eventId);
        let assessment: BudgetAssessment | null = null;

        if (type === 'EXPENSE') {
          assessment = await this.assessExpense(tx, {
            eventId: event.id,
            eventBudget: event.totalBudget,
            budgetItemId: budgetItemId!,
            amountCents,
            committedStatuses: SUBMISSION_COMMITTED_STATUSES,
            excludeTransactionId: existing.id,
          });
        }

        const justification = this.resolveJustification(
          assessment,
          dto.overrideJustification ?? existing.overrideJustification,
        );

        const updated = await tx.transaction.update({
          where: { id },
          data: {
            ...(dto.title && { title: dto.title.trim() }),
            ...(dto.receiptUrl !== undefined && { receiptUrl: dto.receiptUrl }),
            amount: this.toMoney(amountCents),
            budgetItemId: budgetItemId ?? null,
            overrideJustification: justification,
            isOverBudget: assessment?.isOverBudget ?? false,
            status: 'PENDING',
            rejectionReason: null,
          },
          include: transactionInclude,
        });

        return { ...this.toResponse(updated), budgetCheck: assessment };
      },
      SERIALIZABLE_TRANSACTION,
    );
  }

  private ensureDatabaseAvailable() {
    if (!this.prisma.isDbAvailable()) {
      throw new ServiceUnavailableException(
        'Transactions cannot be changed while the database is unavailable.',
      );
    }
  }

  private ensureBudgetItemAssignment(
    type: CreateTransactionDto['type'],
    budgetItemId?: string | null,
  ) {
    if (type === 'EXPENSE' && !budgetItemId) {
      throw new BadRequestException(
        'Expenses must be assigned to a budget item of the event.',
      );
    }
    if (type === 'INCOME' && budgetItemId) {
      throw new BadRequestException(
        'Income cannot be assigned to a budget item.',
      );
    }
  }

  private async getOpenEvent(tx: Tx, eventId: string) {
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, totalBudget: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found.`);
    }
    if (CLOSED_EVENT_STATUSES.includes(event.status)) {
      throw new BadRequestException(
        `Event is ${event.status} and no longer accepts transactions.`,
      );
    }

    return event;
  }

  private async getPendingTransaction(tx: Tx, id: string, action: string) {
    const existing = await tx.transaction.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Transaction with ID "${id}" not found.`);
    }
    if (existing.status !== 'PENDING') {
      throw new ConflictException(
        `Only pending transactions can be ${action}; this one is ${existing.status}.`,
      );
    }

    return existing;
  }

  /**
   * Compares an expense against its budget item allocation (when it has one)
   * and the event's total budget. All arithmetic is done in integer cents.
   */
  private async assessExpense(
    tx: Tx,
    params: {
      eventId: string;
      eventBudget: Prisma.Decimal;
      budgetItemId: string | null;
      amountCents: number;
      committedStatuses: TransactionStatus[];
      excludeTransactionId?: string;
    },
  ): Promise<BudgetAssessment> {
    const baseWhere: Prisma.TransactionWhereInput = {
      type: 'EXPENSE',
      status: { in: params.committedStatuses },
      ...(params.excludeTransactionId && {
        id: { not: params.excludeTransactionId },
      }),
    };
    const checks: BudgetLimitCheck[] = [];

    if (params.budgetItemId) {
      const item = await tx.budgetItem.findUnique({
        where: { id: params.budgetItemId },
        select: { id: true, eventId: true, allocatedAmount: true },
      });

      if (!item) {
        throw new NotFoundException(
          `Budget item with ID "${params.budgetItemId}" not found.`,
        );
      }
      if (item.eventId !== params.eventId) {
        throw new BadRequestException(
          'The budget item does not belong to the selected event.',
        );
      }

      const itemCommitted = await tx.transaction.aggregate({
        where: { ...baseWhere, budgetItemId: item.id },
        _sum: { amount: true },
      });

      checks.push(
        this.buildCheck(
          'BUDGET_ITEM',
          this.toCents(item.allocatedAmount),
          this.toCents(itemCommitted._sum.amount ?? 0),
          params.amountCents,
        ),
      );
    }

    const eventCommitted = await tx.transaction.aggregate({
      where: { ...baseWhere, eventId: params.eventId },
      _sum: { amount: true },
    });

    checks.push(
      this.buildCheck(
        'EVENT',
        this.toCents(params.eventBudget),
        this.toCents(eventCommitted._sum.amount ?? 0),
        params.amountCents,
      ),
    );

    return {
      isOverBudget: checks.some((check) => check.overBy > 0),
      checks,
    };
  }

  private buildCheck(
    scope: BudgetLimitCheck['scope'],
    allocatedCents: number,
    committedCents: number,
    amountCents: number,
  ): BudgetLimitCheck {
    const projectedCents = committedCents + amountCents;

    return {
      scope,
      allocated: allocatedCents / 100,
      committed: committedCents / 100,
      projected: projectedCents / 100,
      overBy: Math.max(0, projectedCents - allocatedCents) / 100,
    };
  }

  /**
   * Over-budget expenses must carry a meaningful justification; within-budget
   * transactions keep any note the submitter provided.
   */
  private resolveJustification(
    assessment: BudgetAssessment | null,
    justification?: string | null,
  ): string | null {
    const trimmed = justification?.trim() || null;

    if (assessment?.isOverBudget && !this.hasValidJustification(trimmed)) {
      throw new BadRequestException({
        code: 'OVER_BUDGET_JUSTIFICATION_REQUIRED',
        message: `This expense exceeds the available budget. Provide an override justification of at least ${MIN_JUSTIFICATION_LENGTH} characters.`,
        budgetCheck: assessment,
      });
    }

    return trimmed;
  }

  private hasValidJustification(justification?: string | null) {
    return (justification?.trim().length ?? 0) >= MIN_JUSTIFICATION_LENGTH;
  }

  private toCents(value: Prisma.Decimal | number | string) {
    return Math.round(Number(value) * 100);
  }

  private toMoney(cents: number) {
    return (cents / 100).toFixed(2);
  }

  private toResponse(tx: TransactionWithRelations): DefaultTransactionData {
    return {
      id: tx.id,
      refNo: `TRX-${tx.id.slice(0, 6).toUpperCase()}`,
      type: tx.type as DefaultTransactionData['type'],
      title: tx.title,
      event: tx.event ? tx.event.name : 'Society General',
      eventId: tx.eventId,
      budgetItemId: tx.budgetItemId,
      submitter: tx.submittedBy
        ? `${tx.submittedBy.name} (${tx.submittedBy.memberId || 'N/A'})`
        : 'Executive Member',
      category:
        tx.budgetItem?.category.name ??
        (tx.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement'),
      amount: Number(tx.amount),
      date: tx.createdAt.toISOString().split('T')[0],
      status: tx.status as TransactionStatus,
      receiptUrl: tx.receiptUrl || undefined,
      isOverBudget: tx.isOverBudget,
      overrideJustification: tx.overrideJustification,
      rejectionReason: tx.rejectionReason ?? undefined,
    };
  }
}
