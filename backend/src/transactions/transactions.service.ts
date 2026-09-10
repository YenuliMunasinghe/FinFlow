import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionType } from './dto/create-transaction.dto';

export interface DefaultTransactionData {
  id: string;
  refNo: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  event: string;
  submitter: string;
  category: string;
  amount: number;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  receiptUrl?: string;
  isOverBudget?: boolean;
}

const mockTransactionsData: DefaultTransactionData[] = [
  {
    id: 'trx-1',
    refNo: 'TRX-2024-089',
    type: 'INCOME',
    title: 'Dialog Axiata Sponsorship Deposit',
    event: 'Annual Tech Symposium 2024',
    submitter: 'Kavinda Perera (EG/2021/8842)',
    category: 'Corporate Sponsorship',
    amount: 150000,
    date: 'Today, 10:24 AM',
    status: 'APPROVED',
  },
  {
    id: 'trx-2',
    refNo: 'TRX-2024-088',
    type: 'EXPENSE',
    title: 'Stage Sound & Lights Rental',
    event: 'Annual Tech Symposium 2024',
    submitter: 'Sandun Bandara (EG/2021/045)',
    category: 'Logistics',
    amount: 28500,
    date: 'Yesterday, 04:12 PM',
    status: 'PENDING',
  },
  {
    id: 'trx-3',
    refNo: 'TRX-2024-087',
    type: 'EXPENSE',
    title: 'Workshop Certificates & Banner Printing',
    event: 'Robotics Workshop',
    submitter: 'Dinithi Silva (EG/2021/112)',
    category: 'Printing & Stationery',
    amount: 14000,
    date: 'Jun 16, 02:00 PM',
    status: 'APPROVED',
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
            submitter: tx.submittedBy ? `${tx.submittedBy.name} (${tx.submittedBy.memberId || 'N/A'})` : 'Executive Member',
            category: tx.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
            amount: Number(tx.amount),
            date: tx.createdAt.toISOString().split('T')[0],
            status: tx.status as any,
            receiptUrl: tx.receiptUrl || undefined,
            isOverBudget: tx.isOverBudget,
          }));
        }
      }
    } catch (error: any) {
      this.logger.warn(`Database transaction list query failed: ${error.message}`);
    }

    return this.localStore.filter((tx) => {
      const matchStatus = !statusFilter || statusFilter === 'ALL' || tx.status === statusFilter;
      const matchType = !typeFilter || typeFilter === 'ALL' || tx.type === typeFilter;
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
            submitter: tx.submittedBy ? `${tx.submittedBy.name} (${tx.submittedBy.memberId || 'N/A'})` : 'Executive Member',
            category: tx.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
            amount: Number(tx.amount),
            date: tx.createdAt.toISOString().split('T')[0],
            status: tx.status as any,
            receiptUrl: tx.receiptUrl || undefined,
            isOverBudget: tx.isOverBudget,
          };
        }
      }
    } catch (error: any) {
      this.logger.warn(`Database transaction findOne query failed: ${error.message}`);
    }

    const found = this.localStore.find((tx) => tx.id === id);
    if (!found) {
      throw new NotFoundException(`Transaction with ID "${id}" not found.`);
    }
    return found;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const { title, type, amount, eventId, budgetItemId, receiptUrl, overrideJustification } = dto;

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
          submitter: created.submittedBy ? `${created.submittedBy.name} (${created.submittedBy.memberId})` : 'Society Member',
          category: type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement',
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
}
