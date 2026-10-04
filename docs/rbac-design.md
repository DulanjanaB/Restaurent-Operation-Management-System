# RBAC + Permission Management — Design

Foundation for the [Administration module](module-structure.md#-administration). Replaces flat Admin/Manager/User roles with a dynamic, database-driven permission system so new roles can be created and tuned from the Role Management screen without a code change.

## Structure

```
User ──< UserRole >── Role ──< RolePermission >── Permission
  │         │
  │         └── scoped to a Branch (or NULL = all branches)
  │
  ├── belongs to a primary Branch
  │
  └──< UserPermission >── Permission   (per-user override: GRANT or REVOKE)
```

- A user can hold **multiple roles** at once (e.g. "Bar Manager" + "Roster Manager").
- A user can have **permission overrides** on top of their roles' permissions, to grant an extra permission or revoke one their role would otherwise give them.
- The system is **multi-branch**: a role assignment is scoped to a branch (e.g. "Inventory Manager @ Colombo branch"), so a user can be a manager at one branch and have no access — or a different role — at another. See [Branch scoping](#branch-scoping).

## Entities

### Branch
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | e.g. "Colombo", "Kandy" |
| code | string | short unique code, e.g. `CMB` |
| address | string | |
| phone | string, nullable | this branch's own contact number — distinct from the company-wide phone in [Settings' business profile](settings-design.md#business_profile) |
| status | enum | `active`, `inactive` |

### User
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| username | string | unique, login identifier |
| email | string | unique |
| phone | string | |
| password_hash | string | |
| name | string | |
| status | enum | `active`, `inactive` |
| primary_branch_id | uuid | FK → Branch — default branch context after login; doesn't by itself grant access to that branch's data, roles still do |

### Role
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | unique, e.g. "Inventory Manager" |
| description | string | |
| is_system_role | boolean | protects built-in roles (e.g. "Owner") from deletion |

### Permission
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| key | string | unique, e.g. `inventory.approve` |
| module | string | e.g. `inventory` — matches [module-structure.md](module-structure.md) |
| resource | string, nullable | sub-entity within the module, e.g. `user` under Administration; null for flat modules |
| action | string | one of the standard actions, or a module-specific extension |
| description | string | |

Permissions are **seeded**, not created ad hoc through the UI — one seed entry per applicable module × action (see matrix below). The Role Management screen only assigns/unassigns existing permissions to roles; it doesn't invent new permission keys.

## Standard action taxonomy

Instead of inventing bespoke actions per module, every module draws from the same seven standard actions. This keeps the Role Management UI a uniform matrix (rows = modules, columns = actions) instead of a bespoke form per module, and any new module added later automatically knows its permission set.

| action | meaning |
|---|---|
| **View** | See the module's data (list/detail) |
| **Create** | Add new records |
| **Update** | Edit existing records |
| **Delete** | Remove records |
| **Approve** | Sign off on an action that needs authorization before it takes effect (e.g. stock write-off, leave/shift-swap request, disposal record) |
| **Export** | Download the module's data (CSV/PDF/etc.) |
| **Report** | View the module's aggregated reports — this is what powers the sidebar's Reports section; there's no separate `reports.*` permission namespace, "Inventory Reports" visibility just checks `inventory.report` |

Not every module uses every action (e.g. Settings has no Approve/Report). A module may still add a genuinely bespoke action beyond these seven when nothing standard fits — but that should be the exception, not the default. Confirmed extensions so far:

- `administration.role.manage_permissions` — assign/unassign permissions to a role
- `administration.user.manage_permissions`, `.assign_role`, `.activate`, `.reset_password`, `.view_activity` — see [user-management-design.md](user-management-design.md)
- `inventory.stock_adjustment` — direct stock count correction, separate from `.approve` (which is for authorizing someone *else's* adjustment/write-off request)
- `food_preservation.update_status`, `.log_storage` — see [food-preservation-design.md](food-preservation-design.md); `.approve` on this module authorizes waste/disposal requests
- `event.update_status`, `event.assign_staff`, `event.manage_expenses` — see [event-management-design.md](event-management-design.md)
- `roster.publish`, `.mark_attendance` — see [roster-management-design.md](roster-management-design.md); `.approve` on this module authorizes leave/shift-swap requests
- `inventory.stock_in`, `.stock_out`, `.transfer`, `.manage_purchase_orders` — see [inventory-management-design.md](inventory-management-design.md); `.approve` on this module is reused across purchase order / wastage / transfer approval
- `bar.stock_issue`, `.record_sale`, `.count_stock` — see [bar-management-design.md](bar-management-design.md); Bar reuses Inventory's `Item`/`Stock`/`Wastage` rather than duplicating them
- `settings.manage_security` — see [settings-design.md](settings-design.md), split out from `settings.update` since it's a much higher blast radius (password policy, sessions, login lockout)
- `audit.view`, `.export` — see [audit-log-design.md](audit-log-design.md); deliberately has no `.create`/`.update`/`.delete` — entries are system-written only, never editable or deletable through the app
- `tip.calculate`, `.payout` — see [tip-sharing-design.md](tip-sharing-design.md), including the self-service exception (an employee always sees their own tip balance, no permission needed)
- `roster.view_documents`, `.manage_documents` — see [roster-management-design.md](roster-management-design.md#documenttype-global-lookup), gating `EmployeeDocument` (health cards, IDs, contracts) separately from general roster CRUD given the sensitivity of the data
- Dashboard needs no permission of its own — see [dashboard-design.md](dashboard-design.md), widget visibility is entirely derived from other modules' `.report`/`.view` permissions

## Permission matrix

| module | resource | View | Create | Update | Delete | Approve | Export | Report |
|---|---|---|---|---|---|---|---|---|
| administration | user | ✔ | ✔ | ✔ | ✔ | | ✔ | |
| administration | role | ✔ | ✔ | ✔ | ✔ | | | |
| administration | permission | ✔ | | | | | | |
| audit | — | ✔ | | | | | ✔ | |
| event | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| food_preservation | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| roster | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| inventory | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| bar | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| tip | — | ✔ | ✔ | ✔ | ✔ | | ✔ | ✔ |
| settings | — | ✔ | | ✔ | | | | |

`permission` (Administration) is read-only by design — the list is seeded, not user-editable. `settings` skips Create/Delete/Approve/Export/Report since it's singleton configuration, not records.

### UserRole (join)
| column | type | notes |
|---|---|---|
| user_id | uuid | FK → User |
| role_id | uuid | FK → Role |
| branch_id | uuid, nullable | FK → Branch. `NULL` = role applies across **all** branches (e.g. an Owner/HQ-level role) |

Unique on `(user_id, role_id, branch_id)`, with `branch_id IS NULL` treated as its own distinct scope (a partial unique index, since Postgres allows multiple `NULL`s under a plain unique constraint) — a user can hold "Inventory Manager" at Branch A, "Inventory Manager" at Branch B, and separately "Inventory Manager" for all branches, as three distinct rows.

### RolePermission (join)
| column | type | notes |
|---|---|---|
| role_id | uuid | FK → Role |
| permission_id | uuid | FK → Permission |

Composite PK `(role_id, permission_id)`.

### UserPermission (override)
| column | type | notes |
|---|---|---|
| user_id | uuid | FK → User |
| permission_id | uuid | FK → Permission |
| effect | enum | `GRANT` or `REVOKE` |

Composite PK `(user_id, permission_id)`.

## Permission resolution

Permissions are resolved **per branch context** — every authenticated request carries a "current branch" (from the active session/selector), and access is checked against that branch:

```
effective_permissions(user, branch) =
    ( ∪ permissions of roles in user.roles where UserRole.branch_id = branch OR UserRole.branch_id IS NULL )
    ∪ { p : UserPermission(user, p, GRANT) }
    −  { p : UserPermission(user, p, REVOKE) }
```

**REVOKE always wins** over role-granted and GRANT-overridden permissions for that user — same explicit-deny-wins pattern as AWS IAM. This is what makes overrides useful: e.g. a "Bar Manager" whose role normally includes `bar.delete` can have that single permission revoked without spinning off a new role.

`UserPermission` overrides are global (not branch-scoped) by default, to keep the override table simple — they adjust what a user can do wherever their roles would otherwise apply. Revisit if a real case needs a branch-specific override.

## Branch scoping

Branch is not just a profile label — it's a data-isolation boundary:

- **Branch-scoped data**: Inventory, Bar, Roster, Event Management, Food Preservation Management records all carry a `branch_id`. Queries are filtered to the requesting user's current branch; a user only sees branches they hold a role in (via `UserRole`, including `NULL`-scoped "all branches" roles).
- **Branch-agnostic**: Administration (Users, Roles, Permissions) and Settings (Business Profile, Name, Logo, Appearance) are company-wide, not per-branch — a `Role` definition and its permissions are shared across branches; only the *assignment* of a role to a user is branch-scoped.
- **Reports**: filtered to the branches the requesting user has the relevant `.report` permission for; a user with a branch-scoped role only sees that branch's reports, an `NULL`-scoped (all-branches) role sees all. See [reports-architecture.md](reports-architecture.md) for the full filter/output framework.

## Permission key convention

`<module>.<action>` for flat modules, `<module>.<resource>.<action>` when the module has distinct sub-entities (currently only Administration), e.g.:

- `administration.user.view` / `.create` / `.update` / `.delete` / `.export`
- `administration.role.view` / `.create` / `.update` / `.delete` / `.manage_permissions`
- `administration.permission.view`
- `inventory.view` / `.create` / `.update` / `.delete` / `.approve` / `.export` / `.report`
- `bar.approve`, `roster.report`, `event.export`, …
- `settings.view` / `.update` / `.manage_security`

## Enforcement (NestJS)

- `@RequirePermissions('inventory.create')` decorator on controller routes.
- A `PermissionsGuard` reads the decorator's required keys, loads the requesting user's effective permission set (roles ∪ grants − revokes), and allows/denies.
- Effective permissions are computed at login and embedded in the JWT (or cached server-side keyed by user id) so the guard isn't hitting the DB on every request; invalidate/recompute on role or permission changes for that user.

## Open items for later

- Branch management screen (CRUD for `Branch` itself) — not yet placed in the sitemap; likely its own item under Administration or Settings.

See [user-management-design.md](user-management-design.md) for the User Management sub-module, and [role-management-design.md](role-management-design.md) for the Role Management sub-module and its permission-checklist UI pattern.
