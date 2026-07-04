import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Request() req) {
    return this.notificationsService.findAllByUser(req.user.id);
  }

  /** Mobil uygulama Expo push token'ını kaydeder (yeni RSVP'de push atılır) */
  @UseGuards(JwtAuthGuard)
  @Post('push-token')
  savePushToken(@Body() body: { token?: string }, @Request() req) {
    return this.notificationsService.savePushToken(req.user.id, String(body?.token || ''));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
