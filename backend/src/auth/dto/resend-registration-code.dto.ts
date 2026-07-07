import { IsEmail } from 'class-validator';

export class ResendRegistrationCodeDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;
}
