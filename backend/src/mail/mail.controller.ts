import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /** Public iletişim formu — dakikada en fazla 3 istek (spam koruması) */
  @Post('contact')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async contact(@Body() body: { name?: string; email?: string; message?: string }) {
    const name = String(body?.name || '').trim().slice(0, 120);
    const email = String(body?.email || '').trim().slice(0, 200);
    const message = String(body?.message || '').trim().slice(0, 4000);

    if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new BadRequestException('Lütfen ad, geçerli bir e-posta ve mesaj girin.');
    }

    await this.mailService.sendContactMessage(name, email, message);
    return { success: true, message: 'Mesajınız alındı, en kısa sürede dönüş yapacağız.' };
  }
}
