import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [AnalyticsModule, WhatsappModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
