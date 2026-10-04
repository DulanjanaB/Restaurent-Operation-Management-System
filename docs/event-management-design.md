# Event Management — Design

Builds on [rbac-design.md](rbac-design.md) for permissions/branch-scoping conventions.

## Entities

### EventType (global lookup)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | e.g. "Wedding", "Birthday", "Corporate" |
| description | string | |

Not branch-scoped — a shared category list across the whole business.

### Customer (global)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | string | |
| phone | string | |
| email | string, nullable | |
| address | string, nullable | |
| notes | text, nullable | |

Not branch-scoped either — a client may book events at different branches; their record and history should follow them, not fork per branch.

### Venue (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch — a hall belongs to one physical branch |
| name | string | e.g. "Main Hall", "Garden Terrace" |
| capacity | int | max guest count |
| description | string, nullable | |

### Package (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch — menu/pricing can differ per branch kitchen |
| name | string | |
| price_per_guest | decimal, nullable | |
| flat_price | decimal, nullable | |
| description | text | menu contents |

### Event (branch-scoped)
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| branch_id | uuid | FK → Branch |
| event_type_id | uuid | FK → EventType |
| customer_id | uuid | FK → Customer |
| venue_id | uuid | FK → Venue |
| package_id | uuid, nullable | FK → Package — set once the menu is chosen |
| event_date | timestamp | |
| guest_count | int | |
| status | enum | see [Status pipeline](#status-pipeline) |
| created_by | uuid | FK → User |

### EventStaffAssignment (join)
| column | type | notes |
|---|---|---|
| event_id | uuid | FK → Event |
| staff_id | uuid | FK → `Employee` — see [roster-management-design.md](roster-management-design.md) |
| role_in_event | string | e.g. "Chef", "Server", "Bartender" |

### EventExpense
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → Event |
| category | string | e.g. "Ingredients", "Staff Cost", "Rental", "Decoration" |
| amount | decimal | |
| description | string, nullable | |
| incurred_at | date | |

Sum of `EventExpense.amount` for an event = its cost; revenue comes from the Package price × guest count (or a manual override) — see [Cost/Revenue](#costrevenue).

### EventInventoryRequirement
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → Event |
| inventory_item_id | uuid | FK → `Item` — see [inventory-management-design.md](inventory-management-design.md) |
| quantity_required | decimal | |
| quantity_issued | decimal | default 0, updated as stock is actually pulled |

Bridges Event Management to Inventory Management — reserving/issuing stock for an event. Depends on Inventory's item schema (not written yet either).

## Status pipeline

The workflow you gave has 8 steps, but several of them are *data becoming available* rather than distinct states a user picks from a dropdown (e.g. "Package/Menu Selected" just means `Event.package_id` is set; "Staff Assigned" means `EventStaffAssignment` rows exist). Collapsing to a small stored `status` enum, with the rest shown as a progress checklist computed from that data:

```
requested → confirmed → completed → closed
               ↓                        ↑
           cancelled              (cost/revenue finalized, report available)
```

| status | meaning | roughly covers |
|---|---|---|
| `requested` | inquiry logged, not yet committed | Event Request |
| `confirmed` | event committed; venue/date locked in | Event Created |
| `completed` | event has happened | Event Completed |
| `closed` | expenses finalized, cost/revenue reconciled | Cost/Revenue |
| `cancelled` | exception path, any stage before `completed` | — |

The UI progress checklist within `confirmed` (package selected? staff assigned? inventory requirements set?) is derived from whether `package_id` is set, `EventStaffAssignment` rows exist, and `EventInventoryRequirement` rows exist — not separate stored statuses. Flag if you actually want those as hard gates (e.g. can't move to `completed` unless staff *and* inventory are both set) — that'd be validation logic in the status-transition handler, still using this same 5-value enum.

## Cost / Revenue

Not a stored field so much as a computed view per event:
- **Cost** = `SUM(EventExpense.amount)` for the event
- **Revenue** = `Package.price_per_guest × Event.guest_count` (or `Package.flat_price`), with a manual override field on `Event` for negotiated pricing
- **Profit** = Revenue − Cost

Feeds Event Reports directly; no separate storage needed beyond the override field.

## Permissions

Standard actions apply (`event.view/create/update/delete/approve/export/report`), plus extensions:

| permission key | purpose |
|---|---|
| `event.approve` | move `requested` → `confirmed` |
| `event.update_status` | progress `confirmed → completed → closed`, or cancel |
| `event.assign_staff` | manage `EventStaffAssignment` — may be held by Roster staff independent of who can edit event details |
| `event.manage_expenses` | record `EventExpense` — finance-adjacent, kept separate from generic `event.update` |

## Open dependencies

- ~~**Roster Management**~~ — resolved, `EventStaffAssignment.staff_id` → `Employee`.
- ~~**Inventory Management**~~ — resolved, `EventInventoryRequirement.inventory_item_id` → `Item`.
