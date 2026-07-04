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
  private async geoFromIp(ip: string): Promise<{ city?: string; country?: string }> {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) return {};
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return {};
      const g: any = await res.json().catch(() => ({}));
      return { city: g?.city || undefined, country: g?.country_code || g?.country || undefined };
    } catch {
      return {};
    }
  }

  async recordView(recordViewDto: RecordViewDto, ip?: string) {
    let { invitationId, country, browser, device, operatingSystem, referrer, city } = recordViewDto;

    // Konum tarayıcıdan gelmediyse IP'den doldur
    if (!city && ip) {
      const geo = await this.geoFromIp(ip);
      city = city || geo.city;
      country = country || geo.country;
    }

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

    // Son 14 günün günlük görüntülenme serisi (çizgi grafik için)
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const recentEvents = await this.prisma.analyticsEvent.findMany({
      where: { invitationId, viewedAt: { gte: since } },
      select: { viewedAt: true },
    });
    const daily: { date: string; views: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      daily.push({ date: d.toISOString().slice(0, 10), views: 0 });
    }
    const byDate = new Map(daily.map((row) => [row.date, row]));
    recentEvents.forEach((e) => {
      const row = byDate.get(e.viewedAt.toISOString().slice(0, 10));
      if (row) row.views++;
    });

    return {
      summary: invitation.analytics[0] || { views: 0, visitors: 0, countries: {} },
      events: invitation.analyticsEvents || [],
      daily,
    };
  }
}
