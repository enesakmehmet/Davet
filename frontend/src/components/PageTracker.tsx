import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

/** Ziyaretçiyi yaklaşık tekilleştirmek için kalıcı oturum kimliği */
const getSessionId = (): string => {
  let s = localStorage.getItem('sid');
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sid', s);
  }
  return s;
};

/** Her rota değişiminde backend'e sayfa görüntüleme kaydı atar (dahili analytics) */
const PageTracker = () => {
  const location = useLocation();
  useEffect(() => {
    fetch(API.replace(/\/$/, '') + '/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: location.pathname,
        sessionId: getSessionId(),
        referrer: document.referrer || '',
      }),
    }).catch(() => {});
  }, [location.pathname]);
  return null;
};

export default PageTracker;
