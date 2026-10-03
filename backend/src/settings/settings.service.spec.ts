import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let prisma: any;
  let service: SettingsService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 'u1', email: 'ayse@ornek.com', name: 'Ayşe' }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    service = new SettingsService(prisma);
  });

  it('e-posta panelden başka bir adrese DEĞİŞTİRİLEMEZ', async () => {
    prisma.user.findUnique.mockResolvedValue({ email: 'ayse@ornek.com' });
    await expect(service.updateSettings('u1', { email: 'baskasi@ornek.com' } as any))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('aynı e-posta (büyük/küçük harf farkıyla) gönderilirse isim güncellemesi engellenmez', async () => {
    prisma.user.findUnique.mockResolvedValue({ email: 'ayse@ornek.com' });
    await service.updateSettings('u1', { email: 'AYSE@ornek.com', name: '  Ayşe Y. ' } as any);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'Ayşe Y.' } }));
  });

  it('hesap silme şifresiz yapılamaz', async () => {
    prisma.user.findUnique.mockResolvedValue({ passwordHash: await bcrypt.hash('dogruSifre1', 4) });
    await expect(service.deleteAccount('u1')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.deleteAccount('u1', 'yanlis')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('doğru şifreyle hesap silinir', async () => {
    prisma.user.findUnique.mockResolvedValue({ passwordHash: await bcrypt.hash('dogruSifre1', 4) });
    await service.deleteAccount('u1', 'dogruSifre1');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('veri dışa aktarımı sıfırlama/doğrulama kodlarını içermez', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1', email: 'a@b.com', passwordHash: 'h', refreshToken: 'r',
      resetToken: '123456', resetTokenExpires: new Date(), verifyToken: '654321', verifyTokenExpires: new Date(),
    });
    const r: any = await service.exportUserData('u1');
    expect(r.data).toEqual({ id: 'u1', email: 'a@b.com' });
  });
});
