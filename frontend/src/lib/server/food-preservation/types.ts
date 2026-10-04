// Global, not branch-scoped. No relations exist on this entity.
export interface PreservedItem {
  id: string;
  code: string;
  name: string;
  default_unit: string;
  category: string | null;
  // Placeholder FK for a not-yet-built Inventory link — always null today.
  inventory_item_id: string | null;
}

export type StorageLocationType = 'freezer' | 'chiller' | 'dry_store';

// `branch` relation is declared on the backend entity but never populated by
// any endpoint — only branch_id is ever returned.
export interface StorageLocation {
  id: string;
  branch_id: string;
  name: string;
  type: StorageLocationType;
  target_temp_min: string | null;
  target_temp_max: string | null;
}

export type BatchStatus = 'active' | 'expired' | 'consumed' | 'disposed';

// preserved_item/storage_location populated on GET list/one/expiry-alerts
// ONLY — undefined on create/consume responses. producer is never
// populated by any endpoint.
export interface Batch {
  id: string;
  batch_code: string;
  preserved_item_id: string;
  preserved_item?: PreservedItem;
  storage_location_id: string;
  storage_location?: StorageLocation;
  quantity: string;
  unit: string;
  production_date: string;
  expiry_date: string;
  status: BatchStatus;
  produced_by: string;
  notes: string | null;
  production_day?: string;
  day_color?: { name: string; hex: string };
  preparers?: { id: string; name: string; employee_code: string }[];
}

// storage_location/recorder relations are declared on the entity but never
// populated by any endpoint — only the *_id columns are ever returned.
// in_range is computed server-side AT WRITE TIME against the storage
// location's target range then and there — frozen historically, not
// recomputed against the location's current range on read.
export interface StorageLog {
  id: string;
  storage_location_id: string;
  recorded_at: string;
  temperature: string;
  condition_notes: string | null;
  recorded_by: string;
  in_range: boolean;
}

export type WasteDisposalReason =
  'expired' | 'spoiled' | 'damaged' | 'quality_issue' | 'other';
export type WasteDisposalStatus = 'pending' | 'approved' | 'rejected';

// batch populated on GET list/one/approve/reject — undefined on create.
// requester/approver are never populated by any endpoint.
export interface WasteDisposal {
  id: string;
  batch_id: string;
  batch?: Batch;
  quantity: string;
  reason: WasteDisposalReason;
  status: WasteDisposalStatus;
  requested_by: string;
  approved_by: string | null;
  disposed_at: string | null;
}
