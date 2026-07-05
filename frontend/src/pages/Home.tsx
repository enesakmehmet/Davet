import { useState, useEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Clock, MapPin, MailOpen, Music, Image as ImageIcon,
  LayoutTemplate, CreditCard, Share2, Check, ChevronDown, Star, Heart,
  Globe, Lock, Link2, QrCode, Eye, Bell
} from 'lucide-react';
import { api } from '../services/api';
import './Home.css';

const PRICE = '59,90';
const FREE = true; // Şu an tüm davetler ücretsiz

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

type Category = 'dugun' | 'kina' | 'dogumgunu' | 'kutlama';
type RsvpPhase = 'idle' | 'asking' | 'tapped' | 'thanked';
const RSVP_ORDER: RsvpPhase[] = ['idle', 'asking', 'tapped', 'thanked'];
const RSVP_TIMING: Record<RsvpPhase, number> = { idle: 1400, asking: 1600, tapped: 500, thanked: 2000 };

const CATEGORY_LABEL: Record<Category, string> = {
  dugun: '💍 Düğün',
  kina: '🕌 Kına Gecesi',
  dogumgunu: '🎂 Doğum Günü',
  kutlama: '🎉 Kutlama',
};

const CATEGORY_PRETITLE: Record<Category, string> = {
  dugun: 'AİLELERİYLE BİRLİKTE',
  kina: 'KINA GECESİNE DAVETLİSİNİZ',
  dogumgunu: 'DOĞUM GÜNÜ KUTLAMASI',
  kutlama: 'BİRLİKTE KUTLAYALIM',
};

const SHOWCASE: { key: string; name: string; g: string; font: string; accent: string; couple: string; date: string; targetDate: string; category: Category }[] = [
  { key: 'altin', name: 'Zarif Altın', g: 'linear-gradient(150deg,#9c7a31,#e8d6a8)', font: 'Great Vibes', accent: '#9c7a31', couple: 'Zeynep & Ahmet', date: '12 EYLÜL 2026', targetDate: '2026-09-12T18:00:00+03:00', category: 'dugun' },
  { key: 'gul', name: 'Romantik Gül', g: 'linear-gradient(150deg,#b35a72,#f6dbe2)', font: 'Parisienne', accent: '#b35a72', couple: 'Elif & Burak', date: '3 EKİM 2026', targetDate: '2026-10-03T18:00:00+03:00', category: 'dugun' },
  { key: 'kina', name: 'Kına Gecesi', g: 'linear-gradient(150deg,#8a3a1c,#e8b98a)', font: 'Dancing Script', accent: '#8a3a1c', couple: "Selin'in Kınası", date: '20 AĞUSTOS 2026', targetDate: '2026-08-20T19:00:00+03:00', category: 'kina' },
  { key: 'lacivert', name: 'Lacivert Gece', g: 'linear-gradient(150deg,#0e1a33,#c9a14e)', font: 'Allura', accent: '#9c7a31', couple: 'Naz & Mert', date: '9 MAYIS 2027', targetDate: '2027-05-09T18:00:00+03:00', category: 'dugun' },
  { key: 'konfeti', name: 'Konfeti Şenlik', g: 'linear-gradient(150deg,#ff7a59,#ffd166)', font: 'Pacifico', accent: '#d6336c', couple: 'Mira • 7 Yaş', date: '2 AĞUSTOS 2026', targetDate: '2026-08-02T16:00:00+03:00', category: 'dogumgunu' },
  { key: 'tropikal', name: 'Tropikal', g: 'linear-gradient(150deg,#136443,#2aa56c)', font: 'Caveat', accent: '#136443', couple: 'Sıla & Efe', date: '5 EYLÜL 2026', targetDate: '2026-09-05T18:00:00+03:00', category: 'dugun' },
  { key: 'havaifisek', name: 'Gece Havai Fişek', g: 'linear-gradient(150deg,#1b1035,#ffd166)', font: 'Pacifico', accent: '#e8a53d', couple: 'Yeni Yıl Kutlaması', date: '31 ARALIK 2026', targetDate: '2026-12-31T20:00:00+03:00', category: 'kutlama' },
  { key: 'sonbahar', name: 'Sonbahar', g: 'linear-gradient(150deg,#8a3d1c,#ecd9bf)', font: 'Petit Formal Script', accent: '#8a3d1c', couple: 'Yağmur & Berk', date: '17 EKİM 2026', targetDate: '2026-10-17T18:00:00+03:00', category: 'dugun' },
  { key: 'lavanta', name: 'Lavanta Bahçe', g: 'linear-gradient(150deg,#6f54a0,#e3d6f3)', font: 'Sacramento', accent: '#6f54a0', couple: 'İrem & Can', date: '6 HAZİRAN 2027', targetDate: '2027-06-06T18:00:00+03:00', category: 'dugun' },
];

