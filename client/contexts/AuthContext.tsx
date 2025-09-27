import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string; // data URL persisted locally
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  register: (data: { name: string; email: string; password: string; photoUrl?: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "auth:users";
const CURRENT_KEY = "auth:current";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Try to restore session
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (currentId) {
      fetch(`/api/users/${currentId}`).then(async (res) => {
        if (res.ok) {
          const u = await res.json();
          setUser(u);
        } else {
          localStorage.removeItem(CURRENT_KEY);
        }
      }).catch(() => {
        // ignore
      });
    }
  }, []);

  const persistUser = (u: AuthUser) => {
    // Persist minimal session (user id) locally
    localStorage.setItem(CURRENT_KEY, u.id);
    setUser(u);
  };

  const register = useCallback(async (data: { name: string; email: string; password: string; photoUrl?: string }) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || 'Error registering');
    }
    const u: AuthUser = await res.json();
    persistUser(u);
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || 'Credenciales inválidas');
    }
    const u: AuthUser = await res.json();
    persistUser(u);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await fetch('/api/auth/google');
    if (!res.ok) throw new Error('No se pudo iniciar con Google');
    const u: AuthUser = await res.json();
    persistUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch } as AuthUser;
      const usersRaw = localStorage.getItem(USERS_KEY);
      const users: Record<string, AuthUser> = usersRaw ? JSON.parse(usersRaw) : {};
      users[updated.email] = updated;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, register, login, loginWithGoogle, logout, updateProfile }), [user, register, login, loginWithGoogle, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
