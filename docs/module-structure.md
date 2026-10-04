# Restaurant Operations Management System — Module Structure

Planning reference for the system's top-level modules and navigation structure. Use this to scope backend modules, frontend routes, and permissions as they're built.

## 🏠 Dashboard
The landing page after login — no permission needed for the page itself. See [dashboard-design.md](dashboard-design.md) for the widget catalog (permission-driven, not role-hardcoded) and analytics/visualization opportunities across every module.

## 🔐 Administration
- User Management
- Role Management
- Permission Management
- Audit Log

See [rbac-design.md](rbac-design.md) for the RBAC + permission override schema backing these three, [user-management-design.md](user-management-design.md) for User Management, [role-management-design.md](role-management-design.md) for Role Management, and [audit-log-design.md](audit-log-design.md) for the Audit Log (view-only — no delete permission exists for it, by design).

## 📅 Event Management
See [event-management-design.md](event-management-design.md) for entities, status pipeline, and permissions.

## 🍱 Food Preservation Management
See [food-preservation-design.md](food-preservation-design.md) for entities, batch status lifecycle, and permissions.

## 👨‍🍳 Roster Management
See [roster-management-design.md](roster-management-design.md) for entities (Employee, Shift, Roster Period, Attendance, Leave, Employee Documents) and permissions.

## 💰 Tip Sharing
Depends on Roster's Attendance data — see [tip-sharing-design.md](tip-sharing-design.md) for the daily equal-split calculation and Manager/Owner-only payout clearing.

## 📦 Inventory Management
See [inventory-management-design.md](inventory-management-design.md) for entities (Item, Stock, StockMovement ledger, Purchase Orders) and permissions.

## 🍺 Bar Management
See [bar-management-design.md](bar-management-design.md) — reuses Inventory's Item/Stock/Wastage, adds Recipes, Sales, and stock-count reconciliation.

## 📊 Reports
- Administration Reports
- Event Reports
- Food Preservation Reports
- Roster Reports
- Tip Sharing Reports
- Inventory Reports
- Bar Reports

Not a separate permission namespace — each page's visibility is gated by that module's own `.report` permission (see [rbac-design.md](rbac-design.md)), e.g. "Inventory Reports" needs `inventory.report`. See [reports-architecture.md](reports-architecture.md) for the shared filter framework and output formats (Screen/PDF/Excel/CSV/Print).

## ⚙️ Settings
- Business Profile
- Appearance
- System
- Security

See [settings-design.md](settings-design.md) — a single key-value `Setting` store (not one table per category), so Notification/Email/Backup/Audit settings can be added later without a schema change.
