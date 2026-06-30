import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    const { plan, months } = createSubscriptionDto;

    // Check for existing active subscription
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (existing) {
      throw new BadRequestException(
        'Zaten aktif bir aboneliğiniz var. Süresini uzatabilirsiniz.',
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await this.prisma.subscription.create({
      data: {
        plan,
        status: 'active',
        startDate,
        endDate,
        userId,
      },
    });

    // Send confirmation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.email) {
      await this.mailService.sendSubscriptionConfirmation(
        user.email,
        plan,
        endDate,
      );
    }

    // Audit log
    await this.auditLogsService.logCreate(userId, 'Subscription', subscription.id);

    return subscription;
  }

  async getMySubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { endDate: 'desc' },
    });

    if (sub && sub.endDate < new Date() && sub.status === 'active') {
      // Süresi bitmişse pasife çek
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'expired' },
      });
      sub.status = 'expired';
    }

    return sub;
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new NotFoundException('Aktif bir abonelik bulunamadı');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'canceled' },
    });

    // Audit log
    await this.auditLogsService.logUpdate(userId, 'Subscription', subscription.id);

    return {
      message: 'Aboneliğiniz iptal edildi',
      subscription: updated,
    };
  }

  async upgradeSubscription(userId: string, newPlan: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new NotFoundException('Aktif bir abonelik bulunamadı');
    }

    const planHierarchy = { basic: 1, premium: 2, pro: 3 };
    const currentLevel = planHierarchy[subscription.plan] || 0;
    const newLevel = planHierarchy[newPlan] || 0;

    if (newLevel <= currentLevel) {
      throw new BadRequestException(
        'Sadece daha üst planlara yükseltme yapabilirsiniz',
      );
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { plan: newPlan },
    });

    // Send upgrade email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.email) {
      await this.mailService.sendSubscriptionUpgrade(user.email, newPlan);
    }

    // Audit log
    await this.auditLogsService.logUpdate(userId, 'Subscription', subscription.id);

    return {
      message: 'Aboneliğiniz yükseltildi',
      subscription: updated,
    };
  }

  async renewSubscription(userId: string, months: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['active', 'expired'] } },
      orderBy: { endDate: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Abonelik bulunamadı');
    }

    const now = new Date();
    const currentEndDate =
      subscription.endDate > now ? subscription.endDate : now;
    
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        endDate: newEndDate,
      },
    });

    // Audit log
    await this.auditLogsService.logUpdate(userId, 'Subscription', subscription.id);

    return {
      message: 'Aboneliğiniz yenilendi',
      subscription: updated,
    };
  }

  // Cron job: Her gün saat 00:00'da süresi dolan abonelikleri kontrol et
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    const now = new Date();

    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: { lte: now },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });

      // Send expiration email
      if (subscription.user?.email) {
        await this.mailService.sendSubscriptionExpired(
          subscription.user.email,
          subscription.plan,
        );
      }
    }

    return {
      message: `${expiredSubscriptions.length} adet abonelik süresi doldu`,
    };
  }

  // Helper method for payment webhook
  async activateSubscriptionByPayment(userId: string, plan: string, months: number) {
    return this.create({ plan, months }, userId);
  }
}
