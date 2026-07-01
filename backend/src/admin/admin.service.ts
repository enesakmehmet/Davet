import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  // Site sayfa görüntüleme özeti (dahili analytics)
  async getPageViewStats() {
    return this.analytics.getPageViewStats();
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalInvitations,
      totalTemplates,
      totalPayments,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.invitation.count(),
      this.prisma.template.count(),
      this.prisma.payment.count(),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      this.prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });

    return {
      totalUsers,
      totalInvitations,
      totalTemplates,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentUsers,
      recentPayments,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              invitations: true,
              templates: true,
              payments: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        invitations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        templates: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          orderBy: { endDate: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async updateUserStatus(id: string, status: string) {
    const safe = status === 'suspended' ? 'suspended' : 'active';
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: safe },
      select: { id: true, email: true, status: true },
    });
    return { message: 'Kullanıcı durumu güncellendi', user };
  }

  async updateUserRole(id: string, role: string) {
    const safe = role === 'admin' ? 'admin' : 'user';
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: safe },
      select: { id: true, email: true, role: true },
    });
    return { message: 'Kullanıcı rolü güncellendi', user };
  }

  async getAllTemplates(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { deletedAt: status === 'deleted' ? { not: null } : null } : {};

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              email: true,
              name: true,
            },
          },
          category: true,
          _count: {
            select: {
              reviews: true,
              sales: true,
            },
          },
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveTemplate(id: string) {
    const template = await this.prisma.template.update({
      where: { id },
      data: { isPremium: true },
    });

    return { message: 'Şablon onaylandı', template };
  }

  async rejectTemplate(id: string, reason: string) {
    const template = await this.prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Buraya bildirim gönderilebilir
    return { message: 'Şablon reddedildi', template, reason };
  }

  async getAllPayments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          templateSales: {
            include: {
              template: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllAuditLogs(
    page: number = 1,
    limit: number = 50,
    userId?: string,
    action?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
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

  async deleteUser(id: string) {
    // Cascade delete yapılandırılmış, Prisma otomatik siler
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Kullanıcı silindi' };
  }

  // Tüm davetiyeler (admin)
  async getAllInvitations(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          eventDate: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
          _count: { select: { guests: true } },
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Bir davetiyenin RSVP/misafir listesi (admin)
  async getInvitationGuests(invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, title: true, slug: true },
    });
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı.');
    const guests = await this.prisma.guest.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });
    const attending = guests.filter((g) => g.status === 'attending').length;
    const notAttending = guests.filter((g) => g.status === 'not_attending').length;
    return { invitation, guests, summary: { total: guests.length, attending, notAttending } };
  }

  // Admin: uygunsuz/sahte bir davetiyeyi doğrudan yayından kaldırır (sahiplik kontrolü yapılmaz)
  async removeInvitation(invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
    });
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı veya zaten kaldırılmış.');

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Davetiye yayından kaldırıldı.' };
  }

  // Son 30 gün: günlük yeni kullanıcı + günlük gelir trendi (dashboard grafiği için)
  async getTrends() {
    const since = new Date(Date.now() - 30 * 86400000);

    const [users, payments] = await Promise.all([
      this.prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.payment.findMany({
        where: { createdAt: { gte: since }, status: 'completed' },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    }

    const dailyUsers: Record<string, number> = {};
    const dailyRevenue: Record<string, number> = {};
    days.forEach((d) => { dailyUsers[d] = 0; dailyRevenue[d] = 0; });

    users.forEach((u) => {
      const d = u.createdAt.toISOString().slice(0, 10);
      if (dailyUsers[d] !== undefined) dailyUsers[d]++;
    });
    payments.forEach((p) => {
      const d = p.createdAt.toISOString().slice(0, 10);
      if (dailyRevenue[d] !== undefined) dailyRevenue[d] += Number(p.amount || 0);
    });

    return { days, dailyUsers, dailyRevenue };
  }
}
