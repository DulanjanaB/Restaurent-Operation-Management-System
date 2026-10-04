# Dashboard / Home Screen — Design

The landing page after login. Builds on [reports-architecture.md](reports-architecture.md) — a dashboard widget is a small, headline-only rendering of an existing report's query, not a new data source.

## Principle: permission-driven, not role-hardcoded

Same correction that came up for [Tip Sharing](tip-sharing-design.md) applies here: the dashboard isn't "if role == Owner show X, if role == Kitchen Staff show Y." Every widget declares the permission it needs; a user sees whatever widgets their *actual effective permissions* unlock. An Owner-type role naturally sees business-wide KPIs because it holds `.report` permissions across every module and every branch (via a `NULL`-scoped `UserRole`); a Kitchen Staff role naturally sees just today's roster because that's the only `.report`/`.view` permission it was granted. The "role-based" appearance you described is an emergent result of permissions, not a hardcoded per-role screen — consistent with how [Reports](reports-architecture.md) and every other module already work.

The dashboard page itself needs no permission — every authenticated user lands on one, even if every widget on it happens to be hidden.

## Entities

### DashboardWidget (global catalog, seeded like `Permission`)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| key | string | e.g. `todays_revenue`, `low_stock_alerts`, `today_roster` |
| title | string | |
| widget_type | enum | `kpi`, `list`, `chart`, `table` |
| required_permission | string | the permission key that unlocks it, e.g. `inventory.report` |
| default_position | int | ordering |

Seeded, not user-created — same reasoning as `Permission` itself: the *catalog* of what widgets exist is fixed by what's built; what varies per user is which of them they can see and how they've arranged their own view.

### UserDashboardPreference (optional per-user customization)
| column | type | notes |
|---|---|---|
| user_id | uuid | FK → User |
| widget_key | string | FK → DashboardWidget.key |
| visible | boolean | lets a user hide a widget they have permission for but don't care about |
| position | int | personal reordering |

`available_widgets(user, branch) = DashboardWidget WHERE required_permission ∈ effective_permissions(user, branch)`, then `UserDashboardPreference` narrows/reorders that set. Nobody sees a widget their permissions don't cover, regardless of preference rows.

## Suggested widgets by module

Doubles as the answer to "what analytics/visualization opportunities exist" — each of these is a small aggregation over entities already designed, nothing needs new storage beyond what's noted.

