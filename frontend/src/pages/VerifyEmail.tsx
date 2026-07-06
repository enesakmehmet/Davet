import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// Kaba bir mobil tespiti — sadece telefonlarda "Uygulamaya Dön" butonunu göstermek için.
// Masaüstünde bu buton anlamsız olurdu (davetim:// şeması orada zaten kayıtlı değil).
const isMobileUA = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { isLoggedIn, refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('err'); setMsg('Bağlantı eksik veya bozuk.'); return; }
    authService.verifyEmail(token)
      .then(async () => {
        setStatus('ok');
        if (isLoggedIn) await refreshUser();
      })
      .catch((err: any) => {
        setStatus('err');
        setMsg(err?.response?.data?.message || 'Doğrulama başarısız. Bağlantının süresi dolmuş olabilir.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <Link to="/" className="auth-logo">Davetim</Link>
        {status === 'loading' && <p className="auth-sub" style={{ marginTop: 16 }}>Doğrulanıyor…</p>}
        {status === 'ok' && (
          <>
            <h1 className="auth-title">E-posta doğrulandı ✓</h1>
            <p className="auth-sub">Hesabın artık doğrulanmış durumda.</p>
            {isMobileUA && (
              <a className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 12 }} href="davetim://verified">
                Uygulamaya Dön
              </a>
            )}
          </>
        )}
        {status === 'err' && (
          <>
            <h1 className="auth-title">Doğrulanamadı</h1>
            <p className="auth-sub">{msg}</p>
          </>
        )}
        <p className="auth-foot">
          {isLoggedIn ? <Link to="/dashboard">Panele git →</Link> : <Link to="/login">Girişe dön →</Link>}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
