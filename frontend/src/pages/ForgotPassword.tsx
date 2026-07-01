import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bir şeyler ters gitti. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Davetim</Link>
        <h1 className="auth-title">Şifremi unuttum</h1>
        <p className="auth-sub">E-posta adresinize sıfırlama bağlantısı gönderelim</p>

        {error && <div className="auth-err">{error}</div>}

        {sent ? (
          <p style={{ fontSize: 14, color: '#4a4a4a', textAlign: 'center', lineHeight: 1.6 }}>
            Bu e-posta kayıtlıysa, gelen kutunuza (ve spam klasörüne) bir şifre sıfırlama bağlantısı gönderdik.
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="auth-field">
              <label>E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required />
            </div>
            <button className="auth-btn" disabled={loading}>{loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}</button>
          </form>
        )}

        <p className="auth-foot"><Link to="/login">← Girişe dön</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
