'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { Branch, Role, PermissionEffect } from './types';

// --- Branches ---

export async function createBranch(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch<Branch>('/branches', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        code: formData.get('code'),
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/branches');
  return {};
}

export async function updateBranch(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch<Branch>(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        status: formData.get('status'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/branches');
  return {};
}

// --- Users ---

export async function createUser(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let userId: string;
  try {
    const user = await apiFetch<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
        name: formData.get('name'),
        password: formData.get('password'),
        primary_branch_id: formData.get('primary_branch_id') || undefined,
      }),
    });
    userId = user.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/users');
  redirect(`/administration/users/${userId}`);
}

export async function updateUser(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
        name: formData.get('name'),
        primary_branch_id: formData.get('primary_branch_id') || undefined,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${id}`);
  revalidatePath('/administration/users');
  return {};
}

// Hard delete — distinct from setUserActive(false) below. The backend
// rejects this with a clean 409 (not a crash) if the user has a linked
// Employee or other activity history; deactivate is the fallback for
// those, same as the UI's own guidance in the confirm dialog.
export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/users');
  return {};
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${id}/${active ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${id}`);
  revalidatePath('/administration/users');
  return {};
}

export async function resetUserPassword(
  id: string,
): Promise<ActionResult & { generatedPassword?: string }> {
  try {
    const result = await apiFetch<{ generatedPassword?: string }>(
      `/users/${id}/reset-password`,
      { method: 'POST', body: JSON.stringify({}) },
    );
    return result;
  } catch (error) {
    return describeApiError(error);
  }
}

export async function assignUserRole(
  userId: string,
  roleId: string,
  branchId: string | null,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({
        role_id: roleId,
        branch_id: branchId ?? undefined,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${userId}`);
  return {};
}

export async function removeUserRole(
  userId: string,
  userRoleId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${userId}/roles/${userRoleId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${userId}`);
  return {};
}

export async function setUserPermissionOverride(
  userId: string,
  permissionId: string,
  effect: PermissionEffect,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permission_id: permissionId, effect }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${userId}`);
  return {};
}

export async function removeUserPermissionOverride(
  userId: string,
  permissionId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/users/${userId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/users/${userId}`);
  return {};
}

// --- Roles ---

export async function createRole(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let roleId: string;
  try {
    const role = await apiFetch<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description') || undefined,
      }),
    });
    roleId = role.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/roles');
  redirect(`/administration/roles/${roleId}`);
}

export async function updateRole(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description') || undefined,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/roles/${id}`);
  revalidatePath('/administration/roles');
  return {};
}

export async function deleteRole(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roles/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/administration/roles');
  redirect('/administration/roles');
}

export async function setRolePermissions(
  id: string,
  permissionIds: string[],
): Promise<ActionResult> {
  try {
    await apiFetch(`/roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permission_ids: permissionIds }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/administration/roles/${id}`);
  return {};
}
