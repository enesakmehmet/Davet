const STORAGE_KEY = 'cookieConsent';

export const hasAnalyticsConsent = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
};

export const saveAnalyticsConsent = (value: 'accepted' | 'rejected') => {
  localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event('cookie-consent-changed'));
};
