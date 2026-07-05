import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly whatsapp: WhatsappService,
    private readonly leads: LeadsService,
  ) {}

  // Site sayfa görüntüleme özeti (dahili analytics)
  async getPageViewStats() {
    return this.analytics.getPageViewStats();
  }

  // WhatsApp destek butonuna kim ne zaman tıkladı (admin panel takibi)
  async getWhatsappClicks(page: number = 1, limit: number = 20) {
    return this.whatsapp.getClicks(page, limit);
  }

  // Anasayfada e-posta bırakan ilgilenenler (admin panel takibi)
  async getLeads(page: number = 1, limit: number = 20) {
    return this.leads.getAll(page, limit);
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalInvitations,
      totalTemplates,
      totalPayments,
      mobileUsers,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.invitation.count(),
      this.prisma.template.count(),
      this.prisma.payment.count(),
      this.prisma.user.count({ where: { lastPlatform: 'mobile' } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          lastPlatform: true,
          lastActiveAt: true,
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
      mobileUsers, // en son mobil uygulamadan giriş/refresh yapmış kullanıcı sayısı
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
          lastPlatform: true,
          lastActiveAt: true,
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

  // Çöp kutusundaki (kullanıcı ya da admin tarafından silinmiş) tüm davetiyeler — kim, ne zaman
  async getTrashedInvitations(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: { not: null } };
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
        orderBy: { deletedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          eventDate: true,
          deletedAt: true,
          user: { select: { email: true, name: true } },
          _count: { select: { guests: true } },
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Çöp kutusundaki bir davetiyeyi geri getirir (herhangi bir kullanıcıya ait olabilir — admin override)
  async restoreInvitation(invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: { not: null } },
    });
    if (!invitation) throw new NotFoundException('Davetiye çöp kutusunda bulunamadı.');

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: { deletedAt: null },
    });
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

    // Davete bağlı, backend'e yüklenmiş dosyaları (müzik + fotoğraflar) DB'den tamamen sil
    try {
      const cfg: any = invitation.config;
      const assetIds = new Set<string>();
      const collect = (val: unknown) => {
        if (typeof val !== 'string') return;
        const matches = val.matchAll(/\/assets\/file\/([0-9a-fA-F-]+)/g);
        for (const m of matches) assetIds.add(m[1]);
      };
      collect(cfg?.musicUrl);
      if (Array.isArray(cfg?.photos)) cfg.photos.forEach(collect);

      if (assetIds.size) {
        await this.prisma.asset.deleteMany({ where: { id: { in: [...assetIds] }, userId: invitation.userId } });
      }
    } catch {
      /* dosya silme hatası daveti kaldırmayı engellemesin */
    }

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

  // Moderasyon: platform genelinde son yüklenen misafir fotoğrafları (davet/yükleyen bilgisiyle)
  async getGuestPhotos(page: number = 1, limit: number = 24, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { invitation: { title: { contains: search, mode: 'insensitive' } } },
        { invitation: { slug: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.guestPhoto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          guestName: true,
          mime: true,
          size: true,
          createdAt: true,
          invitation: { select: { id: true, title: true, slug: true, deletedAt: true, user: { select: { email: true, name: true } } } },
        },
      }),
      this.prisma.guestPhoto.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Admin: uygunsuz bir misafir fotoğrafını doğrudan siler (sahiplik kontrolü yapılmaz)
  async removeGuestPhoto(id: string) {
    const photo = await this.prisma.guestPhoto.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Fotoğraf bulunamadı.');
    await this.prisma.guestPhoto.delete({ where: { id } });
    return { message: 'Fotoğraf silindi.' };
  }

  // Platformda gönderilmiş tüm bildirimler (kime, ne zaman, okundu mu)
  async getAllNotifications(page: number = 1, limit: number = 30, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, content: true, isRead: true, createdAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Admin: tek bir kullanıcıya (userId) ya da herkese (userId boş) bildirim gönderir
  async sendNotification(title: string, content: string, userId?: string) {
    const cleanTitle = String(title || '').trim().slice(0, 200);
    const cleanContent = String(content || '').trim().slice(0, 2000);
    if (!cleanTitle || !cleanContent) throw new NotFoundException('Başlık ve içerik zorunlu.');

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
      await this.prisma.notification.create({ data: { userId, title: cleanTitle, content: cleanContent } });
      return { message: 'Bildirim gönderildi.', count: 1 };
    }

    // Broadcast: tüm kullanıcılara tek tek bildirim satırı oluştur (createMany ile hızlı)
    const users = await this.prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return { message: 'Gönderilecek kullanıcı yok.', count: 0 };
    await this.prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title: cleanTitle, content: cleanContent })),
    });
    return { message: `Bildirim ${users.length} kullanıcıya gönderildi.`, count: users.length };
  }
}
