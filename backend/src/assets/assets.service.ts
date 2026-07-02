import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  /**
   * Görselleri kaydetmeden önce küçültüp WebP'ye çevirir (DB şişmesini ve
   * davet sayfasının yavaş açılmasını önler). sharp kurulu değilse ya da
   * işlem başarısız olursa orijinal dosya aynen kaydedilir.
   */
  private async tryOptimizeImage(file: Express.Multer.File): Promise<{ buffer: Buffer; mime: string; filename: string; size: number }> {
    const original = { buffer: file.buffer, mime: file.mimetype, filename: file.originalname, size: file.size };
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.mimetype)) return original;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      const out: Buffer = await sharp(file.buffer)
        .rotate() // EXIF yönünü düzelt
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      // Optimizasyon kazanç sağlamadıysa orijinali kullan
      if (out.length >= file.buffer.length) return original;
      const filename = file.originalname.replace(/\.[^.]+$/, '') + '.webp';
      return { buffer: out, mime: 'image/webp', filename, size: out.length };
    } catch {
      return original;
    }
  }

  async create(file: Express.Multer.File, type: string, userId: string) {
    const processed = await this.tryOptimizeImage(file);

    // Dosya içeriğini DB'de sakla (Railway disk'i kalıcı olmadığı için).
    const asset = await this.prisma.asset.create({
      data: {
        url: '',
        type,
        filename: processed.filename,
        size: processed.size,
        mime: processed.mime,
        data: processed.buffer,
        userId,
      },
    });
    const base = (process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).trim();
    // Global prefix 'api' ile birlikte gerçek route /api/assets/file/:id'dir.
    const url = `${base.replace(/\/+$/, '')}/api/assets/file/${asset.id}`;
    await this.prisma.asset.update({ where: { id: asset.id }, data: { url } });
    return { id: asset.id, url, type, filename: processed.filename, size: processed.size };
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
