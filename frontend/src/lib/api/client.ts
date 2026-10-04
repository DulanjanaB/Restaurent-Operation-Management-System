import 'server-only';
import { redirect } from 'next/navigation';
import { getToken, getBranchId } from '../auth/session';

const BASE_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3001';

// NestJS's ValidationPipe({ whitelist: true, transform: true }) error shape.
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody | unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

// The one function that ever calls the NestJS backend. Attaches the JWT +
// current branch, centralizes 401 handling (expired/invalid session ->
// clear cookies, redirect to login), and throws ApiError for every other
// non-2xx response so callers decide how to present 400/403/404/409.
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const [token, branchId] = await Promise.all([getToken(), getBranchId()]);

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (branchId) headers.set('X-Branch-Id', branchId);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Cookies can only be cleared inside a Server Action/Route Handler, and
  // apiFetch() is also called from plain Server Component page renders —
  // so the actual clearSession() happens in that route, not here. See
  // src/app/api/auth/expire/route.ts.
  if (res.status === 401) {
    redirect('/api/auth/expire');
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body (rare) — leave body null
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

// For CSV/Excel report exports and similar binary/file downloads, where the
// caller needs the raw Response (headers + blob), not a parsed body.
export async function apiFetchRaw(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const [token, branchId] = await Promise.all([getToken(), getBranchId()]);
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (branchId) headers.set('X-Branch-Id', branchId);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    redirect('/api/auth/expire');
  }
  return res;
}
