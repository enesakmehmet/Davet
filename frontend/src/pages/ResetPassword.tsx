import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bağlantı geçersiz veya süresi dolmuş. Yeniden talep edin.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-logo">Davetim</Link>
          <h1 className="auth-title">Geçersiz bağlantı</h1>
          <p className="auth-sub">Bu link eksik veya bozuk görünüyor.</p>
          <p className="auth-foot"><Link to="/forgot-password">Yeni bağlantı iste →</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Davetim</Link>
        <h1 className="auth-title">Yeni şifre belirle</h1>
        <p className="auth-sub">Hesabın için yeni bir şifre gir</p>

        {error && <div className="auth-err">{error}</div>}

        {done ? (
          <p style={{ fontSize: 14, color: '#2e7d52', textAlign: 'center', lineHeight: 1.6 }}>
            Şifren değiştirildi. Girişe yönlendiriliyorsun…
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="auth-field">
              <label>Yeni şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="auth-field">
              <label>Yeni şifre (tekrar)</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="auth-btn" disabled={loading}>{loading ? 'Kaydediliyor…' : 'Şifreyi Değiştir'}</button>
          </form>
        )}

        <p className="auth-foot"><Link to="/login">← Girişe dön</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
