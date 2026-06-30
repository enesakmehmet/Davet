import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SubscriptionsModule, MarketplaceModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
