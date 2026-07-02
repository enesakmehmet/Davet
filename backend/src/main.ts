import { webcrypto } from 'crypto';
// Node 18'de global `crypto` yok; @nestjs/schedule v6 buna ihtiyaç duyar.
// Node 20+ kullanılsa bile zararsız bir emniyet kemeri.
if (!(globalThis as any).crypto) (globalThis as any).crypto = webcrypto;

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Güvenlik başlıkları (HTTP). Swagger UI ve çapraz-origin görseller için CSP kapalı.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS — birden çok origin desteklenir (site + admin paneli).
  // Üretimde: CORS_ORIGINS="https://davetim.com,https://panel.davetim.com"
  const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3001,http://localhost:3002')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Davetim API')
    .setDescription(
      'Davetim - Modern Dijital Davetiye Platformu REST API Dokümantasyonu',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Kimlik doğrulama işlemleri')
    .addTag('users', 'Kullanıcı yönetimi')
    .addTag('templates', 'Şablon yönetimi')
    .addTag('invitations', 'Davetiye yönetimi')
    .addTag('guests', 'Misafir yönetimi')
    .addTag('payments', 'Ödeme işlemleri')
    .addTag('subscriptions', 'Abonelik yönetimi')
    .addTag('analytics', 'Analitik ve raporlama')
    .addTag('qr-codes', 'QR kod işlemleri')
    .addTag('admin', 'Admin panel')
    .addTag('settings', 'Kullanıcı ayarları')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token ile kimlik doğrulama',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Uygulama ${port} portunda çalışıyor`);
  logger.log(`📚 API Dokümantasyonu: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Ortam: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
