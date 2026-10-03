import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy.validate', () => {
  const makeStrategy = (user: any) => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-test-secret-test-secret';
    const users = { findById: jest.fn().mockResolvedValue(user) };
    return { strategy: new JwtStrategy(users as any), users };
  };

  it('normal access token ile kullanıcıyı (hassas alanlar olmadan) döner', async () => {
    const { strategy } = makeStrategy({ id: 'u1', email: 'a@b.com', status: 'active', passwordHash: 'x', refreshToken: 'y' });
    const r = await strategy.validate({ sub: 'u1' });
    expect(r).toEqual({ id: 'u1', email: 'a@b.com', status: 'active' });
  });

  it('refresh token Bearer erişim anahtarı olarak KULLANILAMAZ', async () => {
    const { strategy, users } = makeStrategy({ id: 'u1', status: 'active' });
    await expect(strategy.validate({ sub: 'u1', tokenType: 'refresh' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('askıya alınmış hesabın mevcut oturumu reddedilir', async () => {
    const { strategy } = makeStrategy({ id: 'u1', status: 'suspended' });
    await expect(strategy.validate({ sub: 'u1' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
