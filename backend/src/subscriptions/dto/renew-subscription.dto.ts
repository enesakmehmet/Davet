import { IsNumber, Min, Max } from 'class-validator';

export class RenewSubscriptionDto {
  @IsNumber()
  @Min(1, { message: 'En az 1 ay olmalıdır' })
  @Max(12, { message: 'En fazla 12 ay olabilir' })
  months: number;
}
