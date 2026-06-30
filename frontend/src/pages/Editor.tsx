import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette, Heart, MapPin, Mail, Music, Image as ImageIcon,
  Users, BookOpen, Download, Share2, Plus, Trash2, Check, UploadCloud
} from 'lucide-react';
import { invitationService, assetService } from '../services/api';
import { slugify } from '../utils/format';
import './Editor.css';

/* Onizleme motorundaki temalarla birebir ayni anahtarlar */
const THEMES = [
  { key: 'altin', label: 'Zarif Altın', c1: '#9c7a31', c2: '#e8d6a8' },
  { key: 'gul', label: 'Romantik Gül', c1: '#b35a72', c2: '#f6dbe2' },
  { key: 'minimal', label: 'Modern Minimal', c1: '#1a1a1a', c2: '#d8d8d8' },
  { key: 'bohem', label: 'Bohem Kır', c1: '#5f7050', c2: '#cdbfa6' },
  { key: 'lacivert', label: 'Lacivert Gece', c1: '#0e1a33', c2: '#c9a14e' },
  { key: 'lavanta', label: 'Lavanta Bahçe', c1: '#6f54a0', c2: '#e3d6f3' },
  { key: 'sonbahar', label: 'Sonbahar', c1: '#8a3d1c', c2: '#ecd9bf' },
  { key: 'deniz', label: 'Deniz Kıyısı', c1: '#1c7484', c2: '#bfe6ec' },
  { key: 'tropikal', label: 'Tropikal', c1: '#136443', c2: '#bfe6cf' },
  { key: 'havai', label: 'Gece Havai Fişek', c1: '#070912', c2: '#cbab53' },
  { key: 'sinematik', label: 'Altın Sinematik', c1: '#0b0b0d', c2: '#c9a14e' },
];

type Family = { side: string; names: string };
type Story = { when: string; title: string; text: string };

type Cfg = {
  theme: string;
  brideName: string; groomName: string;
  date: string; subtitle: string; greeting: string; message: string;
  venueName: string; venueCity: string; mapQuery: string; reception: string;
  music: boolean;
  musicUrl: string;
  photos: string[];
  families: Family[];
  story: Story[];
  rsvpDeadline: string; phone: string;
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
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
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
};

const SECTIONS = [
  { id: 'theme', label: 'Tema', icon: Palette },
  { id: 'couple', label: 'Çift & Tarih', icon: Heart },
  { id: 'venue', label: 'Mekan & Harita', icon: MapPin },
  { id: 'story', label: 'Hikayemiz', icon: BookOpen },
  { id: 'family', label: 'Aileler', icon: Users },
  { id: 'photos', label: 'Fotoğraflar', icon: ImageIcon },
  { id: 'music', label: 'Müzik', icon: Music },
  { id: 'rsvp', label: 'RSVP', icon: Mail },
];

const initialCfg = (): Cfg => {
  const theme = new URLSearchParams(window.location.search).get('theme');
  if (theme && THEMES.some((t) => t.key === theme)) return { ...DEFAULT_CFG, theme };
  return DEFAULT_CFG;
};

const Editor = () => {
  const [cfg, setCfg] = useState<Cfg>(initialCfg);
  const [active, setActive] = useState('theme');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [musicUploading, setMusicUploading] = useState(false);
  const [musicErr, setMusicErr] = useState('');
  const idRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
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

  const set = (k: keyof Cfg, v: any) => setCfg((c) => ({ ...c, [k]: v }));

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

  const encodeCfg = () => btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));

  const copyLink = () => {
    const url = `${window.location.origin}/davet-preview.html#cfg=${encodeCfg()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  };

  const downloadHtml = async () => {
    const res = await fetch('/davet-preview.html');
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
      const title = `${cfg.brideName} & ${cfg.groomName} — Düğün Davetiyesi`;
      const eventDate = cfg.date ? new Date(cfg.date).toISOString() : undefined;
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
          <span className="ed-doc">{cfg.brideName} & {cfg.groomName} — Düğün Davetiyesi</span>
        </div>
        <div className="ed-head-r">
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
          {SECTIONS.map((s) => {
            const Ico = s.icon;
            return (
              <button key={s.id} className={`ed-nav-item ${active === s.id ? 'on' : ''}`} onClick={() => setActive(s.id)}>
                <Ico size={18} /> <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* orta: form */}
        <section className="ed-form">
          {active === 'theme' && (
            <div className="grp">
              <h3>Tema Seçimi</h3>
              <p className="grp-sub">Davetinizin tarzını seçin. Önizleme anında güncellenir.</p>
              <div className="theme-grid">
                {THEMES.map((t) => (
                  <button key={t.key} className={`theme-card ${cfg.theme === t.key ? 'on' : ''}`} onClick={() => set('theme', t.key)}>
                    <span className="swatch" style={{ background: `linear-gradient(135deg, ${t.c1}, ${t.c2})` }} />
                    <span className="theme-name">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === 'couple' && (
            <div className="grp">
              <h3>Çift & Tarih</h3>
              <div className="row2">
                <Field label="Gelin Adı"><input value={cfg.brideName} onChange={(e) => set('brideName', e.target.value)} /></Field>
                <Field label="Damat Adı"><input value={cfg.groomName} onChange={(e) => set('groomName', e.target.value)} /></Field>
              </div>
              <Field label="Tarih & Saat (geri sayım buna göre çalışır)">
                <input type="datetime-local" value={cfg.date} onChange={(e) => set('date', e.target.value)} />
              </Field>
              <Field label="Üst yazı (isim altındaki cümle)">
                <input value={cfg.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
              </Field>
              <Field label="Davet başlığı"><input value={cfg.greeting} onChange={(e) => set('greeting', e.target.value)} /></Field>
              <Field label="Davet metni">
                <textarea rows={4} value={cfg.message} onChange={(e) => set('message', e.target.value)} />
              </Field>
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
              <p className="grp-sub">Fotoğraf bağlantısı (URL) ekleyin. Slayt otomatik döner.</p>
              {cfg.photos.map((p, i) => (
                <div className="photo-row" key={i}>
                  <div className="photo-thumb" style={{ backgroundImage: `url("${p}")` }} />
                  <input value={p} onChange={(e) => updArr('photos', i, e.target.value)} placeholder="https://..." />
                  <button className="icon-del" onClick={() => delArr('photos', i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button className="add-btn" onClick={() => addArr('photos', '')}><Plus size={15} /> Fotoğraf Ekle</button>
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
        </section>

        {/* sag: canli onizleme */}
        <section className="ed-preview">
          <div className="phone">
            <div className="phone-top" />
            <iframe ref={iframeRef} title="Önizleme" src="/davet-preview.html" onLoad={post} />
          </div>
          <p className="preview-hint">Canlı önizleme — değişiklikler anında yansır</p>
        </section>
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
