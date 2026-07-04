import { useLocation } from 'react-router-dom';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

/** Ziyaretçiyi yaklaşık tekilleştirmek için kalıcı oturum kimliği (PageTracker ile aynı) */
const getSessionId = (): string => {
  let s = localStorage.getItem('sid');
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sid', s);
  }
  return s;
};

/**
 * Her sayfada sağ altta sabit WhatsApp butonu.
 * Not: Telefon numarası burada YOKTUR — buton backend'deki /whatsapp/go
 * ucuna gider, numara yalnızca backend .env'de tutulur ve oradan wa.me'ye
 * 302 ile yönlendirilir. Aynı zamanda tıklama admin panel için kaydedilir.
 */
const WhatsappButton = () => {
  const location = useLocation();
  const href = `${API.replace(/\/$/, '')}/whatsapp/go?path=${encodeURIComponent(
    location.pathname,
  )}&sid=${encodeURIComponent(getSessionId())}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan yaz"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 9999,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        textDecoration: 'none',
      }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.417L4 29l7.77-1.84A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm0 21.7c-1.94 0-3.75-.57-5.27-1.55l-.378-.24-4.61 1.09 1.12-4.49-.25-.39A9.66 9.66 0 0 1 5.3 15c0-5.35 4.35-9.7 9.7-9.7 5.35 0 9.7 4.35 9.7 9.7 0 5.35-4.35 9.7-9.699 9.7zm5.32-7.26c-.29-.145-1.71-.845-1.975-.94-.265-.096-.458-.145-.65.145-.192.29-.746.94-.914 1.133-.168.193-.336.217-.626.072-.29-.145-1.223-.451-2.33-1.437-.86-.767-1.442-1.714-1.61-2.004-.168-.29-.018-.447.127-.591.13-.13.29-.338.435-.507.145-.169.193-.29.29-.483.096-.193.048-.362-.024-.507-.072-.145-.65-1.567-.892-2.146-.235-.564-.474-.488-.65-.497l-.554-.01c-.193 0-.507.072-.772.362-.265.29-1.012.99-1.012 2.412 0 1.423 1.036 2.797 1.181 2.99.145.193 2.04 3.115 4.943 4.368.691.298 1.23.476 1.65.61.693.22 1.324.189 1.823.115.556-.083 1.71-.699 1.95-1.375.242-.676.242-1.255.169-1.375-.072-.12-.265-.193-.554-.338z"/>
      </svg>
    </a>
  );
};

export default WhatsappButton;
