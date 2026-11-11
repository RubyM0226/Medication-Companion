import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { apiRequest, onUnauthorized } from '@/services/api';
import { setDatabaseUser } from '@/services/database';

type User = {
  id: string;
  email: string | null;
};

type AuthResponse = {
  user: User | null;
  requiresConfirmation?: boolean;
  message?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<AuthResponse>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function updateUser(nextUser: User | null) {
    setDatabaseUser(nextUser?.id ?? null);
    setUser(nextUser);
  }

  useEffect(() => {
    let active = true;

    const unsubscribe = onUnauthorized(() => {
      if (active) {
        updateUser(null);
      }
    });

    apiRequest<AuthResponse>('/session')
      .then((result) => {
        if (active) {
          updateUser(result.user);
        }
      })
      .catch(() => {
        if (active) {
          updateUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function authenticate(
    path: string,
    email: string,
    password: string,
  ) {
    const result = await apiRequest<AuthResponse>(path, {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    updateUser(result.user);
    return result;
  }

  async function signIn(email: string, password: string) {
    await authenticate('/login', email, password);
  }

  async function signUp(email: string, password: string) {
    return authenticate('/register', email, password);
  }

  async function signOut() {
    await apiRequest('/logout', {
      method: 'POST',
    });

    updateUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}