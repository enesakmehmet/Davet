import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';
import { EmailValidatorService } from './email-validator.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyRegistrationDto } from '../dto/verify-registration.dto';
import { ResendRegistrationCodeDto } from '../dto/resend-registration-code.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private emailValidator: EmailValidatorService,
  ) {}

  /**
   * Kayıt: hesabı oluşturur ama GİRİŞ YAPTIRMAZ. E-postaya 6 haneli bir kod gönderilir;
   * kayıt yalnızca `verifyRegistration` ile doğru kod girildiğinde tamamlanır (bkz. aşağısı).
   * Aynı e-posta ile daha önce doğrulanmamış bir kayıt başlatılmışsa (yarım kalmış deneme),
   * bilgiler güncellenip yeni kod gönderilir — "zaten kayıtlı" kilidine düşürülmez.
   */
  async register(registerDto: RegisterDto, platform?: string) {
    // Saçma/ulaşılamaz/geçici e-posta adreslerini reddet (gerçek posta kutusu olup olmadığını kontrol eder)
    await this.emailValidator.assertRegistrable(registerDto.email);

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser && existingUser.emailVerified) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

    const user = existingUser
      ? await this.usersService.update(existingUser.id, {
          name: registerDto.name,
          passwordHash: hashedPassword,
          verifyToken: code,
          verifyTokenExpires: codeExpires,
        })
      : await this.usersService.create({
          email: registerDto.email,
          passwordHash: hashedPassword,
          name: registerDto.name,
          verifyToken: code,
          verifyTokenExpires: codeExpires,
        });

    try {
      await this.mailService.sendVerificationCode(user.email, code);
    } catch (err) {
      // İlk kayıt denemesiyse (yeni oluşturulduysa) ve mail gitmediyse yarım kalmış hesabı bırakma —
      // aksi halde bu e-posta bir daha hiç kayıt olamaz hale gelir.
      if (!existingUser) {
        await this.usersService.delete(user.id);
      }
      throw new BadRequestException('Doğrulama kodu e-postana gönderilemedi. Lütfen tekrar dene.');
    }

    return {
      pendingVerification: true,
      email: user.email,
      message: `${user.email} adresine 6 haneli bir doğrulama kodu gönderdik. Kaydını tamamlamak için kodu gir.`,
    };
  }

  /** Kayıt sırasında gönderilen 6 haneli kodu doğrular ve kaydı tamamlayıp giriş yaptırır. */
  async verifyRegistration(dto: VerifyRegistrationDto, platform?: string) {
    const user = await this.usersService.findByEmailAndVerifyCode(dto.email, dto.code);
    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş kod. Yeni kod isteyebilirsin.');
    }

    const verifiedUser = await this.usersService.update(user.id, {
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpires: null,
    });

    return this.generateTokens(verifiedUser, platform);
  }

  /** Kayıt tamamlanmadan (doğrulama bekleyen) durumdayken kodu tekrar gönderir. */
  async resendRegistrationCode(dto: ResendRegistrationCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Kullanıcı yoksa ya da zaten doğrulanmışsa da aynı genel mesaj dönülür (e-posta sızdırılmaz).
    if (user && !user.emailVerified) {
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
      await this.usersService.update(user.id, { verifyToken: code, verifyTokenExpires: codeExpires });
      try {
        await this.mailService.sendVerificationCode(user.email, code);
      } catch {
        /* gönderilemese de aynı genel mesaj dönülür */
      }
    }
    return { message: 'Bu e-posta bekleyen bir kayıtsa doğrulama kodu tekrar gönderildi.' };
  }

  async login(loginDto: LoginDto, platform?: string) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    return this.generateTokens(user, platform);
  }

  async refresh(refreshDto: RefreshDto, platform?: string) {
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

    return this.generateTokens(user, platform);
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

  private async generateTokens(user: any, platform?: string) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    // Admin panelde takip için: bu isteğin geldiği platform (mobil uygulama "mobile" gönderir, aksi halde web sayılır)
    const normalizedPlatform = String(platform || '').toLowerCase() === 'mobile' ? 'mobile' : 'web';
    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
      lastPlatform: normalizedPlatform,
      lastActiveAt: new Date(),
    });

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
