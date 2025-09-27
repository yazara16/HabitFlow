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
  register: (data: { name: string; email: string; password: string; photoUrl?: string, preferredCategories?: string[] }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
  registerDevice?: (payload: { platform?: string; pushToken: string }) => Promise<void>;
  unregisterDevice?: (deviceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "auth:users";
const CURRENT_KEY = "auth:current";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Try to restore session from token
    const token = localStorage.getItem('auth:token');
    if (token) {
      fetch(`/api/me`, { headers: { Authorization: `Bearer ${token}` } }).then(async (res) => {
        if (res.ok) {
          const u = await res.json();
          setUser(u);
          // persist token
          localStorage.setItem('auth:token', token);
        } else {
          localStorage.removeItem('auth:token');
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
    if (!user) throw new Error('No user');
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated: AuthUser = await res.json();
    setUser(updated);
  }, [user]);

  const registerDevice = useCallback(async (payload: { platform?: string; pushToken: string }) => {
    if (!user) throw new Error('No user');
    await fetch(`/api/users/${user.id}/devices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }, [user]);

  const unregisterDevice = useCallback(async (deviceId: string) => {
    if (!user) throw new Error('No user');
    await fetch(`/api/users/${user.id}/devices/${deviceId}`, { method: 'DELETE' });
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({ user, register, login, loginWithGoogle, logout, updateProfile }), [user, register, login, loginWithGoogle, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
