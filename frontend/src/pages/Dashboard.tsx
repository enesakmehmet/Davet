import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Mail, Users, BarChart3, Plus, UserCircle,
  ExternalLink, Eye, MailOpen, Edit3, Trash2, Settings as SettingsIcon, AlertTriangle, Download, X,
  Copy, Check, MessageCircle, CalendarClock, QrCode, CopyPlus, Bell, Undo2, ChevronRight, Images, Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, invitationService, guestListService, statsService, settingsService, authService, guestService, qrService, notificationService, guestPhotoService, ABS_API_URL } from '../services/api';
import { slugify } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

type Section = 'panel' | 'davetiyeler' | 'misafirler' | 'istatistikler' | 'ayarlar';

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: 'panel', label: 'Panel', icon: LayoutDashboard },
  { id: 'davetiyeler', label: 'Davetiyeler', icon: Mail },
  { id: 'misafirler', label: 'Misafir Listesi', icon: Users },
  { id: 'istatistikler', label: 'İstatistikler', icon: BarChart3 },
  { id: 'ayarlar', label: 'Ayarlar', icon: SettingsIcon },
];

const THEME_GRAD: Record<string, string> = {
  altin: 'linear-gradient(135deg,#9c7a31,#e8d6a8)', gul: 'linear-gradient(135deg,#b35a72,#f6dbe2)',
  minimal: 'linear-gradient(135deg,#1a1a1a,#d8d8d8)', bohem: 'linear-gradient(135deg,#5f7050,#cdbfa6)',
  lacivert: 'linear-gradient(135deg,#0e1a33,#c9a14e)', lavanta: 'linear-gradient(135deg,#6f54a0,#e3d6f3)',
  sonbahar: 'linear-gradient(135deg,#8a3d1c,#ecd9bf)', deniz: 'linear-gradient(135deg,#1c7484,#bfe6ec)',
  tropikal: 'linear-gradient(135deg,#136443,#2aa56c)', havai: 'linear-gradient(135deg,#070912,#cbab53)',
  sinematik: 'linear-gradient(135deg,#0b0b0d,#c9a14e)',
  dini: 'linear-gradient(135deg,#b08a3e,#f0e2bd)', diniYesil: 'linear-gradient(135deg,#2e6b4f,#dcead9)',
  zumrut: 'linear-gradient(135deg,#0d3b2a,#d4b455)', gececicek: 'linear-gradient(135deg,#2b0d1d,#e58bb1)',
  pudra: 'linear-gradient(135deg,#c07f6d,#f6e3da)',
  kutlamaNeon: 'linear-gradient(135deg,#0a0a1f,#00e5ff)', kutlamaSakura: 'linear-gradient(135deg,#e77fa1,#fde9f1)',
  kutlamaMasal: 'linear-gradient(135deg,#8f6fd6,#efe6ff)',
  balon: 'linear-gradient(135deg,#e84393,#ffd6e8)', konfeti: 'linear-gradient(135deg,#120a24,#f5c542)',
  kutlamaPop: 'linear-gradient(135deg,#ff5e8a,#ffd1e0)', kutlamaGece: 'linear-gradient(135deg,#0f0a22,#ffd86b)',
  kutlamaPastel: 'linear-gradient(135deg,#7aa6b8,#d8ecf2)', kutlamaAltin: 'linear-gradient(135deg,#b8923f,#ecd9a8)',
  kutlamaCocuk: 'linear-gradient(135deg,#ff7a3d,#ffe0b8)',
  kutlamaDisko: 'linear-gradient(135deg,#0a0118,#ff2ec4)',
};
const grad = (t?: string) => THEME_GRAD[t || 'altin'] || THEME_GRAD.altin;

/* Boş durum illüstrasyonu: altın çizgisel zarf + yüzükler */
const EmptyArt = () => (
  <svg width="120" height="88" viewBox="0 0 120 88" fill="none" style={{ display: 'block', margin: '0 auto 14px', opacity: 0.9 }}>
    <rect x="18" y="22" width="84" height="54" rx="8" stroke="#d4af37" strokeWidth="2" fill="rgba(212,175,55,0.06)" />
    <path d="M20 26 L60 54 L100 26" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="48" cy="14" r="8" stroke="#b5952f" strokeWidth="2" fill="none" />
    <circle cx="62" cy="14" r="8" stroke="#d4af37" strokeWidth="2" fill="none" />
    <path d="M55 5 l3 -4 l3 4" stroke="#d4af37" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);

/* Eleman görünür olunca true döner — ağır iframe thumbnail'ları yalnızca
   karta scroll edildiğinde yüklemek için (panel açılışını hızlandırır). */
