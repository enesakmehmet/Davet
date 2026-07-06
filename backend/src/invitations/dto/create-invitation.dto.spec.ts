import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateInvitationDto } from './create-invitation.dto';

const base = { title: 'Test Davet', slug: 'ayse-mehmet' };

const check = async (overrides: Partial<Record<string, any>> = {}) => {
  const dto = plainToInstance(CreateInvitationDto, { ...base, ...overrides });
  return validate(dto);
};

describe('CreateInvitationDto (slug kısıtları)', () => {
  it('geçerli slug hata vermez', async () => {
    expect(await check()).toHaveLength(0);
  });

  it('3 karakterden kısa slug reddedilir', async () => {
    const errors = await check({ slug: 'ab' });
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('60 karakterden uzun slug reddedilir', async () => {
    const errors = await check({ slug: 'a'.repeat(61) });
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('büyük harf içeren slug reddedilir', async () => {
    const errors = await check({ slug: 'Ayse-Mehmet' });
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('boşluk/özel karakter içeren slug reddedilir', async () => {
    const errors = await check({ slug: 'ayse mehmet!' });
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('tire ile başlayan/biten slug reddedilir', async () => {
    const errors = await check({ slug: '-ayse-mehmet-' });
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('rakam ve tire içeren geçerli slug kabul edilir', async () => {
    const errors = await check({ slug: 'ayse-mehmet-2026' });
    expect(errors).toHaveLength(0);
  });
});
