import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class RecordViewDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  browser?: string;

  @IsString()
  @IsOptional()
  device?: string;

  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  city?: string;

  /** Tarayıcı bu daveti daha önce hiç açmadıysa true — tekil ziyaretçi sayımı için */
  @IsBoolean()
  @IsOptional()
  isNewVisitor?: boolean;
}
