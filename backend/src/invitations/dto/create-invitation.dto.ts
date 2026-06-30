import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvitationPageDto {
  @IsNumber()
  pageNumber: number;

  @IsObject()
  elements: Record<string, any>;
}

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  // Yeni form tabanlı editörün davet ayarları (tema, çift, mekan, müzik, galeri, aile, hikaye, RSVP)
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvitationPageDto)
  @IsOptional()
  pages?: CreateInvitationPageDto[];
}
