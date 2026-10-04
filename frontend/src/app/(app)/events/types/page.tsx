import { getMe } from '@/lib/auth/dal';
import { getEventTypes } from '@/lib/server/events/queries';
import { hasPermission } from '@/lib/permissions';
import { EventTypeFormDialog } from './event-type-form-dialog';
import { EventTypesTable } from './event-types-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function EventTypesPage() {
  const [me, eventTypes] = await Promise.all([getMe(), getEventTypes()]);
  const canCreate = hasPermission(me, 'event.create');
  const canManage =
    hasPermission(me, 'event.update') && hasPermission(me, 'event.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="violet"
        title={<>Event Types</>}
        description={
          <>
            Categories of event this restaurant hosts (e.g. Wedding, Birthday).
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <EventTypeFormDialog />}
          </div>
        }
      />
      <EventTypesTable eventTypes={eventTypes} canManage={canManage} />
    </div>
  );
}
