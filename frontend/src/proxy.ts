import { NextResponse, type NextRequest } from 'next/server';

// Cheap, cookie-presence-only redirect gate — NOT the security boundary.
// Real enforcement happens per-request via apiFetch()'s 401 handling and
// requireSession() in the DAL (and, ultimately, the backend's own guards).
// Proxy runs on every matched request including prefetches, so it must
// stay trivial: no JWT decode, no network call.
const PUBLIC_PREFIXES = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const hasSession = request.cookies.has('session');

  if (!hasSession && !isPublic) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // No public API for "current pathname" in a Server Component — proxy
  // forwards it as a request header so the (app) shell can decide things
  // like "hide the branch switcher on /settings" without a client hook.
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/uploads|uploads).*)'],
};
