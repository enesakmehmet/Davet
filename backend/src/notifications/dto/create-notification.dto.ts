import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Başlık en fazla 150 karakter olabilir.' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'İçerik en fazla 1000 karakter olabilir.' })
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  // Bildirim belirli bir davetle ilgiliyse (ör. yeni RSVP) — mobil push'a dokununca o davete gitmek için
  @IsString()
  @IsOptional()
  invitationId?: string;
}
