import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, PrismaHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Transport, RedisOptions } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 1. Veritabanı Kontrolü
      () => this.prismaHealth.pingCheck('database', this.prisma),
      
      // 2. Redis Kontrolü
      () => this.microservice.pingCheck<RedisOptions>('redis', {
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      }),

      // 3. (Opsiyonel) Storage veya Dış API kontrolü yapılabilir
    ]);
  }
}
