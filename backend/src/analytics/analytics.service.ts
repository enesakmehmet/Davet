import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordViewDto } from './dto/record-view.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async recordView(recordViewDto: RecordViewDto) {
    const { invitationId, country, browser, device, operatingSystem, referrer, city } = recordViewDto;

    // Ayrıntılı logları kaydet
    await this.prisma.analyticsEvent.create({
      data: {
        invitationId,
        country,
        city,
        browser,
        device,
        operatingSystem,
        referrer,
      }
    });

    // Ana istatistiği güncelle
    let analytics = await this.prisma.analytics.findFirst({
      where: { invitationId },
    });

    if (!analytics) {
      await this.prisma.analytics.create({
        data: {
          invitationId,
          views: 1,
          visitors: 1,
          countries: country ? { [country]: 1 } : {},
          cities: city ? { [city]: 1 } : {},
          devices: device ? { [device]: 1 } : {},
        },
      });
      return { success: true };
    }

    const updatedCountries = { ...(analytics.countries as Record<string, number> || {}) };
    if (country) updatedCountries[country] = (updatedCountries[country] || 0) + 1;

    const updatedCities = { ...(analytics.cities as Record<string, number> || {}) };
    if (city) updatedCities[city] = (updatedCities[city] || 0) + 1;

    const updatedDevices = { ...(analytics.devices as Record<string, number> || {}) };
    if (device) updatedDevices[device] = (updatedDevices[device] || 0) + 1;

    await this.prisma.analytics.update({
      where: { id: analytics.id },
      data: {
        views: analytics.views + 1,
        visitors: analytics.visitors + 1,
        countries: updatedCountries,
        cities: updatedCities,
        devices: updatedDevices,
      },
    });

    return { success: true };
  }

  // Site geneli sayfa görüntüleme kaydı (dahili analytics)
  async recordPageView(data: { path: string; sessionId?: string; referrer?: string }) {
    if (!data.path) return { success: false };
    await this.prisma.pageView.create({
      data: {
        path: data.path.slice(0, 300),
        sessionId: data.sessionId?.slice(0, 100),
        referrer: data.referrer?.slice(0, 300),
      },
    });
    return { success: true };
  }

  // Admin için sayfa görüntüleme özeti
  async getPageViewStats() {
    const total = await this.prisma.pageView.count();
    const sessions = await this.prisma.pageView.findMany({ select: { sessionId: true }, distinct: ['sessionId'] });
    const uniqueVisitors = sessions.filter((s) => s.sessionId).length;

    const grouped = await this.prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 30,
    });
    const byPath = grouped.map((g) => ({ path: g.path, views: g._count.path }));

    // Son 14 gün günlük dağılım
    const since = new Date(Date.now() - 14 * 86400000);
    const recent = await this.prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const daily: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      daily[d] = 0;
    }
    recent.forEach((r) => {
      const d = r.createdAt.toISOString().slice(0, 10);
      if (daily[d] !== undefined) daily[d]++;
    });

    return { total, uniqueVisitors, byPath, daily };
  }

  async getStatsByInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
      include: { 
        analytics: true,
        analyticsEvents: {
          orderBy: { viewedAt: 'desc' },
          take: 50
        }
      }
    });

    if (!invitation || invitation.userId !== userId) {
      throw new NotFoundException('Davetiye bulunamadı veya yetkiniz yok.');
    }

    return {
      summary: invitation.analytics[0] || { views: 0, visitors: 0, countries: {} },
      events: invitation.analyticsEvents || []
    };
  }
}
