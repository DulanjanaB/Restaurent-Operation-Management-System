import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  Category,
  Item,
  ItemRequest,
  ItemRequestCatalog,
  PurchaseOrder,
  Stock,
  StockBatch,
  StockMovement,
  StockMovementType,
  StockTransfer,
  Supplier,
  Unit,
  Warehouse,
  Wastage,
} from './types';

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/inventory/categories');
}

export function getUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>('/inventory/units');
}

export function getSuppliers(): Promise<Supplier[]> {
  return apiFetch<Supplier[]>('/inventory/suppliers');
}

export function getWarehouses(branchId?: string): Promise<Warehouse[]> {
  return apiFetch<Warehouse[]>(
    `/inventory/warehouses${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getItems(): Promise<Item[]> {
  return apiFetch<Item[]>('/inventory/items');
}

export function getItem(id: string): Promise<Item> {
  return apiFetch<Item>(`/inventory/items/${id}`);
}

export function getStock(filters: {
  warehouseId?: string;
  itemId?: string;
}): Promise<Stock[]> {
  const params = new URLSearchParams();
  if (filters.warehouseId) params.set('warehouse_id', filters.warehouseId);
  if (filters.itemId) params.set('item_id', filters.itemId);
  const query = params.toString();
  return apiFetch<Stock[]>(`/inventory/stock${query ? `?${query}` : ''}`);
}

export function getStockMovements(filters: {
  itemId?: string;
  warehouseId?: string;
  type?: StockMovementType;
}): Promise<StockMovement[]> {
  const params = new URLSearchParams();
  if (filters.itemId) params.set('item_id', filters.itemId);
  if (filters.warehouseId) params.set('warehouse_id', filters.warehouseId);
  if (filters.type) params.set('type', filters.type);
  const query = params.toString();
  return apiFetch<StockMovement[]>(
    `/inventory/stock-movements${query ? `?${query}` : ''}`,
  );
}

export function getStockBatches(filters: {
  itemId?: string;
  warehouseId?: string;
}): Promise<StockBatch[]> {
  const params = new URLSearchParams();
  if (filters.itemId) params.set('item_id', filters.itemId);
  if (filters.warehouseId) params.set('warehouse_id', filters.warehouseId);
  const query = params.toString();
  return apiFetch<StockBatch[]>(
    `/inventory/stock-batches${query ? `?${query}` : ''}`,
  );
}

export function getTransfers(): Promise<StockTransfer[]> {
  return apiFetch<StockTransfer[]>('/inventory/transfers');
}

export function getTransfer(id: string): Promise<StockTransfer> {
  return apiFetch<StockTransfer>(`/inventory/transfers/${id}`);
}

export function getWastageRequests(): Promise<Wastage[]> {
  return apiFetch<Wastage[]>('/inventory/wastage');
}

export function getItemRequestCatalog(): Promise<ItemRequestCatalog> {
  return apiFetch<ItemRequestCatalog>('/inventory/item-requests/catalog');
}

export function getMyItemRequests(): Promise<ItemRequest[]> {
  return apiFetch<ItemRequest[]>('/inventory/item-requests/mine');
}

export function getItemRequests(): Promise<ItemRequest[]> {
  return apiFetch<ItemRequest[]>('/inventory/item-requests');
}

export function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return apiFetch<PurchaseOrder[]>('/inventory/purchase-orders');
}

export function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return apiFetch<PurchaseOrder>(`/inventory/purchase-orders/${id}`);
}
