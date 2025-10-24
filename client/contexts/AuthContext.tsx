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
  }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
  registerDevice?: (payload: {
    platform?: string;
    pushToken: string;
  }) => Promise<void>;
  unregisterDevice?: (deviceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "auth:users";
const CURRENT_KEY = "auth:current";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Try to restore session from token, and fall back to local storage when server is unreachable
    const token = localStorage.getItem("auth:token");
    const isBuilder = typeof window !== "undefined" && window.location.search.includes("builder.frameEditing");
    const wantsDevAuth = typeof window !== "undefined" && window.location.search.includes("dev_auth");

    const tryRestoreLocal = () => {
      try {
        const raw = localStorage.getItem(CURRENT_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          setUser(parsed as AuthUser);
        } else if (typeof raw === "string") {
          // legacy: CURRENT_KEY stored just id
          const usersRaw = localStorage.getItem(USERS_KEY) || "{}";
          const users = JSON.parse(usersRaw) as Record<string, any>;
          const u = users[raw];
          if (u) setUser(u as AuthUser);
        }
      } catch (e) {
        // ignore
      }
    };

    if (token) {
      fetch(`/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (res.ok) {
            const u = await res.json();
            setUser(u);
            // persist token
            localStorage.setItem("auth:token", token);
            // persist full user locally for offline/dev fallback
            try {
              localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
            } catch (e) {}
          } else {
            localStorage.removeItem("auth:token");
            tryRestoreLocal();
          }
        })
        .catch(() => {
          // server not reachable, try local restore
          tryRestoreLocal();
        });
      return;
    }

    // Developer auto-login for testing inside Builder or with ?dev_auth in URL
    if (isBuilder || wantsDevAuth) {
      try {
        const devId = (window as any)?.DEV_USER_ID || "dev-user";
        const devUser = {
          id: devId,
          name: "Developer",
          email: "dev@example.com",
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("auth:token", "dev-token");
        // persist full user for local fallback
        localStorage.setItem(CURRENT_KEY, JSON.stringify(devUser));
        setUser(devUser as any);
      } catch (e) {}
    }
  }, []);

  const persistUser = (u: AuthUser) => {
    // Persist full user locally for offline/dev fallback
    try {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
    } catch (e) {}
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
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Error registering");
        }
        const body = await res.json();
        const u: AuthUser = body.user || body;
        const token: string | undefined = body.token;
        persistUser(u);
        if (token) {
          localStorage.setItem("auth:token", token);
        }
        return u;
      } catch (e) {
        // Fallback to localStorage-based dev users when API/database is unreachable
        try {
          const usersRaw = localStorage.getItem(USERS_KEY) || "{}";
          const users = JSON.parse(usersRaw) as Record<string, any>;
          const id = data.email;
          const user = {
            id,
            name: data.name,
            email: data.email,
            password: data.password,
            photoUrl: data.photoUrl,
            createdAt: new Date().toISOString(),
          };
          users[id] = user;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          localStorage.setItem("auth:token", "dev-token");
          persistUser(user as AuthUser);
          return user as AuthUser;
        } catch (err) {
          throw e;
        }
      }
    },
    [],
  );

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Credenciales inválidas");
        }
        const body = await res.json();
        const u: AuthUser = body.user || body;
        const token: string | undefined = body.token;
        persistUser(u);
        if (token) localStorage.setItem("auth:token", token);
        return u;
      } catch (e) {
        // Fallback to localStorage users when API/database unavailable
        const usersRaw = localStorage.getItem(USERS_KEY) || "{}";
        const users = JSON.parse(usersRaw) as Record<string, any>;
        const user = users[data.email];
        if (!user) throw new Error("Credenciales inválidas");
        if (user.password !== data.password) throw new Error("Credenciales inválidas");
        // persist session
        localStorage.setItem("auth:token", "dev-token");
        persistUser(user as AuthUser);
        return user as AuthUser;
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    // Trigger Google OAuth redirect; frontend should handle callback token on return
    window.location.href = "/api/auth/google";
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<AuthUser>) => {
      if (!user) throw new Error("No user");
      try {
        const token = localStorage.getItem("auth:token");
        const devHeader = token === "dev-token" ? { "x-dev-user": user.id } : {};
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...devHeader },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated: AuthUser = await res.json();
        persistUser(updated);
        return updated;
      } catch (e) {
        // Fallback: update localStorage stub users
        try {
          const usersRaw = localStorage.getItem(USERS_KEY) || "{}";
          const users = JSON.parse(usersRaw) as Record<string, any>;
          const existing = users[user.id] || users[user.email];
          if (!existing) throw e;
          const updated = { ...existing, ...patch };
          users[updated.id || user.id] = updated;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          persistUser(updated as AuthUser);
          return updated as AuthUser;
        } catch (err) {
          throw e;
        }
      }
    },
    [user],
  );

  const registerDevice = useCallback(
    async (payload: { platform?: string; pushToken: string }) => {
      if (!user) throw new Error("No user");
      const token = localStorage.getItem("auth:token");
      await fetch(`/api/users/${user.id}/devices`, {
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
      await fetch(`/api/users/${user.id}/devices/${deviceId}`, {
        method: "DELETE",
      });
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, register, login, loginWithGoogle, logout, updateProfile }),
    [user, register, login, loginWithGoogle, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
