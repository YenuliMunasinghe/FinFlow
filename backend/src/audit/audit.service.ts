import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  user: string;
  role: string;
  timestamp: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-101',
    action: 'VOUCHER_SIGN_OFF',
    entityType: 'TRANSACTION',
    entityId: 'TRX-2024-089',
    details: 'Presidential sign-off affixed for Dialog Axiata Sponsorship Deposit (LKR 150,000.00)',
    user: 'Kavinda Perera (EG/2021/8842)',
    role: 'PRESIDENT',
    timestamp: 'Today, 10:24 AM',
  },
  {
    id: 'log-100',
    action: 'TRANSACTION_SUBMITTED',
    entityType: 'TRANSACTION',
    entityId: 'TRX-2024-088',
    details: 'Expense claim submitted for Stage Sound & Lights Rental (LKR 28,500.00)',
    user: 'Sandun Bandara (EG/2021/045)',
    role: 'COMMITTEE_MEMBER',
    timestamp: 'Yesterday, 04:12 PM',
  },
  {
    id: 'log-099',
    action: 'EVENT_CREATED',
    entityType: 'EVENT',
    entityId: 'EVT-2024-01',
    details: 'New society event created: Annual Tech Symposium 2024 with budget LKR 450,000.00',
    user: 'Kavindu Ratnayake (EG/2022/089)',
    role: 'TREASURER',
    timestamp: 'Jun 15, 02:00 PM',
  },
  {
    id: 'log-098',
    action: 'USER_REGISTERED',
    entityType: 'USER',
    entityId: 'EG/2022/1044',
    details: 'New society committee member account provisioned',
    user: 'Dinithi Silva (EG/2022/1044)',
    role: 'COMMITTEE_MEMBER',
    timestamp: 'Jun 10, 09:30 AM',
  },
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private localAuditLogs: AuditLogEntry[] = [...mockAuditLogs];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(actionFilter?: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        const logs = await this.prisma.auditLog.findMany({
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (logs && logs.length > 0) {
          return logs.map((l) => ({
            id: l.id,
            action: l.action,
            entityType: l.entityType,
            entityId: l.entityId || undefined,
            details: l.details || undefined,
            user: l.user ? `${l.user.name} (${l.user.memberId || 'N/A'})` : 'System User',
            role: l.user ? l.user.role : 'USER',
            timestamp: l.createdAt.toISOString().replace('T', ' ').slice(0, 16),
          }));
        }
      }
    } catch (error: any) {
      this.logger.warn(`Failed to fetch database audit logs: ${error.message}`);
    }

    if (actionFilter && actionFilter !== 'ALL') {
      return this.localAuditLogs.filter((l) => l.action === actionFilter);
    }
    return this.localAuditLogs;
  }

  async logAction(action: string, entityType: string, entityId: string, details: string, userId: string) {
    try {
      if (this.prisma.isDbAvailable()) {
        await this.prisma.auditLog.create({
          data: {
            action,
            entityType,
            entityId,
            details,
            userId,
          },
        });
      }
    } catch (error: any) {
      this.logger.warn(`Failed to record audit log entry: ${error.message}`);
    }

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityId,
      details,
      user: 'Active User',
      role: 'EXECUTIVE',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.localAuditLogs.unshift(newLog);
  }
}
