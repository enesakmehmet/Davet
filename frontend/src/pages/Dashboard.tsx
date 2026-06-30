import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, LayoutDashboard, Mail, Users, BarChart3,
  Settings, Plus, Eye, MailOpen, UserCircle,
  MoreHorizontal, CreditCard, Activity, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { invitationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const TABS = ['Davetiyelerim', 'Şablonlarım', 'Satın Aldıklarım', 'Paket Bilgileri'];

const THEME_GRAD: Record<string, string> = {
  altin: 'linear-gradient(135deg,#9c7a31,#e8d6a8)', gul: 'linear-gradient(135deg,#b35a72,#f6dbe2)',
  minimal: 'linear-gradient(135deg,#1a1a1a,#d8d8d8)', bohem: 'linear-gradient(135deg,#5f7050,#cdbfa6)',
  lacivert: 'linear-gradient(135deg,#0e1a33,#c9a14e)', lavanta: 'linear-gradient(135deg,#6f54a0,#e3d6f3)',
  sonbahar: 'linear-gradient(135deg,#8a3d1c,#ecd9bf)', deniz: 'linear-gradient(135deg,#1c7484,#bfe6ec)',
  tropikal: 'linear-gradient(135deg,#136443,#bfe6cf)', havai: 'linear-gradient(135deg,#070912,#cbab53)',
  sinematik: 'linear-gradient(135deg,#0b0b0d,#c9a14e)',
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
  const [activeTab, setActiveTab] = useState('Davetiyelerim');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await invitationService.getUserInvitations();
        setInvitations(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError('Davetiyeler yüklenemedi. Backend çalışıyor mu?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="text-gold font-serif text-2xl font-bold">Davetim</Link>
          <p className="text-xs text-secondary mt-1 tracking-widest uppercase">Wedding Suite</p>
        </div>

        <Link to="/editor" className="btn-primary w-full flex-center gap-2 mt-8 mb-8 py-3">
          <Plus size={18} /> Yeni Oluştur
        </Link>

        <nav className="sidebar-nav">
          <button className="nav-item active"><LayoutDashboard size={20} /> Panel</button>
          <button className="nav-item"><Mail size={20} /> Davetiyeler</button>
          <button className="nav-item"><Users size={20} /> Misafir Listesi</button>
          <button className="nav-item"><BarChart3 size={20} /> İstatistikler</button>
        </nav>

        <div className="sidebar-footer mt-auto pt-8 border-t border-border">
          <button className="nav-item"><Settings size={20} /> Ayarlar</button>
          <div className="user-profile flex items-center gap-3 mt-4 p-2 rounded">
            <UserCircle size={32} color="var(--color-text-secondary)" />
            <div className="text-left" style={{ flex: 1 }}>
              <p className="text-sm font-bold">{user?.name || 'Kullanıcı'}</p>
              <button onClick={logout} className="text-xs text-secondary" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Çıkış yap</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main bg-bg">
        <header className="dashboard-header flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-serif mb-1">Tekrar Hoş Geldin, {user?.name?.split(' ')[0] || ''}</h1>
            <p className="text-sm text-secondary">İşte etkinliklerinin genel bir özeti.</p>
          </motion.div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full border border-border relative">
              <Bell size={20} className="text-secondary" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-gold rounded-full"></span>
            </button>
          </div>
        </header>

        <section className="metrics-grid mb-12">
          <MetricCard title="DAVETİYELERİM" icon={<Mail size={20} />} value={String(invitations.length)} trend="toplam davetiye" />
          <MetricCard title="YAYINDA" icon={<Eye size={20} />} value={String(invitations.length)} trend="görüntülenebilir" />
          <MetricCard title="ALINAN LCV" icon={<MailOpen size={20} />} value="—" trend="misafir listesinden" />
          <MetricCard title="AÇIK ORANI" icon={<Activity size={20} />} value="—" trend="yakında" />
        </section>

        <section className="content-section">
          <div className="flex gap-8 border-b border-border mb-8">
            {TABS.map(tab => (
              <button key={tab}
                className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab(tab)}>
                {tab}
                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'Davetiyelerim' && (
                <>
                  {loading && <div className="text-secondary text-center py-12">Yükleniyor…</div>}
                  {!loading && error && <div className="text-secondary text-center py-12">{error}</div>}
                  {!loading && !error && invitations.length === 0 && (
                    <div className="text-secondary text-center py-12">
                      Henüz davetiyeniz yok. <Link to="/editor" className="text-gold font-bold">İlk davetinizi oluşturun →</Link>
                    </div>
                  )}
                  {!loading && invitations.length > 0 && (
                    <div className="grid grid-cols-2 gap-6">
                      {invitations.map(inv => <InvitationCard key={inv.id} inv={inv} />)}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Paket Bilgileri' && (
                <div className="bg-white p-8 rounded-2xl border border-border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Ücretsiz Paket</h3>
                    <p className="text-secondary text-sm mb-6">Premium özellikler için yükseltin.</p>
                    <span className="flex items-center gap-2 text-sm"><CreditCard size={16} className="text-gold" /> Kart eklenmedi</span>
                  </div>
                  <div className="text-right">
                    <button className="btn-outline">Yükselt</button>
                  </div>
                </div>
              )}

              {activeTab === 'Şablonlarım' && <div className="text-secondary text-center py-12">Henüz kaydedilmiş özel şablonunuz bulunmuyor.</div>}
              {activeTab === 'Satın Aldıklarım' && <div className="text-secondary text-center py-12">Satın alınan premium eklentiler burada listelenir.</div>}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

const MetricCard = ({ title, icon, value, trend }: any) => (
  <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
    <div className="flex justify-between items-center mb-4 text-secondary text-xs font-bold tracking-wider">
      <span>{title}</span>
      <div className="text-gold">{icon}</div>
    </div>
    <h2 className="text-3xl font-serif mb-2">{value}</h2>
    <p className="text-xs text-secondary">{trend}</p>
  </motion.div>
);

const InvitationCard = ({ inv }: any) => {
  const theme = inv?.config?.theme || 'altin';
  const photo = inv?.config?.photos?.[0];
  const title = inv?.title || 'Düğün Davetiyesi';
  return (
    <div className="bg-white rounded-2xl border border-border flex overflow-hidden shadow-sm group">
      <div className="w-1/3 relative overflow-hidden bg-bg" style={{ minHeight: 160, background: photo ? undefined : THEME_GRAD[theme] }}>
        {photo && <img src={photo} alt={title} className="w-full h-full object-cover" />}
        <span className="absolute top-4 left-4 text-xs font-bold px-2 py-1 rounded bg-gold text-white">Yayında</span>
      </div>
      <div className="w-2/3 p-6 flex flex-col justify-between">
        <div>
          <h4 className="font-serif text-xl mb-1">{title}</h4>
          <p className="text-sm text-secondary mb-6">/davet/{inv.slug}</p>
          <div className="flex gap-8 mb-6">
            <div>
              <p className="text-xs text-secondary tracking-wider mb-1">TARİH</p>
              <p className="text-sm font-bold">{fmtDate(inv.eventDate)}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Link to={`/editor`} className="text-sm font-bold text-gold hover:underline">Düzenle</Link>
          <a href={`/davet/${inv.slug}`} target="_blank" rel="noreferrer" className="text-secondary p-2" title="Görüntüle">
            <ExternalLink size={18} />
          </a>
          <button className="text-secondary p-2"><MoreHorizontal size={20} /></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
