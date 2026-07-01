import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette, Heart, MapPin, Mail, Music, Image as ImageIcon,
  Users, BookOpen, Download, Share2, Plus, Trash2, Check, UploadCloud,
  Video, Sparkles, X
} from 'lucide-react';
import { invitationService, assetService } from '../services/api';
import { slugify } from '../utils/format';
import './Editor.css';

/* Onizleme motorundaki temalarla birebir ayni anahtarlar */
type Cat = 'dugun' | 'dogumgunu' | 'kutlama';
const THEMES: { key: string; label: string; c1: string; c2: string; cat: Cat }[] = [
  { key: 'altin', label: 'Zarif Altın', c1: '#9c7a31', c2: '#e8d6a8', cat: 'dugun' },
  { key: 'gul', label: 'Romantik Gül', c1: '#b35a72', c2: '#f6dbe2', cat: 'dugun' },
  { key: 'minimal', label: 'Modern Minimal', c1: '#1a1a1a', c2: '#d8d8d8', cat: 'dugun' },
  { key: 'bohem', label: 'Bohem Kır', c1: '#5f7050', c2: '#cdbfa6', cat: 'dugun' },
  { key: 'lacivert', label: 'Lacivert Gece', c1: '#0e1a33', c2: '#c9a14e', cat: 'dugun' },
  { key: 'lavanta', label: 'Lavanta Bahçe', c1: '#6f54a0', c2: '#e3d6f3', cat: 'dugun' },
  { key: 'sonbahar', label: 'Sonbahar', c1: '#8a3d1c', c2: '#ecd9bf', cat: 'dugun' },
  { key: 'deniz', label: 'Deniz Kıyısı', c1: '#1c7484', c2: '#bfe6ec', cat: 'dugun' },
  { key: 'tropikal', label: 'Tropikal', c1: '#136443', c2: '#bfe6cf', cat: 'dugun' },
  { key: 'havai', label: 'Gece Havai Fişek', c1: '#070912', c2: '#cbab53', cat: 'dugun' },
  { key: 'sinematik', label: 'Altın Sinematik', c1: '#0b0b0d', c2: '#c9a14e', cat: 'dugun' },
  // ===== Doğum Günü davetleri =====
  { key: 'balon', label: 'Renkli Balon', c1: '#e84393', c2: '#ffd6e8', cat: 'dogumgunu' },
  { key: 'konfeti', label: 'Konfeti Partisi', c1: '#120a24', c2: '#f5c542', cat: 'dogumgunu' },
  // ===== Kutlama (kişiye gönderilen, davet değil) =====
  { key: 'kutlamaPop', label: 'Renkli Kutlama', c1: '#ff5e8a', c2: '#ffd1e0', cat: 'kutlama' },
  { key: 'kutlamaGece', label: 'Işıltılı Gece', c1: '#0f0a22', c2: '#ffd86b', cat: 'kutlama' },
  { key: 'kutlamaPastel', label: 'Pastel Kutlama', c1: '#7aa6b8', c2: '#d8ecf2', cat: 'kutlama' },
  { key: 'kutlamaAltin', label: 'Altın Zarafet', c1: '#b8923f', c2: '#ecd9a8', cat: 'kutlama' },
  { key: 'kutlamaCocuk', label: 'Çocuk Partisi', c1: '#ff7a3d', c2: '#ffe0b8', cat: 'kutlama' },
  { key: 'kutlamaDisko', label: 'Disko Gecesi', c1: '#0a0118', c2: '#ff2ec4', cat: 'kutlama' },
];

const BIRTHDAY_KEYS = THEMES.filter((t) => t.cat === 'dogumgunu' || t.cat === 'kutlama').map((t) => t.key);
const isBirthdayTheme = (key: string) => BIRTHDAY_KEYS.includes(key);
const CELEB_KEYS = THEMES.filter((t) => t.cat === 'kutlama').map((t) => t.key);
const isCelebTheme = (key: string) => CELEB_KEYS.includes(key);

