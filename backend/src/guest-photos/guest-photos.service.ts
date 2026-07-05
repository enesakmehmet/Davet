import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_PHOTOS_PER_INVITATION = Number(process.env.GUEST_ALBUM_LIMIT || 60);

@Injectable()
export class GuestPhotosService {
  constructor(private prisma: PrismaService) {}

  private publicUrl(id: string) {
    const base = (process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).trim();
    return `${base.replace(/\/+$/, '')}/api/guest-photos/file/${id}`;
  }

  /** Görseli küçültüp WebP'ye çevirir; sharp yoksa orijinali kullanır */
  private async optimize(file: Express.Multer.File): Promise<{ buffer: Buffer; mime: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      const out: Buffer = await sharp(file.buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      if (out.length < file.buffer.length) return { buffer: out, mime: 'image/webp' };
    } catch { /* sharp yok/başarısız → orijinal */ }
    return { buffer: file.buffer, mime: file.mimetype };
  }

  /** Public: misafir fotoğraf yükler */
  async upload(invitationId: string, file: Express.Multer.File, guestName?: string) {
    if (!file || !/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.mimetype)) {
      throw new BadRequestException('Yalnızca fotoğraf yükleyebilirsiniz (JPG/PNG/WebP).');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Fotoğraf en fazla 10 MB olabilir.');
    }

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
      select: { id: true },
    });
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı.');

    const count = await this.prisma.guestPhoto.count({ where: { invitationId } });
    if (count >= MAX_PHOTOS_PER_INVITATION) {
      throw new ForbiddenException('Albüm dolu — bu davet için fotoğraf limiti doldu.');
    }

    const processed = await this.optimize(file);
    const photo = await this.prisma.guestPhoto.create({
      data: {
        invitationId,
        guestName: (guestName || '').trim().slice(0, 80) || null,
        mime: processed.mime,
        size: processed.buffer.length,
        data: processed.buffer,
      },
      select: { id: true, guestName: true, createdAt: true },
    });

    return { ...photo, url: this.publicUrl(photo.id) };
  }

  /** Public: davetin albümü (fotoğraf içeriği hariç, sadece meta + url) */
  async listByInvitation(invitationId: string) {
    // Davet silinmişse (çöp kutusunda) albümü artık kimseye göstermiyoruz.
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
      select: { id: true },
    });
    if (!invitation) return [];

    const photos = await this.prisma.guestPhoto.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, guestName: true, createdAt: true },
    });
    return photos.map((p) => ({ ...p, url: this.publicUrl(p.id) }));
  }

  /** Public: fotoğraf içeriği — bağlı davet silinmişse artık servis edilmez. */
  async getFile(id: string) {
    const photo = await this.prisma.guestPhoto.findFirst({
      where: { id, invitation: { deletedAt: null } },
      select: { data: true, mime: true },
    });
    if (!photo) throw new NotFoundException('Fotoğraf bulunamadı.');
    return photo;
  }

  /** Davet sahibi: uygunsuz fotoğrafı siler */
  async remove(id: string, userId: string) {
    const photo = await this.prisma.guestPhoto.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } },
    });
    if (!photo) throw new NotFoundException('Fotoğraf bulunamadı.');
    if (photo.invitation.userId !== userId) throw new ForbiddenException('Bu fotoğrafı silme yetkiniz yok.');
    await this.prisma.guestPhoto.delete({ where: { id } });
    return { success: true };
  }
}
