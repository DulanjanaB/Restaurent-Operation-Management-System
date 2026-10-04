# Restaurant Operations Management System — Business Documentation

Written for: restaurant owners, managers and supervisors who will run the system day to day.

This document describes what the system does, who uses which part, the rules it enforces, and what is still open. For installation and server setup, see [deployment-guide.md](deployment-guide.md).

---

## 1. What the system is for

One system for the whole restaurant group: staff and rosters, tips, stock, the bar, events, food preservation, daily checklists, and reports. Each branch has its own data, and each person sees only what their role allows.

Staff sign in with their own account. The system records who did what and when, so decisions can be traced.

---

## 2. Who can do what

Access is controlled by **roles**. A role is a bundle of permissions, such as "view rosters" or "approve stock requests". A person can hold several roles, and each role can apply to all branches or only to one.

Typical roles in a restaurant:

| Role | What it is for |
|---|---|
| System Owner | Full control of the system. Cannot be deleted. |
| Manager | Branch management: rosters, approvals, stock, tips, reports. |
| Kitchen Assistant / Dishwasher | Can submit item requests and see their own schedule, checklists and tip balance. |
| Service staff | Record bar sales, see their own schedule and tip balance. |

Roles are created and edited by administrators under **Administration → Roles**. Any role can be given to any person under **Administration → Users**.

Two rules are always enforced:
- **Nobody can give away a permission they don't hold.** A manager cannot grant a role with more access than their own.
- **Nobody can change their own roles or permissions.** Another administrator must do it.

---

## 3. Modules at a glance

| Module | What it covers |
|---|---|
| Dashboard | Each person's home screen: key figures, the status of every operation, trends and attendance charts, and their own tip amount. |
| Administration | Branches, users, roles, permissions, and the audit log of every change. |
| Settings | Business name and logo, colours and fonts, currency, number format and timezone, and security. |
| Roster | Departments, positions, employees, shift templates, roster periods, attendance, leave requests and approvals, and employee documents. |
| Tip Sharing | Daily tip pools, who shares them, calculation, payouts, personal balances, and tip reports. |
| Inventory | Items, categories, units, suppliers, warehouses, stock levels and movements, stock in and out, adjustments, transfers, wastage, purchase orders, and item requests from kitchen staff. |
| Bar | Recipes, recording sales, sales history, stock issue to the bar, stock counts, and reconciliation with variances highlighted. |
| Events | Events with a status workflow (requested, confirmed, completed, closed, cancelled), customers, venues, packages, staff assignments, expenses, inventory needs, and profit and loss. |
| Food Preservation | Preserved items, storage locations, batches, storage temperature logs, waste disposal requests with approval, and expiry alerts. |
| Checklist | Checklist templates, assignments to staff, each person's checklist for today, and completion records. |
| Reports | Filtered reports, each exportable to CSV and Excel and printable on A4. |
| My Profile | Own details, profile photo, and password change. |

---

## 4. Key workflows

### 4.1 Staff and their login
Every employee is also a system user, so every person can sign in. When adding a person, the form asks for their details, a position and department (both can be added on the spot), a username, and the roles they should have at this branch. The system creates the login and shows a temporary password once. If the email already belongs to an existing login, the person is linked to that login.

### 4.2 Rosters
A roster period (weekly or monthly) starts as a **draft**. Managers build shifts and assign staff, then **publish** the period so it is visible to everyone. Published periods are locked.

### 4.3 Tip sharing
1. A manager opens a tip pool for the day and enters the total.
2. Participants are added, with their percentage shares.
3. The pool is **calculated**, which fixes each person's amount. A calculated pool cannot be changed.
4. Each person can see their own balance and history. Managers pay out balances, and payouts are recorded.

### 4.4 Stock and item requests
- Stock comes in, goes out, is adjusted, transferred between warehouses, or written off as wastage. Each change is recorded.
- Kitchen and dishwashing staff submit **item requests** listing what they need from a store. A manager approves or rejects it. Approving issues the stock at once, and if any line lacks stock the whole request is refused.

### 4.5 Bar sales
A bartender taps a drink to record a sale. Each sale automatically removes the recipe's ingredients from the bar's stock. If an ingredient is short, the sale is refused. Reconciliation compares recorded sales and counts, and shows any variance in red.

