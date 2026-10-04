import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';

// Cookies can only be mutated inside a Server Action or Route Handler, not
// during a plain Server Component render — so apiFetch()'s 401 handler
// can't call clearSession() itself (it's invoked from page renders too).
// It redirects here instead, where clearing + the final redirect are both
// legal.
export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL('/login?reason=expired', request.url));
}
