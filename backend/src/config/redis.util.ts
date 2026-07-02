/**
 * Redis bağlantı ayarlarını döndürür.
 * - Railway/üretim: REDIS_URL (redis://user:pass@host:port) varsa onu ayrıştırır.
 * - Lokal: REDIS_HOST / REDIS_PORT / REDIS_PASSWORD.
 */
export function redisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        port: Number(u.port) || 6379,
        username: u.username || undefined,
        password: u.password || undefined,
        // Railway private network (redis.railway.internal) IPv6 kullanır;
        // family:0 olmadan ioredis adresi çözemez ve uygulama açılışta takılabilir.
        family: 0,
        connectTimeout: 10000,
      };
    } catch {
      /* hatalı URL → aşağıdaki varsayılana düş */
    }
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  };
}
