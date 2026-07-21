import { useState, useRef, useEffect } from 'react';
import { Search, Eye, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { THEMES, CATEGORY_LABEL, type ThemeCategory } from '../data/themes';
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

// Tema verisi artık ../data/themes.ts'den geliyor — Editor ile aynı tek kaynak (bkz. o dosyanın açıklaması).
const TEMPLATES = THEMES;

const CATEGORY_FILTERS: { code: ThemeCategory | 'all'; label: string }[] = [
  { code: 'all', label: 'Tümü' },
  { code: 'dugun', label: CATEGORY_LABEL.dugun },
  { code: 'dini', label: CATEGORY_LABEL.dini },
  { code: 'kina', label: CATEGORY_LABEL.kina },
  { code: 'dogumgunu', label: CATEGORY_LABEL.dogumgunu },
  { code: 'kutlama', label: CATEGORY_LABEL.kutlama },
];

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
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTpl, setPreviewTpl] = useState<(typeof TEMPLATES)[number] | null>(null);

  const filtered = TEMPLATES.filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
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
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.code}
                className={`filter-tag ${activeCategory === cat.code ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.code)}
              >
                {cat.label}
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
                    {tpl.category === 'dini' ? '☪' : tpl.category === 'dogumgunu' || tpl.category === 'kutlama' ? '🎂' : '♥'}
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
                    <span className="tc-category">{CATEGORY_LABEL[tpl.category]}</span>
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
          <span className="tc-category">{CATEGORY_LABEL[tpl.category]}</span>
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
