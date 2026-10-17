import { AuthTokensSchema, type AuthUser, LoginSchema } from '@portfolio/shared';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, restoreSession, setAccessToken } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void restoreSession()
      .then((session) => {
        if (active && session) {
          setAccessToken(session.accessToken);
          setUser(session.user);
        }
      })
      .catch(() => {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const payload = LoginSchema.parse({ email, password });
        const response = await apiRequest<unknown>('/auth/login', {
          method: 'POST',
          retryAuth: false,
          body: JSON.stringify(payload),
        });
        const parsed = AuthTokensSchema.safeParse(response);
        if (!parsed.success) throw new Error('The API returned an invalid login response.');
        setAccessToken(parsed.data.accessToken);
        setUser(parsed.data.user);
      },
      async logout() {
        try {
          await apiRequest<void>('/auth/logout', { method: 'POST', retryAuth: false });
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
