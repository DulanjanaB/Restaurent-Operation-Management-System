'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';

export interface LoginState {
  error?: string;
}

interface LoginResponse {
  accessToken: string;
  user: { id: string; primary_branch_id: string };
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  const res = await fetch(
    `${process.env.BACKEND_API_URL ?? 'http://localhost:3001'}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    },
  );

  if (!res.ok) {
    return { error: 'Invalid username or password.' };
  }

  const { accessToken, user } = (await res.json()) as LoginResponse;
  await createSession(accessToken, user.primary_branch_id);
  redirect(next && next.startsWith('/') ? next : '/dashboard');
}
