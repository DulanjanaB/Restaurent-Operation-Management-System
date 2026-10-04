import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMe } from '@/lib/auth/dal';
import {
  getCustomers,
  getEvent,
  getEventExpenses,
  getEventFinancials,
  getEventInventoryRequirements,
  getEventStaff,
  getEventTypes,
  getPackages,
  getVenues,
} from '@/lib/server/events/queries';
import { getEmployees } from '@/lib/server/roster/queries';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { StatusStepper } from '@/components/shared/status-stepper';
import { EventStatusBadge } from '../event-status-badge';
import { EventActions } from './event-actions';
import { EditEventDialog } from './edit-event-dialog';
import { OverviewTab } from './overview-tab';
import { StaffTab } from './staff-tab';
import { ExpensesTab } from './expenses-tab';
import { InventoryTab } from './inventory-tab';
import { PageHeader } from '@/components/shared/page-header';

const STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'closed', label: 'Closed' },
];

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let event;
  try {
    event = await getEvent(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const canViewEmployees = hasPermission(me, 'roster.view');
  const canUpdate = hasPermission(me, 'event.update');
  const canAssignStaff = hasPermission(me, 'event.assign_staff');
  const canManageExpenses = hasPermission(me, 'event.manage_expenses');
  const canIssueInventory = hasPermission(me, 'inventory.stock_out');

  const [
    financials,
    staff,
    expenses,
    requirements,
    eventTypes,
    customers,
    venues,
    packages,
    employees,
    items,
    warehouses,
  ] = await Promise.all([
    getEventFinancials(id),
    getEventStaff(id),
    getEventExpenses(id),
    getEventInventoryRequirements(id),
    getEventTypes(),
    getCustomers(),
    getVenues(event.branch_id),
    getPackages(event.branch_id),
    canViewEmployees ? getEmployees(event.branch_id) : Promise.resolve([]),
    getItems(),
    getWarehouses(event.branch_id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        tone="violet"
        title={
          <>
            {event.customer?.name ?? 'Event'} — {event.event_type?.name}
          </>
        }
        description={
          <>
            {new Date(event.event_date).toLocaleDateString()} ·{' '}
            {event.venue?.name} · {event.guest_count} guests
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3">
              <EventStatusBadge status={event.status} />
              {canUpdate && (
                <EditEventDialog
                  event={event}
                  eventTypes={eventTypes}
                  customers={customers}
                  venues={venues}
                  packages={packages}
                />
              )}
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
        <StatusStepper
          steps={STEPS}
          current={event.status}
          terminal={{ key: 'cancelled', label: 'Cancelled' }}
        />
        <EventActions
          eventId={event.id}
          status={event.status}
          canApprove={hasPermission(me, 'event.approve')}
          canUpdateStatus={hasPermission(me, 'event.update_status')}
          canDelete={hasPermission(me, 'event.delete')}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <OverviewTab
            event={event}
            financials={financials}
            staffCount={staff.length}
            requirementCount={requirements.length}
            canUpdate={canUpdate}
          />
        </TabsContent>
        <TabsContent value="staff" className="pt-4">
          <StaffTab
            eventId={event.id}
            assignments={staff}
            employees={employees}
            canManage={canAssignStaff}
            canViewEmployees={canViewEmployees}
          />
        </TabsContent>
        <TabsContent value="expenses" className="pt-4">
          <ExpensesTab
            eventId={event.id}
            expenses={expenses}
            canManage={canManageExpenses}
          />
        </TabsContent>
        <TabsContent value="inventory" className="pt-4">
          <InventoryTab
            eventId={event.id}
            requirements={requirements}
            items={items}
            warehouses={warehouses}
            canManage={canUpdate}
            canIssue={canIssueInventory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
