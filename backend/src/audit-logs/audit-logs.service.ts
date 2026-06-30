import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId?: string,
    ipAddress?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ipAddress,
      },
    });
  }

  async getUserLogs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEntityLogs(entityType: string, entityId: string, userId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUserStats(userId: string) {
    const [totalLogs, actionCounts] = await Promise.all([
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { userId },
        _count: { action: true },
      }),
    ]);

    return {
      totalLogs,
      actionBreakdown: actionCounts.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
    };
  }

  // Otomatik log tutma için helper metodlar
  async logCreate(userId: string, entityType: string, entityId: string, ipAddress?: string) {
    return this.logAction(userId, 'CREATE', entityType, entityId, ipAddress);
  }

  async logUpdate(userId: string, entityType: string, entityId: string, ipAddress?: string) {
    return this.logAction(userId, 'UPDATE', entityType, entityId, ipAddress);
  }

  async logDelete(userId: string, entityType: string, entityId: string, ipAddress?: string) {
    return this.logAction(userId, 'DELETE', entityType, entityId, ipAddress);
  }

  async logView(userId: string, entityType: string, entityId: string, ipAddress?: string) {
    return this.logAction(userId, 'VIEW', entityType, entityId, ipAddress);
  }

  async logLogin(userId: string, ipAddress?: string) {
    return this.logAction(userId, 'LOGIN', 'User', userId, ipAddress);
  }

  async logLogout(userId: string, ipAddress?: string) {
    return this.logAction(userId, 'LOGOUT', 'User', userId, ipAddress);
  }
}
