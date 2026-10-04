import type { Item, Unit, Warehouse } from '@/lib/server/inventory/types';

export interface BarRecipe {
  id: string;
  name: string;
  selling_price: string;
}

export interface BarRecipeIngredient {
  id: string;
  recipe_id: string;
  item_id: string;
  item?: Item;
  quantity_per_serving: string;
  unit_id: string;
  unit?: Unit;
}

// .recipe populated on list, NOT on create response.
export interface BarSale {
  id: string;
  warehouse_id: string;
  warehouse?: Warehouse;
  recipe_id: string;
  recipe?: BarRecipe;
  quantity: string;
  unit_price: string;
  total_amount: string;
  sold_at: string;
  sold_by: string;
}

export interface BarStockCount {
  id: string;
  warehouse_id: string;
  item_id: string;
  counted_quantity: string;
  counted_at: string;
  counted_by: string;
}

export interface ReconciliationResult {
  warehouse_id: string;
  item_id: string;
  date_from: string;
  date_to: string;
  opening: string;
  stock_in: string;
  sold: string;
  wastage: string;
  expected_closing: string;
  actual_closing: string | null;
  variance: string | null;
}
