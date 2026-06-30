import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Mail, Users, BarChart3, Plus, UserCircle,
  ExternalLink, Eye, MailOpen, Edit3, Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { invitationService, guestListService, statsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

type Section = 'panel' | 'davetiyeler' | 'misafirler' | 'istatistikler';

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: 'panel', label: 'Panel', icon: LayoutDashboard },
  { id: 'davetiyeler', label: 'Davetiyeler', icon: Mail },
  { id: 'misafirler', label: 'Misafir Listesi', icon: Users },
  { id: 'istatistikler', label: 'İstatistikler', icon: BarChart3 },
];

const THEME_GRAD: Record<string, string> = {
  altin: 'linear-gradient(135deg,#9c7a31,#e8d6a8)', gul: 'linear-gradient(135deg,#b35a72,#f6dbe2)',
  minimal: 'linear-gradient(135deg,#1a1a1a,#d8d8d8)', bohem: 'linear-gradient(135deg,#5f7050,#cdbfa6)',
  lacivert: 'linear-gradient(135deg,#0e1a33,#c9a14e)', lavanta: 'linear-gradient(135deg,#6f54a0,#e3d6f3)',
  sonbahar: 'linear-gradient(135deg,#8a3d1c,#ecd9bf)', deniz: 'linear-gradient(135deg,#1c7484,#bfe6ec)',
  tropikal: 'linear-gradient(135deg,#136443,#2aa56c)', havai: 'linear-gradient(135deg,#070912,#cbab53)',
  sinematik: 'linear-gradient(135deg,#0b0b0d,#c9a14e)',
  balon: 'linear-gradient(135deg,#e84393,#ffd6e8)', konfeti: 'linear-gradient(135deg,#120a24,#f5c542)',
  kutlamaPop: 'linear-gradient(135deg,#ff5e8a,#ffd1e0)', kutlamaGece: 'linear-gradient(135deg,#0f0a22,#ffd86b)',
};
const grad = (t?: string) => THEME_GRAD[t || 'altin'] || THEME_GRAD.altin;

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

  useEffect(() => {
    (async () => {
      try {
        const data = await invitationService.getUserInvitations();
        setInvitations(Array.isArray(data) ? data : []);
      } catch {
        setError('Davetiyeler yüklenemedi. (Giriş yaptın mı / backend açık mı?)');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRsvp = invitations.reduce((s, i) => s + (i?._count?.guests || 0), 0);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDelete = async (inv: any) => {
    if (!window.confirm(`"${inv.title || 'Davetiye'}" yayından kaldırılsın mı? Bu davetiye bağlantısı artık açılmaz.`)) return;
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
            <UserCircle size={32} color="var(--color-text-secondary)" />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p className="db-user-name">{user?.name || 'Kullanıcı'}</p>
              <button onClick={logout} className="db-logout">Çıkış yap</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="db-head">
          <div>
            <h1 className="db-title">{NAV.find((n) => n.id === section)?.label}</h1>
            <p className="db-sub">Hoş geldin, {user?.name?.split(' ')[0] || ''}</p>
          </div>
        </header>

        {loading && <div className="db-empty">Yükleniyor…</div>}
        {!loading && error && <div className="db-empty">{error}</div>}

        {!loading && !error && (
          <>
            {section === 'panel' && <PanelView invitations={invitations} totalRsvp={totalRsvp} onGo={setSection} onDelete={handleDelete} deletingId={deletingId} />}
            {section === 'davetiyeler' && <InvitationsView invitations={invitations} onDelete={handleDelete} deletingId={deletingId} />}
            {section === 'misafirler' && <GuestsView invitations={invitations} />}
            {section === 'istatistikler' && <StatsView invitations={invitations} />}
          </>
        )}
      </main>
    </div>
  );
};

/* ---------- PANEL ---------- */
const PanelView = ({ invitations, totalRsvp, onGo, onDelete, deletingId }: any) => (
  <>
    <section className="db-cards">
      <Stat lab="Davetiyelerim" val={invitations.length} ico={<Mail size={18} />} />
      <Stat lab="Toplam RSVP" val={totalRsvp} ico={<MailOpen size={18} />} gold />
      <Stat lab="Yayında" val={invitations.length} ico={<Eye size={18} />} />
    </section>

    <div className="db-panel">
      <div className="db-panel-head">
        <h3>Son Davetiyelerim</h3>
        <button className="db-link" onClick={() => onGo('davetiyeler')}>Tümünü gör →</button>
      </div>
      {invitations.length === 0 ? (
        <div className="db-empty">Henüz davetiyen yok. <Link to="/editor" className="db-link">İlk davetini oluştur →</Link></div>
      ) : (
        <div className="inv-grid">{invitations.slice(0, 4).map((inv: any) => <InvCard key={inv.id} inv={inv} onDelete={onDelete} deletingId={deletingId} />)}</div>
      )}
    </div>
  </>
);

/* ---------- DAVETİYELER ---------- */
const InvitationsView = ({ invitations, onDelete, deletingId }: any) => (
  invitations.length === 0
    ? <div className="db-empty">Henüz davetiyen yok. <Link to="/editor" className="db-link">İlk davetini oluştur →</Link></div>
    : <div className="inv-grid">{invitations.map((inv: any) => <InvCard key={inv.id} inv={inv} onDelete={onDelete} deletingId={deletingId} />)}</div>
);

const InvCard = ({ inv, onDelete, deletingId }: any) => {
  const photo = inv?.config?.photos?.[0];
  return (
    <div className="inv-card">
      <div className="inv-thumb" style={{ background: photo ? undefined : grad(inv?.config?.theme) }}>
        {photo && <img src={photo} alt="" />}
        <span className="inv-badge">Yayında</span>
      </div>
      <div className="inv-body">
        <h4>{inv.title || 'Düğün Davetiyesi'}</h4>
        <p className="inv-slug">/davet/{inv.slug}</p>
        <div className="inv-meta">
          <div><span>TARİH</span><b>{fmtDate(inv.eventDate)}</b></div>
          <div><span>RSVP</span><b>{inv?._count?.guests ?? 0}</b></div>
        </div>
        <div className="inv-actions">
          <a href={`/davet/${inv.slug}`} target="_blank" rel="noreferrer" className="db-btn"><ExternalLink size={15} /> Görüntüle</a>
          <Link to="/editor" className="db-btn ghost"><Edit3 size={15} /> Yeni</Link>
          <button className="db-btn danger" onClick={() => onDelete?.(inv)} disabled={deletingId === inv.id}>
            <Trash2 size={15} /> {deletingId === inv.id ? 'Kaldırılıyor…' : 'Yayından Kaldır'}
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

  useEffect(() => {
    if (!sel) return;
    setLoading(true);
    guestListService.byInvitation(sel)
      .then((d: any) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [sel]);

  if (invitations.length === 0) return <div className="db-empty">Önce bir davetiye oluştur, sonra RSVP yanıtları burada görünür.</div>;

  const list = Array.isArray(data) ? data : [];
  const attending = list.filter((g: any) => g.status === 'attending').length;
  const notAttending = list.filter((g: any) => g.status === 'not_attending').length;

  return (
    <>
      <div className="db-picker">
        <label>Davetiye:</label>
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          {invitations.map((i: any) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
      </div>
      <section className="db-cards">
        <Stat lab="Toplam Yanıt" val={list.length} ico={<Users size={18} />} />
        <Stat lab="Katılıyor" val={attending} ico={<MailOpen size={18} />} gold />
        <Stat lab="Katılmıyor" val={notAttending} ico={<Mail size={18} />} />
      </section>
      <div className="db-panel">
        {loading ? <div className="db-empty">Yükleniyor…</div> : list.length === 0 ? (
          <div className="db-empty">Bu davete henüz yanıt gelmedi.</div>
        ) : (
          <table className="db-table">
            <thead><tr><th>Ad Soyad</th><th>Durum</th><th>Kişi</th><th>Mesaj</th></tr></thead>
            <tbody>
              {list.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td><span className={`db-tag ${g.status === 'attending' ? 'green' : g.status === 'not_attending' ? 'red' : 'gray'}`}>
                    {g.status === 'attending' ? 'Katılıyor' : g.status === 'not_attending' ? 'Katılmıyor' : g.status}</span></td>
                  <td>{g.companionCount ?? 0}</td>
                  <td className="db-msg">{g.message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

  const sum = data?.summary || { views: 0, visitors: 0 };
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
          <div className="db-panel">
            <p className="db-empty" style={{ padding: 16 }}>
              Görüntülenme verisi, davet linki açıldıkça artar. Davetini paylaştıkça bu sayılar yükselir.
            </p>
          </div>
        </>
      )}
    </>
  );
};

const Stat = ({ lab, val, ico, gold }: any) => (
  <div className="db-stat">
    <div className="db-stat-top"><span>{lab}</span><i>{ico}</i></div>
    <b className={gold ? 'gold' : ''}>{val}</b>
  </div>
);

export default Dashboard;
