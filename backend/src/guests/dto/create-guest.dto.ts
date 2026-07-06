import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, IsEmail, MaxLength, Min, Max, Matches } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'İsim en fazla 100 karakter olabilir.' })
  name: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+\d][\d\s()-]{4,19}$/, { message: 'Geçerli bir telefon numarası girin.' })
  phone?: string;

  @IsString()
  @IsIn(['attending', 'not_attending', 'maybe', 'pending'])
  status: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  companionCount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mesaj en fazla 500 karakter olabilir.' })
  message?: string;

  // Not: değerler kullanıcının diline göre değişir (ör. "Vejetaryen" / "Vegetarian" / "Vegetarisch"),
  // bu yüzden sabit bir IsIn listesi yerine sadece uzunluk sınırı uyguluyoruz.
  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Yemek tercihi en fazla 30 karakter olabilir.' })
  mealPreference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'Alerji notu en fazla 300 karakter olabilir.' })
  allergyNote?: string;
}
