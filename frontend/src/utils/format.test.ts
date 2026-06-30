import { describe, it, expect } from 'vitest';
import { slugify, formatDateTR, rsvpStatus } from './format';

describe('slugify', () => {
  it('Türkçe karakterleri sadeleştirir', () => {
    expect(slugify('Zeynep & Ahmet')).toBe('zeynep-ahmet');
    expect(slugify('Çağrı Şölen')).toBe('cagri-solen');
    expect(slugify('Gül İrem')).toBe('gul-irem');
  });
  it('baş/son tireleri temizler', () => {
    expect(slugify('  Merhaba!  ')).toBe('merhaba');
  });
});

describe('formatDateTR', () => {
  it('ISO tarihi Türkçe biçimde döndürür', () => {
    expect(formatDateTR('2026-09-12T18:00:00')).toBe('12 Eylül 2026');
  });
  it('geçersiz/boş girdide boş döndürür', () => {
    expect(formatDateTR('')).toBe('');
    expect(formatDateTR('abc')).toBe('');
  });
});

describe('rsvpStatus', () => {
  it('evet/hayır -> attending/not_attending', () => {
    expect(rsvpStatus(true)).toBe('attending');
    expect(rsvpStatus(false)).toBe('not_attending');
  });
});
