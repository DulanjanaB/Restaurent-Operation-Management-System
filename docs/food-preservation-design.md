# Food Preservation Management — Design

Builds on [rbac-design.md](rbac-design.md). Kept as its own module for now, but designed so it can plug into Inventory Management later rather than needing a rewrite — see [Future Inventory link](#future-inventory-link).

## Entities

### PreservedItem (global catalog)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| code | string | short code used in batch numbers, e.g. `CHK` for "Chicken Stock" |
| name | string | e.g. "Chicken Stock" |
| default_unit | string | e.g. `KG`, `L`, `PCS` |
| category | string, nullable | e.g. "Stocks & Sauces", "Marinated Meat" |
| inventory_item_id | uuid, nullable | FK → future Inventory item — unset until that module exists |

Not branch-scoped — same catalog entry ("Chicken Stock") is producible at any branch; what's branch-scoped is each batch of it.

### StorageLocation (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| name | string | e.g. "Freezer 01" |
| type | enum | `freezer`, `chiller`, `dry_store` |
| target_temp_min / target_temp_max | decimal, nullable | expected safe range, used to flag out-of-range `StorageLog` entries |

### Batch (branch-scoped, via its storage location)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| batch_code | string | unique, e.g. `CHK-2026-001` — generated as `{PreservedItem.code}-{year}-{sequence}` |
| preserved_item_id | uuid | FK → PreservedItem |
| storage_location_id | uuid | FK → StorageLocation |
| quantity | decimal | remaining quantity — decreases as it's disposed/consumed |
| unit | string | copied from `PreservedItem.default_unit` at creation |
| production_date | date | |
| expiry_date | date | |
| status | enum | `active`, `expired`, `consumed`, `disposed` — see [Status](#status) |
| produced_by | uuid | FK → User |
| notes | text, nullable | |

### StorageLog (temperature + condition checks)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| storage_location_id | uuid | FK → StorageLocation |
| recorded_at | timestamp | |
| temperature | decimal | |
| condition_notes | string, nullable | e.g. "door seal loose", "ice buildup" |
| recorded_by | uuid | FK → User |
| in_range | boolean | computed at write time against the location's target range, so out-of-range history doesn't depend on the target range never changing |

One log entry per check covers both "Temperature Records" and "Storage Conditions" from your list — a kitchen worker doing a freezer check logs both at once rather than two separate forms.

### WasteDisposal
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| batch_id | uuid | FK → Batch |
| quantity | decimal | amount disposed (may be partial) |
| reason | enum | `expired`, `spoiled`, `damaged`, `quality_issue`, `other` |
| status | enum | `pending`, `approved`, `rejected` |
| requested_by | uuid | FK → User |
| approved_by | uuid, nullable | FK → User |
| disposed_at | timestamp, nullable | set once approved and executed |

Approving a `WasteDisposal` (`food_preservation.approve`) deducts `quantity` from `Batch.quantity`, and moves `Batch.status` to `disposed` if it reaches zero.

## Status

```
active ──(expiry_date passes, automatic)──> expired
active ──(fully used, manual)─────────────> consumed
active/expired ──(WasteDisposal approved)──> disposed
```

- `active → expired` is a scheduled job comparing `expiry_date` to today — no permission needed, it's automatic.
- `active → consumed` and the disposal path are manual, gated by `food_preservation.update_status` and the `WasteDisposal` approval flow respectively.

**Expiry Alerts** aren't a stored entity — a query for `active` batches where `expiry_date − today ≤ threshold` (threshold configurable under Settings → System Preferences). Computed on read, not written anywhere; add an acknowledgement table later only if you need to track who dismissed which alert.

## Permissions

Standard actions apply (`food_preservation.view/create/update/delete/approve/export/report`), plus:

| permission key | purpose |
|---|---|
| `food_preservation.update_status` | manual transitions (mark `consumed`) |
| `food_preservation.log_storage` | write `StorageLog` entries — kept separate so kitchen staff can log temperature/condition checks without needing `.update` on batches themselves |
| `food_preservation.approve` | approve/reject a `WasteDisposal` request — matches the "disposal record" example already called out in [the taxonomy](rbac-design.md#standard-action-taxonomy) |

Matches the `Kitchen Staff` example role from [role-management-design.md](role-management-design.md) (`view` + `update_status`) — that role would also plausibly get `log_storage` if they're the ones doing freezer checks; worth confirming when you seed it.

## Future Inventory link

`PreservedItem.inventory_item_id` is the seam: once Inventory Management exists, each preserved item can point at its corresponding inventory item, so producing a batch here could optionally decrement raw-material stock there, and disposing a batch could feed the same waste/shrinkage reporting. Not built now — just left as a nullable FK so it's additive later, not a migration that reshapes this module.
