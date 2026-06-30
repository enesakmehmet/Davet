import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { RecordViewDto } from './dto/record-view.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Public endpoint for tracking
  @Post('view')
  recordView(@Body() recordViewDto: RecordViewDto) {
    return this.analyticsService.recordView(recordViewDto);
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
