'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { TipPool } from './types';

export async function createTipPool(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let poolId: string;
  try {
    const pool = await apiFetch<TipPool>('/tip/pools', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        date: formData.get('date'),
        total_amount: formData.get('total_amount'),
      }),
    });
    poolId = pool.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/tip-sharing/pools');
  redirect(`/tip-sharing/pools/${poolId}`);
}

// Backend restricts this to still-"open" pools (400 otherwise) — the
// frontend only shows the delete control for an open pool in the first
// place, this is just the matching write path.
export async function deleteTipPool(poolId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/tip-sharing/pools');
  return {};
}

export async function updateTipPoolAmount(
  poolId: string,
  totalAmount: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}`, {
      method: 'PATCH',
      body: JSON.stringify({ total_amount: totalAmount }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/tip-sharing/pools/${poolId}`);
  return {};
}

export async function addParticipant(
  poolId: string,
  employeeId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/tip-sharing/pools/${poolId}`);
  return {};
}

export async function updateParticipantPercentage(
  poolId: string,
  allocationId: string,
  percentage: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}/participants/${allocationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ percentage }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/tip-sharing/pools/${poolId}`);
  return {};
}

export async function removeParticipant(
  poolId: string,
  allocationId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}/participants/${allocationId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/tip-sharing/pools/${poolId}`);
  return {};
}

export async function calculateTipPool(poolId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/pools/${poolId}/calculate`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/tip-sharing/pools/${poolId}`);
  revalidatePath('/tip-sharing/pools');
  return {};
}

export async function payoutEmployee(
  employeeId: string,
  notes?: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/tip/employees/${employeeId}/payout`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || undefined }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/tip-sharing/balances');
  revalidatePath('/tip-sharing/my-balance');
  return {};
}
