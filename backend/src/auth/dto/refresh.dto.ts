import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'refresh-token-string', description: 'Kullanıcının refresh token değeri' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token boş olamaz.' })
  refreshToken: string;
}
