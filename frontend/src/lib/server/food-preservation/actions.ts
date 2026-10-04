'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { Batch } from './types';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// --- Preserved Items (global) ---

export async function createPreservedItem(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/food-preservation/items', {
      method: 'POST',
      body: JSON.stringify({
        code: formData.get('code'),
        name: formData.get('name'),
        default_unit: formData.get('default_unit'),
        category: str(formData, 'category'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/preserved-items');
  return {};
}

export async function updatePreservedItem(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        default_unit: formData.get('default_unit'),
        category: str(formData, 'category'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/preserved-items');
  return {};
}

export async function deletePreservedItem(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/items/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/preserved-items');
  return {};
}

// --- Storage Locations (branch-scoped) ---

export async function createStorageLocation(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/food-preservation/storage-locations', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        type: formData.get('type'),
        target_temp_min: str(formData, 'target_temp_min'),
        target_temp_max: str(formData, 'target_temp_max'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/storage-locations');
  return {};
}

export async function updateStorageLocation(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/storage-locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        type: formData.get('type'),
        target_temp_min: str(formData, 'target_temp_min'),
        target_temp_max: str(formData, 'target_temp_max'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/storage-locations');
  revalidatePath(`/food-preservation/storage-locations/${id}`);
  return {};
}

export async function deleteStorageLocation(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/storage-locations/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/storage-locations');
  return {};
}

// --- Batches ---

export async function createBatch(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let batchId: string;
  try {
    const batch = await apiFetch<Batch>('/food-preservation/batches', {
      method: 'POST',
      body: JSON.stringify({
        preserved_item_id: formData.get('preserved_item_id'),
        storage_location_id: formData.get('storage_location_id'),
        quantity: formData.get('quantity'),
        production_date: formData.get('production_date'),
        expiry_date: formData.get('expiry_date'),
        notes: str(formData, 'notes'),
        prepared_by_ids: formData.getAll('prepared_by_id'),
      }),
    });
    batchId = batch.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/batches');
  redirect(`/food-preservation/batches/${batchId}`);
}

export async function consumeBatch(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/batches/${id}/consume`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/food-preservation/batches/${id}`);
  revalidatePath('/food-preservation/batches');
  return {};
}

// --- Storage Logs ---

export async function logStorage(
  storageLocationId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(
      `/food-preservation/storage-locations/${storageLocationId}/logs`,
      {
        method: 'POST',
        body: JSON.stringify({
          temperature: formData.get('temperature'),
          condition_notes: str(formData, 'condition_notes'),
        }),
      },
    );
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/food-preservation/storage-locations/${storageLocationId}`);
  return {};
}

// --- Waste Disposals ---

export async function createWasteDisposal(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/food-preservation/waste-disposals', {
      method: 'POST',
      body: JSON.stringify({
        batch_id: formData.get('batch_id'),
        quantity: formData.get('quantity'),
        reason: formData.get('reason'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/waste-disposals');
  return {};
}

export async function decideWasteDisposal(
  id: string,
  decision: 'approve' | 'reject',
): Promise<ActionResult> {
  try {
    await apiFetch(`/food-preservation/waste-disposals/${id}/${decision}`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/food-preservation/waste-disposals');
  revalidatePath('/food-preservation/batches');
  return {};
}
