import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invitationService, statsService } from '../services/api';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const DavetView = () => {
  const { slug } = useParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'password' | 'error'>('loading');
  const [password, setPassword] = useState('');
  const [cfg, setCfg] = useState<any>(null);

  const load = async (pwd?: string) => {
    setStatus('loading');
    try {
      const inv = await invitationService.getBySlug(slug as string, pwd);
      const merged = { ...(inv.config || {}), invitationId: inv.id, apiBase: API_BASE };
      setCfg(merged);
      setStatus('ready');
      statsService.recordView(inv.id); // görüntülenme kaydı (fire-and-forget)
    } catch (err: any) {
      if (err?.response?.status === 403) setStatus('password');
      else setStatus('error');
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  // iframe hazır olunca config gönder
  useEffect(() => {
    if (status !== 'ready' || !cfg) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.__davetReady) iframeRef.current?.contentWindow?.postMessage({ __davet: true, cfg }, '*');
    };
    window.addEventListener('message', onMsg);
    iframeRef.current?.contentWindow?.postMessage({ __davet: true, cfg }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, [status, cfg]);

  const center: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#5a4a2f', padding: 24, textAlign: 'center' };

  if (status === 'loading') return <div style={center}>Davetiye yükleniyor…</div>;
  if (status === 'error') return <div style={center}>Davetiye bulunamadı. Bağlantıyı kontrol edin.</div>;
  if (status === 'password') {
    return (
      <div style={center}>
        <form onSubmit={(e) => { e.preventDefault(); load(password); }} style={{ maxWidth: 320, width: '100%' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Şifreli Davetiye</h2>
          <p style={{ fontSize: 13, color: '#8a7a5a', marginBottom: 16 }}>Görüntülemek için şifreyi girin.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre"
            style={{ width: '100%', padding: 12, border: '1px solid #e3d6b0', borderRadius: 10, marginBottom: 12 }} />
          <button style={{ width: '100%', padding: 12, background: '#9c7a31', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Görüntüle</button>
        </form>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Davetiye"
      src="/davet-preview.html?v=20260702b"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0 }}
      onLoad={() => cfg && iframeRef.current?.contentWindow?.postMessage({ __davet: true, cfg }, '*')}
    />
  );
};

export default DavetView;
