import { Module } from '@nestjs/common';
import { GuestPhotosController } from './guest-photos.controller';
import { GuestPhotosService } from './guest-photos.service';

@Module({
  controllers: [GuestPhotosController],
  providers: [GuestPhotosService],
})
export class GuestPhotosModule {}
