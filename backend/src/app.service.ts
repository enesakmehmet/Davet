import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private statsCache?: { value: { totalInvitations: number; totalGuests: number }; expiresAt: number };
  private statsRequest?: Promise<{ totalInvitations: number; totalGuests: number }>;
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Düğün Davetiye API Çalışıyor!';
  }

  // Herkese açık, kimlik doğrulama gerektirmeyen agregat sayılar (anasayfa güven istatistikleri için).
  // Hiçbir kişisel veri (isim, e-posta vb.) döndürülmez — sadece toplam sayı.
  async getPublicStats() {
    if (this.statsCache && this.statsCache.expiresAt > Date.now()) return this.statsCache.value;
    if (this.statsRequest) return this.statsRequest;
    this.statsRequest = this.loadPublicStats();
    try {
      return await this.statsRequest;
    } finally {
      this.statsRequest = undefined;
    }
  }

  private async loadPublicStats() {
    const [totalInvitations, totalGuests] = await Promise.all([
      this.prisma.invitation.count({ where: { deletedAt: null } }),
      this.prisma.guest.count(),
    ]);
    const value = { totalInvitations, totalGuests };
    this.statsCache = { value, expiresAt: Date.now() + 60_000 };
    return value;
  }
}
