import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'İsim boş bırakılamaz.' })
  name: string;

  /** Honeypot: formdaki gizli alan — insanlar boş bırakır, botlar doldurur. */
  @IsString()
  @IsOptional()
  website?: string;
}
