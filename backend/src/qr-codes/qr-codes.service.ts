import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQRCode(invitationId: string): Promise<string> {
    // Davetiyenin var olup olmadığını kontrol et
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { slug: true },
    });

    if (!invitation) {
      throw new NotFoundException('Davetiye bulunamadı');
    }

    // QR kod için URL oluştur
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${baseUrl}/invitation/${invitation.slug}`;

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

  async generateQRCodeBuffer(invitationId: string): Promise<Buffer> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { slug: true },
    });

    if (!invitation) {
      throw new NotFoundException('Davetiye bulunamadı');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${baseUrl}/invitation/${invitation.slug}`;

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
