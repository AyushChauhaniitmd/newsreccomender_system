"use client";

const SESSION_USER_ID_KEY = "hypernews_session_user_id";

export function createSessionUserId(): string {
  if (window.crypto?.randomUUID) {
    return `session_${window.crypto.randomUUID().slice(0, 8)}`;
  }

  return `session_${Math.random().toString(36).slice(2, 10)}`;
}

export function readSessionUserId(): string {
  return window.sessionStorage.getItem(SESSION_USER_ID_KEY) || "";
}

export function writeSessionUserId(userId: string) {
  window.sessionStorage.setItem(SESSION_USER_ID_KEY, userId);
}

export function ensureSessionUserId(): string {
  const storedUserId = readSessionUserId();
  if (storedUserId) {
    return storedUserId;
  }

  const nextUserId = createSessionUserId();
  writeSessionUserId(nextUserId);
  return nextUserId;
}

