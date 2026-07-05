import { useEffect, useState } from 'react';
import { initAnalytics } from '../utils/analytics';

const STORAGE_KEY = 'cookieConsent'; // 'accepted' | 'rejected'

/**
 * Analitik (GA/Meta Pixel) yalnızca .env'de bir ID tanımlıysa VE kullanıcı onay verdiyse çalışır.
 * Hiçbiri tanımlı değilse banner hiç gösterilmez (gösterilecek bir şey yok).
 */
const CookieConsent = () => {
  const hasAnalytics = Boolean(
    (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || (import.meta as any).env?.VITE_META_PIXEL_ID,
  );
  const [choice, setChoice] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (hasAnalytics && choice === 'accepted') initAnalytics();
  }, [hasAnalytics, choice]);

  if (!hasAnalytics || choice) return null;

  const decide = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, value);
    setChoice(value);
  };

  return (
    <>
      {/* Mobilde WhatsApp float butonuyla (sağ altta, 60px) çakışmasın diye banner biraz yukarı kaydırılır. */}
      <style>{`
        .cookie-banner { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9998; max-width: 640px; margin: 0 auto; }
        @media (max-width: 480px) {
          .cookie-banner { bottom: 92px; left: 12px; right: 12px; padding: 16px 18px !important; }
          .cookie-banner .cb-actions { width: 100%; }
          .cookie-banner .cb-actions button { flex: 1; }
        }
      `}</style>
      <div
        className="cookie-banner"
        style={{
          background: '#131a2b', color: '#fff', borderRadius: 16,
          padding: '18px 22px', boxShadow: '0 16px 40px rgba(0,0,0,.3)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
          border: '1px solid rgba(212,175,55,.3)',
        }}
      >
        <p style={{ flex: '1 1 260px', fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,.85)', margin: 0 }}>
          Deneyiminizi ölçmek için analiz araçları (ör. Google Analytics) kullanıyoruz. Kabul ederseniz bu
          araçlar etkinleşir; reddederseniz sadece temel işlevsel çerezler kullanılır.{' '}
          <a href="/privacy" style={{ color: '#e6c65c' }}>Gizlilik Politikası</a>
        </p>
        <div className="cb-actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => decide('rejected')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.3)', color: '#fff', borderRadius: 20, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}
          >
            Reddet
          </button>
          <button
            onClick={() => decide('accepted')}
            style={{ background: 'linear-gradient(135deg, #d9b64a, #b5952f)', border: 'none', color: '#fff', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Kabul Et
          </button>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
