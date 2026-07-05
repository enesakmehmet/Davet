import { ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Admin paneline GİRİŞ kontrolü (temel kapı).
 * - ADMIN_OPEN=true ise (yalnızca lokal/geliştirme): JWT ve rol kontrolü atlanır,
 *   panel şifresiz çalışır.
 * - Aksi halde geçerli JWT + role in ('admin','moderator') zorunludur.
 * NOT: Bu guard sadece panele GİRİŞİ kontrol eder. "admin" ile "moderator" arasındaki
 * ince yetki farkları (kullanıcı silme, ödeme görme vb. yalnızca admin) endpoint
 * bazında ek olarak RolesGuard + @Roles('admin') ile uygulanır (bkz. admin.controller.ts).
 */
@Injectable()
export class AdminAccessGuard extends AuthGuard('jwt') {
  private get open() {
    // Emniyet: üretimde ADMIN_OPEN yanlışlıkla true kalsa bile şifresiz mod ASLA açılmaz.
    if (process.env.NODE_ENV === 'production') return false;
    return process.env.ADMIN_OPEN === 'true';
  }

  canActivate(context: ExecutionContext) {
    if (this.open) return true; // lokal şifresiz mod
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (this.open) return user || { role: 'admin', id: 'local-admin' };
    if (err || !user) {
      throw err || new ForbiddenException('Bu işlem için admin girişi gerekir.');
    }
    if (user.role !== 'admin' && user.role !== 'moderator') {
      throw new ForbiddenException('Yönetici yetkisi gerekiyor.');
    }
    return user;
  }
}
