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
    // Dosya içeriğini DB'de sakla (Railway disk'i kalıcı olmadığı için).
    const asset = await this.prisma.asset.create({
      data: {
        url: '',
        type,
        filename: file.originalname,
        size: file.size,
        mime: file.mimetype,
        data: file.buffer,
        userId,
      },
    });
    const base = (process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).trim();
    // Global prefix 'api' ile birlikte gerçek route /api/assets/file/:id'dir.
    const url = `${base.replace(/\/+$/, '')}/api/assets/file/${asset.id}`;
    await this.prisma.asset.update({ where: { id: asset.id }, data: { url } });
    return { id: asset.id, url, type, filename: file.originalname, size: file.size };
  }

  // Public: dosya içeriğini DB'den getir (davet görüntüleyici çalabilsin)
  async getFile(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      select: { data: true, mime: true, filename: true },
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
