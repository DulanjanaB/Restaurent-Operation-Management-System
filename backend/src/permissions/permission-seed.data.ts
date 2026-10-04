export interface PermissionSeed {
  module: string;
  resource?: string;
  action: string;
  description: string;
}

// Mirrors docs/rbac-design.md's permission matrix + the extension permissions
// listed in every module's design doc. Keep this in sync when a design doc's
// permission table changes — it's the single source of truth for seeding.
export const PERMISSION_SEED: PermissionSeed[] = [
  // Administration — Branch Management (see docs/rbac-design.md's "Open items" —
  // branch CRUD wasn't placed in the sitemap yet, seeded here under Administration)
  {
    module: 'administration',
    resource: 'branch',
    action: 'view',
    description: 'View branches',
  },
  {
    module: 'administration',
    resource: 'branch',
    action: 'create',
    description: 'Create branches',
  },
  {
    module: 'administration',
    resource: 'branch',
    action: 'update',
    description: 'Edit branches',
  },
  {
    module: 'administration',
    resource: 'branch',
    action: 'delete',
    description: 'Delete branches',
  },

  // Administration — User Management (see docs/user-management-design.md)
  {
    module: 'administration',
    resource: 'user',
    action: 'view',
    description: 'View users',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'create',
    description: 'Create users',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'update',
    description: 'Edit user profile fields',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'delete',
    description: 'Delete users',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'export',
    description: 'Export user list',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'activate',
    description: 'Activate/deactivate a user',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'reset_password',
    description: 'Force-reset a user’s password',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'assign_role',
    description: 'Assign/remove roles on a user',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'manage_permissions',
    description: 'Grant/revoke a user’s permission overrides',
  },
  {
    module: 'administration',
    resource: 'user',
    action: 'view_activity',
    description: 'View a user’s activity (audit log)',
  },

  // Administration — Role Management (see docs/role-management-design.md)
  {
    module: 'administration',
    resource: 'role',
    action: 'view',
    description: 'View roles',
  },
  {
    module: 'administration',
    resource: 'role',
    action: 'create',
    description: 'Create roles',
  },
  {
    module: 'administration',
    resource: 'role',
    action: 'update',
    description: 'Edit role name/description',
  },
  {
    module: 'administration',
    resource: 'role',
    action: 'delete',
    description: 'Delete roles (non-system only)',
  },
  {
    module: 'administration',
    resource: 'role',
    action: 'manage_permissions',
    description: 'Assign/unassign permissions on a role',
  },

  // Administration — Permission Management (read-only, seeded list)
  {
    module: 'administration',
    resource: 'permission',
    action: 'view',
    description: 'View the permission catalog',
  },

  // Audit Log (see docs/audit-log-design.md) — deliberately no create/update/delete
  { module: 'audit', action: 'view', description: 'View the audit log' },
  { module: 'audit', action: 'export', description: 'Export the audit log' },

  // Event Management (see docs/event-management-design.md)
  { module: 'event', action: 'view', description: 'View events' },
  { module: 'event', action: 'create', description: 'Create events' },
  { module: 'event', action: 'update', description: 'Edit events' },
  { module: 'event', action: 'delete', description: 'Delete events' },
  {
    module: 'event',
    action: 'approve',
    description: 'Approve a requested event',
  },
  { module: 'event', action: 'export', description: 'Export event data' },
  { module: 'event', action: 'report', description: 'View event reports' },
  {
    module: 'event',
    action: 'update_status',
    description:
      'Progress an event through confirmed/completed/closed/cancelled',
  },
  {
    module: 'event',
    action: 'assign_staff',
    description: 'Manage staff assignments on an event',
  },
  {
    module: 'event',
    action: 'manage_expenses',
    description: 'Record event expenses',
  },

  // Food Preservation Management (see docs/food-preservation-design.md)
  {
    module: 'food_preservation',
    action: 'view',
    description: 'View preserved items/batches',
  },
  {
    module: 'food_preservation',
    action: 'create',
    description: 'Create preserved items/batches',
  },
  {
    module: 'food_preservation',
    action: 'update',
    description: 'Edit batches',
  },
  {
    module: 'food_preservation',
    action: 'delete',
    description: 'Delete batches',
  },
  {
    module: 'food_preservation',
    action: 'approve',
    description: 'Approve a waste/disposal request',
  },
  {
    module: 'food_preservation',
    action: 'export',
    description: 'Export food preservation data',
  },
  {
    module: 'food_preservation',
    action: 'report',
    description: 'View food preservation reports',
  },
  {
    module: 'food_preservation',
    action: 'update_status',
    description: 'Mark a batch consumed',
  },
  {
    module: 'food_preservation',
    action: 'log_storage',
    description: 'Log temperature/condition checks',
  },

  // Roster Management (see docs/roster-management-design.md)
  { module: 'roster', action: 'view', description: 'View roster data' },
  { module: 'roster', action: 'create', description: 'Create roster records' },
  { module: 'roster', action: 'update', description: 'Edit roster records' },
  { module: 'roster', action: 'delete', description: 'Delete roster records' },
  {
    module: 'roster',
    action: 'approve',
    description: 'Approve leave requests',
  },
  { module: 'roster', action: 'export', description: 'Export roster data' },
  { module: 'roster', action: 'report', description: 'View roster reports' },
  {
    module: 'roster',
    action: 'publish',
    description: 'Publish a draft roster period',
  },
  {
    module: 'roster',
    action: 'mark_attendance',
    description: 'Clock in/out or set attendance status',
  },
  {
    module: 'roster',
    action: 'view_documents',
    description: 'View other employees’ documents',
  },
  {
    module: 'roster',
    action: 'manage_documents',
    description: 'Upload/edit/delete other employees’ documents',
  },

  // Inventory Management (see docs/inventory-management-design.md)
  {
    module: 'inventory',
    action: 'view',
    description: 'View inventory master data and stock',
  },
  {
    module: 'inventory',
    action: 'create',
    description: 'Create items/categories/units/warehouses/suppliers',
  },
  { module: 'inventory', action: 'update', description: 'Edit master data' },
  { module: 'inventory', action: 'delete', description: 'Delete master data' },
  {
    module: 'inventory',
    action: 'approve',
    description: 'Approve a purchase order, wastage, transfer, or item request',
  },
  {
    module: 'inventory',
    resource: 'item_request',
    action: 'create',
    description:
      'Request items from a warehouse (kitchen and dishwashing staff)',
  },
  {
    module: 'inventory',
    action: 'export',
    description: 'Export inventory data',
  },
  {
    module: 'inventory',
    action: 'report',
    description: 'View inventory reports',
  },
  {
    module: 'inventory',
    action: 'stock_adjustment',
    description: 'Directly correct a stock count',
  },
  {
    module: 'inventory',
    action: 'stock_in',
    description: 'Record incoming stock',
  },
  {
    module: 'inventory',
    action: 'stock_out',
    description: 'Record outgoing stock',
  },
  {
    module: 'inventory',
    action: 'transfer',
    description: 'Create/manage stock transfers between warehouses',
  },
  {
    module: 'inventory',
    action: 'manage_purchase_orders',
    description: 'Create/edit/submit purchase orders',
  },

  // Bar Management (see docs/bar-management-design.md)
  {
    module: 'bar',
    action: 'view',
    description: 'View bar recipes/sales/stock',
  },
  { module: 'bar', action: 'create', description: 'Create recipes' },
  { module: 'bar', action: 'update', description: 'Edit recipes' },
  { module: 'bar', action: 'delete', description: 'Delete recipes' },
  {
    module: 'bar',
    action: 'approve',
    description: 'Approve a wastage request against a bar warehouse',
  },
  { module: 'bar', action: 'export', description: 'Export bar data' },
  {
    module: 'bar',
    action: 'report',
    description: 'View bar reports (incl. reconciliation)',
  },
  {
    module: 'bar',
    action: 'stock_issue',
    description: 'Request/approve a Main Store → Bar Store transfer',
  },
  { module: 'bar', action: 'record_sale', description: 'Record a bar sale' },
  {
    module: 'bar',
    action: 'count_stock',
    description: 'Record a physical bar stock count',
  },

  // Tip Sharing (see docs/tip-sharing-design.md)
  {
    module: 'tip',
    action: 'view',
    description: 'View any employee’s tip pools/balances',
  },
  { module: 'tip', action: 'create', description: 'Open a new day’s tip pool' },
  {
    module: 'tip',
    action: 'update',
    description: 'Edit an open tip pool’s amount/participants/percentages',
  },
  {
    module: 'tip',
    action: 'delete',
    description: 'Remove an open pool or participant',
  },
  { module: 'tip', action: 'export', description: 'Export tip sharing data' },
  { module: 'tip', action: 'report', description: 'View tip sharing reports' },
  {
    module: 'tip',
    action: 'calculate',
    description: 'Lock in a tip pool’s calculated amounts',
  },
  {
    module: 'tip',
    action: 'payout',
    description: 'Clear an employee’s tip balance',
  },

  // Settings (see docs/settings-design.md)
  { module: 'settings', action: 'view', description: 'View settings' },
  {
    module: 'settings',
    action: 'update',
    description: 'Update business profile, appearance, and system settings',
  },
  {
    module: 'settings',
    action: 'manage_security',
    description: 'Update password policy, session, and login settings',
  },

  // Checklist Records (see docs/checklist-design.md)
  {
    module: 'checklist',
    action: 'view',
    description: 'View templates, assignments, and records',
  },
  {
    module: 'checklist',
    action: 'create',
    description: 'Create checklist templates and items',
  },
  {
    module: 'checklist',
    action: 'update',
    description: 'Edit checklist templates and items',
  },
  {
    module: 'checklist',
    action: 'delete',
    description: 'Delete checklist templates',
  },
  {
    module: 'checklist',
    action: 'assign',
    description: 'Assign a checklist template to an employee',
  },
  {
    module: 'checklist',
    action: 'complete',
    description: 'Tick items on someone else’s checklist record',
  },
  {
    module: 'checklist',
    action: 'export',
    description: 'Export checklist completion data',
  },
  {
    module: 'checklist',
    action: 'report',
    description: 'View the checklist completion report',
  },
];
