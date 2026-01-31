// In production, set VITE_API_URL to your deployed backend (e.g. https://your-api.railway.app/api)
// so sign-in/sign-up work. In dev, Vite proxies /api to localhost:3001.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

function clearToken(): void {
  localStorage.removeItem('auth_token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token: overrideToken, ...init } = options;
  const token = overrideToken !== undefined ? overrideToken : getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data as T;
}

export const auth = {
  getToken,
  setToken,
  clearToken,
};
