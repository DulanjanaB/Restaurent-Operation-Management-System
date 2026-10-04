'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// Self-service — PATCH /users/me, authenticated only. Deliberately can't
// touch username or primary_branch_id (admin-only via /users/:id).
export async function updateMyProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: str(formData, 'phone'),
        avatar_url:
          typeof formData.get('avatar_url') === 'string'
            ? formData.get('avatar_url')
            : undefined,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/my-profile');
  revalidatePath('/', 'layout');
  return {};
}

export async function changeMyPassword(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const newPassword = String(formData.get('new_password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');
  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirm_password: 'Passwords do not match' } };
  }

  try {
    await apiFetch('/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: formData.get('current_password'),
        newPassword,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  return {};
}
