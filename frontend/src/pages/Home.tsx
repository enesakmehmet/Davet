import { useState, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Clock, MapPin, MailOpen, Music, Image as ImageIcon,
  LayoutTemplate, CreditCard, Share2, Check, ChevronDown, Star, Heart
} from 'lucide-react';
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

const SHOWCASE = [
  { key: 'altin', name: 'Zarif Altın', g: 'linear-gradient(150deg,#9c7a31,#e8d6a8)', font: 'Great Vibes', accent: '#9c7a31', couple: 'Zeynep & Ahmet', date: '12 EYLÜL 2026', targetDate: '2026-09-12T18:00:00+03:00' },
  { key: 'gul', name: 'Romantik Gül', g: 'linear-gradient(150deg,#b35a72,#f6dbe2)', font: 'Parisienne', accent: '#b35a72', couple: 'Elif & Burak', date: '3 EKİM 2026', targetDate: '2026-10-03T18:00:00+03:00' },
  { key: 'lacivert', name: 'Lacivert Gece', g: 'linear-gradient(150deg,#0e1a33,#c9a14e)', font: 'Allura', accent: '#9c7a31', couple: 'Naz & Mert', date: '9 MAYIS 2027', targetDate: '2027-05-09T18:00:00+03:00' },
  { key: 'tropikal', name: 'Tropikal', g: 'linear-gradient(150deg,#136443,#2aa56c)', font: 'Caveat', accent: '#136443', couple: 'Sıla & Efe', date: '5 EYLÜL 2026', targetDate: '2026-09-05T18:00:00+03:00' },
  { key: 'sonbahar', name: 'Sonbahar', g: 'linear-gradient(150deg,#8a3d1c,#ecd9bf)', font: 'Petit Formal Script', accent: '#8a3d1c', couple: 'Yağmur & Berk', date: '17 EKİM 2026', targetDate: '2026-10-17T18:00:00+03:00' },
  { key: 'lavanta', name: 'Lavanta Bahçe', g: 'linear-gradient(150deg,#6f54a0,#e3d6f3)', font: 'Sacramento', accent: '#6f54a0', couple: 'İrem & Can', date: '6 HAZİRAN 2027', targetDate: '2027-06-06T18:00:00+03:00' },
];

const Home = () => {
  // Hero telefon önizlemesi, hazır temalardan birini gösterir ve 10 saniyede bir değişir
  const [scIdx, setScIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScIdx((i) => (i + 1) % SHOWCASE.length), 10000);
    return () => clearInterval(id);
  }, []);
  const current = SHOWCASE[scIdx];
  const [firstName, secondName] = current.couple.split(' & ');

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div className="hero-content" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="badge">{FREE ? '🎉 Tüm davetler şu an ÜCRETSİZ' : `Tek davet · ${PRICE} ₺ · Abonelik yok`}</motion.div>
            <motion.h1 variants={fadeIn} className="hero-title">
              Düğün davetinizi <span className="text-gold">dakikalar</span> içinde tasarlayın.
            </motion.h1>
            <motion.p variants={fadeIn} className="hero-subtitle">
              Animasyonlu, mobil uyumlu dijital düğün davetiyesi. Canlı geri sayım, Google harita,
              katılım bildirimi (RSVP), arka plan müziği ve fotoğraf galerisi — hepsi tek bir linkte.
            </motion.p>
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
                    className="mockup-invitation"
                    style={{ '--mock-accent': current.accent, '--mock-font': `'${current.font}', cursive` } as CSSProperties}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' as const }}
                  >
                    <p className="m-pretitle">AİLELERİYLE BİRLİKTE</p>
                    <h2 className="m-title">{firstName}<span>&amp;</span>{secondName}</h2>
                    <div className="m-rule" />
                    <p className="m-date">{current.date}</p>
                    <MockCountdown target={current.targetDate} />
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
        </div>
      </div>

      {/* ===== İSTATİSTİK ŞERİDİ ===== */}
      <section className="stats-band">
        <motion.div className="container stats-row" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {[
            { b: '21+', s: 'Hazır Tema' },
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
            <h2>Birbirinden farklı temalar</h2>
            <p>Onlarca hazır tasarım; hepsini kendine göre özelleştir.</p>
          </div>
          <div className="showcase-grid">
            {SHOWCASE.map((t) => (
              <Link key={t.key} to={`/editor?theme=${t.key}`} className="sc-card" style={{ background: t.g }}>
                <div className="sc-invite">
                  <span className="sc-eyebrow">EVLENİYORUZ</span>
                  <span className="sc-couple" style={{ fontFamily: `'${t.font}', cursive`, color: t.accent }}>{t.couple}</span>
                  <span className="sc-div" style={{ background: t.accent }} />
                  <span className="sc-date">{t.date}</span>
                </div>
                <span className="sc-name">{t.name}</span>
              </Link>
            ))}
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
          <div className="section-header"><h2>Çiftlerin yorumları</h2></div>
          <div className="reviews-grid">
            <Review name="Aylin & Can" text="Üstelik ücretsiz! Bu kadar şık bir davet beklemiyorduk. Misafirler bayıldı." />
            <Review name="Zeynep & Murat" text="Geri sayım ve harita çok hoş. Linki WhatsApp'tan attık, RSVP'ler panele düştü." />
            <Review name="Elif & Burak" text="Abonelik derdi yok, ücretsiz. Tasarımı dakikalar içinde bitirdik." />
          </div>
        </div>
      </section>

      {/* ===== SSS ===== */}
      <section className="faq-section">
        <div className="container faq-container">
          <div className="section-header text-center"><h2>Sıkça Sorulan Sorular</h2></div>
          <div className="faq-list">
            <Faq q="Ücretli mi?" a={FREE ? 'Şu an lansmana özel olarak tüm davetler ve tüm özellikler tamamen ücretsiz. Abonelik veya gizli ücret yok.' : `Abonelik yok. Her davet için tek seferlik ${PRICE} ₺ ödersiniz. Oluşturduğunuz davet size aittir.`} />
            <Faq q="Ödeme sonrası değişiklik yapabilir miyim?" a="Evet. Davetiniz yayında olduğu sürece editör üzerinden çift adı, tarih, mekan, fotoğraf ve diğer her şeyi sınırsızca güncelleyebilirsiniz." />
            <Faq q="Misafirlerim üye olmak zorunda mı?" a="Hayır. Misafirleriniz linke tıklayıp hiçbir üyelik olmadan saniyeler içinde RSVP yapar ve yol tarifi alır." />
            <Faq q="Davet ne kadar süre yayında kalır?" a="Satın alımdan itibaren 1 yıl yayında kalır. Düğün tarihiniz için fazlasıyla yeterlidir." />
            <Faq q="Mobil uyumlu mu?" a="Evet, davetler öncelikli olarak telefon için tasarlandı; WhatsApp'tan açıldığında kusursuz görünür." />
          </div>
        </div>
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
