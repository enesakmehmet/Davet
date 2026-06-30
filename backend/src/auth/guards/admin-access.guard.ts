import { ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Admin uçları için erişim kontrolü.
 * - ADMIN_OPEN=true ise (yalnızca lokal/geliştirme): JWT ve rol kontrolü atlanır,
 *   panel şifresiz çalışır.
 * - Aksi halde geçerli JWT + role === 'admin' zorunludur.
 */
@Injectable()
export class AdminAccessGuard extends AuthGuard('jwt') {
  private get open() {
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
    if (user.role !== 'admin') {
      throw new ForbiddenException('Yönetici yetkisi gerekiyor.');
    }
    return user;
  }
}
