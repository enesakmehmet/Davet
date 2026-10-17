import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordViewDto } from './dto/record-view.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * IP'den şehir/ülke tespiti (best-effort, 1.5 sn zaman aşımı).
   * Tarayıcı tarafındaki geo isteği adblocker'a takıldığında devreye girer;
   * başarısız olursa istatistik konum olmadan kaydedilir, akışı asla bozmaz.
   */
  async recordView(recordViewDto: RecordViewDto) {
    let { invitationId, country, browser, device, operatingSystem, referrer, city } = recordViewDto;

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

    // Tekil ziyaretçi: yalnızca tarayıcı "ilk kez açıyorum" dediğinde artar.
    // (Eski istemciler alanı göndermez → geriye uyumluluk için onlar da sayılır.)
    const countAsVisitor = recordViewDto.isNewVisitor !== false;

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
        visitors: analytics.visitors + (countAsVisitor ? 1 : 0),
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
    const [totals] = await this.prisma.$queryRaw<{ total: bigint; uniqueVisitors: bigint }[]>`
      SELECT COUNT(*) AS total,
             COUNT(DISTINCT NULLIF("sessionId", '')) AS "uniqueVisitors"
      FROM "PageView"
    `;
    const total = Number(totals.total);
    const uniqueVisitors = Number(totals.uniqueVisitors);

    const grouped = await this.prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 30,
    });
    const byPath = grouped.map((g) => ({ path: g.path, views: g._count.path }));

    // Son 14 gün günlük dağılım
    const since = new Date(Date.now() - 14 * 86400000);
    const recent = await this.prisma.$queryRaw<{ date: string; views: bigint }[]>`
      SELECT to_char("createdAt", 'YYYY-MM-DD') AS date, COUNT(*) AS views
      FROM "PageView" WHERE "createdAt" >= ${since}
      GROUP BY 1
    `;
    const daily: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      daily[d] = 0;
    }
    recent.forEach((r) => {
      if (daily[r.date] !== undefined) daily[r.date] = Number(r.views);
    });

    return { total, uniqueVisitors, byPath, daily };
  }

  async getStatsByInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
      select: {
        userId: true,
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

    // Son 14 günün günlük görüntülenme serisi (çizgi grafik için)
    const since = new Date();
    // SQL groups timestamps by their stored UTC calendar date.
    since.setUTCDate(since.getUTCDate() - 13);
    since.setUTCHours(0, 0, 0, 0);
    const recentEvents = await this.prisma.$queryRaw<{ date: string; views: bigint }[]>`
      SELECT to_char("viewedAt", 'YYYY-MM-DD') AS date, COUNT(*) AS views
      FROM "AnalyticsEvent"
      WHERE "invitationId" = ${invitationId} AND "viewedAt" >= ${since}
      GROUP BY 1
    `;
    const daily: { date: string; views: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      daily.push({ date: d.toISOString().slice(0, 10), views: 0 });
    }
    const byDate = new Map(daily.map((row) => [row.date, row]));
    recentEvents.forEach((e) => {
      const row = byDate.get(e.date);
      if (row) row.views = Number(e.views);
    });

    return {
      summary: invitation.analytics[0] || { views: 0, visitors: 0, countries: {} },
      events: invitation.analyticsEvents || [],
      daily,
    };
  }
}
