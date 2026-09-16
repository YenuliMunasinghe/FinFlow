import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

export interface DefaultTransactionData {
  id: string;
  refNo: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  event: string;
  vendorOrSource?: string;
  submitter: string;
  submitterRole?: string;
  category: string;
  amount: number;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISION_REQUESTED';
  receiptUrl?: string;
  isOverBudget?: boolean;
  budgetAllocated?: number;
  budgetSpent?: number;
  rejectionReason?: string;
  revisionInstructions?: string;
}

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
        const where: any = {};
        if (statusFilter && statusFilter !== 'ALL') {
          where.status = statusFilter;
        }
        if (typeFilter && typeFilter !== 'ALL') {
          where.type = typeFilter;
        }

        const transactions = await this.prisma.transaction.findMany({
          where,
          include: {
            event: true,
            submittedBy: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (transactions && transactions.length > 0) {
          return transactions.map((tx) => ({
            id: tx.id,
            refNo: `TRX-${tx.id.slice(0, 6).toUpperCase()}`,
            type: tx.type as any,
            title: tx.title,
            event: tx.event ? tx.event.name : 'Society General',
            submitter: tx.submittedBy
              ? `${tx.submittedBy.name} (${tx.submittedBy.memberId || 'N/A'})`
              : 'Executive Member',
            category:
              tx.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
            amount: Number(tx.amount),
            date: tx.createdAt.toISOString().split('T')[0],
            status: tx.status as any,
            receiptUrl: tx.receiptUrl || undefined,
            isOverBudget: tx.isOverBudget,
          }));
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
          include: { event: true, submittedBy: true },
        });
        if (tx) {
          return {
            id: tx.id,
            refNo: `TRX-${tx.id.slice(0, 6).toUpperCase()}`,
            type: tx.type as any,
            title: tx.title,
            event: tx.event ? tx.event.name : 'Society General',
            submitter: tx.submittedBy
              ? `${tx.submittedBy.name} (${tx.submittedBy.memberId || 'N/A'})`
              : 'Executive Member',
            category:
              tx.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
            amount: Number(tx.amount),
            date: tx.createdAt.toISOString().split('T')[0],
            status: tx.status as any,
            receiptUrl: tx.receiptUrl || undefined,
            isOverBudget: tx.isOverBudget,
          };
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

  async create(userId: string, dto: CreateTransactionDto) {
    const {
      title,
      type,
      amount,
      eventId,
      budgetItemId,
      receiptUrl,
      overrideJustification,
    } = dto;

    try {
      if (this.prisma.isDbAvailable()) {
        const created = await this.prisma.transaction.create({
          data: {
            title,
            type,
            amount: Number(amount),
            eventId,
            budgetItemId,
            submittedById: userId,
            receiptUrl,
            overrideJustification,
            status: 'PENDING',
          },
          include: {
            event: true,
            submittedBy: true,
          },
        });

        return {
          id: created.id,
          refNo: `TRX-${created.id.slice(0, 6).toUpperCase()}`,
          type: created.type as any,
          title: created.title,
          event: created.event ? created.event.name : 'Society Event',
          submitter: created.submittedBy
            ? `${created.submittedBy.name} (${created.submittedBy.memberId})`
            : 'Society Member',
          category:
            type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
          amount: Number(created.amount),
          date: created.createdAt.toISOString().split('T')[0],
          status: 'PENDING' as const,
          receiptUrl: created.receiptUrl || undefined,
        };
      }
    } catch (error: any) {
      this.logger.warn(`Database transaction create failed: ${error.message}`);
    }

    const newTx: DefaultTransactionData = {
      id: `trx-${Date.now()}`,
      refNo: `TRX-2024-${String(this.localStore.length + 90).padStart(3, '0')}`,
      type,
      title,
      event: 'Society Event',
      submitter: 'Committee Member',
      category: type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      receiptUrl,
    };

    this.localStore.unshift(newTx);
    return newTx;
  }

  async approveTransaction(id: string, approverId?: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const updated = await this.prisma.transaction.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: approverId || undefined,
          },
        });
        return {
          message: 'Transaction approved',
          id: updated.id,
          status: updated.status,
        };
      }
    } catch (error: any) {
      this.logger.warn(`Database approval update failed: ${error.message}`);
    }

    const item = this.localStore.find((t) => t.id === id);
    if (item) {
      item.status = 'APPROVED';
    }
    return { message: 'Transaction approved', id, status: 'APPROVED' };
  }

  async rejectTransaction(id: string, rejectionReason?: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const updated = await this.prisma.transaction.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejectionReason,
          },
        });
        return {
          message: 'Transaction rejected',
          id: updated.id,
          status: updated.status,
        };
      }
    } catch (error: any) {
      this.logger.warn(`Database rejection update failed: ${error.message}`);
    }

    const item = this.localStore.find((t) => t.id === id);
    if (item) {
      item.status = 'REJECTED';
      item.rejectionReason = rejectionReason;
    }
    return { message: 'Transaction rejected', id, status: 'REJECTED' };
  }

  async requestRevision(id: string, instructions?: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const updated = await this.prisma.transaction.update({
          where: { id },
          data: {
            status: 'REVISION_REQUESTED',
            overrideJustification: instructions,
          },
        });
        return {
          message: 'Revision requested',
          id: updated.id,
          status: updated.status,
        };
      }
    } catch (error: any) {
      this.logger.warn(`Database revision update failed: ${error.message}`);
    }

    const item = this.localStore.find((t) => t.id === id);
    if (item) {
      item.status = 'REVISION_REQUESTED';
      item.revisionInstructions = instructions;
    }
    return { message: 'Revision requested', id, status: 'REVISION_REQUESTED' };
  }
}
