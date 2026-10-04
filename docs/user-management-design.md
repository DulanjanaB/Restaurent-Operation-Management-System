# User Management — Design

Sub-module of [Administration](module-structure.md#-administration). Builds on [rbac-design.md](rbac-design.md) — read that first for the Role/Permission/Branch model.

## Admin actions → permissions

| action | permission key | notes |
|---|---|---|
| Create User | `administration.user.create` | |
| View User | `administration.user.view` | list + detail |
| Edit User | `administration.user.update` | profile fields only (name, email, phone, username, branch) — not role/permissions/status |
| Activate / Deactivate | `administration.user.activate` | separate from Edit — a receptionist who can fix a typo'd phone number shouldn't necessarily be able to lock accounts |
| Delete User | `administration.user.delete` | |
| Reset Password | `administration.user.reset_password` | admin-triggered forced reset (issues a temp password / reset link) — distinct from the user's own self-service password change |
| Assign Role | `administration.user.assign_role` | manages the user's `UserRole` rows (role + branch pairs) — distinct from `administration.role.*`, which edits role *definitions* |
| Modify Permissions | `administration.user.manage_permissions` | manages the user's `UserPermission` overrides (grant/revoke) |
| View Activity | `administration.user.view_activity` | see [Activity log](#activity-log) |

These extend beyond the seven standard actions from the permission matrix — User is the one resource sensitive enough to warrant splitting "edit profile" from "change access," so a support-desk role can be given `update` + `reset_password` without also getting `assign_role` or `manage_permissions`.

**Privilege-escalation guard:** `assign_role` and `manage_permissions` are the two permissions that can grant further access, so:
- A user should never be able to modify their own roles/permissions, even if they hold these permissions (prevents self-escalation).
- Assigning a role, or granting a permission, that the *actor themselves* doesn't hold should be blocked (an Inventory Manager without `bar.*` permissions can't grant someone else `bar.*` access) — unless the actor holds an `is_system_role` role (e.g. Owner).

## User profile fields

| field | maps to | notes |
|---|---|---|
| Name | `User.name` | |
| Username | `User.username` | unique, login identifier |
| Email | `User.email` | unique |
| Phone | `User.phone` | |
| Password | `User.password_hash` | never returned by the API; set on create, changed via Reset Password or self-service |
| Role | `UserRole` rows | multiple, each scoped to a branch (or all branches) — see [rbac-design.md](rbac-design.md#userrole-join) |
| Status | `User.status` | `active` / `inactive`, toggled via Activate/Deactivate |
| Branch | `User.primary_branch_id` for default context, plus whichever branches their `UserRole` rows cover | the profile screen shows both: "home branch" and "branch access" (which may be broader) |
| Permissions | `UserPermission` rows | override grants/revokes on top of role permissions |

## Activity log

Powers "View Activity" — not its own table. It's the system-wide [`AuditLog`](audit-log-design.md) filtered to `actor_id = user.id` (as the person who acted) or `entity_type = 'User' AND entity_id = user.id` (as the account acted upon), covering exactly the events you'd expect (role assignment, permission changes, activation toggles, password resets, logins) since those are all either entity mutations the audit subscriber catches automatically, or explicit login/logout calls — see [audit-log-design.md](audit-log-design.md#capture-mechanism--automatic-not-per-call).
