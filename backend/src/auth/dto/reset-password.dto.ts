import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Kod 6 haneli olmalıdır.' })
  code: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  newPassword: string;
}
