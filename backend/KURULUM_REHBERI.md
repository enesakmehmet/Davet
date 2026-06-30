# 🚀 Davetim - Kurulum Rehberi

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veritabanını Hazırla
```bash
# PostgreSQL'in çalıştığından emin olun

# Migration'ları çalıştır
npx prisma migrate dev

# Hazır şablonları ve verileri yükle
npx prisma db seed
```

### 3. Uygulamayı Başlat
```bash
# Development modu
npm run start:dev

# Uygulama http://localhost:3000 adresinde çalışacak
# API Dokümantasyonu: http://localhost:3000/api/docs
```

## 📋 Önemli Bilgiler

### Varsayılan Admin Hesabı (Seed ile oluşturulur)
- **Email:** admin@davetim.com
- **Şifre:** Admin123!

### Hazır Şablonlar
Seed komutu ile 6 adet hazır şablon eklenir:
1. Elegant Rose (Düğün - Ücretsiz)
2. Modern Minimalist (Nişan - Ücretsiz)
3. Rainbow Fun (Doğum Günü - Ücretsiz)
4. Golden Luxury (Düğün Premium - 149.99 TL)
5. Boho Chic (Kır Düğünü Premium - 99.99 TL)
6. Pastel Dreams (Baby Shower Premium - 79.99 TL)

### Kategoriler
- Düğün
- Nişan
- Doğum Günü
- Mezuniyet
- Kurumsal Etkinlik
- Baby Shower
- Yılbaşı Partisi
- Sünnet

## 🔧 Gereksinimler

- Node.js 18+ veya 20+
- PostgreSQL 14+
- Redis 6+ (Opsiyonel - Queue ve Cache için)
- npm veya yarn

## 📦 Veritabanı Komutları

```bash
# Prisma Studio'yu aç (Veritabanını görsel olarak yönet)
npx prisma studio

# Yeni migration oluştur
npx prisma migrate dev --name migration_adi

# Migration'ları production'a uygula
npx prisma migrate deploy

# Prisma Client'i yeniden oluştur
npx prisma generate

# Veritabanını sıfırla (DİKKAT: Tüm veriyi siler!)
npx prisma migrate reset
```

## 🧪 Test Komutları

```bash
# Tüm testleri çalıştır
npm run test

# Test coverage
npm run test:cov

# E2E testler
npm run test:e2e

# Watch modunda test
npm run test:watch
```

## 📊 API Endpoint'leri

Tüm endpoint'lerin detaylı dokümantasyonu için:
**http://localhost:3000/api/docs**

### Ana Endpoint Grupları:
- `/api/auth` - Kimlik doğrulama
- `/api/users` - Kullanıcı yönetimi
- `/api/templates` - Şablon yönetimi
- `/api/invitations` - Davetiye yönetimi
- `/api/guests` - Misafir yönetimi
- `/api/payments` - Ödeme işlemleri
- `/api/subscriptions` - Abonelik yönetimi
- `/api/analytics` - Analitik
- `/api/qr-codes` - QR kod oluşturma
- `/api/admin` - Admin panel
- `/api/settings` - Kullanıcı ayarları
- `/api/health` - Sağlık kontrolü

## 🐛 Sorun Giderme

### Port zaten kullanılıyor
```bash
# Windows'ta portu kullanan process'i bul ve kapat
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### PostgreSQL bağlantı hatası
- PostgreSQL'in çalıştığından emin olun
- .env dosyasındaki DATABASE_URL'i kontrol edin
- Veritabanı kullanıcı adı ve şifresini doğrulayın

### Redis bağlantı hatası
- Redis'in kurulu ve çalışıyor olduğundan emin olun
- Windows için: https://github.com/microsoftarchive/redis/releases
- Docker ile: `docker run -d -p 6379:6379 redis`

### Prisma hataları
```bash
# Prisma Client'i yeniden oluştur
npx prisma generate

# Migration'ları sıfırla
npx prisma migrate reset
```

## 🔐 Güvenlik Notları

**Production öncesi mutlaka yapılması gerekenler:**

1. `.env` dosyasındaki tüm SECRET değerlerini değiştirin
2. CORS ayarlarını production domain'ine göre düzenleyin
3. Rate limiting değerlerini gözden geçirin
4. SMTP ayarlarını production mail servisine göre yapın
5. PayTR/İyzico gerçek API key'lerini ekleyin
6. PostgreSQL ve Redis için güçlü şifreler kullanın

## 📝 Geliştirme Notları

### Yeni Modül Ekleme
```bash
nest g module module-adi
nest g controller module-adi
nest g service module-adi
```

### Yeni DTO Ekleme
```bash
nest g class module-adi/dto/dto-adi.dto --no-spec
```

### Prisma Şema Değişikliği
1. `prisma/schema.prisma` dosyasını düzenle
2. `npx prisma migrate dev --name degisiklik_adi` komutunu çalıştır
3. Prisma Client otomatik güncellenir

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Start
```bash
npm run start:prod
```

### Docker ile
```bash
docker-compose up -d
```

## 📞 Destek

Sorular ve sorunlar için:
- GitHub Issues
- Email: info@davetim.com

---

**Başarılar dileriz! 🎉**
