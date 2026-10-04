# Audit Log — Design

Generalizes and **replaces** `UserActivityLog` from [user-management-design.md](user-management-design.md#activity-log) — that table only covered user-account events, but you want every meaningful change in the system logged, not just administration ones. "View Activity" on a user's profile becomes this same table filtered to `actor_id = that user`, not a separate log.

## AuditLog

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| actor_id | uuid, nullable | FK → User — nullable for system-triggered changes (e.g. the automatic `active → expired` batch transition from [food-preservation-design.md](food-preservation-design.md#status)) |
| actor_name | string, nullable | snapshot of the actor's name at write time — stays readable even if that `User` is later deleted |
| action | string | `create` / `update` / `delete` for plain field edits, or the specific permission-key-style action when one applied — e.g. `inventory.stock_adjustment`, `administration.user.reset_password` |
| entity_type | string | e.g. `Stock`, `Event`, `User`, `Setting` |
| entity_id | uuid, nullable | the affected record; nullable for non-entity events (login, report export) |
| entity_label | string, nullable | human-readable snapshot, e.g. "Chicken Breast" — survives renames or the record being deleted later |
| changes | jsonb, nullable | `{ field: { old, new } }`, e.g. `{ "quantity": { "old": 25, "new": 20 } }` — matches your example exactly |
| branch_id | uuid, nullable | |
| ip_address | string, nullable | captured server-side from the request, never client-supplied |
| user_agent | string, nullable | |
| created_at | timestamp | |

Your example maps directly: `actor_name: "John"`, `action: "inventory.stock_adjustment"`, `entity_type: "Stock"`, `entity_label: "Chicken Breast"`, `changes: { quantity: { old: 25, new: 20 } }`.

## Capture mechanism — automatic, not per-call

Relying on every service method to remember to call `auditLog.record(...)` is exactly how audit trails end up with gaps. Two paths, sized to cover everything without needing manual calls scattered through the codebase:

1. **Automatic — TypeORM subscriber.** A global `EntitySubscriberInterface` hooks `afterInsert` / `afterUpdate` / `afterRemove` for every entity marked `@Auditable()`. It diffs old vs. new column values and writes an `AuditLog` row. This alone covers almost everything that matters: inventory/event/roster/bar/food-preservation record changes, Settings updates, and — since role/permission changes are just inserts/deletes on `UserRole`/`RolePermission`/`UserPermission` — role assignment, permission grants/revokes, activation toggles, and password resets too, with zero manual logging calls in those services.
   - `@AuditIgnore()` marks columns that should never appear in `changes` (`password_hash`, above all).
   - Actor context (`actor_id`, `ip_address`, `user_agent`) isn't available inside a TypeORM subscriber, so a `RequestContextMiddleware` stores `{ userId, ip, userAgent }` in `AsyncLocalStorage` per request, and the subscriber reads it when writing the row.
2. **Manual — explicit calls, only for non-entity events.** Login, logout, and failed login attempts aren't a database mutation, so they can't be caught by the subscriber; `AuthService` calls `auditLog.record(...)` directly for these. Report view/export (from [reports-architecture.md](reports-architecture.md#shared-implementation-nestjs)) is the other case — reading data isn't a mutation either, so that logging call stays explicit too, now writing to `AuditLog` instead of `UserActivityLog`.

## Permissions

```
Audit
└── View
```

| permission key | purpose |
|---|---|
| `audit.view` | view the audit log |
| `audit.export` | export it (CSV/PDF/Excel), per the [Reports output/permission split](reports-architecture.md#output-formats-and-permissions) |

**No `.create`, `.update`, or `.delete` permission is ever seeded for this module** — entries are written exclusively by the subscriber and the two manual call sites above, never through a user-facing endpoint. If retention/cleanup of old entries is ever needed (e.g. for storage or compliance reasons), that's a backend-only scheduled job operating outside the permission system entirely, not something any role — including system roles — can trigger through the app.
