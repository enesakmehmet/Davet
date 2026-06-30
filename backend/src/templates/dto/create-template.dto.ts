import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsObject()
  @IsNotEmpty()
  elements: Record<string, any>;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}
