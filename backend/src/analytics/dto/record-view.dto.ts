import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
