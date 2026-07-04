/**
 * Google Analytics (GA4) ve Meta (Facebook) Pixel — opsiyonel.
 * ID'ler .env'de tanımlı değilse hiçbir şey yapmaz (sessizce atlanır).
 *
 * Kurulum:
 *  1. GA4: https://analytics.google.com üzerinden bir "Veri Akışı" oluştur, "G-XXXXXXX" ölçüm kimliğini al.
 *  2. Meta Pixel: https://business.facebook.com/events_manager üzerinden bir piksel oluştur, kimliğini al.
 *  3. frontend/.env (lokal) veya Railway "Variables" (canlı) içine yaz:
 *       VITE_GA_MEASUREMENT_ID=G-XXXXXXX
 *       VITE_META_PIXEL_ID=XXXXXXXXXXXXXXX
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string };
    _fbq?: unknown;
  }
}

function initGoogleAnalytics(measurementId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId);
}

function initMetaPixel(pixelId: string) {
  if (window.fbq) return;
  const n: any = function (...args: unknown[]) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  };
  n.queue = [];
  n.loaded = true;
  n.version = '2.0';
  window.fbq = n;
  window._fbq = n;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function initAnalytics() {
  const gaId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;
  const pixelId = (import.meta as any).env?.VITE_META_PIXEL_ID;
  if (gaId) initGoogleAnalytics(gaId);
  if (pixelId) initMetaPixel(pixelId);
}
