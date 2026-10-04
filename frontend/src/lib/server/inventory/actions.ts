'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type {
  Item,
  PurchaseOrder,
  StockTransfer,
  WastageReason,
} from './types';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// --- Categories ---

export async function createCategory(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/categories');
  return {};
}

export async function updateCategory(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/categories');
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/categories/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/categories');
  return {};
}

// --- Units ---

export async function createUnit(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/units', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        abbreviation: formData.get('abbreviation'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/units');
  return {};
}

export async function updateUnit(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        abbreviation: formData.get('abbreviation'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/units');
  return {};
}

export async function deleteUnit(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/units/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/units');
  return {};
}

// --- Suppliers ---

export async function createSupplier(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        contact_person: str(formData, 'contact_person'),
        phone: str(formData, 'phone'),
        email: str(formData, 'email'),
        address: str(formData, 'address'),
        notes: str(formData, 'notes'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/suppliers');
  return {};
}

export async function updateSupplier(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        contact_person: str(formData, 'contact_person'),
        phone: str(formData, 'phone'),
        email: str(formData, 'email'),
        address: str(formData, 'address'),
        notes: str(formData, 'notes'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/suppliers');
  return {};
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/suppliers/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/suppliers');
  return {};
}

// --- Warehouses ---

export async function createWarehouse(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/warehouses', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        type: formData.get('type'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/warehouses');
  return {};
}

export async function updateWarehouse(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/warehouses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        type: formData.get('type'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/warehouses');
  return {};
}

export async function deleteWarehouse(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/warehouses/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/warehouses');
  return {};
}

// --- Items ---

export async function createItem(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch<Item>('/inventory/items', {
      method: 'POST',
      body: JSON.stringify({
        sku: formData.get('sku'),
        name: formData.get('name'),
        category_id: formData.get('category_id'),
        unit_id: formData.get('unit_id'),
        track_expiry: formData.get('track_expiry') === 'on',
        base_unit_quantity: str(formData, 'base_unit_quantity'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/items');
  return {};
}

export async function updateItem(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        category_id: formData.get('category_id'),
        unit_id: formData.get('unit_id'),
        track_expiry: formData.get('track_expiry') === 'on',
        base_unit_quantity: str(formData, 'base_unit_quantity'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/items');
  return {};
}

export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/items/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/items');
  return {};
}

// --- Stock In/Out/Adjustment ---

export async function stockIn(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify({
        item_id: formData.get('item_id'),
        warehouse_id: formData.get('warehouse_id'),
        quantity: formData.get('quantity'),
        batch_no: str(formData, 'batch_no'),
        expiry_date: str(formData, 'expiry_date'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/stock');
  return {};
}

export async function stockOut(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/stock-out', {
      method: 'POST',
      body: JSON.stringify({
        item_id: formData.get('item_id'),
        warehouse_id: formData.get('warehouse_id'),
        quantity: formData.get('quantity'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/stock');
  return {};
}

export async function stockAdjustment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/stock-adjustment', {
      method: 'POST',
      body: JSON.stringify({
        item_id: formData.get('item_id'),
        warehouse_id: formData.get('warehouse_id'),
        new_quantity: formData.get('new_quantity'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/stock');
  return {};
}

// --- Stock Transfers ---

export async function createTransfer(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const itemIds = formData.getAll('item_id');
  const quantities = formData.getAll('quantity');
  const items = itemIds
    .map((itemId, index) => ({
      item_id: String(itemId),
      quantity: String(quantities[index] ?? ''),
    }))
    .filter((line) => line.item_id && line.quantity);

  let transferId: string;
  try {
    const transfer = await apiFetch<StockTransfer>('/inventory/transfers', {
      method: 'POST',
      body: JSON.stringify({
        from_warehouse_id: formData.get('from_warehouse_id'),
        to_warehouse_id: formData.get('to_warehouse_id'),
        items,
      }),
    });
    transferId = transfer.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/transfers');
  redirect(`/inventory/transfers/${transferId}`);
}

export async function approveTransfer(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/transfers/${id}/approve`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/transfers/${id}`);
  revalidatePath('/inventory/transfers');
  return {};
}

export async function completeTransfer(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/transfers/${id}/complete`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/transfers/${id}`);
  revalidatePath('/inventory/transfers');
  return {};
}

export async function cancelTransfer(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/transfers/${id}/cancel`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/transfers/${id}`);
  revalidatePath('/inventory/transfers');
  return {};
}

// --- Wastage ---

export async function createWastage(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/inventory/wastage', {
      method: 'POST',
      body: JSON.stringify({
        item_id: formData.get('item_id'),
        warehouse_id: formData.get('warehouse_id'),
        quantity: formData.get('quantity'),
        reason: formData.get('reason') as WastageReason,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/wastage');
  return {};
}

export async function decideWastage(
  id: string,
  decision: 'approve' | 'reject',
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/wastage/${id}/${decision}`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/wastage');
  return {};
}

// --- Item Requests ---

export async function createItemRequest(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let items: { item_id: string; quantity: string }[];
  try {
    items = JSON.parse(String(formData.get('lines') ?? '[]'));
  } catch {
    return { error: 'Request lines could not be read. Please try again.' };
  }
  try {
    await apiFetch('/inventory/item-requests', {
      method: 'POST',
      body: JSON.stringify({
        warehouse_id: formData.get('warehouse_id'),
        notes: str(formData, 'notes'),
        items,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/item-requests');
  return {};
}

export async function decideItemRequest(
  id: string,
  decision: 'approve' | 'reject',
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/item-requests/${id}/${decision}`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/item-requests');
  revalidatePath('/inventory/stock');
  return {};
}

// --- Purchase Orders ---

export async function createPurchaseOrder(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const itemIds = formData.getAll('item_id');
  const quantities = formData.getAll('quantity_ordered');
  const prices = formData.getAll('unit_price');
  const items = itemIds
    .map((itemId, index) => ({
      item_id: String(itemId),
      quantity_ordered: String(quantities[index] ?? ''),
      unit_price: String(prices[index] ?? ''),
    }))
    .filter((line) => line.item_id && line.quantity_ordered && line.unit_price);

  let orderId: string;
  try {
    const order = await apiFetch<PurchaseOrder>('/inventory/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        supplier_id: formData.get('supplier_id'),
        order_date: formData.get('order_date'),
        expected_date: str(formData, 'expected_date'),
        items,
      }),
    });
    orderId = order.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/purchase-orders');
  redirect(`/inventory/purchase-orders/${orderId}`);
}

export async function submitPurchaseOrder(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/purchase-orders/${id}/submit`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/purchase-orders/${id}`);
  return {};
}

export async function approvePurchaseOrder(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/purchase-orders/${id}/approve`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/purchase-orders/${id}`);
  return {};
}

export async function cancelPurchaseOrder(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/purchase-orders/${id}/cancel`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/purchase-orders/${id}`);
  return {};
}

export async function receivePurchaseOrder(
  id: string,
  warehouseId: string,
  lines: {
    purchase_order_item_id: string;
    quantity_received: string;
    batch_no?: string;
    expiry_date?: string;
  }[],
): Promise<ActionResult> {
  try {
    await apiFetch(`/inventory/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ warehouse_id: warehouseId, lines }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/inventory/purchase-orders/${id}`);
  return {};
}
