import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, IsObject, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
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
  @MinLength(3, { message: 'Bağlantı en az 3 karakter olmalı.' })
  @MaxLength(60, { message: 'Bağlantı en fazla 60 karakter olabilir.' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Bağlantı yalnızca küçük harf, rakam ve tire (-) içerebilir; tire ile başlayıp bitemez.',
  })
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

  @IsBoolean()
  @IsOptional()
  isPasswordProtected?: boolean;

  @IsString()
  @IsOptional()
  password?: string;
}
