# Davetim — Animasyonlu Dijital Davetiye Platformu

Çiftlerin dakikalar içinde animasyonlu düğün davetiyesi oluşturup paylaşabildiği bir platform.
Canlı geri sayım, Google harita, RSVP (katılım bildirimi), arka plan müziği (MP3), fotoğraf galerisi ve daha fazlası.

## İçerik

- **backend/** — NestJS + Prisma (PostgreSQL) + Redis API
- **frontend/** — React + Vite (site, editör, public davet görüntüleyici)
- **admin-panel/** — React + Vite yönetim paneli *(yalnızca lokal; GitHub'a gönderilmez)*
- **davetler/** — Hazır animasyonlu davet şablonları (statik HTML örnekleri)

---

## Lokalde Çalıştırma

Gereken: Node 18+, PostgreSQL, Redis.

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
Backend'de `.env`'de `ADMIN_OPEN="true"` ise panel şifresiz açılır.

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
     - `CORS_ORIGINS` → `https://<frontend>.up.railway.app,http://localhost:3002`
     - `PUBLIC_BACKEND_URL` → backend'in genel adresi (`https://<backend>.up.railway.app`)
     - `ADMIN_OPEN` → `false`
   - Deploy sonrası bir kez seed çalıştır (admin için): Railway "Run command" → `npx prisma db seed`
4. **Frontend servisi** (aynı repo, Root Directory: `frontend`)
   - Build: `npm install && npm run build`
   - Start command: `npx vite preview --host --port $PORT`
   - Variables:
     - `VITE_API_URL` → `https://<backend>.up.railway.app/api`

Her iki servis için Railway "Generate Domain" ile `*.up.railway.app` adresi alırsın.
Sonra alan adı (davetim.com) alınca: her servise Custom Domain ekleyip env'leri `https://davetim.com` / `https://api.davetim.com` yaparsın.

### Lokal admin paneli → canlı backend
Admin paneli GitHub'a gitmez, lokalde kalır. Canlı backend'e bağlamak için
`admin-panel/.env.local` oluştur:
```
VITE_API_URL=https://<backend>.up.railway.app/api
```
Backend `CORS_ORIGINS` içinde `http://localhost:3002` olduğundan emin ol.
Giriş için admin hesabı gerekir (seed ile gelen `admin@davetim.com / Admin123!`).

---

## Güvenlik notları
- `.env` dosyaları **asla** repoya gitmez (`.gitignore`).
- Üretimde `ADMIN_OPEN=false` ve güçlü bir `JWT_SECRET` kullan.
- Yüklenen dosyalar (MP3/görsel) şu an yerel diske gider; Railway'de kalıcı olması için ileride S3 vb. bağlanmalı.
