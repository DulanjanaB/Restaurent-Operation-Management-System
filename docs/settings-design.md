# Settings — Design

Builds on [rbac-design.md](rbac-design.md), where Settings was already marked branch-agnostic (company-wide) and View/Update-only.

## Storage: generic key-value, not one table per category

You flagged wanting to add Notification/Email/Backup/Audit settings later without it being a schema change each time. A fixed table per category (columns for every field) would fight that. A single key-value table doesn't:

### Setting
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| category | string | `business_profile`, `appearance`, `system`, `security`, and later `notifications`, `email`, `backup`, `audit` — just a new `category` value, no migration |
| key | string | e.g. `business_name`, `theme`, `password_policy` |
| value | jsonb | scalar (`"Acme Restaurant"`) or object (`{ "min_length": 8, "require_uppercase": true }`) — one shape handles both |
| updated_by | uuid | FK → User |
| updated_at | timestamp | |

Unique on `(category, key)`.

Read frequency for these is high — business name/logo/theme load on every page, timezone/currency format every date/amount shown. Cache the full set in memory (or Redis) on boot, invalidate on write, rather than hitting the DB per request.

## Fields by category

### business_profile
`business_name`, `logo_url`, `address`, `phone`, `email`, `website`

This is the **company-wide** identity (one restaurant business, however many branches). A branch's own address/phone is a separate concern — it already lives on `Branch.address` from [rbac-design.md](rbac-design.md#branch); add `Branch.phone` there too if you want per-branch contact info alongside the company-wide one here.

### appearance
`theme`, `primary_color`, `mode` (`dark`/`light`/`system`), `branding` (additional brand colors/fonts as a jsonb object)

The "Logo" listed under both Business Profile and Appearance is the same asset — Appearance just displays what's set in `business_profile.logo_url`, it isn't a second upload.

### system
`timezone`, `currency`, `date_format`, `number_format`

These aren't just display preferences — they're read by report generation, invoice/PDF formatting, and anywhere a date or amount renders, so treat them as core config the cache above needs to serve fast and consistently.

### security
`password_policy` (jsonb: `min_length`, `require_uppercase`, `require_number`, `require_symbol`, `expiry_days`), `session_settings` (jsonb: `session_timeout_minutes`, `max_concurrent_sessions`), `login_settings` (jsonb: `max_failed_attempts`, `lockout_duration_minutes`, `mfa_required`)

These have real enforcement hooks elsewhere, not just storage — `password_policy` is read by the User create/reset-password validation, `session_settings` by the JWT-issuing logic (ties into [rbac-design.md's permission-caching note](rbac-design.md#enforcement-nestjs)), `login_settings` by the auth guard's failed-attempt tracking.

### Later: notifications / email / backup / audit
Same `Setting` table, new `category` values — `notifications` (channel toggles, thresholds like the expiry-alert lead time mentioned in [food-preservation-design.md](food-preservation-design.md#status)), `email` (SMTP config), `backup` (schedule, retention), `audit` (retention period for `UserActivityLog`). Not designed now, just confirming the storage shape already fits them.

## Logo upload

`logo_url` is set via a dedicated file-upload endpoint (multipart), not the generic key/value update — it stores the file (local disk or object storage) and writes the resulting URL into `Setting`. Same treatment would apply to any future branding image assets.

## Permissions

| permission key | purpose |
|---|---|
| `settings.view` | view any category |
| `settings.update` | update `business_profile`, `appearance`, `system` |
| `settings.manage_security` | update the `security` category specifically — split out because password policy, session, and login settings affect the whole system's security posture; kept away from general `.update` so it can be restricted to an `is_system_role` role even for someone who otherwise administers Settings day-to-day |

No Create/Delete/Approve/Export/Report — singleton configuration, not records (per the [permission matrix](rbac-design.md#permission-matrix)).
