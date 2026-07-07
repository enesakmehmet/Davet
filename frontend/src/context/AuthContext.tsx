import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api';

type User = { id: string; email: string; name?: string; emailVerified?: boolean } | null;

type AuthCtx = {
  user: User;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Not: kayıt artık giriş yaptırmaz — e-postaya gönderilen 6 haneli kod bekler.
  register: (name: string, email: string, password: string) => Promise<{ email: string; message?: string }>;
  verifyRegistrationCode: (email: string, code: string) => Promise<void>;
  resendRegistrationCode: (email: string) => Promise<{ message?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<NonNullable<User>>) => void;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as any);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => authService.getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user ?? null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // Henüz giriş yapılmaz: backend e-postaya kod gönderir, kullanıcı state'i kod doğrulanınca set edilir.
    const data = await authService.register(name, email, password);
    return { email: data.email ?? email, message: data.message };
  }, []);

  const verifyRegistrationCode = useCallback(async (email: string, code: string) => {
    const data = await authService.verifyRegistration(email, code);
    setUser(data.user ?? null);
  }, []);

  const resendRegistrationCode = useCallback(async (email: string) => {
    return authService.resendRegistrationCode(email);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Profil/ayarlar güncellenince yerel kullanıcıyı da tazele (sayfa yenilemeden)
  const updateUser = useCallback((patch: Partial<NonNullable<User>>) => {
    setUser((u) => {
      const next = u ? { ...u, ...patch } : u;
      if (next) localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  // Backend'den güncel profili çek (ör. e-posta doğrulama sonrası)
  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
      /* token geçersizse sessizce geç */
    }
  }, []);

  return (
    <Ctx.Provider value={{ user, isLoggedIn: !!user, login, register, verifyRegistrationCode, resendRegistrationCode, logout, updateUser, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
