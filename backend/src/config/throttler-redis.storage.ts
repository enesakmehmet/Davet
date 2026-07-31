import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import Redis from 'ioredis';
import { redisConnection } from './redis.util';

type StorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

/**
 * Rate limit sayaçlarını Redis'te tutar — böylece birden fazla instance/replika
 * çalışsa bile limitler tüm sunucularda ortak işler.
 * Redis'e ulaşılamazsa uygulama içi sayaçla rate-limit devam eder.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private redis: Redis;
  private healthy = false;
  private readonly fallback = new ThrottlerStorageService();

  constructor() {
    this.redis = new Redis({
      ...(redisConnection() as any),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    this.redis.on('error', () => { this.healthy = false; });
    this.redis.on('ready', () => { this.healthy = true; });
    this.redis.connect().catch(() => {
      this.healthy = false;
      this.logger.warn('Redis bağlantısı kurulamadı — uygulama içi rate limit kullanılacak.');
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<StorageRecord> {
    if (!this.healthy) return this.fallback.increment(key, ttl, limit, blockDuration, throttlerName);

    try {
      const k = `throttle:${throttlerName}:${key}`;
      const hits = await this.redis.incr(k);
      if (hits === 1) await this.redis.pexpire(k, ttl);
      let ttlLeft = await this.redis.pttl(k);
      if (ttlLeft < 0) {
        await this.redis.pexpire(k, ttl);
        ttlLeft = ttl;
      }
      const isBlocked = hits > limit;
      return {
        totalHits: hits,
        timeToExpire: ttlLeft,
        isBlocked,
        timeToBlockExpire: isBlocked ? (blockDuration > 0 ? blockDuration : ttlLeft) : 0,
      };
    } catch {
      return this.fallback.increment(key, ttl, limit, blockDuration, throttlerName);
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.fallback.onApplicationShutdown();
  }
}
