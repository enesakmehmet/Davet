import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getJwtSecret } from '../config/secret.util';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      // Kısa ömürlü access token: çalınsa bile 1 saat içinde geçersizleşir.
      // Oturum sürekliliği refresh token (30 gün) + frontend'deki otomatik yenileme ile sağlanır.
      // Not: jsonwebtoken tip tanımı env string'ini kabul etmediği için cast gerekli
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
