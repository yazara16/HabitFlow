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
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: Record<string, AuthUser> = usersRaw ? JSON.parse(usersRaw) : {};
    if (users[data.email]) {
      throw new Error("El correo ya está registrado");
    }
    const u: AuthUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      photoUrl: data.photoUrl,
      createdAt: new Date().toISOString(),
    };
    persistUser(u);
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: Record<string, AuthUser> = usersRaw ? JSON.parse(usersRaw) : {};
    const found = users[data.email];
    if (!found || (found.password && found.password !== data.password)) {
      throw new Error("Credenciales inválidas");
    }
    localStorage.setItem(CURRENT_KEY, found.email);
    setUser(found);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Mock Google: create or load a demo user
    const email = "demo-google@habitflow.app";
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: Record<string, AuthUser> = usersRaw ? JSON.parse(usersRaw) : {};
    let u = users[email];
    if (!u) {
      u = {
        id: `user_${Date.now()}`,
        name: "Usuario Google",
        email,
        createdAt: new Date().toISOString(),
        photoUrl: undefined,
      };
      users[email] = u;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    localStorage.setItem(CURRENT_KEY, email);
    setUser(u);
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
