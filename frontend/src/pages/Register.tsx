import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const RESEND_COOLDOWN = 60; // saniye

const Register = () => {
  const { register, verifyRegistrationCode, resendRegistrationCode } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'code'>('form');

  // Kayıt formu
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — insanlar görmez, botlar doldurur
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kod doğrulama adımı
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'code') setTimeout(() => codeInputRef.current?.focus(), 50);
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (website) return; // bot yakalandı: sessizce hiçbir şey yapma
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    setLoading(true);
    try {
      const data = await register(name, email, password);
      setInfoMsg(data.message || `${email} adresine 6 haneli bir doğrulama kodu gönderdik.`);
      setCode('');
      setCodeError('');
      setStep('code');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    if (!/^\d{6}$/.test(code)) { setCodeError('Lütfen 6 haneli kodu eksiksiz giriniz.'); return; }
    setVerifying(true);
    try {
      await verifyRegistrationCode(email, code);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setCodeError(Array.isArray(msg) ? msg.join(' ') : msg || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setCodeError('');
    try {
      const data = await resendRegistrationCode(email);
      setInfoMsg(data.message || 'Kod tekrar gönderildi.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setCodeError(err?.response?.data?.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setResending(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-logo">Davetim</Link>
          <h1 className="auth-title">E-postanı doğrula</h1>
          <p className="auth-sub"><strong>{email}</strong> adresine gönderdiğimiz 6 haneli kodu gir</p>

          {infoMsg && <div className="auth-info">{infoMsg}</div>}
          {codeError && <div className="auth-err">{codeError}</div>}

          <form onSubmit={submitCode}>
            <div className="auth-field">
              <label>Doğrulama kodu</label>
              <input
                ref={codeInputRef}
                className="auth-code-input"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
              />
            </div>
            <button className="auth-btn" disabled={verifying || code.length !== 6}>
              {verifying ? 'Doğrulanıyor…' : 'Doğrula ve Devam Et'}
            </button>
          </form>

          <p className="auth-foot">
            Kod gelmedi mi?{' '}
            <button className="auth-link-btn" onClick={resend} disabled={cooldown > 0 || resending}>
              {resending ? 'Gönderiliyor…' : cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : 'Tekrar gönder'}
            </button>
          </p>
          <p className="auth-foot">
            <button className="auth-link-btn" onClick={() => setStep('form')}>← Bilgileri düzenle</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Davetim</Link>
        <h1 className="auth-title">Hesap oluşturun</h1>
        <p className="auth-sub">Dakikalar içinde davetiyenizi tasarlamaya başlayın</p>

        {error && <div className="auth-err">{error}</div>}

        <form onSubmit={submit}>
          {/* Honeypot: gizli alan — otomatik form dolduran botları eler */}
          <input
            type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1} autoComplete="off" aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />
          <div className="auth-field">
            <label>Ad Soyad</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" required />
          </div>
          <div className="auth-field">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required />
          </div>
          <div className="auth-field">
            <label>Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Kod gönderiliyor…' : 'Kayıt Ol'}</button>
        </form>

        <p className="auth-foot">Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link></p>
      </div>
    </div>
  );
};

export default Register;
