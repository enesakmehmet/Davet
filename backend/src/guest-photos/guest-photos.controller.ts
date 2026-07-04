import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Res,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { GuestPhotosService } from './guest-photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guest-photos')
export class GuestPhotosController {
  constructor(private readonly guestPhotosService: GuestPhotosService) {}

  /** Public: misafir fotoğraf yükler — IP başına dakikada 6 yükleme */
  @Post()
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('invitationId') invitationId: string,
    @Body('guestName') guestName?: string,
  ) {
    return this.guestPhotosService.upload(String(invitationId || ''), file, guestName);
  }

  /** Public: davetin albüm listesi */
  @Get('invitation/:invitationId')
  list(@Param('invitationId') invitationId: string) {
    return this.guestPhotosService.listByInvitation(invitationId);
  }

  /** Public: fotoğraf içeriği */
  @Get('file/:id')
  async file(@Param('id') id: string, @Res() res: any) {
    const photo = await this.guestPhotosService.getFile(id);
    res.setHeader('Content-Type', photo.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(photo.data);
  }

  /** Davet sahibi: fotoğraf sil */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.guestPhotosService.remove(id, req.user.id);
  }
}
