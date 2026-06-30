import { IsUUID } from 'class-validator';

export class PurchaseTemplateDto {
  @IsUUID()
  templateId: string;

  @IsUUID()
  paymentId: string;
}
