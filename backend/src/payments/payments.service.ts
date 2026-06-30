import { Injectable, BadRequestException } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { MailService } from '../mail/mail.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { randomUUID } from 'crypto';
import { generateHash, verifyHash } from '../common/utils/hash.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly marketplaceService: MarketplaceService,
    private readonly mailService: MailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
    userId: string,
  ) {
    const { amount, provider } = initiatePaymentDto;

    // 1. Veritabanına "pending" statüsünde ödeme kaydı oluştur
    const payment = await this.prisma.payment.create({
      data: {
        amount,
        provider,
        status: 'pending',
        userId: userId,
        transactionId: `TX-${randomUUID()}`,
      },
    });

    // 2. Mock: PayTR / İyzico API'sine istek
    // Gerçek entegrasyonda buraya PayTR/İyzico SDK çağrıları gelecek
    const mockCheckoutUrl = this.generateMockCheckoutUrl(
      provider,
      payment.transactionId || '',
    );

    // Audit log
    await this.auditLogsService.logCreate(userId, 'Payment', payment.id);

    return {
      paymentId: payment.id,
      checkoutUrl: mockCheckoutUrl,
      status: payment.status,
      transactionId: payment.transactionId,
    };
  }

  async handleWebhook(provider: string, payload: any, ipAddress?: string) {
    // Webhook imza doğrulaması
    const isValid = this.verifyWebhookSignature(provider, payload);
    if (!isValid) {
      throw new BadRequestException('Geçersiz webhook imzası');
    }

    const transactionId = payload.transactionId || payload.merchant_oid;

    if (!transactionId) {
      throw new BadRequestException('Transaction ID bulunamadı');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
      include: { user: true },
    });

    if (!payment) {
      throw new BadRequestException('Ödeme bulunamadı');
    }

    // Ödeme durumunu güncelle
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: payload.status === 'success' ? 'completed' : 'failed',
      },
    });

    // Başarılı ödeme işlemleri
    if (updatedPayment.status === 'completed') {
      await this.processSuccessfulPayment(payment, ipAddress);
    }

    // Audit log
    await this.auditLogsService.logAction(
      payment.userId,
      'PAYMENT_WEBHOOK',
      'Payment',
      payment.id,
      ipAddress,
    );

    return { success: true, status: updatedPayment.status };
  }

  async getUserPayments(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          templateSales: {
            include: {
              template: {
                select: {
                  title: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
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

  async purchaseTemplate(
    userId: string,
    templateId: string,
    paymentId: string,
  ) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new BadRequestException('Şablon bulunamadı');
    }

    // Template satın alma kaydı
    await this.marketplaceService.recordSale(templateId, paymentId, template.price);

    // Kullanıcıya bildirim gönder
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.email) {
      await this.mailService.sendTemplatePurchaseNotification(
        user.email,
        template.title,
      );
    }

    return {
      message: 'Şablon başarıyla satın alındı',
      template: {
        id: template.id,
        title: template.title,
      },
    };
  }

  private async processSuccessfulPayment(payment: any, ipAddress?: string) {
    // Ödeme türüne göre işlemler
    // Subscription için otomatik abonelik oluşturma
    // Template satın alma için kayıt oluşturma vb.

    // Mail bildirimi
    if (payment.user?.email) {
      await this.mailService.sendPaymentConfirmation(
        payment.user.email,
        payment.amount,
        payment.transactionId,
      );
    }

    // Audit log
    await this.auditLogsService.logAction(
      payment.userId,
      'PAYMENT_SUCCESS',
      'Payment',
      payment.id,
      ipAddress,
    );
  }

  private generateMockCheckoutUrl(
    provider: string,
    transactionId: string,
  ): string {
    return `https://mock-${provider}-checkout.com/pay/${transactionId}`;
  }

  private verifyWebhookSignature(provider: string, payload: any): boolean {
    // Mock doğrulama
    // Gerçek entegrasyonda:
    // PayTR için: hash = base64_encode(hmac('sha256', merchant_id + merchant_oid + status + total_amount, merchant_key))
    // İyzico için: kendi hash algoritması

    const secret =
      provider === 'paytr'
        ? process.env.PAYTR_MERCHANT_KEY
        : process.env.IYZICO_SECRET_KEY;

    if (!secret) {
      // Test modunda signature kontrolü atla
      return true;
    }

    // Buraya gerçek signature doğrulama kodu gelecek
    return true;
  }
}
