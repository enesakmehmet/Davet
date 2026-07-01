import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const verifyToken = randomBytes(32).toString('hex');
    const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      name: registerDto.name,
      verifyToken,
      verifyTokenExpires,
    });

    // Doğrulama e-postası gönder (hata giriş akışını engellemesin)
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      await this.mailService.sendVerificationEmail(
        user.email,
        `${frontendUrl}/verify-email?token=${verifyToken}`,
      );
    } catch {
      /* e-posta gönderilemese de kayıt tamamlanmış olsun */
    }

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshDto: RefreshDto) {
    const payload = this.jwtService.decode(refreshDto.refreshToken) as any;
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Geçersiz refresh token.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Giriş yapılmamış veya token geçersiz.');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshDto.refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Geçersiz refresh token.');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshToken: null });
    return { success: true, message: 'Başarıyla çıkış yapıldı.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Kullanıcı bulunamasa da aynı mesajı dön: hangi e-postaların kayıtlı olduğu sızdırılmasın
    if (user) {
      // 6 haneli, tahmin edilmesi zor bir kod (crypto.randomInt — Math.random değil)
      const resetToken = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika
      await this.usersService.update(user.id, { resetToken, resetTokenExpires });

      try {
        await this.mailService.sendForgotPassword(user.email, resetToken);
      } catch {
        /* mail gönderilemese de kullanıcıya aynı genel mesaj dönülür */
      }
    }

    return { message: 'Bu e-posta kayıtlıysa şifre sıfırlama kodu gönderildi.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmailAndResetCode(dto.email, dto.code);
    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş kod. Yeniden talep edin.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(user.id, {
      passwordHash: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null, // güvenlik: mevcut oturumları geçersiz kıl
    });

    return { message: 'Şifreniz başarıyla değiştirildi. Şimdi giriş yapabilirsiniz.' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByVerifyToken(dto.token);
    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş doğrulama bağlantısı.');
    }

    await this.usersService.update(user.id, {
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpires: null,
    });

    return { message: 'E-posta adresiniz doğrulandı.' };
  }

  async resendVerification(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');
    if (user.emailVerified) {
      return { message: 'E-posta adresiniz zaten doğrulanmış.' };
    }

    const verifyToken = randomBytes(32).toString('hex');
    const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.usersService.update(user.id, { verifyToken, verifyTokenExpires });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    await this.mailService.sendVerificationEmail(
      user.email,
      `${frontendUrl}/verify-email?token=${verifyToken}`,
    );

    return { message: 'Doğrulama e-postası tekrar gönderildi.' };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: !!user.emailVerified,
      }
    };
  }
}
