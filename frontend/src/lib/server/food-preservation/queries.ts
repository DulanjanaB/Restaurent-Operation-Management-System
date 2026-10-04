import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  Batch,
  PreservedItem,
  StorageLocation,
  StorageLog,
  WasteDisposal,
} from './types';

export function getPreservedItems(): Promise<PreservedItem[]> {
  return apiFetch<PreservedItem[]>('/food-preservation/items');
}

export function getStorageLocations(
  branchId?: string,
): Promise<StorageLocation[]> {
  return apiFetch<StorageLocation[]>(
    `/food-preservation/storage-locations${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getStorageLocation(id: string): Promise<StorageLocation> {
  return apiFetch<StorageLocation>(
    `/food-preservation/storage-locations/${id}`,
  );
}

export function getBatches(filters: {
  preservedItemId?: string;
  storageLocationId?: string;
}): Promise<Batch[]> {
  const params = new URLSearchParams();
  if (filters.preservedItemId)
    params.set('preserved_item_id', filters.preservedItemId);
  if (filters.storageLocationId)
    params.set('storage_location_id', filters.storageLocationId);
  const query = params.toString();
  return apiFetch<Batch[]>(
    `/food-preservation/batches${query ? `?${query}` : ''}`,
  );
}

export function getBatch(id: string): Promise<Batch> {
  return apiFetch<Batch>(`/food-preservation/batches/${id}`);
}

// `days` defaults to 3 server-side if omitted — there is no stored/
// configurable threshold despite the design doc's claim; pass it explicitly
// per-request.
export function getExpiryAlertBatches(days?: number): Promise<Batch[]> {
  return apiFetch<Batch[]>(
    `/food-preservation/batches/expiry-alerts${days ? `?days=${days}` : ''}`,
  );
}

export function getStorageLogs(
  storageLocationId: string,
): Promise<StorageLog[]> {
  return apiFetch<StorageLog[]>(
    `/food-preservation/storage-locations/${storageLocationId}/logs`,
  );
}

export function getWasteDisposals(): Promise<WasteDisposal[]> {
  return apiFetch<WasteDisposal[]>('/food-preservation/waste-disposals');
}

export interface BatchTimelineEvent {
  at: string;
  title: string;
  detail: string | null;
  tone: string;
  actor: string | null;
}

export function getBatchTimeline(id: string): Promise<BatchTimelineEvent[]> {
  return apiFetch<BatchTimelineEvent[]>(
    `/food-preservation/batches/${id}/timeline`,
  );
}
