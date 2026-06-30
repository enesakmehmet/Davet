import { Module } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // Exported NotificationsService'e erişmek için
  controllers: [GuestsController],
  providers: [GuestsService],
})
export class GuestsModule {}
