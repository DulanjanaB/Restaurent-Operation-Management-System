# Checklist Records — Design

New module: daily operational checklists (e.g. "Cool Room Temperature Check") that privileged users define once and assign to specific staff to complete every day, with Yes/No items that require a reason when the answer is No. Builds on [rbac-design.md](rbac-design.md) and [roster-management-design.md](roster-management-design.md) (assignment targets `Employee`, same reasoning as Tip Sharing and Employee Documents — most staff completing a checklist don't need a system login of their own, but the ones who do get the self-service view).

## Entities

### ChecklistTemplate (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| name | string | e.g. "Cool Room Temperature Check" |
| area | string, nullable | free-text, e.g. "Cool Room 1" — deliberately not a FK to StorageLocation; checklists cover far more than food storage ("so many things") |
| description | text, nullable | |
| is_active | boolean | retiring a template keeps its history instead of deleting it |
| created_by | uuid | FK → User |

### ChecklistItem (the questions within a template)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| checklist_template_id | uuid | FK → ChecklistTemplate |
| sequence | int | display order |
| label | string | e.g. "Is the cool room between 2–8°C?" |
| requires_reason_on_no | boolean | default true |

### ChecklistAssignment (who does this, and from when)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| checklist_template_id | uuid | FK → ChecklistTemplate |
| employee_id | uuid | FK → Employee |
| assigned_by | uuid | FK → User |
| active | boolean | pausing an assignment stops new daily records without deleting history |
| start_date | date | |
| end_date | date, nullable | |

### ChecklistRecord (one day's instance — the "sheet")
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| checklist_assignment_id | uuid | FK → ChecklistAssignment |
| checklist_template_id | uuid | snapshot — survives the assignment changing later |
| employee_id | uuid | snapshot |
| branch_id | uuid | snapshot, for report filtering |
| date | date | |
| status | enum | `pending`, `completed` |
| completed_at | timestamptz, nullable | |
| completed_by | uuid, nullable | FK → User — usually the assigned employee's own account, but not enforced, so a supervisor can fill in for someone without one |

Unique on `(checklist_assignment_id, date)`.

Not created by a scheduled job — **lazily generated on read**, the same pattern as Food Preservation's `active → expired` sync: whenever today's records are queried (the employee's own view, or the dashboard's incomplete-checklist widget), any active assignment missing a record for today gets one created as `pending` first. No cron dependency needed.

### ChecklistRecordResponse (the tick — one per item per record)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| checklist_record_id | uuid | FK → ChecklistRecord |
| checklist_item_id | uuid | FK → ChecklistItem |
| answer | boolean | |
| reason | string, nullable | required if `answer = false` and the item's `requires_reason_on_no` |
| answered_by | uuid | FK → User |
| answered_at | timestamptz | |

Unique on `(checklist_record_id, checklist_item_id)` — answering an item again overwrites it (a correction) rather than creating a duplicate. A record flips from `pending` to `completed` automatically once every item on its template has a response.

## Permissions

| permission key | purpose |
|---|---|
| `checklist.view` | view templates, assignments, and records (not needed for your own — see below) |
| `checklist.create` | create templates and items |
| `checklist.update` | edit templates/items |
| `checklist.delete` | delete templates |
| `checklist.assign` | assign a template to an employee |
| `checklist.complete` | tick items on *someone else's* record |
| `checklist.report` / `.export` | the completion report — see [reports-architecture.md](reports-architecture.md) |

**Self-service, no permission needed**: an employee with a linked `User` account can always view and complete their *own* assigned checklists — same exception as Tip Sharing balances and Employee Documents. `checklist.complete` is only for filling in on someone else's behalf.

## Dashboard: incomplete-checklist visibility

"Not completed → notified on the dashboard" doesn't need a new Dashboard entity — per [dashboard-design.md](dashboard-design.md), a widget is just a headline view of a query gated by a permission. This module exposes `GET /checklist/records?status=pending&date=today` (`checklist.view`, or self-service for your own) as that query; a dashboard widget for supervisors lists today's incomplete records the same way the existing Expiry Alerts or Low Stock widgets work.

## Reports

A new report — `GET /reports/checklist/completions` — follows the exact shape of every other report in [reports-architecture.md](reports-architecture.md): branch-access enforced, `date_from`/`date_to` filters, `.report` for screen / `.export` for CSV/Excel, logged to the audit log. Returns records (both completed and still-pending) in range so gaps are visible, not just completed sheets.

## Audit

`ChecklistTemplate`, `ChecklistItem`, `ChecklistAssignment`, and `ChecklistRecordResponse` are marked `@Auditable()` — every create/update/delete is captured automatically by the existing subscriber, per [audit-log-design.md](audit-log-design.md). `ChecklistRecord`'s own status flip isn't separately audited beyond what the response writes already show (its `status`/`completed_at` change is a side effect of the response being recorded, not a distinct user action).
