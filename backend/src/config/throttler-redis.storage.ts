import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
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
 * Redis'e ulaşılamazsa istekleri ENGELLEMEZ (fail-open): sayaç 1 kabul edilir.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private redis: Redis;
  private healthy = false;

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
      this.logger.warn('Redis bağlantısı kurulamadı — rate limit fail-open modda.');
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<StorageRecord> {
    const failOpen: StorageRecord = { totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
    if (!this.healthy) return failOpen;

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
      return failOpen;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
