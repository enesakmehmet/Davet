import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request, Get, Param, Delete, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as multer from 'multer';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.assetsService.create(file, 'image', req.user.id);
  }

  // Davetiyeye eklenecek MP3 müzik yükleme
  @UseGuards(JwtAuthGuard)
  @Post('upload-audio')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (_req, file, cb) => {
      const ok = /audio\/(mpeg|mp3|wav|ogg|x-wav)/.test(file.mimetype) || /\.(mp3|wav|ogg)$/i.test(file.originalname);
      cb(ok ? null : new BadRequestException('Sadece MP3/WAV/OGG ses dosyaları yüklenebilir.'), ok);
    },
  }))
  uploadAudio(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.assetsService.create(file, 'audio', req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Request() req) {
    return this.assetsService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.assetsService.remove(id, req.user.id);
  }
}
