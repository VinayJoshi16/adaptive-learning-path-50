import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, auth } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  user_metadata?: { display_name?: string };
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const token = auth.getToken();
      if (!token) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }
      try {
        const data = await api<{ user: User }>('/auth/me');
        setUser(data.user);
        setSession({ user: data.user });
      } catch {
        auth.clearToken();
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const data = await api<{ token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
        token: null,
      });
      auth.setToken(data.token);
      setUser(data.user);
      setSession({ user: data.user });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      return { error: new Error(message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api<{ token: string; user: User }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        token: null,
      });
      auth.setToken(data.token);
      setUser(data.user);
      setSession({ user: data.user });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    auth.clearToken();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
