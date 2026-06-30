import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Ip,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PurchaseTemplateDto } from './dto/purchase-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiatePayment(
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.initiatePayment(initiatePaymentDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.paymentsService.getUserPayments(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase-template')
  async purchaseTemplate(
    @GetUser('id') userId: string,
    @Body() purchaseTemplateDto: PurchaseTemplateDto,
  ) {
    return this.paymentsService.purchaseTemplate(
      userId,
      purchaseTemplateDto.templateId,
      purchaseTemplateDto.paymentId,
    );
  }

  // Webhook için public endpoint (Sağlayıcı tarafından tetiklenecek)
  @Post('webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Ip() ipAddress: string,
  ) {
    return this.paymentsService.handleWebhook(provider, payload, ipAddress);
  }
}
