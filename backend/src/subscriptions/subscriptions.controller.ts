import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Gerçekte bu işlem Payments Webhook'u tarafından yapılır
  // Test/Mock amaçlı manuel abonelik başlatma ucu
  @Post()
  async create() {
    throw new ForbiddenException('Abonelik başlatma yalnızca doğrulanmış ödeme sonrasında yapılabilir.');
  }

  @Get('me')
  async getMySubscription(@GetUser('id') userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Delete('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@GetUser('id') userId: string) {
    return this.subscriptionsService.cancelSubscription(userId);
  }

  @Patch('upgrade')
  async upgradeSubscription() {
    throw new ForbiddenException('Paket değişikliği yalnızca doğrulanmış ödeme sonrasında yapılabilir.');
  }

  @Patch('renew')
  async renewSubscription() {
    throw new ForbiddenException('Abonelik yenileme yalnızca doğrulanmış ödeme sonrasında yapılabilir.');
  }
}
