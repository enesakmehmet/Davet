import axios from 'axios';

// Backend API Base URL
// Geliştirmede '/api' (Vite proxy ile backend'e gider), prod'da VITE_API_URL
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

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
    return response.data;
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
    return response.data;
  },
};

// Varlık yükleme (MP3 müzik vb.) — multipart için ham fetch kullanılır
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
  recordView: (invitationId: string) => {
    api.post('/analytics/view', { invitationId }).catch(() => {});
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
