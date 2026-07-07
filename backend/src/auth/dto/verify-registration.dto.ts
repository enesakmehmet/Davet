import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyRegistrationDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Kod 6 haneli olmalıdır.' })
  code: string;
}