const Home = () => {
  // Hero telefon önizlemesi, hazır temalardan birini gösterir ve 10 saniyede bir değişir
  const [scIdx, setScIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScIdx((i) => (i + 1) % SHOWCASE.length), 10000);
    return () => clearInterval(id);
  }, []);
  const current = SHOWCASE[scIdx];
  const nameParts = current.couple.split(' & ');
  const isCouple = nameParts.length === 2;

  // Gerçek kullanım sayıları (kimlik doğrulama gerektirmeyen genel istatistik) — sahte sayı yok
  const [publicStats, setPublicStats] = useState<{ totalInvitations: number; totalGuests: number } | null>(null);
  useEffect(() => {
    api.get('/stats/public').then(({ data }) => setPublicStats(data)).catch(() => {});
  }, []);

  // Görünen SSS ile Google için FAQPage yapılandırılmış verisi aynı tek kaynaktan gelsin
  const faqs = [
    { q: 'Ücretli mi?', a: FREE ? 'Şu an lansmana özel olarak tüm davetler ve tüm özellikler tamamen ücretsiz. Abonelik veya gizli ücret yok.' : `Abonelik yok. Her davet için tek seferlik ${PRICE} ₺ ödersiniz. Oluşturduğunuz davet size aittir.` },
    { q: 'Ödeme sonrası değişiklik yapabilir miyim?', a: 'Evet. Davetiniz yayında olduğu sürece editör üzerinden çift adı, tarih, mekan, fotoğraf ve diğer her şeyi sınırsızca güncelleyebilirsiniz.' },
    { q: 'Misafirlerim üye olmak zorunda mı?', a: 'Hayır. Misafirleriniz linke tıklayıp hiçbir üyelik olmadan saniyeler içinde RSVP yapar ve yol tarifi alır.' },
    { q: 'Davet ne kadar süre yayında kalır?', a: 'Satın alımdan itibaren 1 yıl yayında kalır. Düğün tarihiniz için fazlasıyla yeterlidir.' },
    { q: 'Mobil uyumlu mu?', a: "Evet, davetler öncelikli olarak telefon için tasarlandı; WhatsApp'tan açıldığında kusursuz görünür." },
    { q: 'Sadece düğün için mi kullanılabilir?', a: 'Hayır. Düğün dışında kına gecesi, doğum günü ve genel kutlama daveti olarak da kullanılabilir; her biri için hazır temalar mevcuttur.' },
  ];

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div className="hero-content" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="badge">{FREE ? '🎉 Tüm davetler şu an ÜCRETSİZ' : `Tek davet · ${PRICE} ₺ · Abonelik yok`}</motion.div>
            <motion.h1 variants={fadeIn} className="hero-title">
              Özel gününüzü <span className="text-gold">dakikalar</span> içinde davete dönüştürün.
            </motion.h1>
            <motion.p variants={fadeIn} className="hero-subtitle">
              Düğün, kına gecesi, doğum günü veya özel kutlamalarınız için animasyonlu, mobil uyumlu
              dijital davetiye. Canlı geri sayım, Google harita, katılım bildirimi (RSVP), arka plan
              müziği ve fotoğraf galerisi — hepsi tek bir linkte.
            </motion.p>
            <motion.div variants={fadeIn} className="hero-occasions">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <span key={c} className="occasion-pill">{CATEGORY_LABEL[c]}</span>
              ))}
            </motion.div>
            <motion.div variants={fadeIn} className="hero-actions">
              <Link to="/editor" className="btn-primary-large">Hemen Tasarla</Link>
              <a href="/davet-preview.html" target="_blank" rel="noreferrer" className="btn-outline-large">▶ Örnek Daveti Aç</a>
            </motion.div>
            <motion.p variants={fadeIn} className="hero-trust">
              <Check size={15} /> {FREE ? 'Şu an tamamen ücretsiz' : `Davet başına tek seferlik ${PRICE} ₺`} &nbsp;·&nbsp; anında teslim &nbsp;·&nbsp; sınırsız düzenleme
            </motion.p>
          </motion.div>

          <motion.div className="hero-visuals" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }}>
            <div className="mockup-frame">
              <div className="mockup-screen">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    className="mockup-fade"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' as const }}
                  >
                    <MockPhonePreview theme={current} isCouple={isCouple} nameParts={nameParts} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <motion.div className="floating-card c-1" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' as const }}>
              <Clock size={20} className="text-gold" />
              <div><h4>Canlı Geri Sayım</h4><p>Saniye saniye</p></div>
            </motion.div>
            <motion.div className="floating-card c-2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' as const }}>
              <MapPin size={20} className="text-gold" />
              <div><h4>Harita & Yol Tarifi</h4><p>Tek tıkla</p></div>
            </motion.div>
            <motion.div className="floating-card c-3" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' as const }}>
              <Heart size={20} className="text-gold" />
              <div><h4>RSVP</h4><p>Katılımı topla</p></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== ÖZELLİK PİLLERİ ===== */}
      <div className="pill-strip">
        <div className="container pill-row">
          <span>✦ Animasyonlu</span><span>✦ Mobil uyumlu</span><span>✦ Geri sayım</span>
          <span>✦ Google harita</span><span>✦ RSVP</span><span>✦ Arka plan müziği</span><span>✦ Fotoğraf galerisi</span>
          <span>✦ Çoklu dil (TR/EN/DE)</span><span>✦ Şifre koruması</span><span>✦ Özel bağlantı</span>
          <span>✦ QR kod</span><span>✦ Görselli link önizleme</span><span>✦ Bildirimler</span>
        </div>
      </div>

      {/* ===== İSTATİSTİK ŞERİDİ ===== */}
      <section className="stats-band">
        <motion.div className="container stats-row" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {[
            // Yeterli veri birikene kadar (ör. ilk haftalarda) sahte/boş görünmesin diye eşik konuldu
            publicStats && publicStats.totalInvitations >= 20
              ? { b: `${publicStats.totalInvitations}+`, s: 'Oluşturulan Davet' }
              : { b: '21+', s: 'Hazır Tema' },
            { b: '%100', s: 'Mobil Uyumlu' },
            { b: '~3 dk', s: 'Hazır Olur' },
            { b: 'Ücretsiz', s: 'Tüm Özellikler' },
          ].map((x, i) => (
            <motion.div key={i} className="stat-item" variants={fadeIn}>
              <b>{x.b}</b><span>{x.s}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== ÖZELLİKLER ===== */}
      <section className="features-section bg-light">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2>Her davette olması gereken her şey</h2>
            <p>{FREE ? 'Ek paket yok, her özellik dahil ve ücretsiz. Daveti oluştur, paylaş.' : `Ek paket yok, her özellik dahil. Daveti oluştur, ${PRICE} ₺ öde, paylaş.`}</p>
          </motion.div>

          <motion.div className="features-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <Feature icon={<Sparkles size={28} />} title="Animasyonlu Tasarım" desc="Akıcı geçişler ve zarif giriş animasyonlarıyla davetiniz bir uygulama gibi açılır." />
            <Feature icon={<Clock size={28} />} title="Canlı Geri Sayım" desc="Büyük güne kalan gün, saat, dakika ve saniye otomatik sayılır." />
            <Feature icon={<MapPin size={28} />} title="Google Harita" desc="Mekan haritada gösterilir; misafirler tek tıkla yol tarifi alır." />
            <Feature icon={<MailOpen size={28} />} title="RSVP (Katılım)" desc="Katılıyorum / katılamıyorum yanıtları toplanır, panelinizde listelenir." />
            <Feature icon={<Music size={28} />} title="Arka Plan Müziği" desc="İsteğe bağlı yumuşak bir melodi; misafir dokununca çalar." />
            <Feature icon={<ImageIcon size={28} />} title="Fotoğraf Galerisi" desc="Çift fotoğraflarınızı otomatik dönen şık bir slaytta sergileyin." />
            <Feature icon={<Globe size={28} />} title="Çoklu Dil" desc="Davetiniz Türkçe, İngilizce ve Almanca dillerinde misafirlerinize sunulur." />
            <Feature icon={<Lock size={28} />} title="Şifre Koruması" desc="İsterseniz davetinizi şifreyle koruyun; yalnızca linki ve şifreyi bilenler görsün." />
            <Feature icon={<Link2 size={28} />} title="Özel Bağlantı" desc="benimdavetim.com/davet/senin-linkin gibi kendi seçtiğiniz özel bir bağlantı adresi alın." />
            <Feature icon={<QrCode size={28} />} title="QR Kod" desc="Daveti anında QR koda dönüştürün; baskı davetiyeye veya panoya ekleyin." />
            <Feature icon={<Eye size={28} />} title="Görselli Link Önizleme" desc="WhatsApp'ta paylaştığınızda davetiniz görselli, şık bir link kartı olarak görünür." />
            <Feature icon={<Bell size={28} />} title="Bildirimler" desc="Yeni bir RSVP yanıtı geldiğinde anında bildirim alırsınız, hiçbir yanıtı kaçırmazsınız." />
          </motion.div>
        </div>
      </section>

      {/* ===== NASIL ÇALIŞIR ===== */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>3 adımda hazır</h2>
            <p>Tasarım bilgisi gerekmez.</p>
          </div>
          <div className="steps-grid">
            <Step n="1" icon={<LayoutTemplate size={26} />} title="Tasarla" desc="Bir tema seç, çift adı, tarih, mekan, fotoğraf ve hikayeni gir. Önizleme anında güncellenir." />
            <Step n="2" icon={<CreditCard size={26} />} title={FREE ? 'Ücretsiz al' : 'Satın al'} desc={FREE ? 'Şu an tüm davetler ücretsiz. Abonelik, gizli ücret veya yenileme yok.' : `Sadece o davet için tek seferlik ${PRICE} ₺ öde. Abonelik, gizli ücret veya yenileme yok.`} />
            <Step n="3" icon={<Share2 size={26} />} title="Paylaş" desc="Özel linkini WhatsApp'tan gönder. Misafirler açar, RSVP yapar, yol tarifi alır." />
          </div>
        </div>
      </section>

      {/* ===== ŞABLON VİTRİNİ ===== */}
      <section className="showcase-section bg-light">
        <div className="container text-center">
          <div className="section-header">
            <h2>Düğün, kına, doğum günü ve kutlama için birbirinden farklı temalar</h2>
            <p>Hangi anınız için olursa olsun, onlarca hazır tasarımdan birini seç ve kendine göre özelleştir.</p>
          </div>
          <div className="showcase-grid">
            {SHOWCASE.map((t) => {
              const parts = t.couple.split(' & ');
              return (
                <Link key={t.key} to={`/editor?theme=${t.key}`} className="sc-card" style={{ background: t.g }}>
                  <span className="sc-tag">{CATEGORY_LABEL[t.category]}</span>
                  <div className="sc-invite">
                    <span className="sc-eyebrow">{t.category === 'dugun' ? 'EVLENİYORUZ' : CATEGORY_PRETITLE[t.category]}</span>
                    <span className="sc-couple" style={{ fontFamily: `'${t.font}', cursive`, color: t.accent }}>
                      {parts.length === 2 ? <>{parts[0]} &amp; {parts[1]}</> : parts[0]}
                    </span>
                    <span className="sc-div" style={{ background: t.accent }} />
                    <span className="sc-date">{t.date}</span>
                  </div>
                  <span className="sc-name">{t.name}</span>
                </Link>
              );
            })}
          </div>
          <Link to="/templates" className="btn-outline-large" style={{ marginTop: 40, display: 'inline-block' }}>Tüm Şablonları Gör →</Link>
        </div>
      </section>

      {/* ===== FİYAT (TEK) ===== */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>{FREE ? 'Şu an tamamen ücretsiz' : `Basit fiyat: davet başına ${PRICE} ₺`}</h2>
            <p>{FREE ? 'Lansmana özel: tüm davetler ve tüm özellikler ücretsiz. Paket yok, abonelik yok.' : 'Paket yok, abonelik yok. Sadece oluşturduğun davet için ödersin.'}</p>
          </div>

          <motion.div className="single-price" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <div className="sp-left">
              <span className="sp-tag">{FREE ? 'Lansmana özel' : 'Tek seferlik'}</span>
              <div className="sp-amount">{FREE ? 'Ücretsiz' : <><span className="sp-cur">₺</span>{PRICE}</>}</div>
              <p className="sp-note">{FREE ? 'tüm özellikler dahil · ömür boyu sana ait' : 'davet başına · ömür boyu sana ait'}</p>
              <Link to="/editor" className="btn-primary-large" style={{ marginTop: 20, display: 'inline-block' }}>Davetini Oluştur</Link>
            </div>
            <div className="sp-right">
              <p className="sp-inc">Dahil olan her şey</p>
              <ul className="sp-features">
                {[
                  'Tüm animasyonlu temalar',
                  'Canlı geri sayım sayacı',
                  'Google harita + yol tarifi',
                  'Sınırsız RSVP (katılım) toplama',
                  'Arka plan müziği',
                  'Fotoğraf galerisi',
                  'Hikayemiz & aile isimleri',
                  'Takvime ekle & paylaş',
                  '1 yıl yayında + sınırsız düzenleme',
                ].map((f, i) => (<li key={i}><Check size={16} className="text-gold" /> {f}</li>))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== YORUMLAR ===== */}
      <section className="reviews-section bg-light">
        <div className="container text-center">
          <div className="section-header">
            <h2>Kullananların yorumları</h2>
            {publicStats && publicStats.totalInvitations >= 20 && (
              <p>Şimdiye kadar {publicStats.totalInvitations}+ davet oluşturuldu, {publicStats.totalGuests}+ RSVP yanıtı toplandı.</p>
            )}
          </div>
          <div className="reviews-grid">
            <Review name="Aylin & Can · Düğün" text="Üstelik ücretsiz! Bu kadar şık bir davet beklemiyorduk. Misafirler bayıldı." />
            <Review name="Zeynep & Murat · Düğün" text="Geri sayım ve harita çok hoş. Linki WhatsApp'tan attık, RSVP'ler panele düştü." />
            <Review name="Selin'in Ailesi · Kına" text="Kına gecemiz için özel bir tema bulduk, misafirler linkten kolayca yol tarifi aldı." />
            <Review name="Ayşe Hanım · Doğum Günü" text="Oğlumun doğum günü daveti için hazırladım, herkes animasyonlu geri sayıma bayıldı." />
            <Review name="Burak K. · Kutlama" text="Yeni yıl daveti için kullandık, QR kod ve şifre koruması çok işime yaradı." />
            <Review name="Elif & Burak · Düğün" text="Abonelik derdi yok, ücretsiz. Tasarımı dakikalar içinde bitirdik." />
          </div>
        </div>
      </section>

      {/* ===== SSS ===== */}
      <section className="faq-section">
        <div className="container faq-container">
          <div className="section-header text-center"><h2>Sıkça Sorulan Sorular</h2></div>
          <div className="faq-list">
            {faqs.map((f, i) => <Faq key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
        {/* Google için FAQPage yapılandırılmış verisi (soru-cevaplar görünen SSS ile aynı kaynaktan) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      </section>

      {/* ===== SON CTA ===== */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Hayalinizdeki daveti bugün oluşturun</h2>
          <p>{FREE ? 'Şu an tamamen ücretsiz — dakikalar içinde hazır.' : `Sadece ${PRICE} ₺ — dakikalar içinde hazır.`}</p>
          <Link to="/editor" className="btn-primary-large btn-on-dark">Ücretsiz Tasarlamaya Başla</Link>
          <span className="cta-mini">{FREE ? 'Tamamen ücretsiz · saniyeler içinde paylaş' : 'Tasarım ücretsiz · yalnızca yayınlarken ödersin'}</span>
        </div>
      </section>

      {/* ===== E-POSTA BIRAK ===== */}
      <section className="lead-section bg-light">
        <div className="container">
          <LeadCapture />
        </div>
      </section>
    </div>
  );
};

/* Henüz tasarlamaya hazır olmayan ziyaretçi için e-posta bırakma bloğu */
const LeadCapture = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await api.post('/leads', { email: email.trim(), source: 'homepage-cta' });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="lead-box lead-done">
        <Check size={20} className="text-gold" />
        <p>Teşekkürler! Hazır olduğunda seni haberdar edeceğiz.</p>
      </div>
    );
  }

  return (
    <div className="lead-box">
      <div>
        <h3>Henüz tasarlamaya hazır değil misin?</h3>
        <p>E-postanı bırak, yeni temalar ve ipuçlarından haberdar olalım — spam yok.</p>
      </div>
      <form className="lead-form" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="e-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-primary-large" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Gönderiliyor…' : 'Haberdar Et'}
        </button>
      </form>
      {status === 'error' && <p className="lead-error">Bir şeyler ters gitti, tekrar dener misin?</p>}
    </div>
  );
};

/**
 * Hero telefon mockup'ı — sadece üst kısmı (başlık/geri sayım/RSVP) göstermekle kalmaz,
 * her tema döngüsünde otomatik olarak aşağı kayıp galeri/müzik/harita bölümlerini de gösterir,
 * sonra tekrar yukarı çıkar. Gerçek scroll yüksekliği JS ile ölçülür (temaya göre metin
 * uzunluğu değişebildiği için sabit piksel yerine dinamik hesap kullanılır).
 */
const MockPhonePreview = ({
  theme,
  isCouple,
  nameParts,
}: {
  theme: (typeof SHOWCASE)[number];
  isCouple: boolean;
  nameParts: string[];
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [viewportH, setViewportH] = useState(560);
  const [scrollDist, setScrollDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const inner = innerRef.current;
      if (!vp || !inner) return;
      setViewportH(vp.clientHeight);
      const diff = inner.scrollHeight - vp.clientHeight;
      setScrollDist(diff > 0 ? diff : 0);
    };
    const id = setTimeout(measure, 60);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(id); window.removeEventListener('resize', measure); };
  }, [theme.key]);

  return (
    <div
      className="mockup-invitation"
      ref={viewportRef}
      style={{ '--mock-accent': theme.accent, '--mock-font': `'${theme.font}', cursive` } as CSSProperties}
    >
      <motion.div
        className="mockup-scroll-inner"
        ref={innerRef}
        animate={scrollDist > 0 ? { y: [0, 0, -scrollDist, -scrollDist, 0] } : { y: 0 }}
        transition={{ duration: 8.6, times: [0, 0.3, 0.55, 0.85, 1], ease: 'easeInOut' as const }}
      >
        <div className="m-page m-page-hero" style={{ minHeight: viewportH }}>
          <p className="m-pretitle">{CATEGORY_PRETITLE[theme.category]}</p>
          <h2 className="m-title">
            {isCouple ? (<>{nameParts[0]}<span>&amp;</span>{nameParts[1]}</>) : nameParts[0]}
          </h2>
          <div className="m-rule" />
          <p className="m-date">{theme.date}</p>
          <MockCountdown target={theme.targetDate} />
          <MockRsvpDemo />
        </div>
        <div className="m-page m-page-extra">
          <p className="m-extra-label">Fotoğraf Galerisi</p>
          <div className="m-gallery">
            <span className="m-thumb"><ImageIcon size={18} /></span>
            <span className="m-thumb"><ImageIcon size={18} /></span>
            <span className="m-thumb"><ImageIcon size={18} /></span>
          </div>
          <div className="m-music">
            <span className="m-music-icon"><Music size={12} /></span>
            <span className="m-music-bars"><i /><i /><i /><i /><i /></span>
            <span className="m-music-label">Arka Plan Müziği</span>
          </div>
          <div className="m-map">
            <MapPin size={16} />
            <span>Yol Tarifi Al</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* Hero telefon mockup'ındaki canlı geri sayım — her rotasyonda ilgili temanın tarihine göre sayar */
const MockCountdown = ({ target }: { target: string }) => {
  const calc = () => {
    let diff = new Date(target).getTime() - Date.now();
    if (diff < 0) diff = 0;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc());
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return (
    <div className="m-countdown">
      <span><b>{pad(t.d)}</b>gün</span>
      <span><b>{pad(t.h)}</b>saat</span>
      <span><b>{pad(t.m)}</b>dk</span>
      <span><b>{pad(t.s)}</b>sn</span>
    </div>
  );
};

/* Hero telefon mockup'ında döngüyle oynayan, "canlı" hissi veren mini RSVP demosu (gerçek video yerine) */
const MockRsvpDemo = () => {
  const [phase, setPhase] = useState<RsvpPhase>('idle');
  useEffect(() => {
    const timer = setTimeout(() => {
      const i = RSVP_ORDER.indexOf(phase);
      setPhase(RSVP_ORDER[(i + 1) % RSVP_ORDER.length]);
    }, RSVP_TIMING[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="m-rsvp-demo">
      <AnimatePresence mode="wait">
        {phase === 'asking' && (
          <motion.div key="asking" className="m-rsvp-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            <span>Katılacak mısınız?</span>
            <span className="m-rsvp-btn">Katılıyorum</span>
          </motion.div>
        )}
        {phase === 'tapped' && (
          <motion.div key="tapped" className="m-rsvp-card" initial={{ scale: 1 }} animate={{ scale: [1, 0.9, 1] }} transition={{ duration: 0.4 }}>
            <span>Katılacak mısınız?</span>
            <span className="m-rsvp-btn active">Katılıyorum ✓</span>
          </motion.div>
        )}
        {phase === 'thanked' && (
          <motion.div key="thanked" className="m-rsvp-thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <Check size={14} /> Katılımınız alındı!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) => (
  <motion.div variants={fadeIn} className="f-card">
    <div className="f-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </motion.div>
);

const Step = ({ n, icon, title, desc }: { n: string; icon: ReactNode; title: string; desc: string }) => (
  <div className="step-card">
    <div className="step-top"><span className="step-n">{n}</span><span className="step-icon">{icon}</span></div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Review = ({ name, text }: { name: string; text: string }) => (
  <div className="r-card">
    <div className="stars">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" size={16} />)}
    </div>
    <p>"{text}"</p>
    <h4>{name}</h4>
  </div>
);

const Faq = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-q"><h4>{q}</h4><ChevronDown className={`faq-icon ${open ? 'open' : ''}`} /></div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="faq-a">
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
