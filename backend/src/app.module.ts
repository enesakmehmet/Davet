import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { redisConnection } from './config/redis.util';
import { RedisThrottlerStorage } from './config/throttler-redis.storage';
import { GuestPhotosModule } from './guest-photos/guest-photos.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AssetsModule } from './assets/assets.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { GuestsModule } from './guests/guests.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { MailModule } from './mail/mail.module';
import { EditorModule } from './editor/editor.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 30, // IP başına dakikada 30 istek (abuse/spam koruması)
      }],
      // Sayaçlar Redis'te: birden fazla instance/replika olsa da limitler ortak işler
      storage: new RedisThrottlerStorage(),
    }),
    BullModule.forRoot({
      connection: redisConnection(),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TemplatesModule,
    InvitationsModule,
    AssetsModule,
    PaymentsModule,
    SubscriptionsModule,
    GuestsModule,
    AnalyticsModule,
    QrCodesModule,
    NotificationsModule,
    AuditLogsModule,
    MailModule,
    EditorModule,
    MarketplaceModule,
    HealthModule,
    AdminModule,
    SettingsModule,
    GuestPhotosModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Tüm endpoint'lere global rate limit (brute-force / spam koruması)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
