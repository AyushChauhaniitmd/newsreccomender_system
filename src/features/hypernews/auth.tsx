import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiPost } from "./api";

export interface HyperNewsUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: HyperNewsUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "hypernews_auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function HyperNewsAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HyperNewsUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as HyperNewsUser);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user?.id,
    async login(email: string, password: string) {
      const payload = await apiPost<{ user?: { user_id: string; email?: string; display_name?: string } }>("/auth/validate", {
        email,
        password,
      });

      const nextUser = payload?.user;
      if (!nextUser?.user_id) {
        throw new Error("Invalid email or password.");
      }

      const authUser: HyperNewsUser = {
        id: String(nextUser.user_id),
        email: String(nextUser.email || email),
        name: String(nextUser.display_name || email.split("@")[0] || "User"),
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    },
    async register(email: string, password: string, displayName: string) {
      await apiPost("/auth/register", {
        email,
        password,
        display_name: displayName,
      });
    },
    logout() {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useHyperNewsAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useHyperNewsAuth must be used within HyperNewsAuthProvider");
  }
  return context;
}
