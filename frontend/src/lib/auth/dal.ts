import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { apiFetch, ApiError } from '../api/client';
import { getToken } from './session';

export interface Me {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  primary_branch_id: string;
  current_branch_id: string;
  permissions: string[];
}

// Memoized per-request via React's cache() — the layout's requireSession()
// and any number of nested pages/components calling getMe() again cost
// exactly one /auth/me round-trip, not one each. Permissions are
// branch-scoped server-side, so a fresh request after a branch switch
// naturally picks up the new permission set (see switchBranch action).
export const getMe = cache(async (): Promise<Me | null> => {
  if (!(await getToken())) return null;
  try {
    return await apiFetch<Me>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  }
});

export async function requireSession(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect('/login');
  return me;
}
