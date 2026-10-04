export type WarehouseType = 'main' | 'kitchen' | 'bar' | 'freezer' | 'other';
export type StockMovementType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment_increase'
  | 'adjustment_decrease'
  | 'transfer_in'
  | 'transfer_out'
  | 'wastage';
export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';
// 'in_transit' is declared server-side but unreachable — no endpoint ever
// sets it. Only pending -> approved -> completed, or -> cancelled, occur.
export type StockTransferStatus =
  'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
export type WastageReason =
  'expired' | 'damaged' | 'spoiled' | 'theft' | 'other';
export type WastageStatus = 'pending' | 'approved' | 'rejected';
export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

// .branch is never populated by any endpoint — resolve branch name from
// the branches list separately if needed.
export interface Warehouse {
  id: string;
  branch_id: string;
  name: string;
  type: WarehouseType;
}

// .category/.unit populated on GET list/one only — undefined on
// create/update responses.
export interface Item {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category?: Category;
  unit_id: string;
  unit?: Unit;
  track_expiry: boolean;
  base_unit_quantity: string | null;
}

// .item/.warehouse populated on GET /inventory/stock only; status is
// computed server-side, never persisted.
export interface Stock {
  item_id: string;
  item?: Item;
  warehouse_id: string;
  warehouse?: Warehouse;
  quantity: string;
  minimum_stock_level: string;
  status: StockStatus;
}

// No relations ever populated on this endpoint (list only, no GET :id).
export interface StockMovement {
  id: string;
  item_id: string;
  warehouse_id: string;
  stock_batch_id: string | null;
  type: StockMovementType;
  quantity: string;
  reference_type: string | null;
  reference_id: string | null;
  performed_by: string;
  occurred_at: string;
}

// No relations ever populated (list only, no GET :id).
export interface StockBatch {
  id: string;
  item_id: string;
  warehouse_id: string;
  batch_no: string;
  quantity: string;
  expiry_date: string;
  received_at: string;
}

// from_warehouse/to_warehouse populated on list/one; undefined on
// create/approve/complete/cancel responses. `items` only present on the
// GET :id response, never on list or any mutation response.
export interface StockTransfer {
  id: string;
  from_warehouse_id: string;
  from_warehouse?: Warehouse;
  to_warehouse_id: string;
  to_warehouse?: Warehouse;
  status: StockTransferStatus;
  requested_by: string;
  approved_by: string | null;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  stock_transfer_id: string;
  item_id: string;
  item?: Item;
  quantity: string;
}

// item/warehouse populated on GET list/one AND on approve/reject
// (decide() reuses the loaded findOne() object) — but NOT on create.
export interface Wastage {
  id: string;
  item_id: string;
  item?: Item;
  warehouse_id: string;
  warehouse?: Warehouse;
  quantity: string;
  reason: WastageReason;
  status: WastageStatus;
  requested_by: string;
  approved_by: string | null;
}

export type ItemRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ItemRequestLine {
  id: string;
  item_id: string;
  item?: Pick<Item, 'id' | 'name' | 'sku'>;
  quantity: string;
}

export interface ItemRequest {
  id: string;
  warehouse_id: string;
  warehouse?: { id: string; name: string };
  notes: string | null;
  status: ItemRequestStatus;
  requested_by: string;
  requester?: { id: string; name: string };
  decided_by: string | null;
  decider?: { id: string; name: string } | null;
  created_at: string;
  items: ItemRequestLine[];
}

export interface ItemRequestCatalog {
  items: {
    id: string;
    name: string;
    sku: string;
    unit: { id: string; name: string; abbreviation: string };
  }[];
  warehouses: { id: string; name: string }[];
}

// branch/supplier populated on list/one; undefined on every mutation
// response (create/submit/approve/cancel/receive). `items` only present
// on GET :id.
export interface PurchaseOrder {
  id: string;
  branch_id: string;
  branch?: { id: string; name: string };
  supplier_id: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_date: string | null;
  created_by: string;
  approved_by: string | null;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  item?: Item;
  quantity_ordered: string;
  unit_price: string;
  quantity_received: string;
}