const useInView = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '250px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
};

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  const m = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear()}`;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('panel');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);

  const resendVerification = async () => {
    setResending(true); setResendMsg('');
    try {
      const r = await authService.resendVerification();
      setResendMsg(r?.message || 'Gönderildi.');
    } catch (err: any) {
      setResendMsg(err?.response?.data?.message || 'Gönderilemedi, tekrar dene.');
    } finally {
      setResending(false);
    }
  };

  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});
  const [recentGuests, setRecentGuests] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let list: any[] = [];
      try {
        const data = await invitationService.getUserInvitations();
        list = Array.isArray(data) ? data : [];
        setInvitations(list);
      } catch {
        setError('Davetiyeler yüklenemedi. (Giriş yaptın mı / backend açık mı?)');
      } finally {
        setLoading(false);
      }

      // Panel ekstraları: görüntülenme + son RSVP'ler (hata olsa da panel çalışır)
      if (list.length === 0) return;
      const results = await Promise.allSettled(
        list.map(async (inv: any) => {
          const [stats, guests] = await Promise.allSettled([
            statsService.byInvitation(inv.id),
            guestListService.byInvitation(inv.id),
          ]);
          return { inv, stats, guests };
        })
      );
      const vm: Record<string, number> = {};
      const rg: any[] = [];
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const { inv, stats, guests } = r.value;
        if (stats.status === 'fulfilled') vm[inv.id] = stats.value?.summary?.views ?? 0;
        if (guests.status === 'fulfilled' && Array.isArray(guests.value)) {
          for (const g of guests.value) rg.push({ ...g, invTitle: inv.title });
        }
      }
      rg.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setViewsMap(vm);
      setRecentGuests(rg.slice(0, 6));
    })();
  }, []);

  const totalRsvp = invitations.reduce((s, i) => s + (i?._count?.guests || 0), 0);
  const totalViews = Object.values(viewsMap).reduce((s, v) => s + (v || 0), 0);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDelete = async (inv: any) => {
    if (!window.confirm(`"${inv.title || 'Davetiye'}" yayından kaldırılsın mı? 30 gün boyunca çöp kutusundan geri alabilirsin.`)) return;
    setDeletingId(inv.id);
    try {
      await invitationService.deleteInvitation(inv.id);
      setInvitations((list) => list.filter((x) => x.id !== inv.id));
    } catch {
      alert('Kaldırılamadı. Lütfen tekrar deneyin.');
    } finally {
      setDeletingId(null);
    }
  };

  // Davetiyeyi kopyala (aynı içerikle yeni davet oluşturur)
  const handleDuplicate = async (inv: any) => {
    try {
      const base = slugify(String(inv.slug || inv.title || 'davet').replace(/-[a-z0-9]{4}$/, ''));
      const created = await invitationService.createInvitation({
        title: `${inv.title || 'Davetiye'} (Kopya)`,
        slug: `${base}-${Math.random().toString(36).slice(2, 6)}`,
        eventDate: inv.eventDate || undefined,
        config: inv.config,
      });
      setInvitations((list) => [{ ...created, _count: { guests: 0 } }, ...list]);
    } catch {
      alert('Kopyalanamadı. Lütfen tekrar deneyin.');
    }
  };

  // Misafir albümü yönetimi
  const [albumInv, setAlbumInv] = useState<any>(null);
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const openAlbum = async (inv: any) => {
    setAlbumInv(inv); setAlbumLoading(true); setAlbumPhotos([]);
    try {
      setAlbumPhotos(await guestPhotoService.byInvitation(inv.id));
    } catch { /* boş kalır */ } finally {
      setAlbumLoading(false);
    }
  };
  const deletePhoto = async (photo: any) => {
    if (!window.confirm('Bu fotoğraf albümden kalıcı olarak silinsin mi?')) return;
    try {
      await guestPhotoService.remove(photo.id);
      setAlbumPhotos((l) => l.filter((p) => p.id !== photo.id));
    } catch {
      alert('Silinemedi, tekrar deneyin.');
    }
  };
  const downloadAllPhotos = async () => {
    // Sırayla indir (tarayıcı ZIP olmadan en pratik yol)
    for (let i = 0; i < albumPhotos.length; i++) {
      const p = albumPhotos[i];
      const a = document.createElement('a');
      a.href = p.url; a.download = `album-${i + 1}.webp`;
      a.click();
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  // Bildirimler (zil)
  const [notifs, setNotifs] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => {
    notificationService.list().then(setNotifs).catch(() => {});
  }, []);
  const unread = notifs.filter((n) => !n.isRead).length;
  const openNotifs = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      // açınca okunmamışları okundu işaretle
      const unreadOnes = notifs.filter((n) => !n.isRead);
      if (unreadOnes.length) {
        await Promise.allSettled(unreadOnes.map((n) => notificationService.markRead(n.id)));
        setNotifs((list) => list.map((n) => ({ ...n, isRead: true })));
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="db-brand">Davetim</Link>
          <p className="db-brand-sub">Wedding Suite</p>
        </div>

        <Link to="/editor" className="db-new"><Plus size={18} /> Yeni Oluştur</Link>

        <nav className="sidebar-nav">
          {NAV.map((n) => {
            const Ico = n.icon;
            return (
              <button key={n.id} className={`nav-item ${section === n.id ? 'active' : ''}`} onClick={() => setSection(n.id)}>
                <Ico size={20} /> {n.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <UserCircle size={32} color="rgba(255,255,255,0.55)" />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p className="db-user-name">{user?.name || 'Kullanıcı'}</p>
              <button onClick={logout} className="db-logout">Çıkış yap</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="db-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h1 className="db-title">{NAV.find((n) => n.id === section)?.label}</h1>
            <p className="db-sub">Hoş geldin, {user?.name?.split(' ')[0] || ''}</p>
          </div>
          <div className="db-bell-wrap">
            <button className="db-bell" onClick={openNotifs} title="Bildirimler">
              <Bell size={19} />
              {unread > 0 && <span className="db-bell-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {notifOpen && (
              <div className="db-notif-drop">
                <div className="db-notif-head">Bildirimler</div>
                {notifs.length === 0 ? (
                  <div className="db-notif-empty">Henüz bildirimin yok.</div>
                ) : (
                  notifs.slice(0, 12).map((n) => (
                    <div key={n.id} className="db-notif-item">
                      <b>{n.title}</b>
                      <p>{n.content}</p>
                      <small>{fmtDate(n.createdAt)}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        {user && user.emailVerified === false && (
          <div className="db-banner">
            <AlertTriangle size={16} />
            <span>E-posta adresini henüz doğrulamadın.</span>
            <button onClick={resendVerification} disabled={resending}>
              {resending ? 'Gönderiliyor…' : 'Doğrulama e-postasını tekrar gönder'}
            </button>
            {resendMsg && <span className="db-banner-msg">{resendMsg}</span>}
            <span className="db-banner-hint">E-posta gelmezse Spam / Gereksiz klasörünü kontrol et.</span>
          </div>
        )}

        {loading && <div className="db-empty">Yükleniyor…</div>}
        {!loading && error && <div className="db-empty">{error}</div>}

        {!loading && !error && (
          <>
            {section === 'panel' && <PanelView invitations={invitations} totalRsvp={totalRsvp} totalViews={totalViews} viewsMap={viewsMap} recentGuests={recentGuests} onGo={setSection} onDelete={handleDelete} onDuplicate={handleDuplicate} onAlbum={openAlbum} deletingId={deletingId} />}
            {section === 'davetiyeler' && <InvitationsView invitations={invitations} viewsMap={viewsMap} onDelete={handleDelete} onDuplicate={handleDuplicate} onAlbum={openAlbum} onRestore={(inv: any) => setInvitations((l) => [{ ...inv }, ...l])} deletingId={deletingId} />}
            {section === 'misafirler' && <GuestsView invitations={invitations} />}
            {section === 'istatistikler' && <StatsView invitations={invitations} />}
            {section === 'ayarlar' && <SettingsView />}
          </>
        )}

        {/* Misafir Albümü yönetimi */}
        {albumInv && (
          <div className="db-album-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAlbumInv(null); }}>
            <div className="db-album">
              <div className="db-album-head">
                <div>
                  <h3><Images size={18} /> Anı Albümü</h3>
                  <small>{albumInv.title} · {albumPhotos.length} fotoğraf</small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {albumPhotos.length > 0 && (
                    <button className="db-btn ghost" onClick={downloadAllPhotos}><Download size={14} /> Tümünü İndir</button>
                  )}
                  <button className="db-btn ghost" onClick={() => setAlbumInv(null)}><X size={14} /> Kapat</button>
                </div>
              </div>
              {albumLoading ? (
                <div className="db-empty">Yükleniyor…</div>
              ) : albumPhotos.length === 0 ? (
                <div className="db-empty"><EmptyArt />Albüm henüz boş. Misafirler davet sayfasının altından fotoğraf yükleyebilir.</div>
              ) : (
                <div className="db-album-grid">
                  {albumPhotos.map((p) => (
                    <div key={p.id} className="db-album-item">
                      <img src={p.url} alt="" loading="lazy" />
                      {p.guestName && <span className="db-album-name">{p.guestName}</span>}
                      <div className="db-album-actions">
                        <a href={p.url} download className="db-album-btn" title="İndir"><Download size={14} /></a>
                        <button className="db-album-btn danger" onClick={() => deletePhoto(p)} title="Sil"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* ---------- PANEL ---------- */
const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, '0');

const Countdown = ({ inv }: any) => {
  const target = new Date(inv.eventDate).getTime();
  const [left, setLeft] = useState(target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (left <= 0) return null;
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <section className="db-hero">
      <div className="db-hero-info">
        <span className="db-hero-label"><CalendarClock size={14} /> Yaklaşan Etkinlik</span>
        <h2>{inv.title}</h2>
        <p className="db-hero-date">{fmtDate(inv.eventDate)}</p>
      </div>
      <div className="db-count">
        <div><b>{d}</b><span>Gün</span></div>
        <div><b>{pad2(h)}</b><span>Saat</span></div>
        <div><b>{pad2(m)}</b><span>Dak</span></div>
        <div><b>{pad2(s)}</b><span>San</span></div>
      </div>
    </section>
  );
};

/* Geri sayım yalnızca düğün davetleri için gösterilir (doğum günü/kutlama hariç) */
const NON_WEDDING_THEME = /^(balon|konfeti|kutlama)/;
const isWeddingInv = (inv: any) =>
  !NON_WEDDING_THEME.test(String(inv?.config?.theme || '')) &&
  !/doğum|dogum|kutlama/i.test(String(inv?.title || ''));

const PanelView = ({ invitations, totalRsvp, totalViews, viewsMap, recentGuests, onGo, onDelete, onDuplicate, onAlbum, deletingId }: any) => {
  const next = invitations
    .filter((i: any) => isWeddingInv(i) && i.eventDate && new Date(i.eventDate).getTime() > Date.now())
    .sort((a: any, b: any) => +new Date(a.eventDate) - +new Date(b.eventDate))[0];

  return (
    <>
      {next && <Countdown inv={next} />}

      <section className="db-cards">
        <Stat lab="Davetiyelerim" val={invitations.length} ico={<Mail size={18} />} />
        <Stat lab="Toplam RSVP" val={totalRsvp} ico={<MailOpen size={18} />} gold />
        <Stat lab="Görüntülenme" val={totalViews} ico={<Eye size={18} />} />
        <Stat lab="Yayında" val={invitations.length} ico={<BarChart3 size={18} />} />
      </section>

      <div className="db-panel-grid">
        <div className="db-panel">
          <div className="db-panel-head">
            <h3>Son Davetiyelerim</h3>
            <button className="db-link" onClick={() => onGo('davetiyeler')}>Tümünü gör →</button>
          </div>
          {invitations.length === 0 ? (
            <div className="db-empty"><EmptyArt />Henüz davetiyen yok. <Link to="/editor" className="db-link">İlk davetini oluştur →</Link></div>
          ) : (
            <div className="db-quick">
              {invitations.slice(0, 5).map((inv: any) => (
                <button key={inv.id} className="db-quick-item" onClick={() => onGo('davetiyeler')} title="Davetiyeler sayfasında aç">
                  <span className="db-quick-dot" style={{ background: grad(inv?.config?.theme) }} />
                  <span className="db-quick-info">
                    <b>{inv.title || 'Davetiye'}</b>
                    <small>/davet/{inv.slug} · {fmtDate(inv.eventDate)}</small>
                  </span>
                  <span className="db-quick-meta">
                    <em>{inv?._count?.guests ?? 0} RSVP</em>
                    <em>{viewsMap?.[inv.id] ?? '—'} görüntülenme</em>
                  </span>
                  <ChevronRight size={17} className="db-quick-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="db-panel">
          <div className="db-panel-head">
            <h3>Son RSVP Yanıtları</h3>
            <button className="db-link" onClick={() => onGo('misafirler')}>Tümü →</button>
          </div>
          {recentGuests.length === 0 ? (
            <div className="db-empty" style={{ padding: '24px 8px' }}>Henüz yanıt gelmedi.<br />Davet linkini paylaşınca yanıtlar burada görünür.</div>
          ) : (
            <div className="db-recent">
              {recentGuests.map((g: any) => (
                <div key={g.id} className="db-recent-item">
                  <div>
                    <b>{g.name}</b>
                    {(g.companionCount ?? 0) > 1 && <em> +{g.companionCount - 1} kişi</em>}
                    <small>{g.invTitle}</small>
                  </div>
                  <span className={`db-tag ${g.status === 'attending' ? 'green' : g.status === 'not_attending' ? 'red' : 'gray'}`}>
                    {g.status === 'attending' ? 'Katılıyor' : g.status === 'not_attending' ? 'Katılmıyor' : g.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ---------- DAVETİYELER (+ çöp kutusu) ---------- */
const InvitationsView = ({ invitations, viewsMap, onDelete, onDuplicate, onAlbum, onRestore, deletingId }: any) => {
  const [trash, setTrash] = useState<any[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    invitationService.getTrash().then(setTrash).catch(() => {});
    // yayından kaldırılınca liste değişir → çöp kutusunu tazele
  }, [invitations.length]);

  const restore = async (inv: any) => {
    setRestoringId(inv.id);
    try {
      const restored = await invitationService.restoreInvitation(inv.id);
      setTrash((l) => l.filter((x) => x.id !== inv.id));
      onRestore?.({ ...inv, ...restored });
    } catch {
      alert('Geri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      {invitations.length === 0
        ? <div className="db-empty"><EmptyArt />Henüz davetiyen yok. <Link to="/editor" className="db-link">İlk davetini oluştur →</Link></div>
        : <div className="inv-grid">{invitations.map((inv: any) => <InvCard key={inv.id} inv={inv} views={viewsMap?.[inv.id]} onDelete={onDelete} onDuplicate={onDuplicate} onAlbum={onAlbum} deletingId={deletingId} />)}</div>}

      {trash.length > 0 && (
        <div className="db-panel" style={{ marginTop: 18 }}>
          <div className="db-panel-head">
            <h3>🗑 Çöp Kutusu ({trash.length})</h3>
            <button className="db-link" onClick={() => setTrashOpen(!trashOpen)}>{trashOpen ? 'Gizle' : 'Göster'} →</button>
          </div>
          {trashOpen && (
            <div className="db-recent">
              {trash.map((inv: any) => (
                <div key={inv.id} className="db-recent-item">
                  <div>
                    <b>{inv.title || 'Davetiye'}</b>
                    <small>/davet/{inv.slug} · 30 gün içinde geri alınabilir</small>
                  </div>
                  <button className="db-btn ghost" onClick={() => restore(inv)} disabled={restoringId === inv.id}>
                    <Undo2 size={14} /> {restoringId === inv.id ? 'Alınıyor…' : 'Geri Al'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

const InvCard = ({ inv, views, onDelete, onDuplicate, onAlbum, deletingId }: any) => {
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const url = `${window.location.origin}/davet/${inv.slug}`;
  // WhatsApp'ta başlık + görselli önizleme kartı çıksın diye OG linki paylaşılır
  const shareUrl = `${ABS_API_URL}/invitations/og/${inv.slug}`;

  const handleEdit = () => {
    localStorage.setItem('davetim_edit_temp', JSON.stringify(inv));
    window.location.href = `/editor?edit=1&id=${inv.id}`;
  };

  const downloadQr = async () => {
    setQrLoading(true);
    try {
      await qrService.download(inv.id, `${inv.slug}-qr.png`);
    } catch {
      alert('QR kod indirilemedi.');
    } finally {
      setQrLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard erişimi yoksa sessiz geç */ }
  };

  const { ref: thumbRef, inView } = useInView();

  return (
    <div className="inv-card">
      <div ref={thumbRef} className="inv-thumb" style={{ overflow: 'hidden', position: 'relative', height: 160, background: grad(inv?.config?.theme) }}>
        {inView && (
          <iframe
            title="thumbnail"
            loading="lazy"
            src={`/davet-preview.html?v=20260702a&thumb=1#cfg=${btoa(unescape(encodeURIComponent(JSON.stringify(inv?.config || {}))))}`}
            style={{ width: 1000, height: 1600, transform: 'scale(0.35)', transformOrigin: 'top left', border: 0, pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}
          />
        )}
        <span className="inv-badge" style={{ zIndex: 10 }}>Yayında</span>
      </div>
      <div className="inv-body">
        <h4>{inv.title || 'Düğün Davetiyesi'}</h4>
        <p className="inv-slug">/davet/{inv.slug}</p>
        <div className="inv-meta">
          <div><span>TARİH</span><b>{fmtDate(inv.eventDate)}</b></div>
          <div><span>RSVP</span><b>{inv?._count?.guests ?? 0}</b></div>
          <div><span>GÖRÜNTÜLENME</span><b>{views ?? '—'}</b></div>
        </div>
        <div className="inv-actions">
          <a href={`/davet/${inv.slug}`} target="_blank" rel="noreferrer" className="db-btn"><ExternalLink size={15} /> Görüntüle</a>
          <button onClick={handleEdit} className="db-btn ghost"><Edit3 size={15} /> Özelleştir</button>
          <button onClick={() => onDuplicate?.(inv)} className="db-btn ghost" title="Aynı içerikle yeni davet oluştur"><CopyPlus size={15} /> Kopyala</button>
          <button onClick={() => onAlbum?.(inv)} className="db-btn ghost" title="Misafirlerin yüklediği fotoğraflar"><Images size={15} /> Albüm</button>
        </div>
        <div className="inv-actions">
          <button onClick={copyLink} className={`db-btn ghost ${copied ? 'ok' : ''}`}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Kopyalandı!' : 'Link'}
          </button>
          <button onClick={downloadQr} className="db-btn ghost" disabled={qrLoading} title="Masalara koymak için QR kodu indir">
            <QrCode size={15} /> {qrLoading ? 'İndiriliyor…' : 'QR'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${inv.title} 💌 ${shareUrl}`)}`}
            target="_blank" rel="noreferrer" className="db-btn wa"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <button className="db-btn danger" onClick={() => onDelete?.(inv)} disabled={deletingId === inv.id} title="Yayından Kaldır (30 gün çöp kutusunda kalır)">
            <Trash2 size={15} /> {deletingId === inv.id ? 'Kaldırılıyor…' : 'Kaldır'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- MİSAFİR LİSTESİ ---------- */
const GuestsView = ({ invitations }: any) => {
  const [sel, setSel] = useState(invitations[0]?.id || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addStatus, setAddStatus] = useState('attending');
  const [addCount, setAddCount] = useState(1);
  const [addLoading, setAddLoading] = useState(false);

  const fetchGuests = () => {
    if (!sel) return;
    setLoading(true);
    guestListService.byInvitation(sel)
      .then((d: any) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGuests();
  }, [sel]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" adlı misafiri silmek istediğinize emin misiniz?`)) return;
    try {
      await api.delete(`/guests/${id}`); // Direct api call or add to service
      setData((prev: any) => prev.filter((g: any) => g.id !== id));
    } catch (err) {
      alert('Silinemedi, lütfen tekrar deneyin.');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      // Create guest manually
      await guestService.submitRsvp({
        invitationId: sel,
        name: addName,
        coming: addStatus === 'attending',
        companionCount: addCount,
        message: 'Elden Davetiye (Manuel Eklendi)',
      });
      setIsAdding(false);
      setAddName('');
      setAddStatus('attending');
      setAddCount(1);
      fetchGuests();
    } catch (err) {
      alert('Eklenemedi, lütfen tekrar deneyin.');
    } finally {
      setAddLoading(false);
    }
  };

  const exportCSV = () => {
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Ad Soyad,Durum,Kişi Sayısı,Yemek Tercihi,Alerji Notu,Mesaj\n";

    list.forEach((g: any) => {
      const name = `"${g.name.replace(/"/g, '""')}"`;
      const status = g.status === 'attending' ? 'Katılıyor' : g.status === 'not_attending' ? 'Katılmıyor' : g.status;
      const count = g.companionCount || 0;
      const meal = `"${(g.mealPreference || '').replace(/"/g, '""')}"`;
      const allergy = `"${(g.allergyNote || '').replace(/"/g, '""')}"`;
      const msg = `"${(g.message || '').replace(/"/g, '""')}"`;
      csvContent += `${name},${status},${count},${meal},${allergy},${msg}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "misafir_listesi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (invitations.length === 0) return <div className="db-empty">Önce bir davetiye oluştur, sonra RSVP yanıtları burada görünür.</div>;

  const list = Array.isArray(data) ? data : [];
  const attending = list.filter((g: any) => g.status === 'attending').length;
  const notAttending = list.filter((g: any) => g.status === 'not_attending').length;

  return (
    <>
      <div className="db-picker" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Davetiye:</label>
          <select value={sel} onChange={(e) => setSel(e.target.value)}>
            {invitations.map((i: any) => <option key={i.id} value={i.id}>{i.title}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="db-btn" onClick={() => setIsAdding(true)}><Plus size={16} /> Misafir Ekle</button>
          <button className="db-btn" onClick={exportCSV} disabled={list.length === 0}><Download size={16} /> Excel (CSV)</button>
          {(() => {
            const inv = invitations.find((i: any) => i.id === sel);
            if (!inv) return null;
            const text = `Merhaba! 💌 "${inv.title}" davetimize henüz yanıt vermediyseniz linkten katılım durumunuzu bildirebilir misiniz? ${window.location.origin}/davet/${inv.slug}`;
            return (
              <a className="db-btn wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" title="Yanıt vermeyenlere WhatsApp'tan hatırlatma gönder">
                <Megaphone size={15} /> Hatırlatma Gönder
              </a>
            );
          })()}
        </div>
      </div>
      
      {isAdding && (
        <div className="ed-preview-fab" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: 0, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Manuel Misafir Ekle</h3>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="settings-row" style={{ display: 'block', marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Ad Soyad</label>
                <input style={{ width: '100%', padding: '8px' }} required value={addName} onChange={(e) => setAddName(e.target.value)} />
              </div>
              <div className="settings-row" style={{ display: 'block', marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Durum</label>
                <select style={{ width: '100%', padding: '8px' }} value={addStatus} onChange={(e) => setAddStatus(e.target.value)}>
                  <option value="attending">Katılıyor</option>
                  <option value="not_attending">Katılmıyor</option>
                </select>
              </div>
              <div className="settings-row" style={{ display: 'block', marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Kişi Sayısı</label>
                <input style={{ width: '100%', padding: '8px' }} type="number" min="1" required value={addCount} onChange={(e) => setAddCount(parseInt(e.target.value) || 1)} />
              </div>
              <button className="db-btn" type="submit" disabled={addLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {addLoading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="db-cards">
        <Stat lab="Toplam Yanıt" val={list.length} ico={<Users size={18} />} />
        <Stat lab="Katılıyor" val={attending} ico={<MailOpen size={18} />} gold />
        <Stat lab="Katılmıyor" val={notAttending} ico={<Mail size={18} />} />
      </section>
      <div className="db-panel">
        {loading ? <div className="db-empty">Yükleniyor…</div> : list.length === 0 ? (
          <div className="db-empty">Bu davete henüz yanıt gelmedi.</div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Ad Soyad</th><th>Durum</th><th>Kişi</th><th>Yemek</th><th>Alerji</th><th>Mesaj</th><th style={{width:'50px',textAlign:'center'}}>Sil</th></tr></thead>
              <tbody>
                {list.map((g: any) => (
                  <tr key={g.id}>
                    <td>{g.name}</td>
                    <td><span className={`db-tag ${g.status === 'attending' ? 'green' : g.status === 'not_attending' ? 'red' : 'gray'}`}>
                      {g.status === 'attending' ? 'Katılıyor' : g.status === 'not_attending' ? 'Katılmıyor' : g.status}</span></td>
                    <td>{g.companionCount ?? 0}</td>
                    <td>{g.mealPreference || '—'}</td>
                    <td className="db-msg">{g.allergyNote || '—'}</td>
                    <td className="db-msg">{g.message || '—'}</td>
                    <td style={{textAlign:'center'}}>
                      <button onClick={() => handleDelete(g.id, g.name)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* ---------- İSTATİSTİKLER ---------- */
const StatsView = ({ invitations }: any) => {
  const [sel, setSel] = useState(invitations[0]?.id || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sel) return;
    setLoading(true);
    statsService.byInvitation(sel)
      .then((d: any) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [sel]);

  if (invitations.length === 0) return <div className="db-empty">Önce bir davetiye oluştur, istatistikler burada görünür.</div>;

  const sum = data?.summary || { views: 0, visitors: 0, cities: {}, devices: {} };
  const cities = Object.entries(sum.cities || {}).sort((a: any, b: any) => b[1] - a[1]);
  const devices = Object.entries(sum.devices || {}).sort((a: any, b: any) => b[1] - a[1]);

  return (
    <>
      <div className="db-picker">
        <label>Davetiye:</label>
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          {invitations.map((i: any) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
      </div>
      {loading ? <div className="db-empty">Yükleniyor…</div> : (
        <>
          <section className="db-cards">
            <Stat lab="Görüntülenme" val={sum.views ?? 0} ico={<Eye size={18} />} gold />
            <Stat lab="Ziyaretçi" val={sum.visitors ?? 0} ico={<Users size={18} />} />
          </section>

          {Array.isArray(data?.daily) && data.daily.some((d: any) => d.views > 0) && (
            <div className="db-panel" style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16, fontSize: 15, color: 'var(--color-text-primary)' }}>Son 14 Gün — Günlük Görüntülenme</h4>
              <DailyChart daily={data.daily} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div className="db-panel">
              <h4 style={{ marginBottom: 16, fontSize: 15, color: 'var(--color-text-primary)' }}>Şehir Dağılımı</h4>
              {cities.length === 0 ? <p className="db-empty" style={{ padding: 0, textAlign: 'left' }}>Henüz yeterli veri yok.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cities.slice(0, 5).map(([city, count]: any) => (
                    <div key={city}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{city}</span>
                        <strong>{count}</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (count / sum.views) * 100)}%`, height: '100%', background: 'var(--color-accent-gold)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="db-panel">
              <h4 style={{ marginBottom: 16, fontSize: 15, color: 'var(--color-text-primary)' }}>Cihaz Dağılımı</h4>
              {devices.length === 0 ? <p className="db-empty" style={{ padding: 0, textAlign: 'left' }}>Henüz yeterli veri yok.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {devices.map(([dev, count]: any) => (
                    <div key={dev}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{dev}</span>
                        <strong>{count}</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (count / sum.views) * 100)}%`, height: '100%', background: '#5f7050' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ---------- AYARLAR ---------- */
const SettingsView = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr(''); setSavingProfile(true);
    try {
      const r = await settingsService.update({ name, email });
      updateUser({ name: r?.user?.name ?? name, email: r?.user?.email ?? email });
      setProfileMsg('Profil güncellendi.');
    } catch (err: any) {
      setProfileErr(err?.response?.data?.message || 'Güncellenemedi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(''); setPassErr(''); setSavingPass(true);
    try {
      await settingsService.changePassword(curPass, newPass);
      setPassMsg('Şifren değiştirildi.');
      setCurPass(''); setNewPass('');
    } catch (err: any) {
      setPassErr(err?.response?.data?.message || 'Şifre değiştirilemedi.');
    } finally {
      setSavingPass(false);
    }
  };

  const [deleting, setDeleting] = useState(false);
  const deleteAccount = async () => {
    if (!window.confirm('Hesabını ve tüm davetiyelerini kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
    if (!window.confirm('Son kez soruyoruz: hesabı tamamen sil?')) return;
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      logout();
      navigate('/');
    } catch {
      alert('Hesap silinemedi. Lütfen tekrar deneyin.');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="db-panel" style={{ marginBottom: 18 }}>
        <div className="db-panel-head"><h3>Profil Bilgileri</h3></div>
        <form onSubmit={saveProfile} className="settings-form">
          <div className="settings-row">
            <label>Ad Soyad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="settings-row">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {profileErr && <div className="db-tag red" style={{ marginBottom: 10 }}>{profileErr}</div>}
          {profileMsg && <div className="db-tag green" style={{ marginBottom: 10 }}>{profileMsg}</div>}
          <button className="db-btn" disabled={savingProfile}>{savingProfile ? 'Kaydediliyor…' : 'Profili Kaydet'}</button>
        </form>
      </div>

      <div className="db-panel" style={{ marginBottom: 18 }}>
        <div className="db-panel-head"><h3>Şifre Değiştir</h3></div>
        <form onSubmit={savePassword} className="settings-form">
          <div className="settings-row">
            <label>Mevcut şifre</label>
            <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} required />
          </div>
          <div className="settings-row">
            <label>Yeni şifre</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={8} />
            <small className="hint">En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermeli.</small>
          </div>
          {passErr && <div className="db-tag red" style={{ marginBottom: 10 }}>{passErr}</div>}
          {passMsg && <div className="db-tag green" style={{ marginBottom: 10 }}>{passMsg}</div>}
          <button className="db-btn" disabled={savingPass}>{savingPass ? 'Kaydediliyor…' : 'Şifreyi Değiştir'}</button>
        </form>
      </div>

      <div className="db-panel" style={{ marginBottom: 18 }}>
        <div className="db-panel-head"><h3>Verilerim (KVKK)</h3></div>
        <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
          Hesabına ait tüm verileri (profil, davetiyeler, misafir listeleri) JSON dosyası olarak indirebilirsin.
        </p>
        <button className="db-btn ghost" onClick={() => settingsService.exportData().catch(() => alert('İndirilemedi, tekrar deneyin.'))}>
          <Download size={15} /> Verilerimi İndir (JSON)
        </button>
      </div>

      <div className="db-panel danger-zone">
        <div className="db-panel-head"><h3>Tehlikeli Bölge</h3></div>
        <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
          Hesabını sildiğinde tüm davetiyelerin, misafir listelerin ve verilerin kalıcı olarak silinir.
        </p>
        <button className="db-btn danger" onClick={deleteAccount} disabled={deleting}>
          <Trash2 size={15} /> {deleting ? 'Siliniyor…' : 'Hesabı Sil'}
        </button>
      </div>
    </>
  );
};

/* Kütüphanesiz mini çizgi grafik (son 14 gün) */
const DailyChart = ({ daily }: { daily: { date: string; views: number }[] }) => {
  const W = 640, H = 150, PAD = 24;
  const max = Math.max(1, ...daily.map((d) => d.views));
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (daily.length - 1);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const points = daily.map((d, i) => `${x(i)},${y(d.views)}`).join(' ');
  const area = `${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`;
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 460, display: 'block' }}>
        <polygon points={area} fill="rgba(212,175,55,0.14)" />
        <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {daily.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.views)} r={d.views > 0 ? 3.5 : 2} fill={d.views > 0 ? '#b5952f' : '#e5ddc8'}>
              <title>{`${d.date}: ${d.views} görüntülenme`}</title>
            </circle>
            {(i === 0 || i === daily.length - 1 || i === Math.floor(daily.length / 2)) && (
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#8a8a8a">
                {d.date.slice(5).replace('-', '.')}
              </text>
            )}
          </g>
        ))}
        <text x={PAD - 4} y={y(max) + 4} textAnchor="end" fontSize="10" fill="#8a8a8a">{max}</text>
      </svg>
    </div>
  );
};

const Stat = ({ lab, val, ico, gold }: any) => (
  <div className="db-stat">
    <i className="db-stat-ico">{ico}</i>
    <div className="db-stat-body">
      <span className="db-stat-lab">{lab}</span>
      <b className={gold ? 'gold' : ''}>{val}</b>
    </div>
  </div>
);

export default Dashboard;
