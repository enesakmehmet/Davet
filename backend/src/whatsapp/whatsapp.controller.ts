import { Controller, Get, Query, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // Public: site butonu buraya link verir. Numara yalnızca backend'de (env) tutulur,
  // ziyaretçinin tarayıcısına/frontend koduna hiç gönderilmez.
  @SkipThrottle()
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
