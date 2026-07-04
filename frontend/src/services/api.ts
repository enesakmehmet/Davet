import axios from 'axios';

// Backend API Base URL
// Geliştirmede '/api' (Vite proxy ile backend'e gider), prod'da VITE_API_URL
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Mutlak API adresi (WhatsApp OG linki gibi dış paylaşımlar için)
export const ABS_API_URL = API_URL.startsWith('http')
  ? API_URL.replace(/\/+$/, '')
  : `${window.location.origin}${API_URL}`.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 gelirse refresh token ile access token'ı sessizce yenile ve isteği tekrarla.
// Aynı anda birden çok istek 401 alırsa tek bir refresh çağrısı paylaşılır.
let refreshingPromise: Promise<string | null> | null = null;

const doRefresh = (): Promise<string | null> => {
  if (!refreshingPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshingPromise = axios
      .post(`${API_URL.replace(/\/+$/, '')}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        if (data?.access_token) localStorage.setItem('accessToken', data.access_token);
        if (data?.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
        return (data?.access_token as string) || null;
      })
      .catch(() => null)
      .finally(() => { refreshingPromise = null; });
  }
  return refreshingPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: any = error?.config;
    const status = error?.response?.status;
    const isAuthCall = String(original?.url || '').includes('/auth/');
    if (status === 401 && original && !original._retry && !isAuthCall && localStorage.getItem('refreshToken')) {
      original._retry = true;
      const newToken = await doRefresh();
      if (newToken) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return api(original);
      }
      // Refresh de başarısız: oturumu temizle, korumalı sayfadaysa girişe yönlendir
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      const p = window.location.pathname;
      if (p.startsWith('/dashboard') || p.startsWith('/editor')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const WEDDING_THEMES = new Set(['altin', 'gul', 'minimal', 'bohem', 'lacivert', 'lavanta', 'sonbahar', 'deniz', 'tropikal', 'havai', 'sinematik']);

const birthdayFallbackPhotos = [
  { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80', caption: 'En özel günümüzden' },
  { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80', caption: 'Beraber ilk tatilimiz' },
  { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80', caption: '' },
];

const isDefaultWeddingConfig = (cfg: any) =>
  !cfg || WEDDING_THEMES.has(String(cfg.theme || '')) ||
  (cfg.brideName === 'Zeynep' && cfg.groomName === 'Ahmet');

const getBirthdayName = (inv: any) =>
  String(inv?.title || '').split(/[—-]/)[0]?.trim() ||
  String(inv?.slug || '').split('-')[0] ||
  'Serra';

const getBirthdayAge = (inv: any, cfg: any) => {
  const fromSlug = String(inv?.slug || '').match(/(?:^|-)(\d{1,3})(?:-|$)/)?.[1];
  return String(cfg?.groomName || fromSlug || '32');
};

/**
 * ESKİ VERİ ONARIMI — yalnızca hâlâ varsayılan DÜĞÜN içeriğiyle kalmış doğum günü
 * davetleri için çalışır. Kullanıcının özelleştirdiği kutlamalara ASLA dokunmaz.
 * Onarım tetiklenirse sonuç veritabanına BİR KEZ kalıcı yazılır (persistRepair),
 * böylece davet bir daha asla kendiliğinden değişmez.
 */
const repairInvitation = (inv: any) => {
  if (!inv) return inv;
  const text = `${inv.title || ''} ${inv.slug || ''}`.toLocaleLowerCase('tr-TR');
  const looksBirthday = text.includes('doğum') || text.includes('dogum') || text.includes('birthday');
  if (!looksBirthday || !isDefaultWeddingConfig(inv.config)) return inv;

  const name = getBirthdayName(inv);
  const age = getBirthdayAge(inv, inv.config);
  const existingPhotos = Array.isArray(inv.config?.photos) ? inv.config.photos : [];
  const photosAreWeddingDefaults = inv.config?.brideName === 'Zeynep' && inv.config?.groomName === 'Ahmet';

  return {
    ...inv,
    __repaired: true,
    config: {
      ...(inv.config || {}),
      theme: 'kutlamaPop',
      brideName: name,
      groomName: age,
      date: '',
      subtitle: 'bugün senin günün — iyi ki doğdun!',
      greeting: 'Mutlu Yıllar Sana',
      message: 'Bu özel günü seninle kutlamak, gülüşünü görmek ve mutluluğuna ortak olmak en güzel hediye. Hayatımıza neşe kattığın için teşekkürler!',
      photos: photosAreWeddingDefaults || existingPhotos.length === 0 ? birthdayFallbackPhotos : existingPhotos,
      videoUrl: inv.config?.videoUrl || '',
      fromName: inv.config?.fromName || 'Sevgiyle',
      wish: inv.config?.wish || 'Nice mutlu, sağlıklı ve kahkaha dolu senelere! İyi ki doğdun, iyi ki varsın.',
      cakeType: inv.config?.cakeType || 'classic',
    },
  };
};

/* Onarılan daveti kalıcılaştır: bir kez DB'ye yazılır, sonrasında onarım hiç tetiklenmez */
const persistedRepairs = new Set<string>();
const persistRepair = (inv: any) => {
  if (!inv?.__repaired || !inv.id || persistedRepairs.has(inv.id)) return;
  persistedRepairs.add(inv.id);
  api.patch(`/invitations/${inv.id}`, { config: inv.config }).catch(() => {
    persistedRepairs.delete(inv.id); // başarısızsa bir sonraki açılışta tekrar denenir
  });
};

// Mock services for Templates
export const templateService = {
  getTemplates: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch templates, falling back to mock data.", error);
      // Fallback for development
      return [
        { id: '1', title: 'The Estate', style: 'Classic • Serif', price: 0 },
        { id: '2', title: 'Gallery Modern', style: 'Modern • Minimal', price: 0 },
      ];
    }
  }
};

// Services for Invitations (Editor & Dashboard)
export const invitationService = {
  getUserInvitations: async () => {
    const response = await api.get('/invitations');
    if (!Array.isArray(response.data)) return response.data;
    const list = response.data.map(repairInvitation);
    // Onarım gereken eski kayıtları kalıcılaştır — davetler bir daha kendiliğinden değişmez
    list.forEach(persistRepair);
    return list.map(({ __repaired, ...inv }: any) => inv);
  },
  // Yeni form tabanlı editör: config nesnesini kaydeder
  createInvitation: async (data: { title: string; slug: string; eventDate?: string; config: any }) => {
    const response = await api.post('/invitations', data);
    return response.data;
  },
  saveInvitation: async (id: string, data: any) => {
    // Backend controller PATCH kullanır
    const response = await api.patch(`/invitations/${id}`, data);
    return response.data;
  },
  // Public: slug ile davetiyeyi (config dahil) getirir
  getBySlug: async (slug: string, password?: string) => {
    const response = await api.post(`/invitations/${slug}`, { password });
    return repairInvitation(response.data);
  },
  // Davetiyeyi yayından kaldır / sil
  deleteInvitation: async (id: string) => {
    const response = await api.delete(`/invitations/${id}`);
    return response.data;
  },
  // Çöp kutusu: yayından kaldırılanlar (30 gün saklanır)
  getTrash: async () => {
    const response = await api.get('/invitations/trash/list');
    return Array.isArray(response.data) ? response.data : [];
  },
  restoreInvitation: async (id: string) => {
    const response = await api.patch(`/invitations/${id}/restore`);
    return response.data;
  },
};

// QR kod (davet linki için)
export const qrService = {
  download: async (invitationId: string, filename = 'davet-qr.png') => {
    const response = await api.get(`/qr-codes/${invitationId}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};

// Bildirimler (panel zili)
export const notificationService = {
  list: async () => {
    const { data } = await api.get('/notifications');
    return Array.isArray(data) ? data : [];
  },
  markRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
};

// Misafir albümü yönetimi (davet sahibi için)
export const guestPhotoService = {
  byInvitation: async (invitationId: string) => {
    const { data } = await api.get(`/guest-photos/invitation/${invitationId}`);
    return Array.isArray(data) ? data : [];
  },
  remove: async (id: string) => (await api.delete(`/guest-photos/${id}`)).data,
};

// İletişim formu
export const contactService = {
  send: async (payload: { name: string; email: string; message: string }) => {
    const { data } = await api.post('/mail/contact', payload);
    return data;
  },
};

// Varlık yükleme (MP3 müzik, fotoğraf vb.) — multipart için ham fetch kullanılır
export const assetService = {
  uploadAudio: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('accessToken');
    const res = await fetch(API_URL.replace(/\/$/, '') + '/assets/upload-audio', {
      method: 'POST',
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      body: fd,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error((e as any).message || 'Müzik yüklenemedi.');
    }
    return res.json();
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('accessToken');
    const res = await fetch(API_URL.replace(/\/$/, '') + '/assets/upload-image', {
      method: 'POST',
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      body: fd,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error((e as any).message || 'Fotoğraf yüklenemedi.');
    }
    return res.json();
  },
};

// Auth (giriş / kayıt / profil)
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token) localStorage.setItem('accessToken', data.access_token);
    if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.access_token) localStorage.setItem('accessToken', data.access_token);
    if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  getStoredUser: () => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  },
  isLoggedIn: () => !!localStorage.getItem('accessToken'),
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
    return data;
  },
  verifyEmail: async (token: string) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data;
  },
  resendVerification: async () => {
    const { data } = await api.post('/auth/resend-verification');
    return data;
  },
};

