import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Payment providers are deliberately disabled until a provider-specific checkout
 * and verified webhook implementation are installed. Returning a mock checkout
 * URL or accepting unsigned webhooks would grant paid features without payment.
 */
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private unavailable(): never {
    throw new ServiceUnavailableException(
      'Ödeme altyapısı henüz etkin değil. Abonelik işlemleri doğrulanmış ödeme sağlayıcısı bağlanana kadar kapalıdır.',
    );
  }

  async initiatePayment(_dto: InitiatePaymentDto, _userId: string) {
    return this.unavailable();
  }

  async handleWebhook(_provider: string, _payload: unknown, _ipAddress?: string) {
    return this.unavailable();
  }

  async getUserPayments(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          templateSales: { include: { template: { select: { title: true, thumbnail: true } } } },
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async purchaseTemplate(_userId: string, _templateId: string, _paymentId: string) {
    return this.unavailable();
  }
}
