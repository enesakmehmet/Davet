import { IsOptional, IsBoolean, IsString, IsEmail, MaxLength, IsIn, Matches } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'İsim en fazla 100 karakter olabilir.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  @MaxLength(190)
  email?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  // Editör/davetiye dilleriyle aynı liste (tr/en/de) — bkz. frontend Editor.tsx cfg.lang seçenekleri
  @IsOptional()
  @IsIn(['tr', 'en', 'de'], { message: 'Geçersiz dil seçimi.' })
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(/^[A-Za-z0-9_\/+-]+$/, { message: 'Geçersiz saat dilimi formatı.' })
  timezone?: string;
}
