import { getMe } from '@/lib/auth/dal';
import { getVenues } from '@/lib/server/events/queries';
import { hasPermission } from '@/lib/permissions';
import { VenueFormDialog } from './venue-form-dialog';
import { VenuesTable } from './venues-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function VenuesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const venues = await getVenues(branchId);
  const canCreate = hasPermission(me, 'event.create');
  const canManage =
    hasPermission(me, 'event.update') && hasPermission(me, 'event.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="violet"
        title={<>Venues</>}
        description={<>Event halls and spaces in your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <VenueFormDialog branchId={branchId} />}
          </div>
        }
      />
      <VenuesTable venues={venues} branchId={branchId} canManage={canManage} />
    </div>
  );
}
