import { getMe } from '@/lib/auth/dal';
import {
  getCustomers,
  getEvents,
  getEventTypes,
  getPackages,
  getVenues,
} from '@/lib/server/events/queries';
import { hasPermission } from '@/lib/permissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EventCreateDialog } from './event-create-dialog';
import { EventsTable } from './events-table';
import type { EventStatus } from '@/lib/server/events/types';
import { PageHeader } from '@/components/shared/page-header';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    venue_id?: string;
    customer_id?: string;
    date_from?: string;
    date_to?: string;
  }>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const branchId = me!.current_branch_id;
  const [events, eventTypes, customers, venues, packages] = await Promise.all([
    getEvents(branchId),
    getEventTypes(),
    getCustomers(),
    getVenues(branchId),
    getPackages(branchId),
  ]);

  // The backend's GET /events only supports a branch_id filter — status,
  // venue, customer, and date-range filtering happen here against the
  // branch's full (realistically small) event list. "all" is the Select's
  // sentinel for "no filter" (a real value is required for the form to
  // round-trip it), not a real status/id.
  const status =
    params.status && params.status !== 'all' ? params.status : undefined;
  const venueId =
    params.venue_id && params.venue_id !== 'all' ? params.venue_id : undefined;
  const customerId =
    params.customer_id && params.customer_id !== 'all'
      ? params.customer_id
      : undefined;

  const filtered = events.filter((event) => {
    if (status && event.status !== status) return false;
    if (venueId && event.venue_id !== venueId) return false;
    if (customerId && event.customer_id !== customerId) return false;
    const date = event.event_date.slice(0, 10);
    if (params.date_from && date < params.date_from) return false;
    if (params.date_to && date > params.date_to) return false;
    return true;
  });

  const canCreate = hasPermission(me, 'event.create');
  const statuses: EventStatus[] = [
    'requested',
    'confirmed',
    'completed',
    'closed',
    'cancelled',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        tone="violet"
        title={<>Events</>}
        description={<>Events booked at your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <EventCreateDialog
                branchId={branchId}
                eventTypes={eventTypes}
                customers={customers}
                venues={venues}
                packages={packages}
              />
            )}
          </div>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={params.status ?? 'all'}>
            <SelectTrigger id="status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="venue_id">Venue</Label>
          <Select name="venue_id" defaultValue={params.venue_id ?? 'all'}>
            <SelectTrigger id="venue_id" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer_id">Customer</Label>
          <Select name="customer_id" defaultValue={params.customer_id ?? 'all'}>
            <SelectTrigger id="customer_id" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_from">From</Label>
          <Input
            id="date_from"
            name="date_from"
            type="date"
            defaultValue={params.date_from}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_to">To</Label>
          <Input
            id="date_to"
            name="date_to"
            type="date"
            defaultValue={params.date_to}
          />
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <EventsTable events={filtered} />
    </div>
  );
}
