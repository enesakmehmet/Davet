/**
 * Mevcut hesaba (enes) 1 düğün + 1 doğum günü davetiyesi ekler.
 * Mevcut davetiyelere DOKUNMAZ, sadece yeni kayıt ekler.
 *
 * Çalıştırma:  cd backend && node scripts/create-demo-invites.js
 */
const fs = require('fs');
const path = require('path');

// .env'den DATABASE_URL yükle (dotenv'e bağımlı olmadan)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rnd = () => Math.random().toString(36).slice(2, 6);

const WEDDING_CONFIG = {
  theme: 'lacivert',
  brideName: 'Elif',
  groomName: 'Emre',
  date: '2026-10-17T18:30',
  subtitle: 'evleniyoruz, sizi de aramızda görmek isteriz',
  greeting: 'Mutluluğumuza ortak olun',
  message:
    'Birbirimize verdiğimiz sözü, bizi sevenlerin huzurunda söylemek istiyoruz. Bu mutlu günümüzde yanımızda olmanız bizim için çok değerli.',
  venueName: 'Adile Sultan Sarayı',
  venueCity: 'Kandilli, İstanbul',
  mapQuery: 'Adile Sultan Sarayı Kandilli İstanbul',
  reception: 'Karşılama 17:30 · Nikah 18:30',
  music: true,
  musicUrl: '',
  photos: [
    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', caption: 'Nişanımızdan' },
    { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80', caption: 'İlk tatilimiz' },
    { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80', caption: '' },
  ],
  families: [
    { side: 'Gelin', names: 'Ayşe & Mehmet Kaya' },
    { side: 'Damat', names: 'Fatma & Ali Demir' },
  ],
  story: [
    { when: '2020', title: 'İlk Tanışma', text: 'Üniversite kütüphanesinde aynı kitaba uzandık.' },
    { when: '2023', title: 'İlk Seyahat', text: 'Kapadokya’da balonların altında birbirimize söz verdik.' },
    { when: '2026', title: 'Teklif', text: 'Boğaz’a karşı bir gün batımında "evet" dedik.' },
  ],
  rsvpDeadline: '1 Ekim',
  phone: '905555555555',
  videoUrl: '',
  fromName: '',
  wish: '',
};

const BIRTHDAY_CONFIG = {
  theme: 'balon',
  brideName: 'Mira', // doğum günü: isim
  groomName: '6', // doğum günü: yaş
  date: '2026-08-15T14:00',
  subtitle: 'doğum günü partime hepinizi bekliyorum!',
  greeting: 'Kutlamaya davetlisin',
  message:
    'En sevdiğim insanlarla doğum günümü kutlamak istiyorum. Gelip eğlenceye, pasta ve sürprizlere ortak olursan çok mutlu olurum!',
  venueName: 'Happy Land Eğlence Merkezi',
  venueCity: 'Kadıköy, İstanbul',
  mapQuery: 'Happy Land Eğlence Merkezi İstanbul',
  reception: 'Kapı açılışı 13:30',
  music: true,
  musicUrl: '',
  photos: [
    { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80', caption: 'Geçen yılki partiden' },
    { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80', caption: 'Balonlar!' },
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80', caption: '' },
  ],
  families: [
    { side: 'Annem', names: 'Elif Yılmaz' },
    { side: 'Babam', names: 'Mert Yılmaz' },
  ],
  story: [
    { when: 'Doğdum', title: 'Dünyaya merhaba', text: 'Ailemizin en mutlu günüydü.' },
    { when: 'İlk adım', title: 'Yürümeye başladım', text: 'Artık durdurmak imkânsızdı!' },
    { when: 'Bugün', title: 'Yaş günü zamanı', text: 'Hep birlikte kutlayalım istiyorum.' },
  ],
  rsvpDeadline: '10 Ağustos',
  phone: '905555555555',
  videoUrl: '',
  fromName: '',
  wish: '',
};

async function main() {
  // Hesabı bul: önce mevcut davetiyenin sahibi, yoksa admin olmayan ilk kullanıcı
  let userId = null;
  const existing = await prisma.invitation.findFirst({
    where: { deletedAt: null, slug: { startsWith: 'serra' } },
    select: { userId: true },
  });
  if (existing) userId = existing.userId;

  if (!userId) {
    const user = await prisma.user.findFirst({
      where: { email: { not: 'admin@davetim.com' } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true },
    });
    if (!user) throw new Error('Kullanıcı bulunamadı. Önce giriş yaptığın hesabın var olduğundan emin ol.');
    userId = user.id;
  }

  const items = [
    {
      title: 'Elif & Emre — Düğün Davetiyesi',
      slug: `elif-emre-${rnd()}`,
      eventDate: new Date('2026-10-17T18:30:00'),
      config: WEDDING_CONFIG,
    },
    {
      title: 'Mira — Doğum Günü Kutlaması',
      slug: `mira-6-${rnd()}`,
      eventDate: new Date('2026-08-15T14:00:00'),
      config: BIRTHDAY_CONFIG,
    },
  ];

  for (const item of items) {
    // slug çakışırsa yeni sonek üret
    while (await prisma.invitation.findUnique({ where: { slug: item.slug } })) {
      item.slug = item.slug.replace(/-[a-z0-9]{4}$/, `-${rnd()}`);
    }
    const inv = await prisma.invitation.create({ data: { ...item, userId } });
    console.log(`✔ Oluşturuldu: ${inv.title}  →  /davet/${inv.slug}`);
  }

  console.log('\nBitti. Panele girip yenilediğinde iki yeni davetiye görünecek.');
}

main()
  .catch((e) => {
    console.error('Hata:', e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
