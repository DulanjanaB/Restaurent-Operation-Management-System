import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  BarRecipe,
  BarRecipeIngredient,
  BarSale,
  BarStockCount,
  ReconciliationResult,
} from './types';

export function getBarRecipes(): Promise<BarRecipe[]> {
  return apiFetch<BarRecipe[]>('/bar/recipes');
}

export function getBarRecipe(
  id: string,
): Promise<BarRecipe & { ingredients: BarRecipeIngredient[] }> {
  return apiFetch(`/bar/recipes/${id}`);
}

export function getBarSales(warehouseId?: string): Promise<BarSale[]> {
  return apiFetch<BarSale[]>(
    `/bar/sales${warehouseId ? `?warehouse_id=${warehouseId}` : ''}`,
  );
}

export function getBarStockCounts(filters: {
  warehouseId?: string;
  itemId?: string;
}): Promise<BarStockCount[]> {
  const params = new URLSearchParams();
  if (filters.warehouseId) params.set('warehouse_id', filters.warehouseId);
  if (filters.itemId) params.set('item_id', filters.itemId);
  const query = params.toString();
  return apiFetch<BarStockCount[]>(
    `/bar/stock-counts${query ? `?${query}` : ''}`,
  );
}

export function getReconciliation(filters: {
  warehouseId: string;
  itemId: string;
  dateFrom: string;
  dateTo: string;
}): Promise<ReconciliationResult> {
  const params = new URLSearchParams({
    warehouse_id: filters.warehouseId,
    item_id: filters.itemId,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
  });
  return apiFetch<ReconciliationResult>(
    `/bar/stock-counts/reconciliation?${params.toString()}`,
  );
}
