import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authService.forgotPassword(email);
      // Kod link değil e-posta ile gidiyor; kodu girecekleri sayfaya e-postayla birlikte yönlendir
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
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
        <p className="auth-sub">E-posta adresinize 6 haneli bir sıfırlama kodu gönderelim</p>

        {error && <div className="auth-err">{error}</div>}

        <form onSubmit={submit}>
          <div className="auth-field">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Gönderiliyor…' : 'Sıfırlama Kodu Gönder'}</button>
        </form>

        <p className="auth-foot"><Link to="/login">← Girişe dön</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
