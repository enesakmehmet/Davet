import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) { setError('Kod 6 haneli olmalı.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email, code, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Kod geçersiz veya süresi dolmuş. Yeniden talep edin.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) { setError('Önce e-posta adresini gir.'); return; }
    setError('');
    try {
      await authService.forgotPassword(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {
      setError('Kod tekrar gönderilemedi. Birazdan tekrar dene.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Davetim</Link>
        <h1 className="auth-title">Yeni şifre belirle</h1>
        <p className="auth-sub">E-postana gönderdiğimiz 6 haneli kodu ve yeni şifreni gir</p>
        <p style={{ fontSize: 12, color: '#9a9a9a', textAlign: 'center', margin: '-12px 0 16px', lineHeight: 1.5 }}>
          Kod gelmezse Spam / Gereksiz klasörünü kontrol et — bazen oraya düşebiliyor.
        </p>

        {error && <div className="auth-err">{error}</div>}
        {resent && <p style={{ fontSize: 13, color: '#2e7d52', textAlign: 'center', margin: '0 0 12px' }}>Kod tekrar gönderildi.</p>}

        {done ? (
          <p style={{ fontSize: 14, color: '#2e7d52', textAlign: 'center', lineHeight: 1.6 }}>
            Şifren değiştirildi. Girişe yönlendiriliyorsun…
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="auth-field">
              <label>E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required />
            </div>
            <div className="auth-field">
              <label>Doğrulama kodu</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                style={{ letterSpacing: 4, fontWeight: 700, textAlign: 'center' }}
                required
              />
            </div>
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

        {!done && (
          <p className="auth-foot">
            Kod gelmedi mi? <button type="button" onClick={resend} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>Tekrar gönder</button>
          </p>
        )}
        <p className="auth-foot"><Link to="/login">← Girişe dön</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
