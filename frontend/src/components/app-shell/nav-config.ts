import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  KeyRound,
  ScrollText,
  Settings,
  Briefcase,
  Contact,
  CalendarClock,
  CalendarRange,
  ClipboardCheck,
  Plane,
  FileBadge,
  Coins,
  Wallet,
  Landmark,
  Package,
  Tags,
  Ruler,
  Truck,
  Warehouse as WarehouseIcon,
  Boxes,
  History,
  PackageSearch,
  ArrowLeftRight,
  Trash2,
  ClipboardList,
  Martini,
  Receipt,
  ListChecks,
  Scale,
  PartyPopper,
  UserRound,
  MapPin,
  Gift,
  Tag,
  Snowflake,
  Thermometer,
  PackageOpen,
  AlertTriangle,
  ListTodo,
  CheckSquare,
  ClipboardSignature,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Omitted = always visible (e.g. Dashboard). Otherwise the user needs at
  // least one of these permissions to see the nav item.
  permissions?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Grown module-by-module as each phase's screens land — see
// docs/module-structure.md for the module order. Only routes that actually
// exist belong here.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Administration',
    items: [
      {
        href: '/administration/branches',
        label: 'Branches',
        icon: Building2,
        permissions: ['administration.branch.view'],
      },
      {
        href: '/administration/users',
        label: 'Users',
        icon: Users,
        permissions: ['administration.user.view'],
      },
      {
        href: '/administration/roles',
        label: 'Roles',
        icon: ShieldCheck,
        permissions: ['administration.role.view'],
      },
      {
        href: '/administration/permissions',
        label: 'Permissions',
        icon: KeyRound,
        permissions: ['administration.permission.view'],
      },
      {
        href: '/administration/audit-log',
        label: 'Audit Log',
        icon: ScrollText,
        permissions: ['audit.view'],
      },
    ],
  },
  {
    label: 'Roster',
    items: [
      {
        href: '/roster/employees',
        label: 'Employees',
        icon: Contact,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/departments',
        label: 'Departments',
        icon: Briefcase,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/positions',
        label: 'Positions',
        icon: Briefcase,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/shift-templates',
        label: 'Shift Templates',
        icon: CalendarClock,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/periods',
        label: 'Roster Periods',
        icon: CalendarRange,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/attendance',
        label: 'Attendance',
        icon: ClipboardCheck,
        // Both GET /roster/attendance and GET /roster/employees need
        // roster.view — roster.mark_attendance alone (no .view) can't
        // actually load this page, only change statuses on it.
        permissions: ['roster.view'],
      },
      {
        href: '/roster/leave',
        label: 'Leave',
        icon: Plane,
        permissions: ['roster.view'],
      },
      {
        href: '/roster/document-types',
        label: 'Document Types',
        icon: FileBadge,
        permissions: ['roster.view'],
      },
      {
        href: '/reports/roster/attendance',
        label: 'Attendance Report',
        icon: ScrollText,
        permissions: ['roster.report'],
      },
    ],
  },
  {
    label: 'Tip Sharing',
    items: [
      {
        // Self-service — zero permissions needed, always visible to any
        // logged-in employee-linked user. See docs/tip-sharing-design.md.
        href: '/tip-sharing/my-balance',
        label: 'My Balance',
        icon: Wallet,
      },
      {
        href: '/tip-sharing/pools',
        label: 'Tip Pools',
        icon: Coins,
        permissions: ['tip.view'],
      },
      {
        href: '/tip-sharing/balances',
        label: 'Unpaid Balances',
        icon: Landmark,
        permissions: ['tip.view'],
      },
      {
        href: '/reports/tip/pool-summary',
        label: 'Pool Report',
        icon: Receipt,
        permissions: ['tip.report'],
      },
      {
        href: '/reports/tip/employee-balances',
        label: 'Balances Report',
        icon: Wallet,
        permissions: ['tip.report'],
      },
      {
        href: '/reports/tip/payout-history',
        label: 'Payout Report',
        icon: Coins,
        permissions: ['tip.report'],
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        href: '/inventory/items',
        label: 'Items',
        icon: Package,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/stock',
        label: 'Stock',
        icon: Boxes,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/transfers',
        label: 'Transfers',
        icon: ArrowLeftRight,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/wastage',
        label: 'Wastage',
        icon: Trash2,
        permissions: ['inventory.view'],
      },
      {
        href: '/item-requests',
        label: 'Item Requests',
        icon: ClipboardList,
        permissions: ['inventory.item_request.create', 'inventory.approve'],
      },
      {
        href: '/inventory/purchase-orders',
        label: 'Purchase Orders',
        icon: ClipboardList,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/categories',
        label: 'Categories',
        icon: Tags,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/units',
        label: 'Units',
        icon: Ruler,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/suppliers',
        label: 'Suppliers',
        icon: Truck,
        permissions: ['inventory.view'],
      },
      {
        href: '/inventory/warehouses',
        label: 'Warehouses',
        icon: WarehouseIcon,
        permissions: ['inventory.view'],
      },
      {
        href: '/reports/inventory/stock-levels',
        label: 'Stock Levels Report',
        icon: PackageSearch,
        permissions: ['inventory.report'],
      },
      {
        href: '/reports/inventory/stock-movements',
        label: 'Stock Movements Report',
        icon: History,
        permissions: ['inventory.report'],
      },
    ],
  },
  {
    label: 'Bar',
    items: [
      {
        href: '/bar/sales',
        label: 'Sell',
        icon: Martini,
        permissions: ['bar.record_sale'],
      },
      {
        href: '/bar/sales/history',
        label: 'Sales History',
        icon: Receipt,
        permissions: ['bar.view'],
      },
      {
        href: '/bar/recipes',
        label: 'Recipes',
        icon: ClipboardList,
        permissions: ['bar.view'],
      },
      {
        href: '/bar/stock-issue',
        label: 'Stock Issue',
        icon: ArrowLeftRight,
        permissions: ['bar.stock_issue'],
      },
      {
        href: '/bar/stock-counts',
        label: 'Stock Counts',
        icon: ListChecks,
        permissions: ['bar.view'],
      },
      {
        href: '/bar/reconciliation',
        label: 'Reconciliation',
        icon: Scale,
        permissions: ['bar.report'],
      },
      {
        href: '/bar/wastage',
        label: 'Wastage',
        icon: Trash2,
        permissions: ['bar.approve'],
      },
      {
        href: '/reports/bar/sales',
        label: 'Bar Sales Report',
        icon: History,
        permissions: ['bar.report'],
      },
    ],
  },
  {
    label: 'Events',
    items: [
      {
        href: '/events',
        label: 'Events',
        icon: PartyPopper,
        permissions: ['event.view'],
      },
      {
        href: '/events/customers',
        label: 'Customers',
        icon: UserRound,
        permissions: ['event.view'],
      },
      {
        href: '/events/venues',
        label: 'Venues',
        icon: MapPin,
        permissions: ['event.view'],
      },
      {
        href: '/events/packages',
        label: 'Packages',
        icon: Gift,
        permissions: ['event.view'],
      },
      {
        href: '/events/types',
        label: 'Event Types',
        icon: Tag,
        permissions: ['event.view'],
      },
      {
        href: '/reports/events/profit-and-loss',
        label: 'Profit & Loss Report',
        icon: History,
        permissions: ['event.report'],
      },
    ],
  },
  {
    label: 'Food Preservation',
    items: [
      {
        href: '/food-preservation/batches',
        label: 'Batches',
        icon: PackageOpen,
        permissions: ['food_preservation.view'],
      },
      {
        href: '/food-preservation/expiry-alerts',
        label: 'Expiry Alerts',
        icon: AlertTriangle,
        permissions: ['food_preservation.view'],
      },
      {
        href: '/food-preservation/waste-disposals',
        label: 'Waste Disposals',
        icon: Trash2,
        permissions: ['food_preservation.view'],
      },
      {
        href: '/food-preservation/storage-locations',
        label: 'Storage Locations',
        icon: Snowflake,
        permissions: ['food_preservation.view'],
      },
      {
        href: '/food-preservation/preserved-items',
        label: 'Preserved Items',
        icon: Thermometer,
        permissions: ['food_preservation.view'],
      },
      {
        href: '/reports/food-preservation/expiry-alerts',
        label: 'Expiry Alerts Report',
        icon: History,
        permissions: ['food_preservation.report'],
      },
    ],
  },
  {
    label: 'Checklist',
    items: [
      {
        // Self-service — zero permissions needed, always visible to any
        // logged-in employee-linked user.
        href: '/checklist/today',
        label: "Today's Checklist",
        icon: ListTodo,
      },
      {
        href: '/checklist/records',
        label: 'Records',
        icon: CheckSquare,
        permissions: ['checklist.view'],
      },
      {
        href: '/checklist/templates',
        label: 'Templates',
        icon: ClipboardSignature,
        permissions: ['checklist.view'],
      },
      {
        href: '/checklist/assignments',
        label: 'Assignments',
        icon: ClipboardList,
        permissions: ['checklist.view'],
      },
      {
        href: '/reports/checklist/completions',
        label: 'Completion Report',
        icon: History,
        permissions: ['checklist.report'],
      },
    ],
  },
  {
    label: '',
    items: [
      {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
        permissions: ['settings.view'],
      },
    ],
  },
];
