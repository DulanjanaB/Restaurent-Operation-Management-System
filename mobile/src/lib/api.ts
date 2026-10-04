import * as SecureStore from 'expo-secure-store';

// Android emulators reach the host machine's localhost through 10.0.2.2.
// On a physical phone, set the server address on the login screen to this
// computer's LAN address (e.g. http://192.168.1.20:3001).
export const DEFAULT_SERVER_URL = 'http://10.0.2.2:3001';

const SERVER_KEY = 'server_url';
const TOKEN_KEY = 'access_token';

export interface BatchDetail {
  id: string;
  batch_code: string;
  preserved_item?: { name: string } | null;
  storage_location?: { name: string } | null;
  quantity: string;
  unit: string;
  production_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'consumed' | 'disposed';
  notes: string | null;
  production_day?: string;
  day_color?: { name: string; hex: string };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getServerUrl(): Promise<string> {
  return (await SecureStore.getItemAsync(SERVER_KEY)) ?? DEFAULT_SERVER_URL;
}

export async function setServerUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(SERVER_KEY, url.replace(/\/$/, ''));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const [base, token] = await Promise.all([getServerUrl(), getToken()]);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${base}. Check the server address.`);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(res.status, message ?? `Request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

export async function login(username: string, password: string): Promise<void> {
  const data = await request<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
}

export function fetchBatch(id: string): Promise<BatchDetail> {
  return request<BatchDetail>(`/food-preservation/batches/${id}`);
}
