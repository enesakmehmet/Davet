import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { RecordViewDto } from './dto/record-view.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Public endpoint for tracking
  // Şehir/ülke bilgisi tarayıcıdan gelmezse (adblocker geojs'i engellemiş olabilir)
  // ziyaretçinin IP'sinden backend'de tespit edilir.
  @Post('view')
  recordView(@Body() recordViewDto: RecordViewDto, @Request() req) {
    const fwd = String(req.headers?.['x-forwarded-for'] || '');
    const ip = (fwd.split(',')[0] || '').trim() || req.ip || '';
    return this.analyticsService.recordView(recordViewDto, ip);
  }

  // Public: site sayfa görüntüleme kaydı (dahili analytics) — rate limit dışı
  @SkipThrottle()
  @Post('pageview')
  recordPageView(@Body() body: { path?: string; sessionId?: string; referrer?: string }) {
    return this.analyticsService.recordPageView({
      path: body?.path || '/',
      sessionId: body?.sessionId,
      referrer: body?.referrer,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':invitationId')
  getStatsByInvitation(@Param('invitationId') invitationId: string, @Request() req) {
    return this.analyticsService.getStatsByInvitation(invitationId, req.user.id);
  }
}
