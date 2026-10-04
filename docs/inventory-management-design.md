# Inventory Management — Design

Builds on [rbac-design.md](rbac-design.md). Resolves the open dependencies from [food-preservation-design.md](food-preservation-design.md#future-inventory-link) and [event-management-design.md](event-management-design.md#open-dependencies).

## Master data (mostly global)

### Category (global)
id, name, description — e.g. "Meat", "Vegetables", "Dairy", "Beverages".

### Unit (global)
id, name, abbreviation — e.g. "Kilogram" / `KG`.

### Supplier (global)
id, name, contact_person, phone, email, address, notes. Not branch-scoped — a supplier can serve multiple branches.

### Warehouse (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| name | string | e.g. "Main Store", "Kitchen Store", "Bar Store", "Freezer" |
| type | enum | `main`, `kitchen`, `bar`, `freezer`, `other` |

Matches your "Later" diagram exactly — each branch has multiple stores.

### Item (global catalog)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| sku | string | unique |
| name | string | e.g. "Chicken Breast" |
| category_id | uuid | FK → Category |
| unit_id | uuid | FK → Unit |
| track_expiry | boolean | if true, stock is tracked in `StockBatch` lots with expiry dates |

Global — same "Chicken Breast" item, stock tracked separately per warehouse.

## Stock

### Stock (current balance, one row per item × warehouse)
| column | type | notes |
|---|---|---|
| item_id | uuid | FK → Item |
| warehouse_id | uuid | FK → Warehouse |
| quantity | decimal | current on-hand |
| minimum_stock_level | decimal | threshold for *this item at this warehouse* — Kitchen Store and Main Store can have different minimums for the same item |

Unique on `(item_id, warehouse_id)`. `Status` ("Available" in your example) isn't stored — computed as `available` (qty > min), `low_stock` (0 < qty ≤ min), `out_of_stock` (qty ≤ 0).

### StockBatch (only for items with `track_expiry = true`)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| item_id | uuid | FK → Item |
| warehouse_id | uuid | FK → Warehouse |
| batch_no | string | |
| quantity | decimal | remaining in this lot |
| expiry_date | date | |
| received_at | date | |

Lets perishable raw stock (e.g. a delivery of chicken breast) carry its own expiry, independent of what it becomes once cooked in [Food Preservation](food-preservation-design.md).

### StockMovement (single ledger — Stock In / Out / Adjustment / Transfer / Wastage)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| item_id | uuid | FK → Item |
| warehouse_id | uuid | FK → Warehouse |
| stock_batch_id | uuid, nullable | FK → StockBatch, if applicable |
| type | enum | `stock_in`, `stock_out`, `adjustment_increase`, `adjustment_decrease`, `transfer_in`, `transfer_out`, `wastage` |
| quantity | decimal | |
| reference_type | string, nullable | e.g. `purchase_order`, `event_requirement`, `wastage`, `transfer` |
| reference_id | uuid, nullable | points at the source record (`PurchaseOrder.id`, `Event.id`, etc.) |
| performed_by | uuid | FK → User |
| occurred_at | timestamp | |

One ledger rather than four separate tables — Stock In/Out/Adjustment/Transfer all have the same shape (item, warehouse, quantity, who, when), and reporting needs to see them together anyway. Every row here is the single source of truth that moves `Stock.quantity`; nothing updates `Stock.quantity` directly.

### StockTransfer (header) + StockTransferItem (lines)
| StockTransfer | type | notes |
|---|---|---|
| id | uuid | PK |
| from_warehouse_id | uuid | FK → Warehouse |
| to_warehouse_id | uuid | FK → Warehouse |
| status | enum | `pending`, `approved`, `in_transit`, `completed`, `cancelled` |
| requested_by | uuid | FK → User |
| approved_by | uuid, nullable | FK → User |

| StockTransferItem | type | notes |
|---|---|---|
| stock_transfer_id | uuid | FK → StockTransfer |
| item_id | uuid | FK → Item |
| quantity | decimal | |

Completing a transfer writes a `transfer_out` `StockMovement` at the source and a `transfer_in` at the destination for each line.

### Wastage
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| item_id | uuid | FK → Item |
| warehouse_id | uuid | FK → Warehouse |
| quantity | decimal | |
| reason | enum | `expired`, `damaged`, `spoiled`, `theft`, `other` |
| status | enum | `pending`, `approved`, `rejected` |
| requested_by | uuid | FK → User |
| approved_by | uuid, nullable | FK → User |

Same shape as Food Preservation's `WasteDisposal` — approving it writes a `wastage` `StockMovement`. Kept as separate entities since they sit on different item catalogs (`Item` here vs. `PreservedItem` there); [see the future-link note](food-preservation-design.md#future-inventory-link) for how those catalogs connect.

## Procurement

### PurchaseOrder
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| supplier_id | uuid | FK → Supplier |
| status | enum | `draft`, `submitted`, `approved`, `partially_received`, `received`, `cancelled` |
| order_date | date | |
| expected_date | date, nullable | |
| created_by | uuid | FK → User |
| approved_by | uuid, nullable | FK → User |

### PurchaseOrderItem
| column | type | notes |
|---|---|---|
| purchase_order_id | uuid | FK → PurchaseOrder |
| item_id | uuid | FK → Item |
| quantity_ordered | decimal | |
| unit_price | decimal | |
| quantity_received | decimal | cumulative, updated as deliveries arrive |

Receiving (fully or partially) writes `stock_in` `StockMovement` rows and, for `track_expiry` items, a new `StockBatch` with the delivery's batch/expiry info. Kept as a direct action on `PurchaseOrderItem` rather than a separate `GoodsReceipt` entity for now — revisit only if you need a standalone audit trail per delivery (e.g. a PO received across three separate truck deliveries with distinct paperwork).

## Permissions

Standard actions (`inventory.view/create/update/delete/export/report`) apply to **master data** — Item, Category, Unit, Warehouse, Supplier. Everything transactional gets its own key:

| permission key | purpose |
|---|---|
| `inventory.stock_in` | record incoming stock outside a PO (manual receipt) |
| `inventory.stock_out` | issue stock out (to kitchen, an event, etc.) |
| `inventory.stock_adjustment` | direct count correction (already established in [rbac-design.md](rbac-design.md)) |
| `inventory.transfer` | create/manage `StockTransfer`s between warehouses |
| `inventory.manage_purchase_orders` | create/edit/submit `PurchaseOrder`s |
| `inventory.approve` | standard action, reused across three workflows: approve a `PurchaseOrder`, a `Wastage` request, or a `StockTransfer` |

`inventory.approve` covering three different approvals is a simplification — split into `.approve_purchase_order` / `.approve_wastage` / `.approve_transfer` later if a role needs to approve one but not another.

## Forward links

- **Food Preservation**: `PreservedItem.inventory_item_id` → `Item.id`, per the [future-link note](food-preservation-design.md#future-inventory-link).
- **Event Management**: `EventInventoryRequirement.inventory_item_id` → `Item.id` — resolved.
- ~~**Bar Management**~~ — resolved, see [bar-management-design.md](bar-management-design.md): reuses this same Item/Stock/Warehouse/StockMovement model, scoped to `Warehouse`s of `type: bar`.
