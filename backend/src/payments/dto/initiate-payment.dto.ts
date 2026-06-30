import { IsNumber, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class InitiatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsIn(['paytr', 'iyzico'])
  provider: string;

  // Hangi plan veya ürün alındığını belirlemek için (Örn: 'premium_1_month', 'template_123')
  @IsString()
  @IsNotEmpty()
  productId: string;
}
