import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // IP başına dakikada 5 kayıt denemesi
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('x-client-platform') platform?: string,
  ) {
    // Honeypot: gizli "website" alanını yalnızca botlar doldurur
    if (registerDto.website) {
      throw new BadRequestException('Geçersiz istek.');
    }
    const { website, ...dto } = registerDto as any;
    return this.authService.register(dto, platform);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // brute-force koruması
  @ApiOperation({ summary: 'Kullanıcı girişi yapar ve tokenları döner' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-client-platform') platform?: string,
  ) {
    return this.authService.login(loginDto, platform);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // otomatik yenileme dahil, kötüye kullanım limiti
  @ApiOperation({ summary: 'Refresh token kullanarak yeni access token döner' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshDto,
    @Headers('x-client-platform') platform?: string,
  ) {
    return this.authService.refresh(refreshDto, platform);
  }

  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Şifre sıfırlama kodu e-posta ile gönderir' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'E-posta ile gönderilen kodla şifreyi sıfırlar' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'E-posta adresini doğrulama tokenıyla onaylar' })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Doğrulama e-postasını tekrar gönderir' })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Request() req) {
    return this.authService.resendVerification(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kullanıcıyı sistemden çıkarır (Logout)' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Giriş yapan kullanıcının profil bilgilerini döner' })
  @Get('me')
  getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      emailVerified: !!req.user.emailVerified,
    };
  }
}