/* Doğum günü temasına geçilince (kullanıcı hâlâ düğün varsayılanlarındaysa) uygulanan içerik */
const BDAY_CONTENT: Partial<Cfg> = {
  brideName: 'Defne', groomName: '7',
  subtitle: 'doğum günü partime hepinizi bekliyorum!',
  greeting: 'Kutlamaya davetlisin',
  message: 'En sevdiğim insanlarla doğum günümü kutlamak istiyorum. Gelip eğlenceye, pasta ve sürprizlere ortak olursan çok mutlu olurum!',
  venueName: 'Happy Land Eğlence Merkezi', venueCity: 'Kadıköy, İstanbul',
  mapQuery: 'Happy Land Eğlence Merkezi İstanbul',
  reception: 'Kapı açılışı 13:30',
  rsvpDeadline: '5 gün önce',
  photos: [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
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
};

/* Kutlama (kişiye gönderilen) temasına geçilince uygulanan içerik */
const CELEB_CONTENT: Partial<Cfg> = {
  brideName: 'Defne', groomName: '7',
  subtitle: 'bugün senin günün — iyi ki doğdun!',
  greeting: 'Mutlu Yıllar Sana',
  message: 'Bu özel günü seninle kutlamak, gülüşünü görmek ve mutluluğuna ortak olmak en güzel hediye. Hayatımıza neşe kattığın için teşekkürler!',
  photos: [
    { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80', caption: 'En özel günümüzden' },
    { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80', caption: 'Beraber ilk tatilimiz' },
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80', caption: '' },
  ],
  videoUrl: '',
  fromName: 'Sevgiyle, Annen',
  wish: 'Nice mutlu, sağlıklı ve kahkaha dolu senelere! İyi ki doğdun, iyi ki varsın. 🎂🎈',
  cakeType: 'classic',
};

type Family = { side: string; names: string };
type Story = { when: string; title: string; text: string };

type Cfg = {
  theme: string;
  brideName: string; groomName: string;
  date: string; subtitle: string; greeting: string; message: string;
  venueName: string; venueCity: string; mapQuery: string; reception: string;
  music: boolean;
  musicUrl: string;
  photos: any[]; // Backward uyumluluk için any kullanıp çalışma anında nesneye dönüştürüyoruz
  families: Family[];
  story: Story[];
  rsvpDeadline: string; phone: string;
  // kutlama modu
  videoUrl: string; fromName: string; wish: string;
  cakeType?: string;
};

const DEFAULT_CFG: Cfg = {
  theme: 'altin',
  brideName: 'Zeynep', groomName: 'Ahmet',
  date: '2026-09-12T18:00',
  subtitle: 'evleniyoruz, sizi de aramızda görmek isteriz',
  greeting: 'Mutluluğumuza ortak olun',
  message: 'Birbirimize verdiğimiz sözü, bizi sevenlerin huzurunda söylemek istiyoruz. Bu mutlu günümüzde yanımızda olmanız bizim için çok değerli.',
  venueName: 'Çırağan Sarayı Kempinski', venueCity: 'Beşiktaş, İstanbul',
  mapQuery: 'Çırağan Sarayı Kempinski İstanbul',
  reception: 'Karşılama 17:30',
  music: true,
  musicUrl: '',
  photos: [
    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', caption: 'Hayatımızı birleştirdiğimiz o özel gün' },
    { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80', caption: 'İlk tatilimizden' },
    { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80', caption: '' },
  ],
  families: [
    { side: 'Gelin', names: 'Sevgi & Kemal Aydın' },
    { side: 'Damat', names: 'Nurten & Hasan Yıldız' },
  ],
  story: [
    { when: '2019', title: 'İlk Tanışma', text: 'Ortak bir arkadaşın doğum gününde tanıştık.' },
    { when: '2022', title: 'İlk Seyahat', text: 'Birlikte çıktığımız ilk yolculukta birbirimize bağlandık.' },
    { when: '2025', title: 'Teklif', text: 'Mum ışığında bir evet ile yollarımızı birleştirdik.' },
  ],
  rsvpDeadline: '1 Eylül', phone: '905555555555',
  videoUrl: '', fromName: 'Sevgiyle, Annen',
  wish: 'Nice mutlu, sağlıklı ve kahkaha dolu senelere! İyi ki doğdun, iyi ki varsın. 🎂',
};

type SectionDef = { id: string; label: string; icon: any };
const SECTIONS: SectionDef[] = [
  { id: 'theme', label: 'Tema', icon: Palette },
  { id: 'couple', label: 'Çift & Tarih', icon: Heart },
  { id: 'venue', label: 'Mekan & Harita', icon: MapPin },
  { id: 'story', label: 'Hikayemiz', icon: BookOpen },
  { id: 'family', label: 'Aileler', icon: Users },
  { id: 'photos', label: 'Fotoğraflar', icon: ImageIcon },
  { id: 'music', label: 'Müzik', icon: Music },
  { id: 'rsvp', label: 'RSVP', icon: Mail },
];

/* Kutlama modunda farklı bölümler (davet mekanikleri yok) */
const CELEB_SECTIONS: SectionDef[] = [
  { id: 'theme', label: 'Tema', icon: Palette },
  { id: 'couple', label: 'Kişi & Mesaj', icon: Heart },
  { id: 'photos', label: 'Fotoğraflar', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'music', label: 'Müzik', icon: Music },
  { id: 'wish', label: 'Dilek & İmza', icon: Sparkles },
];

const DRAFT_KEY = 'davetim_editor_draft_v1';

const normalizeCfg = (c: any): Cfg => {
  if (c && Array.isArray(c.photos) && c.photos.length > 0 && typeof c.photos[0] === 'string') {
    c.photos = c.photos.map((p: string) => ({ url: p, caption: '' }));
  }
  return c as Cfg;
};

const initialCfg = (): Cfg => {
  const theme = new URLSearchParams(window.location.search).get('theme');
  let base = DEFAULT_CFG;
  if (theme && THEMES.some((t) => t.key === theme)) base = { ...DEFAULT_CFG, theme };
  return normalizeCfg(JSON.parse(JSON.stringify(base)));
};

const Editor = () => {
  const [cfg, setCfg] = useState<Cfg>(initialCfg);
  const [autoSave, setAutoSave] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [active, setActive] = useState('theme');
  const isCeleb = isCelebTheme(cfg.theme);
  const isBday = isBirthdayTheme(cfg.theme) && !isCeleb; // kutlama ayrı kategoride
  const visibleSections = isCeleb ? CELEB_SECTIONS : SECTIONS;
  const [themeCat, setThemeCat] = useState<Cat>(
    isCelebTheme(cfg.theme) ? 'kutlama' : isBirthdayTheme(cfg.theme) ? 'dogumgunu' : 'dugun'
  );
  // Aktif bölüm görünür değilse temaya dön (kutlama ↔ davet geçişinde)
  useEffect(() => {
    if (!visibleSections.some((s) => s.id === active)) setActive('theme');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCeleb]);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [musicUploading, setMusicUploading] = useState(false);
  const [musicErr, setMusicErr] = useState('');
  const [photoUploadingIdx, setPhotoUploadingIdx] = useState<number | null>(null);
  const [photoUploadErr, setPhotoUploadErr] = useState('');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false); // mobilde tam ekran önizleme aç/kapa
  const idRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const photoFileInputs = useRef<(HTMLInputElement | null)[]>([]);
  // Her zaman en güncel cfg'yi tut (stale closure'ı önler)
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  const post = () => {
    iframeRef.current?.contentWindow?.postMessage({ __davet: true, cfg: cfgRef.current }, '*');
  };

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.__davetReady) { readyRef.current = true; post(); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (readyRef.current) post(); /* eslint-disable-next-line */ }, [cfg]);

  // ---- Otomatik kayıt: taslak kurtarma (sayfa ilk açılışta bir kez) ----
  useEffect(() => {
    try {
      const isEdit = new URLSearchParams(window.location.search).get('edit') === '1';
      if (isEdit) {
        const editRaw = localStorage.getItem('davetim_edit_temp');
        if (editRaw) {
          const inv = JSON.parse(editRaw);
          if (inv.config) setCfg(normalizeCfg(inv.config));
          if (inv.id) idRef.current = inv.id;
          if (inv.slug) setSavedSlug(inv.slug);
          localStorage.removeItem('davetim_edit_temp');
          return;
        }
      }

      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft?.cfg) return;
      const ok = window.confirm('Kaydedilmemiş bir taslak bulundu. Kaldığın yerden devam etmek ister misin?');
      if (ok) {
        setCfg(normalizeCfg(draft.cfg));
        if (draft.id) idRef.current = draft.id;
        if (draft.slug) setSavedSlug(draft.slug);
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      /* bozuk taslak varsa sessizce yok say */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Otomatik kayıt: her değişiklikte taslağı localStorage'a yaz (tarayıcı çökerse/sekme kapanırsa kurtarılsın) ----
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ cfg, id: idRef.current, slug: savedSlug }));
      } catch {
        /* localStorage dolu/erişilemez olabilir, sessizce geç */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [cfg, savedSlug]);

  // ---- Otomatik kayıt: davetiye zaten yayınlanmışsa arka planda sunucuya da yazsın ----
  useEffect(() => {
    if (!idRef.current) return; // ilk "Yayınla" yapılmadan sunucuya otomatik kayıt yok
    setAutoSave('saving');
    const t = setTimeout(async () => {
      try {
        const eventDate = (cfg.date && !isCelebTheme(cfg.theme)) ? new Date(cfg.date).toISOString() : undefined;
        await invitationService.saveInvitation(idRef.current as string, { eventDate, config: cfg });
        setAutoSave('saved');
      } catch {
        setAutoSave('error');
      }
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  const set = (k: keyof Cfg, v: any) => setCfg((c) => ({ ...c, [k]: v }));

  // İçerik hâlâ hazır bir şablonda mı? (kullanıcı metni özelleştirmediyse kategori geçişinde otomatik çevir)
  const isPreset = (c: Cfg) =>
    (c.subtitle === DEFAULT_CFG.subtitle && c.greeting === DEFAULT_CFG.greeting) ||
    (c.subtitle === BDAY_CONTENT.subtitle && c.greeting === BDAY_CONTENT.greeting) ||
    (c.subtitle === CELEB_CONTENT.subtitle && c.greeting === CELEB_CONTENT.greeting);

  // Tema seçimi — kategori değişince içerik hâlâ varsayılandaysa uygun metne çevir
  const pickTheme = (key: string) => {
    const toCeleb = isCelebTheme(key);
    const toBday = isBirthdayTheme(key) && !toCeleb;
    setCfg((c) => {
      const next: Cfg = { ...c, theme: key };
      if (isPreset(c)) {
        if (toCeleb) Object.assign(next, CELEB_CONTENT);
        else if (toBday) Object.assign(next, BDAY_CONTENT);
        else Object.assign(next, { ...DEFAULT_CFG, theme: key });
      }
      return next;
    });
  };

  const onMusicFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMusicUploading(true); setMusicErr('');
    try {
      const r = await assetService.uploadAudio(f);
      setCfg((c) => ({ ...c, musicUrl: r.url, music: true }));
    } catch (err: any) {
      setMusicErr(err?.message || 'Müzik yüklenemedi.');
    } finally {
      setMusicUploading(false);
      e.target.value = '';
    }
  };

  // Fotoğraf: bilgisayardan seçilen dosyayı backend'e yükler, dönen URL'i ilgili slota yazar
  const onPhotoFile = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoUploadingIdx(idx); setPhotoUploadErr('');
    try {
      const r = await assetService.uploadImage(f);
      setCfg((c) => {
        const arr = [...c.photos];
        arr[idx] = { ...arr[idx], url: r.url };
        return { ...c, photos: arr };
      });
    } catch (err: any) {
      setPhotoUploadErr(err?.message || 'Fotoğraf yüklenemedi.');
    } finally {
      setPhotoUploadingIdx(null);
      e.target.value = '';
    }
  };

  // Yeni bir fotoğraf slotu ekleyip hemen bilgisayardan yükleme seçtirir
  const addPhotoFromComputer = () => {
    setCfg((c) => {
      const idx = c.photos.length;
      const next = { ...c, photos: [...c.photos, { url: '', caption: '' }] };
      // state güncellendikten sonra o slotun dosya seçicisini tetikle
      setTimeout(() => photoFileInputs.current[idx]?.click(), 0);
      return next;
    });
  };

  const encodeCfg = () => btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));

  const copyLink = () => {
    const url = `${window.location.origin}/davet-preview.html#cfg=${encodeCfg()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  };

  const downloadHtml = async () => {
    const res = await fetch('/davet-preview.html?v=20260630c');
    let html = await res.text();
    const inject = `<script>window.__INITIAL_CFG__=${JSON.stringify(cfg)};<\/script>`;
    html = html.replace('</head>', inject + '</head>');
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${cfg.brideName}-${cfg.groomName}-davetiye.html`;
    a.click();
  };

  /* Backend'e kaydet / yayınla */
  const publish = async () => {
    setSaving(true); setSaveError('');
    try {
      const title = isCelebTheme(cfg.theme)
        ? `${cfg.brideName} — Doğum Günü Kutlaması`
        : isBirthdayTheme(cfg.theme)
          ? `${cfg.brideName} — Doğum Günü Davetiyesi`
          : `${cfg.brideName} & ${cfg.groomName} — Düğün Davetiyesi`;
      const eventDate = (cfg.date && !isCelebTheme(cfg.theme)) ? new Date(cfg.date).toISOString() : undefined;
      if (idRef.current) {
        await invitationService.saveInvitation(idRef.current, { title, eventDate, config: cfg });
      } else {
        const slug = `${slugify(`${cfg.brideName}-${cfg.groomName}`)}-${Math.random().toString(36).slice(2, 6)}`;
        const inv = await invitationService.createInvitation({ title, slug, eventDate, config: cfg });
        idRef.current = inv.id;
        setSavedSlug(inv.slug);
      }
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- dinamik liste yardimcilari ---- */
  const updArr = (key: 'photos' | 'families' | 'story', idx: number, val: any) => {
    setCfg((c) => { const arr = [...(c[key] as any[])]; arr[idx] = val; return { ...c, [key]: arr }; });
  };
  const addArr = (key: 'photos' | 'families' | 'story', val: any) =>
    setCfg((c) => ({ ...c, [key]: [...(c[key] as any[]), val] }));
  const delArr = (key: 'photos' | 'families' | 'story', idx: number) =>
    setCfg((c) => ({ ...c, [key]: (c[key] as any[]).filter((_, i) => i !== idx) }));

  return (
    <div className="ed">
      <header className="ed-head">
        <div className="ed-head-l">
          <Link to="/" className="ed-logo">Davetim</Link>
          <span className="ed-divider" />
          <span className="ed-doc">{isCeleb ? `${cfg.brideName} — Doğum Günü Kutlaması` : isBday ? `${cfg.brideName} — Doğum Günü Davetiyesi` : `${cfg.brideName} & ${cfg.groomName} — Düğün Davetiyesi`}</span>
        </div>
        <div className="ed-head-r">
          {idRef.current && (
            <span className="ed-autosave">
              {autoSave === 'saving' ? 'Kaydediliyor…' : autoSave === 'error' ? 'Otomatik kayıt başarısız' : 'Değişiklikler kaydedildi'}
            </span>
          )}
          {saveError && <span className="ed-saveerr">{saveError}</span>}
          {savedSlug && (
            <a className="ed-published" href={`/davet/${savedSlug}`} target="_blank" rel="noreferrer">
              ● Yayında: /davet/{savedSlug}
            </a>
          )}
          <button className="ed-btn ghost" onClick={copyLink}>
            {copied ? <><Check size={15} /> Kopyalandı</> : <><Share2 size={15} /> Bağlantı</>}
          </button>
          <button className="ed-btn ghost" onClick={downloadHtml}><Download size={15} /> HTML İndir</button>
          <button className="ed-btn solid" onClick={publish} disabled={saving}>
            <UploadCloud size={15} /> {saving ? 'Kaydediliyor…' : (idRef.current ? 'Güncelle' : 'Yayınla')}
          </button>
        </div>
      </header>

      <div className="ed-body">
        {/* sol: bolum menusu */}
        <nav className="ed-nav">
          {visibleSections.map((s) => {
            const Ico = s.icon;
            const label = isBday
              ? (s.id === 'couple' ? 'Kişi & Tarih' : s.id === 'family' ? 'Sevdiklerim' : s.label)
              : s.label;
            return (
              <button key={s.id} className={`ed-nav-item ${active === s.id ? 'on' : ''}`} onClick={() => setActive(s.id)}>
                <Ico size={18} /> <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* orta: form */}
        <section className="ed-form">
          {active === 'theme' && (
            <div className="grp">
              <h3>Tema Seçimi</h3>
              <p className="grp-sub">Önce türü seçin, sonra tarzını. Önizleme anında güncellenir.</p>
              <div className="cat-tabs">
                <button className={`cat-tab ${themeCat === 'dugun' ? 'on' : ''}`} onClick={() => setThemeCat('dugun')}>
                  💍 Düğün Daveti
                </button>
                <button className={`cat-tab ${themeCat === 'dogumgunu' ? 'on' : ''}`} onClick={() => setThemeCat('dogumgunu')}>
                  🎂 Doğum Günü Daveti
                </button>
                <button className={`cat-tab ${themeCat === 'kutlama' ? 'on' : ''}`} onClick={() => setThemeCat('kutlama')}>
                  🎉 Kutlama
                </button>
              </div>
              {themeCat === 'kutlama' && (
                <p className="grp-sub" style={{ marginTop: -8 }}>
                  Kutlama, davet değildir: kişiye özel hazırlayıp gönderirsiniz. Resim, müzik, video ve dilek içerir; RSVP/harita yoktur.
                </p>
              )}
              <div className="theme-grid">
                {THEMES.filter((t) => t.cat === themeCat).map((t) => (
                  <button key={t.key} className={`theme-card ${cfg.theme === t.key ? 'on' : ''}`} onClick={() => pickTheme(t.key)}>
                    <span className="swatch" style={{ background: `linear-gradient(135deg, ${t.c1}, ${t.c2})` }} />
                    <span className="theme-name">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === 'couple' && (
            <div className="grp">
              <h3>{isCeleb ? 'Kişi & Mesaj' : isBday ? 'Kişi & Tarih' : 'Çift & Tarih'}</h3>
              <div className="row2">
                <Field label={isCeleb || isBday ? 'Adı' : 'Gelin Adı'}><input value={cfg.brideName} onChange={(e) => set('brideName', e.target.value)} /></Field>
                <Field label={isCeleb || isBday ? 'Yaşı (örn: 7)' : 'Damat Adı'}><input value={cfg.groomName} onChange={(e) => set('groomName', e.target.value)} /></Field>
              </div>
              {!isCeleb && (
                <Field label="Tarih & Saat (geri sayım buna göre çalışır)">
                  <input type="datetime-local" value={cfg.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
              )}
              <Field label="Üst yazı (isim altındaki cümle)">
                <input value={cfg.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
              </Field>
              <Field label={isCeleb ? 'Kutlama başlığı' : 'Davet başlığı'}><input value={cfg.greeting} onChange={(e) => set('greeting', e.target.value)} /></Field>
              <Field label={isCeleb ? 'Kutlama mesajı' : 'Davet metni'}>
                <textarea rows={4} value={cfg.message} onChange={(e) => set('message', e.target.value)} />
              </Field>
              {isCeleb && (
                <Field label="Pasta Çeşidi">
                  <select value={cfg.cakeType || 'classic'} onChange={(e) => set('cakeType', e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '10px', border: '1px solid var(--color-border,#eae8e1)', fontSize: '14px', fontFamily: 'inherit', background: '#fff' }}>
                    <option value="classic">Klasik (Tema Rengi)</option>
                    <option value="chocolate">Çikolata Rüyası</option>
                    <option value="berry">Orman Meyveli</option>
                    <option value="rainbow">Gökkuşağı</option>
                  </select>
                </Field>
              )}
            </div>
          )}

          {active === 'venue' && (
            <div className="grp">
              <h3>Mekan & Harita</h3>
              <Field label="Mekan adı"><input value={cfg.venueName} onChange={(e) => set('venueName', e.target.value)} /></Field>
              <Field label="Şehir / İlçe"><input value={cfg.venueCity} onChange={(e) => set('venueCity', e.target.value)} /></Field>
              <Field label="Karşılama notu"><input value={cfg.reception} onChange={(e) => set('reception', e.target.value)} /></Field>
              <Field label="Harita araması (Google Maps'te aranacak metin)">
                <input value={cfg.mapQuery} onChange={(e) => set('mapQuery', e.target.value)} />
                <small className="hint">Örn: "Çırağan Sarayı İstanbul". Harita ve yol tarifi bu metne göre çalışır.</small>
              </Field>
            </div>
          )}

          {active === 'story' && (
            <div className="grp">
              <h3>Hikayemiz</h3>
              <p className="grp-sub">Tanışmadan teklife kadar olan adımlar.</p>
              {cfg.story.map((s, i) => (
                <div className="item-card" key={i}>
                  <div className="item-head"><span>Adım {i + 1}</span>
                    <button className="icon-del" onClick={() => delArr('story', i)}><Trash2 size={14} /></button></div>
                  <div className="row2">
                    <Field label="Zaman"><input value={s.when} onChange={(e) => updArr('story', i, { ...s, when: e.target.value })} /></Field>
                    <Field label="Başlık"><input value={s.title} onChange={(e) => updArr('story', i, { ...s, title: e.target.value })} /></Field>
                  </div>
                  <Field label="Açıklama"><textarea rows={2} value={s.text} onChange={(e) => updArr('story', i, { ...s, text: e.target.value })} /></Field>
                </div>
              ))}
              <button className="add-btn" onClick={() => addArr('story', { when: '', title: 'Yeni adım', text: '' })}><Plus size={15} /> Adım Ekle</button>
            </div>
          )}

          {active === 'family' && (
            <div className="grp">
              <h3>Aileler</h3>
              <p className="grp-sub">Gelin ve damat ailelerinin isimleri.</p>
              {cfg.families.map((f, i) => (
                <div className="item-card" key={i}>
                  <div className="item-head"><span>Aile {i + 1}</span>
                    <button className="icon-del" onClick={() => delArr('families', i)}><Trash2 size={14} /></button></div>
                  <div className="row2">
                    <Field label="Taraf (Gelin/Damat)"><input value={f.side} onChange={(e) => updArr('families', i, { ...f, side: e.target.value })} /></Field>
                    <Field label="İsimler"><input value={f.names} onChange={(e) => updArr('families', i, { ...f, names: e.target.value })} /></Field>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={() => addArr('families', { side: 'Gelin', names: '' })}><Plus size={15} /> Aile Ekle</button>
            </div>
          )}

          {active === 'photos' && (
            <div className="grp">
              <h3>Fotoğraf Galerisi</h3>
              <p className="grp-sub">Bilgisayarından fotoğraf yükle veya bir bağlantı (URL) yapıştır. Slayt otomatik döner.</p>
              {photoUploadErr && <small className="hint" style={{ color: '#b3261e', display: 'block', marginBottom: 10 }}>{photoUploadErr}</small>}
              {cfg.photos.map((p, i) => (
                <div className="photo-row" key={i}>
                  <div className="photo-thumb" style={{ backgroundImage: p?.url ? `url("${p.url}")` : undefined }}>
                    {photoUploadingIdx === i && <span className="photo-thumb-loading">…</span>}
                  </div>
                  <div className="photo-inputs">
                    <input value={p?.url || ''} onChange={(e) => updArr('photos', i, { ...p, url: e.target.value })} placeholder="https://... veya bilgisayardan yükle" />
                    <input value={p?.caption || ''} onChange={(e) => updArr('photos', i, { ...p, caption: e.target.value })} placeholder="Açıklama (Opsiyonel)" />
                  </div>
                  <input
                    ref={(el) => { photoFileInputs.current[i] = el; }}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                    style={{ display: 'none' }}
                    onChange={(e) => onPhotoFile(i, e)}
                  />
                  <button
                    type="button"
                    className="icon-upload"
                    title="Bilgisayardan yükle"
                    onClick={() => photoFileInputs.current[i]?.click()}
                    disabled={photoUploadingIdx === i}
                  >
                    <UploadCloud size={14} />
                  </button>
                  <button className="icon-del" onClick={() => delArr('photos', i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="add-btn" onClick={addPhotoFromComputer}><UploadCloud size={15} /> Bilgisayardan Yükle</button>
                <button className="add-btn" onClick={() => addArr('photos', { url: '', caption: '' })}><Plus size={15} /> Bağlantı (URL) Ekle</button>
              </div>
            </div>
          )}

          {active === 'music' && (
            <div className="grp">
              <h3>Arka Plan Müziği</h3>
              <p className="grp-sub">Davette sağ altta bir müzik düğmesi belirir; misafir dokununca çalar (tarayıcı kuralları gereği otomatik başlamaz).</p>

              <label className="switch-row">
                <span>Arka plan müziğini göster</span>
                <span className={`switch ${cfg.music ? 'on' : ''}`} onClick={() => set('music', !cfg.music)}><span className="knob" /></span>
              </label>

              <div className="field-row" style={{ marginTop: 18 }}>
                <label>MP3 yükle (bilgisayardan)</label>
                <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,.mp3,.wav,.ogg" onChange={onMusicFile} disabled={musicUploading} />
                {musicUploading && <small className="hint">Yükleniyor…</small>}
                {musicErr && <small className="hint" style={{ color: '#b3261e' }}>{musicErr}</small>}
              </div>

              <Field label="veya MP3 bağlantısı (URL)">
                <input value={cfg.musicUrl} onChange={(e) => set('musicUrl', e.target.value)} placeholder="https://.../muzik.mp3" />
                <small className="hint">Yüklersen otomatik dolar. Boşsa yumuşak bir varsayılan melodi çalar.</small>
              </Field>

              {cfg.musicUrl && (
                <div className="field-row">
                  <label>Seçili müzik</label>
                  <audio controls src={cfg.musicUrl} style={{ width: '100%' }} />
                  <button className="add-btn" style={{ marginTop: 8 }} onClick={() => set('musicUrl', '')}>Müziği kaldır</button>
                </div>
              )}
            </div>
          )}

          {active === 'rsvp' && (
            <div className="grp">
              <h3>RSVP (Katılım Bildirimi)</h3>
              <Field label="Son bildirim tarihi (metin)"><input value={cfg.rsvpDeadline} onChange={(e) => set('rsvpDeadline', e.target.value)} /></Field>
              <Field label="WhatsApp numarası (ülke kodu ile, + olmadan)">
                <input value={cfg.phone} onChange={(e) => set('phone', e.target.value)} placeholder="905551112233" />
                <small className="hint">Misafirlerin "WhatsApp ile bildir" yanıtları bu numaraya gelir.</small>
              </Field>
            </div>
          )}

          {active === 'video' && (
            <div className="grp">
              <h3>Sürpriz Video</h3>
              <p className="grp-sub">Bir YouTube bağlantısı yapıştırın ya da doğrudan bir MP4 video adresi verin. Boş bırakırsanız video bölümü görünmez.</p>
              <Field label="Video bağlantısı (YouTube veya MP4 URL)">
                <input value={cfg.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtu.be/... veya https://.../video.mp4" />
                <small className="hint">Örn: https://www.youtube.com/watch?v=… — otomatik gömülür.</small>
              </Field>
              {cfg.videoUrl && (
                <button className="add-btn" style={{ marginTop: 8 }} onClick={() => set('videoUrl', '')}>Videoyu kaldır</button>
              )}
            </div>
          )}

          {active === 'wish' && (
            <div className="grp">
              <h3>Dilek & İmza</h3>
              <p className="grp-sub">Kutlamanın sonunda görünen içten dilek ve gönderen imzası.</p>
              <Field label="Dilek mesajı">
                <textarea rows={4} value={cfg.wish} onChange={(e) => set('wish', e.target.value)} />
              </Field>
              <Field label="İmza / Gönderen">
                <input value={cfg.fromName} onChange={(e) => set('fromName', e.target.value)} placeholder="Sevgiyle, Annen" />
              </Field>
            </div>
          )}
        </section>

        {/* sag: canli onizleme (mobilde "Önizle" ile acilan tam ekran katman) */}
        <section className={`ed-preview ${mobilePreviewOpen ? 'open' : ''}`}>
          <button className="ed-preview-close" onClick={() => setMobilePreviewOpen(false)} aria-label="Önizlemeyi kapat">
            <X size={20} />
          </button>
          <div className="phone">
            <div className="phone-top" />
            <iframe ref={iframeRef} title="Önizleme" src="/davet-preview.html?v=20260701a" onLoad={post} />
          </div>
          <p className="preview-hint">Canlı önizleme — değişiklikler anında yansır</p>
        </section>

        {/* mobilde: önizlemeyi tam ekran acan yuzen buton */}
        <button className="ed-preview-fab" onClick={() => setMobilePreviewOpen(true)} aria-label="Önizlemeyi göster">
          <Sparkles size={16} /> Önizle
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="field-row">
    <label>{label}</label>
    {children}
  </div>
);

export default Editor;
