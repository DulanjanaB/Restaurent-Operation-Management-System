import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type { AppUser } from '@/lib/server/administration/types';

// Self-service — GET /users/me needs only an authenticated session, no
// administration.user.view permission (unlike GET /users/:id).
export function getMyProfile(): Promise<AppUser> {
  return apiFetch<AppUser>('/users/me');
}
