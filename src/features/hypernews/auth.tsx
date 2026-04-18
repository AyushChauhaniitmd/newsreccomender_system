import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet } from "./api";

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
const REGISTRY_KEY = "hypernews_auth_registry";

const AuthContext = createContext<AuthContextValue | null>(null);

interface StoredAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createNamedUserId(email: string): string {
  const slug = normalizeEmail(email)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `member_${slug || "user"}`;
}

function readRegistry(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAccount>) : {};
  } catch {
    localStorage.removeItem(REGISTRY_KEY);
    return {};
  }
}

function writeRegistry(registry: Record<string, StoredAccount>) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

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

  const persistUser = (nextUser: HyperNewsUser | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user?.id,
    async login(email: string, password: string) {
      const normalizedEmail = normalizeEmail(email);
      const registry = readRegistry();
      const account = registry[normalizedEmail];
      if (!account) {
        throw new Error("No local account exists for that email. Register first.");
      }

      const passwordHash = await hashPassword(password);
      if (account.passwordHash !== passwordHash) {
        throw new Error("Invalid email or password.");
      }

      await apiGet(`/profile/${encodeURIComponent(account.id)}`);

      const authUser: HyperNewsUser = {
        id: account.id,
        email: account.email,
        name: account.name,
      };
      persistUser(authUser);
    },
    async register(email: string, password: string, displayName: string) {
      const normalizedEmail = normalizeEmail(email);
      const trimmedName = displayName.trim() || normalizedEmail.split("@")[0] || "User";

      if (password.trim().length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const registry = readRegistry();
      if (registry[normalizedEmail]) {
        throw new Error("An account already exists for that email. Sign in instead.");
      }

      const account: StoredAccount = {
        id: createNamedUserId(normalizedEmail),
        email: normalizedEmail,
        name: trimmedName,
        passwordHash: await hashPassword(password),
      };

      await apiGet(`/profile/${encodeURIComponent(account.id)}`);
      registry[normalizedEmail] = account;
      writeRegistry(registry);
    },
    logout() {
      persistUser(null);
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
