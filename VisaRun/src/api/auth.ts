import type { Client } from '../types';
import { apiRequest } from './client';

const TOKEN_KEY = 'visarun-auth-token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function registerClient(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  return apiRequest<{ token: string; client: Client }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginClient(payload: { email: string; password: string }) {
  return apiRequest<{ token: string; client: Client }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentClient() {
  return apiRequest<{ client: Client }>('/api/auth/me', { method: 'GET' }, true);
}
