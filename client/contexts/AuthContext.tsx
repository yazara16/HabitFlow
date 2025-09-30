import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  register: (data: {
    name: string;
    email: string;
    password: string;
    photoUrl?: string;
    preferredCategories?: string[];
  }) => Promise<AuthUser>;
  login: (data: { email: string; password: string }) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
  registerDevice?: (payload: { platform?: string; pushToken: string }) => Promise<void>;
  unregisterDevice?: (deviceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = "http://localhost:8080"; // <-- puerto backend

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth:token");
    if (token) {
      fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (res.ok) {
            const u = await res.json();
            setUser(u);
            localStorage.setItem("auth:token", token);
          } else {
            localStorage.removeItem("auth:token");
          }
        })
        .catch(() => {});
    }
  }, []);

  const persistUser = (u: AuthUser) => {
    localStorage.setItem("auth:current", u.id);
    setUser(u);
  };

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      photoUrl?: string;
      preferredCategories?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Error registering");
      }
      const body = await res.json();
      const u: AuthUser = body.user;
      const token: string | undefined = body.token;
      persistUser(u);
      if (token) localStorage.setItem("auth:token", token);
      return u;
    },
    [],
  );

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Credenciales inválidas");
      }
      const body = await res.json();
      const u: AuthUser = body.user;
      const token: string | undefined = body.token;
      persistUser(u);
      if (token) localStorage.setItem("auth:token", token);
      return u;
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth:current");
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<AuthUser>) => {
      if (!user) throw new Error("No user");
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: AuthUser = await res.json();
      setUser(updated);
    },
    [user],
  );

  const registerDevice = useCallback(
    async (payload: { platform?: string; pushToken: string }) => {
      if (!user) throw new Error("No user");
      const token = localStorage.getItem("auth:token");
      await fetch(`${API_BASE}/api/users/${user.id}/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    },
    [user],
  );

  const unregisterDevice = useCallback(
    async (deviceId: string) => {
      if (!user) throw new Error("No user");
      await fetch(`${API_BASE}/api/users/${user.id}/devices/${deviceId}`, {
        method: "DELETE",
      });
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, register, login, loginWithGoogle, logout, updateProfile, registerDevice, unregisterDevice }),
    [user, register, login, loginWithGoogle, logout, updateProfile, registerDevice, unregisterDevice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
