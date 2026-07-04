import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ziyaretçinin tarayıcısına HİÇBİR ZAMAN gönderilmez: numara ve mesaj yalnızca
   * backend .env'de tutulur, buradan üretilen link'e sadece 302 redirect ile gidilir.
   */
  buildRedirectUrl(): string {
    const number = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    const message =
      process.env.WHATSAPP_MESSAGE || 'Merhaba, Davetim hakkında yardım almak istiyorum.';
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  // Buton tıklamasını kaydeder (admin panelde "kim ne zaman yazmak istedi" listesi için).
  // Loglama başarısız olsa bile WhatsApp'a yönlendirmeyi ASLA engellemez.
  async logClick(path?: string, sessionId?: string) {
    try {
      await this.prisma.whatsappClick.create({
        data: {
          path: (path || '/').slice(0, 300),
          sessionId: sessionId ? sessionId.slice(0, 100) : null,
        },
      });
    } catch {
      /* sessizce yut */
    }
  }

  async getClicks(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.whatsappClick.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.whatsappClick.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
