import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // Public: site butonu buraya link verir. Numara yalnızca backend'de (env) tutulur,
  // ziyaretçinin tarayıcısına/frontend koduna hiç gönderilmez.
  // Not: gerçek bir ziyaretçiyi engellemesin diye limit bilinçli olarak yüksek tutuldu,
  // ama DB'ye sahte kayıt yığan bir script'i engelleyecek kadar da sıkı.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('go')
  async go(
    @Query('path') path: string,
    @Query('sid') sessionId: string,
    @Res() res: Response,
  ) {
    await this.whatsappService.logClick(path, sessionId);
    return res.redirect(302, this.whatsappService.buildRedirectUrl());
  }
}
