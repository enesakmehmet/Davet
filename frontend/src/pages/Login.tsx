import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Giriş başarısız. E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Davetim</Link>
        <h1 className="auth-title">Tekrar hoş geldiniz</h1>
        <p className="auth-sub">Davetiyelerinizi yönetmek için giriş yapın</p>

        {error && <div className="auth-err">{error}</div>}

        <form onSubmit={submit}>
          <div className="auth-field">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required />
          </div>
          <div className="auth-field">
            <label>Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}</button>
        </form>

        <p className="auth-foot">Hesabınız yok mu? <Link to="/register">Kayıt olun</Link></p>
      </div>
    </div>
  );
};

export default Login;
