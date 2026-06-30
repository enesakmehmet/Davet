import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Kullanıcı girişi yapar ve tokenları döner' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refresh token kullanarak yeni access token döner' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
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
    };
  }
}
