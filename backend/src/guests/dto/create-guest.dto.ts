import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsIn(['attending', 'not_attending', 'maybe', 'pending'])
  status: string;

  @IsNumber()
  @IsOptional()
  companionCount?: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  mealPreference?: string; // farketmez | et | tavuk | balik | vejetaryen

  @IsString()
  @IsOptional()
  allergyNote?: string;
}
