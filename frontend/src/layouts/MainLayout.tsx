import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

const MainLayout = () => {
  const { isLoggedIn, user, logout } = useAuth();
  return (
    <div className="main-layout">
      <header className="header container">
        <div className="logo">
          <Link to="/">Davetim</Link>
        </div>
        <nav className="nav-links">
          <Link to="/templates">Şablonlar</Link>
          <a href="#pricing">Fiyatlandırma</a>
        </nav>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" style={{ marginRight: 16 }}>Merhaba, {user?.name || 'Panelim'}</Link>
              <button className="btn-primary" onClick={logout}>Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 16 }}>Giriş</Link>
              <Link to="/register" className="btn-primary">Başlayın</Link>
            </>
          )}
        </div>
      </header>

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
          <h4>İletişim</h4>
          <Link to="/contact">İletişim</Link>
          <a href="#">Instagram</a>
          <a href="#">Pinterest</a>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
