# Davetim — Animasyonlu Dijital Davetiye Platformu

Çiftlerin dakikalar içinde animasyonlu davetiye oluşturup paylaşabildiği bir platform.

**Davet türleri:** 💍 Düğün · 🕌 Dini Düğün (besmele, altın kapı açılışı, kına + düğün kartları, dua) · 🎂 Doğum Günü Daveti · 🎉 Kutlama (kişiye gönderilen tebrik)

**Özellikler:** canlı geri sayım, Google harita + yol tarifi, RSVP (yemek tercihi & alerji notu dahil), arka plan müziği (MP3), fotoğraf galerisi (otomatik WebP optimizasyonu), QR kod, WhatsApp'ta görselli link önizlemesi (OG), şifre koruması, çoklu dil (tr/en/de), bildirimler, çöp kutusu (30 gün geri alma), davet kopyalama, özel bağlantı (slug) seçimi.

**Otomasyonlar:** 1 yılı dolan davetler otomatik yayından kalkar; çöpte 30 günü dolanlar kalıcı silinir; etkinliğe 3 gün kala sahibine e-posta + bildirim gider.

## İçerik

- **backend/** — NestJS + Prisma (PostgreSQL) + Redis API (Node **20+** gerekir)
- **frontend/** — React + Vite (site, editör, public davet görüntüleyici)
- **admin-panel/** — React + Vite yönetim paneli *(yalnızca lokal; GitHub'a gönderilmez)*
- **davetler/** — Hazır animasyonlu davet şablonları (statik HTML örnekleri)

---

## Lokalde Çalıştırma

Gereken: Node 20+, PostgreSQL, Redis.

### Backend
```bash
cd backend
npm install
# .env oluştur (backend/.env.example'a bak): DATABASE_URL, JWT_SECRET, REDIS...
npx prisma migrate dev          # tabloları kurar + seed (admin@davetim.com / Admin123!)
npm run dev                     # http://localhost:3000  (Swagger: /api/docs)
```

### Frontend
```bash
cd frontend
npm install
npm run dev                     # http://localhost:3001   (/api -> backend proxy)
```

### Admin paneli (lokal)
```bash
cd admin-panel
npm install
npm run dev                     # http://localhost:3002
```
Backend'de `.env`'de `ADMIN_OPEN="true"` ise panel şifresiz açılır
*(yalnızca geliştirmede — `NODE_ENV=production` iken bu mod kod seviyesinde kapalıdır)*.

---

## Railway'e Canlıya Alma (alan adı olmadan)

Railway'de **tek projede** şu servisler:

1. **PostgreSQL** ekle → otomatik `DATABASE_URL` verir.
2. **Redis** ekle → otomatik `REDIS_URL` verir.
3. **Backend servisi** (GitHub repo, Root Directory: `backend`)
   - Build: otomatik (`npm install` → `postinstall: prisma generate` → `npm run build`)
   - Start command: `npm run start:prod`  *(migration uygular + başlatır)*
   - Variables:
     - `DATABASE_URL` → Postgres'ten referansla
     - `REDIS_URL` → Redis'ten referansla
     - `JWT_SECRET` → uzun rastgele bir değer
     - `PORT` → `3000` *(domain'in hedef portu ile AYNI olmalı — "upstream error"un 1 numaralı sebebi)*
     - `CORS_ORIGINS` → `https://<frontend>.up.railway.app,http://localhost:3002`
     - `PUBLIC_BACKEND_URL` → backend'in genel adresi
     - `FRONTEND_URL` → frontend'in genel adresi (OG yönlendirmesi ve QR için)
     - `RESEND_API_KEY` → e-posta gönderimi (Resend)
     - `ADMIN_OPEN` → `false`
   - Deploy sonrası bir kez seed çalıştır: Railway "Run command" → `npx prisma db seed`
4. **Frontend servisi** (aynı repo, Root Directory: `frontend`)
   - Variables: `VITE_API_URL` → `https://<backend>.up.railway.app/api`
   - Domain hedef portu build çıktısını sunan sunucuya göre ayarlanır (Caddy: 8080).

Opsiyonel env'ler: `INVITE_LIMIT_FREE` (vars. 5), `INVITE_LIMIT_PRO` (vars. 25), `JWT_EXPIRES_IN` (vars. 1h), `CONTACT_TO` (iletişim formu alıcısı).

### Lokal admin paneli → canlı backend
`admin-panel/.env.local` içine `VITE_API_URL=https://<backend>.up.railway.app/api` yaz;
backend `CORS_ORIGINS` içinde `http://localhost:3002` olsun. Giriş: seed admin hesabı.

---

## Güvenlik notları
- `.env` dosyaları **asla** repoya gitmez (`.gitignore`).
- Access token 1 saat geçerlidir; oturum, refresh token (30 gün) ile frontend'te otomatik yenilenir.
- Kayıt/giriş uçlarında IP bazlı hız limiti + kayıt formunda honeypot bot koruması vardır.
- RSVP ucu IP başına dakikada 5 yanıtla sınırlıdır.
- Üretimde `ADMIN_OPEN` yok sayılır (kod emniyeti); güçlü bir `JWT_SECRET` kullanın.
- Yüklenen dosyalar (MP3/görsel) veritabanında saklanır; görseller otomatik küçültülüp WebP'ye çevrilir.
