import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { getJwtSecret } from '../../config/secret.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    // Refresh token'lar aynı anahtarla imzalanıyor; tür kontrolü olmadan 30 günlük bir refresh
    // token doğrudan "Bearer" access token olarak kullanılabiliyordu — 15 dakikalık access
    // süresi ve çıkış (logout) etkisiz kalıyordu. Refresh token yalnızca /auth/refresh içindir.
    if (payload?.tokenType === 'refresh') {
      throw new UnauthorizedException('Geçersiz erişim anahtarı.');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }
    // Admin panelindeki "Askıya al" eskiden hiçbir şeyi engellemiyordu; askıya alınan hesap
    // mevcut oturumuyla her şeyi kullanmaya devam ediyordu.
    if ((user as any).status === 'suspended') {
      throw new UnauthorizedException('Hesabın askıya alınmış. Destek için bizimle iletişime geç.');
    }
    // Hassas alanları req.user'a koyma (passwordHash, refreshToken sızmasın)
    const { passwordHash, refreshToken, ...safeUser } = user as any;
    return safeUser;
  }
}
