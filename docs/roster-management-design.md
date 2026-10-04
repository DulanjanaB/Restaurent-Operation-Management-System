# Roster Management — Design

Builds on [rbac-design.md](rbac-design.md). Resolves the open dependency from [event-management-design.md](event-management-design.md#open-dependencies) — `EventStaffAssignment.staff_id` points at `Employee.id` here.

## Employee vs. User

Not every scheduled staff member needs a system login — a dishwasher or server is on the roster and tracked for attendance, but likely never signs into the admin panel. A Kitchen Manager, on the other hand, is both: scheduled on the roster *and* holds an RBAC role. So **Employee is its own entity**, with an optional link to `User`:

```
Employee ──(optional)── User
```

`Employee.user_id` is nullable — set only for staff who also get a login.

## Entities

### Department (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| name | string | e.g. "Kitchen", "Service", "Bar", "Management" |

### Position (global)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | e.g. "Cook", "Server", "Dishwasher", "Sous Chef", "Bartender" |

Global, not branch-scoped — job titles are standard labels regardless of which branch. `Employee.position_id` is their default title; `ShiftAssignment.position_id` (below) can differ per shift for cross-trained staff.

### Employee (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch — primary work location |
| employee_code | string | unique, e.g. `EMP-0001` |
| name | string | |
| phone | string | |
| email | string, nullable | |
| position_id | uuid | FK → Position — default role |
| department_id | uuid | FK → Department |
| hire_date | date | |
| status | enum | `active`, `inactive`, `terminated` |
| user_id | uuid, nullable | FK → User — set only if they also log into the system |

### ShiftTemplate (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| name | string | e.g. "Morning", "Evening" |
| start_time | time | e.g. `08:00` |
| end_time | time | e.g. `16:00` |

Reusable pattern — matches your example's "Morning 08:00–16:00" / "Evening 16:00–00:00".

### RosterPeriod (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| period_type | enum | `weekly`, `monthly` |
| start_date | date | |
| end_date | date | |
| status | enum | `draft`, `published` |
| published_at | timestamp, nullable | |
| published_by | uuid, nullable | FK → User |

"Weekly Roster" and "Monthly Roster" aren't separate tables — same `RosterPeriod` shape, distinguished by `period_type`. `status` is what makes **publish** meaningful: a draft roster can be edited freely; once published, staff can see it and further changes are visible edits rather than silent ones.

### Shift (branch-scoped, belongs to a RosterPeriod)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| roster_period_id | uuid | FK → RosterPeriod |
| shift_template_id | uuid, nullable | FK → ShiftTemplate — set if built from a template |
| date | date | |
| start_time | time | copied from template, or set directly for a one-off shift |
| end_time | time | |
| department_id | uuid, nullable | which department this shift covers |

### ShiftAssignment (Staff Assignment)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| shift_id | uuid | FK → Shift |
| employee_id | uuid | FK → Employee |
| position_id | uuid | FK → Position — role for *this* shift, may differ from the employee's default |
| status | enum | `assigned`, `confirmed`, `no_show`, `completed` |

Matches your example directly: a Monday Morning `Shift` (08:00–16:00) with three `ShiftAssignment` rows — John/Service, Sarah/Kitchen Assistant, Mike/Dishwasher.

### Attendance
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → Employee |
| shift_assignment_id | uuid, nullable | FK → ShiftAssignment — linked if this attendance record is against a scheduled shift |
| date | date | |
| clock_in | timestamp, nullable | |
| clock_out | timestamp, nullable | |
| status | enum | `present`, `absent`, `late`, `half_day` |

### Leave
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → Employee |
| leave_type | enum | `annual`, `sick`, `unpaid`, `other` |
| start_date | date | |
| end_date | date | |
| reason | string, nullable | |
| status | enum | `pending`, `approved`, `rejected` |
| approved_by | uuid, nullable | FK → User |

### DocumentType (global lookup)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | e.g. "Health Card", "ID Copy", "Employment Contract", "Food Handling Certificate", "Work Permit" |
| requires_expiry | boolean | some types (ID copy, contract) may never expire; others (health card, permit) do |

A lookup table rather than a hardcoded enum — new document types (a new certification a health authority starts requiring, say) get added as a row, not a migration, same reasoning as [Settings' key-value store](settings-design.md#storage-generic-key-value-not-one-table-per-category).

### EmployeeDocument
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → Employee |
| document_type_id | uuid | FK → DocumentType |
| file_url | string | uploaded via a dedicated file endpoint, same pattern as [Settings' logo upload](settings-design.md#logo-upload) |
| issue_date | date, nullable | |
| expiry_date | date, nullable | required if `DocumentType.requires_expiry` |
| uploaded_by | uuid | FK → User |
| uploaded_at | timestamp | |
| notes | string, nullable | |

Status (`valid` / `expiring_soon` / `expired`) is computed against `expiry_date`, not stored — same pattern as `Batch` in [food-preservation-design.md](food-preservation-design.md#status) and `Stock` in [inventory-management-design.md](inventory-management-design.md#stock). An expiring-documents check feeds the same alerting mechanism as expiry alerts elsewhere (see the [Notification suggestion](dashboard-design.md) on the dashboard).

These are sensitive personal documents (health/ID data), so they get their own permission pair rather than folding into general roster CRUD — see below. An employee with a linked `User` account can always view and upload their **own** documents, no permission needed, same self-service exception as [Tip Sharing balances](tip-sharing-design.md#viewing--individually-by-each-person-from-their-account).

## Permissions

Standard actions apply (`roster.view/create/update/delete/approve/export/report`), plus:

| permission key | purpose |
|---|---|
| `roster.publish` | flip a `RosterPeriod` from `draft` to `published` |
| `roster.mark_attendance` | clock in/out or set attendance status — a frequent, low-risk action kept separate from general `.update` so a shift supervisor can take attendance without full roster-edit rights |
| `roster.approve` | approve/reject `Leave` requests — matches the taxonomy's existing "leave/shift-swap request" example |
| `roster.view_documents` | view *other* employees' `EmployeeDocument`s |
| `roster.manage_documents` | upload/update/delete *other* employees' documents — kept separate from `.view_documents` since compliance-document access (health data, ID) warrants tighter control than just seeing that a document exists |
