import { useState, useRef, useEffect } from 'react';
import { Search, Eye, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Templates.css';

/* Eleman görünür olunca true döner — ağır iframe önizlemelerini yalnızca
   karta scroll edildiğinde yüklemek için (sayfa açılışını hızlandırır). */
const useInView = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
};

/* Editor ve onizleme motorundaki temalarla birebir ayni anahtarlar */
const TEMPLATES = [
  // Düğün
  { key: 'altin', name: 'Zarif Altın', category: 'Düğün', c1: '#9c7a31', c2: '#e8d6a8', dark: false },
  { key: 'gul', name: 'Romantik Gül', category: 'Düğün', c1: '#b35a72', c2: '#f6dbe2', dark: false },
  { key: 'minimal', name: 'Modern Minimal', category: 'Düğün', c1: '#1a1a1a', c2: '#d8d8d8', dark: false },
  { key: 'bohem', name: 'Bohem Kır', category: 'Düğün', c1: '#5f7050', c2: '#cdbfa6', dark: false },
  { key: 'lacivert', name: 'Lacivert Gece', category: 'Düğün', c1: '#0e1a33', c2: '#c9a14e', dark: true },
  { key: 'lavanta', name: 'Lavanta Bahçe', category: 'Düğün', c1: '#6f54a0', c2: '#e3d6f3', dark: false },
  { key: 'sonbahar', name: 'Sonbahar', category: 'Düğün', c1: '#8a3d1c', c2: '#ecd9bf', dark: false },
  { key: 'deniz', name: 'Deniz Kıyısı', category: 'Düğün', c1: '#1c7484', c2: '#bfe6ec', dark: false },
  { key: 'tropikal', name: 'Tropikal', category: 'Düğün', c1: '#136443', c2: '#bfe6cf', dark: true },
  { key: 'havai', name: 'Gece Havai Fişek', category: 'Düğün', c1: '#070912', c2: '#cbab53', dark: true },
  { key: 'sinematik', name: 'Altın Sinematik', category: 'Düğün', c1: '#0b0b0d', c2: '#c9a14e', dark: true },
  { key: 'zumrut', name: 'Zümrüt Saray', category: 'Düğün', c1: '#0d3b2a', c2: '#d4b455', dark: true, isNew: true },
  { key: 'gececicek', name: 'Gece Çiçeği', category: 'Düğün', c1: '#2b0d1d', c2: '#e58bb1', dark: true, isNew: true },
  { key: 'pudra', name: 'Pudra Şıklığı', category: 'Düğün', c1: '#c07f6d', c2: '#f6e3da', dark: false, isNew: true },
  { key: 'yildizharitasi', name: 'Yıldız Haritası', category: 'Düğün', c1: '#080b18', c2: '#9bb8ff', dark: true, isNew: true },
  { key: 'gazete', name: 'Düğün Gazetesi', category: 'Düğün', c1: '#f6f2e6', c2: '#8a8578', dark: false, isNew: true },
  { key: 'biniskarti', name: 'Biniş Kartı', category: 'Düğün', c1: '#0e5a8a', c2: '#dce9f2', dark: true, isNew: true },
  { key: 'mumisigi', name: 'Mum Işığı', category: 'Düğün', c1: '#120a04', c2: '#e8b45a', dark: true, isNew: true },
  { key: 'sakurazen', name: 'Sakura Zen', category: 'Düğün', c1: '#c96f87', c2: '#faf7f4', dark: false, isNew: true },
  { key: 'askmektubu', name: 'Aşk Mektubu', category: 'Düğün', c1: '#8a5a3b', c2: '#f9f3e6', dark: false, isNew: true },
  { key: 'filmseridi', name: 'Film Şeridi', category: 'Düğün', c1: '#101010', c2: '#e8c15a', dark: true, isNew: true },
  { key: 'muze', name: 'Müze', category: 'Düğün', c1: '#7a6a4f', c2: '#f4f1ea', dark: false, isNew: true },
  { key: 'parsomen', name: 'Parşömen', category: 'Düğün', c1: '#7a4a1f', c2: '#f3e6c8', dark: false, isNew: true },
  { key: 'denizalti', name: 'Deniz Altı', category: 'Düğün', c1: '#062430', c2: '#5fd4d0', dark: true, isNew: true },
  { key: 'sinemaafisi', name: 'Sinema Afişi', category: 'Düğün', c1: '#0c0a08', c2: '#d4af37', dark: true, isNew: true },
  { key: 'kristal', name: 'Kristal', category: 'Düğün', c1: '#6f93c9', c2: '#f8fafd', dark: false, isNew: true },
  { key: 'pusula', name: 'Pusula & Seyahat', category: 'Düğün', c1: '#3d6b5c', c2: '#f2ead8', dark: false, isNew: true },
  { key: 'sato', name: 'Masal Şatosu', category: 'Düğün', c1: '#120c22', c2: '#c9a86e', dark: true, isNew: true },
  { key: 'notakagidi', name: 'Nota Kağıdı', category: 'Düğün', c1: '#4a4440', c2: '#faf7f0', dark: false, isNew: true },
  { key: 'gunbatimi', name: 'Gün Batımı Plajı', category: 'Düğün', c1: '#f2825e', c2: '#7a4a78', dark: false, isNew: true },
  { key: 'yagliboya', name: 'Yağlı Boya', category: 'Düğün', c1: '#8a4a5e', c2: '#f5efe4', dark: false, isNew: true },
  { key: 'ayna', name: 'Gümüş Ayna', category: 'Düğün', c1: '#7a8294', c2: '#f5f6f8', dark: false, isNew: true },
  // Dini Düğün
  { key: 'dini', name: 'Zarif Besmele', category: 'Dini Düğün', c1: '#b08a3e', c2: '#f0e2bd', dark: false, isNew: true },
  { key: 'diniYesil', name: 'Zümrüt Dua', category: 'Dini Düğün', c1: '#2e6b4f', c2: '#dcead9', dark: false, isNew: true },
  // Doğum Günü
  { key: 'balon', name: 'Renkli Balon', category: 'Doğum Günü', c1: '#e84393', c2: '#ffd6e8', dark: false },
  { key: 'konfeti', name: 'Konfeti Partisi', category: 'Doğum Günü', c1: '#120a24', c2: '#f5c542', dark: true },
  // Kutlama
  { key: 'kutlamaPop', name: 'Renkli Kutlama', category: 'Kutlama', c1: '#ff5e8a', c2: '#ffd1e0', dark: false },
  { key: 'kutlamaGece', name: 'Işıltılı Gece', category: 'Kutlama', c1: '#0f0a22', c2: '#ffd86b', dark: true },
  { key: 'kutlamaPastel', name: 'Pastel Kutlama', category: 'Kutlama', c1: '#7aa6b8', c2: '#d8ecf2', dark: false },
  { key: 'kutlamaAltin', name: 'Altın Zarafet', category: 'Kutlama', c1: '#b8923f', c2: '#ecd9a8', dark: false },
  { key: 'kutlamaCocuk', name: 'Çocuk Partisi', category: 'Kutlama', c1: '#ff7a3d', c2: '#ffe0b8', dark: false },
  { key: 'kutlamaDisko', name: 'Disko Gecesi', category: 'Kutlama', c1: '#0a0118', c2: '#ff2ec4', dark: true },
  { key: 'kutlamaNeon', name: 'Neon Parti', category: 'Kutlama', c1: '#0a0a1f', c2: '#00e5ff', dark: true, isNew: true },
  { key: 'kutlamaSakura', name: 'Bahar Çiçeği', category: 'Kutlama', c1: '#e77fa1', c2: '#fde9f1', dark: false, isNew: true },
  { key: 'kutlamaMasal', name: 'Masal Dünyası', category: 'Kutlama', c1: '#8f6fd6', c2: '#efe6ff', dark: false, isNew: true },
] as { key: string; name: string; category: string; c1: string; c2: string; dark: boolean; isNew?: boolean }[];

