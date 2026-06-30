import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api';

type User = { id: string; email: string; name?: string } | null;

type AuthCtx = {
  user: User;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => authService.getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user ?? null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authService.register(name, email, password);
    setUser(data.user ?? null);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, isLoggedIn: !!user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
