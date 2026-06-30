# 🎉 Davetim - Dijital Davetiye Platformu Backend

Modern, ölçeklenebilir ve özellik dolu dijital davetiye platformu backend API'si.

## 🚀 Özellikler

### ✅ Tamamlanmış Modüller

- **🔐 Authentication & Authorization**
  - JWT tabanlı kimlik doğrulama
  - Refresh token mekanizması
  - Rate limiting koruması
  
- **👤 Kullanıcı Yönetimi**
  - Kullanıcı kaydı ve profil yönetimi
  - Şifre değiştirme ve hesap silme
  - Kullanıcı ayarları ve tercihler

- **📄 Şablon Sistemi**
  - Hazır davetiye şablonları (6+ şablon)
  - Animasyonlu ve modern tasarımlar
  - Kategori bazlı şablon yönetimi
  - Premium ve ücretsiz şablonlar
  - Şablon inceleme ve değerlendirme sistemi

- **💌 Davetiye Yönetimi**
  - Çoklu sayfa desteği
  - Şifre korumalı davetiyeler
  - Slug-based davetiye erişimi
  - Versiyon geçmişi
  - Otomatik kaydetme

- **👥 Misafir Yönetimi**
  - RSVP (Yanıt) sistemi
  - Refakatçi sayısı takibi
  - Plan bazlı misafir limitleri
  - Bildirim entegrasyonu

- **📊 Analitik & Raporlama**
  - Görüntülenme takibi
  - Ülke bazlı istatistikler
  - Tarayıcı, cihaz, OS analizi
  - Ortalama görüntüleme süresi

- **🖼️ Medya Yönetimi**
  - Dosya yükleme sistemi
  - Local/S3/Cloudflare R2 desteği
  - Dosya boyutu ve tip kontrolü

- **💳 Ödeme Sistemi**
  - PayTR ve İyzico entegrasyonu hazır
  - Webhook desteği
  - Ödeme geçmişi
  - Şablon satın alma

- **📦 Abonelik Yönetimi**
  - 3 seviyeli plan (Basic, Premium, Pro)
  - Abonelik yükseltme/düşürme
  - Otomatik yenileme
  - Süre dolumu bildirimleri (Cron Job)

- **📧 Mail Sistemi**
  - E-posta doğrulama
  - Şifre sıfırlama
  - Ödeme bildirimleri
  - Abonelik bildirimleri
  - Misafir yanıt bildirimleri

- **🎨 Editör**
  - Otomatik kaydetme
  - Versiyon kontrolü
  - Canvas-like editör desteği

- **🛍️ Marketplace**
  - Kategori yönetimi
  - Şablon satışı
  - İnceleme ve değerlendirme sistemi

- **📱 QR Kod**
  - Davetiye QR kodu oluşturma
  - QR kod indirme

- **🔔 Bildirimler**
  - Kullanıcı bildirimleri
  - Okundu işaretleme
  - Bildirim listeleme

- **📝 Audit Logs**
  - Tüm kritik işlemler loglanır
  - Kullanıcı bazlı log görüntüleme
  - İstatistiksel log analizi

- **👨‍💼 Admin Panel**
  - Dashboard istatistikleri
  - Kullanıcı yönetimi
  - Şablon moderasyonu
  - Ödeme takibi
  - Audit log görüntüleme

- **⚙️ Kullanıcı Ayarları**
  - Profil güncelleme
  - Şifre değiştirme
  - Hesap silme
  - Veri dışa aktarma (GDPR uyumlu)

- **🏥 Health Check**
  - Database bağlantı kontrolü
  - Redis bağlantı kontrolü
  - Sistem durumu endpoint'i

## 🛠️ Teknolojiler

- **Framework:** NestJS 11
- **Database:** PostgreSQL + Prisma ORM
- **Cache/Queue:** Redis + BullMQ
- **Authentication:** JWT + Passport
- **Validation:** class-validator, class-transformer
- **File Upload:** Multer
- **Email:** Nodemailer
- **QR Code:** qrcode
- **API Documentation:** Swagger
- **Rate Limiting:** @nestjs/throttler
- **Scheduling:** @nestjs/schedule (Cron Jobs)

## 📦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env` dosyasını düzenleyin:

```env
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/davetim"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# PayTR (Opsiyonel)
PAYTR_MERCHANT_ID=""
PAYTR_MERCHANT_KEY=""
PAYTR_MERCHANT_SALT=""

# İyzico (Opsiyonel)
IYZICO_API_KEY=""
IYZICO_SECRET_KEY=""
```

