import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabanı seeding başlıyor...');

  // Admin kullanıcı oluştur
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@davetim.com' },
    update: { role: 'admin', emailVerified: true },
    create: {
      email: 'admin@davetim.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('Admin kullanıcı oluşturuldu:', admin.email);

  // Template kategorileri oluştur
  const categories = [
    { name: 'Düğün', slug: 'dugun' },
    { name: 'Nişan', slug: 'nisan' },
    { name: 'Doğum Günü', slug: 'dogum-gunu' },
    { name: 'Mezuniyet', slug: 'mezuniyet' },
    { name: 'Kurumsal Etkinlik', slug: 'kurumsal-etkinlik' },
    { name: 'Baby Shower', slug: 'baby-shower' },
    { name: 'Yılbaşı Partisi', slug: 'yilbasi-partisi' },
    { name: 'Sünnet', slug: 'sunnet' },
  ];

  const createdCategories = {};
  for (const category of categories) {
    const created = await prisma.templateCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories[category.slug] = created;
    console.log('Kategori oluşturuldu:', created.name);
  }

  // Hazır şablonlar
  const templates = [
    {
      title: 'Elegant Rose - Düğün Davetiyesi',
      description: 'Zarif gül motifleri ve altın detaylarla süslenmiş klasik düğün davetiyesi. Fade-in animasyonları ile.',
      price: 0,
      isPremium: false,
      categorySlug: 'dugun',
      thumbnail: '/templates/elegant-rose-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'gradient',
              colors: ['#fef9f8', '#fee5e0'],
              direction: '135deg',
            },
            elements: [
              {
                id: 'header-1',
                type: 'text',
                content: 'Evliliğe İlk Adım',
                position: { x: 50, y: 15 },
                style: {
                  fontSize: 48,
                  fontFamily: 'Playfair Display',
                  color: '#8b5a3c',
                  textAlign: 'center',
                  fontWeight: '700',
                },
                animation: {
                  type: 'fadeInDown',
                  duration: 1.2,
                  delay: 0,
                },
              },
              {
                id: 'image-1',
                type: 'image',
                src: '/templates/rose-decoration.png',
                position: { x: 50, y: 25 },
                size: { width: 200, height: 150 },
                animation: {
                  type: 'zoomIn',
                  duration: 1.5,
                  delay: 0.3,
                },
              },
              {
                id: 'names-1',
                type: 'text',
                content: 'Ayşe & Mehmet',
                position: { x: 50, y: 45 },
                style: {
                  fontSize: 72,
                  fontFamily: 'Great Vibes',
                  color: '#d4a574',
                  textAlign: 'center',
                  fontWeight: '400',
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1.5,
                  delay: 0.6,
                },
              },
              {
                id: 'date-1',
                type: 'text',
                content: '15 Haziran 2024',
                position: { x: 50, y: 60 },
                style: {
                  fontSize: 32,
                  fontFamily: 'Montserrat',
                  color: '#8b5a3c',
                  textAlign: 'center',
                  fontWeight: '300',
                  letterSpacing: '2px',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 0.9,
                },
              },
              {
                id: 'divider-1',
                type: 'shape',
                shape: 'line',
                position: { x: 50, y: 68 },
                size: { width: 300, height: 2 },
                style: {
                  backgroundColor: '#d4a574',
                },
                animation: {
                  type: 'scaleX',
                  duration: 1,
                  delay: 1.2,
                },
              },
              {
                id: 'venue-1',
                type: 'text',
                content: 'Grand Palace Düğün Salonu',
                position: { x: 50, y: 75 },
                style: {
                  fontSize: 28,
                  fontFamily: 'Montserrat',
                  color: '#6b4423',
                  textAlign: 'center',
                  fontWeight: '500',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.4,
                },
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Modern Minimalist - Nişan Davetiyesi',
      description: 'Minimalist ve modern tasarım anlayışıyla hazırlanmış nişan davetiyesi. Slide animasyonları ile.',
      price: 0,
      isPremium: false,
      categorySlug: 'nisan',
      thumbnail: '/templates/modern-minimal-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'solid',
              color: '#ffffff',
            },
            elements: [
              {
                id: 'accent-1',
                type: 'shape',
                shape: 'rectangle',
                position: { x: 0, y: 0 },
                size: { width: 100, height: 30 },
                style: {
                  backgroundColor: '#2c3e50',
                },
                animation: {
                  type: 'slideInLeft',
                  duration: 0.8,
                  delay: 0,
                },
              },
              {
                id: 'title-1',
                type: 'text',
                content: 'NİŞAN',
                position: { x: 30, y: 20 },
                style: {
                  fontSize: 36,
                  fontFamily: 'Montserrat',
                  color: '#2c3e50',
                  textAlign: 'left',
                  fontWeight: '800',
                  letterSpacing: '8px',
                },
                animation: {
                  type: 'fadeInLeft',
                  duration: 1,
                  delay: 0.3,
                },
              },
              {
                id: 'names-2',
                type: 'text',
                content: 'ZEYNEP\n&\nAHMET',
                position: { x: 30, y: 40 },
                style: {
                  fontSize: 56,
                  fontFamily: 'Poppins',
                  color: '#34495e',
                  textAlign: 'left',
                  fontWeight: '700',
                  lineHeight: 1.2,
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1.2,
                  delay: 0.6,
                },
              },
              {
                id: 'date-2',
                type: 'text',
                content: '22.08.2024\n19:30',
                position: { x: 70, y: 50 },
                style: {
                  fontSize: 32,
                  fontFamily: 'Roboto',
                  color: '#7f8c8d',
                  textAlign: 'right',
                  fontWeight: '300',
                  lineHeight: 1.5,
                },
                animation: {
                  type: 'fadeInRight',
                  duration: 1,
                  delay: 0.9,
                },
              },
              {
                id: 'circle-decoration',
                type: 'shape',
                shape: 'circle',
                position: { x: 75, y: 75 },
                size: { width: 150, height: 150 },
                style: {
                  backgroundColor: 'transparent',
                  border: '3px solid #e74c3c',
                },
                animation: {
                  type: 'zoomIn',
                  duration: 1.5,
                  delay: 1.2,
                },
              },
              {
                id: 'venue-2',
                type: 'text',
                content: 'Hilton Hotel\nBeylikdüzü / İstanbul',
                position: { x: 30, y: 85 },
                style: {
                  fontSize: 24,
                  fontFamily: 'Roboto',
                  color: '#95a5a6',
                  textAlign: 'left',
                  fontWeight: '400',
                  lineHeight: 1.6,
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1,
                  delay: 1.5,
                },
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Rainbow Fun - Doğum Günü Davetiyesi',
      description: 'Renkli ve eğlenceli çocuk doğum günü davetiyesi. Bounce ve rotate animasyonları ile.',
      price: 0,
      isPremium: false,
      categorySlug: 'dogum-gunu',
      thumbnail: '/templates/rainbow-fun-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'gradient',
              colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
              direction: '180deg',
            },
            elements: [
              {
                id: 'title-3',
                type: 'text',
                content: '🎉 DOĞUM GÜNÜ PARTİSİ 🎉',
                position: { x: 50, y: 10 },
                style: {
                  fontSize: 42,
                  fontFamily: 'Fredoka One',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: '700',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                },
                animation: {
                  type: 'bounce',
                  duration: 1.5,
                  delay: 0,
                },
              },
              {
                id: 'balloon-1',
                type: 'image',
                src: '/templates/balloon-red.png',
                position: { x: 20, y: 25 },
                size: { width: 80, height: 120 },
                animation: {
                  type: 'bounceIn',
                  duration: 1.2,
                  delay: 0.2,
                },
              },
              {
                id: 'balloon-2',
                type: 'image',
                src: '/templates/balloon-blue.png',
                position: { x: 80, y: 25 },
                size: { width: 80, height: 120 },
                animation: {
                  type: 'bounceIn',
                  duration: 1.2,
                  delay: 0.4,
                },
              },
              {
                id: 'name-3',
                type: 'text',
                content: 'ELİF',
                position: { x: 50, y: 45 },
                style: {
                  fontSize: 88,
                  fontFamily: 'Baloo',
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: '900',
                  textShadow: '4px 4px 8px rgba(0,0,0,0.4)',
                },
                animation: {
                  type: 'rubberBand',
                  duration: 1.5,
                  delay: 0.6,
                },
              },
              {
                id: 'age-3',
                type: 'text',
                content: '7 YAŞINDA! 🎂',
                position: { x: 50, y: 60 },
                style: {
                  fontSize: 48,
                  fontFamily: 'Fredoka One',
                  color: '#ffd700',
                  textAlign: 'center',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                },
                animation: {
                  type: 'tada',
                  duration: 1.5,
                  delay: 0.9,
                },
              },
              {
                id: 'date-3',
                type: 'text',
                content: '10 Temmuz 2024\nSaat: 15:00',
                position: { x: 50, y: 75 },
                style: {
                  fontSize: 32,
                  fontFamily: 'Poppins',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: '600',
                  lineHeight: 1.6,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.2,
                },
              },
              {
                id: 'venue-3',
                type: 'text',
                content: 'Çocuk Oyun Parkı\nMaslak, İstanbul',
                position: { x: 50, y: 88 },
                style: {
                  fontSize: 24,
                  fontFamily: 'Poppins',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.5,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1,
                  delay: 1.5,
                },
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Golden Luxury - Premium Düğün',
      description: 'Lüks ve gösterişli düğün davetiyesi. Altın renk teması ve zarif animasyonlarla.',
      price: 149.99,
      isPremium: true,
      categorySlug: 'dugun',
      thumbnail: '/templates/golden-luxury-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'gradient',
              colors: ['#1a1a1a', '#2d2d2d'],
              direction: '45deg',
            },
            elements: [
              {
                id: 'ornament-top',
                type: 'image',
                src: '/templates/gold-ornament.png',
                position: { x: 50, y: 5 },
                size: { width: 300, height: 100 },
                animation: {
                  type: 'fadeInDown',
                  duration: 1.5,
                  delay: 0,
                },
              },
              {
                id: 'title-4',
                type: 'text',
                content: 'Birlikteliğimizi\nKutlamaya Davetlisiniz',
                position: { x: 50, y: 18 },
                style: {
                  fontSize: 36,
                  fontFamily: 'Cormorant Garamond',
                  color: '#d4af37',
                  textAlign: 'center',
                  fontWeight: '300',
                  lineHeight: 1.6,
                  letterSpacing: '1px',
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1.5,
                  delay: 0.3,
                },
              },
              {
                id: 'names-4',
                type: 'text',
                content: 'Selin & Burak',
                position: { x: 50, y: 40 },
                style: {
                  fontSize: 96,
                  fontFamily: 'Allura',
                  color: '#ffd700',
                  textAlign: 'center',
                  fontWeight: '400',
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                },
                animation: {
                  type: 'zoomIn',
                  duration: 2,
                  delay: 0.6,
                },
              },
              {
                id: 'divider-gold',
                type: 'image',
                src: '/templates/gold-divider.png',
                position: { x: 50, y: 55 },
                size: { width: 400, height: 50 },
                animation: {
                  type: 'fadeIn',
                  duration: 1.5,
                  delay: 1,
                },
              },
              {
                id: 'date-4',
                type: 'text',
                content: '20 Ağustos 2024',
                position: { x: 50, y: 65 },
                style: {
                  fontSize: 42,
                  fontFamily: 'Cormorant Garamond',
                  color: '#d4af37',
                  textAlign: 'center',
                  fontWeight: '600',
                  letterSpacing: '3px',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.3,
                },
              },
              {
                id: 'time-4',
                type: 'text',
                content: 'Saat: 18:30',
                position: { x: 50, y: 72 },
                style: {
                  fontSize: 28,
                  fontFamily: 'Montserrat',
                  color: '#c9a961',
                  textAlign: 'center',
                  fontWeight: '300',
                  letterSpacing: '2px',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.5,
                },
              },
              {
                id: 'venue-4',
                type: 'text',
                content: 'CVK Park Bosphorus Hotel\nNişantaşı / İstanbul',
                position: { x: 50, y: 82 },
                style: {
                  fontSize: 32,
                  fontFamily: 'Cormorant Garamond',
                  color: '#d4af37',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.6,
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.7,
                },
              },
              {
                id: 'ornament-bottom',
                type: 'image',
                src: '/templates/gold-ornament-bottom.png',
                position: { x: 50, y: 95 },
                size: { width: 300, height: 100 },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.5,
                  delay: 2,
                },
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Boho Chic - Kır Düğünü',
      description: 'Doğal ve rustik tasarım. Kır düğünleri için mükemmel. Soft animasyonlar ile.',
      price: 99.99,
      isPremium: true,
      categorySlug: 'dugun',
      thumbnail: '/templates/boho-chic-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'image',
              src: '/templates/linen-texture.jpg',
              opacity: 0.9,
            },
            elements: [
              {
                id: 'floral-wreath',
                type: 'image',
                src: '/templates/boho-wreath.png',
                position: { x: 50, y: 30 },
                size: { width: 400, height: 400 },
                animation: {
                  type: 'rotateIn',
                  duration: 2,
                  delay: 0,
                },
              },
              {
                id: 'names-5',
                type: 'text',
                content: 'Deniz\n&\nCan',
                position: { x: 50, y: 40 },
                style: {
                  fontSize: 72,
                  fontFamily: 'Satisfy',
                  color: '#5d4037',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.3,
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1.5,
                  delay: 0.5,
                },
              },
              {
                id: 'subtitle-5',
                type: 'text',
                content: 'Kır Düğünümüze Bekliyoruz',
                position: { x: 50, y: 65 },
                style: {
                  fontSize: 28,
                  fontFamily: 'Lato',
                  color: '#6d4c41',
                  textAlign: 'center',
                  fontWeight: '300',
                  fontStyle: 'italic',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1,
                },
              },
              {
                id: 'date-5',
                type: 'text',
                content: '5 Eylül 2024',
                position: { x: 50, y: 75 },
                style: {
                  fontSize: 38,
                  fontFamily: 'Lora',
                  color: '#4e342e',
                  textAlign: 'center',
                  fontWeight: '600',
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.3,
                },
              },
              {
                id: 'venue-5',
                type: 'text',
                content: 'Ağva Kır Bahçesi\nŞile / İstanbul',
                position: { x: 50, y: 85 },
                style: {
                  fontSize: 26,
                  fontFamily: 'Lato',
                  color: '#5d4037',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.6,
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.6,
                },
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Pastel Dreams - Baby Shower',
      description: 'Pastel renkler ve sevimli tasarım. Baby shower partileri için ideal.',
      price: 79.99,
      isPremium: true,
      categorySlug: 'baby-shower',
      thumbnail: '/templates/pastel-dreams-thumb.jpg',
      elements: {
        version: '1.0',
        pages: [
          {
            pageNumber: 1,
            background: {
              type: 'gradient',
              colors: ['#ffeaa7', '#fab1a0', '#fd79a8'],
              direction: '135deg',
            },
            elements: [
              {
                id: 'cloud-1',
                type: 'image',
                src: '/templates/cloud-pink.png',
                position: { x: 10, y: 10 },
                size: { width: 120, height: 80 },
                animation: {
                  type: 'fadeInLeft',
                  duration: 1.5,
                  delay: 0,
                },
              },
              {
                id: 'cloud-2',
                type: 'image',
                src: '/templates/cloud-blue.png',
                position: { x: 85, y: 15 },
                size: { width: 100, height: 70 },
                animation: {
                  type: 'fadeInRight',
                  duration: 1.5,
                  delay: 0.2,
                },
              },
              {
                id: 'title-6',
                type: 'text',
                content: '🍼 Baby Shower 🍼',
                position: { x: 50, y: 25 },
                style: {
                  fontSize: 48,
                  fontFamily: 'Quicksand',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                },
                animation: {
                  type: 'bounceIn',
                  duration: 1.5,
                  delay: 0.4,
                },
              },
              {
                id: 'baby-name',
                type: 'text',
                content: 'Zeynep\'in\nBebeği Geliyor! 👶',
                position: { x: 50, y: 45 },
                style: {
                  fontSize: 52,
                  fontFamily: 'Pacifico',
                  color: '#ff6b9d',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.4,
                  textShadow: '2px 2px 4px rgba(255,255,255,0.5)',
                },
                animation: {
                  type: 'zoomIn',
                  duration: 1.5,
                  delay: 0.7,
                },
              },
              {
                id: 'stork',
                type: 'image',
                src: '/templates/stork.png',
                position: { x: 50, y: 65 },
                size: { width: 200, height: 180 },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.5,
                  delay: 1,
                },
              },
              {
                id: 'date-6',
                type: 'text',
                content: '25 Mayıs 2024\nSaat: 14:00',
                position: { x: 50, y: 82 },
                style: {
                  fontSize: 32,
                  fontFamily: 'Quicksand',
                  color: '#6c5ce7',
                  textAlign: 'center',
                  fontWeight: '600',
                  lineHeight: 1.5,
                },
                animation: {
                  type: 'fadeInUp',
                  duration: 1.2,
                  delay: 1.3,
                },
              },
              {
                id: 'venue-6',
                type: 'text',
                content: 'Cafe Mocha\nBebek / İstanbul',
                position: { x: 50, y: 92 },
                style: {
                  fontSize: 26,
                  fontFamily: 'Quicksand',
                  color: '#a29bfe',
                  textAlign: 'center',
                  fontWeight: '500',
                  lineHeight: 1.5,
                },
                animation: {
                  type: 'fadeIn',
                  duration: 1,
                  delay: 1.6,
                },
              },
            ],
          },
        ],
      },
    },
  ];

  // Şablonları oluştur
  for (const template of templates) {
    const category = createdCategories[template.categorySlug];
    const { categorySlug, ...templateData } = template;

    const created = await prisma.template.upsert({
      where: { 
        id: `template-${template.title.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        ...templateData,
        creatorId: admin.id,
        categoryId: category.id,
      },
    });

    console.log('Şablon oluşturuldu:', created.title);
  }

  console.log('Veritabanı seeding tamamlandı! ✅');
}

main()
  .catch((e) => {
    console.error('Seeding hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
