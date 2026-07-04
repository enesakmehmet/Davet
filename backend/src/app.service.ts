import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Düğün Davetiye API Çalışıyor!';
  }

  // Herkese açık, kimlik doğrulama gerektirmeyen agregat sayılar (anasayfa güven istatistikleri için).
  // Hiçbir kişisel veri (isim, e-posta vb.) döndürülmez — sadece toplam sayı.
  async getPublicStats() {
    const [totalInvitations, totalGuests] = await Promise.all([
      this.prisma.invitation.count({ where: { deletedAt: null } }),
      this.prisma.guest.count(),
    ]);
    return { totalInvitations, totalGuests };
  }
}
