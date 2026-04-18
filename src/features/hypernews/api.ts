const DEFAULT_BACKEND_BASE = "";

function trimSlashes(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

const ENV_BACKEND_BASE = trimSlashes(String(import.meta.env.VITE_HYPERNEWS_BACKEND_URL || ""));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromPayload(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const detail = payload.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  const error = payload.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  const message = payload.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const status = payload.status;
  if (typeof status === "string" && status.trim() && status !== "error") {
    return status;
  }

  return null;
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export class ApiError extends Error {
  status: number;
  detail: string;
  payload: unknown;

  constructor(path: string, status: number, payload: unknown) {
    const derivedMessage =
      messageFromPayload(payload) ||
      (typeof payload === "string" && payload.trim()) ||
      `${path} failed with ${status}`;
    super(derivedMessage);
    this.name = "ApiError";
    this.status = status;
    this.detail = derivedMessage;
    this.payload = payload;
  }
}

export function backendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (ENV_BACKEND_BASE) {
    return `${ENV_BACKEND_BASE}${normalizedPath}`;
  }

  return `${DEFAULT_BACKEND_BASE || "/hyperapi"}${normalizedPath}`;
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(backendUrl(path), init);
  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(path, response.status, payload);
  }

  return payload as T;
}

export async function apiGet<T>(path: string, init: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    cache: "no-store",
    method: "GET",
  });
}

export async function apiPost<T>(path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const requestInit: RequestInit = {
    ...init,
    method: "POST",
    headers,
  };

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestInit.body = JSON.stringify(body);
  }

  return apiRequest<T>(path, requestInit);
}

export async function apiPostForm<T>(path: string, formData: FormData, init: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: "POST",
    body: formData,
  });
}
