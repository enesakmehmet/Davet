import { IsString, IsNotEmpty, IsIn, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsIn(['premium', 'pro'])
  plan: string;

  @IsNumber()
  months: number; // 1 (Aylık) veya 12 (Yıllık)
}
