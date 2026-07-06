import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * Admin panelinden gönderilen bildirimler için doğrulama.
 * userId boş bırakılırsa tüm kullanıcılara toplu gönderim yapılır (bkz. admin.service.ts sendNotification).
 */
export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Başlık en fazla 150 karakter olabilir.' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'İçerik en fazla 1000 karakter olabilir.' })
  content: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