### 4.6 Food preservation and batches
- Each batch of prepared food gets a code, its production date and use-by date, a storage location, and the people who prepared it.
- **Colours by day:** each batch takes a colour from the day it was made — Monday yellow, Tuesday blue, Wednesday red, Thursday green, Friday orange, Saturday purple, Sunday pink.
- **QR stickers:** each batch can be printed as a 62 × 40 mm sticker with a QR code, its code, product, dates and day colour.
- **Batch Scanner app:** a separate app for iOS and Android. Staff sign in, scan the sticker, and see the batch details.
- **History:** every batch has a timeline showing what happened to it, such as being recorded, marked as used up, disposed of, or passing its use-by date, with the time and person where recorded.
- **Disposal:** a disposal request must be approved by a manager. Expired batches are marked automatically on their use-by date.

### 4.7 Events
An event moves through its statuses (requested, confirmed, completed, closed; or cancelled). Staff are assigned, expenses and inventory needs are recorded, and a profit and loss summary is calculated from them. Revenue can be overridden manually when needed.

### 4.8 Checklists
Managers build checklist templates and assign them to staff. Each person sees today's checklist, answers each item, and gives a reason where an answer is "no" and a reason is required. Incomplete checklists appear on the dashboard.

### 4.9 Reports
Reports can be filtered by date range, branch, and where relevant status or employee. Each can be exported to CSV or Excel, or printed on A4 with the business name, logo, period, filters and totals. Every view and export is recorded in the audit log.

Available reports include attendance, inventory stock levels and movements, bar sales, event profit and loss, food expiry alerts, checklist completions, and three tip reports: pool summary, employee balances, and payout history.

---

## 5. Rules the system enforces

- **System Owner accounts cannot be deleted.** Access can only be removed by removing the system role, or the account can be deactivated.
- **A user with linked records cannot be deleted** (for example, a person with an employee record). They can be deactivated instead, which keeps the history intact.
- **Permissions are checked on every action,** not just on the screens. A hidden button is never the only protection.
- **Money and quantities are never negative.** Stock cannot go below zero, and a request for zero quantity is refused.
- **Published rosters and calculated tip pools are locked.**
- **Every change is audited.** The audit log records who changed what and when, for branches, users, roles, settings, employees, batches, disposals, and other records.
- **Login sessions last eight hours,** after which staff sign in again.
- **Amounts display in the business currency.** The currency, number format and timezone are set once in Settings → System.

---

## 6. Settings to set up first

1. **Settings → Business profile:** business name and logo. These appear in the sidebar, on the sign-in screen, and on printed reports.
2. **Settings → System:** currency (for example EUR), number format and timezone. The default is USD until this is changed.
3. **Settings → Appearance:** colour theme, mode, and font.
4. **Administration → Branches:** create each restaurant branch.
5. **Administration → Roles:** review the roles and permissions.
6. **Administration → Users** or **Roster → Employees:** add the staff, each with their roles for each branch.
7. **Roster:** departments, positions and shift templates.
8. **Inventory:** categories, units, suppliers, warehouses, and items.
9. **Food preservation:** preserved items and storage locations.

---

## 7. Status and open items

Be aware of these before relying on the system for live operations:

- **Testing:** the system has been tested against its live server, including the core flows of each module. The screens have not all been reviewed in a browser, so a short visual check of each module is recommended before go-live.
- **Mobile app:** the Batch Scanner app builds and type-checks, but has not yet been run on a real iPhone or Android phone, and needs to be packaged for both app stores.
- **QR codes:** the QR address must point to an address that phones can reach. Set the system's public address to the restaurant server's network address before printing stickers.
- **Database changes:** the server currently updates its database structure automatically on start-up. Before live use this should be switched off and changes managed explicitly, with a backup taken before each upgrade.
- **Secure connection:** staff sign-in needs HTTPS in production. Without it, browsers drop the login session.
- **Container setup:** the Docker configuration needs the corrections listed in the deployment guide before it can run the full system.
- **Histories from before tracking:** batches, disposals and status changes made before history tracking was added show the status without an exact time.
- **Currency:** amounts appear in USD until the currency is set in Settings → System.
- **Charts:** the dashboard charts show plain numbers without the currency symbol.

---

## 8. Glossary

- **Branch:** one restaurant location.
- **Role:** a named bundle of permissions, given to a person for one branch or all branches.
- **Permission:** a single allowed action, such as viewing or approving.
- **Roster period:** a weekly or monthly schedule for a branch.
- **Tip pool:** the tips collected for one day, shared out by percentage.
- **Calculated:** a tip pool whose shares are fixed and can no longer change.
- **Item request:** a kitchen or dishwashing request for stock, approved by a manager.
- **Batch:** one portion of prepared food, with its dates, location and preparers.
- **Use by date:** the last day a batch is safe to use.
- **Audit log:** the record of every change, with who made it and when.
