import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateSettingsDto } from './update-settings.dto';

const check = async (payload: Record<string, any>) => {
  const dto = plainToInstance(UpdateSettingsDto, payload);
  return validate(dto);
};

describe('UpdateSettingsDto', () => {
  it('boş gövde (hiçbir alan) hata vermez — tüm alanlar opsiyonel', async () => {
    expect(await check({})).toHaveLength(0);
  });

  it('isim 100 karakteri aşarsa reddedilir', async () => {
    const errors = await check({ name: 'a'.repeat(101) });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('geçersiz e-posta reddedilir', async () => {
    const errors = await check({ email: 'gecersiz' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('desteklenmeyen dil reddedilir', async () => {
    const errors = await check({ language: 'fr' });
    expect(errors.some((e) => e.property === 'language')).toBe(true);
  });

  it('desteklenen dil kabul edilir', async () => {
    const errors = await check({ language: 'en' });
    expect(errors).toHaveLength(0);
  });

  it('geçersiz saat dilimi formatı reddedilir', async () => {
    const errors = await check({ timezone: 'Europe/Istanbul; DROP TABLE users;' });
    expect(errors.some((e) => e.property === 'timezone')).toBe(true);
  });

  it('geçerli IANA saat dilimi formatı kabul edilir', async () => {
    const errors = await check({ timezone: 'Europe/Istanbul' });
    expect(errors).toHaveLength(0);
  });
});