### 3. Veritabanını Oluştur

```bash
# Prisma migration
npx prisma migrate dev

# Hazır şablonları ve kategorileri ekle
npx prisma db seed
```

### 4. Uygulamayı Başlat

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Kayıt ol
- `POST /auth/login` - Giriş yap
- `POST /auth/refresh` - Token yenile
- `POST /auth/logout` - Çıkış yap

### Templates
- `GET /templates` - Şablonları listele
- `GET /templates/:id` - Şablon detayı
- `POST /templates` - Şablon oluştur
- `PATCH /templates/:id` - Şablon güncelle
- `DELETE /templates/:id` - Şablon sil

### Invitations
- `GET /invitations` - Davetiyelerimi listele
- `GET /invitations/slug/:slug` - Slug ile davetiye getir
- `POST /invitations` - Davetiye oluştur
- `PATCH /invitations/:id` - Davetiye güncelle
- `DELETE /invitations/:id` - Davetiye sil

### Guests
- `GET /guests/invitation/:invitationId` - Davetiye misafirlerini getir
- `POST /guests` - Misafir ekle (RSVP)
- `PATCH /guests/:id` - Misafir güncelle

### Payments
- `POST /payments/initiate` - Ödeme başlat
- `GET /payments/history` - Ödeme geçmişi
- `POST /payments/purchase-template` - Şablon satın al
- `POST /payments/webhook/:provider` - Webhook (Public)

### Subscriptions
- `GET /subscriptions/me` - Aboneliğim
- `POST /subscriptions` - Abonelik oluştur
- `PATCH /subscriptions/upgrade` - Abonelik yükselt
- `PATCH /subscriptions/renew` - Abonelik yenile
- `DELETE /subscriptions/cancel` - Abonelik iptal et

### QR Codes
- `GET /qr-codes/:invitationId` - QR kod oluştur
- `GET /qr-codes/:invitationId/download` - QR kod indir

### Admin
- `GET /admin/dashboard` - Dashboard istatistikleri
- `GET /admin/users` - Kullanıcı listesi
- `GET /admin/templates` - Şablon listesi
- `PATCH /admin/templates/:id/approve` - Şablon onayla
- `GET /admin/payments` - Ödeme listesi
- `GET /admin/audit-logs` - Audit log'ları

### Settings
- `GET /settings` - Ayarlarım
- `PATCH /settings` - Ayarları güncelle
- `PATCH /settings/password` - Şifre değiştir
- `DELETE /settings/account` - Hesabı sil
- `GET /settings/export` - Verileri dışa aktar

## 🎨 Hazır Şablonlar

Sistem 6 hazır şablon ile geliyor:

1. **Elegant Rose** - Zarif düğün davetiyesi (Ücretsiz)
2. **Modern Minimalist** - Minimalist nişan davetiyesi (Ücretsiz)
3. **Rainbow Fun** - Renkli doğum günü davetiyesi (Ücretsiz)
4. **Golden Luxury** - Lüks düğün davetiyesi (Premium - 149.99 TL)
5. **Boho Chic** - Rustik kır düğünü (Premium - 99.99 TL)
6. **Pastel Dreams** - Baby shower davetiyesi (Premium - 79.99 TL)

### Animasyon Tipleri
- fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
- slideInLeft, slideInRight
- zoomIn, rotateIn
- bounce, bounceIn
- rubberBand, tada
- scaleX

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Refresh token mekanizması
- Rate limiting (10 istek/dakika)
- Webhook signature doğrulaması
- Input validasyonu (class-validator)
- SQL injection koruması (Prisma)
- XSS koruması

## 📊 Plan Limitleri

| Özellik | Free | Premium | Pro |
|---------|------|---------|-----|
| Misafir Limiti | 50 | 500 | Sınırsız |
| Özel Şablon | ❌ | ✅ | ✅ |
| Analytics | Temel | Gelişmiş | Tam |
| Öncelikli Destek | ❌ | ❌ | ✅ |

## 🔄 Cron Jobs

- **Abonelik Kontrolü:** Her gün 00:00'da süresi dolan abonelikleri kontrol eder
- Ek cron job'lar kolayca eklenebilir

## 🚀 Deployment

### Docker ile

```bash
docker-compose up -d
```

### Manuel

```bash
# Build
npm run build

# Migration
npx prisma migrate deploy

# Start
npm run start:prod
```

## 📝 License

Bu proje MIT lisansı altındadır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için: info@davetim.com

---

**Not:** Production ortamında mutlaka `.env` dosyasındaki tüm secret key'leri değiştirin!
