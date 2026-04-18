const DEFAULT_BACKEND_BASE = "";

function trimSlashes(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

const ENV_BACKEND_BASE = trimSlashes(String(import.meta.env.VITE_HYPERNEWS_BACKEND_URL || ""));

export function backendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (ENV_BACKEND_BASE) {
    return `${ENV_BACKEND_BASE}${normalizedPath}`;
  }

  // Use Vite proxy in development when no explicit backend URL is set.
  return `${DEFAULT_BACKEND_BASE || "/hyperapi"}${normalizedPath}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(backendUrl(path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(backendUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `POST ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
