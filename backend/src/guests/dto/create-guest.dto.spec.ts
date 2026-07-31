import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateGuestDto } from './create-guest.dto';

const base = {
  invitationId: 'inv-1',
  name: 'Ayşe Yılmaz',
  status: 'attending',
};

const check = async (overrides: Partial<Record<string, any>> = {}) => {
  const dto = plainToInstance(CreateGuestDto, { ...base, ...overrides });
  return validate(dto);
};

describe('CreateGuestDto', () => {
  it('geçerli minimum veriyle hata vermez', async () => {
    expect(await check()).toHaveLength(0);
  });

  it('isim 100 karakteri aşarsa reddedilir', async () => {
    const errors = await check({ name: 'a'.repeat(101) });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('geçersiz e-posta reddedilir', async () => {
    const errors = await check({ email: 'gecersiz-eposta' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('geçerli e-posta kabul edilir', async () => {
    const errors = await check({ email: 'ayse@ornek.com' });
    expect(errors).toHaveLength(0);
  });

  it('tanımsız bir status değeri reddedilir', async () => {
    const errors = await check({ status: 'belki-gelirim' });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('mesaj 500 karakteri aşarsa reddedilir', async () => {
    const errors = await check({ message: 'a'.repeat(501) });
    expect(errors.some((e) => e.property === 'message')).toBe(true);
  });

  it('localized yemek tercihi (uzunluk sınırı içinde) kabul edilir', async () => {
    // Değer kullanıcının diline göre değişir (Vejetaryen / Vegetarian / Vegetarisch vb.)
    const errors = await check({ mealPreference: 'Vejetaryen' });
    expect(errors).toHaveLength(0);
  });

  it('companionCount negatifse reddedilir', async () => {
    const errors = await check({ companionCount: -1 });
    expect(errors.some((e) => e.property === 'companionCount')).toBe(true);
  });
});
