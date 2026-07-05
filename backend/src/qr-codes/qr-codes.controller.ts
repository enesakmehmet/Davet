import {
  Controller,
  Get,
  Param,
  Res,
  Request,
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
  async generateQRCode(@Param('invitationId') invitationId: string, @Request() req) {
    const qrCodeDataUrl = await this.qrCodesService.generateQRCode(invitationId, req.user.id);
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
    @Request() req,
    @Res() res: any,
  ) {
    const qrCodeBuffer = await this.qrCodesService.generateQRCodeBuffer(invitationId, req.user.id);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${invitationId}.png"`);
    res.send(qrCodeBuffer);
  }
}
