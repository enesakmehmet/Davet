import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async create(file: Express.Multer.File, type: string, userId: string) {
    // 1. Storage provider üzerinden dosyayı yükle
    const fileUrl = await this.storageService.uploadFile(file);

    // 2. Veritabanına kaydet
    return this.prisma.asset.create({
      data: {
        url: fileUrl,
        type: type,
        filename: file.originalname,
        size: file.size,
        userId: userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.asset.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Dosya bulunamadı');
    if (asset.userId !== userId) throw new ForbiddenException('Bu dosyayı silemezsiniz');

    // Soft delete
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Storage üzerinden silmek isterseniz:
    // await this.storageService.deleteFile(asset.url);

    return { success: true, message: 'Dosya silindi' };
  }
}
