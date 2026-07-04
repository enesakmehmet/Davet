import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Public: anasayfadaki güven istatistikleri için (kimlik doğrulama yok, sadece agregat sayı)
  @SkipThrottle()
  @Get('stats/public')
  getPublicStats() {
    return this.appService.getPublicStats();
  }
}