// Hesap ayarları (profil, şifre, hesap silme)
export const settingsService = {
  get: async () => {
    const { data } = await api.get('/settings');
    return data;
  },
  update: async (payload: { name?: string; email?: string }) => {
    const { data } = await api.patch('/settings', payload);
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.patch('/settings/password', { currentPassword, newPassword });
    return data;
  },
  deleteAccount: async () => {
    const { data } = await api.delete('/settings/account');
    return data;
  },
  // KVKK: kullanıcının tüm verilerini JSON olarak indirir
  exportData: async () => {
    const { data } = await api.get('/settings/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `davetim-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },
};

// Misafir listesi (davetiye sahibi için)
export const guestListService = {
  byInvitation: async (invitationId: string) => {
    const { data } = await api.get(`/guests/invitation/${invitationId}`);
    return data;
  },
};

// İstatistik (görüntülenme/ziyaretçi) — davetiye sahibi için
export const statsService = {
  byInvitation: async (invitationId: string) => {
    const { data } = await api.get(`/analytics/${invitationId}`);
    return data;
  },
  // Public: davet açıldığında görüntülenme kaydı (fire-and-forget)
  recordView: async (invitationId: string) => {
    // Tekil ziyaretçi tespiti: bu tarayıcı bu daveti daha önce açtı mı?
    let isNewVisitor = true;
    try {
      const visitKey = `davetim_visited_${invitationId}`;
      if (localStorage.getItem(visitKey)) isNewVisitor = false;
      else localStorage.setItem(visitKey, String(Date.now()));
    } catch { /* localStorage kapalıysa her açılış ziyaretçi sayılır */ }

    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) device = 'Mobil';
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
    
    let os = 'Bilinmiyor';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS/i.test(ua)) os = 'MacOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

    let browser = 'Bilinmiyor';
    if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Edge/i.test(ua)) browser = 'Edge';

    let city = 'Bilinmiyor';
    let country = 'Bilinmiyor';
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await res.json();
      if (data.city) city = data.city;
      if (data.country) country = data.country;
    } catch (e) {
      // fallback to timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) city = tz.split('/').pop()?.replace(/_/g, ' ') || city;
      } catch(e2) {}
    }

    api.post('/analytics/view', {
      invitationId,
      device,
      browser,
      operatingSystem: os,
      city,
      country,
      isNewVisitor,
      referrer: document.referrer || undefined
    }).catch(() => {});
  },
};

// RSVP (Katılım bildirimi) — herkese açık
export const guestService = {
  // davet RSVP formundaki 'evet'/'hayir' -> backend 'attending'/'not_attending'
  submitRsvp: async (payload: {
    invitationId: string;
    name: string;
    coming: boolean;
    companionCount?: number;
    message?: string;
    phone?: string;
  }) => {
    const response = await api.post('/guests', {
      invitationId: payload.invitationId,
      name: payload.name,
      status: payload.coming ? 'attending' : 'not_attending',
      companionCount: payload.companionCount ?? 0,
      message: payload.message,
      phone: payload.phone,
    });
    return response.data;
  },
};
