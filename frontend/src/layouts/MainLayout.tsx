import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

const MainLayout = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="main-layout">
      <header className="header container">
        <div className="logo">
          <Link to="/" onClick={() => setMenuOpen(false)}>Davetim</Link>
        </div>
        <nav className="nav-links">
          <Link to="/templates">Şablonlar</Link>
          <a href="#pricing">Fiyatlandırma</a>
          <Link to="/hakkimizda">Hakkımızda</Link>
        </nav>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <span style={{ marginRight: 16, color: 'var(--color-text-secondary)' }}>Merhaba, {user?.name?.split(' ')[0] || ''}</span>
              <Link to="/dashboard" className="btn-outline" style={{ marginRight: 12 }}>Panelim</Link>
              <button className="btn-primary" onClick={logout}>Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 16 }}>Giriş</Link>
              <Link to="/register" className="btn-primary">Başlayın</Link>
            </>
          )}
        </div>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/templates" onClick={() => setMenuOpen(false)}>Şablonlar</Link>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Fiyatlandırma</a>
          <Link to="/hakkimizda" onClick={() => setMenuOpen(false)}>Hakkımızda</Link>
          <div className="mobile-menu-divider" />
          {isLoggedIn ? (
            <>
              <span className="mobile-menu-greet">Merhaba, {user?.name?.split(' ')[0] || ''}</span>
              <Link to="/dashboard" className="btn-outline" onClick={() => setMenuOpen(false)}>Panelim</Link>
              <button className="btn-primary" onClick={() => { setMenuOpen(false); logout(); }}>Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Giriş</Link>
              <Link to="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Başlayın</Link>
            </>
          )}
        </div>
      )}

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer container">
        <div className="footer-col brand">
          <h3>Davetim</h3>
          <p>© 2026 Davetim. Kusursuz Zarafet.</p>
        </div>
        <div className="footer-col">
          <h4>Yasal</h4>
          <Link to="/privacy">Gizlilik</Link>
          <Link to="/terms">Şartlar</Link>
        </div>
        <div className="footer-col">
          <h4>Şirket</h4>
          <Link to="/hakkimizda">Hakkımızda</Link>
          <Link to="/contact">İletişim</Link>
        </div>
        <div className="footer-col">
          <h4>Bizi Takip Edin</h4>
          <a href="#">Instagram</a>
          <a href="#">Pinterest</a>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
