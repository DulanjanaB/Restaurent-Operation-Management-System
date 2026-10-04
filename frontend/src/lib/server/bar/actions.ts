'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { BarRecipe } from './types';

// --- Recipes ---

export async function createBarRecipe(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let recipeId: string;
  try {
    const recipe = await apiFetch<BarRecipe>('/bar/recipes', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        selling_price: formData.get('selling_price'),
      }),
    });
    recipeId = recipe.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/bar/recipes');
  redirect(`/bar/recipes/${recipeId}`);
}

export async function updateBarRecipe(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/bar/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        selling_price: formData.get('selling_price'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/bar/recipes/${id}`);
  revalidatePath('/bar/recipes');
  return {};
}

export async function deleteBarRecipe(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/bar/recipes/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/bar/recipes');
  return {};
}

export async function addRecipeIngredient(
  recipeId: string,
  itemId: string,
  quantityPerServing: string,
  unitId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/bar/recipes/${recipeId}/ingredients`, {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        quantity_per_serving: quantityPerServing,
        unit_id: unitId,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/bar/recipes/${recipeId}`);
  return {};
}

export async function removeRecipeIngredient(
  recipeId: string,
  ingredientId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/bar/recipes/${recipeId}/ingredients/${ingredientId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/bar/recipes/${recipeId}`);
  return {};
}

// --- Sales ---

export async function recordSale(
  warehouseId: string,
  recipeId: string,
  quantity: string,
): Promise<ActionResult> {
  try {
    await apiFetch('/bar/sales', {
      method: 'POST',
      body: JSON.stringify({
        warehouse_id: warehouseId,
        recipe_id: recipeId,
        quantity,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/bar/sales');
  revalidatePath('/bar/sales/history');
  return {};
}

// --- Stock Issue (bridges Inventory's StockTransfer.create — request only,
// approve/complete must happen on the Inventory Transfers screens) ---

export async function createStockIssue(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/bar/stock-issue', {
      method: 'POST',
      body: JSON.stringify({
        from_warehouse_id: formData.get('from_warehouse_id'),
        to_warehouse_id: formData.get('to_warehouse_id'),
        items: [
          {
            item_id: formData.get('item_id'),
            quantity: formData.get('quantity'),
          },
        ],
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/inventory/transfers');
  return {};
}

// --- Stock Count ---

export async function recordStockCount(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/bar/stock-counts', {
      method: 'POST',
      body: JSON.stringify({
        warehouse_id: formData.get('warehouse_id'),
        item_id: formData.get('item_id'),
        counted_quantity: formData.get('counted_quantity'),
        counted_at: formData.get('counted_at'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/bar/stock-counts');
  return {};
}

// --- Wastage bridge (bar.approve, independent of inventory.approve) ---

export async function decideBarWastage(
  id: string,
  decision: 'approve' | 'reject',
): Promise<ActionResult> {
  try {
    await apiFetch(`/bar/wastage/${id}/${decision}`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/bar/wastage');
  return {};
}
