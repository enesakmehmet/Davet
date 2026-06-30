/* Paylaşılan yardımcılar — testlenebilir saf fonksiyonlar */

/** Türkçe karakterleri sadeleştirip URL-dostu slug üretir */
export const slugify = (s: string): string =>
  (s || '')
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** ISO/Date string'i "12 Eylül 2026" biçimine çevirir */
export const formatDateTR = (d?: string): string => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return `${dt.getDate()} ${AYLAR[dt.getMonth()]} ${dt.getFullYear()}`;
};

/** RSVP seçimini backend statüsüne çevirir */
export const rsvpStatus = (coming: boolean): 'attending' | 'not_attending' =>
  coming ? 'attending' : 'not_attending';
