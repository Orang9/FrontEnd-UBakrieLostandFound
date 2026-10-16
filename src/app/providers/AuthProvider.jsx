import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ubakrie-lf-auth';
const AuthContext = createContext(null);

function readStoredSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { user: null, token: null };

  try {
    const session = JSON.parse(stored);
    if (typeof session.token !== 'string' || !session.user) {
      throw new Error('Invalid stored authentication session.');
    }
    return session;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    console.error('Could not restore authentication session.', error);
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  function login({ user, token }) {
    if (!user || typeof token !== 'string' || token.length === 0) {
      throw new TypeError('Login requires a user and a non-empty token.');
    }
    const nextSession = { user, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession({ user: null, token: null });
  }

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.user && session.token),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
