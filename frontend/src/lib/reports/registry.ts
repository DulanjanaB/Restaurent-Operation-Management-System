import type { ReportColumn } from '@/components/shared/report-output';
import type { ReportSelectFilter } from '@/components/shared/report-filter-bar';

export interface ReportConfig {
  module: string;
  reportKey: string;
  title: string;
  description?: string;
  reportPermission: string;
  exportPermission: string;
  columns: ReportColumn[];
  extraFilters?: ReportSelectFilter[];
}

// One entry per report page, grown alongside each module's phase — see
// the plan's "Each module's report page(s) are the last screen built
// within that module's own phase" note. reports/[module]/[reportKey]
// is the single dynamic route every entry here renders through.
export const REPORT_REGISTRY: Record<string, ReportConfig> = {
  'inventory/stock-levels': {
    module: 'inventory',
    reportKey: 'stock-levels',
    title: 'Stock Levels Report',
    description: 'Current stock levels and status across warehouses.',
    reportPermission: 'inventory.report',
    exportPermission: 'inventory.export',
    columns: [
      { key: 'item_sku', header: 'SKU' },
      { key: 'item_name', header: 'Item' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'minimum_stock_level', header: 'Minimum' },
      { key: 'status', header: 'Status', format: 'badge' },
    ],
  },
  'inventory/stock-movements': {
    module: 'inventory',
    reportKey: 'stock-movements',
    title: 'Stock Movements Report',
    description: 'The full stock movement ledger.',
    reportPermission: 'inventory.report',
    exportPermission: 'inventory.export',
    columns: [
      { key: 'occurred_at', header: 'When', format: 'datetime' },
      { key: 'item_name', header: 'Item' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'type', header: 'Type', format: 'badge' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'reference_type', header: 'Reference' },
      { key: 'performed_by', header: 'Performed By' },
    ],
  },
  'roster/attendance': {
    module: 'roster',
    reportKey: 'attendance',
    title: 'Attendance Report',
    description: 'Clock in/out history and attendance status by employee.',
    reportPermission: 'roster.report',
    exportPermission: 'roster.export',
    columns: [
      { key: 'date', header: 'Date', format: 'date' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'status', header: 'Status', format: 'badge' },
      { key: 'clock_in', header: 'Clock In', format: 'datetime' },
      { key: 'clock_out', header: 'Clock Out', format: 'datetime' },
    ],
  },
  'tip/pool-summary': {
    module: 'tip',
    reportKey: 'pool-summary',
    title: 'Tip Pool Summary',
    description:
      'Every tip pool with its participants and the amount distributed.',
    reportPermission: 'tip.report',
    exportPermission: 'tip.export',
    columns: [
      { key: 'date', header: 'Date', format: 'date' },
      { key: 'branch_name', header: 'Branch' },
      { key: 'status', header: 'Status', format: 'badge' },
      { key: 'total_amount', header: 'Total', format: 'money' },
      { key: 'participants', header: 'Participants' },
      { key: 'distributed', header: 'Distributed', format: 'money' },
    ],
    extraFilters: [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: 'open', label: 'Open' },
          { value: 'calculated', label: 'Calculated' },
        ],
      },
    ],
  },
  'tip/employee-balances': {
    module: 'tip',
    reportKey: 'employee-balances',
    title: 'Tip Balances Report',
    description: 'Earned, paid out and still owed per employee.',
    reportPermission: 'tip.report',
    exportPermission: 'tip.export',
    columns: [
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'earned', header: 'Earned', format: 'money' },
      { key: 'paid_out', header: 'Paid Out', format: 'money' },
      { key: 'balance', header: 'Balance', format: 'money' },
    ],
    // Options are filled in per request from the branch's employees — see
    // the report page. An empty list hides the filter.
    extraFilters: [{ name: 'employee_id', label: 'Employee', options: [] }],
  },
  'tip/payout-history': {
    module: 'tip',
    reportKey: 'payout-history',
    title: 'Tip Payout History',
    description: 'Every payout made, who it went to and who paid it.',
    reportPermission: 'tip.report',
    exportPermission: 'tip.export',
    columns: [
      { key: 'paid_on', header: 'Paid On', format: 'date' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'amount', header: 'Amount', format: 'money' },
      { key: 'paid_by', header: 'Paid By' },
      { key: 'notes', header: 'Notes' },
    ],
    extraFilters: [{ name: 'employee_id', label: 'Employee', options: [] }],
  },
  'bar/sales': {
    module: 'bar',
    reportKey: 'sales',
    title: 'Bar Sales Report',
    description: 'Recorded bar sales by recipe and warehouse.',
    reportPermission: 'bar.report',
    exportPermission: 'bar.export',
    columns: [
      { key: 'sold_at', header: 'Date', format: 'datetime' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'recipe_name', header: 'Recipe' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit_price', header: 'Unit Price', format: 'money' },
      { key: 'total_amount', header: 'Total', format: 'money' },
    ],
  },
  'events/profit-and-loss': {
    module: 'events',
    reportKey: 'profit-and-loss',
    title: 'Events Profit & Loss Report',
    description: 'Cost, revenue, and profit per event.',
    reportPermission: 'event.report',
    exportPermission: 'event.export',
    columns: [
      { key: 'event_date', header: 'Date', format: 'date' },
      { key: 'customer_name', header: 'Customer' },
      { key: 'venue_name', header: 'Venue' },
      { key: 'status', header: 'Status', format: 'badge' },
      { key: 'guest_count', header: 'Guests' },
      { key: 'cost', header: 'Cost', format: 'money' },
      { key: 'revenue', header: 'Revenue', format: 'money' },
      { key: 'profit', header: 'Profit', format: 'money' },
    ],
  },
  'food-preservation/expiry-alerts': {
    module: 'food-preservation',
    reportKey: 'expiry-alerts',
    title: 'Expiry Alerts Report',
    description: 'Active batches nearing their expiry date.',
    reportPermission: 'food_preservation.report',
    exportPermission: 'food_preservation.export',
    columns: [
      { key: 'batch_code', header: 'Batch Code' },
      { key: 'preserved_item_name', header: 'Item' },
      { key: 'storage_location_name', header: 'Location' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'expiry_date', header: 'Expiry Date', format: 'date' },
    ],
  },
  'checklist/completions': {
    module: 'checklist',
    reportKey: 'completions',
    title: 'Checklist Completion Report',
    description:
      'Every assigned record in range — completed and still-pending alike.',
    reportPermission: 'checklist.report',
    exportPermission: 'checklist.export',
    columns: [
      { key: 'date', header: 'Date', format: 'date' },
      { key: 'template_name', header: 'Checklist' },
      { key: 'area', header: 'Area' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'status', header: 'Status', format: 'badge' },
      { key: 'completed_at', header: 'Completed At', format: 'datetime' },
      { key: 'completed_by', header: 'Completed By' },
    ],
  },
};

export function getReportConfig(
  module: string,
  reportKey: string,
): ReportConfig | undefined {
  return REPORT_REGISTRY[`${module}/${reportKey}`];
}
