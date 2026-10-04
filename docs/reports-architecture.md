# Reports Architecture

Cross-cutting design for the [Reports](module-structure.md#-reports) section. Builds on [rbac-design.md](rbac-design.md)'s `.report`/`.export` actions and branch scoping.

## Principle: no report tables

Every report so far in this system (Event P&L, expiry alerts, bar reconciliation, stock levels) has turned out to be a filtered/aggregated query over data that already exists — nothing has needed its own storage. Reports stay that way: a report is a query against a module's own entities, not a new set of tables. This section is about the **shared machinery** (filters, permissions, output formats) all of them plug into, not new domain entities.

See also [dashboard-design.md](dashboard-design.md#deeper-analytics-beyond-real-time-widgets) for cost/profitability, efficiency, demand, security, and customer analytics that build on this same catalog — heavier trend/comparison reports rather than the dashboard's real-time widgets.

## Report catalog

| module | reports | primary source |
|---|---|---|
| Administration | Audit Log, Role/Permission Assignment | `AuditLog` — see [audit-log-design.md](audit-log-design.md), `UserRole`/`RolePermission` |
| Events | Event P&L (cost/revenue/profit), Event Status Summary | `Event`, `EventExpense` — see [event-management-design.md](event-management-design.md#costrevenue) |
| Food Preservation | Expiry Alerts, Wastage/Disposal, Storage Conditions | `Batch`, `WasteDisposal`, `StorageLog` |
| Roster | Attendance, Leave, Staffing (filled vs. unfilled shifts) | `Attendance`, `Leave`, `ShiftAssignment` |
| Inventory | Stock Levels, Stock Movements, Wastage, Purchase Orders | `Stock`, `StockMovement`, `Wastage`, `PurchaseOrder` |
| Bar | Sales, Consumption, Stock Reconciliation | `BarSale`, `StockMovement`, `BarStockCount` — see [bar-management-design.md](bar-management-design.md#stock-reconciliation) |
| Tip Sharing | Daily Pool Summary, Employee Balances, Payout History | `TipPool`, `TipAllocation`, `TipPayout` — see [tip-sharing-design.md](tip-sharing-design.md) |

## Filter framework

Every report endpoint accepts the same filter shape; a report only reads the fields relevant to it:

```
{
  date_from, date_to,     // universal
  branch_id,              // universal — see branch enforcement below
  user_id,                // "performed by" / "created by" — meaning is per-report
  category_id,            // module-specific meaning: Item Category (Inventory), Event Type (Events), Department (Roster)
  status,                 // module-specific enum (Event.status, Batch.status, PurchaseOrder.status, …)
  ...                     // module-specific extras: warehouse_id, venue_id, recipe_id, etc.
}
```

**Branch enforcement is not optional filtering** — it's access control layered on top of the filter. A request's effective branch set is the branches the user holds a role in (from `UserRole`, per [rbac-design.md](rbac-design.md#branch-scoping)). If `branch_id` is omitted, the report runs across all accessible branches; if a specific `branch_id` is given, it's validated against that set and rejected (403) if the user has no role there — never silently dropped, so a filter mistake doesn't look like "no branches selected."

## Output formats and permissions

| output | gated by |
|---|---|
| Screen | `<module>.report` |
| PDF / Excel / CSV | `<module>.export` |
| Print | not a separate backend format — the frontend prints the Screen view or opens the generated PDF; no separate generation path |

This is exactly the `.report` vs. `.export` split already in [rbac-design.md](rbac-design.md#standard-action-taxonomy): a role can see a report on screen without being able to pull the underlying data out as a file.

## Shared implementation (NestJS)

- **`PermissionsGuard`** checks `.report` or `.export` depending on the endpoint, same as every other guarded route.
- **A shared `ExportService`** (`toCsv()`, `toExcel()`, `toPdf()`) takes column definitions + rows and is called by every module's export endpoint, so formatting is consistent app-wide instead of six bespoke PDF layouts.
- **Every report view/export is logged** to [`AuditLog`](audit-log-design.md) (`action: 'report_viewed'` / `'report_exported'`, `changes: null`, `entity_type: report_key`) — this is one of the two manual logging call sites `AuditLog` needs (the other being login/logout), since reading data isn't a database mutation the audit subscriber would otherwise catch.
