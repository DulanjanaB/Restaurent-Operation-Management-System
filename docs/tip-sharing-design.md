# Tip Sharing — Design

Builds on [rbac-design.md](rbac-design.md). Depends on [roster-management-design.md](roster-management-design.md) — shares are paid into an `Employee`'s running balance, not a `User`'s, so it works for staff without system logins too; `Attendance` is used as a convenience default, not a hard rule (see [Calculation](#calculation)).

**On roles**: nothing here is hardcoded to "Manager" or "Owner" as a role — like every other module, who can do what is whatever the [Role Management](role-management-design.md) screen grants. `tip.calculate` and `tip.payout` are just permission keys; assign them to a "Manager" role, an "Owner" role, a dedicated "Tip Coordinator" role, or all three — the system doesn't care which role name is used.

## Entities

### TipPool (branch-scoped, one per branch per day)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| date | date | |
| total_amount | decimal | entered directly, e.g. `100.00` — a single figure for the day, not built up from itemized entries |
| status | enum | `open` (participants/percentages still editable), `calculated` (amounts locked in) |
| created_by | uuid | FK → User |
| calculated_at | timestamp, nullable | |
| calculated_by | uuid, nullable | FK → User |

### TipAllocation (one row per participating employee per pool)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| tip_pool_id | uuid | FK → TipPool |
| employee_id | uuid | FK → Employee |
| percentage | decimal | default `100` — see [Calculation](#calculation) |
| amount | decimal, nullable | computed once the pool is `calculated`; `null` while `open` |
| tip_payout_id | uuid, nullable | FK → TipPayout — `NULL` means still unpaid |

This is both "who's participating" and "what they got" in one row: adding an employee to the pool creates a row at `percentage: 100`; the manager can then adjust any row's percentage before calculating.

### TipPayout (a clearing event — cash handed over to one employee)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → Employee |
| amount | decimal | = sum of the `TipAllocation`s being cleared |
| paid_at | timestamp | |
| paid_by | uuid | FK → User |
| notes | string, nullable | |

Clearing sets `tip_payout_id` on every currently-unpaid `TipAllocation` for that employee. Current balance:

```
balance(employee) = SUM(TipAllocation.amount)
                     WHERE employee_id = employee
                     AND tip_payout_id IS NULL
```

Doesn't have to happen daily — clears whatever's accumulated since the last payout.

## Calculation

1. **Enter the day's total** — `TipPool.total_amount` (e.g. `100.00`).
2. **Select participants** — the person running this picks employees for that shift/day, creating a `TipAllocation` row per employee at `percentage: 100`. `Attendance` for that branch/date can pre-fill the suggested list, but the actual set is whoever's explicitly added here — someone who attended but didn't share in tips that day (or a person from another shift who did) can be added or removed freely. This replaces the earlier "strictly derived from Attendance" version of this doc.
3. **Adjust percentages** — any row's `percentage` can be changed from the 100 default (e.g. `150` for someone who covered extra, `50` for a partial contribution). Still `open`, so this can be revised any number of times.
4. **Calculate** (`tip.calculate`) — locks it in:

```
amount(employee) = total_amount × ( percentage(employee) / SUM(percentage of all rows in this pool) )
```

With five people left at the 100 default, `SUM = 500`, and each gets `100 × (100/500) = 20.00` — an equal split, which is what "default 100% each" naturally produces. Adjusting one person to 150 (others still 100) makes `SUM = 550`: that person gets `100 × (150/550) ≈ 27.27`, everyone else `100 × (100/550) ≈ 18.18` — proportional to their percentage, not a fixed extra amount.

5. Amounts round to 2 decimals; the few-cent rounding remainder (`total_amount` minus the sum of rounded shares) carries forward into the next day's `TipPool` for that branch rather than being assigned to one employee arbitrarily — flag if you'd rather handle it differently.

Recalculating an `open`-again pool (if you allow reopening a calculated one) should only touch `TipAllocation` rows not yet referenced by a `TipPayout`.

## Viewing — "individually by each person from their account"

An `Employee` with a linked `User` account (`Employee.user_id`, from [roster-management-design.md](roster-management-design.md#employee-vs-user)) can always see their **own** `TipAllocation` history — filtered day-by-day or by a date range, same filter shape as [reports-architecture.md](reports-architecture.md#filter-framework). This doesn't need `tip.view` or any permission at all beyond being logged in as that employee — it's their own earned money, the same self-service exception pattern as a user always being able to see their own profile. `tip.view` is only what's needed to see *other* employees' balances.

## Permissions

| permission key | purpose |
|---|---|
| `tip.view` | view any employee's pools/allocations/balance — not needed to view your own, see above |
| `tip.create` | open a new day's `TipPool`, add participants |
| `tip.update` | edit `total_amount`, participants, or percentages while `open` |
| `tip.delete` | remove a pool or a participant row while `open` |
| `tip.calculate` | lock in amounts for a pool |
| `tip.payout` | clear an employee's balance |
| `tip.export` / `.report` | standard, per [reports-architecture.md](reports-architecture.md) |
