import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Transport, RedisOptions } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const checks = [
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ];

    // Redis has an in-memory rate-limit fallback. It only belongs to readiness
    // when an environment explicitly marks it as a hard dependency.
    if (process.env.REDIS_REQUIRED === 'true') {
      checks.push(() => this.microservice.pingCheck<RedisOptions>('redis', {
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      }));
    }

    return this.health.check(checks);
  }
}
