# Bar Management — Design

Builds on [inventory-management-design.md](inventory-management-design.md) — Bar Management does **not** get its own Item/Stock/StockMovement/Wastage tables. It reuses Inventory's entirely, scoped to `Warehouse`s of `type: bar`. Only what's genuinely bar-specific gets new entities: recipes, sales, and physical stock counts (for reconciliation).

## What's reused vs. new

| Inventory list item | how it's handled |
|---|---|
| Bar Items | not a new entity — `Item`s in a `bar` `Warehouse`, optionally filtered by `Category` (e.g. "Spirits", "Beer", "Mixers") |
| Stock | `Stock` (from Inventory), scoped to bar warehouses |
| Stock Issue | an Inventory `StockTransfer` from Main Store → Bar Store — see [`bar.stock_issue`](#permissions) |
| Wastage | Inventory's `Wastage` entity, `warehouse_id` = a bar warehouse — no separate table |
| Recipes | **new** — [BarRecipe](#barrecipe--barrecipeingredient) |
| Consumption | **not stored directly** — derived from `StockMovement` rows generated when a `BarSale` is recorded |
| Sales | **new** — [BarSale](#barsale) |
| Reports | includes the [reconciliation report](#stock-reconciliation), everything else via standard `.report`/`.export` over the reused entities |

## BarRecipe + BarRecipeIngredient

Needed because a sale doesn't deduct stock 1:1 — a cocktail draws from several ingredient items, and even a straight pour ("Whisky, single") draws a fixed *portion* (e.g. 30ml) from a 750ml bottle `Item`, not "1 unit."

### BarRecipe
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | e.g. "Mojito", "Whisky (Single)" |
| selling_price | decimal | |

### BarRecipeIngredient
| column | type | notes |
|---|---|---|
| recipe_id | uuid | FK → BarRecipe |
| item_id | uuid | FK → `Item` (from Inventory) |
| quantity_per_serving | decimal | e.g. `30` |
| unit_id | uuid | FK → `Unit` — e.g. `ml`, may differ from the item's stock unit (bottles), see [unit conversion](#unit-conversion-note) |

## BarSale

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| warehouse_id | uuid | FK → Warehouse (bar) |
| recipe_id | uuid | FK → BarRecipe |
| quantity | decimal | servings sold |
| unit_price | decimal | snapshot of `BarRecipe.selling_price` at sale time |
| total_amount | decimal | |
| sold_at | timestamp | |
| sold_by | uuid | FK → User |

Recording a `BarSale` writes one `stock_out` `StockMovement` per `BarRecipeIngredient` (quantity = `BarRecipeIngredient.quantity_per_serving × BarSale.quantity`, converted to the item's stock unit), with `reference_type: 'bar_sale'`, `reference_id: BarSale.id`. This is what "Consumption" means here — it's the aggregate of these movements, not a separately entered number.

### Unit conversion note

`BarRecipeIngredient.quantity_per_serving` is in `ml`, but `Item.unit_id` for a bottled spirit is typically "bottle." Deducting stock needs a conversion (750ml bottle = 25 × 30ml pours). Simplest approach: add a `base_unit_quantity` field to `Item` (e.g. `750`, meaning "1 unit of this item = 750ml") used only for items where recipes reference a smaller unit than the stock unit. Flag this as a detail to confirm when building it — it's the one place unit handling gets real.

## Stock reconciliation

This is what your Whisky example is doing:

```
opening_stock  = closing count from the previous period (or current Stock.quantity if no prior count)
+ stock_in     = StockMovement (transfer_in) into this warehouse during the period
− sold         = StockMovement (stock_out, reference_type = 'bar_sale') during the period
− wastage      = StockMovement (wastage) during the period
= expected_closing
```

Checks out against your numbers: `5 − 1.5 − 0.1 = 3.4`.

The reconciliation's actual value is catching **variance** — comparing `expected_closing` against a physically counted stock, which is why it needs its own entity rather than being pure computation:

### BarStockCount
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| warehouse_id | uuid | FK → Warehouse |
| item_id | uuid | FK → Item |
| counted_quantity | decimal | |
| counted_at | date | |
| counted_by | uuid | FK → User |

Report = `expected_closing` vs. `BarStockCount.counted_quantity` → `variance`. A non-zero variance (over-pouring, spillage never logged as wastage, theft) is the thing worth surfacing on the report — everything upstream of it is already covered by reused Inventory data.

## Permissions

| permission key | purpose |
|---|---|
| `bar.view` / `.create` / `.update` / `.delete` | `BarRecipe` CRUD |
| `bar.stock_issue` | request/approve a Main Store → Bar Store `StockTransfer` |
| `bar.record_sale` | create a `BarSale` — kept separate from `.create` since it's a high-frequency, low-trust-required action (a bartender records sales all shift, but shouldn't necessarily be able to create new recipes) |
| `bar.count_stock` | record a `BarStockCount` entry |
| `bar.approve` | approve a `Wastage` request against a bar warehouse (reuses Inventory's `Wastage` workflow) |
| `bar.export` / `.report` | standard — includes the reconciliation report |
