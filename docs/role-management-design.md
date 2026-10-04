# Role Management — Design

Sub-module of [Administration](module-structure.md#-administration). Builds on [rbac-design.md](rbac-design.md) — read that first for the Role/Permission model and the standard action taxonomy.

## Admin actions → permissions

| action | permission key | notes |
|---|---|---|
| Create | `administration.role.create` | |
| View | `administration.role.view` | list + detail, including which permissions a role has |
| Edit | `administration.role.update` | name/description only |
| Delete | `administration.role.delete` | blocked for `is_system_role` roles |
| Manage Permissions | `administration.role.manage_permissions` | assign/unassign `RolePermission` rows — kept separate from Edit so a role's name/description can be managed without also being able to change what it grants |

## Permission-checklist UI pattern

The Role editor shows one collapsible block per module, each listing the checkboxes for that module's seeded permissions (standard actions + any module-specific extensions — see the [taxonomy in rbac-design.md](rbac-design.md#standard-action-taxonomy)). This directly reflects `RolePermission` rows for that role: checking a box inserts one, unchecking deletes one.

A module that isn't central to a role's job (most often Administration itself) can render as a single collapsed **Access** toggle instead of the full checklist — this is a UI convenience, not a separate stored permission. Checked → expands to the module's normal checklist; unchecked → every permission for that module is cleared for this role. The underlying permissions are the same `administration.user.*` / `.role.*` / `.permission.*` keys either way.

## Worked examples

### Kitchen Staff
| module | permissions |
|---|---|
| food_preservation | `view`, `update_status` |
| inventory | `view` |
| administration | *(none — Access unchecked)* |

Can see food-prep batches and move them through status (e.g. mark disposed), check inventory levels, but can't edit inventory, create/delete anything, or touch reports/administration.

### Inventory Manager
| module | permissions |
|---|---|
| inventory | `view`, `create`, `update`, `delete`, `stock_adjustment`, `report` |
| food_preservation | `view` |
| administration | *(none — Access unchecked)* |

Full control over inventory including direct stock corrections and inventory reports, read-only visibility into food preservation (e.g. to cross-check consumption), no administration access.

These become the first two rows in the `Role` seed data, each wired to its `RolePermission` set as shown.

## Note on "Reports" as a checklist row

In the Inventory Manager example, Reports is a checkbox *inside* the Inventory block (`inventory.report`), matching the [no-separate-namespace design](rbac-design.md#standard-action-taxonomy). Treat any case where "Reports" appears to float as its own section (as in an earlier mockup for Kitchen Staff) as shorthand for that same per-module `.report` permission, not a distinct permission dimension — flag it if that's not what was intended.
