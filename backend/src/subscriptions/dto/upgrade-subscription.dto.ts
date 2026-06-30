import { IsString, IsIn } from 'class-validator';

export class UpgradeSubscriptionDto {
  @IsString()
  @IsIn(['basic', 'premium', 'pro'], {
    message: 'Plan basic, premium veya pro olmalıdır',
  })
  newPlan: string;
}