| module | widget | type | notes |
|---|---|---|---|
| Administration | Recent Audit Log | list | last N entries, needs `audit.view` |
| Administration | Active Users | kpi | count of `status: active` |
| Events | Upcoming Events (7 days) | list | |
| Events | Event Pipeline | funnel | count by `status`: requested → confirmed → completed → closed |
| Events | Revenue Trend | line chart | from [Event P&L](event-management-design.md#costrevenue), monthly |
| Events | Venue Utilization | bar chart | booked days ÷ available days per `Venue` |
| Food Preservation | Expiring Soon | kpi + list | from the existing [expiry alert query](food-preservation-design.md#status) |
| Food Preservation | Wastage Trend | line chart | `WasteDisposal` value over time |
| Food Preservation | Storage Compliance | gauge | % of recent `StorageLog` entries `in_range` per location |
| Roster | Today's Roster | table | who's on shift right now, from `ShiftAssignment` |
| Roster | Attendance Rate | line chart | % `present`/`late` over time |
| Roster | Pending Leave Requests | kpi + list | `Leave.status = pending` |
| Roster | Expiring Documents | list | from [EmployeeDocument](roster-management-design.md#documenttype-global-lookup) |
| Inventory | Low Stock | kpi + list | `Stock.quantity ≤ minimum_stock_level` |
| Inventory | Top Wastage Items | bar chart | ranked by `Wastage` quantity/value |
| Inventory | Pending Purchase Orders | kpi | `status: submitted/approved` |
| Bar | Today's Sales | kpi | `SUM(BarSale.total_amount)` |
| Bar | Top Selling Drinks | bar chart | `BarSale` grouped by `recipe_id` |
| Bar | Reconciliation Variance Alerts | list | non-zero variance from [stock reconciliation](bar-management-design.md#stock-reconciliation) — the one that actually flags loss/theft, worth surfacing prominently |
| Tip Sharing | My Balance | kpi | self-service, no permission needed (see [tip-sharing-design.md](tip-sharing-design.md#viewing--individually-by-each-person-from-their-account)) |
| Tip Sharing | Unpaid Balances (all staff) | table | liability view for whoever holds `tip.view` |

## Widgets needing a small data-model addition

Two ideas are genuinely useful but need one field this system doesn't have yet — flagging rather than adding speculatively:

- **Stock Value trend** (total inventory value over time) needs a per-item cost, which currently only exists per-delivery on `PurchaseOrderItem.unit_price`. Would need something like `Item.average_cost`, updated on each `stock_in`.
- **Understaffed Shifts** (shifts with fewer `ShiftAssignment`s than needed) needs a target headcount, which `Shift` doesn't currently carry. Would need `Shift.required_headcount`.

## Chart type guidance

| data shape | chart |
|---|---|
| single current number (today's total, a count) | KPI card |
| trend over time (revenue, wastage, attendance rate) | line/area chart |
| ranking/comparison (top items, branch-vs-branch) | bar chart |
| progression through stages (event status pipeline) | funnel |
| actionable items needing attention (low stock, pending approvals) | list, not a chart — these need a click-through, not a visualization |
| compliance/coverage over a grid (storage temp checks, roster coverage by day×shift) | heatmap |

Every widget here reuses a report query that already exists in the [Reports catalog](reports-architecture.md#report-catalog) — a widget is that same query truncated to its headline, with a link through to the full report. Keep it that way rather than writing a second, dashboard-only version of the same aggregation.

## Deeper analytics (beyond real-time widgets)

The widgets above answer "what's happening now." These answer "is the business healthy, and where." They're a tier heavier — trend/comparison reports meant for a Reports page (with the full [filter/export machinery](reports-architecture.md)) rather than a dashboard tile, and several cut across modules, which just means the viewer needs `.report` on every module the analysis draws from (no new permission type — the existing per-module `.report` composes).

### Cost & profitability
| analysis | draws from | notes |
|---|---|---|
| Food cost % (COGS ÷ revenue) | Inventory consumption + Event/Bar revenue | needs per-item cost — same `Item.average_cost` gap already flagged |
| Labor cost % of revenue | Roster hours worked + Event/Bar revenue | needs an hourly rate, which nothing currently models — `Employee` has no `wage_rate`; this is really the Payroll module suggested earlier, not a field to bolt on here |
| Drink/dish margin | `BarRecipe` cost vs. `selling_price` | same recipe-costing gap flagged earlier for Bar Reports |
| Event profitability distribution | `Event` cost/revenue, grouped by `event_type_id` or `venue_id` | which event types/venues are actually worth running — fully computable now, no gaps |
| Branch comparison | any module's `.report` data, grouped by `branch_id` | revenue, wastage %, staff cost side by side — only meaningful once there's more than one active branch |

### Operational efficiency
| analysis | draws from | notes |
|---|---|---|
| Stock turnover rate | `StockMovement` (stock_out) ÷ average `Stock.quantity` | fast vs. slow-moving items — informs purchasing and minimum-stock tuning |
| ABC analysis | `Item`s ranked by stock value or usage | the classic 80/20 — which handful of items deserve tightest control |
| Wastage as % of received stock | `Wastage` ÷ `StockMovement` (stock_in) | efficiency metric, fully computable now |
| Supplier performance | `PurchaseOrder.expected_date` vs. actual receipt (`StockMovement.occurred_at`) | on-time delivery rate per `Supplier` — no new fields needed |
| Attendance patterns by day-of-week | `Attendance`, grouped by weekday | which days see the most absence/lateness — heatmap |
| Overtime trends | `Attendance` clock_in/out vs. `ShiftAssignment` scheduled times | needs a definition of "scheduled hours" to diff against, which the shift's own start/end already gives — computable now |

### Demand & forecasting
| analysis | draws from | notes |
|---|---|---|
| Consumption seasonality | `StockMovement` / `BarSale`, by month or day-of-week | informs purchasing ahead of known busy periods |
| Peak hours | `BarSale.sold_at` by hour | staffing/bar-prep timing — computable now |
| Demand forecast for upcoming events | historical `EventInventoryRequirement` vs. new `Event.guest_count` | genuinely predictive (regression/averaging over similar past events), heavier than a report query — flag as a later-stage feature, not a v1 report |

### Security & compliance
| analysis | draws from | notes |
|---|---|---|
| Audit anomaly view | `AuditLog`, filtered to after-hours or bulk changes | e.g. many `UserPermission` grants in a short window, or admin actions outside business hours — worth a dedicated Audit report filter preset, not new storage |
| Permission utilization | `RolePermission` vs. which permissions actually gate an action a role's members have taken (per `AuditLog.action`) | surfaces over-provisioned roles — "this role has `inventory.delete` but nobody holding it has ever used it" |

### Customer insights
| analysis | draws from | notes |
|---|---|---|
| Repeat customer rate | `Event.customer_id` grouped by `Customer` | how many clients rebook — computable now, no gaps |
| Customer lifetime value | `Event` revenue summed per `Customer` over time | pairs naturally with the above |

Everything marked "computable now" is a report, not a feature — same principle as the rest of these docs: no new tables, just a heavier query. The few flagged gaps (`Item.average_cost`, `Employee.wage_rate`, recipe ingredient costing, demand forecasting) are real additions, worth their own decision when you're ready rather than building speculatively now.