const CATEGORIES = ['Tümü', 'Düğün', 'Dini Düğün', 'Doğum Günü', 'Kutlama'];

const previewUrl = (key: string) => {
  const cfg = btoa(unescape(encodeURIComponent(JSON.stringify({ theme: key }))));
  return `/davet-preview.html#cfg=${cfg}`;
};

/** Kart içi küçük önizleme: thumb=1 → müzik otomatik çalmaz, intro/parallax kapalı (bkz. davet-preview.html isThumb). */
const thumbPreviewUrl = (key: string) => {
  const cfg = btoa(unescape(encodeURIComponent(JSON.stringify({ theme: key }))));
  return `/davet-preview.html?thumb=1#cfg=${cfg}`;
};

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTpl, setPreviewTpl] = useState<(typeof TEMPLATES)[number] | null>(null);

  const filtered = TEMPLATES.filter((tpl) => {
    const matchesCategory = activeCategory === 'Tümü' || tpl.category === activeCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="templates-page">
      <div className="container">
        <motion.div
          className="templates-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge" style={{ marginBottom: '16px' }}>Koleksiyon</div>
          <h1 className="templates-title">Animasyonlu Davetiyeler.</h1>
          <p className="templates-subtitle">
            Her biri canlı geri sayım, RSVP, harita, müzik ve galeri içeren hazır temalar. Birini seçin, editörde kendinize göre düzenleyin.
          </p>
        </motion.div>

        <motion.div
          className="templates-toolbar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tema ara..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-tags">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tag ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="templates-grid">
          <AnimatePresence>
            {filtered.map((tpl) => (
              <motion.div
                key={tpl.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="template-card"
              >
                <div
                  className="tc-image-wrapper"
                  style={{ background: `linear-gradient(135deg, ${tpl.c1}, ${tpl.c2})`, cursor: 'pointer' }}
                  onClick={() => setPreviewTpl(tpl)}
                >
                  {tpl.isNew && <span className="tc-new">YENİ</span>}
                  <span className="tc-monogram" style={{ color: tpl.dark ? tpl.c2 : '#ffffff' }}>
                    {tpl.category === 'Dini Düğün' ? '☪' : tpl.category === 'Doğum Günü' || tpl.category === 'Kutlama' ? '🎂' : '♥'}
                  </span>
                  <TemplateThumb tplKey={tpl.key} />
                  <div className="tc-overlay">
                    <button
                      type="button"
                      className="btn-outline-white"
                      onClick={(e) => { e.stopPropagation(); setPreviewTpl(tpl); }}
                    >
                      <Eye size={16} /> Önizle
                    </button>
                    <Link to={`/editor?theme=${tpl.key}`} className="btn-primary-white" onClick={(e) => e.stopPropagation()}>
                      <Edit3 size={16} /> Bu Temayla Başla
                    </Link>
                  </div>
                </div>
                <div className="tc-info">
                  <div className="tc-header">
                    <span className="tc-category">{tpl.category}</span>
                    <span className="tc-price">Ücretsiz</span>
                  </div>
                  <h3 className="tc-name">{tpl.name}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p>Aradığınız kritere uygun tema bulunamadı.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewTpl && <TemplatePreviewModal tpl={previewTpl} onClose={() => setPreviewTpl(null)} />}
      </AnimatePresence>
    </div>
  );
};

/**
 * Kart üzerinde her zaman görünen küçük, canlı davetiye önizlemesi.
 * davet-preview.html gerçek boyutunda (1000x1600) render edilip kartın gerçek
 * genişliğine göre JS ile ölçeklenir; clip-path ile kart sınırının dışına
 * taşması (bazı tarayıcılarda transform+overflow:hidden'ın kırpmaması) engellenir.
 */
const TemplateThumb = ({ tplKey }: { tplKey: string }) => {
  const { ref, inView } = useInView();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);

  useEffect(() => {
    const measure = () => {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / 1000);
    };
    const id = setTimeout(measure, 60);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(id); window.removeEventListener('resize', measure); };
  }, [inView]);

  return (
    <div
      ref={(el) => { (ref as any).current = el; wrapRef.current = el; }}
      className="tc-live-preview"
      style={{ clipPath: 'inset(0 round 20px 20px 0 0)' }}
    >
      {inView && (
        <iframe
          title={`${tplKey} önizleme`}
          loading="lazy"
          src={thumbPreviewUrl(tplKey)}
          style={{ width: 1000, height: 1600, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0, pointerEvents: 'none', position: 'absolute', top: 0, left: 0, maxWidth: 'none' }}
        />
      )}
    </div>
  );
};

/** Bir şablona tıklanınca sayfadan ayrılmadan tam boy önizleme gösteren modal. */
const TemplatePreviewModal = ({ tpl, onClose }: { tpl: (typeof TEMPLATES)[number]; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="tpl-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="tpl-modal-panel"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="tpl-modal-close" onClick={onClose} aria-label="Kapat">
          <X size={20} />
        </button>
        <div className="tpl-modal-phone">
          <iframe title={`${tpl.name} büyük önizleme`} src={previewUrl(tpl.key)} style={{ width: '100%', height: '100%', border: 0 }} />
        </div>
        <div className="tpl-modal-info">
          <span className="tc-category">{tpl.category}</span>
          <h3>{tpl.name}</h3>
          <div className="tpl-modal-actions">
            <a href={previewUrl(tpl.key)} target="_blank" rel="noreferrer" className="btn-outline">Yeni Sekmede Aç</a>
            <Link to={`/editor?theme=${tpl.key}`} className="btn-primary-large">
              <Edit3 size={16} /> Bu Temayla Başla
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Templates;
