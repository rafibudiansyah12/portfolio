import { AuthTokensSchema, type AuthTokens } from '@portfolio/shared';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';
export const apiDocsUrl = `${apiBase.replace(/\/api\/v1\/?$/, '')}/api/docs`;
export const googleLoginUrl = `${apiBase}/auth/google`;
let accessToken: string | null = null;
let refreshRequest: Promise<AuthTokens | null> | null = null;

export type ApiList<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unread?: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setAccessToken(value: string | null): void {
  accessToken = value;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<AuthTokens | null> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data: unknown = await response.json();
        const parsed = AuthTokensSchema.safeParse(data);
        return parsed.success ? parsed.data : null;
      })
      .catch(() => null)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

type RequestOptions = RequestInit & { retryAuth?: boolean };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retryAuth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${apiBase}${path}`, {
    ...requestOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && retryAuth && path !== '/auth/login' && path !== '/auth/refresh') {
    const tokens = await refreshAccessToken();
    if (tokens) {
      accessToken = tokens.accessToken;
      return apiRequest<T>(path, { ...options, retryAuth: false });
    }
    accessToken = null;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorData: unknown = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
        const value = errorData.message;
        message = Array.isArray(value) ? value.join(', ') : String(value);
      }
    } catch {
      // Keep the status based message when the response has no JSON body.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiJson<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function apiQuery(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}
