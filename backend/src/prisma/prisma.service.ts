import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * DATABASE_URL'e bağlantı havuzu limiti ekler.
 * Prisma varsayılanı (vCPU*2+1) küçük Railway container'larında bile gereksiz sayıda
 * Postgres bağlantısı açabiliyor — her bağlantının sunucu tarafında kendi bellek payı var.
 * PRISMA_CONNECTION_LIMIT ile override edilebilir (varsayılan: 5, düşük trafikli bir API için yeterli).
 */
function buildDatasourceUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  try {
    const url = new URL(base);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT || '5');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '10');
    }
    return url.toString();
  } catch {
    return base;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = buildDatasourceUrl();
    super(url ? { datasources: { db: { url } } } : undefined);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
