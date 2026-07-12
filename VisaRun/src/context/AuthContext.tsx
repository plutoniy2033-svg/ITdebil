import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthStatus, Client } from '../types';
import {
  fetchCurrentClient,
  getStoredToken,
  loginClient,
  registerClient,
  setStoredToken,
} from '../api/auth';

interface AuthContextValue {
  status: AuthStatus;
  client: Client | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SPLASH_MIN_MS = 1500;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const splashDelay = new Promise((resolve) => setTimeout(resolve, SPLASH_MIN_MS));
      const token = getStoredToken();

      if (!token) {
        await splashDelay;
        if (active) setStatus('unauthenticated');
        return;
      }

      try {
        const [result] = await Promise.all([fetchCurrentClient(), splashDelay]);
        if (!active) return;
        setClient(result.client);
        setStatus('authenticated');
      } catch {
        setStoredToken(null);
        if (active) setStatus('unauthenticated');
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginClient({ email, password });
    setStoredToken(result.token);
    setClient(result.client);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await registerClient({ email, password, fullName });
    setStoredToken(result.token);
    setClient(result.client);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setClient(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, client, login, register, logout }),
    [status, client, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
