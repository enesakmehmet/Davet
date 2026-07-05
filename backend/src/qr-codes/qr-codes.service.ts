import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Davetiyenin var olduğunu VE isteği yapan kullanıcıya ait olduğunu doğrular (IDOR koruması). */
  private async getOwnedInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, deletedAt: null },
      select: { slug: true, userId: true },
    });

    if (!invitation) {
      throw new NotFoundException('Davetiye bulunamadı');
    }
    if (invitation.userId !== userId) {
      throw new ForbiddenException('Bu davetiyenin QR kodunu oluşturma yetkiniz yok.');
    }

    return invitation;
  }

  async generateQRCode(invitationId: string, userId: string): Promise<string> {
    const invitation = await this.getOwnedInvitation(invitationId, userId);

    // QR kod için URL oluştur
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${baseUrl}/davet/${invitation.slug}`;

    // QR kod oluştur (Data URL olarak)
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('QR kod oluşturulamadı');
    }
  }

  async generateQRCodeBuffer(invitationId: string, userId: string): Promise<Buffer> {
    const invitation = await this.getOwnedInvitation(invitationId, userId);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${baseUrl}/davet/${invitation.slug}`;

    try {
      const qrCodeBuffer = await QRCode.toBuffer(invitationUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 400,
        margin: 2,
      });

      return qrCodeBuffer;
    } catch (error) {
      throw new Error('QR kod oluşturulamadı');
    }
  }
}
