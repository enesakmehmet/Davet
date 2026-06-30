import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Get(':invitationId')
  @UseGuards(JwtAuthGuard)
  async generateQRCode(@Param('invitationId') invitationId: string) {
    const qrCodeDataUrl = await this.qrCodesService.generateQRCode(invitationId);
    return {
      statusCode: HttpStatus.OK,
      message: 'QR kod başarıyla oluşturuldu',
      data: {
        qrCode: qrCodeDataUrl,
      },
    };
  }

  @Get(':invitationId/download')
  @UseGuards(JwtAuthGuard)
  async downloadQRCode(
    @Param('invitationId') invitationId: string,
    @Res() res: any,
  ) {
    const qrCodeBuffer = await this.qrCodesService.generateQRCodeBuffer(invitationId);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${invitationId}.png"`);
    res.send(qrCodeBuffer);
  }
}
