import 'server-only';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'session';
const BRANCH_COOKIE = 'branch_id';

// Decoded (not verified) purely to read the JWT's own exp claim for cookie
// expiry — the backend re-verifies the token's signature on every request,
// so no client-side verification is needed here.
function decodeJwtExpiry(token: string): Date | undefined {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: number };
    return typeof decoded.exp === 'number'
      ? new Date(decoded.exp * 1000)
      : undefined;
  } catch {
    return undefined;
  }
}

function cookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires,
  };
}

export async function createSession(accessToken: string, branchId: string) {
  const store = await cookies();
  const expires = decodeJwtExpiry(accessToken);
  store.set(SESSION_COOKIE, accessToken, cookieOptions(expires));
  store.set(BRANCH_COOKIE, branchId, cookieOptions(expires));
}

export async function setBranchCookie(branchId: string) {
  const store = await cookies();
  const expires = decodeJwtExpiry(store.get(SESSION_COOKIE)?.value ?? '');
  store.set(BRANCH_COOKIE, branchId, cookieOptions(expires));
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function getBranchId(): Promise<string | null> {
  const store = await cookies();
  return store.get(BRANCH_COOKIE)?.value ?? null;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(BRANCH_COOKIE);
}
