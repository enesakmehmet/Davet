/**
 * JWT secret'ını güvenli biçimde döndürür.
 * - Üretimde (NODE_ENV=production) JWT_SECRET tanımlı ve yeterince uzun değilse
 *   uygulama başlamaz (fail-fast) — tahmin edilebilir sabit anahtar kullanılmaz.
 * - Geliştirmede env yoksa geçici bir anahtar kullanılır ama yüksek sesle uyarılır.
 */
export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'GÜVENLİK: JWT_SECRET ortam değişkeni tanımlı ve en az 16 karakter olmalıdır.',
    );
  }
  // eslint-disable-next-line no-console
  console.warn(
    '[GÜVENLİK UYARISI] JWT_SECRET tanımlı değil veya çok kısa; ' +
      'yalnızca GELİŞTİRME için geçici anahtar kullanılıyor. Üretimde mutlaka ayarlayın.',
  );
  return 'gelistirme-amacli-gecici-anahtar-degistir';
}
